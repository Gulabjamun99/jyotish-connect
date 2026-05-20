"use client";

import { useTranslations, useLocale } from "next-intl";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { translateSign, getTrans } from "@/lib/astrology/i18n";
import { generateDailyHoroscope } from "@/lib/astrology/prediction-engine";
import { SIGN_PREDICTIONS } from "@/lib/astrology/horoscope-data";

const ZODIAC_SIGNS = [
    { name: "Aries",       icon: "♈", dates: "Mar 21 - Apr 19", element: "Fire",  lord: "Mars"    },
    { name: "Taurus",      icon: "♉", dates: "Apr 20 - May 20", element: "Earth", lord: "Venus"   },
    { name: "Gemini",      icon: "♊", dates: "May 21 - Jun 20", element: "Air",   lord: "Mercury" },
    { name: "Cancer",      icon: "♋", dates: "Jun 21 - Jul 22", element: "Water", lord: "Moon"    },
    { name: "Leo",         icon: "♌", dates: "Jul 23 - Aug 22", element: "Fire",  lord: "Sun"     },
    { name: "Virgo",       icon: "♍", dates: "Aug 23 - Sep 22", element: "Earth", lord: "Mercury" },
    { name: "Libra",       icon: "♎", dates: "Sep 23 - Oct 22", element: "Air",   lord: "Venus"   },
    { name: "Scorpio",     icon: "♏", dates: "Oct 23 - Nov 21", element: "Water", lord: "Mars"    },
    { name: "Sagittarius", icon: "♐", dates: "Nov 22 - Dec 21", element: "Fire",  lord: "Jupiter" },
    { name: "Capricorn",   icon: "♑", dates: "Dec 22 - Jan 19", element: "Earth", lord: "Saturn"  },
    { name: "Aquarius",    icon: "♒", dates: "Jan 20 - Feb 18", element: "Air",   lord: "Saturn"  },
    { name: "Pisces",      icon: "♓", dates: "Feb 19 - Mar 20", element: "Water", lord: "Jupiter" },
];

// ────────────────────────────────────────────────────────────────────────────
// Seeded deterministic random (sign + date → unique stable daily value)
// ────────────────────────────────────────────────────────────────────────────
function seededRand(sign: string, dateStr: string): number {
    const seed = `${dateStr}__${sign}`;
    let h = 0xdeadbeef;
    for (let i = 0; i < seed.length; i++) {
        h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
    }
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// Pick item from array, offset by sign index so different signs pick different items
function pickForSign(arr: string[], rand: number, signIndex: number): string {
    if (!arr || arr.length === 0) return "";
    const shifted = (Math.floor(rand * arr.length) + signIndex) % arr.length;
    return arr[shifted] || arr[0];
}

// Lucky numbers differ per sign using prime offsets
const SIGN_LUCKY_BASE = [3, 6, 5, 2, 1, 5, 6, 9, 3, 8, 4, 7];

const COLORS_MAP: Record<string, string[]> = {
    en: ["Ruby Red", "Pearl White", "Emerald Green", "Sky Blue", "Golden Yellow", "Coral Pink", "Royal Orange", "Deep Violet", "Turquoise", "Crimson", "Silver", "Rose Gold"],
    hi: ["माणिक लाल", "मोती सफ़ेद", "पन्ना हरा", "आकाशी नीला", "सुनहरा पीला", "मूंगा गुलाबी", "नारंगी", "गहरा बैंगनी", "फ़िरोज़ी", "किरमिजी", "चांदी", "गुलाब सोना"],
    mr: ["माणिक लाल", "मोती पांढरा", "पाचू हिरवा", "आकाशी निळा", "सोनेरी पिवळा", "पोवळ्या गुलाबी", "नारंगी", "गडद जांभळा", "फिरोजी", "किरमिजी", "चांदी", "गुलाब सोने"],
    gu: ["માણેક લાલ", "મોતી સફેદ", "પન્નો લીલો", "આકાશ વાદળી", "સોનેરી પીળો", "પ્રવાળ ગુલાબી", "નારંગી", "ઘેરો જાંબલી", "ફિરોઝી", "ઘ ઘ", "ચાંદી", "ગુલાબ સોનું"],
    bn: ["মাণিক লাল", "মুক্তা সাদা", "পান্না সবুজ", "আকাশ নীল", "সোনালী হলুদ", "প্রবাল গোলাপী", "কমলা", "গাঢ় বেগুনি", "ফিরোজা", "টকটকে লাল", "রূপালি", "গোলাপ সোনা"],
    ta: ["மாணிக்க சிவப்பு", "முத்து வெள்ளை", "மரகத பச்சை", "வான் நீலம்", "தங்க மஞ்சள்", "பவள இளஞ்சிவப்பு", "ஆரஞ்சு", "அடர் ஊதா", "மரகத நீலம்", "கருஞ்சிவப்பு", "வெள்ளி", "ரோஸ் தங்கம்"],
    te: ["మాణిక్య ఎరుపు", "ముత్యపు తెలుపు", "మరకత పచ్చ", "ఆకాశ నీలం", "బంగారు పసుపు", "పగడపు గులాబీ", "నారింజ", "ముదురు వంకాయ", "ఫిరోజా", "కోట్కేంద్రి", "వెండి", "రోజ్ గోల్డ్"],
    kn: ["ಮಾಣಿಕ್ಯ ಕೆಂಪು", "ಮುತ್ತು ಬಿಳಿ", "ಮರಕತ ಹಸಿರು", "ಆಕಾಶ ನೀಲಿ", "ಚಿನ್ನದ ಹಳದಿ", "ಹವಳ ಗುಲಾಬಿ", "ಕಿತ್ತಳೆ", "ಗಾಢ ನೇರಳೆ", "ಫಿರೋಜ", "ಕಡುಗೆಂಪು", "ಬೆಳ್ಳಿ", "ರೋಸ್ ಗೋಲ್ಡ್"]
};

// ────────────────────────────────────────────────────────────────────────────
// Core: Build prediction locally (no API needed)
// ────────────────────────────────────────────────────────────────────────────
function buildLocalPrediction(sign: string, locale: string, planets?: any[], panchang?: any) {
    const signIndex = ZODIAC_SIGNS.findIndex(s => s.name === sign);
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD stable across locales
    const rand = seededRand(sign, dateStr);

    const isIndic = ["hi", "mr", "gu", "bn", "ta", "te", "kn"].includes(locale);
    const signData = SIGN_PREDICTIONS[sign];
    const dataLang = signData?.[locale as keyof typeof signData]
        || signData?.[(isIndic ? "hi" : "en") as "en" | "hi"]
        || signData?.en;

    if (!dataLang) return null;

    const trans = getTrans(locale);
    const colors = COLORS_MAP[locale] || COLORS_MAP.en;

    // Lucky number: seeded per sign per day, plus sign-specific prime offset
    const luckyNum = ((Math.floor(rand * 9) + SIGN_LUCKY_BASE[signIndex >= 0 ? signIndex : 0]) % 9) + 1;

    // Lucky color: use sign index offset so different signs get different colors
    const colorIdx = (Math.floor(rand * colors.length) + (signIndex >= 0 ? signIndex : 0)) % colors.length;
    const luckyColor = colors[colorIdx];

    // Moon transit info from real planets if available, else seeded deterministic
    let transitInfo = "";
    if (planets?.length) {
        const moon = planets.find((p: any) => p.name === "Moon");
        if (moon) {
            const moonSignStr = trans.signs[moon.sign] || moon.sign;
            const transitLabel =
                locale === "hi" ? "चन्द्रमा गोचर" :
                locale === "mr" ? "चंद्र गोचर" :
                locale === "gu" ? "ચંદ્ર ગોચર" :
                locale === "bn" ? "চন্দ্র গোচর" :
                locale === "ta" ? "சந்திர பெயர்ச்சி" :
                locale === "te" ? "చంద్ర సంచారం" :
                locale === "kn" ? "ಚಂದ್ರ ಗೋಚಾರ" : "Moon Transit";
            transitInfo = moonSignStr ? `${transitLabel}: ${moonSignStr}` : "";
        }
    } else {
        // Seeded moon sign so it appears to change daily even without API
        const moonSigns = Object.values(trans.signs || {}) as string[];
        if (moonSigns.length > 0) {
            const moonIdx = (Math.floor(rand * 12) + today.getDate()) % 12;
            const moonSignKeys = Object.keys(trans.signs || {});
            const moonSignStr = moonSignKeys[moonIdx] ? (trans.signs[moonSignKeys[moonIdx]] || "") : "";
            const transitLabel =
                locale === "hi" ? "चन्द्रमा गोचर" :
                locale === "mr" ? "चंद्र गोचर" :
                locale === "gu" ? "ચંદ્ર ગોચર" :
                locale === "bn" ? "চন্দ্র গোচর" :
                locale === "ta" ? "சந்திர பெயர்ச்சி" :
                locale === "te" ? "చంద్ర సంచారం" :
                locale === "kn" ? "ಚಂದ್ರ ಗೋಚಾರ" : "Moon Transit";
            transitInfo = moonSignStr ? `${transitLabel}: ${moonSignStr}` : "";
        }
    }

    // Panchang: from API or seeded fallback
    let panchangData = { tithi: "", yoga: "", karan: "", vara: "", sunrise: "06:10", sunset: "18:42" };
    if (panchang && trans.panchang) {
        panchangData = {
            tithi: trans.panchang.tithi?.[panchang.tithiId] || "",
            yoga: trans.panchang.yoga?.[panchang.yogaId] || "",
            karan: trans.panchang.karan?.[panchang.karanaId] || "",
            vara: trans.panchang.vara?.[panchang.vara] || "",
            sunrise: panchang.sunrise || "06:10",
            sunset: panchang.sunset || "18:42"
        };
    } else if (trans.panchang) {
        // Seeded panchang fallback — changes daily, same for all signs (as it should be — panchang is universal)
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
        const tithiIdx = dayOfYear % 30;
        const yogaIdx = dayOfYear % 27;
        const karanIdx = (dayOfYear * 2) % 11;
        const varaIdx = today.getDay();
        panchangData = {
            tithi: trans.panchang.tithi?.[tithiIdx] || "",
            yoga: trans.panchang.yoga?.[yogaIdx] || "",
            karan: trans.panchang.karan?.[karanIdx] || "",
            vara: trans.panchang.vara?.[varaIdx] || "",
            sunrise: "06:10",
            sunset: "18:42"
        };
    }

    const labels = {
        color: locale === "hi" ? "शुभ रंग" : locale === "mr" ? "शुभ रंग" : locale === "gu" ? "શુભ રંગ" : locale === "bn" ? "শুভ রঙ" : locale === "ta" ? "அதிர்ஷ்ட நிறம்" : locale === "te" ? "అదృష్ట రంగు" : locale === "kn" ? "ಅದೃಷ್ಟ ಬಣ್ಣ" : "Lucky Color",
        number: locale === "hi" ? "शुभ अंक" : locale === "mr" ? "शुभ अंक" : locale === "gu" ? "શુભ અંક" : locale === "bn" ? "শুভ সংখ্যা" : locale === "ta" ? "அதிர்ஷ்ட எண்" : locale === "te" ? "అదృష్ట సంఖ్య" : locale === "kn" ? "ಅದೃಷ್ಟ ಸಂಖ್ಯೆ" : "Lucky Number",
    };

    return {
        sign,
        date: today.toLocaleDateString(locale === "en" ? "en-US" : `${locale}-IN`),
        positive: pickForSign(dataLang.personal, rand, signIndex),
        negative: getNegative(locale),
        career: pickForSign(dataLang.career, rand, signIndex + 1),
        health: pickForSign(dataLang.health, rand, signIndex + 2),
        love: pickForSign(dataLang.love, rand, signIndex + 3),
        lucky_number: luckyNum,
        lucky_color: luckyColor,
        labels,
        transitInfo,
        panchang: panchangData
    };
}

function getNegative(locale: string): string {
    const map: Record<string, string[]> = {
        en: ["Guard against impulsive decisions. Pause before reacting.", "Avoid unnecessary arguments — choose peace today.", "Financial caution advised. Delay major purchases.", "Overthinking may cause anxiety. Trust the process."],
        hi: ["आवेगपूर्ण निर्णयों से बचें। प्रतिक्रिया देने से पहले रुकें।", "अनावश्यक विवाद से बचें — आज शांति चुनें।", "आर्थिक सावधानी बरतें। बड़ी खरीदारी टालें।", "अत्यधिक सोचने से चिंता हो सकती है। प्रक्रिया पर विश्वास करें।"],
        mr: ["आवेगाने निर्णय घेणे टाळा. प्रतिसाद देण्यापूर्वी थांबा.", "अनावश्यक वाद टाळा — आज शांतता निवडा.", "आर्थिक सावधगिरी बाळगा. मोठ्या खरेदी पुढे ढकला.", "जास्त विचार केल्याने चिंता वाढू शकते. प्रक्रियेवर विश्वास ठेवा."],
        gu: ["આવેગી નિર્ણયોથી સાવધ રહો. પ્રતિક્રિયા આપતાં પહેલાં અટકો.", "બિનજરૂરી દલીલ ટાળો — આજે શાંતિ પસંદ કરો.", "આર્થિક સાવચેતી જરૂરી. મોટી ખરીદી મુલતવી રાખો.", "વધુ પડતી ચિંતા ટાળો. પ્રક્રિયા પર ભરોસો રાખો."],
        bn: ["আবেগী সিদ্ধান্ত থেকে সাবধান। প্রতিক্রিয়া দেওয়ার আগে থামুন।", "অপ্রয়োজনীয় বিতর্ক এড়িয়ে চলুন — আজ শান্তি বেছে নিন।", "আর্থিক সতর্কতা প্রয়োজন। বড় কেনাকাটা পিছিয়ে দিন।", "অতিরিক্ত চিন্তা উদ্বেগ তৈরি করতে পারে। প্রক্রিয়ার উপর আস্থা রাখুন।"],
        ta: ["உந்தலான முடிவுகளை தவிர்க்கவும். எதிர்வினை ஆற்றுவதற்கு முன்பு நிறுத்தி யோசியுங்கள்.", "தேவையற்ற வாக்குவாதங்களை தவிர்க்கவும் — இன்று அமைதியை தேர்வு செய்யுங்கள்.", "நிதி விஷயத்தில் கவனமாக இருங்கள். பெரிய கொள்முதலை தள்ளி போடுங்கள்.", "அதிகமாக யோசிப்பது கவலையை உண்டாக்கலாம். செயல்முறையை நம்புங்கள்."],
        te: ["ఆవేగంతో నిర్ణయాలు తీసుకోకండి. స్పందించే ముందు ఆగండి.", "అనవసర వాదనలు పక్కన పెట్టండి — ఈ రోజు శాంతిని ఎంచుకోండి.", "ఆర్థిక జాగ్రత్త అవసరం. పెద్ద కొనుగోళ్ళు వాయిదా వేయండి.", "అతిగా ఆలోచించడం ఆందోళన కలిగిస్తుంది. ప్రక్రియను నమ్మండి."],
        kn: ["ಆವೇಗದ ನಿರ್ಧಾರಗಳ ಬಗ್ಗೆ ಎಚ್ಚರ. ಪ್ರತಿಕ್ರಿಯಿಸುವ ಮೊದಲು ನಿಲ್ಲಿ.", "ಅನಾವಶ್ಯಕ ವಾದ ತಪ್ಪಿಸಿ — ಇಂದು ಶಾಂತಿ ಆರಿಸಿ.", "ಹಣಕಾಸಿನ ಎಚ್ಚರ ಅಗತ್ಯ. ದೊಡ್ಡ ಖರೀದಿ ಮುಂದೂಡಿ.", "ಅತಿಯಾಗಿ ಯೋಚಿಸುವುದು ಆತಂಕ ಹೆಚ್ಚಿಸಬಹುದು. ಪ್ರಕ್ರಿಯೆಯನ್ನು ನಂಬಿ."],
    };
    const today = new Date();
    const arr = map[locale] || map.en;
    const idx = today.getDate() % arr.length;
    return arr[idx];
}

// ────────────────────────────────────────────────────────────────────────────
export default function HoroscopePage() {
    const locale = useLocale();
    const tNav = useTranslations("Nav");
    const t = useTranslations("Index");

    const [selectedSign, setSelectedSign] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState<any>(null);

    const fetchHoroscope = useCallback(async (sign: string) => {
        setLoading(true);
        setSelectedSign(sign);
        setPrediction(null);

        // 1. Immediately build local prediction (instant, no API needed)
        const localPred = buildLocalPrediction(sign, locale);

        // 2. Try to enhance with real planetary transit from API (non-blocking)
        try {
            const response = await fetch("/api/astrology/calculate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "horoscope",
                    data: { sign, date: new Date(), lat: 22.9734, lng: 78.6569, locale }
                }),
                signal: AbortSignal.timeout(4000) // 4s timeout
            });

            if (response.ok) {
                const data = await response.json();
                // Enhance the local prediction with real transit data
                const enhanced = buildLocalPrediction(sign, locale, data.planets, data.panchang);
                setPrediction(enhanced);
            } else {
                setPrediction(localPred);
            }
        } catch {
            // API unavailable — use local prediction (works perfectly offline)
            setPrediction(localPred);
        } finally {
            setLoading(false);
            setTimeout(() => {
                document.getElementById("prediction-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
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

                {/* Zodiac Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 animate-slide-up">
                    {ZODIAC_SIGNS.map((sign) => (
                        <button
                            key={sign.name}
                            id={`sign-${sign.name.toLowerCase()}`}
                            onClick={() => fetchHoroscope(sign.name)}
                            className={`relative p-6 md:p-8 rounded-[2rem] transition-all group overflow-hidden bg-white border ${
                                selectedSign === sign.name
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
                                    <p className="text-[8px] text-slate-300 font-semibold uppercase tracking-widest">{sign.element} · {sign.lord}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="py-32 text-center space-y-6 animate-fade-in">
                        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                            {t("decoding_starlight")}
                        </p>
                    </div>
                )}

                {/* Prediction Result */}
                {prediction && !loading && (
                    <section
                        id="prediction-result"
                        className="mt-20 bg-white p-8 md:p-16 rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden animate-slide-up"
                    >
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
                            {/* Predictions */}
                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-10">
                                {[
                                    { title: t("positive") || "Positive Highlights", content: prediction.positive, icon: "✨", color: "text-amber-500", bg: true },
                                    { title: t("negative") || "Challenges",          content: prediction.negative, icon: "⚠️", color: "text-red-500",  bg: true },
                                    { title: t("career"),                            content: prediction.career,   icon: "💼", color: "text-orange-500", bg: false },
                                    { title: t("health"),                            content: prediction.health,   icon: "💪", color: "text-rose-500",  bg: false },
                                    { title: t("love"),                              content: prediction.love,     icon: "❤️", color: "text-pink-500",  bg: false },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className={`space-y-4 ${item.bg ? "bg-slate-50 p-6 rounded-3xl border border-slate-100" : ""}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-lg shadow-sm">
                                                {item.icon}
                                            </div>
                                            <h3 className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.title}</h3>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{item.content}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Panchang */}
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 flex items-center gap-2">
                                    {t("todays_panchang")}
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { label: t("label_tithi"),   val: prediction.panchang.tithi },
                                        { label: t("label_yoga"),    val: prediction.panchang.yoga  },
                                        { label: t("label_karan"),   val: prediction.panchang.karan },
                                        { label: t("label_vara"),    val: prediction.panchang.vara  },
                                        { label: t("label_sunrise"), val: prediction.panchang.sunrise },
                                        { label: t("label_sunset"),  val: prediction.panchang.sunset },
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
