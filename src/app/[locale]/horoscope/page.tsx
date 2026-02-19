"use client";

import { useTranslations, useLocale } from "next-intl";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Sparkles, Star } from "lucide-react";
import { translateSign, translatePlanet, getTrans } from "@/lib/astrology/i18n";
// Removed direct imports of calculator to avoid build errors
// import { calculatePlanets, calculatePanchang } from "@/lib/astrology/calculator";
import { generateDailyHoroscope } from "@/lib/astrology/prediction-engine";
// import { SIGN_PREDICTIONS } from "@/lib/astrology/horoscope-data"; // Removed static import

const ZODIAC_SIGNS = [
    { name: "Aries", icon: "♈", dates: "Mar 21 - Apr 19" },
    { name: "Taurus", icon: "♉", dates: "Apr 20 - May 20" },
    { name: "Gemini", icon: "♊", dates: "May 21 - Jun 20" },
    { name: "Cancer", icon: "♋", dates: "Jun 21 - Jul 22" },
    { name: "Leo", icon: "♌", dates: "Jul 23 - Aug 22" },
    { name: "Virgo", icon: "♍", dates: "Aug 23 - Sep 22" },
    { name: "Libra", icon: "♎", dates: "Sep 23 - Oct 22" },
    { name: "Scorpio", icon: "♏", dates: "Oct 23 - Nov 21" },
    { name: "Sagittarius", icon: "♐", dates: "Nov 22 - Dec 21" },
    { name: "Capricorn", icon: "♑", dates: "Dec 22 - Jan 19" },
    { name: "Aquarius", icon: "♒", dates: "Jan 20 - Feb 18" },
    { name: "Pisces", icon: "♓", dates: "Feb 19 - Mar 20" },
];

export default function HoroscopePage() {
    const locale = useLocale();
    const tNav = useTranslations("Nav");
    const t = useTranslations("Index");
    const [selectedSign, setSelectedSign] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState<any>(null);

    const getSeededRandom = (seed: string) => {
        let h = 0xdeadbeef;
        for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
        const res = ((h ^ h >>> 16) >>> 0) / 4294967296;
        return res;
    };

    const getDynamicPrediction = async (sign: string, lang: string) => {
        try {
            const today = new Date();
            const seed = `${today.toLocaleDateString()}-${sign}`;
            const rand = getSeededRandom(seed);

            // Calculate Real Planetary Positions via API
            const response = await fetch('/api/astrology/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: "horoscope",
                    data: { sign, date: today, lat: 22.9734, lng: 78.6569, locale: lang }
                })
            });

            if (!response.ok) throw new Error("API failure");
            const data = await response.json();
            const planets = data.planets;
            const panchang = data.panchang;

            // Generate Dynamic Horoscope based on transits
            const dynamicHoroscope = generateDailyHoroscope(sign, planets, lang);

            if (!dynamicHoroscope) {
                console.error(`No data found for sign: ${sign}`);
                return null;
            }

            const trans = getTrans(lang);

            // Safe Tithi Mapping
            let tithiLabel = "";
            if (trans.panchang && trans.panchang.tithi) {
                if (panchang.tithi === 15) tithiLabel = trans.panchang.tithi[14]; // Purnima
                else if (panchang.tithi === 30) tithiLabel = trans.panchang.tithi[15]; // Amavasya
                else {
                    const idx = (panchang.tithi - 1) % 15;
                    tithiLabel = trans.panchang.tithi[idx] || "";
                }
            }

            // Safe Yoga Mapping
            let yogaLabel = "";
            if (trans.panchang && trans.panchang.yoga) {
                yogaLabel = trans.panchang.yoga[panchang.yoga - 1] || "";
            }

            // Safe Karana Mapping
            let karanLabel = "";
            if (trans.panchang && trans.panchang.karan) {
                const k = panchang.karana; // 1-60
                let kIdx = 0;
                if (k === 1) kIdx = 10; // Kintughna
                else if (k >= 58) kIdx = 7 + (k - 58); // 58->7(Shakuni), 59->8(Chat), 60->9(Naga)
                else kIdx = (k - 2) % 7; // Bava...Vishti
                karanLabel = trans.panchang.karan[kIdx] || "";
            }

            return {
                positive: dynamicHoroscope.positive,
                negative: dynamicHoroscope.negative,
                career: dynamicHoroscope.career,
                health: dynamicHoroscope.health,
                love: dynamicHoroscope.love,
                lucky_number: dynamicHoroscope.luckyNumber,
                lucky_color: dynamicHoroscope.luckyColor,
                labels: dynamicHoroscope.labels,
                transitInfo: dynamicHoroscope.transitInfo,
                panchang: {
                    tithi: tithiLabel,
                    yoga: yogaLabel,
                    karan: karanLabel,
                    vara: trans.panchang.vara[panchang.vara] || "",
                    sunrise: panchang.sunrise,
                    sunset: panchang.sunset
                }
            };
        } catch (err) {
            console.error("Prediction error:", err);
            return null;
        }
    };

    const fetchHoroscope = async (sign: string) => {
        setLoading(true);
        setSelectedSign(sign);

        try {
            const dynamicData = await getDynamicPrediction(sign, locale);
            if (dynamicData) {
                setPrediction({
                    sign,
                    date: new Date().toLocaleDateString(locale === 'en' ? 'en-US' : `${locale}-IN`),
                    ...dynamicData
                });
            }
        } catch (err) {
            console.error("Fetch horoscope error:", err);
        } finally {
            setLoading(false);
            setTimeout(() => {
                document.getElementById("prediction-result")?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    };

    // Auto-update if locale changes
    useEffect(() => {
        if (selectedSign) {
            fetchHoroscope(selectedSign);
        }
    }, [locale]);

    return (
        <main className="min-h-screen bg-slate-50 selection:bg-orange-500/30">
            <Navbar />

            <div className="container mx-auto px-4 py-12 md:py-20">
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

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 animate-slide-up">
                    {ZODIAC_SIGNS.map((sign) => (
                        <button
                            key={sign.name}
                            onClick={() => fetchHoroscope(sign.name)}
                            className={`relative p-6 md:p-8 rounded-[2rem] transition-all group overflow-hidden bg-white border ${selectedSign === sign.name
                                ? "border-orange-500 ring-4 ring-orange-500/10 shadow-xl"
                                : "border-slate-100 hover:border-orange-200 hover:shadow-lg"
                                }`}
                        >
                            <div className="relative z-10 space-y-4">
                                <div className="text-5xl group-hover:scale-110 transition-transform duration-300 inline-block">
                                    {sign.icon}
                                </div>
                                <div className="space-y-1">
                                    <h3 className={`font-black text-lg tracking-tight uppercase transition-colors ${selectedSign === sign.name ? "text-orange-600" : "text-slate-900"}`}>
                                        {translateSign(sign.name, locale)}
                                    </h3>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{sign.dates}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {loading && (
                    <div className="py-32 text-center space-y-6 animate-fade-in">
                        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                            {t("decoding_starlight")}
                        </p>
                    </div>
                )}

                {prediction && !loading && (
                    <section id="prediction-result" className="mt-20 bg-white p-8 md:p-16 rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden animate-slide-up">
                        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 border-b border-slate-50 pb-12">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-5xl shadow-xl shadow-orange-200">
                                    {ZODIAC_SIGNS.find(s => s.name === prediction.sign)?.icon}
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">{prediction.sign}</h2>
                                    <div className="flex items-center gap-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{prediction.date}</p>
                                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-600">{prediction.transitInfo}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <div className="bg-slate-50 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100">
                                    {prediction.labels?.color || t("lucky_color")} <span className="text-orange-600 ml-2">{prediction.lucky_color}</span>
                                </div>
                                <div className="bg-slate-50 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100">
                                    {prediction.labels?.number || t("lucky_number")} <span className="text-orange-600 ml-2">{prediction.lucky_number}</span>
                                </div>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-10">
                                {[
                                    { title: t("positive") || "Positive Highlights", content: prediction.positive, icon: "✨", color: "text-amber-500" },
                                    { title: t("negative") || "Challenges", content: prediction.negative, icon: "⚠️", color: "text-red-500" },
                                    { title: t("career"), content: prediction.career, icon: "💼", color: "text-orange-500" },
                                    { title: t("health"), content: prediction.health, icon: "💪", color: "text-rose-500" },
                                    { title: t("love"), content: prediction.love, icon: "❤️", color: "text-pink-500" },
                                ].map((item, i) => (
                                    <div key={i} className={`space-y-4 ${item.title.includes("Positive") || item.title.includes("Negative") ? "md:col-span-1 bg-slate-50 p-6 rounded-3xl border border-slate-100" : ""}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-lg shadow-sm">
                                                {item.icon}
                                            </div>
                                            <h3 className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.title}</h3>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                            {item.content}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 flex items-center gap-2">
                                    {t("todays_panchang")}
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { label: t("label_tithi"), val: prediction.panchang.tithi },
                                        { label: t("label_yoga"), val: prediction.panchang.yoga },
                                        { label: t("label_karan"), val: prediction.panchang.karan },
                                        { label: t("label_vara"), val: prediction.panchang.vara },
                                        { label: t("label_sunrise"), val: prediction.panchang.sunrise },
                                        { label: t("label_sunset"), val: prediction.panchang.sunset },
                                    ].map((p, idx) => (
                                        <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-200/50 last:border-0">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.label}</span>
                                            <span className="text-xs font-black text-slate-800">{p.val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 pt-12 border-t border-slate-50 text-center space-y-8">
                            <div className="space-y-2">
                                <h4 className="text-xl font-black text-slate-900 uppercase">
                                    {t("deep_analysis_title")}
                                </h4>
                                <p className="text-sm text-slate-500 font-medium">
                                    {t("deep_analysis_desc")}
                                </p>
                            </div>
                            <Button
                                onClick={() => window.location.href = '/search'}
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
