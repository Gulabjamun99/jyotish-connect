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
    labels = { local: "You (Local)", remote: "Remote Participant" }
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
        <div className="relative w-full h-full bg-zinc-950 flex flex-col overflow-hidden">
            {/* Main Video Area (Remote/Astrologer) */}
            <div className="flex-1 relative bg-zinc-900 rounded-3xl m-4 overflow-hidden border border-white/10 shadow-2xl">
                {/* Placeholder for remote stream */}
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                    {!remoteStream && !isDemo && (
                        <div className="text-center space-y-4">
                            <div className="w-24 h-24 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center mx-auto text-4xl font-bold animate-pulse">
                                {astrologerName[0]}
                            </div>
                            <p className="text-muted-foreground animate-pulse">Waiting for {astrologerName} to join video...</p>
                            {/* Debug info */}
                            <div className="text-xs text-gray-500 mt-4">
                                <p>Room Status: {typeof window !== 'undefined' && (window as any).__twilioRoom ? 'Connected' : 'Not Connected'}</p>
                                <p>Participants: {typeof window !== 'undefined' && (window as any).__participantCount || 0}</p>
                            </div>
                        </div>
                    )}
                    {isDemo && !remoteStream && (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                            {/* Professional Simulated Feed */}
                            <img
                                src="/acharya_demo.png"
                                alt="Acharya Ravi Singh"
                                className="w-full h-full object-cover opacity-60 mix-blend-luminosity grayscale-[0.2]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-orange-950/40 via-transparent to-black/60" />

                            <div className="relative flex flex-col items-center justify-center space-y-6">
                                <div className="relative w-40 h-40 rounded-full border-4 border-orange-500/50 p-2 shadow-[0_0_50px_rgba(249,115,22,0.3)] animate-pulse">
                                    <div className="w-full h-full rounded-full bg-orange-500/10 flex items-center justify-center text-6xl font-black text-white backdrop-blur-sm">
                                        {astrologerName[0]}
                                    </div>
                                </div>
                                <div className="text-center space-y-1">
                                    <h3 className="text-4xl font-black text-white uppercase tracking-[0.3em] drop-shadow-2xl">
                                        {astrologerName}
                                    </h3>
                                    <div className="flex items-center justify-center gap-2 bg-black/40 px-4 py-1 rounded-full border border-white/10 backdrop-blur-md">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                                        <p className="text-orange-500 font-bold text-[10px] uppercase tracking-widest">Divine Feed Active</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className={`w-full h-full object-cover ${(!remoteStream || isDemo) ? 'hidden' : ''}`}
                    />
                </div>

                {/* Overlays */}
                <div className="absolute top-6 left-6 z-10">
                    <div className="glass px-4 py-2 rounded-full flex items-center gap-2 border-white/10">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">{labels.remote}</span>
                    </div>
                </div>

                <div className="absolute top-6 right-6 z-10">
                    <div className={`glass px-6 py-2 rounded-full font-mono font-bold text-xl border ${timeLeft < 300 ? 'text-red-500 border-red-500/50 animate-pulse' : 'text-primary border-primary/20'
                        }`}>
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Live Captions Overlay (Google Meet Style) */}
                {lastCaption && (
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 max-w-[80%] z-20">
                        <div className="glass bg-black/60 backdrop-blur-md px-8 py-4 rounded-2xl border-white/10 text-center animate-slide-up">
                            <div className="text-[10px] uppercase font-black tracking-widest text-orange-400 mb-1">
                                {lastCaption.speaker}
                            </div>
                            <p className="text-lg font-medium text-white leading-relaxed">
                                {lastCaption.text}
                            </p>
                        </div>
                    </div>
                )}

                {/* PiP View (Local/User) */}
                <div className="absolute bottom-6 right-6 w-48 aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/20 transition-all hover:scale-105 z-20 group">
                    {stream ? (
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className={`w-full h-full object-cover transform scale-x-[-1] ${!videoOn ? 'hidden' : ''}`}
                        />
                    ) : (
                        <div className="w-full h-full bg-zinc-800 flex flex-col items-center justify-center p-4 text-center space-y-3">
                            <VideoOff className="w-6 h-6 text-orange-500/50" />
                            <div className="space-y-1">
                                <p className="text-[10px] text-muted-foreground leading-tight">Camera access is needed for your feed</p>
                                <Button
                                    onClick={onRetryCamera}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-[9px] px-3 bg-white/5 hover:bg-white/10 border-white/10 border-orange-500/20 text-orange-500"
                                >
                                    Enable Camera
                                </Button>
                            </div>
                        </div>
                    )}

                    {!videoOn && stream && (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                                <VideoOff className="w-5 h-5 text-muted-foreground" />
                            </div>
                        </div>
                    )}

                    <div className="absolute bottom-2 left-2 text-[10px] font-black text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 shadow-lg uppercase tracking-wider">
                        {labels.local}
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="h-24 glass border-t border-white/5 flex items-center justify-center gap-6 px-8 backdrop-blur-xl z-30">
                <Button
                    onClick={onToggleMic}
                    variant={micOn ? "outline" : "destructive"}
                    size="icon"
                    className={`w-14 h-14 rounded-full border-white/10 ${micOn ? 'hover:bg-white/5 bg-white/5' : 'bg-red-500 hover:bg-red-600'}`}
                >
                    {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </Button>

                <Button
                    onClick={onToggleVideo}
                    variant={videoOn ? "outline" : "destructive"}
                    size="icon"
                    className={`w-14 h-14 rounded-full border-white/10 ${videoOn ? 'hover:bg-white/5 bg-white/5' : 'bg-red-500 hover:bg-red-600'}`}
                >
                    {videoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </Button>

                <Button
                    onClick={onDisconnect}
                    variant="destructive"
                    size="icon"
                    className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-transform active:scale-95"
                >
                    <PhoneOff className="w-8 h-8" />
                </Button>
            </div>
        </div>
    );
}
