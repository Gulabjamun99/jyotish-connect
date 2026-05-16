"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import { Sparkles, MapPin, Clock3, Calendar, User, Star, Zap, Activity, Heart, Briefcase, GraduationCap, LayoutGrid, FileText, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import { generateKundliPDF } from "@/lib/astrology/generateKundliPDF";
import { LocationInput } from "@/components/kundli/LocationInput";
import { LagnaChart } from "@/components/kundli/LagnaChart";
import { DetailCard, DetailRow } from "@/components/kundli/DetailCard";
// import { calculatePlanets, calculatePanchang, calculateVimshottari, calculateDivisionalCharts, calculateDoshas, calculateYogas } from "@/lib/astrology/calculator";
import { generateLifePredictions } from "@/lib/astrology/prediction-engine";
import { useLocale } from "next-intl";
import { translateSign, translatePlanet, getTrans } from "@/lib/astrology/i18n";
import html2canvas from "html2canvas";

export default function KundliPage() {
    const _SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const locale = useLocale();
    const kundliData: any = getTrans(locale);
    const [formData, setFormData] = useState({
        name: "",
        gender: "Male",
        dob: "",
        tob: "",
        birthplace: "",
        latitude: 28.6139,
        longitude: 77.2090
    });
    const [loading, setLoading] = useState(false);
    const [chart, setChart] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("charts");
    const lagnaChartRef = useRef<HTMLDivElement>(null);
    const d9ChartRef = useRef<HTMLDivElement>(null);
    const moonChartRef = useRef<HTMLDivElement>(null);
    const d10ChartRef = useRef<HTMLDivElement>(null);
    const pdfContentRef = useRef<HTMLDivElement>(null);

    // PDF specific refs for hidden rendering
    const pdfLagnaRef = useRef<HTMLDivElement>(null);
    const pdfD9Ref = useRef<HTMLDivElement>(null);
    const pdfMoonRef = useRef<HTMLDivElement>(null);
    const pdfD10Ref = useRef<HTMLDivElement>(null);

    const l = (key: string, fallback: string) => {
        if (!kundliData || !kundliData.Index) return fallback;
        const keys = key.split('.');
        let val: any = kundliData.Index;
        for (const k of keys) {
            val = val?.[k];
        }
        return val || fallback;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const dateStr = formData.dob + "T" + (formData.tob || "12:00");
            const birthDate = new Date(dateStr);

            if (isNaN(birthDate.getTime())) {
                toast.error("Invalid Date or Time provided.");
                setLoading(false);
                return;
            }

            const lat = formData.latitude || 28.6139;
            const lng = formData.longitude || 77.2090;

            // 1. Core Calculations via API
            const response = await fetch('/api/astrology/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: "full",
                    data: { date: birthDate, lat, lng }
                })
            });

            if (!response.ok) throw new Error("API failure");
            const fullData = await response.json();

            const trans: any = getTrans(locale);

            const ascPlanet = fullData.planets.find((p: any) => p.name === "Asc");
            const moonPlanet = fullData.planets.find((p: any) => p.name === "Moon");
            const sunPlanet = fullData.planets.find((p: any) => p.name === "Sun");

            const EN_trans: any = getTrans('en');
            const nakshatraId = moonPlanet?.nakshatraId || 0;
            const baseChart = {
                ...fullData,
                dateStr: birthDate.toLocaleDateString('en-IN'),
                ascendantSign: ascPlanet?.sign || "Aries",
                ascendantLongitude: fullData.ascendant || (ascPlanet?.longitude ?? 0),
                moonSign: moonPlanet?.sign || "Aries",
                moonLongitude: moonPlanet?.longitude ?? 0,
                sunSign: sunPlanet?.sign || "Pisces",
                nakshatraId,
                nakshatra: nakshatraId ? trans.nakshatras[nakshatraId - 1] : "Unknown",
                nakshatra_en: nakshatraId ? EN_trans.nakshatras[nakshatraId - 1] : "Unknown",
            };

            // Generate predictions in user's locale AND always in English for PDF
            const detailedReport = generateLifePredictions(baseChart, locale);
            const detailedReportEn = generateLifePredictions(baseChart, 'en');
            const newChart = {
                ...baseChart,
                predictions: detailedReport,
                predictionsEn: detailedReportEn,
                avakahada: {
                    varna: moonPlanet.varna || "Brahmin",
                    vashya: moonPlanet.vashya || "Jalchar",
                    tara: moonPlanet.tara || "Janma",
                    yoni: moonPlanet.yoni || "Gaja",
                    rashish: moonPlanet.rashish || "Jupiter",
                    gana: moonPlanet.gana || "Deva",
                    bhakoot: moonPlanet.bhakoot || "Meena",
                    nadi: moonPlanet.nadi || "Antya"
                }
            };

            setChart(newChart);
            toast.success("Premium Kundli Generated!");
            document.getElementById("results")?.scrollIntoView({ behavior: 'smooth' });

        } catch (err) {
            console.error(err);
            toast.error("Failed to generate Kundli");
        } finally {
            setLoading(false);
        }
    };

            const handleDownloadPDF = async () => {
        if (!chart) return;
        toast.loading("Generating Premium Report...", { id: "pdf-gen" });

        const captureChart = async (ref: React.RefObject<HTMLDivElement | null>) => {
            const el = ref.current;
            if (!el) return null;
            try {
                const canvas = await html2canvas(el, { 
                    scale: 2, 
                    useCORS: true, 
                    logging: true,
                    backgroundColor: "#ffffff",
                    windowWidth: 800
                });
                return canvas.toDataURL('image/png');
            } catch (e) {
                console.error("Chart capture failed:", e);
                return null;
            }
        };

        const captureImage = async (id: string) => {
            const el = document.getElementById(id);
            if (!el) {
                console.warn(`Element ${id} not found for PDF capture`);
                return null;
            }
            try {
                // Scroll into view briefly if needed or wait for potential layout shifts
                const canvas = await html2canvas(el, { 
                    scale: 2, 
                    useCORS: true, 
                    logging: false, // Cleaner logs
                    backgroundColor: "#ffffff",
                    windowWidth: 800,
                    onclone: (doc) => {
                        // Ensure cloned element is visible
                        const clonedEl = doc.getElementById(id);
                        if (clonedEl) {
                            clonedEl.style.opacity = '1';
                            clonedEl.style.visibility = 'visible';
                            clonedEl.style.display = 'block';
                        }
                    }
                });
                return canvas.toDataURL('image/png');
            } catch (e) {
                console.error(`Failed to capture ${id}:`, e);
                return null;
            }
        };

        toast.loading("Rendering High-Fidelity Report...", { id: "pdf-gen" });

        // Give extra time for charts and hidden sections to fully render
        await new Promise(resolve => setTimeout(resolve, 1000));

        const [d1Img, d9Img, moonImg, d10Img, planetsImg, birthImg, dashaImg, ashtakImg, doshasImg, pCareer, pHealth, pLove, pWealth, pEdu] = await Promise.all([
            captureChart(pdfLagnaRef), captureChart(pdfD9Ref),
            captureChart(pdfMoonRef), captureChart(pdfD10Ref),
            captureImage("pdf-planets"),
            captureImage("pdf-birth-details"),
            captureImage("pdf-dasha-detailed"),
            captureImage("pdf-ashtakvarga"),
            captureImage("pdf-doshas-detailed"),
            captureImage("pdf-pred-career"),
            captureImage("pdf-pred-health"),
            captureImage("pdf-pred-marriage"),
            captureImage("pdf-pred-wealth"),
            captureImage("pdf-pred-edu")
        ]);

        try {
            await generateKundliPDF(chart, formData, locale, { 
                d1: d1Img, d9: d9Img, moon: moonImg, d10: d10Img,
                planets: planetsImg,
                birth: birthImg,
                dasha: dashaImg,
                ashtak: ashtakImg,
                doshas: doshasImg,
                pCareer, pHealth, pLove, pWealth, pEdu
            });
            toast.success("Premium PDF Downloaded!", { id: "pdf-gen" });
        } catch (e) {
            console.error(e);
            toast.error("PDF generation failed. Please try again.", { id: "pdf-gen" });
        }
    };




    return (
        <main className="min-h-screen bg-[#050510] text-white overflow-x-hidden selection:bg-orange-500/30">
            <Navbar />
            <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
                {/* Header */}
                <header className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-xs font-bold tracking-wider uppercase">
                        <Sparkles className="w-3 h-3" /> Premium Vedic Report
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
                        Janam <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Kundli</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Unlock the secrets of your destiny with our advanced astrological engine. Get D1-D10 charts, thorough Dosha analysis, and life predictions.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Input Form */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-white/10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                                    <User className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Birth Details</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Name</label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-orange-500 text-white placeholder:text-white/30"
                                        placeholder="Full Name"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Date</label>
                                        <Input
                                            type="date"
                                            value={formData.dob}
                                            onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                            className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-orange-500 text-white [color-scheme:dark]"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Time</label>
                                        <Input
                                            type="time"
                                            value={formData.tob}
                                            onChange={e => setFormData({ ...formData, tob: e.target.value })}
                                            className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-orange-500 text-white [color-scheme:dark]"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Location</label>
                                    <LocationInput
                                        value={formData.birthplace}
                                        onChange={(location: string, lat?: number, lng?: number) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                birthplace: location,
                                                latitude: lat ?? prev.latitude,
                                                longitude: lng ?? prev.longitude
                                            }));
                                        }}
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/20"
                                >
                                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Generate Kundli"}
                                </Button>
                            </form>
                        </div>

                        {chart && (
                            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:blur-2xl transition-all" />
                                <h3 className="text-2xl font-black mb-2">Download PDF</h3>
                                <p className="text-indigo-100 mb-6 text-sm opacity-80">Get the full 15+ page detailed report with charts, dosha analysis, and future predictions.</p>
                                <Button
                                    onClick={handleDownloadPDF}
                                    className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold h-12 rounded-xl"
                                >
                                    Download Full Report
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Report Section */}
                    {chart ? (
                        <div id="results" className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                            {/* User Summary Card */}
                            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/10 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600" />
                                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="text-center md:text-left">
                                        <div className="text-sm font-bold text-orange-500 uppercase tracking-widest mb-1">Birth Chart Report</div>
                                        <h2 className="text-4xl font-black text-white capitalize">{formData.name}</h2>
                                        <p className="text-white/60 mt-2 flex items-center gap-2 justify-center md:justify-start">
                                            <Calendar className="w-4 h-4" /> {new Date(chart.dateStr).toDateString()}
                                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                            <MapPin className="w-4 h-4" /> {formData.birthplace || "Unknown Location"}
                                        </p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="bg-white/5 p-4 rounded-2xl text-center min-w-[100px] border border-white/10">
                                            <div className="text-xs text-white/40 uppercase font-bold">Lagna</div>
                                            <div className="text-xl font-black text-orange-500">{translateSign(chart.ascendantSign, locale)}</div>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl text-center min-w-[100px] border border-white/10">
                                            <div className="text-xs text-white/40 uppercase font-bold">Rasi</div>
                                            <div className="text-xl font-black text-blue-400">{translateSign(chart.moonSign, locale)}</div>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl text-center min-w-[100px] border border-white/10">
                                            <div className="text-xs text-white/40 uppercase font-bold">Nakshatra</div>
                                            <div className="text-xl font-black text-purple-400">{chart.nakshatra}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                                                        {/* Custom Tabs */}
                            <div className="bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl flex overflow-x-auto gap-2">
                                {[
                                    { id: 'basic', label: 'Basic', icon: User },
                                    { id: 'charts', label: 'Charts', icon: LayoutGrid },
                                    { id: 'planets', label: 'Planets', icon: Zap },
                                    { id: 'dashas', label: 'Dashas', icon: Clock3 },
                                    { id: 'ashtakvarga', label: 'Ashtakvarga', icon: Activity },
                                    { id: 'doshas', label: 'Doshas', icon: ShieldCheck },
                                    { id: 'predictions', label: 'Predictions', icon: FileText },
                                    { id: 'remedies', label: 'Remedies', icon: Sparkles },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={"flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all " + (activeTab === tab.id ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-100" : "text-slate-500 hover:text-slate-800 dark:text-white/40 dark:hover:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 scale-95")}


                                    >
                                        <tab.icon className="w-4 h-4" /> {l(tab.id, tab.label)}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="min-h-[500px]">

                                {/* 1. BASIC TAB */}
                                {activeTab === 'basic' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-300">
                                        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/10 md:col-span-2">
                                            <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                                                <User className="w-6 h-6 text-orange-500" /> Avakahada Chakra
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                                {[
                                                    { label: "Varna", value: chart.avakahada.varna },
                                                    { label: "Vashya", value: chart.avakahada.vashya },
                                                    { label: "Tara", value: chart.avakahada.tara },
                                                    { label: "Yoni", value: chart.avakahada.yoni },
                                                    { label: "Rashish", value: chart.avakahada.rashish },
                                                    { label: "Gana", value: chart.avakahada.gana },
                                                    { label: "Bhakoot", value: chart.avakahada.bhakoot },
                                                    { label: "Nadi", value: chart.avakahada.nadi },
                                                ].map((item, idx) => (
                                                    <div key={idx} className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                                                        <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">{l(item.label.toLowerCase(), item.label)}</div>
                                                        <div className="text-lg font-bold text-white">{item.value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 2. CHARTS TAB */}
                                {activeTab === 'charts' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-300">
                                        <div ref={lagnaChartRef} className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-white/10">
                                            <div className="text-center mb-6">
                                                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest rounded-full">D1 Chart</span>
                                                <h3 className="text-xl font-bold mt-2">{l('lagna_birth_chart', 'Lagna / Birth Chart')}</h3>
                                            </div>
                                            <LagnaChart
                                                chart={chart.charts?.D1 || {}}
                                                planets={chart.planets}
                                                ascendant={chart.ascendantLongitude}
                                                title="Lagna"
                                                subTitle="D1 Chart"
                                            />
                                        </div>
                                        <div ref={d9ChartRef} className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-white/10">
                                            <div className="text-center mb-6">
                                                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-widest rounded-full">D9 Chart</span>
                                                <h3 className="text-xl font-bold mt-2">{l('navamsa_chart', 'Navamsa Chart')}</h3>
                                            </div>
                                            <LagnaChart
                                                chart={chart.charts?.D9 || {}}
                                                planets={chart.planets}
                                                ascendant={chart.d9Ascendant}
                                                title="Navamsa"
                                                subTitle="D9 Chart"
                                            />
                                        </div>
                                        <div ref={moonChartRef} className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-white/10">
                                            <div className="text-center mb-6">
                                                <span className="px-3 py-1 bg-blue-100/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full">Moon Chart</span>
                                                <h3 className="text-xl font-bold mt-2 text-white">{l('chandra_lagna', 'Chandra Lagna')}</h3>
                                            </div>
                                            <LagnaChart
                                                chart={chart.charts?.Moon || {}}
                                                planets={chart.planets}
                                                ascendant={chart.moonLongitude}
                                                title="Chandra"
                                                subTitle="Moon Chart"
                                            />
                                        </div>
                                        <div ref={d10ChartRef} className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-white/10">
                                            <div className="text-center mb-6">
                                                <span className="px-3 py-1 bg-yellow-100/10 text-yellow-400 text-[10px] font-black uppercase tracking-widest rounded-full">D10 Chart</span>
                                                <h3 className="text-xl font-bold mt-2 text-white">{l('dashamsha', 'Dashamsha')}</h3>
                                            </div>
                                            <LagnaChart
                                                chart={chart.charts?.D10 || {}}
                                                planets={chart.planets}
                                                ascendant={chart.d10Ascendant}
                                                title="Dasamsa"
                                                subTitle="D10 Chart"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* 3. PLANETS TAB */}
                                {activeTab === 'planets' && (
                                    <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden animate-in fade-in slide-in-from-right-4">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-white/5 border-b border-white/10">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-xs font-black text-white/40 uppercase tracking-wider">{l('planet', 'Planet')}</th>
                                                        <th className="px-6 py-4 text-left text-xs font-black text-white/40 uppercase tracking-wider">{l('sign', 'Sign')}</th>
                                                        <th className="px-6 py-4 text-left text-xs font-black text-white/40 uppercase tracking-wider">{l('degree', 'Degree')}</th>
                                                        <th className="px-6 py-4 text-left text-xs font-black text-white/40 uppercase tracking-wider">{l('nakshatra', 'Nakshatra')}</th>
                                                        <th className="px-6 py-4 text-left text-xs font-black text-white/40 uppercase tracking-wider">{l('house', 'House')}</th>
                                                        <th className="px-6 py-4 text-left text-xs font-black text-white/40 uppercase tracking-wider">{l('status', 'Status')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {chart.planets.map((p: any, i: number) => (
                                                        <tr key={p.name} className="hover:bg-white/5 transition-colors">
                                                            <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-white">
                                                                    {(p.name || "").substring(0, 2)}
                                                                </div>
                                                                {translatePlanet(p.name, locale)}
                                                            </td>
                                                            <td className="px-6 py-4 font-medium text-white/80">{translateSign(p.sign, locale)}</td>
                                                            <td className="px-6 py-4 font-mono text-sm text-white/70">
                                                                {Math.floor(p.longitude % 30)}° {Math.floor((p.longitude % 1) * 60)}'
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-white/60">{getTrans(locale).nakshatras?.[p.nakshatraId - 1] || '—'}</td>
                                                            <td className="px-6 py-4 font-bold text-orange-500">{p.house}</td>
                                                            <td className="px-6 py-4">
                                                                {p.isExalted && <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-[10px] font-black uppercase">{l('exalted', 'Exalted')}</span>}
                                                                {p.isDebilitated && <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-[10px] font-black uppercase">{l('debilitated', 'Debilitated')}</span>}
                                                                {!p.isExalted && !p.isDebilitated && <span className="text-white/40 text-[10px] uppercase font-bold">{l('neutral', 'Neutral')}</span>}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* 4. DASHAS TAB */}
                                {activeTab === 'dashas' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                        {/* Current Dasha Summary */}
                                        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 text-white overflow-hidden relative shadow-2xl">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                                            <div className="relative z-10">
                                                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                                    <Activity className="w-5 h-5 text-indigo-400" /> {l('current_vimshottari_dasha', 'Current Vimshottari Dasha')}
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 text-center">
                                                        <div className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-2">Mahadasha</div>
                                                        <div className="text-4xl font-black mb-1">{translatePlanet(chart.dasha?.currentLords?.[0] || 'Sun', locale)}</div>
                                                        <div className="text-xs text-white/50">
                                                            {(() => { const pd = chart.dasha?.periods?.find((x: any) => x.lord === chart.dasha?.currentLords?.[0]); return pd ? new Date(pd.start).toLocaleDateString('en-IN', {year:'numeric',month:'short'}) + ' → ' + new Date(pd.end).toLocaleDateString('en-IN', {year:'numeric',month:'short'}) : '—'; })()}
                                                        </div>
                                                    </div>
                                                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5 text-center">
                                                        <div className="text-xs font-bold uppercase tracking-widest text-purple-300 mb-2">Antardasha</div>
                                                        <div className="text-3xl font-bold text-indigo-300 mb-1">{translatePlanet(chart.dasha?.currentLords?.[1] || 'Moon', locale)}</div>
                                                        <div className="text-xs text-white/50">{l('sub_period', 'Sub Period Active')}</div>
                                                    </div>
                                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-5 text-center">
                                                        <div className="text-xs font-bold uppercase tracking-widest text-orange-300 mb-2">Pratyantardasha</div>
                                                        <div className="text-3xl font-bold text-orange-300 mb-1">{translatePlanet(chart.dasha?.currentLords?.[2] || '—', locale)}</div>
                                                        <div className="text-xs text-white/50">{l('minor_period', 'Minor Period')}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Full Mahadasha Timeline */}
                                        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/10">
                                            <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                                                <Clock3 className="w-6 h-6 text-orange-500" /> Mahadasha Timeline
                                            </h3>
                                            <div className="space-y-4">
                                                {chart.dasha?.periods?.map((p: any, i: number) => {
                                                    const now = Date.now();
                                                    const start = new Date(p.start).getTime();
                                                    const end = new Date(p.end).getTime();
                                                    const isActive = now >= start && now <= end;
                                                    const isPast = now > end;
                                                    const progressPct = isActive ? Math.round(((now - start) / (end - start)) * 100) : 0;
                                                    const yearsLeft = isActive ? ((end - now) / (1000*60*60*24*365.25)).toFixed(1) : null;
                                                    return (
                                                        <div key={i} className={`p-5 rounded-2xl border transition-all ${isActive ? 'bg-orange-500/10 border-orange-500/40' : isPast ? 'bg-white/3 border-white/5 opacity-50' : 'bg-white/5 border-white/10'}`}>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className={`font-black text-lg ${isActive ? 'text-orange-400' : isPast ? 'text-white/40' : 'text-white'}`}>
                                                                            {translatePlanet(p.lord, locale)} Mahadasha
                                                                        </span>
                                                                        {isActive && <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-black uppercase animate-pulse">Active</span>}
                                                                        {isPast && <span className="text-[10px] bg-white/10 text-white/40 px-2 py-0.5 rounded-full font-black uppercase">Done</span>}
                                                                    </div>
                                                                    <div className={`text-sm mt-0.5 ${isActive ? 'text-orange-300/70' : 'text-white/40'}`}>
                                                                        {new Date(p.start).toLocaleDateString('en-IN', {year:'numeric', month:'short'})} — {new Date(p.end).toLocaleDateString('en-IN', {year:'numeric', month:'short'})}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className={`font-bold text-xl ${isActive ? 'text-orange-400' : 'text-white/40'}`}>{Math.round(p.duration)} yrs</div>
                                                                    {yearsLeft && <div className="text-xs text-orange-300/60">{yearsLeft} yrs left</div>}
                                                                </div>
                                                            </div>
                                                            {isActive && (
                                                                <div className="mt-3">
                                                                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{ width: `${progressPct}%` }} />
                                                                    </div>
                                                                    <div className="text-xs text-orange-300/60 mt-1 text-right">{progressPct}% elapsed</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 5. ASHTAKVARGA TAB */}
                                {activeTab === 'ashtakvarga' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                        {/* Explanation Banner */}
                                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5">
                                            <div className="text-xs font-black uppercase tracking-widest text-yellow-400 mb-2">Ashtakvarga — {l('what_is_this', 'Kya hai yeh?')}</div>
                                            <p className="text-white/70 text-sm leading-relaxed">
                                                Ashtakvarga ek Vedic system hai jisme har rashi (zodiac sign) ko ek score milta hai — 0 se 56 tak. <strong className="text-white">28+ = Strong (shubh)</strong>, <strong className="text-yellow-300">20–27 = Medium</strong>, <strong className="text-red-400">0–19 = Weak (chakkar pade sakta hai)</strong>. Jis rashi mein planet transit kare aur score zyada ho, woh period acha hota hai.
                                            </p>
                                        </div>
                                        {/* Score Grid */}
                                        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/10">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-2xl font-black flex items-center gap-3">
                                                    <Activity className="w-6 h-6 text-yellow-500" /> Sarvashtakvarga Points
                                                </h3>
                                                <div className="text-sm text-white/40">
                                                    Total: <span className="font-black text-white">{(_SIGNS).reduce((acc, _, idx) => acc + ((chart.ashtakvarga?.sarva?.[idx]) || 28), 0)}</span>/672
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                {(_SIGNS).map((sign, idx) => {
                                                    const points = (chart.ashtakvarga?.sarva?.[idx]) || 28;
                                                    const strength = points >= 30 ? 'excellent' : points >= 25 ? 'good' : points >= 20 ? 'medium' : 'weak';
                                                    const colorClass = strength === 'excellent' ? 'text-green-400' : strength === 'good' ? 'text-blue-400' : strength === 'medium' ? 'text-yellow-400' : 'text-red-400';
                                                    const bgClass = strength === 'excellent' ? 'bg-green-500/10 border-green-500/20' : strength === 'good' ? 'bg-blue-500/10 border-blue-500/20' : strength === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20';
                                                    const label = strength === 'excellent' ? l('ashtk_excellent', 'Uchch') : strength === 'good' ? l('ashtk_good', 'Acha') : strength === 'medium' ? l('ashtk_medium', 'Madhyam') : l('ashtk_weak', 'Kamzor');
                                                    return (
                                                        <div key={idx} className={`p-4 rounded-2xl border text-center ${bgClass}`}>
                                                            <div className="text-[11px] text-white/50 uppercase font-black tracking-widest mb-1">{translateSign(sign, locale)}</div>
                                                            <div className={`text-3xl font-black mb-1 ${colorClass}`}>{points}</div>
                                                            <div className={`text-[10px] font-bold uppercase ${colorClass}`}>{label}</div>
                                                            <div className="w-full h-1.5 bg-white/10 mt-2 rounded-full overflow-hidden">
                                                                <div className={`h-full rounded-full ${strength === 'excellent' ? 'bg-green-500' : strength === 'good' ? 'bg-blue-500' : strength === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${(points / 56) * 100}%` }} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        {/* Legend */}
                                        <div className="flex flex-wrap gap-4 text-sm">
                                            {[['bg-green-500', '30–56', l('ashtk_excellent','Uchch / Excellent')], ['bg-blue-500', '25–29', l('ashtk_good','Acha / Good')], ['bg-yellow-500', '20–24', l('ashtk_medium','Madhyam / Medium')], ['bg-red-500', '0–19', l('ashtk_weak','Kamzor / Weak')]].map(([bg, range, lbl]) => (
                                                <div key={range} className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${bg}`} />
                                                    <span className="text-white/50">{range}:</span>
                                                    <span className="text-white/80 font-bold">{lbl}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 6. DOSHAS TAB */}
                                {activeTab === 'doshas' && (
                                    <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-right-4">
                                        {Object.entries(chart.doshas).map(([key, data]: [string, any]) => {
                                            const doshaInfo = getTrans(locale).doshas?.[key];
                                            return (
                                                <div key={key} className={`rounded-[2rem] p-8 border backdrop-blur-xl ${data.present ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${data.present ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                                                {data.present ? '⚠️' : '✅'}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-xl font-black text-white">{doshaInfo?.name || key}</h3>
                                                                <div className={`text-xs font-bold uppercase tracking-wider ${data.present ? 'text-red-400' : 'text-green-400'}`}>
                                                                    {data.present ? l('dosha_present', 'Present') : l('dosha_absent', 'Absent')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-white/70 leading-relaxed mb-4">{doshaInfo?.description || data.description || 'No major negative influence detected.'}</p>
                                                    {data.present && doshaInfo?.remedies && (
                                                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                                            <div className="text-xs font-black uppercase tracking-widest text-orange-400 mb-3">{l('remedies', 'Remedies')}</div>
                                                            <ul className="space-y-2">
                                                                {doshaInfo.remedies.map((r: string, ri: number) => (
                                                                    <li key={ri} className="flex items-start gap-2 text-sm text-white/70">
                                                                        <span className="text-orange-500 mt-0.5">•</span> {r}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* 7. PREDICTIONS TAB */}
                                {activeTab === 'predictions' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                        <div className="grid grid-cols-1 gap-12">
                                            {Object.entries(chart.predictions || {}).map(([area, text]: [string, any]) => (
                                                <div key={area} className="group bg-white/5 hover:bg-orange-500/5 p-8 rounded-3xl border border-white/5 hover:border-orange-500/30 transition-all duration-500">
                                                    <div className="flex items-center gap-4 mb-6">
                                                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                                            {area === 'Career' ? <Briefcase className="w-6 h-6" /> : area === 'Health' ? <Activity className="w-6 h-6" /> : area === 'Marriage' ? <Heart className="w-6 h-6" /> : area === 'Wealth' ? <Zap className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
                                                        </div>
                                                        <h4 className="text-2xl font-black text-white group-hover:text-orange-500 transition-colors">
                                                            {l(area.toLowerCase(), area)}
                                                        </h4>
                                                    </div>
                                                    <div className="text-white/70 leading-[1.8] text-lg font-medium whitespace-pre-line">
                                                        {text}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 8. REMEDIES TAB */}
                                {activeTab === 'remedies' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                        {/* Gemstones */}
                                        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
                                            <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                                                <Star className="w-6 h-6 text-yellow-400" /> {l('lucky_gemstones', 'Lucky Gemstones')}
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                                {(() => {
                                                    const gs = getTrans(locale).gemstones;
                                                    const gemDetails: any = {
                                                        Sun:     { day: l('sunday','Sunday'), finger: l('ring_finger','Ring Finger'), metal: 'Gold', mantra: 'Om Suryaya Namah', weight: '3-5 Ratti' },
                                                        Jupiter: { day: l('thursday','Thursday'), finger: l('index_finger','Index Finger'), metal: 'Gold', mantra: 'Om Guruve Namah', weight: '5-7 Ratti' },
                                                        Moon:    { day: l('monday','Monday'), finger: l('little_finger','Little Finger'), metal: 'Silver', mantra: 'Om Chandraya Namah', weight: '5-7 Ratti' },
                                                    };
                                                    return [
                                                        { label: l('life_stone','Life Stone'), key: 'Sun', stone: gs['Sun'], planet: translatePlanet('Sun', locale) },
                                                        { label: l('lucky_stone','Lucky Stone'), key: 'Jupiter', stone: gs['Jupiter'], planet: translatePlanet('Jupiter', locale) },
                                                        { label: l('benefic_stone','Benefic Stone'), key: 'Moon', stone: gs['Moon'], planet: translatePlanet('Moon', locale) },
                                                    ].map((item, i) => (
                                                        <div key={i} className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 p-6 rounded-2xl border border-amber-500/20">
                                                            <div className="text-xs font-black uppercase tracking-widest text-amber-400 mb-3">{item.label}</div>
                                                            <div className="text-2xl font-black text-white mb-1">{item.stone}</div>
                                                            <div className="text-sm text-white/50 mb-4">{l('for_planet','For')} {item.planet}</div>
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between"><span className="text-white/40">{l('wear_day','Wear on')}</span><span className="text-white font-bold">{gemDetails[item.key]?.day}</span></div>
                                                                <div className="flex justify-between"><span className="text-white/40">{l('wear_finger','Finger')}</span><span className="text-white font-bold">{gemDetails[item.key]?.finger}</span></div>
                                                                <div className="flex justify-between"><span className="text-white/40">{l('metal','Metal')}</span><span className="text-white font-bold">{gemDetails[item.key]?.metal}</span></div>
                                                                <div className="flex justify-between"><span className="text-white/40">{l('weight','Weight')}</span><span className="text-white font-bold">{gemDetails[item.key]?.weight}</span></div>
                                                            </div>
                                                            <div className="mt-4 bg-white/5 rounded-xl p-3">
                                                                <div className="text-[10px] font-black uppercase text-orange-400 mb-1">Mantra</div>
                                                                <div className="text-sm text-orange-200 font-mono">{gemDetails[item.key]?.mantra}</div>
                                                            </div>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                        </div>
                                        {/* Spiritual Remedies */}
                                        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10">
                                            <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                                                <Sparkles className="w-6 h-6 text-indigo-400" /> {l('spiritual_remedies', 'Spiritual Remedies')}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {[
                                                    { title: l('mahadasha_remedy','Mahadasha Remedy'), desc: `${translatePlanet(chart.dasha?.currentLords?.[0] || 'Sun', locale)} ${l('mahadasha_remedy_desc','ki Mahadasha chal rahi hai. Inke Beej Mantra ka 108 baar jaap karo pratidin, visheshkar subah surya darshan ke baad.')}` },
                                                    { title: l('saturn_remedy','Shani Remedy'), desc: l('saturn_remedy_desc','Shanivar ko peeple ke ped ko jal chadhaein aur kale til, urad dal ya sarson ka tel daan karo. Shani yantra ghar mein sthaapit karein.') },
                                                    { title: l('mars_remedy','Mangal Remedy'), desc: l('mars_remedy_desc','Mangalwar ko hanuman chalisa padhein. Lal kapde mein moonga ya lal matar baandh ke donate karein. Raktdaan bhi falaydayak hai.') },
                                                    { title: l('surya_remedy','Surya Remedy'), desc: l('surya_remedy_desc','Pratidin subah surya ko lal pushp aur chandan milakar jal chadhaein. Aditya Hridayam ka paath karein. Ruby ya tambe ki anguthi daayen haath mein pehnen.') },
                                                ].map((rem, ri) => (
                                                    <div key={ri} className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                                        <div className="text-sm font-black text-orange-400 uppercase tracking-widest mb-2">{rem.title}</div>
                                                        <p className="text-white/70 text-sm leading-relaxed">{rem.desc}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="lg:col-span-8 flex flex-col items-center justify-center text-center p-12 glass rounded-[2.5rem] border-slate-200">
                            <div className="w-24 h-24 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center p-6 mb-6 animate-pulse">
                                <Sparkles className="w-full h-full" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3">Begin Your Journey</h3>
                            <p className="text-slate-500 max-w-sm">Enter your birth details to generate a comprehensive 15+ page Vedic Astrology report.</p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />

            {/* Hidden PDF Export Content */}
            {chart && (
                <>
                <div 
                    ref={pdfContentRef}
                    className="fixed -left-[9999px] top-0 bg-white p-10 text-slate-900 w-[800px] leading-relaxed opacity-100"
                    style={{ fontFeatureSettings: '"kern" 1', WebkitFontSmoothing: 'antialiased', zIndex: -1000 }}
                >
                    {/* Hidden Charts for PDF Capture */}
                    <div className="hidden-charts-for-pdf">
                        <div ref={pdfLagnaRef} className="bg-white p-4" style={{ width: '600px' }}>
                            <LagnaChart chart={chart.charts?.D1 || {}} planets={chart.planets} ascendant={chart.ascendantLongitude} title="Lagna Chart" subTitle="D1" />
                        </div>
                        <div ref={pdfD9Ref} className="bg-white p-4" style={{ width: '600px' }}>
                            <LagnaChart chart={chart.charts?.D9 || {}} planets={chart.planets} ascendant={chart.d9Ascendant} title="Navamsa Chart" subTitle="D9" />
                        </div>
                        <div ref={pdfMoonRef} className="bg-white p-4" style={{ width: '600px' }}>
                            <LagnaChart chart={chart.charts?.Moon || {}} planets={chart.planets} ascendant={chart.moonLongitude} title="Moon Chart" subTitle="Chandra" />
                        </div>
                        <div ref={pdfD10Ref} className="bg-white p-4" style={{ width: '600px' }}>
                            <LagnaChart chart={chart.charts?.D10 || {}} planets={chart.planets} ascendant={chart.d10Ascendant} title="Dasamsa Chart" subTitle="D10" />
                        </div>
                    </div>
                    {/* Page: Predictions */}
                    <div id="pdf-predictions" className="space-y-8 p-10 mb-20 bg-white min-h-[1100px]">
                        <h1 className="text-3xl font-black text-orange-600 border-b-4 border-orange-500 pb-2 mb-8">
                            Life Predictions
                        </h1>
                        <div className="space-y-10">
                            {Object.entries(chart.predictions || {}).map(([key, value]) => (
                                <div key={key} className="border-l-4 border-slate-200 pl-6 py-2">
                                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-wide mb-3">
                                        {(getTrans(locale).labels?.life_predictions as any)?.[key] || key}
                                    </h3>
                                    <p className="text-lg text-slate-700 leading-8 text-justify">
                                        {value as string}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Page: Birth Details & Panchang */}
                    <div id="pdf-panchang" className="p-10 mb-20 bg-white min-h-[1100px]">
                        <h1 className="text-3xl font-black text-blue-600 border-b-4 border-blue-500 pb-2 mb-8">
                            Birth Details & Panchang
                        </h1>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-blue-600 text-white">
                                    <th className="p-4 text-left border border-blue-500">Attribute</th>
                                    <th className="p-4 text-left border border-blue-500">Value</th>
                                </tr>
                            </thead>
                            <tbody className="text-lg">
                                {[
                                    ['Name', formData.name],
                                    ['Date', formData.dob],
                                    ['Time', formData.tob],
                                    ['Place', formData.birthplace],
                                    ['Tithi', chart.panchang.tithi],
                                    ['Nakshatra', chart.planets.find((p: any) => p.name === "Moon")?.nakshatra || "N/A"],
                                    ['Yoga', chart.panchang.yoga],
                                    ['Karan', chart.panchang.karana],
                                    ['Sunrise', chart.panchang.sunrise],
                                    ['Sunset', chart.panchang.sunset],
                                ].map(([label, val], idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                                        <td className="p-4 border border-slate-200 font-bold">{label}</td>
                                        <td className="p-4 border border-slate-200 ">{val}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Page: Planetary Positions */}
                    <div id="pdf-planets" className="p-10 mb-20 bg-white min-h-[1100px]">
                        <h1 className="text-3xl font-black text-purple-600 border-b-4 border-purple-500 pb-2 mb-8 uppercase tracking-widest">
                            {l("panchang_title", "Planetary Positions")}
                        </h1>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-purple-600 text-white">
                                    <th className="p-4 text-left border border-purple-500">{l("attribute", "Planet")}</th>
                                    <th className="p-4 text-left border border-purple-500">{l("table.koota", "Sign")}</th>
                                    <th className="p-4 text-left border border-purple-500">{l("label_degree", "Degree")}</th>
                                    <th className="p-4 text-left border border-purple-500">{l("label_house", "House")}</th>
                                </tr>
                            </thead>
                            <tbody className="text-lg text-slate-800">
                                {chart.planets.map((p: any, idx: number) => (
                                    <tr key={idx} className={idx % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                                        <td className="p-4 border border-slate-200 font-bold">{translatePlanet(p.name, locale)}</td>
                                        <td className="p-4 border border-slate-200">{translateSign(p.sign, locale)}</td>
                                        <td className="p-4 border border-slate-200 font-mono text-sm">{Math.floor(p.longitude % 30)}° {Math.round((p.longitude % 1) * 60)}'</td>
                                        <td className="p-4 border border-slate-200 font-bold text-center">{p.house}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Page: Doshas */}
                    <div id="pdf-doshas" className="space-y-8 p-10 bg-white min-h-[1100px]">
                        <h1 className="text-3xl font-black text-red-600 border-b-4 border-red-500 pb-2 mb-8">
                            Dosha Analysis
                        </h1>
                        <div className="grid grid-cols-1 gap-12">
                            {Object.entries(chart.doshas).map(([key, data]: [string, any]) => (
                                <div key={key} className={"p-8 rounded-3xl border-2 " + (data.present ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200") + ""}>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={"text-2xl " + (data.present ? "text-red-600" : "text-green-600") + ""}>
                                            {data.present ? "⚠" : "✔"}
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900">{key}</h2>
                                        <span className={"ml-auto px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest " + (data.present ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800") + ""}>
                                            {data.present ? "Active" : "Safe"}
                                        </span>
                                    </div>
                                    <p className="text-lg text-slate-700 leading-relaxed mb-6 italic">
                                        {data.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Page: Remedies */}
                    <div id="pdf-remedies" className="space-y-8 p-10 bg-white min-h-[1100px]">
                        <h1 className="text-3xl font-black text-amber-600 border-b-4 border-amber-500 pb-2 mb-8">
                            Remedies & Gemstones
                        </h1>
                        <div className="grid grid-cols-1 gap-8">
                            {/* Gemstones Section */}
                            <div className="bg-amber-50 p-8 rounded-3xl border-2 border-amber-100">
                                <h3 className="text-2xl font-black text-amber-900 mb-6 flex items-center gap-3">Lucky Gemstones</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {/* Calculated Gemstones Logic simplified for PDF */}
                                    <div className="bg-white p-6 rounded-2xl border border-amber-200">
                                        <div className="text-sm font-bold text-amber-600 uppercase mb-2">Recommendation</div>
                                        <p className="text-lg text-slate-800 font-medium">Based on your Lagna ({chart.ascendantSign}), wearing a high-quality Gemstone of your Lagna Lord can bring significant prosperity and health.</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* General Remedies */}
                            <div className="bg-indigo-50 p-8 rounded-3xl border-2 border-indigo-100">
                                <h3 className="text-2xl font-black text-indigo-900 mb-6">Spiritual Remedies</h3>
                                <ul className="space-y-4">
                                    <li className="flex gap-4 items-start text-lg text-indigo-900">
                                        <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center shrink-0">.</span>
                                        Recite the Beej Mantra of your Mahadasha Lord ({chart.dasha?.currentLords?.[0]}) for mental peace.
                                    </li>
                                    <li className="flex gap-4 items-start text-lg text-indigo-900">
                                        <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center shrink-0">.</span>
                                        Perform charity on Saturdays to appease Saturn's influence in your chart.
                                    </li>
                                    <li className="flex gap-4 items-start text-lg text-indigo-900">
                                        <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center shrink-0">.</span>
                                        Maintain a vegetarian diet on Tuesdays to strengthen Mars.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="fixed -left-[9999px] top-0 pointer-events-none w-[800px] bg-white opacity-100 z-[-100]">
                    {/* Avakahada / Birth Details */}
                    <div id="pdf-birth-details" className="p-10 bg-white min-h-[800px] text-slate-900">
                        <h1 className="text-4xl font-black mb-8 border-b-4 border-orange-500 pb-2 uppercase tracking-widest">{l("beginCheckTitle", "Birth Attributes")}</h1>
                        <div className="grid grid-cols-2 gap-8 text-xl">
                            <div className="border p-4 rounded-xl"><b>Name:</b> {formData.name}</div>
                            <div className="border p-4 rounded-xl"><b>Date:</b> {formData.dob}</div>
                            <div className="border p-4 rounded-xl"><b>Time:</b> {formData.tob}</div>
                            <div className="border p-4 rounded-xl"><b>Place:</b> {formData.birthplace}</div>
                            <div className="border p-4 rounded-xl"><b>Varna:</b> {chart.avakahada.varna}</div>
                            <div className="border p-4 rounded-xl"><b>Yoni:</b> {chart.avakahada.yoni}</div>
                            <div className="border p-4 rounded-xl"><b>Gana:</b> {chart.avakahada.gana}</div>
                            <div className="border p-4 rounded-xl"><b>Nadi:</b> {chart.avakahada.nadi}</div>
                        </div>
                    </div>

                    {/* Dasha Detailed Timeline */}
                    <div id="pdf-dasha-detailed" className="p-10 bg-white min-h-[1100px] text-slate-900">
                        <h1 className="text-4xl font-black mb-8 border-b-4 border-indigo-500 pb-2 uppercase tracking-widest">{l("vimshottariDasha", "Vimshottari Dasha Timeline")}</h1>
                        <div className="space-y-4">
                            {chart.dasha?.periods?.map((p: any, i: number) => (
                                <div key={i} className="flex justify-between border-b py-4 text-lg">
                                    <span className="font-bold">{translatePlanet(p.lord, locale)} Mahadasha</span>
                                    <span>{new Date(p.start).toLocaleDateString()} - {new Date(p.end).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ashtakvarga Table */}
                    <div id="pdf-ashtakvarga" className="p-10 bg-white min-h-[600px] text-slate-900">
                        <h1 className="text-4xl font-black mb-8 border-b-4 border-yellow-500 pb-2 uppercase tracking-widest">{l("gunaScoreDistribution", "Sarvashtakvarga Points")}</h1>
                        <div className="grid grid-cols-4 gap-4">
                            {_SIGNS.map((sign, i) => (
                                <div key={i} className="border p-4 text-center">
                                    <div className="font-bold">{translateSign(sign, locale)}</div>
                                    <div className="text-2xl font-black">{chart.ashtakvarga?.sarva?.[i] || 28}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Secondary Dosha View (Unique ID) */}
                    <div id="pdf-doshas-detailed" className="p-10 bg-white min-h-[900px] text-slate-900">
                        <h1 className="text-4xl font-black mb-8 border-b-4 border-red-500 pb-2 uppercase tracking-widest">{l("doshaCheck", "Dosha Analysis")}</h1>
                        <div className="space-y-6">
                            {Object.entries(chart.doshas || {}).map(([key, data]: any) => (
                                <div key={key} className={`p-6 rounded-2xl border-2 ${data.present ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                    <h2 className="text-2xl font-bold mb-2 flex justify-between">
                                        <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        <span className={data.present ? 'text-red-600' : 'text-green-600'}>{data.present ? 'PRESENT' : 'ABSENT'}</span>
                                    </h2>
                                    <p className="text-lg opacity-80">{data.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Prediction Pages */}
                    <div id="pdf-pred-career" className="p-10 bg-white min-h-[500px] text-slate-900">
                        <h1 className="text-3xl font-black mb-6 text-orange-600 uppercase tracking-widest">{l("career", "Career & Profession")}</h1>
                        <p className="text-xl leading-relaxed">{chart.predictions?.Career}</p>
                    </div>
                    <div id="pdf-pred-health" className="p-10 bg-white min-h-[500px] text-slate-900">
                        <h1 className="text-3xl font-black mb-6 text-red-600 uppercase tracking-widest">{l("longevity_health", "Health & Wellbeing")}</h1>
                        <p className="text-xl leading-relaxed">{chart.predictions?.Health}</p>
                    </div>
                    <div id="pdf-pred-marriage" className="p-10 bg-white min-h-[500px] text-slate-900">
                        <h1 className="text-3xl font-black mb-6 text-pink-600 uppercase tracking-widest">{l("marriageAnalysis", "Marriage & Relationships")}</h1>
                        <p className="text-xl leading-relaxed">{chart.predictions?.Marriage}</p>
                    </div>
                    <div id="pdf-pred-wealth" className="p-10 bg-white min-h-[500px] text-slate-900">
                        <h1 className="text-3xl font-black mb-6 text-green-600 uppercase tracking-widest">{l("finance_wealth", "Wealth & Finance")}</h1>
                        <p className="text-xl leading-relaxed">{chart.predictions?.Wealth}</p>
                    </div>
                    <div id="pdf-pred-edu" className="p-10 bg-white min-h-[500px] text-slate-900">
                        <h1 className="text-3xl font-black mb-6 text-blue-600 uppercase tracking-widest">{l("personalityTraits", "Education & Personality")}</h1>
                        <p className="text-xl leading-relaxed">{chart.predictions?.Education}</p>
                    </div>
                </div>
                </>
            )}
        </main>
    );
}
