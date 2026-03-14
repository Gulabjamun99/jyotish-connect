"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
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

            const trans = getTrans(locale);

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

        const doc = new jsPDF();
        const trans = getTrans(locale);
        const p = chart.panchang;
        const kd = kundliData;

        // Load logo image
        let logoBase64: string | null = null;
        try {
            const logoRes = await fetch('/logo.png');
            const logoBlob = await logoRes.blob();
            logoBase64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(logoBlob);
            });
        } catch (e) {
            console.warn('Could not load logo for PDF:', e);
        }

        // Helper for decorative header
        const addSectionHeader = (text: string, y: number) => {
            doc.setFillColor(255, 240, 230); // Light orange bg
            doc.rect(14, y, 182, 10, "F");
            doc.setFontSize(14);
            doc.setTextColor(234, 88, 12); // Orange-600
            doc.setFont("helvetica", "bold");
            doc.text(text, 20, y + 7);
            doc.setDrawColor(234, 88, 12);
            doc.line(14, y + 10, 196, y + 10);
            return y + 20;
        };

        const addPageBorder = () => {
            doc.setDrawColor(234, 88, 12);
            doc.setLineWidth(0.5);
            doc.rect(5, 5, 200, 287);
            doc.rect(6, 6, 198, 285);
        };

        // --- PAGE 1: COVER & BIO ---
        addPageBorder();

        // Logo/Brand — Embed actual logo image
        if (logoBase64) {
            try {
                doc.addImage(logoBase64, 'PNG', 75, 20, 60, 16);
            } catch (e) {
                // Fallback if image fails
                doc.setFillColor(14, 165, 233);
                doc.roundedRect(85, 25, 40, 12, 3, 3, "F");
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text("J", 99, 33);
            }
        } else {
            // Text fallback
            doc.setFillColor(14, 165, 233);
            doc.roundedRect(85, 25, 40, 12, 3, 3, "F");
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("J", 99, 33);
        }

        // Brand name below logo
        doc.setTextColor(14, 165, 233);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("JyotishConnect", 105, 46, { align: "center" });

        // Decorative line
        doc.setDrawColor(234, 88, 12);
        doc.setLineWidth(0.8);
        doc.line(60, 52, 150, 52);

        doc.setTextColor(234, 88, 12);
        doc.setFontSize(36);
        doc.setFont("helvetica", "bold");
        doc.text("Janma Kundli", 105, 72, { align: "center" });
        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text("Premium Vedic Astrology Report", 105, 82, { align: "center" });

        // User Details Box
        doc.setDrawColor(200);
        doc.roundedRect(40, 100, 130, 60, 3, 3);
        doc.setFontSize(20);
        doc.setTextColor(0);
        doc.text(formData.name, 105, 115, { align: "center" });

        doc.setFontSize(12);
        doc.setTextColor(80);
        const details = [
            `${locale === 'hi' ? 'Date' : 'DOB'}: ${formData.dob}`,
            `${locale === 'hi' ? 'Time' : 'TOB'}: ${formData.tob}`,
            `${locale === 'hi' ? 'Place' : 'Place'}: ${formData.birthplace}`
        ];
        details.forEach((line, i) => doc.text(line, 105, 130 + (i * 8), { align: "center" }));

        doc.text("Generated by JyotishConnect", 105, 280, { align: "center" });

        // --- PAGE 2: PANCHANG & AVAKHADA ---
        doc.addPage();
        addPageBorder();
        let y = 20;
        y = addSectionHeader(locale === 'hi' ? "पंचांग और जन्म विवरण" : "Panchang & Birth Details", y);

        autoTable(doc, {
            startY: y,
            head: [[locale === 'hi' ? 'विशेषता' : 'Attribute', locale === 'hi' ? 'विवरण' : 'Value']],
            body: [
                [locale === 'hi' ? 'तिथि' : 'Tithi', `${trans.panchang.tithi[p.tithiId]} (${p.paksha})`],
                [locale === 'hi' ? 'योग' : 'Yoga', trans.panchang.yoga[p.yogaId]],
                [locale === 'hi' ? 'करण' : 'Karana', trans.panchang.karan[p.karanaId]],
                [locale === 'hi' ? 'नक्षत्र' : 'Nakshatra', chart.nakshatra],
                [locale === 'hi' ? 'सूर्य राशि' : 'Sun Sign', translateSign(chart.sunSign, locale)],
                [locale === 'hi' ? 'चंद्र राशि' : 'Moon Sign', translateSign(chart.moonSign, locale)],
                [locale === 'hi' ? 'अयन' : 'Ayan', 'Uttarayana (Approx)'], // Placeholder
                [locale === 'hi' ? 'सूर्योदय' : 'Sunrise', p.sunrise]
            ],
            theme: 'grid',
            headStyles: { fillColor: [234, 88, 12], textColor: 255 },
            styles: { fontSize: 11, cellPadding: 4 }
        });

        // --- PAGE 3: PLANETARY POSITIONS ---
        doc.addPage();
        addPageBorder();
        y = 20;
        y = addSectionHeader(locale === 'hi' ? "ग्रह स्पष्ट (Planetary Positions)" : "Planetary Positions", y);

        autoTable(doc, {
            startY: y,
            head: [[
                locale === 'hi' ? 'ग्रह' : 'Planet',
                locale === 'hi' ? 'राशि' : 'Sign',
                locale === 'hi' ? 'अंश' : 'Degree',
                locale === 'hi' ? 'नक्षत्र' : 'Nakshatra',
                locale === 'hi' ? 'भाव' : 'House'
            ]],
            body: chart.planets.map((pl: any) => [
                translatePlanet(pl.name, locale),
                translateSign(pl.sign, locale),
                `${Math.floor(pl.longitude % 30)}° ${Math.floor((pl.longitude % 1) * 60)}'`,
                trans.nakshatras[pl.nakshatraId - 1] || pl.nakshatra,
                pl.house
            ]),
            theme: 'striped',
            headStyles: { fillColor: [14, 165, 233] }
        });

        y = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Note: Positions are calculated using Chitrapaksha (Lahiri) Ayanamsa.", 14, y);

        // --- PAGE 4: DOSHA ANALYSIS ---
        doc.addPage();
        addPageBorder();
        y = 20;
        y = addSectionHeader(locale === 'hi' ? "दोष विश्लेषण" : "Dosha Analysis", y);

        const doshaData = [
            { name: "Manglik", data: chart.doshas.Manglik },
            { name: "Kaal Sarp", data: chart.doshas.KaalSarp },
            { name: "Pitra", data: chart.doshas.Pitra },
            { name: "Sade Sati", data: chart.doshas.SadeSati }
        ];

        doshaData.forEach((d) => {
            doc.setFontSize(12);
            doc.setTextColor(d.data.present ? 220 : 0, d.data.present ? 20 : 100, 60); // Red if present
            doc.setFont("helvetica", "bold");
            doc.text(`${d.name}: ${d.data.present ? (locale === 'hi' ? "उपस्थित" : "DETECTED") : (locale === 'hi' ? "अनुपस्थित" : "ABSENT")}`, 20, y);
            y += 7;
            doc.setFontSize(10);
            doc.setTextColor(60);
            doc.setFont("helvetica", "normal");
            const descLines = doc.splitTextToSize(d.data.description || "No major affliction detected.", 170);
            doc.text(descLines, 20, y);
            y += (descLines.length * 5) + 5;

            // Remedy if present
            const doshasAny = chart.doshas as any;
            const doshaDetails = doshasAny[d.name];
            if (d.data.present && doshaDetails?.remedies) {
                doc.setTextColor(14, 165, 233);
                doc.text("Remedy:", 20, y);
                doc.setTextColor(80);
                const rems = doshaDetails.remedies;
                rems.forEach((r: string) => {
                    y += 5;
                    doc.text(`• ${r}`, 25, y);
                });
                y += 10;
            }
            y += 5;
        });

        // --- PAGE 5: PREDICTIONS ---
        doc.addPage();
        addPageBorder();
        y = 20;
        y = addSectionHeader(locale === 'hi' ? "जीवन भविष्यफल" : "Life Predictions", y);

        if (chart.predictions) {
            Object.entries(chart.predictions).forEach(([area, text]) => {
                const label = (kundliData.labels?.life_predictions as any)?.[area] || area;

                // Check if we need a new page for the header + some text
                if (y > 260) {
                    doc.addPage();
                    addPageBorder();
                    y = 20;
                }

                doc.setFontSize(12);
                doc.setTextColor(234, 88, 12);
                doc.setFont("helvetica", "bold");
                doc.text(label, 20, y);
                y += 8;

                doc.setFontSize(10);
                doc.setTextColor(60);
                doc.setFont("helvetica", "normal");

                const lines = doc.splitTextToSize(text as string, 170);

                // Draw lines one by one and handle page breaks
                lines.forEach((line: string) => {
                    if (y > 280) {
                        doc.addPage();
                        addPageBorder();
                        y = 20;
                    }
                    doc.text(line, 20, y);
                    y += 6;
                });

                y += 10; // Extra gap between sections
            });
        }

        y = addSectionHeader(locale === 'hi' ? "भाग्यशाली रत्न" : "Lucky Gemstones", y);
        const stones = [
            [`Sun (${locale === 'hi' ? 'सूर्य' : 'Sun'})`, (kd as any).gemstones?.Sun || "Ruby"],
            [`Moon (${locale === 'hi' ? 'चंद्र' : 'Moon'})`, (kd as any).gemstones?.Moon || "Pearl"],
            [`Lagnesh (${translateSign(chart.ascendantSign, locale)})`, "Consult Astrologer"] // Dynamic logic needed for Lagnesh stone
        ];

        autoTable(doc, {
            startY: y,
            head: [['Planet', 'Gemstone']],
            body: stones,
            theme: 'grid'
        });

        doc.save(`${formData.name}_Premium_Kundli.pdf`);
    };

    return (
        <main className="min-h-screen bg-slate-50 overflow-x-hidden selection:bg-orange-500/30">
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
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                                    <User className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Birth Details</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Name</label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-orange-500"
                                        placeholder="Full Name"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</label>
                                        <Input
                                            type="date"
                                            value={formData.dob}
                                            onChange={e => setFormData({ ...formData, dob: e.target.value })}
                                            className="h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-orange-500"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time</label>
                                        <Input
                                            type="time"
                                            value={formData.tob}
                                            onChange={e => setFormData({ ...formData, tob: e.target.value })}
                                            className="h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-orange-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</label>
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
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-red-500 to-purple-600" />
                                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="text-center md:text-left">
                                        <div className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-1">Birth Chart Report</div>
                                        <h2 className="text-4xl font-black text-slate-900 dark:text-white capitalize">{formData.name}</h2>
                                        <p className="text-slate-500 mt-2 flex items-center gap-2 justify-center md:justify-start">
                                            <Calendar className="w-4 h-4" /> {new Date(chart.dateStr).toDateString()}
                                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                            <MapPin className="w-4 h-4" /> {formData.birthplace || "Unknown Location"}
                                        </p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="bg-orange-50 dark:bg-slate-800 p-4 rounded-2xl text-center min-w-[100px]">
                                            <div className="text-xs text-slate-500 uppercase font-bold">Lagna</div>
                                            <div className="text-xl font-black text-orange-600">{translateSign(chart.ascendantSign, locale)}</div>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-slate-800 p-4 rounded-2xl text-center min-w-[100px]">
                                            <div className="text-xs text-slate-500 uppercase font-bold">Rasi</div>
                                            <div className="text-xl font-black text-blue-600">{translateSign(chart.moonSign, locale)}</div>
                                        </div>
                                        <div className="bg-purple-50 dark:bg-slate-800 p-4 rounded-2xl text-center min-w-[100px]">
                                            <div className="text-xs text-slate-500 uppercase font-bold">Nakshatra</div>
                                            <div className="text-xl font-black text-purple-600">{chart.nakshatra}</div>
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
                                            ? "bg-white text-orange-600 shadow-md scale-100"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-white/50 scale-95"
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
                                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
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
                                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
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
                                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                                            <div className="text-center mb-6">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full">Moon Chart</span>
                                                <h3 className="text-xl font-bold mt-2">Chandra Lagna</h3>
                                            </div>
                                            <LagnaChart
                                                chart={chart.charts?.Moon || {}}
                                                planets={chart.planets}
                                                ascendant={chart.moonLongitude}
                                                title="Chandra"
                                                subTitle="Moon Chart"
                                            />
                                        </div>
                                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                                            <div className="text-center mb-6">
                                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-black uppercase tracking-widest rounded-full">D10 Chart</span>
                                                <h3 className="text-xl font-bold mt-2">Dashamsha</h3>
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
                                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-right-4">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-slate-50 border-b border-slate-100">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Planet</th>
                                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Sign</th>
                                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Degree</th>
                                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Nakshatra</th>
                                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">House</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {chart.planets.map((p: any, i: number) => (
                                                        <tr key={p.name} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-600`}>
                                                                    {p.name[0]}
                                                                </div>
                                                                {translatePlanet(p.name, locale)}
                                                            </td>
                                                            <td className="px-6 py-4 font-medium text-slate-700">{translateSign(p.sign, locale)}</td>
                                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                                                {Math.floor(p.longitude % 30)}° {Math.floor((p.longitude % 1) * 60)}'
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-slate-600">{getTrans(locale).nakshatras[p.nakshatraId - 1]}</td>
                                                            <td className="px-6 py-4 font-bold text-slate-900">{p.house}</td>
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
                                            <div key={key} className={`rounded-[2rem] p-8 border ${data.present ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}`}>
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${data.present ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                                                            {data.present ? "⚠️" : "✓"}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-black text-slate-900">
                                                                {key}
                                                            </h3>
                                                            <div className={`text-xs font-bold uppercase tracking-wider ${data.present ? "text-red-600" : "text-green-600"}`}>
                                                                {data.present ? (locale === 'hi' ? "दोष उपस्थित" : "Present in Chart") : (locale === 'hi' ? "दोष मुक्त" : "Absent / Safe")}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 leading-relaxed mb-6">{data.description || "No major negative influence detected."}</p>

                                                {data.present && (
                                                    <div className="bg-white/60 rounded-xl p-5 border border-red-100/50">
                                                        <h4 className="text-xs font-black uppercase text-red-500 mb-3 tracking-widest flex items-center gap-2">
                                                            <Sparkles className="w-3 h-3" /> Vedic Remedies
                                                        </h4>
                                                        <ul className="space-y-2">
                                                            {(kundliData.doshas?.[key]?.remedies || []).map((r: string, idx: number) => (
                                                                <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                                                    <span className="text-red-400 mt-1">•</span> {r}
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
                                        <div className="bg-indigo-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl -mr-16 -mt-16" />
                                            <div className="relative z-10">
                                                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                                    <Activity className="w-5 h-5" /> Current Vimshottari Dasha
                                                </h3>
                                                <div className="flex flex-col md:flex-row gap-8 items-center">
                                                    <div className="text-center">
                                                        <div className="text-6xl font-black mb-2">{translatePlanet(chart.dasha?.currentLords?.[0] || "Sun", locale)}</div>
                                                        <div className="text-xs font-bold uppercase tracking-widest opacity-60">Mahadasha Lord</div>
                                                    </div>
                                                    <div className="h-12 w-px bg-white/10 hidden md:block" />
                                                    <div className="text-center">
                                                        <div className="text-4xl font-bold mb-2 text-indigo-200">{translatePlanet(chart.dasha?.currentLords?.[1] || "Moon", locale)}</div>
                                                        <div className="text-xs font-bold uppercase tracking-widest opacity-60">Antardasha Lord</div>
                                                    </div>
                                                    <div className="ml-auto bg-white/10 px-6 py-3 rounded-xl backdrop-blur-sm border border-white/10">
                                                        <div className="text-xs opacity-60 uppercase font-bold tracking-widest mb-1">Nakshatra Balance</div>
                                                        <div className="text-2xl font-mono">{(chart.dasha?.percentLeft * 100).toFixed(1)}%</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Detailed Timeline */}
                                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                                            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                                <Clock3 className="w-6 h-6 text-orange-500" />
                                                {locale === 'hi' ? "महादशा समयरेखा (आने वाले वर्ष)" : "Mahadasha Analysis (Timeline)"}
                                            </h3>

                                            <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
                                                {chart.dasha?.periods?.filter((p: any) => new Date(p.end).getFullYear() >= new Date().getFullYear() - 1).map((p: any, i: number) => (
                                                    <div key={i} className="pl-8 relative group">
                                                        <span className="absolute -left-[9px] top-6 w-4 h-4 rounded-full border-4 border-white bg-slate-200 group-hover:bg-orange-500 transition-colors" />

                                                        <div className="bg-slate-50 hover:bg-orange-50/50 p-6 rounded-2xl border border-slate-200 group-hover:border-orange-200 transition-all">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="text-lg font-black text-slate-800">
                                                                    {translatePlanet(p.lord, locale)} {locale === 'hi' ? "महादशा" : "Mahadasha"}
                                                                </h4>
                                                                <span className="text-xs font-bold bg-white px-3 py-1 rounded-full border border-slate-100 text-slate-500">
                                                                    {new Date(p.start).getFullYear()} - {new Date(p.end).getFullYear()}
                                                                </span>
                                                            </div>
                                                            <p className="text-slate-600 text-sm leading-relaxed">
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
                                        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">

                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-slate-100 pb-6 relative z-10">
                                                <h3 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                                                    <Sparkles className="w-8 h-8 text-orange-500 fill-orange-500/20" />
                                                    {locale === 'hi' ? "विस्तृत जीवन विश्लेषण" : "Detailed Life Analysis"}
                                                </h3>
                                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 rounded-full text-white text-xs font-black uppercase tracking-widest shadow-md flex items-center gap-2">
                                                    <Zap className="w-3 h-3 fill-white" /> AI Powered Reading
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-12 relative z-10">
                                                {chart.predictions && Object.entries(chart.predictions).map(([area, text]: [string, any]) => (
                                                    <div key={area} className="group bg-slate-50 hover:bg-orange-50/30 p-8 rounded-3xl border border-slate-100 hover:border-orange-200 transition-all duration-500">
                                                        <div className="flex items-center gap-4 mb-6">
                                                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                                                <Briefcase className="w-6 h-6" />
                                                            </div>
                                                            <h4 className="text-2xl font-black text-slate-800 group-hover:text-orange-600 transition-colors">
                                                                {kundliData.labels?.life_predictions[area as keyof typeof kundliData.labels.life_predictions] || area}
                                                            </h4>
                                                        </div>
                                                        <div className="text-slate-600 leading-[1.8] text-lg font-medium whitespace-pre-line space-y-4">
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
                                                <Star className="w-6 h-6" /> Lucky Gemstones
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                                {[
                                                    { label: "Life Stone (Lagnesh)", stone: (kundliData as any).gemstones?.Sun || "Ruby", planet: "Based on Asc" },
                                                    { label: "Lucky Stone (9th Lord)", stone: (kundliData as any).gemstones?.Jupiter || "Yellow Sapphire", planet: "Based on 9th" },
                                                    { label: "Benefic Stone (5th Lord)", stone: (kundliData as any).gemstones?.Mars || "Red Coral", planet: "Based on 5th" }
                                                ].map((item, i) => (
                                                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100/50">
                                                        <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">{item.label}</div>
                                                        <div className="text-lg font-black text-slate-900">{item.stone || "Consult Astrologer"}</div>
                                                        <div className="text-xs text-slate-400 mt-2">Worn for prosperity</div>
                                                    </div>
                                                ))}
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
