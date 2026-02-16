import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, Video, ShieldCheck, Languages } from "lucide-react";

export function Hero() {
    return (
        <section className="relative py-20 overflow-hidden bg-transparent">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium animate-fade-in">
                        <Sparkles className="w-4 h-4" />
                        Empowering your life through Vedic Wisdom
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
                        Consult India's Best{" "}
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">
                            Verified Astrologers
                        </span>
                    </h1>

                    <p className="text-xl text-muted-foreground leading-relaxed">
                        Get instant guidance on career, love, finance, and health with personalized consultations
                        via real-time video calls. 100% private and secure.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link href="/search">
                            <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                                Book a Consultation
                            </Button>
                        </Link>
                        <Link href="/horoscope">
                            <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                                View Daily Horoscope
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t mt-16">
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-primary/5 rounded-xl text-primary">
                                <Video className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium">1-on-1 Video</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-primary/5 rounded-xl text-primary">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium">Verified Experts</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-primary/5 rounded-xl text-primary">
                                <Languages className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium">Multilingual</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-primary/5 rounded-xl text-primary">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium">AI Transcripts</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
