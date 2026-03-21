import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, Video, ShieldCheck, Languages } from "lucide-react";

const PLANETS = [
    { name: "Mercury", symbol: "☿", color: "#A78BFA", size: 6,  orbit: 100, speed: 15,  startDeg: 220 },
    { name: "Venus",   symbol: "♀", color: "#F9A8D4", size: 8,  orbit: 135, speed: 30,  startDeg: 310 },
    { name: "Moon",    symbol: "☽", color: "#E2E8F0", size: 7,  orbit: 170, speed: 20,  startDeg: 40  },
    { name: "Mars",    symbol: "♂", color: "#F87171", size: 9,  orbit: 210, speed: 38,  startDeg: 140 },
    { name: "Jupiter", symbol: "♃", color: "#FDBA74", size: 14, orbit: 260, speed: 75,  startDeg: 70  },
    { name: "Saturn",  symbol: "♄", color: "#86EFAC", size: 12, orbit: 320, speed: 110, startDeg: 170 },
    { name: "Rahu",    symbol: "☊", color: "#94A3B8", size: 5,  orbit: 370, speed: 65,  startDeg: 260 },
    { name: "Ketu",    symbol: "☋", color: "#CBD5E1", size: 5,  orbit: 430, speed: 140, startDeg: 80  },
];

export function Hero() {
    return (
        <section className="relative py-12 md:py-20 min-h-[90vh] flex items-center overflow-hidden bg-transparent">

            {/* ── Cosmic Background Layer ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">

                {/* Starfield dots via SVG */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    {[...Array(80)].map((_, i) => (
                        <circle
                            key={i}
                            cx={`${(i * 13 + 3) % 100}%`}
                            cy={`${(i * 19 + 5) % 100}%`}
                            r={i % 5 === 0 ? "1.5" : "0.7"}
                            fill="white"
                            opacity={0.15 + (i % 6) * 0.1}
                            className={i % 4 === 0 ? "animate-pulse" : ""}
                        />
                    ))}
                </svg>

                {/* Planet orbit system — adjusted for text background */}
                <div className="absolute left-1/2 lg:left-[15%] top-1/2" style={{ width: 0, height: 0 }}>
                    
                    {/* Central Sun — Now sits behind the text area, much subtler */}
                    <div 
                        className="absolute rounded-full z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-1000"
                        style={{
                            width: 140,
                            height: 140,
                            top: -70,
                            left: -70,
                            background: 'radial-gradient(circle, #FCD34D 0%, #F59E0B 70%, transparent 100%)',
                            boxShadow: '0 0 100px #F59E0B, 0 0 150px rgba(245,158,11,0.2)',
                        }}
                    >
                        <div className="absolute inset-0 animate-pulse opacity-20 bg-[#FBBF24] rounded-full blur-3xl" />
                    </div>

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
                                borderColor: 'rgba(255,158,11,0.06)',
                                borderStyle: 'solid',
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
                                    boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
                                    opacity: 0.9,
                                }}
                            />
                        </div>
                    ))}
                </div>

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
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1] text-white">
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

                    <div className="hidden lg:flex flex-col gap-4 relative justify-center items-end">
                        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
                        {[
                            { icon: Video, title: 'Face-to-Face', desc: 'Private video sessions', cls: 'glass-accent', color: 'text-accent', delay: '0s', href: '/search' },
                            { icon: ShieldCheck, title: 'Vedic Verified', desc: 'Secure background checks', cls: 'glass-orange', color: 'text-primary', delay: '0.4s' },
                            { icon: Languages, title: 'Multilingual', desc: 'Connect in 8+ languages', cls: 'glass-orange', color: 'text-primary', delay: '0.2s' },
                            { icon: Sparkles, title: 'Sarvagya (AI)', desc: 'Algorithmic insights', cls: 'glass-accent', color: 'text-accent', delay: '0.6s', trigger: 'open-sarvagya' },
                        ].map((f) => (
                            f.trigger ? (
                                <button 
                                    key={f.title} 
                                    onClick={() => window.dispatchEvent(new CustomEvent(f.trigger!))}
                                    style={{ animationDelay: f.delay }} 
                                    className="p-4 w-52 glass rounded-2xl border border-white/5 hover:border-accent/30 transition-all duration-500 float-hover hover:-translate-x-2 group flex items-center gap-4 text-left"
                                >
                                    <div className={`w-10 h-10 shrink-0 rounded-xl ${f.cls} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <f.icon className={`w-5 h-5 ${f.color}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-xs text-white mb-0.5 whitespace-nowrap">{f.title}</h3>
                                        <p className="text-[10px] text-muted-foreground leading-tight truncate">{f.desc}</p>
                                    </div>
                                </button>
                            ) : (
                                <Link 
                                    key={f.title} 
                                    href={f.href || '#'} 
                                    style={{ animationDelay: f.delay }} 
                                    className="p-4 w-52 glass rounded-2xl border border-white/5 hover:border-accent/30 transition-all duration-500 float-hover hover:-translate-x-2 group flex items-center gap-4"
                                >
                                    <div className={`w-10 h-10 shrink-0 rounded-xl ${f.cls} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <f.icon className={`w-5 h-5 ${f.color}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-xs text-white mb-0.5 whitespace-nowrap">{f.title}</h3>
                                        <p className="text-[10px] text-muted-foreground leading-tight truncate">{f.desc}</p>
                                    </div>
                                </Link>
                            )
                        ))}
                    </div>

                    <div className="lg:hidden flex flex-wrap justify-center gap-2 pt-6 border-t border-white/5 mt-2">
                        {[
                            { icon: Video, label: 'Video', cls: 'glass-accent', color: 'text-accent', href: '/search' },
                            { icon: ShieldCheck, label: 'Verified', cls: 'glass-orange', color: 'text-primary' },
                            { icon: Languages, label: 'Languages', cls: 'glass-orange', color: 'text-primary' },
                            { icon: Sparkles, label: 'AI Guru', cls: 'glass-accent', color: 'text-accent', trigger: 'open-sarvagya' },
                        ].map(({ icon: Icon, label, cls, color, href, trigger }) => (
                            trigger ? (
                                <button key={label} onClick={() => window.dispatchEvent(new CustomEvent(trigger))} className="glass px-3 py-2 rounded-xl flex items-center gap-2 border border-white/5">
                                    <div className={`w-7 h-7 rounded-lg ${cls} flex items-center justify-center shrink-0`}>
                                        <Icon className={`w-3.5 h-3.5 ${color}`} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-white">{label}</span>
                                </button>
                            ) : (
                                <Link key={label} href={href || '#'} className="glass px-3 py-2 rounded-xl flex items-center gap-2 border border-white/5">
                                    <div className={`w-7 h-7 rounded-lg ${cls} flex items-center justify-center shrink-0`}>
                                        <Icon className={`w-3.5 h-3.5 ${color}`} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-white">{label}</span>
                                </Link>
                            )
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
