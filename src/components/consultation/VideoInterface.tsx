"use client";

import { useRef, useEffect, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoInterfaceProps {
    stream: MediaStream | null;
    remoteStream?: MediaStream | null;
    micOn: boolean;
    videoOn: boolean;
    onToggleMic: () => void;
    onToggleVideo: () => void;
    onDisconnect: () => void;
    userName: string;
    astrologerName: string;
    timeLeft: number;
    transcript?: { speaker: string, text: string, time: string }[];
    isDemo?: boolean;
    onRetryCamera?: () => void;
    labels?: {
        local: string;
        remote: string;
    };
    consultationId?: string;
}

export function VideoInterface({
    stream,
    remoteStream,
    micOn,
    videoOn,
    onToggleMic,
    onToggleVideo,
    onDisconnect,
    userName,
    astrologerName,
    timeLeft,
    transcript = [],
    isDemo = false,
    onRetryCamera,
    labels = { local: "You (Local)", remote: "Remote Participant" },
    consultationId
}: VideoInterfaceProps) {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const [isPiP, setIsPiP] = useState(false);
    const [lastCaption, setLastCaption] = useState<{ speaker: string, text: string } | null>(null);

    useEffect(() => {
        if (localVideoRef.current && stream) {
            localVideoRef.current.srcObject = stream;
        }
    }, [stream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    // Update caption when transcript changes
    useEffect(() => {
        if (transcript.length > 0) {
            const last = transcript[transcript.length - 1];
            setLastCaption({ speaker: last.speaker, text: last.text });

            // Auto-hide caption after 5 seconds of inactivity
            const timer = setTimeout(() => setLastCaption(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [transcript]);

    // Format time helper
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative w-full h-full bg-[#202124] flex flex-col overflow-hidden text-white font-sans">
            {/* Top Bar (Google Meet style) */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/70 to-transparent">
                <div className="flex items-center gap-3">
                    <span className="text-lg font-medium tracking-wide">{astrologerName}</span>
                    <span className="px-2 py-0.5 bg-orange-600/30 text-orange-400 text-xs rounded-full border border-orange-500/20 font-bold uppercase tracking-wider">
                        {isDemo ? "Demo Consultation" : "Live"}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border ${timeLeft < 300 ? 'border-red-500/50 text-red-500' : 'border-white/10 text-white'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${timeLeft < 300 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                        <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
                    </div>
                </div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 relative flex items-center justify-center p-4">
                {/* Remote Video / Audio Visualizer */}
                <div className="relative w-full h-full max-w-6xl max-h-[85vh] bg-[#3c4043] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">

                    {/* Remote Video Stream */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        {(!remoteStream && !isDemo) ? (
                            <div className="flex flex-col items-center justify-center space-y-6 animate-pulse">
                                <div className="w-24 h-24 rounded-full bg-orange-500 flex items-center justify-center text-4xl font-bold text-white shadow-xl">
                                    {astrologerName[0]}
                                </div>
                                <p className="text-gray-300 font-medium tracking-wide">Waiting for {astrologerName} to join...</p>
                            </div>
                        ) : (
                            <>
                                {isDemo ? (
                                    <div className="relative w-full h-full">
                                        <img
                                            src="/acharya_demo.png"
                                            className="w-full h-full object-cover opacity-80"
                                            alt="Demo"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {/* Audio Waves Simulation for Demo */}
                                            <div className="flex items-center justify-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-2 bg-white/80 rounded-full animate-bounce"
                                                        style={{
                                                            height: '40px',
                                                            animationDuration: `${0.8 + i * 0.1}s`
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <video
                                        ref={remoteVideoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-contain"
                                    />
                                )}
                            </>
                        )}
                    </div>

                    {/* Captions Overlay */}
                    {lastCaption && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 max-w-2xl w-full px-6">
                            <div className="bg-black/70 backdrop-blur-md p-4 rounded-xl text-center space-y-1 transform transition-all hover:scale-105">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <img
                                        src={lastCaption.speaker === 'Astrologer' ? "/acharya_demo.png" : "https://api.dicebear.com/7.x/avataaars/svg?seed=" + userName}
                                        className="w-6 h-6 rounded-full border border-white/20"
                                        alt="Speaker"
                                    />
                                    <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                                        {lastCaption.speaker}
                                    </span>
                                </div>
                                <p className="text-white text-lg font-medium leading-relaxed">
                                    {lastCaption.text}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Remote Name Label */}
                    <div className="absolute bottom-4 left-4">
                        <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-md text-sm font-medium text-white select-none">
                            {astrologerName}
                        </div>
                    </div>
                </div>

                {/* Local User PiP */}
                <div className="absolute bottom-8 right-8 w-64 aspect-video bg-[#3c4043] rounded-xl overflow-hidden shadow-2xl border border-white/10 group transition-all hover:w-80 hover:z-50 cursor-pointer">
                    {stream ? (
                        <>
                            {videoOn ? (
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover transform scale-x-[-1]"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#202124]">
                                    <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                                        {userName[0]}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                            <div className="w-12 h-12 rounded-full bg-zinc-700 animate-pulse" />
                        </div>
                    )}
                    <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-xs font-medium">You</div>
                </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="h-20 bg-[#202124] flex items-center justify-between px-8 border-t border-white/5 relative z-30">
                <div className="flex-1 flex justify-start text-white/50 text-sm font-medium">
                    {/* Left details */}
                    <span className="hidden md:inline">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {consultationId ? `| ${consultationId}` : ''}</span>
                </div>

                <div className="flex-1 flex items-center justify-center gap-4">
                    <Button
                        onClick={onToggleMic}
                        className={`w-12 h-12 rounded-full border-none transition-all duration-300 ${micOn ? 'bg-[#3c4043] hover:bg-[#4d5155] text-white' : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                    >
                        {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </Button>

                    <Button
                        onClick={onToggleVideo}
                        className={`w-12 h-12 rounded-full border-none transition-all duration-300 ${videoOn ? 'bg-[#3c4043] hover:bg-[#4d5155] text-white' : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                    >
                        {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    </Button>

                    <Button
                        onClick={onDisconnect}
                        className="w-16 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white px-6 shadow-lg shadow-red-900/20"
                    >
                        <PhoneOff className="w-6 h-6 fill-current" />
                    </Button>
                </div>

                <div className="flex-1 flex justify-end gap-3">
                    <Button variant="ghost" size="icon" className="text-white/70 hover:bg-white/10 rounded-full">
                        <Maximize2 className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
