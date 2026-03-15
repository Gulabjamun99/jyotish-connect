import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, Video, ShieldCheck, Languages } from "lucide-react";

export function Hero() {
    return (
        <section className="relative py-12 md:py-20 min-h-[85vh] flex items-center overflow-hidden bg-transparent">
            {/* Background Cosmic Animations (Astro-Vault) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary/10 rounded-full animate-[spin_60s_linear_infinite] pointer-events-none opacity-50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-accent/10 rounded-full animate-[spin_90s_linear_infinite_-45s] pointer-events-none opacity-30" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                    <div className="text-center lg:text-left space-y-8">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-accent/30 glass-accent text-accent text-[11px] font-black uppercase tracking-[0.2em] animate-fade-in mx-auto lg:mx-0 shadow-[0_0_20px_rgba(217,119,6,0.15)]">
                            <Sparkles className="w-3.5 h-3.5" />
                            Vedic Cosmic Masters
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1]">
                            Consult India's Best <br />
                            <span className="text-gradient drop-shadow-lg">
                                Verified Guides
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0 opacity-90 font-medium">
                            Instant cosmic clarity via 100% private video sessions. Navigate career, love, and destiny with our handpicked Acharyas.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                            <Link href="/search">
                                <Button size="lg" className="h-14 px-8 text-base orange-gradient text-white shadow-[0_0_30px_rgba(217,119,6,0.3)] font-black tracking-widest uppercase rounded-2xl hover:scale-105 transition-all">
                                    Connect Now
                                </Button>
                            </Link>
                            <Link href="/horoscope">
                                <Button size="lg" variant="outline" className="h-14 px-8 text-base font-bold rounded-2xl border-primary/20 glass hover:bg-primary/10 text-primary tracking-widest uppercase transition-all">
                                    Daily Cosmic Pulse
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="hidden lg:grid grid-cols-2 gap-6 relative">
                        {/* Center glowing orb for cards */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-accent/20 rounded-full blur-[50px] pointer-events-none" />
                        
                        <div className="space-y-6 translate-y-8">
                            <div className="p-6 h-[180px] glass rounded-3xl border border-white/5 hover:border-accent/30 transition-all duration-500 float-hover hover:-translate-y-2 group">
                                <div className="w-12 h-12 rounded-2xl glass-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Video className="w-6 h-6 text-accent" />
                                </div>
                                <h3 className="font-black text-lg text-white mb-1">Face-to-Face</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">High-definition private video sessions</p>
                            </div>
                            <div className="p-6 h-[180px] glass rounded-3xl border border-white/5 hover:border-primary/30 transition-all duration-500 float-hover hover:-translate-y-2 group" style={{ animationDelay: '1s' }}>
                                <div className="w-12 h-12 rounded-2xl glass-orange flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-black text-lg text-white mb-1">Vedic Verified</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">Rigorous multi-step background checks</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="p-6 h-[180px] glass rounded-3xl border border-white/5 hover:border-primary/30 transition-all duration-500 float-hover hover:-translate-y-2 group" style={{ animationDelay: '0.5s' }}>
                                <div className="w-12 h-12 rounded-2xl glass-orange flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Languages className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="font-black text-lg text-white mb-1">Multilingual</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">Connect natively in 8+ local languages</p>
                            </div>
                            <div className="p-6 h-[180px] glass rounded-3xl border border-white/5 hover:border-accent/30 transition-all duration-500 float-hover hover:-translate-y-2 group" style={{ animationDelay: '1.5s' }}>
                                <div className="w-12 h-12 rounded-2xl glass-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-6 h-6 text-accent" />
                                </div>
                                <h3 className="font-black text-lg text-white mb-1">Astro-GPT AI</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">Context-aware algorithmic insights</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:hidden grid grid-cols-2 gap-3 pt-8 border-t border-white/10 mt-4">
                        <div className="glass p-4 rounded-2xl flex flex-col items-center gap-2 border border-white/5">
                            <div className="w-10 h-10 rounded-xl glass-accent flex items-center justify-center">
                                <Video className="w-5 h-5 text-accent" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-white">Video</span>
                        </div>
                        <div className="glass p-4 rounded-2xl flex flex-col items-center gap-2 border border-white/5">
                            <div className="w-10 h-10 rounded-xl glass-orange flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-white">Verified</span>
                        </div>
                        <div className="glass p-4 rounded-2xl flex flex-col items-center gap-2 border border-white/5">
                            <div className="w-10 h-10 rounded-xl glass-orange flex items-center justify-center">
                                <Languages className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-white">Languages</span>
                        </div>
                        <div className="glass p-4 rounded-2xl flex flex-col items-center gap-2 border border-white/5">
                            <div className="w-10 h-10 rounded-xl glass-accent flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-accent" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-white">Astro-AI</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
