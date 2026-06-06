"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { Sparkles, Heart, User, FileText, CheckCircle2, AlertCircle, LayoutGrid, Zap, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import { LocationInput } from "@/components/kundli/LocationInput";
import { generateDetailedMatchingReport, analyzeManglikCancellation, generateFullMatchAnalysis } from "@/lib/astrology/prediction-engine";
import { generateMatchingPDF } from "@/lib/astrology/generateMatchingPDF";
import { useLocale, useTranslations } from "next-intl";
import { translateSign } from "@/lib/astrology/i18n";

export default function MatchingPage() {
    const locale = useLocale();
    const t = useTranslations('Index');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [mounted, setMounted] = useState(false);
    const pdfHiddenRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const l = (key: string, fallback: string) => {
        try {
            const val = t(key);
            return val.includes('Index.') ? fallback : val;
        } catch {
            return fallback;
        }
    };

    const [boyData, setBoyData] = useState({
        name: "", dob: "", tob: "", birthplace: "", lat: 28.6139, lng: 77.2090
    });
    const [girlData, setGirlData] = useState({
        name: "", dob: "", tob: "", birthplace: "", lat: 28.6139, lng: 77.2090
    });

    const [result, setResult] = useState<any>(null);
    const [analysis, setAnalysis] = useState<any>(null);
    const [calcStep, setCalcStep] = useState(0);
    const [isAlreadyMarried, setIsAlreadyMarried] = useState(false);

    const calculateMatch = async () => {
        if (!boyData.name || !girlData.name) {
            toast.error(l('enterNamePlaceholder', "Please enter names for both"));
            return;
        }
        
        setLoading(true);
        setCalcStep(0);

        const progressSteps = [
            l('calculatingOrbits', "Analyzing planetary positions..."),
            l('analyzing_yogas', "Synchronizing 8-fold compatibility..."),
            l('checking_doshas', "Detecting Manglik & Nadi Doshas..."),
            l('checking_navamsa', "Checking Navamsa (D9) spiritual bond..."),
            l('generating_forecast', "Generating 12-year forecast...")
        ];

        for (let i = 0; i < progressSteps.length; i++) {
            setCalcStep(i);
            await new Promise(r => setTimeout(r, 800));
        }

        try {
            const bDate = new Date(`${boyData.dob}T${boyData.tob || "12:00"}`);
            const gDate = new Date(`${girlData.dob}T${girlData.tob || "12:00"}`);

            const response = await fetch('/api/astrology/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: "match",
                    data: {
                        boyDetails: { date: bDate, lat: boyData.lat, lng: boyData.lng, name: boyData.name, birthplace: boyData.birthplace },
                        girlDetails: { date: gDate, lat: girlData.lat, lng: girlData.lng, name: girlData.name, birthplace: girlData.birthplace }
                    }
                })
            });

            if (!response.ok) throw new Error(await response.text());

            const matchResult = await response.json();
            const fullAnalysis = generateFullMatchAnalysis(matchResult, locale, isAlreadyMarried);
            setResult(matchResult);
            setAnalysis(fullAnalysis);

            setTimeout(() => {
                document.getElementById("results")?.scrollIntoView({ behavior: 'smooth' });
            }, 100);

            toast.success(l('analysisComplete', "Celestial Report Generated!"));
        } catch (err) {
            console.error(err);
            toast.error(l('calculation_failed', "Calculation Failed. Please check details."));
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!result || !analysis) return;

        toast.loading(l('decoding_starlight', "Crafting your premium report..."), { id: "pdf-match" });

        try {
            const reportData = dynamicReport || generateDetailedMatchingReport(result, locale, isAlreadyMarried);
            if (!reportData) throw new Error("Could not generate report data");

            const baseResult = {
                boy: boyData.name,
                girl: girlData.name,
                total_guna: result.milan.totalScore,
                is_manglik_boy: result.boy.doshas.Manglik.present,
                is_manglik_girl: result.girl.doshas.Manglik.present,
                ashtakoot: result.milan.ashtakoot,
                boyPanchang: result.boy.panchang,
                girlPanchang: result.girl.panchang,
                boyDasha: result.boy.dasha,
                girlDasha: result.girl.dasha,
                boyPlanets: result.boy.planets,
                girlPlanets: result.girl.planets,
                boyChart: result.boy.charts,
                girlChart: result.girl.charts,
                boyAscendant: result.boy.ascendantLongitude,
                girlAscendant: result.girl.ascendantLongitude
            };

            const boyDetails = {
                name: boyData.name,
                dob: boyData.dob,
                tob: boyData.tob,
                place: boyData.birthplace,
                lat: boyData.lat,
                lng: boyData.lng
            };

            const girlDetails = {
                name: girlData.name,
                dob: girlData.dob,
                tob: girlData.tob,
                place: girlData.birthplace,
                lat: girlData.lat,
                lng: girlData.lng
            };

            await generateMatchingPDF(baseResult, boyDetails, girlDetails, locale, reportData);
            toast.success(l('downloadReport', "Report ready!"), { id: "pdf-match" });
        } catch (err) {
            console.error("PDF Error:", err);
            toast.error(l('calculation_failed', "Failed to generate PDF."), { id: "pdf-match" });
        }
    };

    if (!mounted) return null;

    const dynamicReport = result ? generateDetailedMatchingReport(result, locale, isAlreadyMarried) : null;

    return (
        <main className="min-h-screen bg-[#050510] text-white overflow-x-hidden selection:bg-orange-500/30">
            <Navbar />
            <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
                <header className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-[10px] font-black tracking-[0.2em] uppercase shadow-sm">
                        <Sparkles className="w-4 h-4 text-orange-500" /> {t('premiumVedicReport')}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
                        {l('matching_title', 'Kundli Milan').split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">{l('matching_title', 'Milan').split(' ')[1] || 'Milan'}</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-bold text-lg leading-relaxed">
                        {t('matching_desc')}
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10 sticky top-24">
                            <div className="mb-10 relative">
                                <h3 className="text-xl font-black text-white mb-8 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-lg">♂</div>
                                    {l('boyIdentityTitle', "Groom's Identity")}
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] ml-1">{l('fullNameLabel', 'Full Name')}</label>
                                        <Input 
                                            placeholder={t('enterNamePlaceholder')} 
                                            value={boyData.name} 
                                            onChange={e => setBoyData({ ...boyData, name: e.target.value })} 
                                            className="bg-white/10 h-14 border-white/20 text-white placeholder:text-white/40 focus:ring-orange-500 focus:bg-white/20 rounded-xl font-bold shadow-inner transition-all" 
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] ml-1">{l('manifestationDateLabel', 'Date')}</label>
                                            <Input type="date" value={boyData.dob} onChange={e => setBoyData({ ...boyData, dob: e.target.value })} className="bg-white/10 h-14 border-white/20 text-white rounded-xl font-bold [color-scheme:dark] focus:bg-white/20 transition-all" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] ml-1">{l('timeOfBreathLabel', 'Time')}</label>
                                            <Input type="time" value={boyData.tob} onChange={e => setBoyData({ ...boyData, tob: e.target.value })} className="bg-white/10 h-14 border-white/20 text-white rounded-xl font-bold [color-scheme:dark] focus:bg-white/20 transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] ml-1">{l('birthCoordinatesLabel', 'Birth Location')}</label>
                                        <LocationInput value={boyData.birthplace} onChange={(loc, lat, lng) => setBoyData({ ...boyData, birthplace: loc, lat: lat || 28.6, lng: lng || 77.2 })} />
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <h3 className="text-xl font-black text-white mb-8 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center shadow-lg">♀</div>
                                    {l('girlIdentityTitle', "Bride's Identity")}
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] ml-1">{l('fullNameLabel', 'Full Name')}</label>
                                        <Input 
                                            placeholder={t('enterNamePlaceholder')} 
                                            value={girlData.name} 
                                            onChange={e => setGirlData({ ...girlData, name: e.target.value })} 
                                            className="bg-white/10 h-14 border-white/20 text-white placeholder:text-white/40 focus:ring-orange-500 focus:bg-white/20 rounded-xl font-bold shadow-inner transition-all" 
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] ml-1">{l('manifestationDateLabel', 'Date')}</label>
                                            <Input type="date" value={girlData.dob} onChange={e => setGirlData({ ...girlData, dob: e.target.value })} className="bg-white/10 h-14 border-white/20 text-white rounded-xl font-bold [color-scheme:dark] focus:bg-white/20 transition-all" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] ml-1">{l('timeOfBreathLabel', 'Time')}</label>
                                            <Input type="time" value={girlData.tob} onChange={e => setGirlData({ ...girlData, tob: e.target.value })} className="bg-white/10 h-14 border-white/20 text-white rounded-xl font-bold [color-scheme:dark] focus:bg-white/20 transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] ml-1">{l('birthCoordinatesLabel', 'Birth Location')}</label>
                                        <LocationInput value={girlData.birthplace} onChange={(loc, lat, lng) => setGirlData({ ...girlData, birthplace: loc, lat: lat || 28.6, lng: lng || 77.2 })} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                                <input 
                                    type="checkbox" 
                                    id="alreadyMarried"
                                    checked={isAlreadyMarried}
                                    onChange={e => setIsAlreadyMarried(e.target.checked)}
                                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-orange-500 focus:ring-orange-500 focus:ring-offset-0 focus:outline-none cursor-pointer"
                                />
                                <label htmlFor="alreadyMarried" className="text-sm font-bold text-white/80 cursor-pointer select-none">
                                    {locale === 'hi' ? 'पहले से विवाहित हैं?' : 'Already Married?'}
                                </label>
                            </div>

                            <Button onClick={calculateMatch} disabled={loading} className="w-full h-16 mt-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-500/20 active:scale-95 transition-transform">
                                {loading ? (
                                    <div className="flex flex-col items-center">
                                        <span className="animate-pulse">{l('calculatingOrbits', 'Calculating Orbits...')}</span>
                                    </div>
                                ) : (
                                    <span className="flex items-center gap-3">
                                        {l('establishCelestialMatch', 'Establish Match')} <Sparkles className="w-6 h-6 animate-pulse" />
                                    </span>
                                )}
                            </Button>
                        </div>

                        {result && (
                            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:blur-2xl transition-all" />
                                <h3 className="text-2xl font-black mb-2">{l('downloadReport', 'Download PDF')}</h3>
                                <p className="text-indigo-100 mb-6 text-sm opacity-80">{l('matching_desc', 'Get the full detailed 10+ page premium compatibility report.')}</p>
                                <Button
                                    onClick={handleDownloadPDF}
                                    className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-black h-12 rounded-xl transition-all active:scale-95"
                                >
                                    {l('downloadReport', 'Download Full Report')}
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-8">
                        {result && analysis ? (
                            <div id="results" className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/10 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-red-600/10 rounded-full blur-[100px] -mr-32 -mt-32 transition-all group-hover:blur-[120px]" />
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                                        <div className="text-center md:text-left space-y-4">
                                            <div className="inline-flex items-center gap-2 px-4 py-1 bg-orange-500/10 rounded-full text-[10px] font-black uppercase tracking-widest text-orange-500">{l('compatibilityScore', 'Compatibility')}</div>
                                            <div className="flex items-center justify-center md:justify-start gap-6">
                                                <div className="relative w-36 h-36 flex items-center justify-center group/score">
                                                    <svg className="w-full h-full transform -rotate-90">
                                                        <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                                                        <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={402.1} strokeDashoffset={402.1 - (402.1 * result.milan.totalScore / 36)} strokeLinecap="round" className={`${result.milan.totalScore >= 25 ? "text-orange-500" : result.milan.totalScore >= 18 ? "text-red-500" : "text-amber-500"} transition-all duration-1500 ease-out drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]`} />
                                                    </svg>
                                                    <div className="absolute text-center">
                                                        <div className="text-5xl font-black text-white leading-none tracking-tighter">{result.milan.totalScore}</div>
                                                        <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">{l('table.obtained', 'Gunas')}</div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 text-left">
                                                    <div className={`text-2xl font-black tracking-tighter ${result.milan.totalScore >= 25 ? "text-orange-500" : result.milan.totalScore >= 18 ? "text-red-500" : "text-amber-500"}`}>
                                                        {result.milan.totalScore >= 25 ? l('divineUnion', 'Divine Union') : result.milan.totalScore >= 18 ? l('excellentMatch', 'Auspicious Match') : l('consultAstrologer', 'Consult Astrologer')}
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-xl text-[10px] font-black text-white/60 uppercase tracking-wider border border-white/10">
                                                            {result.milan.totalScore >= 18 ? <ShieldCheck className="w-4 h-4 text-orange-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                                                            {result.milan.totalScore >= 18 ? l('heavenlySanctioned', 'Heavenly Sanctioned') : l('guidedActionNeeded', 'Guided Action Needed')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 bg-white/10 p-6 rounded-[2rem] border border-white/20 backdrop-blur-md shadow-inner">
                                            <div className="text-center group/boy">
                                                <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-orange-500 flex items-center justify-center text-2xl font-black mb-2 mx-auto shadow-xl group-hover/boy:scale-110 transition-transform border border-orange-500/30">
                                                    {(translateSign(result.boy.moonSign, locale) || "S").substring(0, 1)}
                                                </div>
                                                <div className="text-[10px] font-black text-white uppercase tracking-tighter max-w-[80px] truncate">{boyData.name || "Boy"}</div>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <Heart className="w-8 h-8 fill-red-500 text-red-500 animate-[pulse_2s_infinite]" />
                                                <div className="w-12 h-[2px] bg-gradient-to-r from-orange-500 to-red-500 rounded-full mt-2" />
                                            </div>
                                            <div className="text-center group/girl">
                                                <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center text-2xl font-black mb-2 mx-auto shadow-xl group-hover/girl:scale-110 transition-transform border border-red-500/30">
                                                    {(translateSign(result.girl.moonSign, locale) || "S").substring(0, 1)}
                                                </div>
                                                <div className="text-[10px] font-black text-white uppercase tracking-tighter max-w-[80px] truncate">{girlData.name || "Girl"}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl flex overflow-x-auto gap-2 border border-white/10 shadow-xl sticky top-6 z-20 no-scrollbar">
                                    {[
                                        { id: 'overview', label: l('overview', "Overview"), icon: LayoutGrid },
                                        { id: 'ashtakoot', label: l('ashtakootGunaMilan', "Gun Milan"), icon: Sparkles },
                                        { id: 'doshas', label: l('doshaCheck', "Dosha Profile"), icon: ShieldCheck },
                                        { id: 'compatibility', label: l('compatibilityScore', "Compatibility"), icon: Heart },
                                        { id: 'lifeAreas', label: l('lifeAreas', "Life Areas"), icon: Zap },
                                        { id: 'conclusion', label: l('conclusion', "Verdict"), icon: CheckCircle2 },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === tab.id
                                                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-100"
                                                : "text-white/40 hover:text-white/70 hover:bg-white/5 scale-95"
                                                }`}
                                        >
                                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "animate-pulse" : ""}`} />
                                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">{tab.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="min-h-[400px]">
                                    {activeTab === 'overview' && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-sm">
                                                    <h4 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                                                        <User className="w-5 h-5 text-orange-500" /> {l('boy', 'Groom Details')}
                                                    </h4>
                                                    <div className="space-y-4 text-sm font-bold text-white/60">
                                                        <div className="flex justify-between border-b border-white/5 pb-2"><span>{l('seekerOfWisdom', 'Rashi')}</span><span className="text-orange-500">{translateSign(analysis.section1.groom.rashi, locale)}</span></div>
                                                        <div className="flex justify-between border-b border-white/5 pb-2"><span>{l('label_nakshatra', 'Nakshatra')}</span><span className="text-orange-500">{analysis.section1.groom.nakshatra}</span></div>
                                                        <div className="flex justify-between border-b border-white/5 pb-2"><span>{l('lagnaLabel', 'Lagna')}</span><span className="text-orange-500">{analysis.section1.groom.lagna}</span></div>
                                                    </div>
                                                </div>
                                                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-sm">
                                                    <h4 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                                                        <User className="w-5 h-5 text-red-500" /> {l('girl', 'Bride Details')}
                                                    </h4>
                                                    <div className="space-y-4 text-sm font-bold text-white/60">
                                                        <div className="flex justify-between border-b border-white/5 pb-2"><span>{l('seekerOfWisdom', 'Rashi')}</span><span className="text-red-500">{translateSign(analysis.section1.bride.rashi, locale)}</span></div>
                                                        <div className="flex justify-between border-b border-white/5 pb-2"><span>{l('label_nakshatra', 'Nakshatra')}</span><span className="text-red-500">{analysis.section1.bride.nakshatra}</span></div>
                                                        <div className="flex justify-between border-b border-white/5 pb-2"><span>{l('lagnaLabel', 'Lagna')}</span><span className="text-red-500">{analysis.section1.bride.lagna}</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-white/5 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/10">
                                                <div className="relative z-10">
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 mb-4">{l('executiveSummary', 'Executive Summary')}</h4>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                                        <div><div className="text-[10px] text-white/40 uppercase mb-1">{l('emotional_bond', 'Emotional')}</div><div className="text-lg font-black">{analysis.section2.emotional}</div></div>
                                                        <div><div className="text-[10px] text-white/40 uppercase mb-1">{l('physical_bond', 'Physical')}</div><div className="text-lg font-black">{analysis.section2.physical}</div></div>
                                                        <div><div className="text-[10px] text-white/40 uppercase mb-1">{l('finance_wealth', 'Financial')}</div><div className="text-lg font-black">{analysis.section2.financial}</div></div>
                                                        <div><div className="text-[10px] text-white/40 uppercase mb-1">{l('longevity_health', 'Longevity')}</div><div className="text-lg font-black">{analysis.section2.longevity}</div></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'ashtakoot' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                            {analysis.section3.table.map((row: any) => (
                                                <div key={row.name} className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform ${row.got === row.max ? "bg-orange-500 text-white" : row.got === 0 ? "bg-red-500 text-white" : "bg-red-400 text-white"}`}>
                                                            <span className="text-xl font-black leading-none">{row.got}</span>
                                                            <span className="text-[8px] font-black uppercase opacity-80">{l('table.obtained', 'Guna')}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <h4 className="font-black text-white capitalize text-lg tracking-tight">{row.name}</h4>
                                                            <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">{l('table.max', 'MAX')}: {row.max}</div>
                                                        </div>
                                                    </div>
                                                    <p className="text-[12px] leading-relaxed text-white/60 font-bold italic font-serif">{row.interp}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {activeTab === 'doshas' && (
                                        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] shadow-xl border border-white/10 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className={`p-8 rounded-[2.5rem] border-2 ${result.boy.doshas.Manglik.present ? "bg-red-500/10 border-red-500/20" : "bg-green-500/10 border-green-500/20"}`}>
                                                    <h5 className="font-black text-xl mb-4 text-white">{boyData.name}</h5>
                                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${result.boy.doshas.Manglik.present ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
                                                        {result.boy.doshas.Manglik.present ? l('manglikPresent', "Manglik") : l('manglikNotPresent', "Non-Manglik")}
                                                    </span>
                                                </div>
                                                <div className={`p-8 rounded-[2.5rem] border-2 ${result.girl.doshas.Manglik.present ? "bg-red-500/10 border-red-500/20" : "bg-green-500/10 border-green-500/20"}`}>
                                                    <h5 className="font-black text-xl mb-4 text-white">{girlData.name}</h5>
                                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${result.girl.doshas.Manglik.present ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
                                                        {result.girl.doshas.Manglik.present ? l('manglikPresent', "Manglik") : l('manglikNotPresent', "Non-Manglik")}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-8 p-8 bg-white/5 border border-white/10 text-white rounded-[2.5rem]">
                                                <h4 className="font-black text-orange-500 text-[10px] uppercase tracking-widest mb-2">{l('finalConsensus', 'Final Consensus')}</h4>
                                                <p className="text-xl font-black">{analyzeManglikCancellation(result.boy, result.girl, locale)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'compatibility' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-sm">
                                                <h4 className="text-xl font-black text-white mb-6">{l('boy', 'Groom')} {l('personalityTraits', 'Personality')}</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {analysis.section4.groomTraits.map((trait: string) => <span key={trait} className="px-4 py-2 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-xl text-xs font-black">{trait}</span>)}
                                                </div>
                                            </div>
                                            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-sm">
                                                <h4 className="text-xl font-black text-white mb-6">{l('girl', 'Bride')} {l('personalityTraits', 'Personality')}</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {analysis.section4.brideTraits.map((trait: string) => <span key={trait} className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-black">{trait}</span>)}
                                                </div>
                                            </div>
                                            {dynamicReport && (
                                                <div className="md:col-span-2 bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-xl">
                                                    <h4 className="text-2xl font-black mb-8 flex items-center gap-4 text-white">
                                                        <Heart className="w-8 h-8 text-red-500" /> {l('dynamicsBond', 'Dynamics & Bond')}
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                        <div>
                                                            <h5 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4">{l('emotional_bond', 'Emotional Connection')}</h5>
                                                            <p className="text-sm text-white/60 leading-relaxed font-bold italic font-serif">"{dynamicReport.bond.verdict}"</p>
                                                        </div>
                                                        <div>
                                                            <h5 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4">{l('nature_temperament', 'Nature Synchronization')}</h5>
                                                            <p className="text-sm text-white/60 leading-relaxed font-bold italic font-serif">"{dynamicReport.nature.verdict}"</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'lifeAreas' && dynamicReport && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                            {['finance', 'family', 'forecast'].map((sec) => {
                                                const data = (dynamicReport as any)[sec];
                                                if (!data) return null;
                                                return (
                                                    <div key={sec} className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-sm">
                                                        <h4 className="font-black text-white text-md uppercase mb-4">{l(sec === 'finance' ? 'finance_wealth' : sec === 'family' ? 'family_children' : 'life_forecast', data.title)}</h4>
                                                        <p className="text-sm text-white/60 leading-relaxed font-bold italic font-serif">"{data.verdict}"</p>
                                                    </div>
                                                );
                                            })}
                                            {!isAlreadyMarried ? (
                                                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-sm">
                                                    <h4 className="font-black text-orange-500 text-xs uppercase mb-4 tracking-widest">{l('marriageTiming', 'Marriage Window')}</h4>
                                                    {analysis.section14.periods.map((p: any) => (
                                                        <div key={p.time} className="flex justify-between items-center mb-2 last:mb-0 border-b border-white/5 pb-2">
                                                            <span className="font-bold text-white">{p.time}</span>
                                                            <span className="px-3 py-1 bg-orange-500/20 text-orange-500 rounded-lg text-[10px] font-black uppercase">{p.strength}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-sm flex flex-col justify-center items-center text-center p-6 min-h-[150px]">
                                                    <h4 className="font-black text-orange-500 text-xs uppercase mb-4 tracking-widest">{l('marriageTiming', 'Marriage Window')}</h4>
                                                    <Heart className="w-8 h-8 text-orange-500 mb-2 mt-2 animate-pulse" />
                                                    <p className="text-sm text-white font-bold">{locale === 'hi' ? 'पहले से विवाहित' : 'Already Married'}</p>
                                                    <span className="text-[10px] text-white/40 mt-1 max-w-[220px]">
                                                        {locale === 'hi'
                                                            ? 'यह रिपोर्ट पहले से विवाहित जोड़े के लिए है। विवाह के समय की भविष्यवाणियां छिपी हुई हैं।'
                                                            : 'This report is for an already married couple. Future marriage timing predictions are hidden.'
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'conclusion' && (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="bg-gradient-to-br from-orange-600 to-red-700 p-12 rounded-[4rem] text-white text-center shadow-2xl relative overflow-hidden">
                                                <h3 className="text-4xl md:text-5xl font-black mb-6">{l('finalVerdict', 'Final Divine Verdict')}</h3>
                                                <p className="text-2xl font-black italic font-serif text-white/90">"{analysis.finalVerdict.recommendation}"</p>
                                                <div className="mt-8 flex justify-center gap-4">
                                                    <Button onClick={handleDownloadPDF} className="bg-white text-orange-600 hover:bg-white/90 rounded-2xl h-14 px-8 font-black shadow-xl active:scale-95 transition-transform">{l('downloadReport', 'Download PDF')}</Button>
                                                </div>
                                            </div>
                                            <div className="bg-white/5 backdrop-blur-xl p-12 rounded-[4rem] border border-white/10 shadow-xl">
                                                <h4 className="text-2xl font-black mb-8 flex items-center gap-3 text-white">
                                                    <Zap className="w-8 h-8 text-orange-500" /> {l('remediesTitle', 'Professional Remedies')}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <h5 className="text-[10px] font-black text-white/40 uppercase tracking-widest">{l('boy', 'For Groom')}</h5>
                                                        {analysis.section15.boyRemedies.map((remedy: string) => <div key={remedy} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-xs font-bold italic font-serif text-white/60">"{remedy}"</div>)}
                                                    </div>
                                                    <div className="space-y-4">
                                                        <h5 className="text-[10px] font-black text-white/40 uppercase tracking-widest">{l('girl', 'For Bride')}</h5>
                                                        {analysis.section15.girlRemedies.map((remedy: string) => <div key={remedy} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-xs font-bold italic font-serif text-white/60">"{remedy}"</div>)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-20 bg-white/5 backdrop-blur-3xl border-2 border-dashed border-white/10 rounded-[4rem] min-h-[700px] relative overflow-hidden group shadow-inner">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                <div className="w-48 h-48 bg-white/10 shadow-2xl shadow-orange-500/10 text-orange-500 rounded-full flex items-center justify-center p-12 mb-10 group-hover:scale-110 transition-transform duration-700 relative z-10 border border-white/10">
                                    <Sparkles className="w-full h-full animate-pulse" />
                                </div>
                                <h3 className="text-4xl font-black text-white mb-6 relative z-10 tracking-tighter drop-shadow-sm">{l('beginCheckTitle', 'Begin Celestial Audit')}</h3>
                                <p className="text-white/40 max-w-sm relative z-10 font-bold text-lg leading-relaxed italic font-serif">"{l('beginCheckDesc', 'Enter details above to see compatibility report')}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />

            {/* Hidden PDF Export Sections (Snapshot Logic) */}
            {result && analysis && (
                <div ref={pdfHiddenRef} className="fixed -left-[9999px] top-0 bg-white text-slate-900 w-[800px] leading-relaxed">
                    <div id="pdf-details" className="p-16 bg-white min-h-[1100px]">
                        <h1 className="text-4xl font-black text-orange-600 border-b-8 border-orange-500 pb-4 mb-12 uppercase">{l('detailedAnalysis', '1. Birth Details')}</h1>
                        <table className="w-full text-left border-collapse border-2 border-slate-200">
                            <thead>
                                <tr className="bg-orange-500 text-white">
                                    <th className="p-6 text-xl border border-orange-600 font-black uppercase">{l('attribute', 'Field')}</th>
                                    <th className="p-6 text-xl border border-orange-600 font-black uppercase">{l('boy', 'Groom')}</th>
                                    <th className="p-6 text-xl border border-orange-600 font-black uppercase">{l('girl', 'Bride')}</th>
                                </tr>
                            </thead>
                            <tbody className="text-xl font-bold">
                                <tr className="bg-slate-50"><td className="p-6 border border-slate-200">{l('fullNameLabel', 'Name')}</td><td className="p-6 border border-slate-200">{boyData.name}</td><td className="p-6 border border-slate-200">{girlData.name}</td></tr>
                                <tr><td className="p-6 border border-slate-200">{l('manifestationDateLabel', 'Date')}</td><td className="p-6 border border-slate-200">{boyData.dob}</td><td className="p-6 border border-slate-200">{girlData.dob}</td></tr>
                                <tr className="bg-slate-50"><td className="p-6 border border-slate-200">{l('timeOfBreathLabel', 'Time')}</td><td className="p-6 border border-slate-200">{boyData.tob}</td><td className="p-6 border border-slate-200">{girlData.tob}</td></tr>
                                <tr><td className="p-6 border border-slate-200">{l('seekerOfWisdom', 'Rashi')}</td><td className="p-6 border border-slate-200 text-orange-600">{translateSign(analysis.section1.groom.rashi, locale)}</td><td className="p-6 border border-slate-200 text-red-600">{translateSign(analysis.section1.bride.rashi, locale)}</td></tr>
                                <tr className="bg-slate-50"><td className="p-6 border border-slate-200">{l('label_nakshatra', 'Nakshatra')}</td><td className="p-6 border border-slate-200">{analysis.section1.groom.nakshatra}</td><td className="p-6 border border-slate-200">{analysis.section1.bride.nakshatra}</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <div id="pdf-ashtakoot" className="p-16 bg-white min-h-[1100px]">
                        <h1 className="text-4xl font-black text-blue-600 border-b-8 border-blue-500 pb-4 mb-12 uppercase">{l('ashtakootGunaMilan', '2. Guna Milan Analysis')}</h1>
                        <table className="w-full text-left border-collapse border-2 border-slate-200">
                            <thead>
                                <tr className="bg-slate-800 text-white">
                                    <th className="p-6 text-xl border border-slate-700 font-black uppercase">{l('table.koota', 'Factor')}</th>
                                    <th className="p-6 text-xl border border-slate-700 font-black uppercase">{l('table.max', 'Max')}</th>
                                    <th className="p-6 text-xl border border-slate-700 font-black uppercase">{l('table.obtained', 'Got')}</th>
                                    <th className="p-6 text-xl border border-slate-700 font-black uppercase">{l('conclusion', 'Analysis')}</th>
                                </tr>
                            </thead>
                            <tbody className="text-lg font-bold">
                                {analysis.section3.table.map((row: any, i: number) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-slate-50" : ""}>
                                        <td className="p-6 border border-slate-200">{row.name}</td>
                                        <td className="p-6 border border-slate-200">{row.max}</td>
                                        <td className="p-6 border border-slate-200 text-orange-600">{row.got}</td>
                                        <td className="p-6 border border-slate-200 italic">"{row.interp}"</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div id="pdf-dynamics" className="p-16 bg-white min-h-[1100px]">
                        <h1 className="text-4xl font-black text-red-600 border-b-8 border-red-500 pb-4 mb-12 uppercase">{l('marriageAnalysis', '3. Relationship Dynamics')}</h1>
                        <div className="space-y-12">
                            {dynamicReport && ['bond', 'nature', 'finance', 'family', 'forecast'].map((key) => {
                                const data = (dynamicReport as any)[key];
                                return (
                                    <div key={key} className="border-l-8 border-slate-100 pl-8">
                                        <h3 className="text-2xl font-black text-slate-800 uppercase mb-4">{data.title}</h3>
                                        <p className="text-2xl text-slate-600 leading-relaxed italic">"{data.verdict}"</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div id="pdf-verdict" className="p-16 bg-white min-h-[1100px]">
                        <h1 className="text-4xl font-black text-orange-600 border-b-8 border-orange-500 pb-4 mb-12 uppercase">{l('finalVerdict', '4. Final Verdict')}</h1>
                        <div className="bg-orange-600 p-16 rounded-[4rem] text-white text-center mb-16">
                            <h2 className="text-4xl font-black mb-8 uppercase tracking-widest">{l('finalVerdict', 'Celestial Decree')}</h2>
                            <p className="text-3xl font-black italic">"{analysis.finalVerdict.recommendation}"</p>
                        </div>
                        <div className="grid grid-cols-2 gap-12">
                            <div>
                                <h3 className="text-xl font-black text-orange-600 uppercase mb-6">{l('boy', 'Groom Remedies')}</h3>
                                {analysis.section15.boyRemedies.map((r: string, i: number) => <p key={i} className="text-lg font-bold text-slate-600 mb-4 p-4 bg-slate-50 rounded-2xl italic">"{r}"</p>)}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-red-600 uppercase mb-6">{l('girl', 'Bride Remedies')}</h3>
                                {analysis.section15.girlRemedies.map((r: string, i: number) => <p key={i} className="text-lg font-bold text-slate-600 mb-4 p-4 bg-slate-50 rounded-2xl italic">"{r}"</p>)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main >
    );
}
