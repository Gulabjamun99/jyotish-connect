import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, Video, ShieldCheck, Languages } from "lucide-react";

// Planet data for cosmic background animation
const PLANETS = [
    { name: "Sun",     color: "#FCD34D", glow: "rgba(252,211,77,0.4)",  size: 22, orbit: 180, speed: 60,  startAngle: 0   },
    { name: "Moon",    color: "#E2E8F0", glow: "rgba(226,232,240,0.3)", size: 9,  orbit: 240, speed: 25,  startAngle: 45  },
    { name: "Mars",    color: "#F87171", glow: "rgba(248,113,113,0.4)", size: 11, orbit: 300, speed: 45,  startAngle: 120 },
    { name: "Mercury", color: "#A78BFA", glow: "rgba(167,139,250,0.3)", size: 8,  orbit: 350, speed: 18,  startAngle: 200 },
    { name: "Jupiter", color: "#FDBA74", glow: "rgba(253,186,116,0.3)", size: 18, orbit: 420, speed: 90,  startAngle: 280 },
    { name: "Venus",   color: "#F9A8D4", glow: "rgba(249,168,212,0.3)", size: 12, orbit: 490, speed: 35,  startAngle: 330 },
    { name: "Saturn",  color: "#86EFAC", glow: "rgba(134,239,172,0.25)",size: 15, orbit: 560, speed: 120, startAngle: 60  },
    { name: "Rahu",    color: "#94A3B8", glow: "rgba(148,163,184,0.2)", size: 7,  orbit: 140, speed: 80,  startAngle: 160 },
    { name: "Ketu",    color: "#CBD5E1", glow: "rgba(203,213,225,0.2)", size: 7,  orbit: 620, speed: 150, startAngle: 240 },
];

export function Hero() {
    return (
        <section className="relative py-12 md:py-20 min-h-[85vh] flex items-center overflow-hidden bg-transparent">

            {/* ─── Cosmic Background ─── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">

                {/* Star field */}
                <div className="absolute inset-0 opacity-60"
                    style={{
                        backgroundImage: `
                            radial-gradient(circle at 15% 20%, rgba(255,255,255,0.7) 1px, transparent 1px),
                            radial-gradient(circle at 40% 75%, rgba(255,255,255,0.6) 1px, transparent 1px),
                            radial-gradient(circle at 60% 10%, rgba(255,255,255,0.8) 1px, transparent 1px),
                            radial-gradient(circle at 80% 40%, rgba(255,255,255,0.5) 1px, transparent 1px),
                            radial-gradient(circle at 25% 55%, rgba(255,255,255,0.7) 1px, transparent 1px),
                            radial-gradient(circle at 70% 85%, rgba(255,255,255,0.6) 1px, transparent 1px),
                            radial-gradient(circle at 90% 15%, rgba(255,255,255,0.8) 1px, transparent 1px),
                            radial-gradient(circle at 5%  90%, rgba(255,255,255,0.5) 1px, transparent 1px),
                            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 1px, transparent 1px),
                            radial-gradient(circle at 35% 30%, rgba(255,255,255,0.7) 1px, transparent 1px),
                            radial-gradient(circle at 55% 65%, rgba(255,255,255,0.6) 1px, transparent 1px),
                            radial-gradient(circle at 85% 70%, rgba(255,255,255,0.5) 1px, transparent 1px)
                        `,
                        backgroundSize: '100% 100%'
                    }}
                />

                {/* SVG Planetary System */}
                <svg
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[1400px]"
                    viewBox="-350 -350 700 700"
                    style={{ opacity: 0.85 }}
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        {PLANETS.map((p) => (
                            <radialGradient key={p.name} id={`glow-${p.name}`} cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor={p.color} stopOpacity="0.9" />
                                <stop offset="100%" stopColor={p.color} stopOpacity="0" />
                            </radialGradient>
                        ))}
                        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="rgba(99,102,241,0.15)" />
                            <stop offset="100%" stopColor="transparent" />
                        </radialGradient>
                    </defs>

                    {/* Central glow */}
                    <circle cx="0" cy="0" r="80" fill="url(#centerGlow)" />

                    {/* Orbit rings */}
                    {PLANETS.map((p) => (
                        <circle
                            key={`orbit-${p.name}`}
                            cx="0" cy="0"
                            r={p.orbit / 2}
                            fill="none"
                            stroke="rgba(255,255,255,0.04)"
                            strokeWidth="0.5"
                            strokeDasharray="3 6"
                        />
                    ))}

                    {/* Animated planets */}
                    {PLANETS.map((p) => {
                        const r = p.orbit / 2;
                        const circumference = 2 * Math.PI * r;
                        const dur = `${p.speed}s`;
                        const startRad = (p.startAngle * Math.PI) / 180;
                        const sx = Math.cos(startRad) * r;
                        const sy = Math.sin(startRad) * r;
                        return (
                            <g key={p.name}>
                                {/* Glow halo */}
                                <circle
                                    cx={sx} cy={sy}
                                    r={p.size * 2.2}
                                    fill={`url(#glow-${p.name})`}
                                    opacity="0.5"
                                >
                                    <animateMotion
                                        dur={dur}
                                        repeatCount="indefinite"
                                        path={`M ${sx} ${sy} A ${r} ${r} 0 1 1 ${sx - 0.001} ${sy}`}
                                    />
                                </circle>
                                {/* Planet body */}
                                <circle
                                    cx={sx} cy={sy}
                                    r={p.size / 2}
                                    fill={p.color}
                                    opacity="0.9"
                                >
                                    <animateMotion
                                        dur={dur}
                                        repeatCount="indefinite"
                                        path={`M ${sx} ${sy} A ${r} ${r} 0 1 1 ${sx - 0.001} ${sy}`}
                                    />
                                </circle>
                                {/* Saturn ring (special) */}
                                {p.name === "Saturn" && (
                                    <ellipse cx={sx} cy={sy} rx={p.size * 0.9} ry={p.size * 0.25}
                                        fill="none" stroke="#86EFAC" strokeWidth="1.2" opacity="0.5"
                                    >
                                        <animateMotion
                                            dur={dur}
                                            repeatCount="indefinite"
                                            path={`M ${sx} ${sy} A ${r} ${r} 0 1 1 ${sx - 0.001} ${sy}`}
                                        />
                                    </ellipse>
                                )}
                                {/* Planet label */}
                                <text
                                    x={sx} y={sy}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontSize="4"
                                    fill={p.color}
                                    opacity="0.7"
                                    fontFamily="system-ui"
                                    style={{ userSelect: 'none' }}
                                >
                                    {p.name}
                                    <animateMotion
                                        dur={dur}
                                        repeatCount="indefinite"
                                        path={`M ${sx} ${sy} A ${r} ${r} 0 1 1 ${sx - 0.001} ${sy}`}
                                    />
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {/* Outer slow spinning ring */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-indigo-500/8 rounded-full animate-[spin_120s_linear_infinite]" />
                
                {/* Central nebula glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-600/8 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] bg-primary/10 rounded-full blur-[60px] animate-pulse" style={{ animationDuration: '4s', animationDelay: '2s' }} />
            </div>

            {/* ─── Content ─── */}
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

                    {/* Feature cards — right column */}
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

                    {/* Mobile feature pills */}
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
