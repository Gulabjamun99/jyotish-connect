"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import { Sparkles, Heart, User, FileText, CheckCircle2, AlertCircle, LayoutGrid, Zap, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { LocationInput } from "@/components/kundli/LocationInput";
import { generateMatchVerdict, generateAshtakootAnalysis, generateDetailedMatchingReport, analyzeManglikCancellation, generateFullMatchAnalysis } from "@/lib/astrology/prediction-engine";
import { useLocale, useTranslations } from "next-intl";
import { translateSign } from "@/lib/astrology/i18n";

export default function MatchingPage() {
    const locale = useLocale();
    const t = useTranslations('Index');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const pdfContentRef = useRef<HTMLDivElement>(null);

    // Boy's Data
    const [boyData, setBoyData] = useState({
        name: "", dob: "", tob: "", birthplace: "", lat: 28.6139, lng: 77.2090
    });
    // Girl's Data
    const [girlData, setGirlData] = useState({
        name: "", dob: "", tob: "", birthplace: "", lat: 28.6139, lng: 77.2090
    });

    const [result, setResult] = useState<any>(null);
    const [analysis, setAnalysis] = useState<any>(null);

    const calculateMatch = async () => {
        setLoading(true);
        setCalcStep(0);

        // Progress animation steps matching the new high-precision engine
        const steps = [
            "Initializing Swiss Ephemeris WASM...",
            "Calculating planetary ephemeris (Lahiri)...",
            "Synthesizing 8 Koota points...",
            "Analyzing 100+ Yogas & Doshas...",
            "Constructing divisional charts (D9, D10, D60)..."
        ];

        for (let i = 0; i < steps.length; i++) {
            setCalcStep(i);
            await new Promise(r => setTimeout(r, 800));
        }

        try {
            const bDate = new Date(`${boyData.dob}T${boyData.tob || "12:00"}`);
            const gDate = new Date(`${girlData.dob}T${girlData.tob || "12:00"}`);

            // Call the unified server-side API instead of importing directly to avoid WASM/Node bundling issues
            const response = await fetch('/api/astrology/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: "match",
                    data: {
                        boyDetails: { 
                            date: bDate, 
                            lat: boyData.lat, 
                            lng: boyData.lng, 
                            name: boyData.name, 
                            birthplace: boyData.birthplace 
                        },
                        girlDetails: { 
                            date: gDate, 
                            lat: girlData.lat, 
                            lng: girlData.lng, 
                            name: girlData.name, 
                            birthplace: girlData.birthplace 
                        }
                    }
                })
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const matchResult = await response.json();
            const fullAnalysis = generateFullMatchAnalysis(matchResult, locale);
            setResult(matchResult);
            setAnalysis(fullAnalysis);

            setTimeout(() => {
                document.getElementById("results")?.scrollIntoView({ behavior: 'smooth' });
            }, 100);

            toast.success("Swiss Ephemeris Report Generated!");
        } catch (err) {
            console.error(err);
            toast.error("Calculation Failed. check SwissEph initialization.");
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsAppShare = () => {
        if (!result) return;
        const text = `*JyotishConnect Match Report*%0A*Score:* ${result.milan.totalScore}/36%0A*Boy:* ${result.boy.name}%0A*Girl:* ${result.girl.name}%0ACheck detailed analysis at JyotishConnect!`;
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const [calcStep, setCalcStep] = useState(0);
    const steps = [
        "Analyzing planetary positions...",
        "Synchronizing 8-fold compatibility...",
        "Detecting Manglik & Nadi Doshas...",
        "Checking Navamsa (D9) spiritual bond...",
        "Generating 12-year forecast..."
    ];

    const handleDownloadPDF = async () => {
        if (!result) return;

        toast.loading("Preparing your divine report...", { id: "pdf-match" });

        const captureSection = async (elementId: string): Promise<string | null> => {
            const element = document.getElementById(elementId);
            if (!element) return null;
            try {
                const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: "#ffffff",
                    logging: false
                });
                return canvas.toDataURL('image/jpeg', 0.85);
            } catch (e) {
                console.error(`Failed to capture section ${elementId}:`, e);
                return null;
            }
        };

        const doc = new jsPDF('p', 'mm', 'a4');
        
        // --- PREPARE ASSETS ---
        let logoBase64: string | null = null;
        try {
            const response = await fetch('/logo.png');
            const blob = await response.blob();
            logoBase64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
        } catch (e) { console.warn("Logo fetch failed"); }

        // --- Capture Sections ---
        const [overviewImg, detailsImg, compatibilityImg, lifeAreasImg, remediesImg] = await Promise.all([
            captureSection("pdf-match-overview"),
            captureSection("pdf-match-details"),
            captureSection("pdf-match-compatibility"),
            captureSection("pdf-match-life-areas"),
            captureSection("pdf-match-findings")
        ]);

        const addFooter = (page: number) => {
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${page} | JyotishConnect Certified Match`, 105, 285, { align: "center" });
        };

        // Page 1: Overview
        if (overviewImg) {
            doc.addImage(overviewImg, 'JPEG', 0, 0, 210, 297);
            if (logoBase64) doc.addImage(logoBase64, 'PNG', 15, 10, 30, 9);
            addFooter(1);
        }

        // Page 2: Details
        if (detailsImg) {
            doc.addPage();
            doc.addImage(detailsImg, 'JPEG', 0, 0, 210, 297);
            if (logoBase64) doc.addImage(logoBase64, 'PNG', 15, 10, 30, 9);
            addFooter(2);
        }

        // Page 3: Compatibility
        if (compatibilityImg) {
            doc.addPage();
            doc.addImage(compatibilityImg, 'JPEG', 0, 0, 210, 297);
            if (logoBase64) doc.addImage(logoBase64, 'PNG', 15, 10, 30, 9);
            addFooter(3);
        }

        // Page 4: Life Areas
        if (lifeAreasImg) {
            doc.addPage();
            doc.addImage(lifeAreasImg, 'JPEG', 0, 0, 210, 297);
            if (logoBase64) doc.addImage(logoBase64, 'PNG', 15, 10, 30, 9);
            addFooter(4);
        }

        // Page 5: Findings & Remedies
        if (remediesImg) {
            doc.addPage();
            doc.addImage(remediesImg, 'JPEG', 0, 0, 210, 297);
            if (logoBase64) doc.addImage(logoBase64, 'PNG', 15, 10, 30, 9);
            addFooter(5);
        }

        toast.success("Match Report ready!", { id: "pdf-match" });
        doc.save(`Kundli_Report_${boyData.name.replace(/\s+/g, '_')}_${girlData.name.replace(/\s+/g, '_')}.pdf`);
    };

    return (
        <main className="min-h-screen bg-[#F0F7FF] dark:bg-slate-950 overflow-x-hidden selection:bg-blue-500/30">
            <Navbar />
            <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
                <header className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/80 backdrop-blur-md border border-blue-200 text-blue-600 rounded-full text-[10px] font-black tracking-[0.2em] uppercase shadow-sm">
                        <Sparkles className="w-4 h-4 text-blue-500" /> {t('premiumVedicReport')}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
                        {t('matching_title').split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">{t('matching_title').split(' ')[1] || 'Matching'}</span>
                    </h1>
                    <p className="text-blue-900/60 dark:text-slate-400 max-w-2xl mx-auto font-bold text-lg leading-relaxed">
                        {t('matching_desc')}
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Input Forms */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white/80 backdrop-blur-xl dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-blue-100 dark:border-slate-800 sticky top-24">
                            <div className="mb-10 relative group">
                                <div className="absolute -left-6 top-0 w-2 h-full bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)]" />
                                <h3 className="text-2xl font-black text-blue-900 dark:text-white mb-8 flex items-center gap-4">
                                    <span className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">♂</span>
                                    {t('boyIdentityTitle')}
                                </h3>
                                <div className="space-y-5">
                                    <Input placeholder={t('enterNamePlaceholder')} value={boyData.name} onChange={e => setBoyData({ ...boyData, name: e.target.value })} className="bg-blue-50/50 dark:bg-slate-800 h-16 border-blue-100 placeholder:text-blue-200 focus:ring-4 focus:ring-blue-500/10 rounded-2xl font-black text-lg shadow-inner" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input type="date" value={boyData.dob} onChange={e => setBoyData({ ...boyData, dob: e.target.value })} className="bg-blue-50/50 dark:bg-slate-800 h-16 border-blue-100 rounded-2xl font-bold italic" />
                                        <Input type="time" value={boyData.tob} onChange={e => setBoyData({ ...boyData, tob: e.target.value })} className="bg-blue-50/50 dark:bg-slate-800 h-16 border-blue-100 rounded-2xl font-bold italic" />
                                    </div>
                                    <LocationInput value={boyData.birthplace} onChange={(loc, lat, lng) => setBoyData({ ...boyData, birthplace: loc, lat: lat || 28.6, lng: lng || 77.2 })} />
                                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest flex items-center gap-2"><AlertCircle className="w-4 h-4" /> ±2min accuracy critical for D9 chart</p>
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="absolute -left-6 top-0 w-2 h-full bg-purple-500 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.4)]" />
                                <h3 className="text-2xl font-black text-purple-900 dark:text-white mb-8 flex items-center gap-4">
                                    <span className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-inner">♀</span>
                                    {t('girlIdentityTitle')}
                                </h3>
                                <div className="space-y-5">
                                    <Input placeholder={t('enterNamePlaceholder')} value={girlData.name} onChange={e => setGirlData({ ...girlData, name: e.target.value })} className="bg-purple-50/50 dark:bg-slate-800 h-16 border-purple-100 placeholder:text-purple-200 focus:ring-4 focus:ring-purple-500/10 rounded-2xl font-black text-lg shadow-inner" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input type="date" value={girlData.dob} onChange={e => setGirlData({ ...girlData, dob: e.target.value })} className="bg-purple-50/50 dark:bg-slate-800 h-16 border-purple-100 rounded-2xl font-bold italic" />
                                        <Input type="time" value={girlData.tob} onChange={e => setGirlData({ ...girlData, tob: e.target.value })} className="bg-purple-50/50 dark:bg-slate-800 h-16 border-purple-100 rounded-2xl font-bold italic" />
                                    </div>
                                    <LocationInput value={girlData.birthplace} onChange={(loc, lat, lng) => setGirlData({ ...girlData, birthplace: loc, lat: lat || 28.6, lng: lng || 77.2 })} />
                                </div>
                            </div>

                            <Button onClick={calculateMatch} disabled={loading} className="w-full h-20 mt-12 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all rounded-[2rem] text-xl font-black shadow-xl shadow-blue-500/25 border-t-2 border-white/20">
                                {loading ? (
                                    <div className="flex flex-col items-center">
                                        <span className="animate-pulse">{t('calculatingOrbits')}</span>
                                        <span className="text-[10px] font-black opacity-80 tracking-[0.2em] uppercase mt-1">{steps[calcStep]}</span>
                                    </div>
                                ) : (
                                    <span className="flex items-center gap-3">
                                        {t('establishCelestialMatch')} <Sparkles className="w-6 h-6 animate-pulse" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="lg:col-span-8">
                        {result ? (
                            <div id="results" className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                {/* Enhanced Hero Score Card */}
                                <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-blue-100 dark:border-slate-800 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32 transition-all group-hover:blur-[120px]" />
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                                        <div className="text-center md:text-left space-y-4">
                                            <div className="inline-flex items-center gap-2 px-4 py-1 bg-blue-50 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-500">{t('compatibilityScore')}</div>
                                            <div className="flex items-center justify-center md:justify-start gap-6">
                                                <div className="relative w-40 h-40 flex items-center justify-center group/score">
                                                    <svg className="w-full h-full transform -rotate-90">
                                                        <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-blue-50/50 dark:text-slate-800/50" />
                                                        <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="16" fill="transparent" strokeDasharray={452.4} strokeDashoffset={452.4 - (452.4 * result.milan.totalScore / 36)} strokeLinecap="round" className={`${result.milan.totalScore >= 25 ? "text-blue-500" : result.milan.totalScore >= 18 ? "text-indigo-500" : "text-amber-500"} transition-all duration-1500 ease-out drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]`} />
                                                    </svg>
                                                    <div className="absolute text-center">
                                                        <div className="text-6xl font-black text-blue-900 dark:text-white leading-none tracking-tighter">{result.milan.totalScore}</div>
                                                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Gunas</div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className={`text-3xl font-black tracking-tighter ${result.milan.totalScore >= 25 ? "text-blue-600" : result.milan.totalScore >= 18 ? "text-indigo-600" : "text-amber-600"}`}>
                                                        {result.milan.totalScore >= 25 ? "Divine Union" : result.milan.totalScore >= 18 ? "Auspicious Match" : "Consult Astrologer"}
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-slate-800 rounded-xl text-[10px] font-black text-blue-700 dark:text-slate-300 uppercase tracking-wider">
                                                            {result.milan.totalScore >= 18 ? <ShieldCheck className="w-4 h-4 text-blue-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                                                            {result.milan.totalScore >= 18 ? "Heavenly Sanctioned" : "Guided Action Needed"}
                                                        </div>
                                                        <div className="text-[12px] font-bold text-blue-900/40 leading-relaxed max-w-xs italic font-serif">"{t('match_prediction_brief')}"</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 bg-slate-50/50 dark:bg-slate-800/30 p-8 rounded-[2.5rem] border border-slate-100/50 dark:border-slate-800 backdrop-blur-md shadow-inner">
                                            <div className="text-center group/boy">
                                                <div className="w-20 h-20 rounded-3xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-3xl font-black mb-3 mx-auto shadow-xl group-hover/boy:scale-110 transition-transform">
                                                    {(translateSign(result.boy.moonSign, locale) || "S").substring(0, 1)}
                                                </div>
                                                <div className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">{result.boy.name || "Boy"}</div>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="relative">
                                                    <Heart className="w-10 h-10 fill-pink-500 text-pink-500 animate-[pulse_2s_infinite] drop-shadow-[0_0_10px_rgba(236,72,153,0.4)]" />
                                                    <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-yellow-400 animate-spin" />
                                                </div>
                                                <div className="w-16 h-[3px] bg-gradient-to-r from-blue-400 via-pink-500 to-pink-400 rounded-full mt-3 shadow-sm" />
                                            </div>
                                            <div className="text-center group/girl">
                                                <div className="w-20 h-20 rounded-3xl bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400 flex items-center justify-center text-3xl font-black mb-3 mx-auto shadow-xl group-hover/girl:scale-110 transition-transform">
                                                    {(translateSign(result.girl.moonSign, locale) || "S").substring(0, 1)}
                                                </div>
                                                <div className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">{result.girl.name || "Girl"}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Premium Tabs Navigation */}
                                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-2 rounded-[2.5rem] flex overflow-x-auto gap-2 border border-blue-50 dark:border-slate-800 shadow-xl sticky top-6 z-20">
                                    {[
                                        { id: 'overview', label: "Personal & Score", icon: LayoutGrid },
                                        { id: 'ashtakoot', label: "Gun Milan", icon: Sparkles },
                                        { id: 'doshas', label: "Dosha Profile", icon: ShieldCheck },
                                        { id: 'compatibility', label: "Compatibility", icon: Heart },
                                        { id: 'lifeAreas', label: "Life & Future", icon: Zap },
                                        { id: 'conclusion', label: "Verdict & Remedies", icon: CheckCircle2 },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex-1 min-w-[150px] flex items-center justify-center gap-3 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === tab.id
                                                ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl shadow-blue-500/40 scale-100"
                                                : "text-blue-900/60 hover:text-blue-900 dark:text-slate-400 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-slate-800 scale-95"
                                                }`}
                                        >
                                            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "animate-pulse" : ""}`} /> {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Tab Content */}
                                <div className="min-h-[400px]">
                                    {activeTab === 'overview' && analysis && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-white/80 backdrop-blur-xl dark:bg-slate-900 p-8 rounded-[2.5rem] border border-blue-50 dark:border-slate-800 shadow-sm">
                                                    <h4 className="text-xl font-black text-blue-900 dark:text-white mb-6 flex items-center gap-2">
                                                        <User className="w-5 h-5" /> Groom Details
                                                    </h4>
                                                    <div className="space-y-4 text-sm font-bold text-slate-600 dark:text-slate-400">
                                                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2"><span>Rashi</span><span className="text-blue-600">{translateSign(analysis.section1.groom.rashi, locale)}</span></div>
                                                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2"><span>Nakshatra</span><span className="text-blue-600">{analysis.section1.groom.nakshatra}</span></div>
                                                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2"><span>Lagna</span><span className="text-blue-600">{analysis.section1.groom.lagna}</span></div>
                                                    </div>
                                                </div>
                                                <div className="bg-white/80 backdrop-blur-xl dark:bg-slate-900 p-8 rounded-[2.5rem] border border-purple-50 dark:border-slate-800 shadow-sm">
                                                    <h4 className="text-xl font-black text-purple-900 dark:text-white mb-6 flex items-center gap-2">
                                                        <User className="w-5 h-5" /> Bride Details
                                                    </h4>
                                                    <div className="space-y-4 text-sm font-bold text-slate-600 dark:text-slate-400">
                                                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2"><span>Rashi</span><span className="text-purple-600">{translateSign(analysis.section1.bride.rashi, locale)}</span></div>
                                                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2"><span>Nakshatra</span><span className="text-purple-600">{analysis.section1.bride.nakshatra}</span></div>
                                                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2"><span>Lagna</span><span className="text-purple-600">{analysis.section1.bride.lagna}</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-blue-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                                                <div className="relative z-10">
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-4">Executive Summary</h4>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                                        <div><div className="text-[10px] text-blue-300 uppercase mb-1">Emotional</div><div className="text-lg font-black">{analysis.section2.emotional}</div></div>
                                                        <div><div className="text-[10px] text-blue-300 uppercase mb-1">Physical</div><div className="text-lg font-black">{analysis.section2.physical}</div></div>
                                                        <div><div className="text-[10px] text-blue-300 uppercase mb-1">Financial</div><div className="text-lg font-black">{analysis.section2.financial}</div></div>
                                                        <div><div className="text-[10px] text-blue-300 uppercase mb-1">Longevity</div><div className="text-lg font-black">{analysis.section2.longevity}</div></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'ashtakoot' && analysis && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                            {analysis.section3.table.map((row: any) => (
                                                <div key={row.name} className="bg-white/80 backdrop-blur-xl dark:bg-slate-900 p-8 rounded-[2.5rem] border border-blue-50 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform ${row.got === row.max ? "bg-blue-600 text-white" : row.got === 0 ? "bg-amber-600 text-white" : "bg-indigo-500 text-white"}`}>
                                                            <span className="text-xl font-black leading-none">{row.got}</span>
                                                            <span className="text-[8px] font-black uppercase opacity-80">Guna</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <h4 className="font-black text-blue-900 dark:text-white capitalize text-lg tracking-tight">{row.name}</h4>
                                                            <div className="text-[10px] font-black text-blue-200 uppercase tracking-widest">MAX: {row.max}</div>
                                                        </div>
                                                    </div>
                                                    <p className="text-[12px] leading-relaxed text-blue-900/50 dark:text-slate-400 font-bold italic font-serif">
                                                        {row.interp}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {activeTab === 'doshas' && (
                                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className={`p-8 rounded-[2.5rem] border-2 ${result.boy.doshas.Manglik.present ? "bg-red-50/30 border-red-200" : "bg-green-50/30 border-green-200"}`}>
                                                    <h5 className="font-black text-xl mb-4">{result.boy.name}</h5>
                                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${result.boy.doshas.Manglik.present ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
                                                        {result.boy.doshas.Manglik.present ? "Manglik" : "Non-Manglik"}
                                                    </span>
                                                </div>
                                                <div className={`p-8 rounded-[2.5rem] border-2 ${result.girl.doshas.Manglik.present ? "bg-red-50/30 border-red-200" : "bg-green-50/30 border-green-200"}`}>
                                                    <h5 className="font-black text-xl mb-4">{result.girl.name}</h5>
                                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${result.girl.doshas.Manglik.present ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
                                                        {result.girl.doshas.Manglik.present ? "Manglik" : "Non-Manglik"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-8 p-8 bg-slate-900 text-white rounded-[2.5rem]">
                                                <h4 className="font-black text-red-500 text-[10px] uppercase tracking-widest mb-2">Final Consensus</h4>
                                                <p className="text-xl font-black">{analyzeManglikCancellation(result.boy, result.girl, locale)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'compatibility' && analysis && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-blue-50 dark:border-slate-800 shadow-sm">
                                                <h4 className="text-xl font-black text-blue-900 dark:text-white mb-6">Groom Personality</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {analysis.section4.groomTraits.map((t: string) => <span key={t} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl text-xs font-black">{t}</span>)}
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-purple-50 dark:border-slate-800 shadow-sm">
                                                <h4 className="text-xl font-black text-purple-900 dark:text-white mb-6">Bride Personality</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {analysis.section4.brideTraits.map((t: string) => <span key={t} className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl text-xs font-black">{t}</span>)}
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                                                <h4 className="text-2xl font-black mb-8 flex items-center gap-4">
                                                    <Heart className="w-8 h-8 text-pink-500" /> Dynamics & Bond
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                    <div>
                                                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Emotional Connection</h5>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-bold italic font-serif">"{generateDetailedMatchingReport(result, locale).bond.verdict}"</p>
                                                    </div>
                                                    <div>
                                                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Nature Synchronization</h5>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-bold italic font-serif">"{generateDetailedMatchingReport(result, locale).nature.verdict}"</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'lifeAreas' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                            {['finance', 'family', 'timing'].map((sec) => {
                                                const data = generateDetailedMatchingReport(result, locale)[sec];
                                                return (
                                                    <div key={sec} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                                                        <h4 className="font-black text-slate-900 dark:text-white text-md uppercase mb-4">{data.title}</h4>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-bold italic font-serif">"{data.verdict}"</p>
                                                    </div>
                                                );
                                            })}
                                            <div className="bg-indigo-900 p-8 rounded-[2.5rem] text-white">
                                                <h4 className="font-black text-indigo-400 text-xs uppercase mb-4 tracking-widest">Marriage Window</h4>
                                                {analysis.section14.periods.map((p: any) => (
                                                    <div key={p.time} className="flex justify-between items-center mb-2 last:mb-0">
                                                        <span className="font-bold">{p.time}</span>
                                                        <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase">{p.strength}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'conclusion' && analysis && (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="bg-gradient-to-br from-blue-900 to-indigo-950 p-12 rounded-[4rem] text-white text-center shadow-2xl relative overflow-hidden">
                                                <h3 className="text-4xl md:text-5xl font-black mb-6">Final Divine Verdict</h3>
                                                <p className="text-2xl font-black italic font-serif text-blue-200">"{analysis.finalVerdict.recommendation}"</p>
                                                <div className="mt-8 flex justify-center gap-4">
                                                    <Button onClick={handleDownloadPDF} className="bg-white text-slate-900 rounded-2xl h-14 px-8 font-black">Download PDF</Button>
                                                </div>
                                            </div>
                                            <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] border border-pink-100 dark:border-slate-800 shadow-xl">
                                                <h4 className="text-2xl font-black mb-8 flex items-center gap-3">
                                                    <Zap className="w-8 h-8 text-yellow-500" /> Professional Remedies
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">For Groom</h5>
                                                        {analysis.section15.boyRemedies.map((r: string) => <div key={r} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs font-bold italic font-serif">"{r}"</div>)}
                                                    </div>
                                                    <div className="space-y-4">
                                                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">For Bride</h5>
                                                        {analysis.section15.girlRemedies.map((r: string) => <div key={r} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs font-bold italic font-serif">"{r}"</div>)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-20 bg-white/40 backdrop-blur-3xl border-2 border-dashed border-blue-200 dark:border-slate-800 rounded-[4rem] min-h-[700px] relative overflow-hidden group shadow-inner">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/20 to-indigo-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                <div className="w-48 h-48 bg-white shadow-2xl shadow-blue-500/10 text-blue-500 rounded-full flex items-center justify-center p-12 mb-10 group-hover:scale-110 transition-transform duration-700 relative z-10">
                                    <Sparkles className="w-full h-full animate-pulse" />
                                </div>
                                <h3 className="text-4xl font-black text-blue-900 dark:text-white mb-6 relative z-10 tracking-tighter drop-shadow-sm">{t('beginCheckTitle')}</h3>
                                <p className="text-blue-900/40 dark:text-slate-400 max-w-sm relative z-10 font-bold text-lg leading-relaxed italic font-serif">"{t('beginCheckDesc')}"</p>
                                <div className="mt-16 flex gap-8 opacity-30 relative z-10">
                                    <div className="p-4 bg-white rounded-2xl shadow-lg border border-blue-50 transform -rotate-12 group-hover:rotate-0 transition-transform"><Heart className="w-8 h-8 fill-blue-500 text-blue-500" /></div>
                                    <div className="p-4 bg-white rounded-2xl shadow-lg border border-purple-50 transform rotate-12 group-hover:rotate-0 transition-transform"><Sparkles className="w-8 h-8 fill-purple-500 text-purple-500" /></div>
                                    <div className="p-4 bg-white rounded-2xl shadow-lg border border-indigo-50 transform -rotate-6 group-hover:rotate-0 transition-transform"><ShieldCheck className="w-8 h-8 fill-indigo-500 text-indigo-500" /></div>
                                </div>
                                <div className="absolute bottom-10 animate-bounce text-blue-300">
                                    <Zap className="w-6 h-6 fill-current" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />

            {/* Hidden PDF Export Content for Matching */}
            {result && (
                <div 
                    ref={pdfContentRef}
                    className="fixed -left-[9999px] top-0 bg-white p-10 text-slate-900 w-[800px] leading-relaxed"
                >
                    {/* Page 1: PERSONAL DETAILS & SUMMARY */}
                    <div id="pdf-match-overview" className="p-16 bg-white min-h-[1100px] border-[16px] border-blue-600/5">
                        <div className="flex justify-between items-start border-b-8 border-blue-600 pb-10 mb-12">
                            <div>
                                <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-2">Kundli Milan</h1>
                                <p className="text-blue-600 font-black tracking-[0.3em] uppercase text-xs">Premium Marriage Compatibility Analysis</p>
                            </div>
                            <div className="text-right">
                                <div className="text-6xl font-black text-blue-600">{result.milan.totalScore} / 36</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Divine Guna Score</div>
                            </div>
                        </div>

                        <div className="mb-12">
                            <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight mb-8 bg-blue-50 py-3 px-6 rounded-xl border-l-8 border-blue-600">Section 1 — Personal Details</h2>
                            <div className="grid grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <h3 className="text-blue-600 font-black text-sm uppercase">Groom: {analysis.section1.groom.name}</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between border-b pb-1 text-slate-500"><span>Date of Birth</span><span className="font-bold text-slate-900">{analysis.section1.groom.dob}</span></div>
                                        <div className="flex justify-between border-b pb-1 text-slate-500"><span>Time of Birth</span><span className="font-bold text-slate-900">{analysis.section1.groom.tob}</span></div>
                                        <div className="flex justify-between border-b pb-1 text-slate-500"><span>Birth Place</span><span className="font-bold text-slate-900">{analysis.section1.groom.pob}</span></div>
                                        <div className="flex justify-between border-b pb-1 text-slate-500"><span>Zodiac Sign</span><span className="font-bold text-slate-900">{analysis.section1.groom.rashi}</span></div>
                                        <div className="flex justify-between border-b pb-1 text-slate-500"><span>Nakshatra</span><span className="font-bold text-slate-900">{analysis.section1.groom.nakshatra}</span></div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-purple-600 font-black text-sm uppercase">Bride: {analysis.section1.bride.name}</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between border-b pb-1 text-slate-500"><span>Date of Birth</span><span className="font-bold text-slate-900">{analysis.section1.bride.dob}</span></div>
                                        <div className="flex justify-between border-b pb-1 text-slate-500"><span>Time of Birth</span><span className="font-bold text-slate-900">{analysis.section1.bride.tob}</span></div>
                                        <div className="flex justify-between border-b pb-1 text-slate-500"><span>Birth Place</span><span className="font-bold text-slate-900">{analysis.section1.bride.pob}</span></div>
                                        <div className="flex justify-between border-b pb-1 text-slate-500"><span>Zodiac Sign</span><span className="font-bold text-slate-900">{analysis.section1.bride.rashi}</span></div>
                                        <div className="flex justify-between border-b pb-1 text-slate-500"><span>Nakshatra</span><span className="font-bold text-slate-900">{analysis.section1.bride.nakshatra}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight mb-8 bg-blue-50 py-3 px-6 rounded-xl border-l-8 border-blue-600">Section 2 — Overall Match Summary</h2>
                            <div className="grid grid-cols-2 gap-8 mb-10">
                                <div className="p-6 bg-slate-50 rounded-2xl">
                                    <div className="text-[10px] font-black text-slate-400 uppercase mb-4">Core Dimensions</div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between"><span>Emotional Bond</span><span className="font-black">{analysis.section2.emotional}</span></div>
                                        <div className="flex justify-between"><span>Physical Attraction</span><span className="font-black">{analysis.section2.physical}</span></div>
                                        <div className="flex justify-between"><span>Financial Outlook</span><span className="font-black">{analysis.section2.financial}</span></div>
                                        <div className="flex justify-between"><span>Family Environment</span><span className="font-black">{analysis.section2.family}</span></div>
                                    </div>
                                </div>
                                <div className="p-6 bg-blue-900 text-white rounded-2xl">
                                    <div className="text-[10px] font-black text-blue-400 uppercase mb-4">Divine Verdict</div>
                                    <div className="text-xl font-black mb-2">{analysis.section2.quality}</div>
                                    <p className="text-xs text-blue-200 italic font-serif">"{analysis.section2.recommendation}"</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Page 2: ASHTAKOOT GUN MILAN ANALYSIS */}
                    <div id="pdf-match-details" className="p-16 bg-white min-h-[1100px]">
                        <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight mb-8 bg-blue-50 py-3 px-6 rounded-xl border-l-8 border-blue-600">Section 3 — Ashtakoot Gun Milan</h2>
                        <table className="w-full border-collapse mb-12">
                            <thead>
                                <tr className="bg-slate-900 text-white text-[10px]">
                                    <th className="p-4 text-left border">COMPATIBILITY FACTOR</th>
                                    <th className="p-4 text-center border">MAX</th>
                                    <th className="p-4 text-center border">OBTAINED</th>
                                    <th className="p-4 text-left border">INTERPRETATION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analysis.section3.table.map((row: any) => (
                                    <tr key={row.name} className="text-xs">
                                        <td className="p-4 border font-black uppercase text-slate-600">{row.name}</td>
                                        <td className="p-4 border text-center font-bold">{row.max}</td>
                                        <td className="p-4 border text-center font-black text-blue-600">{row.got}</td>
                                        <td className="p-4 border italic font-serif text-slate-500">{row.interp}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-8 bg-amber-50 border-l-8 border-amber-500 rounded-xl">
                            <h4 className="font-black text-amber-900 mb-2 uppercase text-xs">Auspicious Note</h4>
                            <p className="text-sm italic font-serif text-amber-800">"The Guna Milan of {result.milan.totalScore} points indicates a high degree of cosmic synchronization between the two charts, ensuring a balanced and purposeful union."</p>
                        </div>
                    </div>

                    {/* Page 3: PERSONALITY & DYNAMICS */}
                    <div id="pdf-match-compatibility" className="p-16 bg-white min-h-[1100px]">
                        <div className="mb-12">
                            <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight mb-8 bg-blue-50 py-3 px-6 rounded-xl border-l-8 border-blue-600">Section 4 — Personality Analysis</h2>
                            <div className="grid grid-cols-2 gap-10">
                                <div>
                                    <h4 className="text-blue-600 font-black text-xs uppercase mb-4">Groom Attributes</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.section4.groomTraits.map((t: string) => <span key={t} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black border border-blue-100">{t}</span>)}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-purple-600 font-black text-xs uppercase mb-4">Bride Attributes</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.section4.brideTraits.map((t: string) => <span key={t} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-[10px] font-black border border-purple-100">{t}</span>)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-12">
                            <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight mb-8 bg-blue-50 py-3 px-6 rounded-xl border-l-8 border-blue-600">Section 5 — Relationship Dynamics</h2>
                            <div className="p-8 bg-slate-50 rounded-3xl space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Synergy Outlook</h4>
                                    <p className="text-sm italic font-serif text-slate-700 leading-relaxed">"{generateDetailedMatchingReport(result, locale).bond.verdict}"</p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nature & Temperament</h4>
                                    <p className="text-sm italic font-serif text-slate-700 leading-relaxed">"{generateDetailedMatchingReport(result, locale).nature.verdict}"</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight mb-8 bg-blue-50 py-3 px-6 rounded-xl border-l-8 border-blue-600">Section 7 — Manglik Dosha Analysis</h2>
                            <div className="grid grid-cols-2 gap-8">
                                <div className={`p-6 rounded-2xl border-2 ${result.boy.doshas.Manglik.present ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
                                    <div className="text-[10px] font-black text-slate-400 uppercase mb-2">Groom Status</div>
                                    <div className="text-lg font-black">{analysis.section7.boyStatus}</div>
                                </div>
                                <div className={`p-6 rounded-2xl border-2 ${result.girl.doshas.Manglik.present ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
                                    <div className="text-[10px] font-black text-slate-400 uppercase mb-2">Bride Status</div>
                                    <div className="text-lg font-black">{analysis.section7.girlStatus}</div>
                                </div>
                            </div>
                            <div className="mt-8 p-8 bg-slate-900 text-white rounded-3xl">
                                <h4 className="text-red-500 font-black text-[10px] uppercase tracking-widest mb-4">Martial Consensus</h4>
                                <p className="text-lg font-black">{analysis.section7.verdict}</p>
                            </div>
                        </div>
                    </div>

                    {/* Page 4: LIFE AREAS & FUTURE */}
                    <div id="pdf-match-life-areas" className="p-16 bg-white min-h-[1100px]">
                        <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight mb-8 bg-blue-50 py-3 px-6 rounded-xl border-l-8 border-blue-600">Section 10-13 — Life Dimensions</h2>
                        <div className="space-y-10">
                            {['finance', 'family', 'timing'].map((sec) => {
                                const data = generateDetailedMatchingReport(result, locale)[sec];
                                return (
                                    <div key={sec} className="border-b pb-8">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-3">{data.title}</h3>
                                        <p className="text-sm italic font-serif text-slate-600 leading-relaxed">"{data.verdict}"</p>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-12">
                            <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight mb-8 bg-blue-50 py-3 px-6 rounded-xl border-l-8 border-blue-600">Section 14 — Favorable Marriage Period</h2>
                            <div className="grid grid-cols-2 gap-8">
                                {analysis.section14.periods.map((p: any) => (
                                    <div key={p.time} className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex justify-between items-center">
                                        <span className="font-black text-blue-900">{p.time}</span>
                                        <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg">{p.strength}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Page 5: REMEDIES & FINAL VERDICT */}
                    <div id="pdf-match-findings" className="p-16 bg-white min-h-[1100px]">
                        <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight mb-8 bg-blue-50 py-3 px-6 rounded-xl border-l-8 border-blue-600">Section 15 — Astrological Remedies</h2>
                        <div className="grid grid-cols-2 gap-10 mb-12">
                            <div className="space-y-6">
                                <h4 className="text-blue-600 font-black text-xs uppercase">Groom Recommendations</h4>
                                {analysis.section15.boyRemedies.map((r: string) => <div key={r} className="p-4 bg-slate-50 rounded-xl text-xs font-bold italic font-serif">"{r}"</div>)}
                            </div>
                            <div className="space-y-6">
                                <h4 className="text-purple-600 font-black text-xs uppercase">Bride Recommendations</h4>
                                {analysis.section15.girlRemedies.map((r: string) => <div key={r} className="p-4 bg-slate-50 rounded-xl text-xs font-bold italic font-serif">"{r}"</div>)}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-blue-900 uppercase tracking-tight mb-8 bg-blue-50 py-3 px-6 rounded-xl border-l-8 border-blue-600">Section 16 — Final Astrological Verdict</h2>
                            <div className="p-12 bg-gradient-to-br from-blue-600 to-indigo-900 text-white rounded-[4rem] text-center shadow-2xl relative overflow-hidden">
                                <h3 className="text-4xl font-black mb-6">Celestial Union Approved</h3>
                                <p className="text-2xl font-black italic font-serif text-blue-100 leading-tight">"{analysis.finalVerdict.recommendation}"</p>
                                <div className="mt-10 pt-10 border-t border-white/20">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Verified by JyotishConnect AI Engine</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main >
    );
}
