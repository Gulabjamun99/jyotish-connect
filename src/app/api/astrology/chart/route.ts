import { NextResponse } from "next/server";
import { getFullAstrologyData } from "@/lib/astrology/calculator";
import { generateLifePredictions } from "@/lib/astrology/prediction-engine";
import { getTrans } from "@/lib/astrology/i18n";

export async function POST(req: Request) {
    try {
        const { name, dob, tob, lat, lon, locale = 'en' } = await req.json();

        if (!dob || !tob) {
            return NextResponse.json({ error: "Date and Time are required" }, { status: 400 });
        }

        const birthDate = new Date(`${dob}T${tob}`);
        if (isNaN(birthDate.getTime())) {
            return NextResponse.json({ error: "Invalid Date format" }, { status: 400 });
        }

        // 1. Core Calculations using the new Service
        const astrologyData = await getFullAstrologyData(birthDate, parseFloat(lat) || 28.6, parseFloat(lon) || 77.2);

        // 2. Transformed Data for Response
        const planets = astrologyData.planets;
        const panchang = astrologyData.panchang;
        const divCharts = astrologyData.charts;
        const doshas = astrologyData.doshas;
        const currentDasha = astrologyData.dasha;

        const ascendant = planets.find(p => p.name === "Asc");
        const moon = planets.find(p => p.name === "Moon");
        const sun = planets.find(p => p.name === "Sun");

        // Translations helper
        const trans = getTrans(locale);

        // Helper for Sign Lords
        const getSignLord = (signId: number) => {
            const lords = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];
            return lords[(signId - 1) % 12];
        };

        const chartData = {
            details: {
                Ascendant: ascendant?.sign || "Aries",
                MoonSign: moon?.sign || "Aries",
                SunSign: sun?.sign || "Taurus",
                Nakshatra: moon?.nakshatraId ? trans.nakshatras[moon.nakshatraId - 1] : "Unknown"
            },
            nakshatra: {
                name: moon?.nakshatraId ? trans.nakshatras[moon.nakshatraId - 1] : "Unknown",
                lord: moon ? getSignLord(moon.signId) : "Unknown"
            },
            panchang: {
                tithi: panchang.tithi,
                karana: panchang.karana,
                yoga: panchang.yoga
            },
            charts: divCharts,
            planets: planets.map(p => ({
                name: p.name,
                position: `${p.house} House`,
                sign: p.sign,
                degree: (p.longitude % 30).toFixed(2) + "°",
                nakshatra: p.nakshatra,
                lord: getSignLord(p.signId)
            })),
            doshas: {
                manglik: doshas.Manglik,
                kalsarp: (doshas as any).KaalSarp || (doshas as any).Kalsarp,
                sadhesati: (doshas as any).SadeSati,
                pitra: (doshas as any).Pitra
            },
            dashas: currentDasha,
            predictions: generateLifePredictions({
                ...astrologyData,
                ascendant: ascendant?.sign || "Aries",
                moonSign: moon?.sign || "Aries",
                sunSign: sun?.sign || "Pisces"
            }, locale)
        };

        return NextResponse.json(chartData);
    } catch (error) {
        console.error("Astrology API error:", error);
        return NextResponse.json({ error: "Failed to generate chart" }, { status: 500 });
    }
}
