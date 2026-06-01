"use client";

import { useTranslations, useLocale } from "next-intl";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { translateSign, getTrans } from "@/lib/astrology/i18n";
import { SIGN_PREDICTIONS } from "@/lib/astrology/horoscope-data";
import { 
    MOON_GENERAL, 
    MOON_CAREER, 
    MOON_HEALTH, 
    MOON_LOVE, 
    SUN_CAREER_SUFFIX, 
    NEGATIVE_BY_HOUSE, 
    LUCKY_COLORS, 
    TRANSIT_LABELS 
} from "@/lib/astrology/horoscope-translations";


// ─── Zodiac Sign Metadata ─────────────────────────────────────────────────────

const ZODIAC_SIGNS = [
    { name: "Aries",       icon: "♈", dates: "Mar 21 – Apr 19", element: "Fire",  lord: "Mars"    },
    { name: "Taurus",      icon: "♉", dates: "Apr 20 – May 20", element: "Earth", lord: "Venus"   },
    { name: "Gemini",      icon: "♊", dates: "May 21 – Jun 20", element: "Air",   lord: "Mercury" },
    { name: "Cancer",      icon: "♋", dates: "Jun 21 – Jul 22", element: "Water", lord: "Moon"    },
    { name: "Leo",         icon: "♌", dates: "Jul 23 – Aug 22", element: "Fire",  lord: "Sun"     },
    { name: "Virgo",       icon: "♍", dates: "Aug 23 – Sep 22", element: "Earth", lord: "Mercury" },
    { name: "Libra",       icon: "♎", dates: "Sep 23 – Oct 22", element: "Air",   lord: "Venus"   },
    { name: "Scorpio",     icon: "♏", dates: "Oct 23 – Nov 21", element: "Water", lord: "Mars"    },
    { name: "Sagittarius", icon: "♐", dates: "Nov 22 – Dec 21", element: "Fire",  lord: "Jupiter" },
    { name: "Capricorn",   icon: "♑", dates: "Dec 22 – Jan 19", element: "Earth", lord: "Saturn"  },
    { name: "Aquarius",    icon: "♒", dates: "Jan 20 – Feb 18", element: "Air",   lord: "Saturn"  },
    { name: "Pisces",      icon: "♓", dates: "Feb 19 – Mar 20", element: "Water", lord: "Jupiter" },
];

// ─── Vedic Transit Engine ─────────────────────────────────────────────────────
// Computes approximate planetary sidereal longitudes for today using
// standard mean-longitude formulas with Lahiri ayanamsha correction.
// Moon moves ~13°/day → different house for each rashi every day.

interface Transits {
    moonSign: number;       // 0=Aries … 11=Pisces (sidereal)
    sunSign: number;
    jupiterSign: number;
    saturnSign: number;
    moonDeg: number;        // degree within sign 0-29 (for nakshatra info)
}

function computeTransits(): Transits {
    const now = new Date();
    // Days since J2000.0 (2000 Jan 1.5 UT)
    const d = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000
              + 2440587.5 - 2451545.0;

    // Lahiri ayanamsha ≈ 23.85° + 50.27"/yr
    const ayanDeg = 23.85 + (d / 365.25) * (50.27 / 3600);

    const sid = (lon: number) => ((lon - ayanDeg) % 360 + 360) % 360;

    // ── Sun (tropical → sidereal) ──────────────────────────────────────────
    const sunL   = (280.46646 + 0.98564736 * d) % 360;
    const sunGr  = ((357.52911 + 0.98560028 * d) % 360) * Math.PI / 180;
    const sunLon = sid(sunL + 1.914602 * Math.sin(sunGr) + 0.019993 * Math.sin(2 * sunGr));

    // ── Moon (tropical → sidereal, Brown's abridged theory) ───────────────
    const moonLo = (218.3165 + 13.17639646 * d) % 360;
    const mM  = ((134.9634 + 13.06499295 * d) % 360) * Math.PI / 180;
    const mD  = ((297.8502 + 12.19074912 * d) % 360) * Math.PI / 180;
    const mF  = ((93.2721  + 13.22935022 * d) % 360) * Math.PI / 180;
    const moonLon = sid(moonLo
        + 6.2888 * Math.sin(mM)
        - 1.2740 * Math.sin(2 * mD - mM)
        + 0.6583 * Math.sin(2 * mD)
        - 0.2136 * Math.sin(2 * mM)
        + 0.1851 * Math.sin(mM - 2 * mD)
        - 0.1143 * Math.sin(2 * mF));

    // ── Outer planets (mean longitude, sufficient precision for sign) ──────
    // Jupiter: sidereal period ≈ 11.86 yr; ref 2000-Jan-01 ≈ 11° sidereal (Aries)
    const jupLon  = sid((11  + (d / 4332.59) * 360) % 360);
    // Saturn: sidereal period ≈ 29.46 yr; ref 2000-Jan-01 ≈ 22° sidereal (Aries)
    const satLon  = sid((22  + (d / 10759.22) * 360) % 360);

    return {
        moonSign:    Math.floor(moonLon / 30),
        sunSign:     Math.floor(sunLon  / 30),
        jupiterSign: Math.floor(jupLon  / 30),
        saturnSign:  Math.floor(satLon  / 30),
        moonDeg:     moonLon % 30,
    };
}

/** Vedic house of planet (1-12) counted from rashiIdx */
function house(rashiIdx: number, planetSign: number): number {
    return ((planetSign - rashiIdx + 12) % 12) + 1;
}

const LUCKY_NUMBERS_BY_HOUSE: Record<number, number[]> = {
    1: [1, 10], 2: [2, 11], 3: [3, 12], 4: [4, 13],
    5: [5, 14], 6: [6, 15], 7: [7, 16], 8: [8, 17],
    9: [9, 18], 10: [1, 19], 11: [2, 20], 12: [3, 21],
};

// ─── Panchang fallback (seeded, daily) ───────────────────────────────────────

function getPanchangFallback(trans: any): any {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000);
    return {
        tithi: trans?.panchang?.tithi?.[dayOfYear % 30]     || "",
        yoga:  trans?.panchang?.yoga?.[dayOfYear % 27]      || "",
        karan: trans?.panchang?.karan?.[(dayOfYear * 2) % 11] || "",
        vara:  trans?.panchang?.vara?.[now.getDay()]         || "",
        sunrise: "06:10", sunset: "18:42",
    };
}

// ─── Main builder ─────────────────────────────────────────────────────────────

function buildHoroscopePrediction(sign: string, locale: string, apiData?: any) {
    const signIdx = ZODIAC_SIGNS.findIndex(s => s.name === sign);
    if (signIdx < 0) return null;

    let transits = computeTransits();
    if (apiData?.planets) {
        const moon = apiData.planets.find((p: any) => p.name === "Moon");
        const sun = apiData.planets.find((p: any) => p.name === "Sun");
        const jup = apiData.planets.find((p: any) => p.name === "Jupiter");
        const sat = apiData.planets.find((p: any) => p.name === "Saturn");
        if (moon && sun && jup && sat) {
            transits = {
                moonSign: moon.signId - 1, // Convert 1-indexed to 0-indexed
                sunSign: sun.signId - 1,
                jupiterSign: jup.signId - 1,
                saturnSign: sat.signId - 1,
                moonDeg: moon.longitude % 30,
            };
        }
    }

    const moonH    = house(signIdx, transits.moonSign);
    const sunH     = house(signIdx, transits.sunSign);
    const jupH     = house(signIdx, transits.jupiterSign);
    const satH     = house(signIdx, transits.saturnSign);

    // Dynamic language mapper: Lookup active locale or fall back to English
    const L = (obj: any) => {
        if (!obj) return "";
        return obj[locale] || obj.en || "";
    };

    // Lucky number: Moon-house base ± Jupiter modification
    const baseNums = LUCKY_NUMBERS_BY_HOUSE[moonH] || [moonH, moonH + 9];
    const luckyNum = jupH >= 9 ? baseNums[1] : baseNums[0];   // Jupiter in 9th+ = higher num

    // Lucky color: Moon house primary, Saturn shifts it slightly, fully localized
    const colorHouse = satH >= 6 ? ((moonH % 12) + 1) : moonH;
    const luckyColor = L(LUCKY_COLORS[colorHouse]);

    // Retrieve sign-specific horoscope from the database in horoscope-data.ts
    const signData = SIGN_PREDICTIONS[sign];
    // Map custom locales with fallbacks
    const predictionsForLocale = signData?.[locale as keyof typeof signData]
                              || signData?.hi
                              || signData?.en;

    // Stable daily seed index to choose 1 of 4 unique options differently every day and sign
    const now = new Date();
    const daySeed = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
    const idx = (daySeed + signIdx) % 4;

    const corePersonal = predictionsForLocale?.personal?.[idx] || "";
    const coreCareer   = predictionsForLocale?.career?.[idx]   || "";
    const coreHealth   = predictionsForLocale?.health?.[idx]   || "";
    const coreLove     = predictionsForLocale?.love?.[idx]     || "";

    // Positive (general): Combine sign-specific core with relative transit house theme
    const positive = corePersonal 
        ? `${corePersonal} ${L(MOON_GENERAL[moonH])}`
        : L(MOON_GENERAL[moonH]);

    // Negative: based on Saturn house (universal Saturn wisdom)
    const negative = L(NEGATIVE_BY_HOUSE[satH] || NEGATIVE_BY_HOUSE[1]);

    // Career: Combine sign-specific core with relative transit house theme + Sun suffix
    const career = coreCareer
        ? `${coreCareer} ${L(MOON_CAREER[moonH])}${L(SUN_CAREER_SUFFIX[sunH])}`
        : L(MOON_CAREER[moonH]) + L(SUN_CAREER_SUFFIX[sunH]);

    // Health: Combine sign-specific core with relative transit house theme
    const health = coreHealth
        ? `${coreHealth} ${L(MOON_HEALTH[moonH])}`
        : L(MOON_HEALTH[moonH]);

    // Love: Combine sign-specific core with relative transit house theme
    const love = coreLove
        ? `${coreLove} ${L(MOON_LOVE[moonH])}`
        : L(MOON_LOVE[moonH]);

    // Transit info
    const trans = getTrans(locale);
    const signNames = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
    const moonSignName = trans?.signs?.[signNames[transits.moonSign]] || signNames[transits.moonSign];
    const transitLabel = L(TRANSIT_LABELS.moon_transit);
    const transitInfo = moonSignName ? `${transitLabel}: ${moonSignName}` : "";

    // Panchang
    let panchang: any;
    if (apiData?.panchang && trans?.panchang) {
        panchang = {
            tithi: trans.panchang.tithi?.[apiData.panchang.tithiId]    || "",
            yoga:  trans.panchang.yoga?.[apiData.panchang.yogaId]      || "",
            karan: trans.panchang.karan?.[apiData.panchang.karanaId]   || "",
            vara:  trans.panchang.vara?.[apiData.panchang.vara]        || "",
            sunrise: apiData.panchang.sunrise || "06:10",
            sunset:  apiData.panchang.sunset  || "18:42",
        };
    } else {
        panchang = getPanchangFallback(trans);
    }

    const labels = {
        color:  L(TRANSIT_LABELS.lucky_color),
        number: L(TRANSIT_LABELS.lucky_number),
    };

    return {
        sign, signIdx, moonH, sunH, jupH, satH,
        date: new Date().toLocaleDateString(locale === "en" ? "en-US" : `${locale}-IN`),
        positive, negative, career, health, love,
        lucky_number: luckyNum,
        lucky_color:  luckyColor,
        transitInfo, labels, panchang,
    };
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function HoroscopePage() {
    const locale = useLocale();
    const tNav = useTranslations("Nav");
    const t    = useTranslations("Index");

    const [selectedSign, setSelectedSign] = useState<string | null>(null);
    const [loading,      setLoading]      = useState(false);
    const [prediction,   setPrediction]   = useState<any>(null);

    const fetchHoroscope = useCallback(async (sign: string) => {
        setLoading(true);
        setSelectedSign(sign);
        setPrediction(null);

        // Show local prediction immediately (built from real transit math)
        const local = buildHoroscopePrediction(sign, locale);
        setPrediction(local);
        setLoading(false);

        // Silently try to enhance panchang from API
        try {
            const res = await fetch("/api/astrology/calculate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "horoscope",
                    data: { sign, date: new Date(), lat: 22.9734, lng: 78.6569, locale }
                }),
                signal: AbortSignal.timeout(4000),
            });
            if (res.ok) {
                const apiData = await res.json();
                const enhanced = buildHoroscopePrediction(sign, locale, apiData);
                setPrediction(enhanced);
            }
        } catch { /* API optional — local prediction is already displayed */ }

        setTimeout(() => {
            document.getElementById("prediction-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
    }, [locale]);

    return (
        <main className="min-h-screen bg-slate-50 selection:bg-orange-500/30">
            <Navbar />

            <div className="container mx-auto px-4 py-12 md:py-20">
                {/* Header */}
                <header className="text-center space-y-4 mb-20 animate-slide-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        <Sparkles className="w-3.5 h-3.5 fill-orange-500" /> {tNav("horoscope")}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none uppercase">
                        {t("horoscope_title")}
                    </h1>
                    <p className="text-slate-500 font-medium max-w-xl mx-auto">
                        {t("horoscope_desc")}
                    </p>
                </header>

                {/* Zodiac Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 animate-slide-up">
                    {ZODIAC_SIGNS.map((sign) => (
                        <button
                            key={sign.name}
                            id={`sign-${sign.name.toLowerCase()}`}
                            onClick={() => fetchHoroscope(sign.name)}
                            className={`relative p-5 md:p-7 rounded-[2rem] transition-all duration-200 group overflow-hidden bg-white border ${
                                selectedSign === sign.name
                                    ? "border-orange-500 ring-4 ring-orange-500/10 shadow-xl scale-[1.02]"
                                    : "border-slate-100 hover:border-orange-200 hover:shadow-lg"
                            }`}
                        >
                            <div className="relative z-10 space-y-3">
                                <div className="text-5xl group-hover:scale-110 transition-transform duration-300 inline-block">
                                    {sign.icon}
                                </div>
                                <div className="space-y-1 text-left">
                                    <h3 className={`font-black text-base tracking-tight uppercase transition-colors ${selectedSign === sign.name ? "text-orange-600" : "text-slate-900"}`}>
                                        {translateSign(sign.name, locale)}
                                    </h3>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{sign.dates}</p>
                                    <div className="flex gap-1.5 items-center">
                                        <span className="text-[8px] px-1.5 py-0.5 bg-orange-50 text-orange-500 rounded font-bold uppercase tracking-widest">{sign.element}</span>
                                        <span className="text-[8px] text-slate-300 font-semibold">{sign.lord}</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="py-32 text-center space-y-6 animate-fade-in">
                        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t("decoding_starlight")}</p>
                    </div>
                )}

                {/* Prediction Result */}
                {prediction && !loading && (
                    <section
                        id="prediction-result"
                        className="mt-20 bg-white p-8 md:p-16 rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden animate-slide-up"
                    >
                        {/* Debug strip (dev only) — shows house positions */}
                        <div className="hidden md:flex flex-wrap gap-2 mb-6 text-[9px] font-mono text-slate-400">
                            {[
                                `🌙 Moon H${prediction.moonH}`,
                                `☉ Sun H${prediction.sunH}`,
                                `♃ Jup H${prediction.jupH}`,
                                `♄ Sat H${prediction.satH}`,
                            ].map((v, i) => (
                                <span key={i} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-full">{v}</span>
                            ))}
                        </div>

                        {/* Sign + date header */}
                        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 border-b border-slate-50 pb-12">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center text-5xl shadow-xl shadow-orange-200">
                                    {ZODIAC_SIGNS.find(s => s.name === prediction.sign)?.icon}
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
                                        {translateSign(prediction.sign, locale)}
                                    </h2>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{prediction.date}</p>
                                        {prediction.transitInfo && (
                                            <>
                                                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-orange-600">{prediction.transitInfo}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <div className="bg-slate-50 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100">
                                    {prediction.labels?.color}
                                    <span className="text-orange-600 ml-2">{prediction.lucky_color}</span>
                                </div>
                                <div className="bg-slate-50 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100">
                                    {prediction.labels?.number}
                                    <span className="text-orange-600 ml-2">{prediction.lucky_number}</span>
                                </div>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                            {/* 5 prediction blocks */}
                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-10">
                                {[
                                    { title: t("positive") || "Positive Highlights", content: prediction.positive,  icon: "✨", color: "text-amber-500",  bg: true  },
                                    { title: t("negative") || "Caution",             content: prediction.negative,  icon: "⚠️", color: "text-red-500",    bg: true  },
                                    { title: t("career"),                            content: prediction.career,    icon: "💼", color: "text-orange-500", bg: false },
                                    { title: t("health"),                            content: prediction.health,    icon: "💪", color: "text-rose-500",   bg: false },
                                    { title: t("love"),                              content: prediction.love,      icon: "❤️", color: "text-pink-500",   bg: false },
                                ].map((item, i) => (
                                    <div key={i} className={`space-y-4 ${item.bg ? "bg-slate-50 p-6 rounded-3xl border border-slate-100" : ""}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-lg shadow-sm">{item.icon}</div>
                                            <h3 className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.title}</h3>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{item.content}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Panchang */}
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">{t("todays_panchang")}</h3>
                                <div className="space-y-4">
                                    {[
                                        { label: t("label_tithi"),   val: prediction.panchang.tithi   },
                                        { label: t("label_yoga"),    val: prediction.panchang.yoga    },
                                        { label: t("label_karan"),   val: prediction.panchang.karan   },
                                        { label: t("label_vara"),    val: prediction.panchang.vara    },
                                        { label: t("label_sunrise"), val: prediction.panchang.sunrise },
                                        { label: t("label_sunset"),  val: prediction.panchang.sunset  },
                                    ].map((p, idx) => (
                                        <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-200/50 last:border-0">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.label}</span>
                                            <span className="text-xs font-black text-slate-800">{p.val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="mt-16 pt-12 border-t border-slate-50 text-center space-y-8">
                            <div className="space-y-2">
                                <h4 className="text-xl font-black text-slate-900 uppercase">{t("deep_analysis_title")}</h4>
                                <p className="text-sm text-slate-500 font-medium">{t("deep_analysis_desc")}</p>
                            </div>
                            <Button
                                onClick={() => window.location.href = "/search"}
                                className="h-14 px-10 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-orange-500/20"
                            >
                                {t("consult_expert")}
                            </Button>
                        </div>
                    </section>
                )}
            </div>

            <Footer />
        </main>
    );
}
