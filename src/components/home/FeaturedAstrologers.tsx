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
        <section className="py-8 bg-secondary/30 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full opacity-50 pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/50 border border-primary/10 backdrop-blur text-[9px] font-black uppercase tracking-widest text-primary">
                            <Star className="w-2.5 h-2.5" /> Top Rated
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Featured Guides</h2>
                        <p className="text-muted-foreground text-xs md:text-sm font-medium max-w-lg">
                            Master astrologers handpicked for accuracy.
                        </p>
                    </div>
                    <Link href="/search">
                        <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg border-primary/10 hover:bg-primary/5 font-bold uppercase tracking-widest text-[10px] gap-2 group">
                            View All
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {astrologers.map((astro) => (
                        <div key={astro.id} className="bg-white/70 backdrop-blur-xl rounded-[1rem] border border-white shadow-lg shadow-primary/5 hover:shadow-xl transition-all duration-300 group hover:-translate-y-0.5 overflow-hidden flex flex-col">
                            <div className="relative w-full aspect-square bg-secondary overflow-hidden">
                                <img
                                    src={astro.image}
                                    alt={astro.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/0 to-transparent opacity-70" />

                                {/* Live Signal Badge */}
                                <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-md px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-green-100">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                    </span>
                                    <span className="text-[8px] font-black uppercase tracking-wider text-green-600">Live</span>
                                </div>

                                {/* Verified Badge */}
                                {astro.verified && (
                                    <div className="absolute top-2 right-2 bg-blue-500/90 backdrop-blur-md px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                                        <CheckCircle className="w-2.5 h-2.5 fill-white text-blue-500" />
                                        <span className="text-[8px] font-black uppercase tracking-wider text-white">Verified</span>
                                    </div>
                                )}

                                <div className="absolute bottom-2 left-2 right-2 text-white">
                                    <h3 className="font-bold text-sm md:text-base leading-tight mb-0.5">{astro.name}</h3>
                                    <p className="text-[8px] md:text-[9px] font-medium text-white/80 line-clamp-1">{astro.expertise}</p>
                                </div>
                            </div>

                            <div className="p-2.5 md:p-3 flex flex-col flex-grow gap-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                        <span className="text-[9px] font-bold text-amber-700">{astro.rating}</span>
                                    </div>
                                    <span className="text-[8px] font-medium text-slate-400 uppercase tracking-tight">{astro.reviews} Revs</span>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                    {astro.languages.slice(0, 2).map(lang => (
                                        <span key={lang} className="text-[8px] uppercase font-bold px-1 py-0.5 rounded-sm bg-slate-100/50 text-slate-500 border border-slate-200/50">
                                            {lang}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-auto pt-2 border-t border-slate-100/50 flex items-center justify-between">
                                    <div>
                                        <span className="text-sm font-black text-slate-900">₹{astro.price}</span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase ml-0.5">/m</span>
                                    </div>
                                    <Link href={`/profile/${astro.id}`}>
                                        <Button size="sm" className="h-7 rounded-md px-3 bg-slate-900 hover:bg-primary transition-all text-white font-bold text-[9px] uppercase tracking-wider">
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
