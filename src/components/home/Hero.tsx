import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, Video, ShieldCheck, Languages } from "lucide-react";

export function Hero() {
    return (
        <section className="relative py-8 md:py-12 overflow-hidden bg-transparent">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
                    <div className="text-center lg:text-left space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest animate-fade-in mx-auto lg:mx-0">
                            <Sparkles className="w-3 h-3" />
                            Vedic Wisdom Experts
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                            Consult India's Best{" "}
                            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">
                                Verified Guides
                            </span>
                        </h1>

                        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0 opacity-90">
                            Instant guidance via 100% private video calls. Career, love, and health solutions from handpicked experts.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                            <Link href="/search">
                                <Button size="lg" className="h-12 px-6 text-base bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 font-bold tracking-wide rounded-xl">
                                    Book Now
                                </Button>
                            </Link>
                            <Link href="/horoscope">
                                <Button size="lg" variant="outline" className="h-12 px-6 text-base font-bold rounded-xl border-primary/10">
                                    Horoscope
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="hidden lg:grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <Video className="w-6 h-6 text-primary mb-3" />
                                <h3 className="font-bold text-sm">1-on-1 Video</h3>
                                <p className="text-xs text-muted-foreground">High-quality face-to-face sessions</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <ShieldCheck className="w-6 h-6 text-primary mb-3" />
                                <h3 className="font-bold text-sm">Verified</h3>
                                <p className="text-xs text-muted-foreground">Rigorous background checks</p>
                            </div>
                        </div>
                        <div className="space-y-4 pt-8">
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <Languages className="w-6 h-6 text-primary mb-3" />
                                <h3 className="font-bold text-sm">Multilingual</h3>
                                <p className="text-xs text-muted-foreground">Connect in your language</p>
                            </div>
                            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <Sparkles className="w-6 h-6 text-primary mb-3" />
                                <h3 className="font-bold text-sm">AI Reports</h3>
                                <p className="text-xs text-muted-foreground">Detailed Gemini predictions</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:hidden grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t mt-4">
                        <div className="flex flex-col items-center gap-1.5">
                            <div className="p-2 bg-primary/5 rounded-lg text-primary">
                                <Video className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold">Video</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                            <div className="p-2 bg-primary/5 rounded-lg text-primary">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold">Verified</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                            <div className="p-2 bg-primary/5 rounded-lg text-primary">
                                <Languages className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold">Languages</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                            <div className="p-2 bg-primary/5 rounded-lg text-primary">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold">AI Reports</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
