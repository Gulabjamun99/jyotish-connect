"use client";

import { useLocale } from "next-intl";
import { translatePlanet } from "@/lib/astrology/i18n";
import { useState } from "react";

interface PlanetData {
    name: string;
    longitude: number;
    degree?: number;
    sign?: string;
    isRetrograde?: boolean;
}

interface LagnaChartProps {
    chart: {
        [house: number]: string[];
    };
    planets?: PlanetData[];
    ascendant?: number;
    title?: string;
    subTitle?: string;
}

export function LagnaChart({ chart, planets, ascendant, title = "Lagna", subTitle = "D1 Chart" }: LagnaChartProps) {
    const locale = useLocale();
    const [hoveredHouse, setHoveredHouse] = useState<number | null>(null);

    const getPlanetData = (planetName: string) => {
        if (!planets) return null;
        return planets.find((p: any) => p.name === planetName);
    };

    const getHouseSign = (house: number) => {
        if (ascendant === undefined) return null;
        const ascSign = Math.floor(ascendant / 30);
        const houseSignIndex = (ascSign + house - 1) % 12;
        return houseSignIndex + 1;
    };

    const getPlanetColor = (planet: string) => {
        const colors: Record<string, string> = {
            "Sun": "#ea580c",
            "Moon": "#2563eb",
            "Mars": "#dc2626",
            "Mercury": "#16a34a",
            "Jupiter": "#ca8a04",
            "Venus": "#db2777",
            "Saturn": "#7e22ce",
            "Rahu": "#334155",
            "Ketu": "#475569",
            "Asc": "#f97316"
        };
        return colors[planet] || "#0f172a";
    };

    const getPlanetShort = (planetName: string) => {
        if (planetName === "Asc") return locale === 'hi' ? "ल" : "As";
        const translated = translatePlanet(planetName, locale);
        return translated.substring(0, 2);
    };

    const housePolygons = [
        { house: 1, points: "200,0 100,100 200,200 300,100", cx: 200, cy: 100 },
        { house: 2, points: "0,0 100,100 200,0", cx: 100, cy: 40 },
        { house: 3, points: "0,0 0,200 100,100", cx: 40, cy: 100 },
        { house: 4, points: "0,200 100,300 200,200 100,100", cx: 100, cy: 200 },
        { house: 5, points: "0,200 100,300 0,400", cx: 40, cy: 300 },
        { house: 6, points: "0,400 200,400 100,300", cx: 100, cy: 360 },
        { house: 7, points: "200,400 300,300 200,200 100,300", cx: 200, cy: 300 },
        { house: 8, points: "200,400 300,300 400,400", cx: 300, cy: 360 },
        { house: 9, points: "400,200 400,400 300,300", cx: 360, cy: 300 },
        { house: 10, points: "400,200 300,100 200,200 300,300", cx: 300, cy: 200 },
        { house: 11, points: "400,0 400,200 300,100", cx: 360, cy: 100 },
        { house: 12, points: "200,0 300,100 400,0", cx: 300, cy: 40 },
    ];

    return (
        <div className="w-full max-w-[500px] mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-[10px] font-black tracking-widest uppercase mb-3">
                    {subTitle}
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
            </div>

            <div className="relative w-full aspect-square border-2 border-orange-200 dark:border-orange-900/50 bg-[#fffdfa] dark:bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center p-2 lg:p-4">
                <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-sm">
                    <rect x="0" y="0" width="400" height="400" fill="transparent" stroke="#f97316" strokeWidth="2.5" />

                    <line x1="0" y1="0" x2="400" y2="400" stroke="#fbd38d" strokeWidth="2" strokeOpacity="0.8" />
                    <line x1="400" y1="0" x2="0" y2="400" stroke="#fbd38d" strokeWidth="2" strokeOpacity="0.8" />

                    <polygon points="200,0 400,200 200,400 0,200" fill="transparent" stroke="#f97316" strokeWidth="2.5" />

                    {housePolygons.map(({ house, points, cx, cy }) => {
                        const isHovered = hoveredHouse === house;
                        const housePlanets = chart[house] || [];
                        const signNumber = getHouseSign(house);

                        return (
                            <g
                                key={house}
                                onMouseEnter={() => setHoveredHouse(house)}
                                onMouseLeave={() => setHoveredHouse(null)}
                                className="cursor-pointer transition-all duration-300"
                            >
                                <polygon
                                    points={points}
                                    fill={isHovered ? "rgba(249, 115, 22, 0.08)" : "transparent"}
                                    stroke={isHovered ? "#ea580c" : "transparent"}
                                    strokeWidth="2"
                                />

                                {signNumber && (
                                    <text
                                        x={cx} y={cy - 20}
                                        textAnchor="middle"
                                        fill="#94a3b8"
                                        fontSize="12"
                                        fontWeight="600"
                                    >
                                        {signNumber}
                                    </text>
                                )}

                                {housePlanets.map((planet, idx) => {
                                    const yOffset = cy + (idx * 16) - ((housePlanets.length - 1) * 8);
                                    const planetData = getPlanetData(planet);
                                    let retro = planetData?.isRetrograde ? "(R)" : "";
                                    return (
                                        <text
                                            key={idx}
                                            x={cx}
                                            y={yOffset}
                                            textAnchor="middle"
                                            fill={getPlanetColor(planet)}
                                            fontSize="15"
                                            fontWeight="800"
                                        >
                                            {getPlanetShort(planet)}{retro}
                                        </text>
                                    );
                                })}
                            </g>
                        );
                    })}
                </svg>

                {hoveredHouse && (
                    <div className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-2xl z-20 pointer-events-none border border-slate-700 w-48 animate-fade-in">
                        <div className="font-bold text-sm mb-2 border-b border-slate-700 pb-2 flex justify-between items-center">
                            <span>House {hoveredHouse}</span>
                            {getHouseSign(hoveredHouse) && (
                                <span className="text-orange-400 text-xs">Sign {getHouseSign(hoveredHouse)}</span>
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            {chart[hoveredHouse]?.length > 0 ? (
                                chart[hoveredHouse].map((p, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getPlanetColor(p) }} />
                                        <span className="text-sm font-medium">
                                            {translatePlanet(p, locale)} {getPlanetData(p)?.isRetrograde ? '(R)' : ''}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <span className="text-slate-400 text-sm">Empty House</span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                {[
                    { name: "Sun", color: "bg-[#ea580c]" },
                    { name: "Moon", color: "bg-[#2563eb]" },
                    { name: "Mars", color: "bg-[#dc2626]" },
                    { name: "Mercury", color: "bg-[#16a34a]" },
                    { name: "Jupiter", color: "bg-[#ca8a04]" },
                    { name: "Venus", color: "bg-[#db2777]" },
                    { name: "Saturn", color: "bg-[#7e22ce]" },
                    { name: "Rahu", color: "bg-[#334155]" },
                    { name: "Ketu", color: "bg-[#475569]" },
                ].map(p => (
                    <div key={p.name} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <div className={`w-2.5 h-2.5 rounded-full ${p.color} shadow-inner`} />
                        {getPlanetShort(p.name)}
                    </div>
                ))}
            </div>
        </div>
    );
}
