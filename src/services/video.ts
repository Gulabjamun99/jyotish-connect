import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc, onSnapshot, arrayUnion, deleteField } from "firebase/firestore";

let pc: RTCPeerConnection | null = null;
let unsubRoom: (() => void) | null = null;

/**
 * ICE Server Configuration
 * STUN + free TURN servers for NAT traversal on Indian mobile networks.
 */
const configuration: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' },
        {
            urls: "turn:a.relay.metered.ca:80",
            username: "e8dd65f92aea25c159e32478",
            credential: "kRKr/OVDgQWJLpmj",
        },
        {
            urls: "turn:a.relay.metered.ca:80?transport=tcp",
            username: "e8dd65f92aea25c159e32478",
            credential: "kRKr/OVDgQWJLpmj",
        },
        {
            urls: "turn:a.relay.metered.ca:443",
            username: "e8dd65f92aea25c159e32478",
            credential: "kRKr/OVDgQWJLpmj",
        },
        {
            urls: "turns:a.relay.metered.ca:443?transport=tcp",
            username: "e8dd65f92aea25c159e32478",
            credential: "kRKr/OVDgQWJLpmj",
        },
    ],
    iceCandidatePoolSize: 10,
};

const CONNECTION_TIMEOUT = 60_000;

/** Stub for backwards compat */
export async function initializePeer(userId: string): Promise<string> {
    return userId;
}

/**
 * USER (Caller) side:
 * Creates SDP Offer immediately → saves to Firestore → listens for Answer.
 * No readiness check needed — Firestore persists the offer, and when the
 * Astrologer's onSnapshot fires (even later), it will see it.
 */
export async function makeCall(
    roomId: string,
    localStream: MediaStream
): Promise<MediaStream> {
    disconnectPeer();

    return new Promise(async (resolve, reject) => {
        const timeout = setTimeout(() => {
            console.error("⏱️ Connection timed out after 60s");
            disconnectPeer();
            reject(new Error("Connection timed out. Acharya may not have joined yet."));
        }, CONNECTION_TIMEOUT);

        try {
            console.log('📞 [Caller] Creating WebRTC offer...');
            pc = new RTCPeerConnection(configuration);

            // Add local tracks
            localStream.getTracks().forEach(track => {
                pc?.addTrack(track, localStream);
            });

            // Resolve when we get the remote stream
            pc.ontrack = event => {
                console.log('✅ [Caller] Received remote stream!');
                clearTimeout(timeout);
                resolve(event.streams[0]);
            };

            // Debug logs
            pc.oniceconnectionstatechange = () => {
                console.log(`🧊 [Caller] ICE: ${pc?.iceConnectionState}`);
                if (pc?.iceConnectionState === 'failed' || pc?.iceConnectionState === 'disconnected') {
                    console.error('❌ [Caller] ICE failed/disconnected');
                }
            };
            pc.onconnectionstatechange = () => {
                console.log(`🔗 [Caller] Connection: ${pc?.connectionState}`);
                if (pc?.connectionState === 'failed') {
                    clearTimeout(timeout);
                    reject(new Error("WebRTC connection failed."));
                }
            };

            const roomRef = doc(db, "consultations", roomId);

            // Send ICE candidates to Firestore
            pc.onicecandidate = async event => {
                if (event.candidate) {
                    try {
                        await updateDoc(roomRef, {
                            callerCandidates: arrayUnion(event.candidate.toJSON())
                        });
                    } catch (e) {
                        console.error("[Caller] ICE candidate save failed", e);
                    }
                }
            };

            // Create SDP Offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // Save offer to Firestore (clear stale signaling data)
            console.log('📤 [Caller] Saving offer to Firestore...');
            await setDoc(roomRef, {
                offer: { type: offer.type, sdp: offer.sdp },
                callerCandidates: [],
                calleeCandidates: [],
            }, { merge: true });

            // Remove any stale answer
            try {
                await updateDoc(roomRef, { answer: deleteField() });
            } catch (e) {
                // Ignore if answer field doesn't exist
            }

            console.log('✅ [Caller] Offer saved. Listening for answer...');

            // Listen for Answer + Callee ICE Candidates
            const addedCandidates = new Set<string>();

            unsubRoom = onSnapshot(roomRef, async (snapshot: any) => {
                const data = snapshot.data();
                if (!data || !pc) return;

                // Handle Answer
                if (!pc.currentRemoteDescription && data.answer) {
                    console.log("📥 [Caller] Got Answer from Astrologer!");
                    try {
                        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                    } catch (e) {
                        console.error("[Caller] setRemoteDescription failed", e);
                    }
                }

                // Handle Callee ICE Candidates
                if (data.calleeCandidates && Array.isArray(data.calleeCandidates)) {
                    for (const candidate of data.calleeCandidates) {
                        const sig = JSON.stringify(candidate);
                        if (!addedCandidates.has(sig)) {
                            addedCandidates.add(sig);
                            try {
                                await pc?.addIceCandidate(new RTCIceCandidate(candidate));
                            } catch (e) {
                                console.error("[Caller] addIceCandidate failed", e);
                            }
                        }
                    }
                }
            });

        } catch (e) {
            clearTimeout(timeout);
            console.error('[Caller] Init failed:', e);
            reject(e);
        }
    });
}

/**
 * ASTROLOGER (Callee) side:
 * Subscribes to Firestore immediately, waiting for the SDP Offer.
 * When it arrives, creates Answer and sends it back.
 * Timing doesn't matter — onSnapshot fires with current doc state on subscribe.
 */
export function answerCall(
    roomId: string,
    localStream: MediaStream,
    onRemoteStream: (stream: MediaStream) => void
): void {
    disconnectPeer();
    console.log('📱 [Callee] Setting up and listening for offer...');

    pc = new RTCPeerConnection(configuration);

    // Add local tracks
    localStream.getTracks().forEach(track => {
        pc?.addTrack(track, localStream);
    });

    // Resolve when we get the remote stream
    pc.ontrack = event => {
        console.log('✅ [Callee] Received remote stream!');
        onRemoteStream(event.streams[0]);
    };

    // Debug logs
    pc.oniceconnectionstatechange = () => {
        console.log(`🧊 [Callee] ICE: ${pc?.iceConnectionState}`);
    };
    pc.onconnectionstatechange = () => {
        console.log(`🔗 [Callee] Connection: ${pc?.connectionState}`);
    };

    const roomRef = doc(db, "consultations", roomId);

    // Send ICE candidates to Firestore
    pc.onicecandidate = async event => {
        if (event.candidate) {
            try {
                await updateDoc(roomRef, {
                    calleeCandidates: arrayUnion(event.candidate.toJSON())
                });
            } catch (e) {
                console.error("[Callee] ICE candidate save failed", e);
            }
        }
    };

    let answerCreated = false;
    const addedCandidates = new Set<string>();

    // Subscribe immediately — onSnapshot fires with current doc state first
    unsubRoom = onSnapshot(roomRef, async (snapshot: any) => {
        const data = snapshot.data();
        if (!data || !pc) return;

        // Process Offer when it appears
        if (data.offer && !answerCreated) {
            console.log("📥 [Callee] Got offer! Creating answer...");
            answerCreated = true;

            try {
                await pc.setRemoteDescription(new RTCSessionDescription(data.offer));

                const answer = await pc.createAnswer();
                if (answer && pc) {
                    await pc.setLocalDescription(answer);

                    console.log("📤 [Callee] Saving answer to Firestore...");
                    await updateDoc(roomRef, {
                        answer: { type: answer.type, sdp: answer.sdp }
                    });
                    console.log("✅ [Callee] Answer saved!");
                }
            } catch (e) {
                console.error("[Callee] Error processing offer:", e);
                answerCreated = false; // Allow retry on next snapshot
            }
        }

        // Process Caller ICE Candidates
        if (data.callerCandidates && Array.isArray(data.callerCandidates)) {
            for (const candidate of data.callerCandidates) {
                const sig = JSON.stringify(candidate);
                if (!addedCandidates.has(sig)) {
                    addedCandidates.add(sig);
                    try {
                        await pc?.addIceCandidate(new RTCIceCandidate(candidate));
                    } catch (e) {
                        console.error("[Callee] addIceCandidate failed", e);
                    }
                }
            }
        }
    });
}

/**
 * Disconnect and clean up.
 */
export function disconnectPeer(): void {
    if (unsubRoom) {
        unsubRoom();
        unsubRoom = null;
    }
    if (pc) {
        pc.close();
        pc = null;
    }
}
