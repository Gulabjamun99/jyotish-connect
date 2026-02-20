"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SearchFilters } from "@/components/search/SearchFilters";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AdBanner } from "@/components/ui/AdBanner";

import { getAstrologers, Astrologer } from "@/services/firestore";
import { useEffect } from "react";

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<{ expertise: string[], language: string[], rating: string }>({
        expertise: [],
        language: [],
        rating: "Any"
    });

    useEffect(() => {
        const fetchAstro = async () => {
            setLoading(true);
            try {
                const response = await getAstrologers(filters);
                setAstrologers(response.astrologers);
                console.log("Fetched Astrologers:", response.astrologers);
            } catch (err) {
                console.error("Failed to fetch astrologers", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAstro();
    }, [filters]);

    const filteredAstrologers = astrologers.filter(astro => {
        const matchesSearch = astro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            astro.expertise.toLowerCase().includes(searchQuery.toLowerCase());

        // Firestore already filtered by expertise if applicable
        const matchesLanguage = filters.language.length === 0 || astro.languages.some(l => filters.language.includes(l));
        const matchesRating = filters.rating === "Any" || astro.rating >= parseFloat(filters.rating);

        return matchesSearch && matchesLanguage && matchesRating;
    });

    return (
        <main className="min-h-screen bg-transparent overflow-hidden selection:bg-primary/30">
            <Navbar />

            {/* Hero Search Section */}
            <div className="relative py-24 border-b border-primary/5 overflow-hidden">
                <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full -z-10 animate-float" />
                <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-accent/5 blur-[150px] rounded-full -z-10 animate-float" style={{ animationDelay: '-3s' }} />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center space-y-8 animate-slide-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-4">
                            <SearchIcon className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Search Astrologers</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-gradient tracking-tighter leading-none">Find Your Guide</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium opacity-60">
                            Find the right astrologer to guide you on your journey.
                        </p>

                        <div className="max-w-3xl mx-auto relative group mt-12">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition-opacity" />
                            <div className="relative">
                                <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20 w-6 h-6 z-10 group-hover:text-primary transition-colors" />
                                <Input
                                    type="text"
                                    placeholder="Seek by name or sacred expertise (Vedic, Tarot, Palmistry)..."
                                    className="w-full h-20 pl-16 pr-8 rounded-[2rem] border-primary/10 bg-white/50 backdrop-blur-2xl text-foreground font-black text-lg focus-visible:ring-4 focus-visible:ring-primary/10 transition-all outline-none placeholder:text-foreground/10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-20">
                <div className="flex flex-col lg:flex-row gap-12">
                    <aside className="w-full lg:w-80 flex-shrink-0 animate-slide-up">
                        <div className="sticky top-24">
                            <SearchFilters onFilterChange={setFilters} />
                        </div>
                    </aside>

                    <div className="flex-grow space-y-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/10 font-black text-primary">
                                    {filteredAstrologers.length}
                                </div>
                                <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Available Astrologers</h2>
                            </div>
                            <div className="glass p-1 rounded-xl flex items-center gap-2 border-primary/10">
                                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30 ml-4">Sort by</span>
                                <select className="bg-transparent border-none text-xs font-black uppercase tracking-widest text-foreground/60 outline-none px-4 py-2 cursor-pointer hover:text-primary transition-colors">
                                    <option className="bg-white">Rating: High to Low</option>
                                    <option className="bg-white">Price: Low to High</option>
                                    <option className="bg-white">Experience</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {filteredAstrologers.length === 0 && !loading ? (
                                <div className="col-span-full text-center py-20 animate-fade-in">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/5 text-primary mb-6">
                                        <SearchIcon className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2">
                                        No Astrologers Found
                                    </h3>
                                    <p className="text-foreground/60 max-w-md mx-auto">
                                        No results match your current filters. Try adjusting your search term to find more guides.
                                    </p>
                                    <Button
                                        onClick={() => {
                                            setSearchQuery("");
                                            setFilters({ expertise: [], language: [], rating: "Any" });
                                        }}
                                        variant="outline"
                                        className="mt-8 border-primary/20 hover:bg-primary/5"
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            ) : (
                                filteredAstrologers.map((astro, i) => (
                                    <div key={astro.id} className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]" />
                                        <div className="flex flex-col p-8 glass border-primary/5 rounded-[2.5rem] hover:border-primary/20 transition-all relative overflow-hidden h-full">

                                            {astro.online && (
                                                <div className="absolute top-6 left-6 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-[0.2em] animate-pulse border border-green-500/20">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)]" />
                                                    Online
                                                </div>
                                            )}

                                            <div className="flex gap-6 mb-8 relative pt-4">
                                                <div className="w-24 h-24 rounded-3xl bg-primary/5 overflow-hidden flex-shrink-0 border border-primary/10 shadow-2xl transition-transform group-hover:scale-105 group-hover:-rotate-3">
                                                    <img src={astro.image} alt={astro.name} className="w-full h-full object-cover transition-all duration-700" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-xl font-black text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                                                        {astro.name}
                                                        {astro.verified && <CheckCircle className="w-4 h-4 text-primary" />}
                                                    </h3>
                                                    <p className="text-[10px] text-foreground/40 font-black uppercase tracking-[0.2em]">{astro.expertise}</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1 bg-primary/5 px-2 py-1 rounded-lg border border-primary/5">
                                                            <Star className="w-3 h-3 fill-primary text-primary" />
                                                            <span className="text-xs font-black text-foreground">{astro.rating}</span>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">{astro.reviews} Insights</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6 flex-grow flex flex-col justify-between">
                                                <div className="flex flex-wrap gap-2">
                                                    {astro.languages.map(lang => (
                                                        <span key={lang} className="text-[9px] px-3 py-1 rounded-full bg-primary/5 text-foreground/40 font-black uppercase tracking-widest border border-primary/5">
                                                            {lang}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="flex justify-between items-end pt-6 border-t border-primary/5">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] text-foreground/20 line-through font-bold tracking-widest">₹{Math.round(astro.price * 1.5)}</span>
                                                        <span className="text-2xl font-black text-primary tracking-tighter">₹{astro.price}<span className="text-[10px] text-foreground/40 font-black uppercase tracking-widest ml-1">/ session</span></span>
                                                        <span className="text-[8px] text-foreground/30 font-bold uppercase tracking-widest mt-0.5">Up to 90 mins</span>
                                                    </div>
                                                    <Link href={`/astrologer/profile/${astro.id}`}>
                                                        <Button className="orange-gradient text-white font-black text-[10px] uppercase tracking-[0.2em] h-12 px-8 rounded-2xl shadow-xl shadow-primary/10 hover:scale-110 transition-transform">
                                                            Consult
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )))}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
