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

            const newChart = {
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
                predictions: null
            };

            // Generate Dynamic Life Predictions
            const lifePredictions = generateLifePredictions({
                ...newChart,
                ascendant: newChart.ascendantSign,
                moonSign: newChart.moonSign,
                sunSign: newChart.sunSign
            }, locale);
            (newChart as any).predictions = lifePredictions;

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

        // === Helper: Capture SVG chart element to PNG base64 ===
        const captureChartImage = async (ref: React.RefObject<HTMLDivElement | null>): Promise<string | null> => {
            try {
                const svgEl = ref.current?.querySelector('svg');
                if (!svgEl) return null;
                
                // Clone SVG to modify without affecting UI
                const clonedSvg = svgEl.cloneNode(true) as SVGSVGElement;
                clonedSvg.setAttribute('width', '800');
                clonedSvg.setAttribute('height', '800');
                
                // Fix for text visibility in canvas
                const texts = clonedSvg.querySelectorAll('text');
                texts.forEach(t => {
                    t.setAttribute('style', 'font-family: Arial, sans-serif; font-weight: bold;');
                });

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
                        ctx.fillStyle = '#ffffff'; // Use white background for PDF
                        ctx.fillRect(0, 0, 800, 800);
                        ctx.drawImage(img, 0, 0, 800, 800);
                        URL.revokeObjectURL(svgUrl);
                        resolve(canvas.toDataURL('image/png'));
                    };
                    img.onerror = () => { URL.revokeObjectURL(svgUrl); reject(null); };
                    img.crossOrigin = 'anonymous';
                    img.src = svgUrl;
                });
            } catch (e) {
                console.warn('Chart capture failed:', e);
                return null;
            }
        };

        const doc = new jsPDF();
        const trans: any = getTrans(locale);
        
        // --- 1. PREPARE ASSETS (Capture all charts) ---
        const d1Base64 = await captureChartImage(lagnaChartRef);
        const d9Base64 = await captureChartImage(d9ChartRef);
        const moonBase64 = await captureChartImage(moonChartRef);
        const d10Base64 = await captureChartImage(d10ChartRef);

        const l = trans.labels || trans.common;

        // --- PAGE 1: COVER ---
        doc.setFillColor(10, 10, 26);
        doc.rect(0, 0, 210, 297, 'F');
        doc.setTextColor(249, 115, 22);
        doc.setFontSize(36);
        doc.setFont("helvetica", "bold");
        doc.text("Astro-Connect", 105, 80, { align: "center" });
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.text(locale === 'hi' ? "व्यक्तिगत कुंडली रिपोर्ट" : "Premium Kundli Report", 105, 95, { align: "center" });
        doc.setFontSize(16);
        doc.text(formData.name || "User", 105, 130, { align: "center" });
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generated on ${new Date().toLocaleDateString()} · Powered by Astro-Connect AI`, 105, 280, { align: "center" });

        // --- PAGE 2: CHARTS (D1 & D9) ---
        doc.addPage();
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.text(locale === 'hi' ? "कुण्डली चार्ट्स (Charts)" : "Kundli Charts", 20, 20);

        if (d1Base64) {
            doc.setFontSize(11);
            doc.text(locale === 'hi' ? "लग्न कुण्डली (D1)" : "Lagna Chart (D1)", 20, 35);
            doc.addImage(d1Base64, 'PNG', 20, 40, 80, 80);
        }
        if (d9Base64) {
            doc.setFontSize(11);
            doc.text(locale === 'hi' ? "नवांश कुण्डली (D9)" : "Navamsa Chart (D9)", 110, 35);
            doc.addImage(d9Base64, 'PNG', 110, 40, 80, 80);
        }
        if (moonBase64) {
            doc.setFontSize(11);
            doc.text(locale === 'hi' ? "चन्द्र कुण्डली" : "Moon Chart", 20, 135);
            doc.addImage(moonBase64, 'PNG', 20, 140, 80, 80);
        }
        if (d10Base64) {
            doc.setFontSize(11);
            doc.text(locale === 'hi' ? "दशमांश कुण्डली (D10)" : "Dashamsha Chart (D10)", 110, 135);
            doc.addImage(d10Base64, 'PNG', 110, 140, 80, 80);
        }

        // --- PAGE 3: BIRTH DETAILS & PANCHANG ---
        doc.addPage();
        doc.setFontSize(16);
        doc.text(locale === 'hi' ? "जन्म विवरण और पंचांग" : "Birth Details & Panchang", 20, 20);
        autoTable(doc, {
            startY: 30,
            head: [[locale === 'hi' ? 'विवरण' : 'Attribute', locale === 'hi' ? 'मान' : 'Value']],
            body: [
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
            ],
            theme: 'striped',
            headStyles: { fillColor: [249, 115, 22] }
        });

        // --- PAGE 4: PLANETARY POSITIONS ---
        doc.addPage();
        doc.text(locale === 'hi' ? "ग्रह स्थिति (Planets)" : "Planetary Positions", 20, 20);
        autoTable(doc, {
            startY: 30,
            head: [['Planet', 'Sign', 'Degree', 'House', 'Retro']],
            body: chart.planets.map((p: any) => [
                translatePlanet(p.name, locale),
                translateSign(p.sign, locale),
                `${Math.floor(p.longitude % 30)}° ${Math.round((p.longitude % 1) * 60)}'`,
                p.house,
                p.isRetrograde ? 'R' : ''
            ]),
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }
        });

        // --- PAGE 5: DOSHA ANALYSIS ---
        doc.addPage();
        doc.text(locale === 'hi' ? "दोष विश्लेषण" : "Dosha Analysis", 20, 20);
        const doshas = Object.entries(chart.doshas).map(([key, value]: [string, any]) => [
            key,
            value.present ? "YES" : "NO",
            value.description
        ]);
        autoTable(doc, {
            startY: 30,
            head: [['Dosha', 'Active', 'Description']],
            body: doshas,
            theme: 'striped',
            headStyles: { fillColor: [239, 68, 68] },
            columnStyles: { 2: { cellWidth: 110 } }
        });

        // --- PAGE 6: LIFE PREDICTIONS ---
        doc.addPage();
        doc.text(locale === 'hi' ? "जीवन भविष्यवाणियां" : "Life Predictions", 20, 20);
        const preds = Object.entries(chart.predictions || {}).map(([key, value]) => [
            (trans.labels?.life_predictions as any)?.[key] || key,
            value
        ]);
        autoTable(doc, {
            startY: 30,
            head: [['Area', 'Analysis']],
            body: preds,
            theme: 'plain',
            headStyles: { fillColor: [139, 92, 246] },
            columnStyles: { 1: { cellWidth: 140 } }
        });

        doc.save(`Kundli_Report_${formData.name}.pdf`);
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
                                        onChange={(location, lat, lng) => {
                                            setFormData({
                                                ...formData,
                                                birthplace: location,
                                                latitude: lat ?? 28.6139,
                                                longitude: lng ?? 77.2090
                                            });
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
                                    { id: 'charts', label: 'Charts', icon: LayoutGrid },
                                    { id: 'planets', label: 'Planets', icon: Zap },
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
                                            }`}
                                    >
                                        <tab.icon className="w-4 h-4" /> {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="min-h-[500px]">

                                {/* 1. CHARTS TAB */}
                                {activeTab === 'charts' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-300">
                                        <div ref={lagnaChartRef} className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-white/10">
                                            <div className="text-center mb-6">
                                                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest rounded-full">D1 Chart</span>
                                                <h3 className="text-xl font-bold mt-2">Lagna / Birth Chart</h3>
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
                                                <h3 className="text-xl font-bold mt-2">Navamsa Chart</h3>
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
                                                <h3 className="text-xl font-bold mt-2 text-white">Chandra Lagna</h3>
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
                                                <h3 className="text-xl font-bold mt-2 text-white">Dashamsha</h3>
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

                                {/* 2. PLANETS TAB */}
                                {activeTab === 'planets' && (
                                    <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden animate-in fade-in slide-in-from-right-4">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-white/5 border-b border-white/10">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-xs font-black text-white/40 uppercase tracking-wider">Planet</th>
                                                        <th className="px-6 py-4 text-left text-xs font-black text-white/40 uppercase tracking-wider">Sign</th>
                                                        <th className="px-6 py-4 text-left text-xs font-black text-white/40 uppercase tracking-wider">Degree</th>
                                                        <th className="px-6 py-4 text-left text-xs font-black text-white/40 uppercase tracking-wider">Nakshatra</th>
                                                        <th className="px-6 py-4 text-left text-xs font-black text-white/40 uppercase tracking-wider">House</th>
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
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

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
                                                            <h3 className="text-xl font-black text-white">
                                                                {key}
                                                            </h3>
                                                            <div className={`text-xs font-bold uppercase tracking-wider ${data.present ? "text-red-500" : "text-green-500"}`}>
                                                                {data.present ? (locale === 'hi' ? "दोष उपस्थित" : "Present in Chart") : (locale === 'hi' ? "दोष मुक्त" : "Absent / Safe")}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-white/60 leading-relaxed mb-6">{data.description || "No major negative influence detected."}</p>

                                                {data.present && (
                                                    <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                                                        <h4 className="text-xs font-black uppercase text-orange-500 mb-3 tracking-widest flex items-center gap-2">
                                                            <Sparkles className="w-3 h-3" /> Vedic Remedies
                                                        </h4>
                                                        <ul className="space-y-2">
                                                            {(kundliData.doshas?.[key]?.remedies || []).map((r: string, idx: number) => (
                                                                <li key={idx} className="text-sm text-white/70 flex items-start gap-2">
                                                                    <span className="text-orange-400 mt-1">•</span> {r}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* 4. PREDICTIONS TAB */}
                                {activeTab === 'predictions' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">

                                        {/* Current Dasha Card */}
                                        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 text-white overflow-hidden relative shadow-2xl">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                                            <div className="relative z-10">
                                                <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                                                    <Activity className="w-5 h-5 text-indigo-400" /> Current Vimshottari Dasha
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
                                                    <div className="ml-auto bg-white/5 px-6 py-3 rounded-xl backdrop-blur-sm border border-white/10">
                                                        <div className="text-xs text-white/40 uppercase font-bold tracking-widest mb-1">Nakshatra Balance</div>
                                                        <div className="text-2xl font-mono text-white">{(chart.dasha?.percentLeft * 100).toFixed(1)}%</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Detailed Timeline */}
                                        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10">
                                            <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                                                <Clock3 className="w-6 h-6 text-orange-500" />
                                                {locale === 'hi' ? "महादशा समयरेखा (आने वाले वर्ष)" : "Mahadasha Analysis (Timeline)"}
                                            </h3>

                                            <div className="relative border-l-2 border-white/10 ml-4 space-y-8 pb-4">
                                                {chart.dasha?.periods?.filter((p: any) => new Date(p.end).getFullYear() >= new Date().getFullYear() - 1).map((p: any, i: number) => (
                                                    <div key={i} className="pl-8 relative group">
                                                        <span className="absolute -left-[9px] top-6 w-4 h-4 rounded-full border-4 border-[#050510] bg-white/20 group-hover:bg-orange-500 transition-colors" />

                                                        <div className="bg-white/5 hover:bg-white/10 p-6 rounded-2xl border border-white/5 group-hover:border-orange-500/30 transition-all">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="text-lg font-black text-white">
                                                                    {translatePlanet(p.lord, locale)} {locale === 'hi' ? "महादशा" : "Mahadasha"}
                                                                </h4>
                                                                <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full border border-white/10 text-white/60">
                                                                    {new Date(p.start).getFullYear()} - {new Date(p.end).getFullYear()}
                                                                </span>
                                                            </div>
                                                            <p className="text-white/60 text-sm leading-relaxed">
                                                                {locale === 'hi'
                                                                    ? `${translatePlanet(p.lord, locale)} का प्रभाव ${Math.round(p.duration)} वर्षों तक रहेगा। यह समय ${kundliData.labels?.life_predictions?.Career || "करियर"} और ${kundliData.labels?.life_predictions?.Health || "स्वास्थ्य"} के लिए महत्वपूर्ण होगा।`
                                                                    : `Period of ${p.lord} lasts for ${Math.round(p.duration)} years. This cycle significantly impacts Career growth and domestic happiness.`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Life Analysis - AI Powered */}
                                        <div className="bg-white/5 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden">

                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-white/10 pb-6 relative z-10">
                                                <h3 className="text-3xl font-black text-white flex items-center gap-3">
                                                    <Sparkles className="w-8 h-8 text-orange-500 fill-orange-500/20" />
                                                    {locale === 'hi' ? "विस्तृत जीवन विश्लेषण" : "Detailed Life Analysis"}
                                                </h3>
                                                <div className="bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2 rounded-full text-white text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2">
                                                    <Zap className="w-3 h-3 fill-white" /> AI Powered Reading
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-12 relative z-10">
                                                {chart.predictions && Object.entries(chart.predictions).map(([area, text]: [string, any]) => (
                                                    <div key={area} className="group bg-white/5 hover:bg-orange-500/5 p-8 rounded-3xl border border-white/5 hover:border-orange-500/30 transition-all duration-500">
                                                        <div className="flex items-center gap-4 mb-6">
                                                            <div className="w-12 h-12 rounded-2xl bg-white/5 shadow-sm border border-white/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                                                <Briefcase className="w-6 h-6" />
                                                            </div>
                                                            <h4 className="text-2xl font-black text-white group-hover:text-orange-500 transition-colors">
                                                                {kundliData.labels?.life_predictions[area as keyof typeof kundliData.labels.life_predictions] || area}
                                                            </h4>
                                                        </div>
                                                        <div className="text-white/70 leading-[1.8] text-lg font-medium whitespace-pre-line space-y-4">
                                                            {text}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 5. REMEDIES TAB */}
                                {activeTab === 'remedies' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4">
                                        <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-[2.5rem] border border-orange-100">
                                            <h3 className="text-2xl font-black text-amber-900 mb-6 flex items-center gap-3">
                                                <Star className="w-6 h-6" /> {locale === 'hi' ? "शुभ रत्न" : locale === 'mr' ? "शुभ रत्ने" : "Lucky Gemstones"}
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                                {(() => {
                                                    const getPlanetaryLord = (signNum: number) => {
                                                        switch (signNum) {
                                                            case 1: case 8: return "Mars";
                                                            case 2: case 7: return "Venus";
                                                            case 3: case 6: return "Mercury";
                                                            case 4: return "Moon";
                                                            case 5: return "Sun";
                                                            case 9: case 12: return "Jupiter";
                                                            case 10: case 11: return "Saturn";
                                                            default: return "Sun";
                                                        }
                                                    };
                                                    const ascSignNum = chart.ascendantLongitude ? Math.floor(chart.ascendantLongitude / 30) + 1 : 1;
                                                    const lagnesh = getPlanetaryLord(ascSignNum);
                                                    const fifthLord = getPlanetaryLord(((ascSignNum - 1 + 4) % 12) + 1);
                                                    const ninthLord = getPlanetaryLord(((ascSignNum - 1 + 8) % 12) + 1);

                                                    const transGemstones = getTrans(locale).gemstones;
                                                    
                                                    const labels_en = ["Life Stone (Lagnesh)", "Lucky Stone (9th Lord)", "Benefic Stone (5th Lord)"];
                                                    const labels_hi = ["जीवन रत्न (लग्नेश)", "भाग्य रत्न (नवमेश)", "कल्याणकारी रत्न (पंचमेश)"];
                                                    const labels_mr = ["जीवन रत्न (लग्नेश)", "भाग्य रत्न (नवमेश)", "कल्याणकारी रत्न (पंचमेश)"];
                                                    const labels = locale === 'hi' ? labels_hi : locale === 'mr' ? labels_mr : labels_en;

                                                    return [
                                                        { label: labels[0], stone: transGemstones[lagnesh as keyof typeof transGemstones], planet: translatePlanet(lagnesh, locale) },
                                                        { label: labels[1], stone: transGemstones[ninthLord as keyof typeof transGemstones], planet: translatePlanet(ninthLord, locale) },
                                                        { label: labels[2], stone: transGemstones[fifthLord as keyof typeof transGemstones], planet: translatePlanet(fifthLord, locale) }
                                                    ].map((item, i) => (
                                                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100/50">
                                                            <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2 flex items-center justify-between">
                                                                {item.label}
                                                                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px]">{item.planet}</span>
                                                            </div>
                                                            <div className="text-lg font-black text-slate-900">{item.stone || "Consult Astrologer"}</div>
                                                            <div className="text-xs text-slate-400 mt-2">{locale === 'hi' ? "समृद्धि के लिए धारण करें" : locale === 'mr' ? "समृद्धीसाठी परिधान करा" : "Worn for prosperity"}</div>
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
        </main>
    );
}
