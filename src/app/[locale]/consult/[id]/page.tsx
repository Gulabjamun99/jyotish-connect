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
    const rawRole = searchParams.get("role") || role || "user";
    const participantRole = rawRole === "admin" ? "astrologer" : rawRole;

    // Connection States
    const [isJoined, setIsJoined] = useState(false); // Lobby vs Room state
    const [room, setRoom] = useState<any>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [participants, setParticipants] = useState<any[]>([]);

    // Media States
    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(consultationType === "video");
    const [showPermissionGuide, setShowPermissionGuide] = useState(false); // Permission Guide State
    const [permissionDenied, setPermissionDenied] = useState(false); // Track blocked permissions

    // Presence States
    const [isRemoteOnline, setIsRemoteOnline] = useState(false);
    const [remoteName, setRemoteName] = useState(participantRole === 'astrologer' ? "User" : "Acharya");
    const [astrologerName, setAstrologerName] = useState(participantRole === 'astrologer' ? (user?.displayName || "Acharya") : "Acharya");
    const [seekerName, setSeekerName] = useState(participantRole === 'astrologer' ? "Seeker" : (user?.displayName || "Seeker"));
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
            // Get Local Media (Skip for chat)
            if (consultationType !== "chat") {
                try {
                    if (!navigator.mediaDevices) {
                        throw new Error("WebRTC media devices are not supported in this browser context (or requires HTTPS).");
                    }
                    const localStream = await navigator.mediaDevices.getUserMedia({
                        video: consultationType === "video",
                        audio: true
                    });
                    setStream(localStream);
                    setPermissionDenied(false);
                } catch (err: any) {
                    console.warn("Media access failed:", err);
                    const isPermissionErr = err.name === 'NotAllowedError' || err.message?.includes('permission') || err.message?.includes('denied') || err.name === 'PermissionDeniedError';
                    if (isPermissionErr) {
                        setPermissionDenied(true);
                        setShowPermissionGuide(true);
                    }
                    toast.error(err.message || "Please allow camera/mic access");
                }
            }

            if (!db) {
                console.warn("Firestore database is null. Bypassing presence check.");
                toast.error("Database connection unavailable.");
                return;
            }

            // 1. Fetch metadata from the bookings collection
            if (id) {
                try {
                    const bookingSnap = await getDoc(doc(db, "bookings", id));
                    if (bookingSnap.exists()) {
                        const bookingData = bookingSnap.data();
                        if (bookingData.astrologerName) {
                            setAstrologerName(bookingData.astrologerName);
                            if (participantRole !== 'astrologer') {
                                setRemoteName(bookingData.astrologerName);
                            }
                        }
                        if (bookingData.userName) {
                            setSeekerName(bookingData.userName);
                            if (participantRole === 'astrologer') {
                                setRemoteName(bookingData.userName);
                            }
                        }
                    }
                } catch (bookingErr) {
                    console.warn("Failed to fetch booking metadata:", bookingErr);
                }
            }

            // 2. Fetch directly from the astrologers collection if astrologer param is present
            const astrologerIdParam = searchParams.get("astrologer");
            if (astrologerIdParam) {
                try {
                    const astroSnap = await getDoc(doc(db, "astrologers", astrologerIdParam));
                    if (astroSnap.exists()) {
                        const astroData = astroSnap.data();
                        const name = astroData.name || astroData.displayName || "Acharya";
                        setAstrologerName(name);
                        if (participantRole !== 'astrologer') {
                            setRemoteName(name);
                        }
                    }
                } catch (e) {
                    console.warn("Failed to fetch astrologer profile details:", e);
                }
            }

            try {
                // Sync Presence to Firestore
                const presenceRef = doc(db, "consultations", id);

                // Mark myself as present in lobby
                await setDoc(presenceRef, {
                    [participantRole === 'astrologer' ? 'astrologerPresent' : 'userPresent']: true,
                    [participantRole === 'astrologer' ? 'astrologerName' : 'userName']: user?.displayName || (participantRole === 'astrologer' ? 'Acharya' : 'User'),
                    [participantRole === 'astrologer' ? 'astrologerEmail' : 'userEmail']: user?.email || '',
                    type: consultationType
                }, { merge: true });

                // Listen for other participant & live transcript/chat messages
                const unsubscribe = onSnapshot(presenceRef, (doc) => {
                    if (doc.exists()) {
                        const data = doc.data();
                        const targetKey = participantRole === 'astrologer' ? 'userPresent' : 'astrologerPresent';
                        const nameKey = participantRole === 'astrologer' ? 'userName' : 'astrologerName';

                        setIsRemoteOnline(!!data[targetKey]);
                        if (data[nameKey]) setRemoteName(data[nameKey]);

                        // Sync messages from transcript dynamically in Chat Mode
                        if (data.transcript && Array.isArray(data.transcript)) {
                            const mappedMessages = data.transcript.map((entry: any, index: number) => {
                                const isAstro = entry.role === 'astrologer' || 
                                                entry.role === 'admin' ||
                                                (entry.role !== 'user' && (
                                                    entry.speaker === astrologerName || 
                                                    entry.speaker?.toLowerCase() === 'astrologer' ||
                                                    entry.speaker?.toLowerCase()?.includes('acharya') ||
                                                    entry.speaker?.toLowerCase()?.includes('purohit')
                                                ));
                                return {
                                    id: entry.id || `${index}_${entry.time}`,
                                    sender: isAstro ? 'astrologer' : 'user',
                                    senderName: entry.speaker,
                                    senderId: entry.senderId || (isAstro ? 'astrologer' : 'user'),
                                    text: entry.text,
                                    time: entry.time
                                };
                            });
                            setMessages(mappedMessages);
                        }
                    }
                });

                return () => unsubscribe();
            } catch (firestoreErr) {
                console.error("Firestore presence sync failed:", firestoreErr);
            }
        };

        setupLobby();
    }, [authLoading, id, consultationType, participantRole, user]);


    // 2. Join Room Logic (Called when "Join Now" clicked)
    const handleJoinRoom = async () => {
        setIsJoined(true);
        setConnectionStatus('connecting');
        addDebug(`Role: ${participantRole}, Room: ${id}`);
        toast.success("Joining Heavenly Room...");

        if (!db) {
            addDebug('❌ Firestore is not initialized');
            toast.error("Database connection unavailable.");
            setConnectionStatus('failed');
            return;
        }

        // Mark as joined in Firestore (using setDoc merge — never fails on missing doc)
        try {
            await setDoc(doc(db, "consultations", id), {
                [participantRole === 'astrologer' ? 'astrologerJoined' : 'userJoined']: true
            }, { merge: true });
            addDebug('✅ Marked joined in Firestore');
        } catch (e: any) {
            addDebug(`❌ Firestore join failed: ${e.message}`);
        }

        // 1. Text-Only Chat Bypass: skip WebRTC entirely
        if (consultationType === "chat") {
            addDebug('💬 Chat consultation: Bypassing WebRTC streams.');
            setConnectionStatus('connected');
            return;
        }

        // If stream is null, retry getting media access
        let activeStream = stream;
        if (!activeStream) {
            addDebug('⚠️ No stream yet, retrying camera/mic...');
            try {
                if (!navigator.mediaDevices) {
                    throw new Error("WebRTC media devices are not supported in this browser context.");
                }
                activeStream = await navigator.mediaDevices.getUserMedia({
                    video: consultationType === "video",
                    audio: true
                });
                setStream(activeStream);
                setPermissionDenied(false);
                addDebug(`✅ Media retry succeeded (tracks: ${activeStream.getTracks()?.length || 0})`);
            } catch (mediaErr: any) {
                addDebug(`⚠️ Media retry failed: ${mediaErr.message}`);
                // Try audio-only fallback
                try {
                    activeStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                    setStream(activeStream);
                    setVideoOn(false);
                    setPermissionDenied(false);
                    addDebug('✅ Audio-only fallback succeeded');
                    toast('Camera denied — joining with audio only', { icon: '🎙️' });
                } catch (audioErr: any) {
                    addDebug(`❌ All media failed: ${audioErr.message}`);
                    setPermissionDenied(true);
                    setShowPermissionGuide(true);
                    toast.error("Camera/mic blocked. Joining in listen-only mode.", { duration: 6000 });
                    // Create a silent audio track so WebRTC SDP negotiation
                    // still includes audio direction — otherwise the remote side
                    // cannot send us audio either (no audio m-line in SDP).
                    try {
                        const ctx = new AudioContext();
                        const oscillator = ctx.createOscillator();
                        const dst = ctx.createMediaStreamDestination();
                        oscillator.connect(dst);
                        oscillator.start();
                        // The oscillator produces a tone, but we mute it via gain
                        const gainNode = ctx.createGain();
                        gainNode.gain.value = 0;
                        oscillator.disconnect();
                        oscillator.connect(gainNode);
                        gainNode.connect(dst);
                        activeStream = dst.stream;
                        addDebug('✅ Created silent audio placeholder for SDP negotiation');
                    } catch (silentErr) {
                        // Last resort: truly empty stream
                        activeStream = new MediaStream();
                        addDebug('⚠️ Even silent audio failed, using empty stream');
                    }
                    setStream(activeStream);
                }
            }
        }
        addDebug(`✅ Media stream ready (tracks: ${activeStream ? activeStream.getTracks()?.length : 0})`);

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
                            addTranscriptLine(id, { 
                                speaker, 
                                text, 
                                time,
                                role: participantRole,
                                senderId: user?.uid || 'anonymous'
                            } as any);
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
        if (!isJoined || !isRemoteOnline || consultationType === 'chat') return; // Only start timer after BOTH join and NOT in Chat Mode

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
            setPermissionDenied(false);
            toast.success("Camera restored");
        } catch (e) {
            toast.error("Still no camera access");
        }
    };

    const handleSendMessage = (message: any) => {
        setMessages(prev => [...prev, message]);
        // Normalize admin role to astrologer for transcript consistency
        const normalizedRole = participantRole === 'admin' ? 'astrologer' : participantRole;
        addTranscriptLine(id, {
            speaker: message.senderName,
            text: message.text,
            time: message.time,
            role: normalizedRole,
            senderId: user?.uid || 'anonymous'
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
                        userName={seekerName || "Seeker"}
                        astrologerName={astrologerName || "Acharya"}
                        onSendMessage={handleSendMessage}
                        messages={messages}
                        timeLeft={timeLeft}
                        onEndSession={handleDisconnect}
                        participantRole={participantRole}
                        userId={user?.uid || 'anonymous'}
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
                            onShowPermissionGuide={() => setShowPermissionGuide(true)}
                            permissionDenied={permissionDenied}
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
                                <AudioInterface
                                    stream={stream}
                                    remoteStream={remoteStream}
                                    micOn={micOn}
                                    onToggleMic={toggleMic}
                                    onDisconnect={handleDisconnect}
                                    userName={user?.displayName || "You"}
                                    astrologerName={remoteName}
                                    timeLeft={timeLeft}
                                />
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

            {/* Render the Permission Guide Overlay when showPermissionGuide is true */}
            {showPermissionGuide && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 overflow-y-auto">
                    <div className="relative w-full max-w-2xl bg-zinc-950/80 border border-orange-500/30 rounded-[2.5rem] shadow-[0_0_50px_rgba(249,115,22,0.25)] p-6 md:p-10 text-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
                        {/* Upper golden accent bar */}
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-red-500" />
                        
                        {/* Starry background glow */}
                        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 blur-[100px] rounded-full -z-10" />
                        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/10 blur-[100px] rounded-full -z-10" />

                        {/* Title and Icon */}
                        <div className="text-center space-y-3 mb-6 relative">
                            <div className="w-16 h-16 mx-auto bg-orange-500/15 rounded-2xl flex items-center justify-center border border-orange-500/30 text-2xl animate-pulse">
                                🔮
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-300">
                                Restore Cosmic Senses
                            </h2>
                            <p className="text-sm text-zinc-400 max-w-md mx-auto italic">
                                Camera and Microphone permissions are currently blocked by your browser/device settings. Choose your device below to restore connection:
                            </p>
                        </div>

                        {/* Tab Content / Grid for Instructions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 overflow-y-auto pr-1">
                            {/* Safari / iPhone Guide */}
                            <div className="glass bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] flex flex-col space-y-4">
                                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                                    <span className="text-2xl">🍎</span>
                                    <div>
                                        <h3 className="font-bold text-sm text-white">iPhone / Safari</h3>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Apple iOS</p>
                                    </div>
                                </div>
                                <ol className="space-y-3 text-xs text-zinc-300 list-decimal list-inside font-medium leading-relaxed">
                                    <li>Tap the <span className="font-bold text-orange-400">"aA"</span> icon on the left of Safari search bar.</li>
                                    <li>Select <span className="font-bold text-orange-400">Website Settings</span> from the menu.</li>
                                    <li>Change <span className="font-bold text-white">Camera</span> and <span className="font-bold text-white">Microphone</span> from 'Ask' or 'Deny' to <span className="font-bold text-green-400">Allow</span>.</li>
                                    <li>Tap Done & reload this page.</li>
                                </ol>
                            </div>

                            {/* Chrome / Android Guide */}
                            <div className="glass bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] flex flex-col space-y-4">
                                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                                    <span className="text-2xl">🤖</span>
                                    <div>
                                        <h3 className="font-bold text-sm text-white">Android / Chrome</h3>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Google Android</p>
                                    </div>
                                </div>
                                <ol className="space-y-3 text-xs text-zinc-300 list-decimal list-inside font-medium leading-relaxed">
                                    <li>Tap the <span className="font-bold text-orange-400">settings / lock 🔒</span> icon next to the website URL.</li>
                                    <li>Select <span className="font-bold text-orange-400">Permissions</span> or <span className="font-bold text-orange-400">Site Settings</span>.</li>
                                    <li>Toggle both <span className="font-bold text-white">Camera</span> and <span className="font-bold text-white">Microphone</span> to <span className="font-bold text-green-400">Allowed</span>.</li>
                                    <li>Reload this page.</li>
                                </ol>
                            </div>
                        </div>

                        {/* Note about private tabs */}
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-[11px] text-orange-200 text-center italic mt-2">
                            ⚠️ Note: If you are in Incognito/Private mode, browser restrictions might block cameras automatically. Try opening this page in a normal browser tab.
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/5 mt-6 shrink-0">
                            <Button
                                onClick={() => window.location.reload()}
                                className="flex-1 h-12 bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg"
                            >
                                🔄 Reload Sanctuary Page
                            </Button>
                            <Button
                                onClick={() => setShowPermissionGuide(false)}
                                variant="ghost"
                                className="h-12 border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                            >
                                💬 Continue as listen-only
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
