import { Button } from "@/components/ui/button";
import { Star, CheckCircle } from "lucide-react";
import Link from "next/link";
import { getAstrologers, Astrologer } from "@/services/firestore";
import { useEffect, useState } from "react";

export function FeaturedAstrologers() {
    const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAstro = async () => {
            setLoading(true);
            try {
                const { astrologers: data } = await getAstrologers(undefined, 4);
                // Already sorted and limited by query
                setAstrologers(data);
            } catch (err) {
                console.error("Failed to fetch featured astrologers", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAstro();
    }, []);

    const SkeletonCard = () => (
        <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-primary/5 p-5 shadow-sm h-full flex flex-col">
            <div className="w-full aspect-square rounded-xl bg-primary/5 animate-pulse mb-4" />
            <div className="space-y-3 flex-grow">
                <div className="h-6 bg-primary/5 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-primary/5 rounded w-1/2 animate-pulse" />
                <div className="flex gap-2 pt-2">
                    <div className="h-5 w-12 bg-primary/5 rounded animate-pulse" />
                    <div className="h-5 w-12 bg-primary/5 rounded animate-pulse" />
                </div>
            </div>
            <div className="pt-4 border-t border-primary/5 mt-4 flex justify-between items-center">
                <div className="h-6 w-16 bg-primary/5 rounded animate-pulse" />
                <div className="h-8 w-24 bg-primary/5 rounded-lg animate-pulse" />
            </div>
        </div>
    );

    if (loading) return (
        <section className="py-20 bg-secondary/30">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-12 animate-pulse">
                    <div className="space-y-2">
                        <div className="h-8 w-64 bg-primary/10 rounded" />
                        <div className="h-4 w-96 bg-primary/5 rounded" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
                </div>
            </div>
        </section>
    );

    return (
        <section className="py-20 bg-secondary/30 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full opacity-50 pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-primary/10 backdrop-blur text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                            <Star className="w-3 h-3" /> Top Rated
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Featured Guides</h2>
                        <p className="text-muted-foreground font-medium max-w-lg">
                            Connect with master Vedic astrologers, Tarot readers, and Numerologists handpicked for their accuracy and compassion.
                        </p>
                    </div>
                    <Link href="/search">
                        <Button variant="outline" className="h-12 px-6 rounded-xl border-primary/20 hover:bg-primary/5 hover:border-primary/40 font-bold uppercase tracking-widest text-xs gap-2 group">
                            View All Experts
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {astrologers.map((astro) => (
                        <div key={astro.id} className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 group hover:-translate-y-1 overflow-hidden flex flex-col">
                            <div className="relative w-full aspect-[4/5] bg-secondary overflow-hidden">
                                <img
                                    src={astro.image}
                                    alt={astro.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/0 to-transparent opacity-60" />

                                {astro.verified && (
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                                        <CheckCircle className="w-3.5 h-3.5 fill-blue-500 text-white" />
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-800">Verified</span>
                                    </div>
                                )}

                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                    <h3 className="font-bold text-xl leading-tight mb-1">{astro.name}</h3>
                                    <p className="text-xs font-medium text-white/80 line-clamp-1">{astro.expertise}</p>
                                </div>
                            </div>

                            <div className="p-5 flex flex-col flex-grow gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                        <span className="text-xs font-bold text-amber-700">{astro.rating}</span>
                                    </div>
                                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{astro.reviews} Reviews</span>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {astro.languages.slice(0, 3).map(lang => (
                                        <span key={lang} className="text-[9px] uppercase font-bold px-2 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200">
                                            {lang}
                                        </span>
                                    ))}
                                    {astro.languages.length > 3 && (
                                        <span className="text-[9px] uppercase font-bold px-2 py-1 rounded-lg bg-slate-50 text-slate-400 border border-slate-100">
                                            +{astro.languages.length - 3}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <div>
                                        <span className="text-lg font-black text-slate-900">₹{astro.price}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">/min</span>
                                    </div>
                                    <Link href={`/astrologer/profile/${astro.id}`}>
                                        <Button size="sm" className="rounded-xl px-5 bg-slate-900 hover:bg-primary hover:shadow-lg hover:shadow-primary/20 transition-all text-white font-bold text-xs uppercase tracking-wider">
                                            Book
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
