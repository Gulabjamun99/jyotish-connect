"use client";

import React, { useState } from 'react';
import { useLocale } from 'next-intl';
import { translateSign, translatePlanet } from '@/lib/astrology/i18n';
import { Sparkles, TrendingUp, Info, HelpCircle } from 'lucide-react';

interface AshtakvargaHeatmapProps {
    ashtakvarga?: {
        planets: Record<string, number[]>;
        sarvashtakavarga: number[];
        totalSAVPoints: number;
    };
    ascendantSign?: string;
}

export function AshtakvargaHeatmap({ ashtakvarga, ascendantSign = "Aries" }: AshtakvargaHeatmapProps) {
    const locale = useLocale();
    const [hoveredHouse, setHoveredHouse] = useState<number | null>(null);
    const [selectedTab, setSelectedTab] = useState<'grid' | 'table'>('grid');

    const _SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const planetsList = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

    if (!ashtakvarga || !ashtakvarga.sarvashtakavarga) {
        return (
            <div className="p-8 text-center bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 text-white/50">
                <Info className="w-8 h-8 mx-auto mb-4 text-orange-500 opacity-60 animate-pulse" />
                No Ashtakvarga calculation data available.
            </div>
        );
    }

    const { planets, sarvashtakavarga, totalSAVPoints } = ashtakvarga;
    const ascSignIndex = _SIGNS.indexOf(ascendantSign);

    // Map each house (1 to 12) to its corresponding zodiac sign
    const getZodiacSignForHouse = (houseIndex: number) => {
        const signIdx = (ascSignIndex + houseIndex) % 12;
        return _SIGNS[signIdx];
    };

    // Determine status and styling based on SAV Bindu score
    const getScoreClassification = (score: number) => {
        if (score >= 30) return {
            label: "Highly Auspicious (Shubh)",
            glow: "shadow-[0_0_25px_rgba(34,197,94,0.15)] border-green-500/30 bg-green-500/5 hover:bg-green-500/10",
            text: "text-green-400",
            border: "border-green-500/20",
            badge: "bg-green-500/10 text-green-400 border-green-500/20"
        };
        if (score >= 25) return {
            label: "Favorable (Shubh)",
            glow: "shadow-[0_0_20px_rgba(59,130,246,0.12)] border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10",
            text: "text-blue-400",
            border: "border-blue-500/20",
            badge: "bg-blue-500/10 text-blue-400 border-blue-500/20"
        };
        if (score >= 20) return {
            label: "Average (Madhyam)",
            glow: "shadow-[0_0_20px_rgba(234,179,8,0.1)] border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10",
            text: "text-yellow-400",
            border: "border-yellow-500/20",
            badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
        };
        return {
            label: "Weak (Alpa Bindu)",
            glow: "shadow-[0_0_25px_rgba(239,68,68,0.15)] border-red-500/30 bg-red-500/5 hover:bg-red-500/10 animate-pulse",
            text: "text-red-400",
            border: "border-red-500/20",
            badge: "bg-red-500/10 text-red-400 border-red-500/20"
        };
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* SAV Dashboard Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                    <div className="text-xs text-white/40 uppercase font-black tracking-widest mb-1">Total Bindus</div>
                    <div className="text-4xl font-black text-white">{totalSAVPoints}</div>
                    <div className="text-[10px] text-white/40 mt-1 uppercase font-bold">Standard Vedic Checksum: 337</div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                    <div className="text-xs text-white/40 uppercase font-black tracking-widest mb-1">Auspicious Houses</div>
                    <div className="text-4xl font-black text-green-400">
                        {sarvashtakavarga.filter(score => score >= 28).length}
                    </div>
                    <div className="text-[10px] text-white/40 mt-1 uppercase font-bold">Bindu Score ≥ 28 (High Strength)</div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                    <div className="text-xs text-white/40 uppercase font-black tracking-widest mb-1">Afflicted Houses</div>
                    <div className="text-4xl font-black text-red-400">
                        {sarvashtakavarga.filter(score => score < 20).length}
                    </div>
                    <div className="text-[10px] text-white/40 mt-1 uppercase font-bold">Bindu Score &lt; 20 (Requires Care)</div>
                </div>
            </div>

            {/* Premium Interactive Toggle */}
            <div className="flex justify-between items-center bg-white/5 p-1 rounded-xl border border-white/10 max-w-sm mx-auto">
                <button
                    onClick={() => setSelectedTab('grid')}
                    className={`flex-1 py-2 px-4 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${selectedTab === 'grid' ? 'bg-orange-500 text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
                >
                    Cosmic Heatmap
                </button>
                <button
                    onClick={() => setSelectedTab('table')}
                    className={`flex-1 py-2 px-4 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${selectedTab === 'table' ? 'bg-orange-500 text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
                >
                    Planet Matrix
                </button>
            </div>

            {/* Grid View (Interactive Visual Heatmap) */}
            {selectedTab === 'grid' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {sarvashtakavarga.map((score, houseIdx) => {
                        const style = getScoreClassification(score);
                        const isHovered = hoveredHouse === houseIdx;
                        const signName = getZodiacSignForHouse(houseIdx);

                        return (
                            <div
                                key={houseIdx}
                                onMouseEnter={() => setHoveredHouse(houseIdx)}
                                onMouseLeave={() => setHoveredHouse(null)}
                                className={`p-6 rounded-[2rem] border transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between min-h-[160px] relative ${style.glow}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">
                                            House {houseIdx + 1}
                                        </div>
                                        <div className="text-sm font-bold text-white mt-0.5">
                                            {translateSign(signName, locale)}
                                        </div>
                                    </div>
                                    <div className={`text-xs px-2.5 py-1 rounded-full border font-black uppercase ${style.badge}`}>
                                        {score >= 30 ? "Uchch" : score >= 25 ? "Shubh" : score >= 20 ? "Madhyam" : "Alpa"}
                                    </div>
                                </div>

                                <div className="my-3">
                                    <div className={`text-4xl font-black ${style.text}`}>{score}</div>
                                    <div className="text-[10px] text-white/40 font-bold uppercase mt-1">Bindu Points</div>
                                </div>

                                {/* Dynamic Interactive Planet Mini bar */}
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden flex">
                                    {planetsList.map((pName) => {
                                        const pts = planets[pName]?.[houseIdx] || 0;
                                        const pct = (pts / 8) * 100;
                                        return (
                                            <div
                                                key={pName}
                                                style={{ width: `${100 / planetsList.length}%` }}
                                                className={`h-full border-r border-black/20 last:border-0 ${score >= 30 ? 'bg-green-400' : score >= 25 ? 'bg-blue-400' : score >= 20 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                                title={`${pName}: ${pts} Bindus`}
                                            />
                                        );
                                    })}
                                </div>

                                {/* Expanded tooltips on hover */}
                                {isHovered && (
                                    <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-xl rounded-[2rem] p-4 flex flex-col justify-between border border-white/20 z-10 animate-fade-in">
                                        <div className="text-[10px] text-orange-400 font-black uppercase tracking-[0.2em]">
                                            Planet Breakdown
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            {planetsList.map(pName => (
                                                <div key={pName} className="flex justify-between border-b border-white/5 pb-1">
                                                    <span className="text-white/60">{translatePlanet(pName, locale)}:</span>
                                                    <span className="font-bold text-white">{planets[pName]?.[houseIdx] || 0}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-[9px] text-center text-white/30 italic uppercase font-bold mt-1">
                                            Sum = {score} Bindus
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Matrix Table View (Full Detailed Mathematical Chart) */}
            {selectedTab === 'table' && (
                <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-center">
                            <thead className="bg-white/10 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-black text-white/40 uppercase tracking-widest">Planet</th>
                                    {Array.from({ length: 12 }).map((_, idx) => (
                                        <th key={idx} className="px-4 py-4 text-xs font-black text-white/40 uppercase">
                                            H{idx + 1}
                                            <span className="block text-[8px] font-bold text-white/20">
                                                {translateSign(getZodiacSignForHouse(idx), locale).substring(0, 3)}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {planetsList.map((pName) => (
                                    <tr key={pName} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-left font-bold text-white flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-orange-400">
                                                {pName.substring(0, 2)}
                                            </div>
                                            {translatePlanet(pName, locale)}
                                        </td>
                                        {Array.from({ length: 12 }).map((_, hIdx) => {
                                            const pts = planets[pName]?.[hIdx] || 0;
                                            return (
                                                <td key={hIdx} className={`px-4 py-4 font-mono font-bold ${pts >= 5 ? 'text-green-400' : pts >= 3 ? 'text-white' : 'text-white/40'}`}>
                                                    {pts}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                                <tr className="bg-white/5 font-black border-t border-white/15">
                                    <td className="px-6 py-4 text-left text-orange-400 font-black uppercase tracking-wider flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" /> SAV TOTAL
                                    </td>
                                    {sarvashtakavarga.map((total, idx) => {
                                        const style = getScoreClassification(total);
                                        return (
                                            <td key={idx} className={`px-4 py-4 font-mono text-lg ${style.text}`}>
                                                {total}
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
