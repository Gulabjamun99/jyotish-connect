import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, Video, ShieldCheck, Languages } from "lucide-react";

const PLANETS = [
    { name: "Sun",     symbol: "☀", color: "#FCD34D", size: 14, orbit: 90,  speed: 50,  startDeg: 0   },
    { name: "Moon",    symbol: "☽", color: "#E2E8F0", size: 8,  orbit: 120, speed: 20,  startDeg: 40  },
    { name: "Mars",    symbol: "♂", color: "#F87171", size: 9,  orbit: 155, speed: 38,  startDeg: 140 },
    { name: "Mercury", symbol: "☿", color: "#A78BFA", size: 7,  orbit: 185, speed: 15,  startDeg: 220 },
    { name: "Jupiter", symbol: "♃", color: "#FDBA74", size: 13, orbit: 220, speed: 75,  startDeg: 70  },
    { name: "Venus",   symbol: "♀", color: "#F9A8D4", size: 9,  orbit: 255, speed: 30,  startDeg: 310 },
    { name: "Saturn",  symbol: "♄", color: "#86EFAC", size: 11, orbit: 292, speed: 110, startDeg: 170 },
    { name: "Rahu",    symbol: "☊", color: "#94A3B8", size: 6,  orbit: 65,  speed: 65,  startDeg: 260 },
    { name: "Ketu",    symbol: "☋", color: "#CBD5E1", size: 6,  orbit: 330, speed: 140, startDeg: 80  },
];

export function Hero() {
    return (
        <section className="relative py-12 md:py-20 min-h-[85vh] flex items-center overflow-hidden bg-transparent">

            {/* ── Cosmic Background Layer ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">

                {/* Starfield dots via SVG */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    {[...Array(60)].map((_, i) => (
                        <circle
                            key={i}
                            cx={`${(i * 17 + 5) % 100}%`}
                            cy={`${(i * 23 + 7) % 100}%`}
                            r={i % 4 === 0 ? "1.2" : "0.6"}
                            fill="white"
                            opacity={0.2 + (i % 5) * 0.1}
                        />
                    ))}
                </svg>

                {/* Central nebula glows */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-indigo-600/10 blur-[80px]" style={{ animation: 'pulse 6s ease-in-out infinite' }} />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-orange-500/8 blur-[60px]" style={{ animation: 'pulse 4s ease-in-out infinite 2s' }} />

                {/* Planet orbit system — centered in viewport */}
                <div className="absolute left-1/2 top-1/2" style={{ width: 0, height: 0 }}>

                    {/* Orbit ring circles */}
                    {PLANETS.map((p) => (
                        <div
                            key={`orbit-${p.name}`}
                            className="absolute rounded-full border"
                            style={{
                                width: p.orbit * 2,
                                height: p.orbit * 2,
                                top: -p.orbit,
                                left: -p.orbit,
                                borderColor: 'rgba(255,255,255,0.04)',
                                borderStyle: 'dashed',
                                borderWidth: 1,
                            }}
                        />
                    ))}

                    {/* Animated planets */}
                    {PLANETS.map((p) => (
                        <div
                            key={p.name}
                            className="absolute"
                            style={{
                                width: 0,
                                height: 0,
                                top: 0,
                                left: 0,
                                animation: `planet-orbit-${p.name} ${p.speed}s linear infinite`,
                            }}
                        >
                            {/* Planet dot with glow */}
                            <div
                                style={{
                                    position: 'absolute',
                                    width: p.size,
                                    height: p.size,
                                    borderRadius: '50%',
                                    background: p.color,
                                    top: -p.orbit - p.size / 2,
                                    left: -p.size / 2,
                                    boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                                    opacity: 0.85,
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Slow outer ring */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" style={{ width: 700, height: 700, animation: 'spin 120s linear infinite' }} />

                {/* Inject keyframes via style tag */}
                <style>{`
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    ${PLANETS.map(p => `
                    @keyframes planet-orbit-${p.name} {
                        from { transform: rotate(${p.startDeg}deg); }
                        to   { transform: rotate(${p.startDeg + 360}deg); }
                    }`).join('')}
                `}</style>
            </div>

            {/* ── Hero Content ── */}
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                    <div className="text-center lg:text-left space-y-8">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-accent/30 glass-accent text-accent text-[11px] font-black uppercase tracking-[0.2em] animate-fade-in mx-auto lg:mx-0 shadow-[0_0_20px_rgba(217,119,6,0.15)]">
                            <Sparkles className="w-3.5 h-3.5" /> Vedic Cosmic Masters
                        </div>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1]">
                            Consult India's Best <br />
                            <span className="text-gradient drop-shadow-lg">Verified Guides</span>
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
                        {[
                            { icon: Video, label: 'Video', cls: 'glass-accent', color: 'text-accent' },
                            { icon: ShieldCheck, label: 'Verified', cls: 'glass-orange', color: 'text-primary' },
                            { icon: Languages, label: 'Languages', cls: 'glass-orange', color: 'text-primary' },
                            { icon: Sparkles, label: 'Astro-AI', cls: 'glass-accent', color: 'text-accent' },
                        ].map(({ icon: Icon, label, cls, color }) => (
                            <div key={label} className="glass p-4 rounded-2xl flex flex-col items-center gap-2 border border-white/5">
                                <div className={`w-10 h-10 rounded-xl ${cls} flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${color}`} />
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-widest text-white">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
