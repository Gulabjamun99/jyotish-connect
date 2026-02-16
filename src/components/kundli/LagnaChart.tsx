"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { translatePlanet, translateSign } from "@/lib/astrology/i18n";

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
    planets?: PlanetData[]; // Full planet data with degrees
    ascendant?: number; // Ascendant degree in longitude
    title?: string;
    subTitle?: string;
}

export function LagnaChart({ chart, planets, ascendant, title = "Lagna", subTitle = "D1 Chart" }: LagnaChartProps) {
    const locale = useLocale();
    const [hoveredHouse, setHoveredHouse] = useState<number | null>(null);

    // Helper to get planet full data
    const getPlanetData = (planetName: string) => {
        if (!planets) return null;
        return planets.find((p: any) => p.name === planetName);
    };

    // Helper to format degree
    const formatDegree = (longitude: number) => {
        const deg = Math.floor(longitude % 30);
        const min = Math.floor(((longitude % 30) - deg) * 60);
        return `${deg}°${min.toString().padStart(2, '0')}'`;
    };

    // Get sign for house based on ascendant
    const getHouseSign = (house: number) => {
        if (!ascendant) return null;
        const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
        const ascSign = Math.floor(ascendant / 30);
        const houseSign = (ascSign + house - 1) % 12;
        return translateSign(signs[houseSign], locale);
    };

    // North Indian Diamond Style Chart - Traditional Layout
    // Grid Structure (4 rows x 4 cols):
    //      12    1    2
    //   11    center   3
    //   10    center   4  
    //      9    8    7
    //               6
    //               5
    const housePositions = [
        // Row 1: Houses 12, 1 (Lagna), 2
        { house: 12, className: "col-start-2 row-start-1" },
        { house: 1, className: "col-start-3 row-start-1 bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-300 dark:border-orange-700" }, // Ascendant
        { house: 2, className: "col-start-4 row-start-1" },

        // Row 2: Houses 11, center, 3
        { house: 11, className: "col-start-1 row-start-2" },
        { house: 0, className: "col-start-2 row-start-2 col-span-2 row-span-2 flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20" }, // Center
        { house: 3, className: "col-start-4 row-start-2" },

        // Row 3: Houses 10, center, 4
        { house: 10, className: "col-start-1 row-start-3" },
        { house: 4, className: "col-start-4 row-start-3" },

        // Row 4: Houses 9, 8, 7, 6
        { house: 9, className: "col-start-1 row-start-4" },
        { house: 8, className: "col-start-2 row-start-4" },
        { house: 7, className: "col-start-3 row-start-4" },
        { house: 6, className: "col-start-4 row-start-4" },

        // Row 5: House 5 (centered in column 3-4)
        { house: 5, className: "col-start-3 row-start-5 col-span-2" }
    ];

    const getPlanetColor = (planet: string) => {
        const colors: { [key: string]: string } = {
            "Sun": "text-orange-600 dark:text-orange-400",
            "Moon": "text-blue-600 dark:text-blue-400",
            "Mars": "text-red-600 dark:text-red-400",
            "Mercury": "text-green-600 dark:text-green-400",
            "Jupiter": "text-yellow-600 dark:text-yellow-400",
            "Venus": "text-pink-600 dark:text-pink-400",
            "Saturn": "text-purple-700 dark:text-purple-400",
            "Rahu": "text-gray-700 dark:text-gray-400",
            "Ketu": "text-gray-600 dark:text-gray-500",
            "Asc": "text-primary"
        };
        return colors[planet] || "text-foreground";
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="grid grid-cols-4 grid-rows-5 gap-0 border-2 border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-lg">
                {housePositions.map(({ house, className }) => {
                    if (house === 0) {
                        return (
                            <div key="center" className={className}>
                                <div className="text-center">
                                    <div className="text-3xl mb-2">🕉️</div>
                                    <div className="text-sm font-black text-primary uppercase tracking-wider">{title}</div>
                                    <div className="text-xs text-muted-foreground font-medium">{subTitle}</div>
                                    {ascendant !== undefined && (
                                        <div className="text-[10px] text-orange-600 dark:text-orange-400 font-bold mt-2 px-2 py-1 bg-orange-100 dark:bg-orange-950/30 rounded-md inline-block">
                                            Asc: {formatDegree(ascendant)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    const housePlanets = chart[house] || [];
                    const isHovered = hoveredHouse === house;
                    const houseSign = getHouseSign(house);

                    return (
                        <div
                            key={house}
                            className={`${className} relative border border-slate-200 dark:border-slate-700 p-2 min-h-[110px] transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer`}
                            onMouseEnter={() => setHoveredHouse(house)}
                            onMouseLeave={() => setHoveredHouse(null)}
                        >
                            {/* House Number */}
                            <div className="absolute top-1.5 left-1.5 text-xs font-black text-slate-400 dark:text-slate-600">
                                {house}
                            </div>

                            {/* House Sign */}
                            {houseSign && (
                                <div className="absolute top-1.5 right-1.5 text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 rounded">
                                    {houseSign.substring(0, 3).toUpperCase()}
                                </div>
                            )}

                            {/* Planets */}
                            <div className="flex flex-col items-center justify-center h-full gap-1 pt-6 pb-2">
                                {housePlanets.length > 0 ? (
                                    housePlanets.map((planetName, idx) => {
                                        const planetData = getPlanetData(planetName);

                                        return (
                                            <div
                                                key={idx}
                                                className={`text-center w-full ${isHovered ? "scale-105" : ""} transition-transform`}
                                            >
                                                <div className={`text-sm font-bold ${getPlanetColor(planetName)} leading-tight flex items-center justify-center gap-1`}>
                                                    <span>{planetName === "Asc" ? (locale === 'hi' ? "लग्न" : "ASC") : translatePlanet(planetName, locale)}</span>
                                                    {planetData?.isRetrograde && <span className="text-[9px] text-red-500">(R)</span>}
                                                </div>
                                                {planetData && planetData.longitude !== undefined && (
                                                    <div className="text-[9px] text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                                                        {formatDegree(planetData.longitude)}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-sm text-slate-300 dark:text-slate-700">—</div>
                                )}
                            </div>

                            {/* Hover Tooltip */}
                            {isHovered && housePlanets.length > 0 && (
                                <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border border-slate-700 dark:border-slate-300 rounded-lg shadow-xl text-xs whitespace-nowrap">
                                    <div className="font-bold mb-1">House {house} - {houseSign}</div>
                                    <div className="text-slate-300 dark:text-slate-700">
                                        {housePlanets.map((p, i) => translatePlanet(p, locale)).join(", ")}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 p-5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Planet Legend</h4>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {[
                        { name: "Sun", color: "bg-orange-500" },
                        { name: "Moon", color: "bg-blue-400" },
                        { name: "Mars", color: "bg-red-500" },
                        { name: "Mercury", color: "bg-green-500" },
                        { name: "Jupiter", color: "bg-yellow-500" },
                        { name: "Venus", color: "bg-pink-500" },
                        { name: "Saturn", color: "bg-purple-600" },
                        { name: "Rahu", color: "bg-gray-600" },
                        { name: "Ketu", color: "bg-gray-500" }
                    ].map((planet) => (
                        <div key={planet.name} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${planet.color} shadow-sm`} />
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{translatePlanet(planet.name, locale)}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    <span className="font-bold">Note:</span> (R) indicates Retrograde planet • Degree format: DD°MM'
                </div>
            </div>
        </div>
    );
}
