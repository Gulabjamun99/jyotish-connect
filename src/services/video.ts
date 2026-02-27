import { db } from "@/lib/firebase";
import { doc, updateDoc, onSnapshot, arrayUnion, deleteField, getDoc } from "firebase/firestore";

let pc: RTCPeerConnection | null = null;
let unsubRoom: (() => void) | null = null;

/**
 * ICE Server Configuration
 * Includes STUN + free TURN servers for NAT traversal on Indian mobile networks (Jio/Airtel).
 */
const configuration: RTCConfiguration = {
    iceServers: [
        // Google STUN
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // Twilio STUN
        { urls: 'stun:global.stun.twilio.com:3478' },
        // Free TURN relay from Metered (relay for symmetric NAT)
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

// Connection timeout in ms
const CONNECTION_TIMEOUT = 60_000;

/**
 * Stub for backwards compatibility.
 */
export async function initializePeer(userId: string): Promise<string> {
    return userId;
}

/**
 * USER (Caller) side:
 * 1. Waits for Astrologer to signal readyToReceive = true in Firestore
 * 2. Creates SDP Offer → writes to Firestore
 * 3. Listens for SDP Answer + ICE candidates from Astrologer
 */
export async function makeCall(
    roomId: string,
    localStream: MediaStream
): Promise<MediaStream> {
    disconnectPeer(); // Ensure clean slate

    return new Promise(async (resolve, reject) => {
        const timeout = setTimeout(() => {
            console.error("⏱️ Connection timed out after 60s");
            disconnectPeer();
            reject(new Error("Connection timed out. Acharya may not have joined yet."));
        }, CONNECTION_TIMEOUT);

        try {
            console.log('📞 [Caller] Waiting for Astrologer to be ready...');
            const roomRef = doc(db, "consultations", roomId);

            // STEP 1: Wait for Astrologer to be ready before creating offer
            await waitForReadiness(roomRef);
            console.log('✅ [Caller] Astrologer is ready. Creating offer...');

            // STEP 2: Setup RTCPeerConnection
            pc = new RTCPeerConnection(configuration);

            // Add local tracks
            localStream.getTracks().forEach(track => {
                pc?.addTrack(track, localStream);
            });

            // Listen for remote track
            pc.ontrack = event => {
                console.log('✅ [Caller] Received remote stream track!');
                clearTimeout(timeout);
                resolve(event.streams[0]);
            };

            // Connection state debugging
            pc.oniceconnectionstatechange = () => {
                console.log(`🧊 [Caller] ICE state: ${pc?.iceConnectionState}`);
                if (pc?.iceConnectionState === 'failed') {
                    console.error('❌ [Caller] ICE connection failed. May need TURN relay.');
                }
            };
            pc.onconnectionstatechange = () => {
                console.log(`🔗 [Caller] Connection state: ${pc?.connectionState}`);
                if (pc?.connectionState === 'failed') {
                    clearTimeout(timeout);
                    reject(new Error("WebRTC connection failed."));
                }
            };

            // STEP 3: Collect ICE candidates and store in Firestore
            pc.onicecandidate = async event => {
                if (event.candidate) {
                    try {
                        await updateDoc(roomRef, {
                            callerCandidates: arrayUnion(event.candidate.toJSON())
                        });
                    } catch (e) {
                        console.error("[Caller] Failed to save ICE candidate", e);
                    }
                }
            };

            // STEP 4: Create SDP Offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // Clean the slate & save Offer
            await updateDoc(roomRef, {
                offer: {
                    type: offer.type,
                    sdp: offer.sdp,
                },
                callerCandidates: [],
                calleeCandidates: [],
                answer: deleteField()
            });
            console.log('📤 [Caller] Offer saved to Firestore.');

            // STEP 5: Listen for Answer + Callee ICE Candidates
            const addedCandidates = new Set<string>();

            unsubRoom = onSnapshot(roomRef, async snapshot => {
                const data = snapshot.data();
                if (!data || !pc) return;

                // Handle Answer
                if (!pc.currentRemoteDescription && data.answer) {
                    console.log("✅ [Caller] Received Answer from Astrologer");
                    try {
                        const rtcSessionDescription = new RTCSessionDescription(data.answer);
                        await pc.setRemoteDescription(rtcSessionDescription);
                    } catch (e) {
                        console.error("[Caller] Failed to set remote description", e);
                    }
                }

                // Handle ICE Candidates from Astrologer
                if (data.calleeCandidates && Array.isArray(data.calleeCandidates)) {
                    for (const candidate of data.calleeCandidates) {
                        const sig = JSON.stringify(candidate);
                        if (!addedCandidates.has(sig)) {
                            addedCandidates.add(sig);
                            try {
                                await pc?.addIceCandidate(new RTCIceCandidate(candidate));
                            } catch (e) {
                                console.error("[Caller] Error adding callee ICE candidate", e);
                            }
                        }
                    }
                }
            });

        } catch (e) {
            clearTimeout(timeout);
            console.error('[Caller] Call initialization failed:', e);
            reject(e);
        }
    });
}

/**
 * ASTROLOGER (Callee) side:
 * 1. Signals readyToReceive = true in Firestore
 * 2. Listens for SDP Offer from User
 * 3. Creates SDP Answer → writes to Firestore
 * 4. Exchanges ICE candidates
 */
export function answerCall(
    roomId: string,
    localStream: MediaStream,
    onRemoteStream: (stream: MediaStream) => void
): void {
    disconnectPeer(); // Ensure clean slate
    console.log('📱 [Callee] Setting up as Astrologer...');

    pc = new RTCPeerConnection(configuration);

    // Add local tracks
    localStream.getTracks().forEach(track => {
        pc?.addTrack(track, localStream);
    });

    // Listen for remote track
    pc.ontrack = event => {
        console.log('✅ [Callee] Received remote stream track!');
        onRemoteStream(event.streams[0]);
    };

    // Connection state debugging
    pc.oniceconnectionstatechange = () => {
        console.log(`🧊 [Callee] ICE state: ${pc?.iceConnectionState}`);
    };
    pc.onconnectionstatechange = () => {
        console.log(`🔗 [Callee] Connection state: ${pc?.connectionState}`);
    };

    const roomRef = doc(db, "consultations", roomId);

    // Collect ICE candidates
    pc.onicecandidate = async event => {
        if (event.candidate) {
            try {
                await updateDoc(roomRef, {
                    calleeCandidates: arrayUnion(event.candidate.toJSON())
                });
            } catch (e) {
                console.error("[Callee] Failed to save ICE candidate", e);
            }
        }
    };

    let answerCreated = false;
    const addedCandidates = new Set<string>();

    // STEP 1: Signal readiness FIRST, then listen for Offer
    console.log('📤 [Callee] Signaling readyToReceive...');
    updateDoc(roomRef, {
        readyToReceive: true,
        // Clear stale signaling data from previous attempts
        offer: deleteField(),
        answer: deleteField(),
        callerCandidates: [],
        calleeCandidates: [],
    }).then(() => {
        console.log('✅ [Callee] Ready signal sent. Listening for offer...');

        // STEP 2: Listen for Offer + Caller Candidates
        unsubRoom = onSnapshot(roomRef, async snapshot => {
            const data = snapshot.data();
            if (!data || !pc) return;

            // Process Offer if present
            if (data.offer && !answerCreated) {
                console.log("📥 [Callee] Got offer, creating answer...");
                answerCreated = true; // Prevent multiple answers

                try {
                    const offerDescription = data.offer;
                    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

                    const answer = await pc.createAnswer();
                    if (answer && pc) {
                        await pc.setLocalDescription(answer);

                        await updateDoc(roomRef, {
                            answer: {
                                type: answer.type,
                                sdp: answer.sdp,
                            }
                        });
                        console.log("📤 [Callee] Answer saved to Firestore.");
                    }
                } catch (e) {
                    console.error("[Callee] Error processing offer:", e);
                    answerCreated = false; // Allow retry
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
                            console.error("[Callee] Error adding caller ICE candidate", e);
                        }
                    }
                }
            }
        });
    }).catch(e => {
        console.error("[Callee] Failed to signal readiness:", e);
    });
}

/**
 * Waits for the Astrologer's `readyToReceive` flag in Firestore.
 * Polls with onSnapshot and resolves when ready.
 * Times out after CONNECTION_TIMEOUT.
 */
function waitForReadiness(roomRef: any): Promise<void> {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            if (unsub) unsub();
            reject(new Error("Timed out waiting for Acharya to be ready."));
        }, CONNECTION_TIMEOUT);

        const unsub = onSnapshot(roomRef, (snapshot: any) => {
            const data = snapshot.data();
            if (data?.readyToReceive === true) {
                console.log("✅ [Caller] Detected readyToReceive signal.");
                clearTimeout(timeout);
                unsub();
                resolve();
            }
        });
    });
}

/**
 * Disconnect and clean up the WebRTC peer connection.
 */
export function disconnectPeer(): void {
    console.log('🔌 Disconnecting WebRTC peer...');

    if (unsubRoom) {
        unsubRoom();
        unsubRoom = null;
    }

    if (pc) {
        pc.close();
        pc = null;
    }
}
