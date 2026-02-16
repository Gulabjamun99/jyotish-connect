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

    if (loading) return (
        <section className="py-20 bg-primary/5">
            <div className="container mx-auto px-4 text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p>Curating expert guidance...</p>
            </div>
        </section>
    );
    return (
        <section className="py-20 bg-secondary/30">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Featured Astrologers</h2>
                        <p className="text-muted-foreground">Consult with top-rated experts handpicked for you</p>
                    </div>
                    <Link href="/search">
                        <Button variant="ghost" className="text-primary hover:text-primary/80">
                            View All Experts →
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {astrologers.map((astro) => (
                        <div key={astro.id} className="bg-white/70 backdrop-blur-xl rounded-2xl border border-primary/10 p-5 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 bg-secondary">
                                <img
                                    src={astro.image}
                                    alt={astro.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                {astro.verified && (
                                    <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-1 rounded-full text-blue-500">
                                        <CheckCircle className="w-5 h-5 fill-blue-500 text-white" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg">{astro.name}</h3>
                                    <div className="flex items-center gap-1 text-sm font-semibold">
                                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        {astro.rating}
                                    </div>
                                </div>

                                <p className="text-sm text-muted-foreground">{astro.expertise}</p>

                                <div className="flex flex-wrap gap-1 py-1">
                                    {astro.languages.map(lang => (
                                        <span key={lang} className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                                            {lang}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t mt-4">
                                    <div>
                                        <span className="text-lg font-bold">₹{astro.price}</span>
                                        <span className="text-xs text-muted-foreground ml-1">/min</span>
                                    </div>
                                    <Link href={`/astrologer/profile/${astro.id}`}>
                                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                                            Book Now
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
