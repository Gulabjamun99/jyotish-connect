"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
    const [calcStep, setCalcStep] = useState(0);

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


    const steps = [
        "Analyzing planetary positions...",
        "Synchronizing 8-fold compatibility...",
        "Detecting Manglik & Nadi Doshas...",
        "Checking Navamsa (D9) spiritual bond...",
        "Generating 12-year forecast..."
    ];

    const handleDownloadPDF = async () => {
        if (!result || !analysis) return;

        const pdfToast = toast.loading("Preparing your divine report...", { id: "pdf-match" });

        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // --- 1. COVER PAGE ---
            // Background Gradient (Simulated)
            doc.setFillColor(5, 5, 16); // #050510
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
            
            // Branding
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.text("JYOTISH CONNECT", pageWidth / 2, 40, { align: "center" });
            
            doc.setDrawColor(249, 115, 22); // Orange-500
            doc.setLineWidth(1);
            doc.line(pageWidth / 2 - 20, 45, pageWidth / 2 + 20, 45);

            // Title
            doc.setFontSize(48);
            doc.setTextColor(255, 255, 255);
            doc.text("KUNDLI MILAN", pageWidth / 2, 90, { align: "center" });
            doc.setFontSize(14);
            doc.setTextColor(200, 200, 200);
            doc.text("PREMIUM MARRIAGE COMPATIBILITY REPORT", pageWidth / 2, 105, { align: "center" });

            // Score Circle
            doc.setDrawColor(249, 115, 22);
            doc.setLineWidth(2);
            doc.circle(pageWidth / 2, 150, 25, 'D');
            doc.setFontSize(32);
            doc.setTextColor(249, 115, 22);
            doc.text(`${result.milan.totalScore}/36`, pageWidth / 2, 155, { align: "center" });
            doc.setFontSize(10);
            doc.text("GUN MILAN SCORE", pageWidth / 2, 180, { align: "center" });

            // Names
            doc.setFontSize(22);
            doc.setTextColor(255, 255, 255);
            doc.text(`${analysis.section1.groom.name} & ${analysis.section1.bride.name}`, pageWidth / 2, 220, { align: "center" });
            
            // Footer
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text("© 2024 JyotishConnect AI - All Rights Reserved", pageWidth / 2, 280, { align: "center" });

            // --- 2. BIRTH DETAILS PAGE ---
            doc.addPage();
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
            
            doc.setFontSize(18);
            doc.setTextColor(5, 5, 16);
            doc.text("1. PERSONAL BIRTH DETAILS", 20, 30);
            doc.setDrawColor(249, 115, 22);
            doc.line(20, 35, 60, 35);

            const detailsData = [
                ["Field", "Groom (Male)", "Bride (Female)"],
                ["Name", analysis.section1.groom.name, analysis.section1.bride.name],
                ["Date of Birth", analysis.section1.groom.dob, analysis.section1.bride.dob],
                ["Time of Birth", analysis.section1.groom.tob, analysis.section1.bride.tob],
                ["Birth Place", analysis.section1.groom.pob, analysis.section1.bride.pob],
                ["Zodiac Sign", analysis.section1.groom.rashi, analysis.section1.bride.rashi],
                ["Nakshatra", analysis.section1.groom.nakshatra, analysis.section1.bride.nakshatra],
                ["Lagna", analysis.section1.groom.lagna, analysis.section1.bride.lagna]
            ];

            autoTable(doc, {
                startY: 45,
                head: [detailsData[0]],
                body: detailsData.slice(1),
                theme: 'striped',
                headStyles: { fillColor: [249, 115, 22], textColor: [255, 255, 255], fontStyle: 'bold' },
                styles: { fontSize: 10, cellPadding: 5 },
                alternateRowStyles: { fillColor: [255, 247, 237] }
            });

            // --- 3. ASHTAKOOT ANALYSIS ---
            doc.setFontSize(18);
            doc.setTextColor(5, 5, 16);
            const yAfterTable = (doc as any).lastAutoTable.finalY + 20;
            doc.text("2. ASHTAKOOT GUN MILAN", 20, yAfterTable);
            doc.line(20, yAfterTable + 5, 60, yAfterTable + 5);

            const gunData = [
                ["Factor", "Max", "Got", "Interpretation"],
                ...analysis.section3.table.map((r: any) => [r.name, r.max, r.got, r.interp])
            ];

            autoTable(doc, {
                startY: yAfterTable + 15,
                head: [gunData[0]],
                body: gunData.slice(1),
                theme: 'grid',
                headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
                styles: { fontSize: 9 },
                columnStyles: {
                    2: { fontStyle: 'bold', textColor: [249, 115, 22] }
                }
            });

            // --- 4. DOSHAS & REMEDIES ---
            doc.addPage();
            const currentY = 30;
            doc.setFontSize(18);
            doc.setTextColor(5, 5, 16);
            doc.text("3. RELATIONSHIP DYNAMICS", 20, currentY);
            doc.setDrawColor(249, 115, 22);
            doc.line(20, currentY + 5, 60, currentY + 5);

            const dynamicReport = generateDetailedMatchingReport(result, locale);
            if (dynamicReport) {
                const dynamicsData = [
                    ["Dimension", "Analysis"],
                    ["Emotional Bond", dynamicReport.bond.verdict],
                    ["Nature & Temperament", dynamicReport.nature.verdict],
                    ["Financial Outlook", dynamicReport.finance.verdict],
                    ["Family Environment", dynamicReport.family.verdict],
                    ["Future Forecast", dynamicReport.forecast.verdict]
                ];

                autoTable(doc, {
                    startY: currentY + 15,
                    body: dynamicsData.slice(1),
                    theme: 'striped',
                    styles: { fontSize: 10, cellPadding: 5 },
                    columnStyles: {
                        0: { fontStyle: 'bold', textColor: [30, 41, 59], cellWidth: 40 },
                        1: { fontStyle: 'italic' }
                    }
                });
            }

            // --- 5. DOSHAS & REMEDIES ---
            const nextY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 20 : currentY + 80;
            doc.setFontSize(18);
            doc.setTextColor(5, 5, 16);
            doc.text("4. DOSHAS & REMEDIES", 20, nextY);
            doc.line(20, nextY + 5, 60, nextY + 5);

            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Manglik Analysis:", 20, nextY + 20);
            doc.setFont("helvetica", "normal");
            doc.text(`Groom: ${analysis.section7.boyStatus}`, 30, nextY + 30);
            doc.text(`Bride: ${analysis.section7.girlStatus}`, 30, nextY + 40);
            doc.setTextColor(220, 38, 38); // Red-600
            doc.text(`Verdict: ${analysis.section7.verdict}`, 30, nextY + 50);

            doc.setTextColor(5, 5, 16);
            doc.setFont("helvetica", "bold");
            doc.text("Astrological Remedies:", 20, nextY + 70);
            doc.setFont("helvetica", "normal");
            
            let remedyY = nextY + 80;
            analysis.section15.boyRemedies.forEach((r: string, i: number) => {
                doc.text(`• ${r}`, 30, remedyY);
                remedyY += 10;
            });

            // --- 6. FINAL VERDICT ---
            const verdictY = Math.min(remedyY + 20, 240); // Ensure it doesn't overflow
            doc.setFillColor(249, 115, 22);
            doc.rect(20, verdictY, pageWidth - 40, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("FINAL ASTROLOGICAL VERDICT", pageWidth / 2, verdictY + 15, { align: "center" });
            doc.setFontSize(12);
            doc.setFont("helvetica", "italic");
            const splitVerdict = doc.splitTextToSize(analysis.finalVerdict.recommendation, pageWidth - 60);
            doc.text(splitVerdict, pageWidth / 2, verdictY + 25, { align: "center" });

            toast.success("Match Report ready!", { id: "pdf-match" });
            doc.save(`Kundli_Report_${boyData.name.replace(/\s+/g, '_')}_${girlData.name.replace(/\s+/g, '_')}.pdf`);
        } catch (err) {
            console.error("PDF Error:", err);
            toast.error("Failed to generate PDF. Please try again.", { id: "pdf-match" });
        }
    };

    if (!mounted) return null;

    return (
        <main className="min-h-screen bg-[#050510] text-white overflow-x-hidden selection:bg-orange-500/30 font-inter">
            <Navbar />
            <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
                <header className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-[10px] font-black tracking-[0.2em] uppercase shadow-sm">
                        <Sparkles className="w-4 h-4 text-orange-500" /> {t('premiumVedicReport')}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
                        {t('matching_title').split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">{t('matching_title').split(' ')[1] || 'Matching'}</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-bold text-lg leading-relaxed">
                        {t('matching_desc')}
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Input Forms */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10 sticky top-24">
                            <div className="mb-10 relative group">
                                <div className="absolute -left-6 top-0 w-1 h-full bg-orange-500 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)]" />
                                <h3 className="text-xl font-black text-white mb-8 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-lg">♂</div>
                                    {t('boyIdentityTitle')}
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Full Name</label>
                                        <Input 
                                            placeholder={t('enterNamePlaceholder')} 
                                            value={boyData.name} 
                                            onChange={e => setBoyData({ ...boyData, name: e.target.value })} 
                                            className="bg-white/5 h-14 border-white/10 text-white placeholder:text-white/20 focus:ring-orange-500 rounded-xl font-bold shadow-inner" 
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Date</label>
                                            <Input type="date" value={boyData.dob} onChange={e => setBoyData({ ...boyData, dob: e.target.value })} className="bg-white/5 h-14 border-white/10 text-white rounded-xl font-bold [color-scheme:dark]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Time</label>
                                            <Input type="time" value={boyData.tob} onChange={e => setBoyData({ ...boyData, tob: e.target.value })} className="bg-white/5 h-14 border-white/10 text-white rounded-xl font-bold [color-scheme:dark]" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Birth Location</label>
                                        <LocationInput value={boyData.birthplace} onChange={(loc, lat, lng) => setBoyData({ ...boyData, birthplace: loc, lat: lat || 28.6, lng: lng || 77.2 })} />
                                    </div>
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="absolute -left-6 top-0 w-1 h-full bg-red-500 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.4)]" />
                                <h3 className="text-xl font-black text-white mb-8 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center shadow-lg">♀</div>
                                    {t('girlIdentityTitle')}
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Full Name</label>
                                        <Input 
                                            placeholder={t('enterNamePlaceholder')} 
                                            value={girlData.name} 
                                            onChange={e => setGirlData({ ...girlData, name: e.target.value })} 
                                            className="bg-white/5 h-14 border-white/10 text-white placeholder:text-white/20 focus:ring-orange-500 rounded-xl font-bold shadow-inner" 
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Date</label>
                                            <Input type="date" value={girlData.dob} onChange={e => setGirlData({ ...girlData, dob: e.target.value })} className="bg-white/5 h-14 border-white/10 text-white rounded-xl font-bold [color-scheme:dark]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Time</label>
                                            <Input type="time" value={girlData.tob} onChange={e => setGirlData({ ...girlData, tob: e.target.value })} className="bg-white/5 h-14 border-white/10 text-white rounded-xl font-bold [color-scheme:dark]" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Birth Location</label>
                                        <LocationInput value={girlData.birthplace} onChange={(loc, lat, lng) => setGirlData({ ...girlData, birthplace: loc, lat: lat || 28.6, lng: lng || 77.2 })} />
                                    </div>
                                </div>
                            </div>

                            <Button onClick={calculateMatch} disabled={loading} className="w-full h-16 mt-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-500/20">
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
                        {result && analysis ? (
                            <div id="results" className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                {/* Enhanced Hero Score Card */}
                                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/10 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-red-600/10 rounded-full blur-[100px] -mr-32 -mt-32 transition-all group-hover:blur-[120px]" />
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                                        <div className="text-center md:text-left space-y-4">
                                            <div className="inline-flex items-center gap-2 px-4 py-1 bg-orange-500/10 rounded-full text-[10px] font-black uppercase tracking-widest text-orange-500">{t('compatibilityScore')}</div>
                                            <div className="flex items-center justify-center md:justify-start gap-6">
                                                <div className="relative w-36 h-36 flex items-center justify-center group/score">
                                                    <svg className="w-full h-full transform -rotate-90">
                                                        <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                                                        <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={402.1} strokeDashoffset={402.1 - (402.1 * result.milan.totalScore / 36)} strokeLinecap="round" className={`${result.milan.totalScore >= 25 ? "text-orange-500" : result.milan.totalScore >= 18 ? "text-red-500" : "text-amber-500"} transition-all duration-1500 ease-out drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]`} />
                                                    </svg>
                                                    <div className="absolute text-center">
                                                        <div className="text-5xl font-black text-white leading-none tracking-tighter">{result.milan.totalScore}</div>
                                                        <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">Gunas</div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className={`text-2xl font-black tracking-tighter ${result.milan.totalScore >= 25 ? "text-orange-500" : result.milan.totalScore >= 18 ? "text-red-500" : "text-amber-500"}`}>
                                                        {result.milan.totalScore >= 25 ? "Divine Union" : result.milan.totalScore >= 18 ? "Auspicious Match" : "Consult Astrologer"}
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-xl text-[10px] font-black text-white/60 uppercase tracking-wider border border-white/10">
                                                            {result.milan.totalScore >= 18 ? <ShieldCheck className="w-4 h-4 text-orange-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                                                            {result.milan.totalScore >= 18 ? "Heavenly Sanctioned" : "Guided Action Needed"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-md shadow-inner">
                                            <div className="text-center group/boy">
                                                <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-orange-500 flex items-center justify-center text-2xl font-black mb-2 mx-auto shadow-xl group-hover/boy:scale-110 transition-transform border border-orange-500/20">
                                                    {(translateSign(result.boy.moonSign, locale) || "S").substring(0, 1)}
                                                </div>
                                                <div className="text-[10px] font-black text-white uppercase tracking-tighter max-w-[80px] truncate">{result.boy.name || "Boy"}</div>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <Heart className="w-8 h-8 fill-red-500 text-red-500 animate-[pulse_2s_infinite]" />
                                                <div className="w-12 h-[2px] bg-gradient-to-r from-orange-500 to-red-500 rounded-full mt-2" />
                                            </div>
                                            <div className="text-center group/girl">
                                                <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center text-2xl font-black mb-2 mx-auto shadow-xl group-hover/girl:scale-110 transition-transform border border-red-500/20">
                                                    {(translateSign(result.girl.moonSign, locale) || "S").substring(0, 1)}
                                                </div>
                                                <div className="text-[10px] font-black text-white uppercase tracking-tighter max-w-[80px] truncate">{result.girl.name || "Girl"}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Premium Tabs Navigation */}
                                <div className="bg-white/5 backdrop-blur-xl p-1.5 rounded-2xl flex overflow-x-auto gap-2 border border-white/10 shadow-xl sticky top-6 z-20 no-scrollbar">
                                    {[
                                        { id: 'overview', label: "Overview", icon: LayoutGrid },
                                        { id: 'ashtakoot', label: "Gun Milan", icon: Sparkles },
                                        { id: 'doshas', label: "Dosha Profile", icon: ShieldCheck },
                                        { id: 'compatibility', label: "Compatibility", icon: Heart },
                                        { id: 'lifeAreas', label: "Life Areas", icon: Zap },
                                        { id: 'conclusion', label: "Verdict", icon: CheckCircle2 },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex-1 min-w-[110px] flex flex-col md:flex-row items-center justify-center gap-2 py-3 px-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === tab.id
                                                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-100"
                                                : "text-white/40 hover:text-white/70 hover:bg-white/5 scale-95"
                                                }`}
                                        >
                                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "animate-pulse" : ""}`} />
                                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">{tab.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Tab Content */}
                                <div className="min-h-[400px]">
                                    {activeTab === 'overview' && analysis && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-sm">
                                                    <h4 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                                                        <User className="w-5 h-5 text-orange-500" /> Groom Details
                                                    </h4>
                                                    <div className="space-y-4 text-sm font-bold text-white/60">
                                                        <div className="flex justify-between border-b border-white/5 pb-2"><span>Rashi</span><span className="text-orange-500">{translateSign(analysis.section1.groom.rashi, locale)}</span></div>
                                                        <div className="flex justify-between border-b border-white/5 pb-2"><span>Nakshatra</span><span className="text-orange-500">{analysis.section1.groom.nakshatra}</span></div>
                                                        <div className="flex justify-between border-b border-white/5 pb-2"><span>Lagna</span><span className="text-orange-500">{analysis.section1.groom.lagna}</span></div>
                                                    </div>
                                                </div>
                                                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-sm">
                                                    <h4 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                                                        <User className="w-5 h-5 text-red-500" /> Bride Details
                                                    </h4>
                                                    <div className="space-y-4 text-sm font-bold text-white/60">
                                                        <div className="flex justify-between border-b border-white/5 pb-2"><span>Rashi</span><span className="text-red-500">{translateSign(analysis.section1.bride.rashi, locale)}</span></div>
                                                        <div className="flex justify-between border-b border-white/5 pb-2"><span>Nakshatra</span><span className="text-red-500">{analysis.section1.bride.nakshatra}</span></div>
                                                        <div className="flex justify-between border-b border-white/5 pb-2"><span>Lagna</span><span className="text-red-500">{analysis.section1.bride.lagna}</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-white/5 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/10">
                                                <div className="relative z-10">
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 mb-4">Executive Summary</h4>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                                        <div><div className="text-[10px] text-white/40 uppercase mb-1">Emotional</div><div className="text-lg font-black">{analysis.section2.emotional}</div></div>
                                                        <div><div className="text-[10px] text-white/40 uppercase mb-1">Physical</div><div className="text-lg font-black">{analysis.section2.physical}</div></div>
                                                        <div><div className="text-[10px] text-white/40 uppercase mb-1">Financial</div><div className="text-lg font-black">{analysis.section2.financial}</div></div>
                                                        <div><div className="text-[10px] text-white/40 uppercase mb-1">Longevity</div><div className="text-lg font-black">{analysis.section2.longevity}</div></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'ashtakoot' && analysis && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                            {analysis.section3.table.map((row: any) => (
                                                <div key={row.name} className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform ${row.got === row.max ? "bg-orange-500 text-white" : row.got === 0 ? "bg-red-500 text-white" : "bg-red-400 text-white"}`}>
                                                            <span className="text-xl font-black leading-none">{row.got}</span>
                                                            <span className="text-[8px] font-black uppercase opacity-80">Guna</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <h4 className="font-black text-white capitalize text-lg tracking-tight">{row.name}</h4>
                                                            <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">MAX: {row.max}</div>
                                                        </div>
                                                    </div>
                                                    <p className="text-[12px] leading-relaxed text-white/60 font-bold italic font-serif">
                                                        {row.interp}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {activeTab === 'doshas' && (
                                        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] shadow-xl border border-white/10 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className={`p-8 rounded-[2.5rem] border-2 ${result.boy.doshas.Manglik.present ? "bg-red-500/10 border-red-500/20" : "bg-green-500/10 border-green-500/20"}`}>
                                                    <h5 className="font-black text-xl mb-4 text-white">{result.boy.name}</h5>
                                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${result.boy.doshas.Manglik.present ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
                                                        {result.boy.doshas.Manglik.present ? "Manglik" : "Non-Manglik"}
                                                    </span>
                                                </div>
                                                <div className={`p-8 rounded-[2.5rem] border-2 ${result.girl.doshas.Manglik.present ? "bg-red-500/10 border-red-500/20" : "bg-green-500/10 border-green-500/20"}`}>
                                                    <h5 className="font-black text-xl mb-4 text-white">{result.girl.name}</h5>
                                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${result.girl.doshas.Manglik.present ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
                                                        {result.girl.doshas.Manglik.present ? "Manglik" : "Non-Manglik"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-8 p-8 bg-white/5 border border-white/10 text-white rounded-[2.5rem]">
                                                <h4 className="font-black text-orange-500 text-[10px] uppercase tracking-widest mb-2">Final Consensus</h4>
                                                <p className="text-xl font-black">{analyzeManglikCancellation(result.boy, result.girl, locale)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'compatibility' && analysis && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-sm">
                                                <h4 className="text-xl font-black text-white mb-6">Groom Personality</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {analysis.section4.groomTraits.map((t: string) => <span key={t} className="px-4 py-2 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-xl text-xs font-black">{t}</span>)}
                                                </div>
                                            </div>
                                            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-sm">
                                                <h4 className="text-xl font-black text-white mb-6">Bride Personality</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {analysis.section4.brideTraits.map((t: string) => <span key={t} className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-black">{t}</span>)}
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-xl">
                                                <h4 className="text-2xl font-black mb-8 flex items-center gap-4 text-white">
                                                    <Heart className="w-8 h-8 text-red-500" /> Dynamics & Bond
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                    <div>
                                                        <h5 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4">Emotional Connection</h5>
                                                        <p className="text-sm text-white/60 leading-relaxed font-bold italic font-serif">"{generateDetailedMatchingReport(result, locale).bond.verdict}"</p>
                                                    </div>
                                                    <div>
                                                        <h5 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4">Nature Synchronization</h5>
                                                        <p className="text-sm text-white/60 leading-relaxed font-bold italic font-serif">"{generateDetailedMatchingReport(result, locale).nature.verdict}"</p>
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
                                                    <div key={sec} className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-sm">
                                                        <h4 className="font-black text-white text-md uppercase mb-4">{data.title}</h4>
                                                        <p className="text-sm text-white/60 leading-relaxed font-bold italic font-serif">"{data.verdict}"</p>
                                                    </div>
                                                );
                                            })}
                                            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-sm">
                                                <h4 className="font-black text-orange-500 text-xs uppercase mb-4 tracking-widest">Marriage Window</h4>
                                                {analysis.section14.periods.map((p: any) => (
                                                    <div key={p.time} className="flex justify-between items-center mb-2 last:mb-0 border-b border-white/5 pb-2">
                                                        <span className="font-bold text-white">{p.time}</span>
                                                        <span className="px-3 py-1 bg-orange-500/20 text-orange-500 rounded-lg text-[10px] font-black uppercase">{p.strength}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'conclusion' && analysis && (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="bg-gradient-to-br from-orange-600 to-red-700 p-12 rounded-[4rem] text-white text-center shadow-2xl relative overflow-hidden">
                                                <h3 className="text-4xl md:text-5xl font-black mb-6">Final Divine Verdict</h3>
                                                <p className="text-2xl font-black italic font-serif text-white/90">"{analysis.finalVerdict.recommendation}"</p>
                                                <div className="mt-8 flex justify-center gap-4">
                                                    <Button onClick={handleDownloadPDF} className="bg-white text-orange-600 hover:bg-white/90 rounded-2xl h-14 px-8 font-black shadow-xl">Download PDF</Button>
                                                </div>
                                            </div>
                                            <div className="bg-white/5 backdrop-blur-xl p-12 rounded-[4rem] border border-white/10 shadow-xl">
                                                <h4 className="text-2xl font-black mb-8 flex items-center gap-3 text-white">
                                                    <Zap className="w-8 h-8 text-orange-500" /> Professional Remedies
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <h5 className="text-[10px] font-black text-white/40 uppercase tracking-widest">For Groom</h5>
                                                        {analysis.section15.boyRemedies.map((r: string) => <div key={r} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-xs font-bold italic font-serif text-white/60">"{r}"</div>)}
                                                    </div>
                                                    <div className="space-y-4">
                                                        <h5 className="text-[10px] font-black text-white/40 uppercase tracking-widest">For Bride</h5>
                                                        {analysis.section15.girlRemedies.map((r: string) => <div key={r} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-xs font-bold italic font-serif text-white/60">"{r}"</div>)}
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
                                <h3 className="text-4xl font-black text-white mb-6 relative z-10 tracking-tighter drop-shadow-sm">{t('beginCheckTitle')}</h3>
                                <p className="text-white/40 max-w-sm relative z-10 font-bold text-lg leading-relaxed italic font-serif">"{t('beginCheckDesc')}"</p>
                                <div className="mt-16 flex gap-8 opacity-30 relative z-10">
                                    <div className="p-4 bg-white/5 rounded-2xl shadow-lg border border-white/10 transform -rotate-12 group-hover:rotate-0 transition-transform"><Heart className="w-8 h-8 fill-red-500 text-red-500" /></div>
                                    <div className="p-4 bg-white/5 rounded-2xl shadow-lg border border-white/10 transform rotate-12 group-hover:rotate-0 transition-transform"><Sparkles className="w-8 h-8 fill-orange-500 text-orange-500" /></div>
                                    <div className="p-4 bg-white/5 rounded-2xl shadow-lg border border-white/10 transform -rotate-6 group-hover:rotate-0 transition-transform"><ShieldCheck className="w-8 h-8 fill-orange-400 text-orange-400" /></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />

            {/* Hidden PDF Export Content for Matching */}
            {result && analysis && (
                <div ref={pdfContentRef} className="fixed -left-[9999px] top-0 bg-white p-16 text-slate-900 w-[800px]">
                    <div className="border-[12px] border-orange-600 p-12">
                        <h1 className="text-5xl font-black uppercase tracking-tight text-orange-600 mb-4">Kundli Milan Report</h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-12">Premium Marriage Compatibility Analysis</p>
                        
                        <div className="grid grid-cols-2 gap-8 mb-12 border-b-2 border-slate-200 pb-12">
                            <div>
                                <h2 className="text-sm font-black text-orange-600 uppercase mb-4">Groom Profile</h2>
                                <div className="text-sm font-bold text-slate-700 space-y-2 uppercase">{analysis.section1.groom.name} • {analysis.section1.groom.rashi} • {analysis.section1.groom.nakshatra}</div>
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-red-600 uppercase mb-4">Bride Profile</h2>
                                <div className="text-sm font-bold text-slate-700 space-y-2 uppercase">{analysis.section1.bride.name} • {analysis.section1.bride.rashi} • {analysis.section1.bride.nakshatra}</div>
                            </div>
                        </div>

                        <div className="bg-orange-50 p-8 rounded-2xl mb-12">
                            <h2 className="text-2xl font-black text-orange-900 uppercase mb-6">Ashtakoot Guna Score</h2>
                            <div className="text-6xl font-black text-orange-600">{result.milan.totalScore} <span className="text-2xl text-orange-400">/ 36</span></div>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-slate-900 uppercase">Final Verdict</h2>
                            <p className="text-lg font-bold text-slate-600 italic leading-relaxed">"{analysis.finalVerdict.recommendation}"</p>
                        </div>
                    </div>
                </div>
            )}
        </main >
    );
}
