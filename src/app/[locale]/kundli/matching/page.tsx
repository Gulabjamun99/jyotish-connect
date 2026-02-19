"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Sparkles, Heart, User, FileText, CheckCircle2, AlertCircle, LayoutGrid, Zap, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { LocationInput } from "@/components/kundli/LocationInput";
import { getFullAstrologyData, performMatchMaking } from "@/lib/astrology/calculator";
import { generateMatchVerdict, generateAshtakootAnalysis, generateDetailedMatchingReport, analyzeManglikCancellation } from "@/lib/astrology/prediction-engine";
import { useLocale, useTranslations } from "next-intl";
import { translateSign, translatePlanet, getTrans } from "@/lib/astrology/i18n";

export default function MatchingPage() {
    const locale = useLocale();
    const t = useTranslations('Index');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    // Boy's Data
    const [boyData, setBoyData] = useState({
        name: "", dob: "", tob: "", birthplace: "", lat: 28.6139, lng: 77.2090
    });
    // Girl's Data
    const [girlData, setGirlData] = useState({
        name: "", dob: "", tob: "", birthplace: "", lat: 28.6139, lng: 77.2090
    });

    const [result, setResult] = useState<any>(null);

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
                        boyDetails: { date: bDate, lat: boyData.lat, lng: boyData.lng },
                        girlDetails: { date: gDate, lat: girlData.lat, lng: girlData.lng }
                    }
                })
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const matchResult = await response.json();
            setResult(matchResult);

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
        const doc = new jsPDF();
        const lang = locale as string;

        // Branding
        try {
            const logoUrl = "/logo.png";
            const img = new Image();
            img.src = logoUrl;
            await new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
            });
            if (img.complete && img.naturalWidth > 0) {
                doc.addImage(img, 'PNG', 165, 10, 35, 35);
            }
        } catch (e) { }

        doc.setFillColor(30, 58, 138);
        doc.rect(0, 0, 210, 50, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(26);
        doc.setFont("helvetica", "bold");
        doc.text("JyotishConnect", 15, 25);
        doc.setFontSize(16);
        doc.text("Premium Vedic Compatibility Report", 15, 38);

        doc.setTextColor(50);
        doc.setFontSize(20);
        doc.text(`${result.boy.name}  &  ${result.girl.name}`, 105, 70, { align: "center" });

        doc.setFillColor(243, 244, 246);
        doc.roundedRect(60, 80, 90, 40, 5, 5, "F");
        doc.setTextColor(219, 39, 119);
        doc.setFontSize(48);
        doc.text(`${result.milan.totalScore}`, 93, 108, { align: "center" });
        doc.setFontSize(18);
        doc.setTextColor(156, 163, 175);
        doc.text("/ 36", 115, 108);

        const verdict = generateMatchVerdict(result.milan.totalScore, result.boy.doshas.Manglik.present, result.girl.doshas.Manglik.present, lang);
        const splitVerdict = doc.splitTextToSize(verdict, 180);
        doc.setFontSize(11);
        doc.text(splitVerdict, 15, 135);

        const currentY = 135 + (splitVerdict.length * 6) + 10;
        doc.setFontSize(14);
        doc.text("Ashtakoot Guna Milan Summary", 15, currentY);

        const tableData = Object.entries(result.milan.ashtakoot).map(([key, val]: [string, any]) => [
            key.toUpperCase(),
            val.total,
            val.score,
            generateAshtakootAnalysis(key, val.score, val.total, val.boyVal, val.girlVal, lang)
        ]);
        autoTable(doc, {
            startY: currentY + 5,
            head: [['FACTOR', 'MAX', 'OBTAINED', 'VEDIC INTERPRETATION']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [30, 58, 138] },
        });

        doc.addPage();
        const report: any = generateDetailedMatchingReport(result, lang);
        let detailY = 20;
        ['marriage', 'nature', 'family', 'finance', 'bond', 'timing', 'forecast'].forEach(sec => {
            const data = report[sec];
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(data.title, 15, detailY);
            detailY += 7;
            doc.setFontSize(10);
            const split = doc.splitTextToSize(data.verdict, 180);
            doc.text(split, 15, detailY);
            detailY += (split.length * 5) + 10;
        });

        doc.save(`JyotishConnect_MatchReport.pdf`);
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
                                                    {translateSign(result.boy.moonSign, locale).substring(0, 1)}
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
                                                    {translateSign(result.girl.moonSign, locale).substring(0, 1)}
                                                </div>
                                                <div className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">{result.girl.name || "Girl"}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Premium Tabs Navigation */}
                                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-2 rounded-[2.5rem] flex overflow-x-auto gap-2 border border-blue-50 dark:border-slate-800 shadow-xl sticky top-6 z-20">
                                    {[
                                        { id: 'overview', label: t('ganMilanTitle'), icon: LayoutGrid },
                                        { id: 'doshas', label: t('doshaCheck'), icon: ShieldCheck },
                                        { id: 'forecast', label: "Insights & Timing", icon: Zap },
                                        { id: 'conclusion', label: t('finalVerdict'), icon: Heart },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex-1 min-w-[150px] flex items-center justify-center gap-3 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === tab.id
                                                ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl shadow-blue-500/40 scale-100"
                                                : "text-blue-900/40 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800 scale-95"
                                                }`}
                                        >
                                            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "animate-pulse" : ""}`} /> {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Tab Content */}
                                <div className="min-h-[400px]">
                                    {activeTab === 'overview' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                            {Object.entries(result.milan.ashtakoot).map(([key, val]: [string, any]) => (
                                                <div key={key} className="bg-white/80 backdrop-blur-xl dark:bg-slate-900 p-8 rounded-[2.5rem] border border-blue-50 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform ${val.score === val.total ? "bg-blue-600 text-white" : val.score === 0 ? "bg-amber-600 text-white" : "bg-indigo-500 text-white"}`}>
                                                            <span className="text-xl font-black leading-none">{val.score}</span>
                                                            <span className="text-[8px] font-black uppercase opacity-80">Guna</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <h4 className="font-black text-blue-900 dark:text-white capitalize text-lg tracking-tight">{key}</h4>
                                                            <div className="text-[10px] font-black text-blue-200 uppercase tracking-widest">{t('maxPoints')}: {val.total}</div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-5">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="bg-blue-50/50 dark:bg-slate-800/80 p-4 rounded-2xl border border-blue-100 dark:border-slate-800 text-center shadow-inner">
                                                                <div className="text-[10px] font-black text-blue-500 uppercase mb-1 tracking-tighter">{result.boy.name || "Boy"}</div>
                                                                <div className="text-xs font-black text-blue-900 dark:text-slate-300">{val.boyVal}</div>
                                                            </div>
                                                            <div className="bg-purple-50/50 dark:bg-slate-800/80 p-4 rounded-2xl border border-purple-100 dark:border-slate-800 text-center shadow-inner">
                                                                <div className="text-[10px] font-black text-purple-500 uppercase mb-1 tracking-tighter">{result.girl.name || "Girl"}</div>
                                                                <div className="text-xs font-black text-purple-900 dark:text-slate-300">{val.girlVal}</div>
                                                            </div>
                                                        </div>
                                                        <p className="text-[12px] leading-relaxed text-blue-900/50 dark:text-slate-400 font-bold italic font-serif">
                                                            {generateAshtakootAnalysis(key, val.score, val.total, val.boyVal, val.girlVal, locale)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {activeTab === 'doshas' && (
                                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                                                <h3 className="text-3xl font-black flex items-center gap-4 text-slate-900 dark:text-white tracking-tight">
                                                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl shadow-sm">
                                                        <ShieldCheck className="w-8 h-8 text-red-600" />
                                                    </div>
                                                    Critical Dosha Profile
                                                </h3>
                                                <div className="px-5 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg">Verification Level: High</div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {/* Boy Dosha Card */}
                                                <div className={`p-8 rounded-[2.5rem] border-2 relative overflow-hidden transition-all duration-500 ${result.boy.doshas.Manglik.present ? "bg-red-50/30 border-red-200 dark:bg-red-900/10 dark:border-red-900/50" : "bg-green-50/30 border-green-200 dark:bg-green-900/10 dark:border-green-900/50"}`}>
                                                    <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
                                                        <Zap className="w-24 h-24" />
                                                    </div>
                                                    <div className="relative z-10">
                                                        <div className="flex items-center justify-between mb-6">
                                                            <div>
                                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('boysChart')}</div>
                                                                <div className="font-black text-2xl text-slate-900 dark:text-white">{result.boy.name}</div>
                                                            </div>
                                                            <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-md ${result.boy.doshas.Manglik.present ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
                                                                {result.boy.doshas.Manglik.present ? "Manglik Detected" : "Non-Manglik"}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div className="p-4 bg-white/50 dark:bg-slate-950/50 rounded-2xl border border-white/50">
                                                                <h5 className="text-[11px] font-black text-slate-500 uppercase mb-2">Astrological Status</h5>
                                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-bold italic">
                                                                    {result.boy.doshas.Manglik.present
                                                                        ? "Significant Martian intensity observed. This affects temperament and requires compatibility with a similar energy profile."
                                                                        : "A naturally balanced energy. No restrictive Martian Doshas impede the flow of compatibility here."}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Girl Dosha Card */}
                                                <div className={`p-8 rounded-[2.5rem] border-2 relative overflow-hidden transition-all duration-500 ${result.girl.doshas.Manglik.present ? "bg-red-50/30 border-red-200 dark:bg-red-900/10 dark:border-red-900/50" : "bg-green-50/30 border-green-200 dark:bg-green-900/10 dark:border-green-900/50"}`}>
                                                    <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
                                                        <Sparkles className="w-24 h-24" />
                                                    </div>
                                                    <div className="relative z-10">
                                                        <div className="flex items-center justify-between mb-6">
                                                            <div>
                                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('girlsChart')}</div>
                                                                <div className="font-black text-2xl text-slate-900 dark:text-white">{result.girl.name}</div>
                                                            </div>
                                                            <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-md ${result.girl.doshas.Manglik.present ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
                                                                {result.girl.doshas.Manglik.present ? "Manglik Detected" : "Non-Manglik"}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div className="p-4 bg-white/50 dark:bg-slate-950/50 rounded-2xl border border-white/50">
                                                                <h5 className="text-[11px] font-black text-slate-500 uppercase mb-2">Astrological Status</h5>
                                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-bold italic">
                                                                    {result.girl.doshas.Manglik.present
                                                                        ? "Traditional Vedic analysis detects Manglik Dosha. This suggests a strong presence and specific destiny path in marriage."
                                                                        : "Favorable planetary alignment. The chart is clear of standard Manglik restrictions, aiding smooth union."}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-10 p-1 w-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600 rounded-[2.5rem] shadow-xl">
                                                <div className="bg-slate-900 p-8 rounded-[2.4rem] text-white relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-45 transition-transform duration-1000">
                                                        <ShieldCheck className="w-48 h-48" />
                                                    </div>
                                                    <div className="relative z-10">
                                                        <h4 className="font-black text-red-500 text-[11px] uppercase tracking-[0.3em] mb-4">Final Dosha Consensus</h4>
                                                        <p className="text-xl md:text-2xl font-black leading-snug drop-shadow-sm">
                                                            {analyzeManglikCancellation(result.boy, result.girl, locale)}
                                                        </p>
                                                        <div className="mt-6 flex items-center gap-3">
                                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic font-serif">Note: This considers Manglik cancellation factors (Neecha Bhanga, Guru Drishti, etc.)</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'forecast' && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {(() => {
                                                    const report: any = generateDetailedMatchingReport(result, locale);
                                                    return ['bond', 'timing', 'forecast', 'family', 'finance', 'nature'].map((sec) => {
                                                        const data = report[sec];
                                                        const icons: any = {
                                                            bond: Sparkles,
                                                            timing: CheckCircle2,
                                                            forecast: LayoutGrid,
                                                            family: User,
                                                            finance: Zap,
                                                            nature: Heart
                                                        };
                                                        const colors: any = {
                                                            bond: 'bg-purple-100 text-purple-600',
                                                            timing: 'bg-blue-100 text-blue-600',
                                                            forecast: 'bg-indigo-100 text-indigo-600',
                                                            family: 'bg-green-100 text-green-600',
                                                            finance: 'bg-yellow-100 text-yellow-600',
                                                            nature: 'bg-pink-100 text-pink-600'
                                                        }
                                                        const Icon = icons[sec] || Sparkles;
                                                        return (
                                                            <div key={sec} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                                                                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.1] transition-all group-hover:scale-125 duration-700">
                                                                    <Icon className="w-32 h-32" />
                                                                </div>
                                                                <div className="flex items-start gap-4 mb-6">
                                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform ${colors[sec] || 'bg-slate-100'}`}>
                                                                        <Icon className="w-7 h-7" />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-black text-slate-900 dark:text-white text-md uppercase tracking-tight mb-1">{data.title}</h4>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-serif italic">Vedic Insight</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-bold italic relative z-10 font-serif">
                                                                    "{data.verdict}"
                                                                </p>
                                                            </div>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'conclusion' && (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="bg-gradient-to-br from-indigo-950 via-blue-900 to-indigo-900 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group border-4 border-white/5">
                                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
                                                <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                                                <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />

                                                <div className="relative z-10 text-center md:text-left">
                                                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-[12px] font-black tracking-[0.4em] uppercase mb-10 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.2)]">
                                                        <Sparkles className="w-5 h-5 animate-spin" /> Final Divine Verdict
                                                    </div>
                                                    <h3 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-none">
                                                        Proceed with <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500">Divine Wisdom</span>
                                                    </h3>
                                                    <div className="p-8 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] mb-12 shadow-inner">
                                                        <p className="text-white text-2xl md:text-3xl font-black leading-tight italic tracking-tight font-serif">
                                                            "{generateMatchVerdict(
                                                                result.milan.totalScore,
                                                                result.boy.doshas.Manglik.present,
                                                                result.girl.doshas.Manglik.present,
                                                                locale
                                                            )}"
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                                                        <Button onClick={handleDownloadPDF} className="bg-white text-slate-900 hover:bg-slate-50 h-16 px-12 rounded-[2rem] text-xl font-black shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                                                            <FileText className="w-6 h-6" /> {t('downloadReport')}
                                                        </Button>
                                                        <Button onClick={handleWhatsAppShare} className="bg-green-500 hover:bg-green-600 text-white h-16 px-12 rounded-[2rem] text-xl font-black shadow-[0_20px_40px_rgba(34,197,94,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                                                            <Zap className="w-6 h-6" /> WhatsApp Summary
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-br from-pink-50 to-orange-50 dark:from-pink-900/10 dark:to-orange-900/10 border border-pink-100 dark:border-pink-950 p-12 rounded-[4rem] relative overflow-hidden group">
                                                <div className="absolute -top-10 -right-10 opacity-[0.05] group-hover:rotate-12 transition-transform duration-1000">
                                                    <Zap className="w-64 h-64 text-pink-500" />
                                                </div>
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 border-b-2 border-pink-100 dark:border-pink-900/40 pb-10">
                                                    <div>
                                                        <h4 className="font-black text-pink-900 dark:text-pink-100 text-4xl mb-3 flex items-center gap-4">
                                                            <div className="p-3 bg-pink-600 text-white rounded-[1.5rem] shadow-lg shadow-pink-500/20">
                                                                <Zap className="w-8 h-8" />
                                                            </div>
                                                            {t('remediesTitle')}
                                                        </h4>
                                                        <p className="text-pink-600/60 dark:text-pink-400 font-black uppercase text-[12px] tracking-[0.3em]">Strengthen your celestial bond with Vedic Wisdom</p>
                                                    </div>
                                                    <div className="px-6 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 rounded-full text-[10px] font-black tracking-widest uppercase">Recommendations: High Priority</div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                                    {(() => {
                                                        const report: any = generateDetailedMatchingReport(result, locale);
                                                        return report.remedies.list.map((item: string, i: number) => (
                                                            <div key={i} className="flex gap-6 items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2.5rem] border-2 border-white dark:border-slate-800 transition-all hover:shadow-2xl hover:scale-[1.03] group/item">
                                                                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-lg font-black shrink-0 shadow-xl shadow-pink-500/30 group-hover/item:rotate-12 transition-transform">
                                                                    {i + 1}
                                                                </div>
                                                                <p className="text-pink-950 dark:text-pink-50 font-black text-md leading-snug tracking-tight font-serif italic">"{item}"</p>
                                                            </div>
                                                        ));
                                                    })()}
                                                </div>
                                                <div className="mt-12 text-center">
                                                    <Button variant="ghost" className="text-pink-600 dark:text-pink-400 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 mx-auto hover:bg-pink-50 px-8 py-6 rounded-2xl">
                                                        Ask a detailed question to our Astrologer <Sparkles className="w-4 h-4" />
                                                    </Button>
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
        </main >
    );
}
