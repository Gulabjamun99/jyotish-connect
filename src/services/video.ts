import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc, onSnapshot, arrayUnion, deleteField } from "firebase/firestore";

let pc: RTCPeerConnection | null = null;
let unsubRoom: (() => void) | null = null;

/**
 * ICE Server Configuration
 * STUN + free TURN servers for NAT traversal on Indian mobile networks.
 */
const METERED_USERNAME = process.env.NEXT_PUBLIC_METERED_USERNAME || "e8dd65f92aea25c159e32478";
const METERED_CREDENTIAL = process.env.NEXT_PUBLIC_METERED_CREDENTIAL || "kRKr/OVDgQWJLpmj";

const configuration: RTCConfiguration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' },
        {
            urls: "turn:a.relay.metered.ca:80",
            username: METERED_USERNAME,
            credential: METERED_CREDENTIAL,
        },
        {
            urls: "turn:a.relay.metered.ca:80?transport=tcp",
            username: METERED_USERNAME,
            credential: METERED_CREDENTIAL,
        },
        {
            urls: "turn:a.relay.metered.ca:443",
            username: METERED_USERNAME,
            credential: METERED_CREDENTIAL,
        },
        {
            urls: "turns:a.relay.metered.ca:443?transport=tcp",
            username: METERED_USERNAME,
            credential: METERED_CREDENTIAL,
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
        if (!db) {
            console.error("❌ [Caller] Firestore not initialized");
            reject(new Error("Database service is unavailable. Check your connection."));
            return;
        }

        const timeout = setTimeout(() => {
            console.error("⏱️ Connection timed out after 60s");
            disconnectPeer();
            reject(new Error("Connection timed out. Acharya may not have joined yet."));
        }, CONNECTION_TIMEOUT);

        try {
            console.log('📞 [Caller] Creating WebRTC offer...');
            pc = new RTCPeerConnection(configuration);

            // Add local tracks — log each track for debugging
            const localTracks = localStream ? localStream.getTracks() : [];
            console.log(`📞 [Caller] Local stream has ${localTracks.length} tracks:`, localTracks.map(t => `${t.kind}:${t.enabled ? 'enabled' : 'disabled'}(${t.readyState})`));

            if (localTracks.length === 0) {
                console.warn('⚠️ [Caller] No local tracks! Remote side will NOT hear/see us.');
            }

            localTracks.forEach(track => {
                pc?.addTrack(track, localStream);
                console.log(`📞 [Caller] Added ${track.kind} track to peer connection`);
            });

            // Collect ALL remote tracks into a single MediaStream
            // (audio and video ontrack events may fire separately)
            const remoteStream = new MediaStream();
            let resolved = false;

            pc.ontrack = event => {
                console.log(`✅ [Caller] Received remote track: ${event.track.kind} (${event.track.readyState})`);
                
                // Add each remote track to our collected stream
                remoteStream.addTrack(event.track);

                // Resolve on first track arrival (subsequent tracks are added to same stream)
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(remoteStream);
                }
            };

            // Debug logs
            pc.oniceconnectionstatechange = () => {
                console.log(`🧊 [Caller] ICE State: ${pc?.iceConnectionState}`);
                if (pc?.iceConnectionState === 'failed' || pc?.iceConnectionState === 'disconnected') {
                    console.error('❌ [Caller] ICE failed/disconnected');
                }
            };
            pc.onconnectionstatechange = () => {
                console.log(`🔗 [Caller] Connection State: ${pc?.connectionState}`);
                if (pc?.connectionState === 'failed') {
                    clearTimeout(timeout);
                    reject(new Error("WebRTC connection failed."));
                }
            };

            const roomRef = doc(db, "consultations", roomId);

            // Queue ICE candidates until after the offer is saved to prevent race conditions
            let offerSaved = false;
            const pendingCallerCandidates: RTCIceCandidateInit[] = [];

            // Send ICE candidates to Firestore (with queuing)
            pc.onicecandidate = async event => {
                if (event.candidate) {
                    if (!offerSaved) {
                        // Queue candidates until offer is saved and arrays are initialized
                        pendingCallerCandidates.push(event.candidate.toJSON());
                        console.log(`⏳ [Caller] Queued ICE candidate (offer not saved yet). Queue size: ${pendingCallerCandidates.length}`);
                    } else {
                        try {
                            await updateDoc(roomRef, {
                                callerCandidates: arrayUnion(event.candidate.toJSON())
                            });
                        } catch (e) {
                            console.error("[Caller] ICE candidate save failed", e);
                        }
                    }
                }
            };

            // 1. Clean slate — use setDoc (not updateDoc) so it works even if doc doesn't exist
            console.log('🧹 [Caller] Cleaning up stale signaling data...');
            await setDoc(roomRef, {
                answer: deleteField(),
                offer: deleteField(),
                callerCandidates: [],
                calleeCandidates: []
            }, { merge: true });

            // 2. Create SDP Offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // 3. Save offer to Firestore (triggers Callee) + initialize ICE candidate arrays
            console.log('📤 [Caller] Saving new offer to Firestore...');
            await setDoc(roomRef, {
                offer: { type: offer.type, sdp: offer.sdp },
                callerCandidates: [],
                calleeCandidates: []
            }, { merge: true });

            // Mark offer as saved, then flush any queued ICE candidates
            offerSaved = true;
            console.log(`✅ [Caller] Offer saved. Flushing ${pendingCallerCandidates.length} queued ICE candidates...`);

            for (const candidate of pendingCallerCandidates) {
                try {
                    await updateDoc(roomRef, {
                        callerCandidates: arrayUnion(candidate)
                    });
                } catch (e) {
                    console.error("[Caller] Failed to flush queued ICE candidate:", e);
                }
            }
            pendingCallerCandidates.length = 0;

            console.log('✅ [Caller] Listening for answer...');

            // Listen for Answer + Callee ICE Candidates
            const addedCandidates = new Set<string>();
            const queuedCandidates: any[] = [];

            unsubRoom = onSnapshot(roomRef, async (snapshot: any) => {
                const data = snapshot.data();
                if (!data || !pc) return;

                // Handle Answer
                if (!pc.currentRemoteDescription && data.answer) {
                    console.log("📥 [Caller] Got Answer from Astrologer! Setting remote description...");
                    try {
                        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                        console.log("✅ [Caller] Remote description set successfully. Draining queued candidates...");
                        while (queuedCandidates.length > 0) {
                            const cand = queuedCandidates.shift();
                            try {
                                await pc.addIceCandidate(new RTCIceCandidate(cand));
                                console.log("✅ [Caller] Drained queued candidate successfully.");
                            } catch (e) {
                                console.error("❌ [Caller] Failed to add drained candidate:", e);
                            }
                        }
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
                            if (pc.currentRemoteDescription) {
                                try {
                                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                                    console.log("✅ [Caller] Added candidate immediately.");
                                } catch (e) {
                                    console.error("[Caller] addIceCandidate failed", e);
                                }
                            } else {
                                console.log("⏳ [Caller] Queuing candidate (remote description not set yet).");
                                queuedCandidates.push(candidate);
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
    if (!db) {
        console.error("❌ [Callee] Firestore not initialized");
        return;
    }

    console.log('📱 [Callee] Setting up and listening for offer...');

    pc = new RTCPeerConnection(configuration);

    // Add local tracks — log each track for debugging
    const localTracks = localStream ? localStream.getTracks() : [];
    console.log(`📱 [Callee] Local stream has ${localTracks.length} tracks:`, localTracks.map(t => `${t.kind}:${t.enabled ? 'enabled' : 'disabled'}(${t.readyState})`));

    if (localTracks.length === 0) {
        console.warn('⚠️ [Callee] No local tracks! Remote side will NOT hear/see us.');
    }

    localTracks.forEach(track => {
        pc?.addTrack(track, localStream);
        console.log(`📱 [Callee] Added ${track.kind} track to peer connection`);
    });

    // Collect ALL remote tracks into a single MediaStream
    const remoteStream = new MediaStream();
    let notified = false;

    pc.ontrack = event => {
        console.log(`✅ [Callee] Received remote track: ${event.track.kind} (${event.track.readyState})`);
        
        // Add each remote track to our collected stream
        remoteStream.addTrack(event.track);

        // Notify on first track (subsequent tracks are added to same stream)
        if (!notified) {
            notified = true;
            onRemoteStream(remoteStream);
        }
    };

    // Debug logs
    pc.oniceconnectionstatechange = () => {
        console.log(`🧊 [Callee] ICE State: ${pc?.iceConnectionState}`);
    };
    pc.onconnectionstatechange = () => {
        console.log(`🔗 [Callee] Connection State: ${pc?.connectionState}`);
    };

    const roomRef = doc(db, "consultations", roomId);

    // Queue ICE candidates until after the answer is saved
    let answerSaved = false;
    const pendingCalleeCandidates: RTCIceCandidateInit[] = [];

    // Send ICE candidates to Firestore (with queuing)
    pc.onicecandidate = async event => {
        if (event.candidate) {
            if (!answerSaved) {
                pendingCalleeCandidates.push(event.candidate.toJSON());
                console.log(`⏳ [Callee] Queued ICE candidate (answer not saved yet). Queue size: ${pendingCalleeCandidates.length}`);
            } else {
                try {
                    await updateDoc(roomRef, {
                        calleeCandidates: arrayUnion(event.candidate.toJSON())
                    });
                } catch (e) {
                    console.error("[Callee] ICE candidate save failed", e);
                }
            }
        }
    };

    let answerCreated = false;
    const addedCandidates = new Set<string>();
    const queuedCandidates: any[] = [];

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
                console.log("✅ [Callee] Remote description set successfully. Draining queued candidates...");

                const answer = await pc.createAnswer();
                if (answer && pc) {
                    await pc.setLocalDescription(answer);

                    console.log("📤 [Callee] Saving answer to Firestore...");
                    await updateDoc(roomRef, {
                        answer: { type: answer.type, sdp: answer.sdp }
                    });
                    console.log("✅ [Callee] Answer saved!");

                    // Mark answer as saved, then flush any queued ICE candidates
                    answerSaved = true;
                    console.log(`✅ [Callee] Flushing ${pendingCalleeCandidates.length} queued ICE candidates...`);
                    for (const candidate of pendingCalleeCandidates) {
                        try {
                            await updateDoc(roomRef, {
                                calleeCandidates: arrayUnion(candidate)
                            });
                        } catch (e) {
                            console.error("[Callee] Failed to flush queued ICE candidate:", e);
                        }
                    }
                    pendingCalleeCandidates.length = 0;
                }

                while (queuedCandidates.length > 0) {
                    const cand = queuedCandidates.shift();
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(cand));
                        console.log("✅ [Callee] Drained queued candidate successfully.");
                    } catch (e) {
                        console.error("❌ [Callee] Failed to add drained candidate:", e);
                    }
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
                    if (pc.currentRemoteDescription) {
                        try {
                            await pc.addIceCandidate(new RTCIceCandidate(candidate));
                            console.log("✅ [Callee] Added candidate immediately.");
                        } catch (e) {
                            console.error("[Callee] addIceCandidate failed", e);
                        }
                    } else {
                        console.log("⏳ [Callee] Queuing candidate (remote description not set yet).");
                        queuedCandidates.push(candidate);
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
