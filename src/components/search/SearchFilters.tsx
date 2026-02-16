"use client";

import { Check, ChevronDown, Filter as FilterIcon, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EXPERTISE_OPTIONS = ["Vedic", "Tarot", "Numerology", "Vastu", "Palmistry"];
const LANGUAGE_OPTIONS = ["Hindi", "English", "Marathi", "Tamil", "Gujarati", "Bengali"];
const RATING_OPTIONS = ["4.5+", "4.0+", "3.5+", "Any"];

export function SearchFilters({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
    const [activeFilters, setActiveFilters] = useState({
        expertise: [] as string[],
        language: [] as string[],
        rating: "Any",
    });

    const toggleFilter = (type: 'expertise' | 'language', value: string) => {
        setActiveFilters(prev => {
            const current = prev[type];
            const next = current.includes(value)
                ? current.filter(i => i !== value)
                : [...current, value];

            const updated = { ...prev, [type]: next };
            onFilterChange(updated);
            return updated;
        });
    };

    const setRating = (rating: string) => {
        const updated = { ...activeFilters, rating };
        setActiveFilters(updated);
        onFilterChange(updated);
    };

    const clearFilters = () => {
        const cleared = { expertise: [], language: [], rating: "Any" };
        setActiveFilters(cleared);
        onFilterChange(cleared);
    };

    return (
        <div className="glass p-8 rounded-[2.5rem] border-primary/10 space-y-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-50" />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 font-black text-xs uppercase tracking-[0.3em] text-foreground">
                    <FilterIcon className="w-4 h-4 text-primary" />
                    Refine
                </div>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-foreground/30 hover:text-primary text-[10px] font-black uppercase tracking-widest hover:bg-transparent">
                    Reset
                </Button>
            </div>

            {/* Expertise */}
            <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">Sacred Expertise</h4>
                <div className="flex flex-wrap gap-2">
                    {EXPERTISE_OPTIONS.map((item) => (
                        <button
                            key={item}
                            onClick={() => toggleFilter('expertise', item)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
                                activeFilters.expertise.includes(item)
                                    ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(14,165,233,0.3)] scale-105"
                                    : "bg-primary/5 border-primary/5 text-foreground/40 hover:border-primary/30 hover:text-primary"
                            )}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* Languages */}
            <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">Vocal Resonance</h4>
                <div className="flex flex-wrap gap-2">
                    {LANGUAGE_OPTIONS.map((item) => (
                        <button
                            key={item}
                            onClick={() => toggleFilter('language', item)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
                                activeFilters.language.includes(item)
                                    ? "bg-accent border-accent text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105"
                                    : "bg-primary/5 border-primary/5 text-foreground/40 hover:border-primary/30 hover:text-primary"
                            )}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* Minimum Rating */}
            <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">Minimum Arcana</h4>
                <div className="grid grid-cols-2 gap-3">
                    {RATING_OPTIONS.map((item) => (
                        <button
                            key={item}
                            onClick={() => setRating(item)}
                            className={cn(
                                "px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 text-center",
                                activeFilters.rating === item
                                    ? "bg-primary text-white border-primary"
                                    : "bg-primary/5 border-primary/5 text-foreground/40 hover:border-primary/30 hover:text-primary"
                            )}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-6">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest leading-relaxed">
                        Filters are ethically synchronized with the cosmic flow.
                    </p>
                </div>
            </div>
        </div>
    );
}
