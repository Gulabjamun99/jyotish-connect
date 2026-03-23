"use client";

import { motion } from "framer-motion";

interface KundliChartProps {
    houses?: Record<number, string[]>; // { 1: ["Sun", "Moon"], 2: ["Mars"], ... }
    rashiNumbers?: Record<number, number>; // { 1: 5 (Leo as Ascendant), 2: 6, ... }
    className?: string;
}

/**
 * North Indian Style Kundli Chart (Diamond Layout)
 * House 1 is the top-center diamond.
 */
export function KundliChart({ houses = {}, rashiNumbers = {}, className = "" }: KundliChartProps) {
    // Default fallback data if none provided (Leo Ascendant)
    const defaultRashi = { 1: 5, 2: 6, 3: 7, 4: 8, 5: 9, 6: 10, 7: 11, 8: 12, 9: 1, 10: 2, 11: 3, 12: 4 };
    const rashiMap = Object.keys(rashiNumbers).length ? rashiNumbers : defaultRashi;

    // Helper to get planet abbreviations
    const getAbbr = (planet: string) => {
        const map: Record<string, string> = {
            "Sun": "Su", "Moon": "Mo", "Mars": "Ma", "Mercury": "Me",
            "Jupiter": "Ju", "Venus": "Ve", "Saturn": "Sa", "Rahu": "Ra", "Ketu": "Ke"
        };
        return map[planet] || planet.substring(0, 2);
    };

    return (
        <div className={`relative aspect-square w-full max-w-[400px] mx-auto ${className}`}>
            <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
                {/* --- COSMIC BACKGROUND GLOW --- */}
                <defs>
                    <radialGradient id="kundliGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(249, 115, 22, 0.1)" />
                        <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                    <linearGradient id="kundliStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                        <stop offset="50%" stopColor="rgba(249, 115, 22, 0.5)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
                    </linearGradient>
                </defs>
                
                <rect width="400" height="400" fill="url(#kundliGlow)" />

                {/* --- KUNDLI FRAME --- */}
                <g fill="none" stroke="url(#kundliStroke)" strokeWidth="2">
                    {/* Outer Box */}
                    <rect x="10" y="10" width="380" height="380" rx="4" />
                    {/* Main Diagonals */}
                    <line x1="10" y1="10" x2="390" y2="390" />
                    <line x1="390" y1="10" x2="10" y2="390" />
                    {/* Inner Diamond */}
                    <path d="M200 10 L390 200 L200 390 L10 200 Z" />
                </g>

                {/* --- HOUSE LABELS & PLANETS --- */}
                {/* House 1 (Top Center) */}
                <HouseSlot x={200} y={100} rashi={rashiMap[1]} planets={houses[1]} />
                
                {/* House 2 (Top Left Corner) */}
                <HouseSlot x={80} y={60} rashi={rashiMap[2]} planets={houses[2]} />
                
                {/* House 3 (Left Center Triangle) */}
                <HouseSlot x={80} y={200} rashi={rashiMap[3]} planets={houses[3]} />
                
                {/* House 4 (Bottom Left Corner) */}
                <HouseSlot x={80} y={340} rashi={rashiMap[4]} planets={houses[4]} />
                
                {/* House 5 (Bottom Left Side Triangle) */}
                <HouseSlot x={200} y={300} rashi={rashiMap[5]} planets={houses[5]} />
                
                {/* House 6 (Bottom Right Corner) */}
                <HouseSlot x={320} y={340} rashi={rashiMap[6]} planets={houses[6]} />
                
                {/* House 7 (Bottom Right Side Triangle) */}
                <HouseSlot x={320} y={200} rashi={rashiMap[7]} planets={houses[7]} />
                
                {/* House 8 (Top Right Corner) */}
                <HouseSlot x={320} y={60} rashi={rashiMap[8]} planets={houses[8]} />

                {/* --- INNER CENTER TRIANGLES (4-7-10) --- */}
                {/* House 9 (Top Left Inner) */}
                <HouseSlot x={140} y={140} rashi={rashiMap[9]} planets={houses[9]} isInner />
                
                {/* House 10 (Bottom Inner) */}
                <HouseSlot x={200} y={240} rashi={rashiMap[10]} planets={houses[10]} isInner />
                
                {/* House 11 (Top Right Inner) */}
                <HouseSlot x={260} y={140} rashi={rashiMap[11]} planets={houses[11]} isInner />
                
                {/* House 12 (Top Inner) */}
                <HouseSlot x={200} y={160} rashi={rashiMap[12]} planets={houses[12]} isInner />

            </svg>
        </div>
    );
}

function HouseSlot({ x, y, rashi, planets = [], isInner = false }: { x: number, y: number, rashi?: number, planets?: string[], isInner?: boolean }) {
    return (
        <motion.g 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 1 }}
        >
            {/* Rashi Number */}
            <text 
                x={x} y={isInner ? y - 10 : y - 15} 
                className="fill-orange-500/80 text-[10px] font-black text-center" 
                textAnchor="middle"
            >
                {rashi}
            </text>

            {/* Planets List */}
            <g>
                {planets.map((p, i) => (
                    <text 
                        key={p} 
                        x={x} 
                        y={y + (i * 12)} 
                        className="fill-white text-[11px] font-bold" 
                        textAnchor="middle"
                    >
                        {p.substring(0, 2)}
                    </text>
                ))}
            </g>
        </motion.g>
    );
}
