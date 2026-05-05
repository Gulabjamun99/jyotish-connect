"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, AlertCircle, Compass, ChevronRight } from "lucide-react";
import { TransitInfo, findSignificantTransits } from "@/lib/astrology/transit-logic";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";

interface CosmicTransitHubProps {
    natalPositions?: any; // User's birth planet positions
}

export function CosmicTransitHub({ natalPositions }: CosmicTransitHubProps) {
    const router = useRouter();
    const [transits, setTransits] = useState<TransitInfo[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadTransits() {
            try {
                // FETCH FROM SERVER API TO AVOID WASM IN BROWSER
                const res = await fetch('/api/astrology/transits');
                const data = await res.json();
                
                if (data.transits) {
                    setTransits(data.transits);
                    if (natalPositions) {
                        const significant = findSignificantTransits(natalPositions, data.transits);
                        setAlerts(significant);
                    }
                }
            } catch (err) {
                console.error("Failed to load transits from API:", err);
            } finally {
                setLoading(false);
            }
        }
        loadTransits();
    }, [natalPositions]);

    if (loading) return (
        <div className="h-48 flex items-center justify-center glass rounded-3xl animate-pulse bg-zinc-900/50">
            <Compass className="w-8 h-8 text-zinc-700 animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    Cosmic Transits
                </h2>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">LIVE</span>
            </div>

            {/* ALERTS SECTION */}
            <AnimatePresence>
                {alerts.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl space-y-3 shadow-2xl"
                    >
                        <div className="flex items-center gap-2 text-orange-500 font-bold text-xs uppercase tracking-wider">
                            <AlertCircle className="w-4 h-4" />
                            Significant Event
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                            {alerts[0].message}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TRANSIT GRID */}
            <div className="grid grid-cols-2 gap-3">
                {transits.slice(0, 4).map((t, i) => (
                    <motion.div 
                        key={t.planet}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass bg-white/5 border border-white/5 p-4 rounded-3xl hover:bg-white/10 transition-all group overflow-hidden"
                    >
                        <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                            {t.planet}
                        </div>
                        <div className="text-sm font-black text-white flex items-center gap-1.5">
                            {t.sign}
                            {t.isRetrograde && <span className="text-[8px] px-1 bg-red-500/20 text-red-500 rounded uppercase font-black">R</span>}
                        </div>
                    </motion.div>
                ))}
            </div>

            <Button 
                variant="ghost" 
                onClick={() => router.push('/kundli')}
                className="w-full h-12 border border-white/5 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center justify-between px-6 rounded-2xl group"
            >
                Cosmic Details
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
        </div>
    );
}
