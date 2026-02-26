import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc, collection, addDoc, onSnapshot, getDoc } from "firebase/firestore";

let pc: RTCPeerConnection | null = null;

const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
    ]
};

let unsubRoom: (() => void) | null = null;
let unsubCallerCandidates: (() => void) | null = null;
let unsubCalleeCandidates: (() => void) | null = null;

export async function initializePeer(userId: string): Promise<string> {
    // Stubbed for backwards compatibility, not needed for native WebRTC
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
            const callerCandidatesCollection = collection(roomRef, 'callerCandidates');

            // Collect and send ICE candidates
            pc.onicecandidate = event => {
                if (event.candidate) {
                    addDoc(callerCandidatesCollection, event.candidate.toJSON());
                }
            };

            // Create Offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // Save Offer to Firestore
            await updateDoc(roomRef, {
                offer: {
                    type: offer.type,
                    sdp: offer.sdp,
                }
            });

            // Listen for Answer
            unsubRoom = onSnapshot(roomRef, async snapshot => {
                const data = snapshot.data();
                if (!pc?.currentRemoteDescription && data?.answer) {
                    console.log("✅ Received Answer from Astrologer:", data.answer);
                    const rtcSessionDescription = new RTCSessionDescription(data.answer);
                    await pc.setRemoteDescription(rtcSessionDescription);
                }
            });

            // Listen for Callee (Astrologer) ICE Candidates
            const calleeCandidatesCollection = collection(roomRef, 'calleeCandidates');
            unsubCalleeCandidates = onSnapshot(calleeCandidatesCollection, snapshot => {
                snapshot.docChanges().forEach(async change => {
                    if (change.type === 'added') {
                        let data = change.doc.data();
                        await pc?.addIceCandidate(new RTCIceCandidate(data));
                    }
                });
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
    const calleeCandidatesCollection = collection(roomRef, 'calleeCandidates');

    // Collect and send our ICE candidates
    pc.onicecandidate = event => {
        if (event.candidate) {
            addDoc(calleeCandidatesCollection, event.candidate.toJSON());
        }
    };

    let answerCreated = false;

    // Listen for Offer
    unsubRoom = onSnapshot(roomRef, async snapshot => {
        const data = snapshot.data();
        if (data?.offer && !answerCreated) {
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
    });

    // Listen for Caller (User) ICE Candidates
    const callerCandidatesCollection = collection(roomRef, 'callerCandidates');
    unsubCallerCandidates = onSnapshot(callerCandidatesCollection, snapshot => {
        snapshot.docChanges().forEach(async change => {
            if (change.type === 'added') {
                let data = change.doc.data();
                await pc?.addIceCandidate(new RTCIceCandidate(data));
            }
        });
    });
}

export function disconnectPeer(): void {
    console.log('🔌 Disconnecting WebRTC peer...');
    
    if (unsubRoom) { unsubRoom(); unsubRoom = null; }
    if (unsubCallerCandidates) { unsubCallerCandidates(); unsubCallerCandidates = null; }
    if (unsubCalleeCandidates) { unsubCalleeCandidates(); unsubCalleeCandidates = null; }

    if (pc) {
        pc.close();
        pc = null;
    }
}
