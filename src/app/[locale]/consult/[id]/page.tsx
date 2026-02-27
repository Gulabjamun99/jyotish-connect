"use client";

import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { PhoneOff } from "lucide-react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { initializePeer, makeCall, answerCall, disconnectPeer } from "@/services/video";
import { toast } from "react-hot-toast";
import { startConsultation, addTranscriptLine, listenToConsultation } from "@/services/firestore";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ChatInterface } from "@/components/consultation/ChatInterface";
import { AudioInterface } from "@/components/consultation/AudioInterface";
import { VideoInterface } from "@/components/consultation/VideoInterface";
import { LobbyInterface } from "@/components/consultation/LobbyInterface";

export default function ConsultPage() {
    const { id } = useParams() as { id: string };
    const { user, loading: authLoading, role } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const paymentId = searchParams.get("payment_id");
    const isDemo = searchParams.get("demo") === "true";
    const consultationType = (searchParams.get("type") as "video" | "audio" | "chat") || "video";

    // Auto-detect participant role from auth context OR forced URL param (useful for local testing)
    const participantRole = searchParams.get("role") || role || "user";

    // Connection States
    const [isJoined, setIsJoined] = useState(false); // Lobby vs Room state
    const [room, setRoom] = useState<any>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [participants, setParticipants] = useState<any[]>([]);

    // Media States
    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(consultationType === "video");

    // Presence States
    const [isRemoteOnline, setIsRemoteOnline] = useState(false);
    const [remoteName, setRemoteName] = useState(participantRole === 'astrologer' ? "User" : "Acharya");
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');

    const [transcript, setTranscript] = useState<{ speaker: string, text: string, time: string }[]>([]);
    const [messages, setMessages] = useState<any[]>([]); // For chat mode
    const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes in seconds

    const recognitionRef = useRef<any>(null);

    // 1. Initial Setup: Get Media for Lobby & Listen to Presence
    useEffect(() => {
        if (authLoading) return;

        const setupLobby = async () => {
            // Get Local Media
            try {
                const localStream = await navigator.mediaDevices.getUserMedia({
                    video: consultationType === "video",
                    audio: true
                });
                setStream(localStream);
            } catch (err) {
                console.error("Media access failed:", err);
                toast.error("Please allow camera/mic access");
            }

            // Sync Presence to Firestore
            const presenceRef = doc(db, "consultations", id);

            // Mark myself as present in lobby
            await setDoc(presenceRef, {
                [participantRole === 'astrologer' ? 'astrologerPresent' : 'userPresent']: true,
                [participantRole === 'astrologer' ? 'astrologerName' : 'userName']: user?.displayName || (participantRole === 'astrologer' ? 'Acharya' : 'User')
            }, { merge: true });

            // Listen for other participant
            const unsubscribe = onSnapshot(presenceRef, (doc) => {
                if (doc.exists()) {
                    const data = doc.data();
                    const targetKey = participantRole === 'astrologer' ? 'userPresent' : 'astrologerPresent';
                    const nameKey = participantRole === 'astrologer' ? 'userName' : 'astrologerName';

                    setIsRemoteOnline(!!data[targetKey]);
                    if (data[nameKey]) setRemoteName(data[nameKey]);
                }
            });

            return () => unsubscribe();
        };

        setupLobby();
    }, [authLoading, id, consultationType, participantRole, user]);


    // 2. Join Room Logic (Called when "Join Now" clicked)
    const handleJoinRoom = async () => {
        setIsJoined(true);
        setConnectionStatus('connecting');
        toast.success("Joining Heavenly Room...");

        // Mark as joined in Firestore
        await updateDoc(doc(db, "consultations", id), {
            [participantRole === 'astrologer' ? 'astrologerJoined' : 'userJoined']: true
        });

        if (!stream) {
            toast.error("Camera/Mic not detected. Please allow permissions.");
            setConnectionStatus('failed');
            return;
        }

        try {
            console.log("🔵 Initializing WebRTC connection via Firestore signaling...");

            await initializePeer(participantRole); // Stub

            if (participantRole === 'astrologer') {
                // Astrologer: Signal readiness FIRST, then wait for offer
                console.log("📱 Astrologer: Signaling ready and waiting for offer...");
                answerCall(id, stream, (remoteStream) => {
                    console.log("✅ Astrologer: Received remote stream from User!");
                    setRemoteStream(remoteStream);
                    setConnectionStatus('connected');
                    toast.success("Devotee Connected!");
                });
            } else {
                // User: Wait for Astrologer's readiness, then create offer
                console.log(`👤 User: Waiting for Acharya readiness, then creating offer in room ${id}...`);

                try {
                    const rStream = await makeCall(id, stream);
                    setRemoteStream(rStream);
                    setConnectionStatus('connected');
                    toast.success("Connected to Acharya!");
                    console.log("✅ User: WebRTC Call successful!");
                } catch (e: any) {
                    console.error("WebRTC Negotiation failed:", e);
                    setConnectionStatus('failed');
                    toast.error(e?.message || "Could not reach Acharya. They might not be in the room yet.");
                }
            }

            // Start Transcription Backup
            if (!recognitionRef.current && 'webkitSpeechRecognition' in window) {
                const SpeechRecognition = (window as any).webkitSpeechRecognition;
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-IN';

                recognition.onresult = (event: any) => {
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            const text = event.results[i][0].transcript;
                            const speaker = participantRole === 'astrologer' ? 'Astrologer' : 'User';
                            const time = new Date().toLocaleTimeString();

                            setTranscript(prev => [...prev, { speaker, text, time }]);
                            addTranscriptLine(id, { speaker, text, time });
                        }
                    }
                };
                recognition.start();
                recognitionRef.current = recognition;
            }

        } catch (err) {
            console.error("Connection failed:", err);
            setConnectionStatus('failed');
            toast.error("Initialization failed. Please refresh.");
        }
    };

    // Retry connection handler
    const handleRetryConnection = async () => {
        setConnectionStatus('connecting');
        disconnectPeer();
        if (stream) {
            try {
                if (participantRole === 'astrologer') {
                    answerCall(id, stream, (remoteStream) => {
                        setRemoteStream(remoteStream);
                        setConnectionStatus('connected');
                        toast.success("Devotee Connected!");
                    });
                } else {
                    const rStream = await makeCall(id, stream);
                    setRemoteStream(rStream);
                    setConnectionStatus('connected');
                    toast.success("Connected to Acharya!");
                }
            } catch (e: any) {
                setConnectionStatus('failed');
                toast.error(e?.message || "Retry failed. Please refresh the page.");
            }
        }
    };

    // Timer Logic
    useEffect(() => {
        if (!isJoined || !isRemoteOnline) return; // Only start timer after BOTH join

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleDisconnect();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isJoined]);

    const handleDisconnect = async () => {
        if (room) room.disconnect();
        if (stream) stream.getTracks().forEach(t => t.stop());
        if (recognitionRef.current) recognitionRef.current.stop();

        // Remove from presence
        try {
            await updateDoc(doc(db, "consultations", id), {
                [participantRole === 'astrologer' ? 'astrologerPresent' : 'userPresent']: false,
                [participantRole === 'astrologer' ? 'astrologerJoined' : 'userJoined']: false
            });
        } catch (e) { console.warn("Could not update disconnect status", e); }

        // Save transcript to Firestore for permanent record
        if (transcript.length > 0) {
            try {
                // Save to localStorage as backup
                localStorage.setItem(`transcript_${id}`, JSON.stringify(transcript));

                // Save to Firestore
                await setDoc(doc(db, "consultations", id), {
                    transcript: transcript,
                    status: "completed",
                    endedAt: new Date().toISOString(),
                    participants: participants.map(p => p.identity || "Unknown"),
                    duration: (90 * 60) - timeLeft
                }, { merge: true });
                console.log("✅ Transcript saved to Firestore");

                // Execute Payout if Astrologer or via generic backend trigger
                // We let the backend handle duplication checks
                try {
                    await fetch("/api/wallet/payout", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ bookingId: id })
                    });
                    console.log("✅ Payout initialized");
                } catch (e) {
                    console.error("Payout trigger failed", e);
                }

            } catch (err) {
                console.error("Failed to save transcript to Firestore:", err);
            }
        }

        toast.success("Consultation complete");
        router.push(`/consultation-summary/${id}`);
    };

    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => track.enabled = !micOn);
            setMicOn(!micOn);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks().forEach(track => track.enabled = !videoOn);
            setVideoOn(!videoOn);
        }
    };

    const retryCamera = async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(s);
            setVideoOn(true);
            toast.success("Camera restored");
        } catch (e) {
            toast.error("Still no camera access");
        }
    };

    const handleSendMessage = (message: any) => {
        setMessages(prev => [...prev, message]);
        addTranscriptLine(id, {
            speaker: message.senderName,
            text: message.text,
            time: message.time
        });
    };

    return (
        <main className="min-h-screen flex flex-col bg-black overflow-hidden">
            <Navbar />

            {/* Loading Overlay */}
            {authLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="text-center space-y-4">
                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-orange-500">Checking credentials...</p>
                    </div>
                </div>
            )}

            {/* Chat Mode - Direct Render */}
            {consultationType === "chat" ? (
                <div className="flex-grow h-[calc(100vh-64px)]">
                    <ChatInterface
                        consultationId={id}
                        userName={user?.displayName || "You"}
                        astrologerName="Acharya Ravi Singh"
                        onSendMessage={handleSendMessage}
                        messages={messages}
                        timeLeft={timeLeft}
                        onEndSession={handleDisconnect}
                    />
                </div>
            ) : (
                /* Video/Audio Mode - Lobby First */
                <div className="flex-grow h-[calc(100vh-64px)] relative">
                    {!isJoined ? (
                        <LobbyInterface
                            stream={stream}
                            micOn={micOn}
                            videoOn={videoOn}
                            onToggleMic={toggleMic}
                            onToggleVideo={toggleVideo}
                            onJoin={handleJoinRoom}
                            participantRole={participantRole}
                            remoteParticipantName={remoteName}
                            isRemoteParticipantOnline={isRemoteOnline}
                            userName={user?.displayName || (participantRole === 'astrologer' ? 'Acharya' : 'User')}
                        />
                    ) : (
                        <>
                            {/* Connection Status Overlay */}
                            {connectionStatus === 'connecting' && (
                                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                                    <div className="text-center space-y-4 glass p-10 rounded-3xl border border-orange-500/20">
                                        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                        <p className="text-white font-bold text-lg">
                                            Establishing connection...
                                        </p>
                                        <p className="text-white/40 text-sm">Connecting to the other participant</p>
                                    </div>
                                </div>
                            )}
                            {connectionStatus === 'failed' && (
                                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                                    <div className="text-center space-y-4 glass p-10 rounded-3xl border border-red-500/20">
                                        <div className="text-5xl">⚠️</div>
                                        <p className="text-white font-bold text-lg">Connection Failed</p>
                                        <p className="text-white/40 text-sm">Could not establish a peer-to-peer connection.</p>
                                        <Button
                                            onClick={handleRetryConnection}
                                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl px-8 py-3"
                                        >
                                            🔄 Retry Connection
                                        </Button>
                                    </div>
                                </div>
                            )}
                            <VideoInterface
                                stream={stream}
                                remoteStream={remoteStream}
                                micOn={micOn}
                                videoOn={videoOn}
                                onToggleMic={toggleMic}
                                onToggleVideo={toggleVideo}
                                onDisconnect={handleDisconnect}
                                userName={user?.displayName || "You"}
                                astrologerName={remoteName}
                                timeLeft={timeLeft}
                                transcript={transcript}
                                isDemo={isDemo}
                                onRetryCamera={retryCamera}
                                labels={{
                                    local: `${user?.displayName || 'You'} (${participantRole})`,
                                    remote: remoteName
                                }}
                                consultationId={id}
                            />
                        </>
                    )}
                </div>
            )}
        </main>
    );
}
