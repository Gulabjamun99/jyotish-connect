"use client";

import { useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, Sparkles, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LobbyInterfaceProps {
    stream: MediaStream | null;
    micOn: boolean;
    videoOn: boolean;
    onToggleMic: () => void;
    onToggleVideo: () => void;
    onJoin: () => void;
    participantRole: string;
    remoteParticipantName: string; // "Acharya Ravi" or "User"
    isRemoteParticipantOnline: boolean; // Real-time status
    userName: string;
}

export function LobbyInterface({
    stream,
    micOn,
    videoOn,
    onToggleMic,
    onToggleVideo,
    onJoin,
    participantRole,
    remoteParticipantName,
    isRemoteParticipantOnline,
    userName
}: LobbyInterfaceProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-900/10 via-black to-black -z-10" />

            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                {/* Left: Video Preview */}
                <div className="relative aspect-video bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
                    {stream ? (
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-500 ${videoOn ? 'opacity-100' : 'opacity-0'}`}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin" />
                        </div>
                    )}

                    {!videoOn && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10">
                            <div className="w-24 h-24 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
                                <span className="text-4xl font-bold text-orange-500">{userName[0]}</span>
                            </div>
                            <p className="text-white/40 font-medium">Camera is off</p>
                        </div>
                    )}

                    {/* Controls Overlay */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-20">
                        <Button
                            variant={micOn ? "secondary" : "destructive"}
                            size="icon"
                            className={`w-14 h-14 rounded-full shadow-lg backdrop-blur-md border border-white/10 ${micOn ? 'bg-white/10 hover:bg-white/20' : ''}`}
                            onClick={onToggleMic}
                        >
                            {micOn ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6" />}
                        </Button>
                        <Button
                            variant={videoOn ? "secondary" : "destructive"}
                            size="icon"
                            className={`w-14 h-14 rounded-full shadow-lg backdrop-blur-md border border-white/10 ${videoOn ? 'bg-white/10 hover:bg-white/20' : ''}`}
                            onClick={onToggleVideo}
                        >
                            {videoOn ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6" />}
                        </Button>
                    </div>

                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                        <span className="text-xs font-bold text-white/80">{userName} (You)</span>
                    </div>
                </div>

                {/* Right: Meeting Info & Join */}
                <div className="space-y-8 text-center md:text-left">
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                            Ready to join?
                        </h1>
                        <p className="text-white/40 font-medium">
                            {participantRole === 'astrologer'
                                ? "Your devotee is waiting for your guidance."
                                : "Acharya is ready to illuminate your path."}
                        </p>
                    </div>

                    {/* Status Card */}
                    <div className={`p-6 rounded-2xl border transition-all duration-500 ${isRemoteParticipantOnline
                        ? 'bg-green-500/5 border-green-500/20'
                        : 'bg-orange-500/5 border-orange-500/20'}`}>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isRemoteParticipantOnline ? 'bg-green-500/10' : 'bg-orange-500/10'}`}>
                                    <User className={`w-6 h-6 ${isRemoteParticipantOnline ? 'text-green-500' : 'text-orange-500'}`} />
                                </div>
                                {isRemoteParticipantOnline && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full animate-pulse" />
                                )}
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-0.5">
                                    {remoteParticipantName}
                                </p>
                                <p className={`text-lg font-bold ${isRemoteParticipantOnline ? 'text-green-400' : 'text-orange-400'}`}>
                                    {isRemoteParticipantOnline ? "Is in the room" : "Has not joined yet"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            className="w-full h-16 text-lg font-bold rounded-2xl orange-gradient hover:scale-[1.02] transition-transform shadow-2xl shadow-orange-500/20"
                            onClick={onJoin}
                        >
                            <Sparkles className="w-5 h-5 mr-3 animate-pulse" />
                            Join Now
                        </Button>
                        <p className="text-xs text-white/20 text-center font-medium">
                            <ShieldCheck className="w-3 h-3 inline mr-1" />
                            End-to-End Encrypted Session
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
