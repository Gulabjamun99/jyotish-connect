import { db } from "@/lib/firebase";
import { doc, updateDoc, onSnapshot, arrayUnion, deleteField } from "firebase/firestore";

let pc: RTCPeerConnection | null = null;

const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
    ]
};

let unsubRoom: (() => void) | null = null;

export async function initializePeer(userId: string): Promise<string> {
    // Stubbed for backwards compatibility
    return userId;
}

export async function makeCall(
    roomId: string,
    localStream: MediaStream
): Promise<MediaStream> {
    disconnectPeer(); // Ensure clean slate
    return new Promise(async (resolve, reject) => {
        try {
            console.log('📞 Initiating call as Caller (User)...');
            pc = new RTCPeerConnection(configuration);

            // Add local tracks
            localStream.getTracks().forEach(track => {
                pc?.addTrack(track, localStream);
            });

            // Listen for remote track
            pc.ontrack = event => {
                console.log('✅ Received remote stream track');
                resolve(event.streams[0]);
            };

            const roomRef = doc(db, "consultations", roomId);

            // Collect and send our ICE candidates to main document array
            pc.onicecandidate = async event => {
                if (event.candidate) {
                    try {
                        await updateDoc(roomRef, {
                            callerCandidates: arrayUnion(event.candidate.toJSON())
                        });
                    } catch (e) {
                        console.error("Failed to save caller candidate", e);
                    }
                }
            };

            // Create Offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // Clean the slate in Firestore and save Offer
            await updateDoc(roomRef, {
                offer: {
                    type: offer.type,
                    sdp: offer.sdp,
                },
                callerCandidates: [],
                calleeCandidates: [],
                answer: deleteField()
            });

            const addedCandidates = new Set<string>();

            // Listen for Answer and Callee Candidates
            unsubRoom = onSnapshot(roomRef, async snapshot => {
                const data = snapshot.data();
                if (!data) return;

                // Handle Answer
                if (!pc?.currentRemoteDescription && data.answer) {
                    console.log("✅ Received Answer from Astrologer");
                    const rtcSessionDescription = new RTCSessionDescription(data.answer);
                    await pc.setRemoteDescription(rtcSessionDescription);
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
                                console.error("Error adding callee ICE candidate", e);
                            }
                        }
                    }
                }
            });

        } catch (e) {
            console.error('Call initialization failed:', e);
            reject(e);
        }
    });
}

export function answerCall(
    roomId: string,
    localStream: MediaStream,
    onRemoteStream: (stream: MediaStream) => void
): void {
    disconnectPeer(); // Ensure clean slate
    console.log('📱 Waiting for incoming call as Callee (Astrologer)...');

    pc = new RTCPeerConnection(configuration);

    // Add local tracks
    localStream.getTracks().forEach(track => {
        pc?.addTrack(track, localStream);
    });

    // Listen for remote track
    pc.ontrack = event => {
        console.log('✅ Received remote stream track');
        onRemoteStream(event.streams[0]);
    };

    const roomRef = doc(db, "consultations", roomId);

    // Collect and send our ICE candidates
    pc.onicecandidate = async event => {
        if (event.candidate) {
            try {
                await updateDoc(roomRef, {
                    calleeCandidates: arrayUnion(event.candidate.toJSON())
                });
            } catch (e) {
                console.error("Failed to save callee candidate", e);
            }
        }
    };

    let answerCreated = false;
    const addedCandidates = new Set<string>();

    // Listen for Offer and Caller Candidates
    unsubRoom = onSnapshot(roomRef, async snapshot => {
        const data = snapshot.data();
        if (!data) return;

        // Process Offer if present
        if (data.offer && !answerCreated) {
            console.log("Got offer, creating answer");
            answerCreated = true; // Prevent multiple answers
            const offerDescription = data.offer;
            await pc?.setRemoteDescription(new RTCSessionDescription(offerDescription));

            const answer = await pc?.createAnswer();
            if (answer && pc) {
                await pc.setLocalDescription(answer);

                await updateDoc(roomRef, {
                    answer: {
                        type: answer.type,
                        sdp: answer.sdp,
                    }
                });
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
                        console.error("Error adding caller ICE candidate", e);
                    }
                }
            }
        }
    });
}

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
