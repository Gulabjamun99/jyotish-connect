import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc, onSnapshot, arrayUnion, deleteField } from "firebase/firestore";

let pc: RTCPeerConnection | null = null;
let unsubRoom: (() => void) | null = null;
let currentConnectionId: string | null = null;

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
    localStream: MediaStream,
    onConnectionStateChange?: (state: RTCPeerConnectionState) => void
): Promise<{ remoteStream: MediaStream; connectionId: string }> {
    disconnectPeer();

    const connectionId = Math.random().toString(36).substring(2, 11) + "_" + Date.now();
    console.log(`📞 [Caller] Initializing call with connectionId: ${connectionId}`);

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
            const remoteStream = new MediaStream();
            let resolved = false;

            pc.ontrack = event => {
                console.log(`✅ [Caller] Received remote track: ${event.track.kind} (${event.track.readyState})`);
                remoteStream.addTrack(event.track);

                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve({ remoteStream, connectionId });
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
                if (onConnectionStateChange && pc) {
                    onConnectionStateChange(pc.connectionState);
                }
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

            // 1. Clean slate — clear stale signaling data
            console.log('🧹 [Caller] Cleaning up stale signaling data...');
            try {
                // Try updateDoc first (works if doc exists)
                await updateDoc(roomRef, {
                    connectionId: connectionId,
                    answer: deleteField(),
                    offer: deleteField(),
                    callerCandidates: [],
                    calleeCandidates: []
                });
            } catch (cleanupErr) {
                // Doc doesn't exist yet — create it with empty signaling fields
                console.log('🧹 [Caller] Doc not found, creating fresh signaling doc...');
                try {
                    await setDoc(roomRef, {
                        connectionId: connectionId,
                        callerCandidates: [],
                        calleeCandidates: []
                    }, { merge: true });
                } catch (createErr) {
                    console.error('[Caller] Could not create signaling doc:', createErr);
                }
            }

            // 2. Create SDP Offer
            console.log('📞 [Caller] Creating SDP offer...');
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            console.log('✅ [Caller] Local description set');

            // 3. Save offer to Firestore (triggers Callee)
            console.log('📤 [Caller] Saving offer to Firestore...');
            await setDoc(roomRef, {
                offer: { type: offer.type, sdp: offer.sdp },
                connectionId: connectionId,
                callerCandidates: [],
                calleeCandidates: []
            }, { merge: true });
            console.log('✅ [Caller] Offer saved to Firestore!');

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

                // Guard: Only process responses for our connectionId
                if (data.connectionId !== connectionId) {
                    console.log(`⏳ [Caller] Ignoring snapshot with different connectionId: ${data.connectionId} (current: ${connectionId})`);
                    return;
                }

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
    onRemoteStream: (stream: MediaStream) => void,
    onConnectionStateChange?: (state: RTCPeerConnectionState) => void
): void {
    disconnectPeer();
    if (!db) {
        console.error("❌ [Callee] Firestore not initialized");
        return;
    }

    console.log('📱 [Callee] Setting up and listening for offer...');
    const roomRef = doc(db, "consultations", roomId);

    let answerSaved = false;
    let pendingCalleeCandidates: RTCIceCandidateInit[] = [];
    const addedCandidates = new Set<string>();
    const queuedCandidates: any[] = [];
    
    currentConnectionId = null;

    unsubRoom = onSnapshot(roomRef, async (snapshot: any) => {
        const data = snapshot.data();
        if (!data) return;

        const incomingConnectionId = data.connectionId;
        if (!incomingConnectionId) {
            console.log("⏳ [Callee] Waiting for connectionId from Caller...");
            return;
        }

        // If connectionId changes, we must tear down and start a fresh peer connection!
        if (incomingConnectionId !== currentConnectionId) {
            console.log(`🔄 [Callee] New connectionId detected: ${incomingConnectionId} (old: ${currentConnectionId}). Resetting peer connection.`);
            currentConnectionId = incomingConnectionId;
            
            // Clean up previous connection if any
            if (pc) {
                pc.close();
                pc = null;
            }

            // Reset local variables for the new session
            answerSaved = false;
            pendingCalleeCandidates = [];
            addedCandidates.clear();
            queuedCandidates.length = 0;

            // Initialize new PeerConnection
            pc = new RTCPeerConnection(configuration);

            pc.onconnectionstatechange = () => {
                console.log(`🔗 [Callee] Connection State: ${pc?.connectionState}`);
                if (onConnectionStateChange && pc) {
                    onConnectionStateChange(pc.connectionState);
                }
            };

            pc.oniceconnectionstatechange = () => {
                console.log(`🧊 [Callee] ICE State: ${pc?.iceConnectionState}`);
            };

            // Re-add local tracks
            const localTracks = localStream ? localStream.getTracks() : [];
            console.log(`📱 [Callee] Re-adding ${localTracks.length} local tracks for new connection`);
            localTracks.forEach(track => {
                pc?.addTrack(track, localStream);
                console.log(`📱 [Callee] Added ${track.kind} track to peer connection`);
            });

            // Track collection
            const remoteStream = new MediaStream();
            let notified = false;
            pc.ontrack = event => {
                console.log(`✅ [Callee] Received remote track: ${event.track.kind} (${event.track.readyState})`);
                remoteStream.addTrack(event.track);
                if (!notified) {
                    notified = true;
                    onRemoteStream(remoteStream);
                }
            };

            // Candidate handler
            pc.onicecandidate = async event => {
                if (event.candidate) {
                    if (!answerSaved) {
                        pendingCalleeCandidates.push(event.candidate.toJSON());
                        console.log(`⏳ [Callee] Queued candidate (answer not saved yet). Queue size: ${pendingCalleeCandidates.length}`);
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
        }

        // TS Safety check
        if (!pc) return;

        // Process Offer if present and answer not saved yet
        if (data.offer && !answerSaved && pc.signalingState === 'stable') {
            console.log("📥 [Callee] Got offer! Setting remote description & creating answer...");
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                console.log("✅ [Callee] Remote description set successfully. Creating answer...");

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                console.log("📤 [Callee] Saving answer to Firestore...");
                await updateDoc(roomRef, {
                    answer: { type: answer.type, sdp: answer.sdp }
                });
                console.log("✅ [Callee] Answer saved!");

                answerSaved = true;
                
                // Flush queued candidates
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

                // Drain remote candidates
                while (queuedCandidates.length > 0) {
                    const cand = queuedCandidates.shift();
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(cand));
                        console.log("✅ [Callee] Drained remote candidate successfully.");
                    } catch (e) {
                        console.error("❌ [Callee] Failed to add remote candidate:", e);
                    }
                }
            } catch (e) {
                console.error("[Callee] Error processing offer:", e);
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
