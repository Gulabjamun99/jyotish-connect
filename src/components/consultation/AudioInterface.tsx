"use client";

import { Mic, MicOff, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

interface AudioInterfaceProps {
    stream: MediaStream | null;
    micOn: boolean;
    onToggleMic: () => void;
    onDisconnect: () => void;
    userName: string;
    astrologerName: string;
    timeLeft: number;
}

export function AudioInterface({
    stream,
    micOn,
    onToggleMic,
    onDisconnect,
    userName,
    astrologerName,
    timeLeft
}: AudioInterfaceProps) {
    const [audioLevel, setAudioLevel] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        if (!stream) return;

        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / bufferLength;
            setAudioLevel(average);
            animationRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            audioContext.close();
        };
    }, [stream]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-background via-background to-primary/5 p-8">
            {/* Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Timer */}
            <div className={`glass px-8 py-3 rounded-full font-mono font-bold text-2xl mb-12 border ${timeLeft < 300 ? 'text-red-500 border-red-500/50 animate-pulse' : 'text-primary border-primary/20'
                }`}>
                {formatTime(timeLeft)}
            </div>

            {/* Profile Avatars */}
            <div className="flex items-center gap-24 mb-16 relative">
                {/* User Avatar */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-5xl shadow-2xl border-4 border-white/10">
                            {userName[0]}
                        </div>
                        {/* Audio Level Indicator */}
                        <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-background border-4 border-primary/20 flex items-center justify-center">
                            {micOn ? (
                                <div
                                    className="w-6 h-6 rounded-full bg-green-500"
                                    style={{
                                        transform: `scale(${1 + audioLevel / 200})`,
                                        transition: 'transform 0.1s'
                                    }}
                                />
                            ) : (
                                <MicOff className="w-5 h-5 text-red-500" />
                            )}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-lg">{userName}</div>
                        <div className="text-xs text-muted-foreground">You</div>
                    </div>
                </div>

                {/* Connection Line */}
                <div className="absolute left-1/2 top-16 -translate-x-1/2 flex items-center gap-2">
                    <div className="w-24 h-0.5 bg-gradient-to-r from-blue-500 to-orange-500" />
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <div className="w-24 h-0.5 bg-gradient-to-r from-orange-500 to-blue-500" />
                </div>

                {/* Astrologer Avatar */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-5xl shadow-2xl border-4 border-white/10">
                            {astrologerName[0]}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-background border-4 border-primary/20 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-green-500 animate-pulse" />
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-lg">{astrologerName}</div>
                        <div className="text-xs text-green-500 flex items-center gap-1 justify-center">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            Live
                        </div>
                    </div>
                </div>
            </div>

            {/* Status */}
            <div className="glass px-6 py-3 rounded-full border border-primary/10 mb-12">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                    <span className="text-sm font-bold text-green-500 uppercase tracking-widest">
                        Audio Consultation Active
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6 glass p-5 rounded-[2.5rem] border-white/10 shadow-3xl">
                <Button
                    onClick={onToggleMic}
                    variant={micOn ? "outline" : "destructive"}
                    size="icon"
                    className={`w-16 h-16 rounded-full border-white/10 ${micOn ? 'hover:bg-white/5' : 'bg-red-500/80 hover:bg-red-600'
                        }`}
                >
                    {micOn ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
                </Button>

                <div className="w-px h-10 bg-white/10 mx-2" />

                <Button
                    onClick={onDisconnect}
                    variant="destructive"
                    size="icon"
                    className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-transform active:scale-90"
                >
                    <PhoneOff className="w-9 h-9" />
                </Button>
            </div>
        </div>
    );
}
