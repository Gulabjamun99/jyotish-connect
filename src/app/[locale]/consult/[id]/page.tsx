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
    const [debugLog, setDebugLog] = useState<string[]>([]);

    const addDebug = (msg: string) => {
        console.log(`🔍 ${msg}`);
        setDebugLog(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()} ${msg}`]);
    };

    const [transcript, setTranscript] = useState<{ speaker: string, text: string, time: string }[]>([]);
    const [messages, setMessages] = useState<any[]>([]); // For chat mode
    const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes in seconds

    const recognitionRef = useRef<any>(null);
    const recognitionStoppedRef = useRef(false); // flag to prevent restart after disconnect

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
                [participantRole === 'astrologer' ? 'astrologerName' : 'userName']: user?.displayName || (participantRole === 'astrologer' ? 'Acharya' : 'User'),
                [participantRole === 'astrologer' ? 'astrologerEmail' : 'userEmail']: user?.email || '',
                type: consultationType
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
        addDebug(`Role: ${participantRole}, Room: ${id}`);
        toast.success("Joining Heavenly Room...");

        // Mark as joined in Firestore (using setDoc merge — never fails on missing doc)
        try {
            await setDoc(doc(db, "consultations", id), {
                [participantRole === 'astrologer' ? 'astrologerJoined' : 'userJoined']: true
            }, { merge: true });
            addDebug('✅ Marked joined in Firestore');
        } catch (e: any) {
            addDebug(`❌ Firestore join failed: ${e.message}`);
        }

        // If stream is null, retry getting media access
        let activeStream = stream;
        if (!activeStream) {
            addDebug('⚠️ No stream yet, retrying camera/mic...');
            try {
                activeStream = await navigator.mediaDevices.getUserMedia({
                    video: consultationType === "video",
                    audio: true
                });
                setStream(activeStream);
                addDebug(`✅ Media retry succeeded (tracks: ${activeStream.getTracks().length})`);
            } catch (mediaErr: any) {
                addDebug(`⚠️ Media retry failed: ${mediaErr.message}`);
                // Try audio-only fallback
                try {
                    activeStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                    setStream(activeStream);
                    setVideoOn(false);
                    addDebug('✅ Audio-only fallback succeeded');
                    toast('Camera denied — joining with audio only', { icon: '🎙️' });
                } catch (audioErr: any) {
                    addDebug(`❌ All media failed: ${audioErr.message}`);
                    toast.error("Cannot access camera or microphone. Please check browser permissions.");
                    setConnectionStatus('failed');
                    return;
                }
            }
        }
        addDebug(`✅ Media stream ready (tracks: ${activeStream.getTracks().length})`);

        try {
            await initializePeer(participantRole);

            if (participantRole === 'astrologer') {
                addDebug('📱 Astrologer: Setting up listener for offer...');
                answerCall(id, activeStream, (remoteStream) => {
                    addDebug('✅ Astrologer: Got remote stream!');
                    setRemoteStream(remoteStream);
                    setConnectionStatus('connected');
                    toast.success("Devotee Connected!");
                });
                addDebug('📱 Astrologer: Listener active, waiting for User offer...');
            } else {
                addDebug('👤 User: Creating offer...');
                try {
                    const rStream = await makeCall(id, activeStream);
                    addDebug('✅ User: Got remote stream!');
                    setRemoteStream(rStream);
                    setConnectionStatus('connected');
                    toast.success("Connected to Acharya!");
                } catch (e: any) {
                    addDebug(`❌ User makeCall failed: ${e.message}`);
                    setConnectionStatus('failed');
                    toast.error(e?.message || "Could not reach Acharya.");
                }
            }

            // Start Transcription Backup
            // Start continuous speech recognition with auto-restart
            if (!recognitionRef.current && 'webkitSpeechRecognition' in window) {
                recognitionStoppedRef.current = false;
                const SpeechRecognition = (window as any).webkitSpeechRecognition;
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'hi-IN'; // Hindi + English mixed
                recognition.maxAlternatives = 1;

                recognition.onresult = (event: any) => {
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            const text = event.results[i][0].transcript.trim();
                            if (!text) continue;
                            const speaker = participantRole === 'astrologer' ? 'Astrologer' : 'User';
                            const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                            setTranscript(prev => [...prev, { speaker, text, time }]);
                            addTranscriptLine(id, { speaker, text, time });
                        }
                    }
                };

                // Auto-restart when Chrome silently stops (idle timeout, network blip, etc.)
                recognition.onend = () => {
                    if (!recognitionStoppedRef.current) {
                        console.log('🔄 Speech recognition ended, restarting...');
                        try { recognition.start(); } catch (e) { /* already running */ }
                    }
                };

                recognition.onerror = (event: any) => {
                    console.warn('Speech recognition error:', event.error);
                    // Don't restart on 'aborted' (user-initiated) or 'not-allowed' (permission)
                    if (event.error === 'aborted' || event.error === 'not-allowed') return;
                    if (!recognitionStoppedRef.current) {
                        setTimeout(() => {
                            try { recognition.start(); } catch (e) { /* already running */ }
                        }, 1000);
                    }
                };

                recognition.start();
                recognitionRef.current = recognition;
            }

        } catch (err: any) {
            addDebug(`❌ Fatal error: ${err?.message}`);
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
        // Stop speech recognition permanently
        recognitionStoppedRef.current = true;
        if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) { } }

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

                // Auto-email transcript to both participants (Otter.ai style)
                try {
                    const emailRes = await fetch("/api/email/send-transcript", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ consultationId: id })
                    });
                    const emailData = await emailRes.json();
                    if (emailData.success) {
                        console.log("📧 Transcript emailed to both participants");
                        toast.success("📧 Transcript emailed!");
                    } else {
                        console.warn("Email send returned:", emailData);
                    }
                } catch (emailErr) {
                    console.error("Failed to email transcript:", emailErr);
                }

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
                                    <div className="text-center space-y-4 glass p-10 rounded-3xl border border-orange-500/20 max-w-lg">
                                        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                        <p className="text-white font-bold text-lg">Establishing connection...</p>
                                        <p className="text-white/40 text-sm">Connecting to the other participant</p>
                                        {/* Debug Panel */}
                                        <div className="mt-4 text-left bg-black/50 rounded-xl p-4 max-h-40 overflow-y-auto">
                                            <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mb-2">Connection Log</p>
                                            {debugLog.map((log, i) => (
                                                <p key={i} className="text-[11px] text-white/60 font-mono leading-relaxed">{log}</p>
                                            ))}
                                        </div>
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
                            {/* Render Audio or Video Interface based on consultation type */}
                            {consultationType === 'audio' ? (
                                <>
                                    {/* Hidden audio element to play remote stream */}
                                    {remoteStream && (
                                        <audio autoPlay ref={(el) => { if (el && remoteStream) el.srcObject = remoteStream; }} />
                                    )}
                                    <AudioInterface
                                        stream={stream}
                                        micOn={micOn}
                                        onToggleMic={toggleMic}
                                        onDisconnect={handleDisconnect}
                                        userName={user?.displayName || "You"}
                                        astrologerName={remoteName}
                                        timeLeft={timeLeft}
                                    />
                                </>
                            ) : (
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
                            )}
                        </>
                    )}
                </div>
            )}
        </main>
    );
}
