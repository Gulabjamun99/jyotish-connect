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
        <section className="py-6 bg-secondary/20 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full opacity-50 pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-4 gap-3">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/40 border border-primary/10 backdrop-blur text-[8px] font-black uppercase tracking-widest text-primary">
                            <Star className="w-2 h-2" /> Featured
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Handpicked Acharyas</h2>
                        <p className="text-muted-foreground text-[10px] font-medium max-w-sm uppercase tracking-wide opacity-70">
                            Verified Experts for Your Guidance
                        </p>
                    </div>
                    <Link href="/search">
                        <Button variant="outline" size="sm" className="h-8 px-3 rounded-md border-primary/10 hover:bg-primary/5 font-black uppercase tracking-tighter text-[9px] gap-1.5 group">
                            Full List
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
                    {astrologers.map((astro) => (
                        <div key={astro.id} className="bg-white/80 backdrop-blur-md rounded-xl border border-white shadow-sm hover:shadow-lg transition-all duration-300 group hover:-translate-y-1 overflow-hidden flex flex-col">
                            <div className="relative w-full aspect-square bg-slate-100 overflow-hidden">
                                <img
                                    src={astro.image}
                                    alt={astro.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900/90 to-transparent" />

                                {/* Signal Status Badge */}
                                <div className="absolute top-1.5 left-1.5 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-white/20">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                    </span>
                                    <span className="text-[7px] font-black uppercase tracking-tighter text-white">Live</span>
                                </div>

                                {/* Minimal Verified Badge */}
                                {astro.verified && (
                                    <div className="absolute top-1.5 right-1.5 bg-blue-500/90 backdrop-blur-sm p-0.5 rounded-full shadow-sm">
                                        <CheckCircle className="w-2.5 h-2.5 text-white" />
                                    </div>
                                )}

                                <div className="absolute bottom-1.5 left-1.5 right-1.5 text-white">
                                    <h3 className="font-bold text-[11px] md:text-xs leading-none mb-0.5 truncate">{astro.name}</h3>
                                    <p className="text-[7px] font-bold text-white/70 uppercase tracking-tighter truncate opacity-80">{astro.expertise}</p>
                                </div>
                            </div>

                            <div className="p-2 md:p-2.5 flex flex-col flex-grow gap-1.5">
                                <div className="flex items-center justify-between text-[8px] font-black">
                                    <div className="flex items-center gap-0.5 text-amber-600">
                                        <Star className="w-2 h-2 fill-amber-500 text-amber-500" />
                                        <span>{astro.rating}</span>
                                    </div>
                                    <span className="text-slate-400 opacity-60 uppercase">{astro.reviews}r</span>
                                </div>

                                <div className="mt-auto pt-1.5 border-t border-slate-100/50 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-800 leading-none">₹{astro.price}</span>
                                        <span className="text-[6px] font-bold text-slate-400 uppercase leading-none mt-0.5">/min</span>
                                    </div>
                                    <Link href={`/profile/${astro.id}`}>
                                        <Button size="sm" className="h-6 rounded-md px-2.5 bg-slate-900 border-none hover:bg-primary transition-all text-white font-black text-[8px] uppercase tracking-tighter">
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
