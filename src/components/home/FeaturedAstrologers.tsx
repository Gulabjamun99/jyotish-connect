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
                const { astrologers: data } = await getAstrologers(undefined, 10); // Fetch more so we can filter
                // Filter out those without real photos and limit to 4/5 for the homepage
                const withPhotos = data.filter(a => a.image && !a.image.includes("placeholder-avatar.png"));
                setAstrologers(withPhotos.slice(0, 5));
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

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                    {astrologers.map((astro) => (
                        <div key={astro.id} className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 overflow-hidden flex flex-col h-full">
                            {/* Improved Image Container */}
                            <div className="relative aspect-[4/5] overflow-hidden">
                                <img
                                    src={astro.image}
                                    alt={astro.name}
                                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                                {/* Status Badges */}
                                <div className="absolute top-2 left-2 z-20 flex flex-col gap-1.5">
                                    <div className="bg-emerald-500/90 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-lg border border-white/20">
                                        <span className="relative flex h-1.5 w-1.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                                        </span>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-white">Live</span>
                                    </div>
                                    {astro.verified && (
                                        <div className="bg-blue-500/90 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg border border-white/20">
                                            <CheckCircle className="w-2 h-2 text-white" />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-white">Verified</span>
                                        </div>
                                    )}
                                </div>

                                {/* Text Overlay on Image */}
                                <div className="absolute bottom-3 left-3 right-3 z-10">
                                    <h3 className="font-black text-white text-xs md:text-sm tracking-tight mb-0.5 group-hover:text-primary transition-colors">{astro.name}</h3>
                                    <div className="flex items-center gap-1 text-white/70 text-[8px] font-medium uppercase tracking-wider">
                                        <span className="w-1 h-1 bg-primary rounded-full" />
                                        {astro.expertise}
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Info Section */}
                            <div className="p-3 flex flex-col gap-2.5 bg-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 rounded-md">
                                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                        <span className="text-[10px] font-black text-amber-700">{astro.rating}</span>
                                    </div>
                                    <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">{astro.reviews} Reviews</span>
                                </div>

                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex flex-col">
                                        <div className="flex items-baseline gap-0.5">
                                            <span className="text-[14px] font-black text-slate-900 tracking-tighter">₹{astro.price}</span>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase">/min</span>
                                        </div>
                                    </div>
                                    <Link href={`/profile/${astro.id}`}>
                                        <Button size="sm" className="h-8 md:h-9 rounded-xl px-4 bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                            Consult
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
