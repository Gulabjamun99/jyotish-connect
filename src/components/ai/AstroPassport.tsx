"use client";

import { motion } from "framer-motion";
import { Star, Share2, Download, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AstroPassportProps {
    userData?: any;
}

export function AstroPassport({ userData }: AstroPassportProps) {
    const primaryProfile = userData?.kundliData?.[0] || {
        name: userData?.name || "Celestial Seeker",
        ascendant: "Leo",
        moonSign: "Aries",
        sunSign: "Sagittarius",
        rank: "Rising Star"
    };

    const cosmicData = [
        { label: "Ascendant", value: primaryProfile.ascendant || "Unknown", icon: "🌅" },
        { label: "Moon Sign", value: primaryProfile.moonSign || "Unknown", icon: "🌙" },
        { label: "Sun Sign", value: primaryProfile.sunSign || "Unknown", icon: "☀️" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-accent" />
                    My Astro-Passport
                </h2>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white">
                        <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white">
                        <Download className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group"
            >
                {/* Card Background & Glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/50 to-primary/50 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                
                <div className="relative glass bg-zinc-900/90 border border-white/10 rounded-[2.5rem] p-8 overflow-hidden">
                    {/* Mystical Background Motifs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[80px] rounded-full -z-10" />
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/10 blur-[100px] rounded-full -z-10" />
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                        {/* Avatar / Profile Seal */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-accent via-white/20 to-primary shadow-2xl">
                                <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center text-4xl font-black text-white relative overflow-hidden">
                                     {primaryProfile.name?.[0]}
                                     <div className="absolute inset-0 bg-gradient-to-b from-transparent to-accent/20" />
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-zinc-900 border border-accent/30 rounded-full flex items-center justify-center shadow-xl">
                                <Zap className="w-5 h-5 text-accent fill-accent" />
                            </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 text-center md:text-left space-y-6 w-full">
                            <div>
                                <h3 className="text-3xl font-black text-white tracking-tight">{primaryProfile.name}</h3>
                                <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                                    <span className="px-3 py-0.5 bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                                        {primaryProfile.rank || "Rising Star"}
                                    </span>
                                    <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                                    <span className="text-xs font-bold text-zinc-500 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> Verified Seeker
                                    </span>
                                </div>
                            </div>

                            {/* Cosmic Stats Table */}
                            <div className="grid grid-cols-3 gap-3">
                                {cosmicData.map((stat, i) => (
                                    <div key={i} className="glass bg-white/5 border border-white/5 p-4 rounded-2xl text-center group/item hover:bg-white/10 transition-colors">
                                        <div className="text-2xl mb-2">{stat.icon}</div>
                                        <div className="text-[9px] uppercase font-black tracking-widest text-zinc-500 mb-1">{stat.label}</div>
                                        <div className="text-xs font-bold text-white truncate">{stat.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Share CTA */}
                            <div className="pt-2">
                                <Button className="w-full bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-widest text-[10px] h-11 rounded-xl shadow-xl">
                                    Share Cosmic Identity
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Footer / ID Number */}
                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em]">
                            Passport # JC-{userData?.uid?.substring(0, 8).toUpperCase() || "TEMP"}
                        </div>
                        <div className="flex items-center gap-1.5 opacity-40">
                            <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
                            <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
                            <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
