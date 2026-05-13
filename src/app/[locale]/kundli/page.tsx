"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";
import { Sparkles, MapPin, Clock3, Calendar, User, Star, Zap, Activity, Heart, Briefcase, GraduationCap, LayoutGrid, FileText, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { LocationInput } from "@/components/kundli/LocationInput";
import { LagnaChart } from "@/components/kundli/LagnaChart";
import { DetailCard, DetailRow } from "@/components/kundli/DetailCard";
// import { calculatePlanets, calculatePanchang, calculateVimshottari, calculateDivisionalCharts, calculateDoshas, calculateYogas } from "@/lib/astrology/calculator";
import { generateLifePredictions } from "@/lib/astrology/prediction-engine";
import { useLocale } from "next-intl";
import { translateSign, translatePlanet, getTrans } from "@/lib/astrology/i18n";

export default function KundliPage() {
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
            const dateStr = `${formData.dob}T${formData.tob || "12:00"}`;
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

            const baseChart = {
                ...fullData,
                dateStr: birthDate.toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-US'),
                ascendantSign: ascPlanet?.sign || "Aries",
                ascendantLongitude: fullData.ascendant || (ascPlanet?.longitude ?? 0),
                moonSign: moonPlanet?.sign || "Aries",
                moonLongitude: moonPlanet?.longitude ?? 0,
                sunSign: sunPlanet?.sign || "Pisces",
                nakshatra: moonPlanet?.nakshatraId 
                    ? trans.nakshatras[moonPlanet.nakshatraId - 1] 
                    : "Unknown",
            };

            // Generate Dynamic Detailed Report
            const detailedReport = generateLifePredictions(baseChart, locale);
            const newChart = {
                ...baseChart,
                predictions: detailedReport,
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

        const captureChartImage = async (ref: React.RefObject<HTMLDivElement | null>): Promise<string | null> => {
            try {
                const svgEl = ref.current?.querySelector('svg');
                if (!svgEl) return null;
                const clonedSvg = svgEl.cloneNode(true) as SVGSVGElement;
                clonedSvg.setAttribute('width', '800');
                clonedSvg.setAttribute('height', '800');
                const svgData = new XMLSerializer().serializeToString(clonedSvg);
                const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                const svgUrl = URL.createObjectURL(svgBlob);
                return await new Promise<string>((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = 800;
                        canvas.height = 800;
                        const ctx = canvas.getContext('2d')!;
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, 800, 800);
                        ctx.drawImage(img, 0, 0, 800, 800);
                        URL.revokeObjectURL(svgUrl);
                        resolve(canvas.toDataURL('image/png'));
                    };
                    img.onerror = () => { URL.revokeObjectURL(svgUrl); reject(null); };
                    img.src = svgUrl;
                });
            } catch (e) { return null; }
        };

        const captureSection = async (elementId: string): Promise<string | null> => {
            const element = document.getElementById(elementId);
            if (!element) return null;
            try {
                const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
                return canvas.toDataURL('image/jpeg', 0.85);
            } catch (e) { return null; }
        };

        const doc = new jsPDF('p', 'mm', 'a4');
        toast.loading("Generating 20-page Premium Report...", { id: "pdf-gen" });

        // Assets
        const [d1Img, d9Img, moonImg, d10Img, basicImg, panchangImg, planetsImg, dashaImg, ashtakImg, doshaImg, predCareer, predHealth, predMarriage, predWealth, predEdu, remediesImg] = await Promise.all([
            captureChartImage(lagnaChartRef),
            captureChartImage(d9ChartRef),
            captureChartImage(moonChartRef),
            captureChartImage(d10ChartRef),
            captureSection("pdf-birth-details"),
            captureSection("pdf-panchang"),
            captureSection("pdf-planets"),
            captureSection("pdf-dasha-detailed"),
            captureSection("pdf-ashtakvarga"),
            captureSection("pdf-doshas"),
            captureSection("pdf-pred-career"),
            captureSection("pdf-pred-health"),
            captureSection("pdf-pred-marriage"),
            captureSection("pdf-pred-wealth"),
            captureSection("pdf-pred-edu"),
            captureSection("pdf-remedies")
        ]);

        const addHeader = (title: string) => {
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`JyotishConnect Premium Report | ${title}`, 195, 15, { align: "right" });
            doc.line(15, 20, 195, 20);
        };

        const addFooter = (page: number) => {
            doc.setFontSize(8);
            doc.text(`Page ${page} of 20`, 105, 285, { align: "center" });
        };

        // Page 1: Cover
        doc.setFillColor(15, 15, 35);
        doc.rect(0, 0, 210, 297, 'F');
        doc.setTextColor(249, 115, 22);
        doc.setFontSize(40);
        doc.text("JyotishConnect", 105, 100, { align: "center" });
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.text("Premium Vedic Astrology Report", 105, 115, { align: "center" });
        doc.setFontSize(14);
        doc.text(formData.name, 105, 150, { align: "center" });
        doc.text(`${formData.dob} | ${formData.birthplace}`, 105, 160, { align: "center" });

        // Page 2: Birth Details
        doc.addPage(); addHeader("Birth Attributes");
        if (basicImg) doc.addImage(basicImg, 'JPEG', 15, 30, 180, 120);
        addFooter(2);

        // Page 3: Panchang
        doc.addPage(); addHeader("Daily Panchang");
        if (panchangImg) doc.addImage(panchangImg, 'JPEG', 15, 30, 180, 200);
        addFooter(3);

        // Page 4: Lagna Chart
        doc.addPage(); addHeader("Lagna Chart (D1)");
        if (d1Img) doc.addImage(d1Img, 'PNG', 35, 40, 140, 140);
        addFooter(4);

        // Page 5: Navamsa Chart
        doc.addPage(); addHeader("Navamsa Chart (D9)");
        if (d9Img) doc.addImage(d9Img, 'PNG', 35, 40, 140, 140);
        addFooter(5);

        // Page 6: Moon Chart
        doc.addPage(); addHeader("Moon Chart (Chandra)");
        if (moonImg) doc.addImage(moonImg, 'PNG', 35, 40, 140, 140);
        addFooter(6);

        // Page 7: Dasamsa Chart
        doc.addPage(); addHeader("Dasamsa Chart (D10)");
        if (d10Img) doc.addImage(d10Img, 'PNG', 35, 40, 140, 140);
        addFooter(7);

        // Page 8: Planetary Positions
        doc.addPage(); addHeader("Planetary Positions");
        if (planetsImg) doc.addImage(planetsImg, 'JPEG', 15, 30, 180, 220);
        addFooter(8);

        // Page 9-11: Dasha Timeline
        doc.addPage(); addHeader("Vimshottari Dasha");
        if (dashaImg) doc.addImage(dashaImg, 'JPEG', 15, 30, 180, 240);
        addFooter(9);

        // Page 12: Ashtakvarga
        doc.addPage(); addHeader("Ashtakvarga Analysis");
        if (ashtakImg) doc.addImage(ashtakImg, 'JPEG', 15, 30, 180, 150);
        addFooter(12);

        // Page 13: Doshas
        doc.addPage(); addHeader("Dosha Analysis");
        if (doshaImg) doc.addImage(doshaImg, 'JPEG', 15, 30, 180, 230);
        addFooter(13);

        // Page 14-18: Predictions
        doc.addPage(); addHeader("Career Prediction");
        if (predCareer) doc.addImage(predCareer, 'JPEG', 15, 30, 180, 100);
        addFooter(14);

        doc.addPage(); addHeader("Health Prediction");
        if (predHealth) doc.addImage(predHealth, 'JPEG', 15, 30, 180, 100);
        addFooter(15);

        doc.addPage(); addHeader("Marriage Prediction");
        if (predMarriage) doc.addImage(predMarriage, 'JPEG', 15, 30, 180, 100);
        addFooter(16);

        doc.addPage(); addHeader("Wealth Prediction");
        if (predWealth) doc.addImage(predWealth, 'JPEG', 15, 30, 180, 100);
        addFooter(17);

        doc.addPage(); addHeader("Education Prediction");
        if (predEdu) doc.addImage(predEdu, 'JPEG', 15, 30, 180, 100);
        addFooter(18);

        // Page 19: Remedies
        doc.addPage(); addHeader("Divine Remedies");
        if (remediesImg) doc.addImage(remediesImg, 'JPEG', 15, 30, 180, 200);
        addFooter(19);

        // Page 20: Final Conclusion
        doc.addPage(); addHeader("Conclusion");
        doc.setFontSize(16); doc.text("Blessings & Guidance", 105, 50, { align: "center" });
        doc.setFontSize(11);
        doc.text("May the celestial alignments guide you towards peace and prosperity.", 105, 70, { align: "center" });
        addFooter(20);

        doc.save(`Kundli_Report_${formData.name}.pdf`);
        toast.success("Divine Report Downloaded!", { id: "pdf-gen" });
    };

    const captureSection = async (elementId: string): Promise<string | null> => {
        doc.addPage();
        addHeader("Divine Charts");
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.text(locale === 'hi' ? "कुण्डली चार्ट्स (Charts)" : "Kundli Charts", 15, 40);

        if (d1Img) {
            doc.setFontSize(11);
            doc.text(locale === 'hi' ? "लग्न कुण्डली (D1)" : "Lagna Chart (D1)", 15, 55);
            doc.addImage(d1Img, 'PNG', 15, 60, 85, 85);
        }
        if (d9Img) {
            doc.setFontSize(11);
            doc.text(locale === 'hi' ? "नवांश कुण्डली (D9)" : "Navamsa Chart (D9)", 110, 55);
            doc.addImage(d9Img, 'PNG', 110, 60, 85, 85);
        }
        if (moonImg) {
            doc.setFontSize(11);
            doc.text(locale === 'hi' ? "चन्द्र कुण्डली" : "Moon Chart", 15, 165);
            doc.addImage(moonImg, 'PNG', 15, 170, 85, 85);
        }
        if (d10Img) {
            doc.setFontSize(11);
            doc.text(locale === 'hi' ? "दशमांश कुण्डली (D10)" : "Dashamsha Chart (D10)", 110, 165);
            doc.addImage(d10Img, 'PNG', 110, 170, 85, 85);
        }
        addFooter(2);

        // --- SNAPSHOT PAGES ---
        const images = [
            { img: panchangImg, title: "Panchang" },
            { img: planetsImg, title: "Planets" },
            { img: doshasImg, title: "Dosha Analysis" },
            { img: predictionsImg, title: "Life Predictions" },
            { img: remediesImg, title: "Remedies & Gemstones" }
        ];

        images.forEach((item, idx) => {
            if (item.img) {
                doc.addPage();
                // We add the image directly covering the page for snapshot sections
                doc.addImage(item.img, 'JPEG', 0, 0, 210, 297);
                // Overlay a small header to maintain branding
                if (logoBase64) doc.addImage(logoBase64, 'PNG', 15, 5, 25, 8);
                doc.setFontSize(7);
                doc.setTextColor(150, 150, 150);
                doc.text(item.title, 195, 10, { align: "right" });
                addFooter(idx + 3);
            }
        });

        toast.success("Report ready for download!", { id: "pdf-gen" });
        doc.save(`Kundli_Report_${formData.name.replace(/\s+/g, '_')}.pdf`);
    };



    return (
        <main className="min-h-screen bg-[#050510] text-white overflow-x-hidden selection:bg-orange-500/30 font-inter">
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
                                        className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-100"
                                            : "text-slate-500 hover:text-slate-800 dark:text-white/40 dark:hover:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 scale-95"
                                            }}
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
                                                ascendant={chart.ascendantLongitude}
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
                                                ascendant={chart.ascendantLongitude}
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
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-white`}>
                                                                    {p.name[0]}
                                                                </div>
                                                                {translatePlanet(p.name, locale)}
                                                            </td>
                                                            <td className="px-6 py-4 font-medium text-white/80">{translateSign(p.sign, locale)}</td>
                                                            <td className="px-6 py-4 font-mono text-xs text-white/40">
                                                                {Math.floor(p.longitude % 30)}° {Math.floor((p.longitude % 1) * 60)}'
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-white/60">{getTrans(locale).nakshatras[p.nakshatraId - 1]}</td>
                                                            <td className="px-6 py-4 font-bold text-orange-500">{p.house}</td>
                                                            <td className="px-6 py-4">
                                                                {p.isExalted && <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-[10px] font-black uppercase">Exalted</span>}
                                                                {p.isDebilitated && <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-[10px] font-black uppercase">Debilitated</span>}
                                                                {!p.isExalted && !p.isDebilitated && <span className="text-white/40 text-[10px] uppercase font-bold">Neutral</span>}
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
                                        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 text-white overflow-hidden relative shadow-2xl">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                                            <div className="relative z-10">
                                                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                                                    <Activity className="w-5 h-5 text-indigo-400" /> {l('current_vimshottari_dasha', 'Current Vimshottari Dasha')}
                                                </h3>
                                                <div className="flex flex-col md:flex-row gap-8 items-center">
                                                    <div className="text-center">
                                                        <div className="text-6xl font-black mb-2 text-white">{translatePlanet(chart.dasha?.currentLords?.[0] || "Sun", locale)}</div>
                                                        <div className="text-xs font-bold uppercase tracking-widest text-white/40">Mahadasha Lord</div>
                                                    </div>
                                                    <div className="h-12 w-px bg-white/10 hidden md:block" />
                                                    <div className="text-center">
                                                        <div className="text-4xl font-bold mb-2 text-indigo-300">{translatePlanet(chart.dasha?.currentLords?.[1] || "Moon", locale)}</div>
                                                        <div className="text-xs font-bold uppercase tracking-widest text-white/40">Antardasha Lord</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10">
                                            <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                                                <Clock3 className="w-6 h-6 text-orange-500" />
                                                {l('mahadasha_timeline', 'Mahadasha Analysis (Timeline)')}
                                            </h3>

                                            <div className="relative border-l-2 border-white/10 ml-4 space-y-8 pb-4">
                                                {chart.dasha?.periods?.filter((p: any) => new Date(p.end).getFullYear() >= new Date().getFullYear() - 1).map((p: any, i: number) => (
                                                    <div key={i} className="pl-8 relative group">
                                                        <span className="absolute -left-[9px] top-6 w-4 h-4 rounded-full border-4 border-[#050510] bg-white/20 group-hover:bg-orange-500 transition-colors" />
                                                        <div className="bg-white/5 hover:bg-white/10 p-6 rounded-2xl border border-white/5 group-hover:border-orange-500/30 transition-all">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="text-lg font-black text-white">
                                                                    {translatePlanet(p.lord, locale)} {l('mahadasha', 'Mahadasha')}
                                                                </h4>
                                                                <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full border border-white/10 text-white/60">
                                                                    {new Date(p.start).getFullYear()} - {new Date(p.end).getFullYear()}
                                                                </span>
                                                            </div>
                                                            <p className="text-white/60 text-sm leading-relaxed">
                                                                {locale === 'hi'
                                                                    ? `${translatePlanet(p.lord, locale)} का प्रभाव ${Math.round(p.duration)} वर्षों तक रहेगा।`
                                                                    : `Period of ${p.lord} lasts for ${Math.round(p.duration)} years.`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 5. ASHTAKVARGA TAB */}
                                {activeTab === 'ashtakvarga' && (
                                    <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/10 animate-in fade-in slide-in-from-right-4">
                                        <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                                            <Activity className="w-6 h-6 text-yellow-500" /> Sarvashtakvarga Points
                                        </h3>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                            {(_SIGNS).map((sign, idx) => {
                                                const points = (chart.ashtakvarga?.sarva?.[idx]) || 28;
                                                return (
                                                    <div key={idx} className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center group hover:bg-white/10 transition-colors">
                                                        <div className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">{translateSign(sign, locale)}</div>
                                                        <div className={`text-2xl font-black ${points >= 28 ? "text-green-500" : "text-orange-500"}`}>{points}</div>
                                                        <div className="w-full h-1 bg-white/10 mt-2 rounded-full overflow-hidden">
                                                            <div className={`h-full ${points >= 28 ? "bg-green-500" : "bg-orange-500"}`} style={{ width: `${(points / 56) * 100}%` }} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* 6. DOSHAS TAB */}
                                {activeTab === 'doshas' && (
                                    <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-right-4">
                                        {Object.entries(chart.doshas).map(([key, data]: [string, any]) => (
                                            <div key={key} className={`rounded-[2rem] p-8 border backdrop-blur-xl ${data.present ? "bg-red-500/10 border-red-500/20" : "bg-green-500/10 border-green-500/20"}`}>
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${data.present ? "bg-red-500/20 text-red-500" : "bg-green-500/20 text-green-500"}`}>
                                                            {data.present ? "⚠️" : "✓"}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-black text-white">{key}</h3>
                                                            <div className={`text-xs font-bold uppercase tracking-wider ${data.present ? "text-red-500" : "text-green-500"}`}>
                                                                {data.present ? l('dosha_present', "Present") : l('dosha_absent', "Absent")}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-white/60 leading-relaxed">{data.description || "No major negative influence detected."}</p>
                                            </div>
                                        ))}
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
                                    <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-right-4">
                                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-[2.5rem] border border-orange-100">
                                            <h3 className="text-2xl font-black text-amber-900 mb-6 flex items-center gap-3">
                                                <Star className="w-6 h-6" /> {l('lucky_gemstones', "Lucky Gemstones")}
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                                {(() => {
                                                    const transGemstones = getTrans(locale).gemstones;
                                                    return [
                                                        { label: "Life Stone", stone: transGemstones["Sun"], planet: "Sun" },
                                                        { label: "Lucky Stone", stone: transGemstones["Jupiter"], planet: "Jupiter" },
                                                        { label: "Benefic Stone", stone: transGemstones["Moon"], planet: "Moon" }
                                                    ].map((item, i) => (
                                                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100/50">
                                                            <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2 flex items-center justify-between">
                                                                {l(item.label.toLowerCase().replace(' ', '_'), item.label)}
                                                                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px]">{item.planet}</span>
                                                            </div>
                                                            <div className="text-lg font-black text-slate-900">{item.stone || "Consult Astrologer"}</div>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
��ए धारण करें" : locale === 'mr' ? "समृद्धीसाठी परिधान करा" : "Worn for prosperity"}</div>
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                            <p className="text-xs text-amber-800/60 mt-6 text-center italic">* Note: Gemstones should only be worn after consultation with an expert astrologer.</p>
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
                <div 
                    ref={pdfContentRef}
                    className="fixed -left-[9999px] top-0 bg-white p-10 text-slate-900 w-[800px] leading-relaxed"
                    style={{ fontFeatureSettings: '"kern" 1', WebkitFontSmoothing: 'antialiased' }}
                >
                    {/* Page: Predictions */}
                    <div id="pdf-predictions" className="space-y-8 p-10 mb-20 bg-white min-h-[1100px]">
                        <h1 className="text-3xl font-black text-orange-600 border-b-4 border-orange-500 pb-2 mb-8">
                            {locale === 'hi' ? "जीवन भविष्यवाणियां" : locale === 'mr' ? "जीवन भविष्यवाणी" : locale === 'bn' ? "জীবনবাণী" : "Life Predictions"}
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
                            {locale === 'hi' ? "जन्म विवरण और पंचांग" : locale === 'bn' ? "জন্ম বিবরণ" : "Birth Details & Panchang"}
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
                        <h1 className="text-3xl font-black text-purple-600 border-b-4 border-purple-500 pb-2 mb-8">
                            {locale === 'hi' ? "ग्रह स्थिति" : locale === 'bn' ? "গ্রহের অবস্থান" : "Planetary Positions"}
                        </h1>
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-purple-600 text-white">
                                    <th className="p-4 text-left border border-purple-500">Planet</th>
                                    <th className="p-4 text-left border border-purple-500">Sign</th>
                                    <th className="p-4 text-left border border-purple-500">Degree</th>
                                    <th className="p-4 text-left border border-purple-500">House</th>
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
                            {locale === 'hi' ? "दोष विश्लेषण" : "Dosha Analysis"}
                        </h1>
                        <div className="grid grid-cols-1 gap-12">
                            {Object.entries(chart.doshas).map(([key, data]: [string, any]) => (
                                <div key={key} className={`p-8 rounded-3xl border-2 ${data.present ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`text-2xl ${data.present ? "text-red-600" : "text-green-600"}`}>
                                            {data.present ? "⚠️" : "✓"}
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900">{key}</h2>
                                        <span className={`ml-auto px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${data.present ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"}`}>
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
                            {locale === 'hi' ? "उपचार और रत्न" : "Remedies & Gemstones"}
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
                                        <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center shrink-0">•</span>
                                        Recite the Beej Mantra of your Mahadasha Lord ({chart.dasha?.currentLords?.[0]}) for mental peace.
                                    </li>
                                    <li className="flex gap-4 items-start text-lg text-indigo-900">
                                        <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center shrink-0">•</span>
                                        Perform charity on Saturdays to appease Saturn's influence in your chart.
                                    </li>
                                    <li className="flex gap-4 items-start text-lg text-indigo-900">
                                        <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center shrink-0">•</span>
                                        Maintain a vegetarian diet on Tuesdays to strengthen Mars.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
                        {/* 20-Page Detailed PDF Hidden Captures */}
                <div className="hidden">
                    {/* Avakahada / Birth Details */}
                    <div id="pdf-birth-details" className="p-10 bg-white min-h-[800px] text-slate-900">
                        <h1 className="text-4xl font-black mb-8 border-b-4 border-orange-500 pb-2">Birth Attributes</h1>
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
                        <h1 className="text-4xl font-black mb-8 border-b-4 border-indigo-500 pb-2">Vimshottari Dasha Timeline</h1>
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
                        <h1 className="text-4xl font-black mb-8 border-b-4 border-yellow-500 pb-2">Sarvashtakvarga Points</h1>
                        <div className="grid grid-cols-4 gap-4">
                            {_SIGNS.map((sign, i) => (
                                <div key={i} className="border p-4 text-center">
                                    <div className="font-bold">{translateSign(sign, locale)}</div>
                                    <div className="text-2xl font-black">{chart.ashtakvarga?.sarva?.[i] || 28}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Prediction Pages */}
                    <div id="pdf-pred-career" className="p-10 bg-white min-h-[500px] text-slate-900">
                        <h1 className="text-3xl font-black mb-6 text-orange-600">Career & Profession Analysis</h1>
                        <p className="text-xl leading-relaxed">{chart.predictions?.Career}</p>
                    </div>
                    <div id="pdf-pred-health" className="p-10 bg-white min-h-[500px] text-slate-900">
                        <h1 className="text-3xl font-black mb-6 text-red-600">Health & Wellbeing Analysis</h1>
                        <p className="text-xl leading-relaxed">{chart.predictions?.Health}</p>
                    </div>
                    <div id="pdf-pred-marriage" className="p-10 bg-white min-h-[500px] text-slate-900">
                        <h1 className="text-3xl font-black mb-6 text-pink-600">Marriage & Relationships</h1>
                        <p className="text-xl leading-relaxed">{chart.predictions?.Marriage}</p>
                    </div>
                    <div id="pdf-pred-wealth" className="p-10 bg-white min-h-[500px] text-slate-900">
                        <h1 className="text-3xl font-black mb-6 text-green-600">Wealth & Financial Prospects</h1>
                        <p className="text-xl leading-relaxed">{chart.predictions?.Wealth}</p>
                    </div>
                    <div id="pdf-pred-edu" className="p-10 bg-white min-h-[500px] text-slate-900">
                        <h1 className="text-3xl font-black mb-6 text-blue-600">Education & Knowledge</h1>
                        <p className="text-xl leading-relaxed">{chart.predictions?.Education}</p>
                    </div>
                </div>
        </main>
    );
}






