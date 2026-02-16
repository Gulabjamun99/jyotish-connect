"use client";

import { useTranslations, useLocale } from "next-intl";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Heart, Sparkles, AlertCircle, CheckCircle, Calendar, Timer, Shield, Info, TrendingUp, Users, Wallet, Activity } from "lucide-react";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { LocationInput } from "@/components/kundli/LocationInput";
// import { calculatePlanets, calculateGunMilan, calculatePanchang } from "@/lib/astrology/calculator";
// ... imports
import { translateSign, translatePlanet, getTrans } from "@/lib/astrology/i18n";
import { generateDetailedMatchingReport } from "@/lib/astrology/prediction-engine";

// ... imports
type PersonDetails = {
    name: string;
    dob: string;
    tob: string;
    place: string;
    // For MVP simplified matching, we assume Delhi default for coords if not geocoded
    lat?: number;
    lng?: number;
};


export default function KundliMatchingPage() {
    const t = useTranslations("Index");
    const locale = useLocale();
    const [boy, setBoy] = useState<PersonDetails>({ name: "", dob: "", tob: "", place: "", lat: 28.6139, lng: 77.2090 });
    const [girl, setGirl] = useState<PersonDetails>({ name: "", dob: "", tob: "", place: "", lat: 28.6139, lng: 77.2090 });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [detailedReport, setDetailedReport] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("overview");

    const handleMatch = async () => {
        if (!boy.name || !boy.dob || !girl.name || !girl.dob) {
            toast.error("Please fill in all details for both Boy and Girl.");
            return;
        }

        setLoading(true);
        try {
            const boyDate = new Date(`${boy.dob}T${boy.tob || "12:00"}`);
            const girlDate = new Date(`${girl.dob}T${girl.tob || "12:00"}`);

            if (isNaN(boyDate.getTime()) || isNaN(girlDate.getTime())) {
                toast.error("Invalid Date or Time provided.");
                setLoading(false);
                return;
            }

            // Core Calculations via API
            const response = await fetch('/api/astrology/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: "match",
                    data: {
                        boyDetails: { date: boyDate, lat: boy.lat || 28.6139, lng: boy.lng || 77.2090 },
                        girlDetails: { date: girlDate, lat: girl.lat || 28.6139, lng: girl.lng || 77.2090 }
                    }
                })
            });

            if (!response.ok) throw new Error("API failure");
            const matchResult = await response.json();

            // Generate detailed report
            const report = generateDetailedMatchingReport(matchResult, locale);
            setDetailedReport(report);

            setResult({
                boy: boy.name,
                girl: girl.name,
                total_guna: matchResult.milan.totalScore,
                is_manglik_boy: matchResult.boy.doshas.Manglik.present,
                is_manglik_girl: matchResult.girl.doshas.Manglik.present,
                ashtakoot: matchResult.milan.ashtakoot,
                boyPanchang: matchResult.boy.panchang,
                girlPanchang: matchResult.girl.panchang,
                boyDasha: matchResult.boy.dasha,
                girlDasha: matchResult.girl.dasha
            });

            toast.success(t("calculationSuccess"));
            setTimeout(() => {
                document.getElementById("match-result")?.scrollIntoView({ behavior: 'smooth' });
            }, 100);

        } catch (error) {
            console.error(error);
            toast.error(t("calculationError"));
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!result) return;

        const doc = new jsPDF();
        const trans = getTrans(locale);

        // Add Logo
        try {
            const logoUrl = '/logo.png';
            const imgData = await new Promise<string>((resolve, reject) => {
                const img = new Image();
                img.src = logoUrl;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0);
                        resolve(canvas.toDataURL('image/png'));
                    } else {
                        reject('Canvas context failed');
                    }
                };
                img.onerror = reject;
            });
            doc.addImage(imgData, 'PNG', 170, 5, 25, 25);
        } catch (e) {
            console.error("Logo loading failed", e);
        }

        // Header
        doc.setFillColor(14, 165, 233);
        doc.rect(0, 0, 210, 40, "F");
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.text(locale === 'hi' ? "कुंडली मिलान रिपोर्ट" : "Kundli Matching Report", 14, 20);
        doc.setFontSize(10);
        doc.text("JyotishConnect - Sacred Union Analysis", 14, 28);

        // Couple Details
        doc.setTextColor(0);
        doc.setFontSize(14);
        doc.text(`${locale === 'hi' ? 'वर और वधु' : 'Boy & Girl'}: ${result.boy} & ${result.girl}`, 14, 55);

        doc.setFontSize(12);
        doc.setTextColor(14, 165, 233);
        doc.text(`${trans.common.Score}: ${result.total_guna} / 36`, 14, 65);

        // Partner Details Table
        autoTable(doc, {
            startY: 75,
            head: [[locale === 'hi' ? 'विवरण' : 'Attribute', locale === 'hi' ? 'वर (Boy)' : 'Boy', locale === 'hi' ? 'वधु (Girl)' : 'Girl']],
            body: [
                [locale === 'hi' ? 'तिथि' : 'Tithi', trans.panchang.tithi[result.boyPanchang.tithi - 1], trans.panchang.tithi[result.girlPanchang.tithi - 1]],
                [locale === 'hi' ? 'योग' : 'Yoga', trans.panchang.yoga[result.boyPanchang.yoga - 1], trans.panchang.yoga[result.girlPanchang.yoga - 1]],
                [locale === 'hi' ? 'करण' : 'Karan', trans.panchang.karan[result.boyPanchang.karana - 1], trans.panchang.karan[result.girlPanchang.karana - 1]],
                [locale === 'hi' ? 'वार' : 'Vara', trans.panchang.vara[result.boyPanchang.vara], trans.panchang.vara[result.girlPanchang.vara]]
            ],
            theme: 'grid',
            headStyles: { fillColor: [14, 165, 233] }
        });

        // Ashtakoot Table
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 15,
            head: [[
                locale === 'hi' ? 'अष्टकूट मिलान' : 'Ashtakoot Milan',
                locale === 'hi' ? 'अधिकतम' : 'Max',
                locale === 'hi' ? 'प्राप्त' : 'Obtained'
            ]],
            body: Object.entries(result.ashtakoot).map(([key, val]: any) => [
                (trans.kootas as any)[key] || key,
                val.total,
                val.score
            ]),
            headStyles: { fillColor: [14, 165, 233] },
            theme: 'grid'
        });

        let finalY = (doc as any).lastAutoTable.finalY + 15;

        // Add Detailed Report Sections to PDF
        if (detailedReport) {
            const addSection = (title: string, content: string) => {
                if (finalY > 250) {
                    doc.addPage();
                    finalY = 20;
                }
                doc.setFontSize(12);
                doc.setTextColor(14, 165, 233);
                doc.setFont("helvetica", "bold");
                doc.text(title, 14, finalY);
                finalY += 7;

                doc.setFontSize(10);
                doc.setTextColor(60);
                doc.setFont("helvetica", "normal");
                const splitText = doc.splitTextToSize(content, 180);
                doc.text(splitText, 14, finalY);
                finalY += (splitText.length * 5) + 10;
            };

            addSection(detailedReport.marriage.title, detailedReport.marriage.verdict);
            addSection(detailedReport.nature.title, detailedReport.nature.verdict);
            addSection(detailedReport.family.title, detailedReport.family.verdict);
            addSection(detailedReport.finance.title, detailedReport.finance.verdict);
            addSection(detailedReport.forecast.title, detailedReport.forecast.verdict);

            // Remedies
            if (finalY > 250) {
                doc.addPage();
                finalY = 20;
            }
            doc.setFontSize(12);
            doc.setTextColor(14, 165, 233);
            doc.setFont("helvetica", "bold");
            doc.text(detailedReport.remedies.title, 14, finalY);
            finalY += 7;
            doc.setFontSize(10);
            doc.setTextColor(60);
            doc.setFont("helvetica", "normal");
            detailedReport.remedies.list.forEach((rem: string) => {
                const splitText = doc.splitTextToSize(`• ${rem}`, 180);
                doc.text(splitText, 14, finalY);
                finalY += (splitText.length * 5) + 2;
            });
            finalY += 10;
        }

        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(t("conclusion"), 14, finalY);
        doc.setFontSize(10);
        doc.setTextColor(60);
        doc.text(getCompatibilityMessage(result.total_guna), 14, finalY + 8);

        doc.save(`Matching_${result.boy}_${result.girl}.pdf`);
    };

    const getCompatibilityMessage = (score: number) => {
        if (score > 24) return t("excellentMatch");
        if (score > 18) return t("averageMatch");
        return t("lowCompatibility");
    };

    const getMarriageStabilityMessage = (score: number) => {
        if (score > 24) return t("stabilityMessage.highlyFavorable");
        if (score > 18) return t("stabilityMessage.averageCompatibility");
        return t("stabilityMessage.notRecommended");
    };

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col selection:bg-orange-500/30">
            <Navbar />

            <div className="container mx-auto px-4 py-12 md:py-20 flex-grow">
                <header className="text-center space-y-4 mb-20 animate-slide-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-xs font-bold tracking-wider uppercase">
                        <Heart className="w-3.5 h-3.5 fill-orange-500" /> {t("sacredUnion")}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">{t("kundliMatchingTitle")}</span>
                    </h1>
                    <p className="text-slate-600 max-w-xl mx-auto">
                        {t("kundliMatchingDescription")}
                    </p>
                </header>

                <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto animate-slide-up">
                    {/* Boy's Details */}
                    <div className="bg-white backdrop-blur-xl p-8 md:p-10 rounded-3xl space-y-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{t("boyIdentityTitle")}</h2>
                                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">{t("seekerOfWisdom")}</p>
                            </div>
                        </div>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("fullNameLabel")}</Label>
                                <Input className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-orange-500" value={boy.name} onChange={e => setBoy({ ...boy, name: e.target.value })} placeholder={t("enterNamePlaceholder")} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("manifestationDateLabel")}</Label>
                                    <Input className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-orange-500" type="date" value={boy.dob} onChange={e => setBoy({ ...boy, dob: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("timeOfBreathLabel")}</Label>
                                    <Input className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-orange-500" type="time" value={boy.tob} onChange={e => setBoy({ ...boy, tob: e.target.value })} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("birthCoordinatesLabel")}</Label>
                                <LocationInput
                                    value={boy.place}
                                    onChange={(location, lat, lng) => {
                                        setBoy({
                                            ...boy,
                                            place: location,
                                            lat: lat ?? 28.6139,
                                            lng: lng ?? 77.2090
                                        });
                                    }}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Girl's Details */}
                    <div className="bg-white backdrop-blur-xl p-8 md:p-10 rounded-3xl space-y-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{t("girlIdentityTitle")}</h2>
                                <p className="text-xs font-bold text-red-600 uppercase tracking-wider">{t("seekerOfGrace")}</p>
                            </div>
                        </div>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("fullNameLabel")}</Label>
                                <Input className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-red-500" value={girl.name} onChange={e => setGirl({ ...girl, name: e.target.value })} placeholder={t("enterNamePlaceholder")} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("manifestationDateLabel")}</Label>
                                    <Input className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-red-500" type="date" value={girl.dob} onChange={e => setGirl({ ...girl, dob: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("timeOfBreathLabel")}</Label>
                                    <Input className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-red-500" type="time" value={girl.tob} onChange={e => setGirl({ ...girl, tob: e.target.value })} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("birthCoordinatesLabel")}</Label>
                                <LocationInput
                                    value={girl.place}
                                    onChange={(location, lat, lng) => {
                                        setGirl({
                                            ...girl,
                                            place: location,
                                            lat: lat ?? 28.6139,
                                            lng: lng ?? 77.2090
                                        });
                                    }}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-12 mb-20 animate-slide-up">
                    <Button
                        onClick={handleMatch}
                        disabled={loading}
                        className="h-14 px-10 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/20 transition-all"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            t("establishCelestialMatch")
                        )}
                    </Button>
                </div>

                {result && !loading && (
                    <section id="match-result" className="max-w-6xl mx-auto bg-white/90 backdrop-blur-3xl p-8 md:p-16 rounded-[4rem] border border-slate-100 shadow-2xl animate-slide-up relative">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <Sparkles className="w-64 h-64 text-orange-500" />
                        </div>
                        <div className="text-center mb-8 relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full border border-orange-100 mb-6 font-bold text-xs uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5" />
                                {t("analysisComplete")}
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight uppercase mb-4">{t("compatibilityReportTitle")}</h2>
                            <p className="text-slate-500 font-medium">{t("between")} <span className="text-orange-600 font-black uppercase tracking-widest">{result.boy}</span> & <span className="text-red-600 font-black uppercase tracking-widest">{result.girl}</span></p>
                        </div>

                        {/* Custom Tabs */}
                        <div className="bg-slate-100 p-1.5 rounded-2xl flex overflow-x-auto gap-2 mb-12 relative z-10">
                            {[
                                { id: 'overview', label: locale === 'hi' ? 'अवलोकन' : 'Overview', icon: Heart },
                                { id: 'panchang', label: locale === 'hi' ? 'पंचांग' : 'Panchang', icon: Calendar },
                                { id: 'ashtakoot', label: locale === 'hi' ? 'अष्टकूट' : 'Ashtakoot', icon: Activity },
                                { id: 'analysis', label: locale === 'hi' ? 'विश्लेषण' : 'Analysis', icon: TrendingUp },
                                { id: 'remedies', label: locale === 'hi' ? 'उपाय' : 'Remedies', icon: Sparkles },
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
                        <div className="min-h-[400px]">
                            {/* OVERVIEW TAB */}
                            {activeTab === 'overview' && (
                                <div className="grid md:grid-cols-4 gap-8 mb-16">
                                    {/* Score Card */}
                                    <div className="md:col-span-1 bg-orange-50/50 p-10 rounded-[3rem] border border-orange-100 text-center flex flex-col justify-center items-center shadow-inner">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-7xl font-black text-orange-600">{result.total_guna}</span>
                                            <span className="text-xl text-orange-200 font-black">/ 36</span>
                                        </div>
                                        <p className="font-black text-[10px] uppercase tracking-widest text-orange-400 mt-4">{t("totalGunas")}</p>
                                        <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mt-8 shadow-sm ${result.total_guna > 18 ? "bg-orange-500 text-white" : "bg-amber-500 text-white"}`}>
                                            {result.total_guna > 18 ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                            {getCompatibilityMessage(result.total_guna)}
                                        </div>
                                    </div>

                                    {/* Marriage Stability */}
                                    <div className="md:col-span-1 bg-gradient-to-br from-purple-500/5 to-pink-500/5 p-10 rounded-[3rem] border border-purple-100/50 text-center flex flex-col justify-center items-center">
                                        <div className="text-5xl font-black text-purple-600">
                                            {Math.min(98, Math.floor((result.total_guna / 36) * 100 + (result.is_manglik_boy === result.is_manglik_girl ? 10 : -5)))}%
                                        </div>
                                        <p className="font-black text-[10px] uppercase tracking-widest text-slate-400 mt-4">{t("marriageStability")}</p>
                                        <div className="mt-8 space-y-1">
                                            <div className={`text-sm font-black uppercase tracking-widest ${result.total_guna > 18 ? "text-green-600" : "text-red-600"}`}>
                                                {result.total_guna > 18 ? t("divineUnion") : t("karmicChallenges")}
                                            </div>
                                            <p className="text-[10px] text-slate-400 italic">
                                                {getMarriageStabilityMessage(result.total_guna)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Dosha Status */}
                                    <div className="md:col-span-2 space-y-4">
                                        <div className="bg-slate-50 p-6 rounded-2xl flex items-center justify-between border border-slate-100">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("boyManglikStatus")}</span>
                                            <span className={`text-xs font-black uppercase tracking-widest ${result.is_manglik_boy ? "text-orange-600" : "text-green-600"}`}>
                                                {result.is_manglik_boy ? t("manglikPresence") : t("doshMukt")}
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-2xl flex items-center justify-between border border-slate-100">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("girlManglikStatus")}</span>
                                            <span className={`text-xs font-black uppercase tracking-widest ${result.is_manglik_girl ? "text-red-600" : "text-green-600"}`}>
                                                {result.is_manglik_girl ? t("manglikPresence") : t("doshMukt")}
                                            </span>
                                        </div>
                                        <div className="bg-orange-50 p-6 rounded-2xl border border-dashed border-orange-200">
                                            <p className="text-[10px] font-medium text-orange-700 leading-relaxed text-center italic">
                                                {t("manglikNote")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PANCHANG TAB */}
                            {activeTab === 'panchang' && (
                                <div className="grid md:grid-cols-2 gap-10 animate-in fade-in duration-300">
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-4">
                                            {t("vedicPanchang")} <div className="h-px bg-slate-100 flex-grow" />
                                        </h3>
                                        <div className="overflow-hidden rounded-3xl border border-slate-100">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-orange-50/50">
                                                    <tr>
                                                        <th className="py-4 px-6 font-black uppercase opacity-40">{t("attribute")}</th>
                                                        <th className="py-4 px-6 font-black text-orange-600 uppercase">{t("boy")}</th>
                                                        <th className="py-4 px-6 font-black text-red-600 uppercase">{t("girl")}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {[
                                                        { label: t("label_nakshatra"), boy: getTrans(locale).nakshatras[result.boyPanchang.nakshatraId - 1] || "-", girl: getTrans(locale).nakshatras[result.girlPanchang.nakshatraId - 1] || "-" },
                                                        { label: t("label_tithi"), boy: getTrans(locale).panchang.tithi[result.boyPanchang.tithi - 1], girl: getTrans(locale).panchang.tithi[result.girlPanchang.tithi - 1] },
                                                        { label: t("label_yoga"), boy: getTrans(locale).panchang.yoga[result.boyPanchang.yoga - 1], girl: getTrans(locale).panchang.yoga[result.girlPanchang.yoga - 1] },
                                                        { label: t("label_karan"), boy: getTrans(locale).panchang.karan[result.boyPanchang.karana - 1], girl: getTrans(locale).panchang.karan[result.girlPanchang.karana - 1] },
                                                        { label: t("label_vara"), boy: getTrans(locale).panchang.vara[result.boyPanchang.vara], girl: getTrans(locale).panchang.vara[result.girlPanchang.vara] }
                                                    ].map((row, idx) => (
                                                        <tr key={idx}>
                                                            <td className="py-4 px-6 font-bold text-slate-400 uppercase tracking-tighter">{row.label}</td>
                                                            <td className="py-4 px-6 font-black text-slate-800">{row.boy}</td>
                                                            <td className="py-4 px-6 font-black text-slate-800">{row.girl}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-4">
                                            {t("vimshottariDasha")} <div className="h-px bg-slate-100 flex-grow" />
                                        </h3>
                                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                            <div className="space-y-4">
                                                {result.boyDasha?.mahadashas?.slice(0, 4).map((d: any, i: number) => {
                                                    const isActive = new Date() >= new Date(d.start) && new Date() <= new Date(d.end);
                                                    return (
                                                        <div key={i} className={`flex justify-between items-center p-4 rounded-xl transition-all ${isActive ? "bg-white shadow-md border-l-4 border-orange-500" : "opacity-60"}`}>
                                                            <div>
                                                                <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{translatePlanet(d.lord, locale)} {t("mahadasha")}</span>
                                                                {isActive && <span className="ml-3 px-2 py-0.5 bg-orange-100 text-orange-600 text-[8px] font-black rounded uppercase">{t("currentCycle")}</span>}
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-500">{new Date(d.start).getFullYear()} - {new Date(d.end).getFullYear()}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ASHTAKOOT TAB */}
                            {activeTab === 'ashtakoot' && (
                                <div className="space-y-6 animate-in fade-in duration-300">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-4">
                                        {t("gunaScoreDistribution")} <div className="h-px bg-slate-100 flex-grow" />
                                    </h3>
                                    <div className="overflow-hidden rounded-3xl border border-slate-100">
                                        <table className="w-full text-left">
                                            <thead className="bg-orange-50/50">
                                                <tr>
                                                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('Index.table.koota')}</th>
                                                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-orange-600 text-center">{t('Index.table.boyValue')}</th>
                                                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-red-600 text-center">{t('Index.table.girlValue')}</th>
                                                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">{t('Index.table.max')}</th>
                                                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-900 text-right">{t('Index.table.obtained')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {Object.entries(result.ashtakoot).map(([key, val]: any) => (
                                                    <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="py-4 px-6 text-[11px] font-black uppercase tracking-widest text-slate-800">
                                                            {(getTrans(locale).kootas as any)[key] || key}
                                                        </td>
                                                        <td className="py-4 px-6 text-center text-xs font-bold text-slate-600">{val.boyVal || "-"}</td>
                                                        <td className="py-4 px-6 text-center text-xs font-bold text-slate-600">{val.girlVal || "-"}</td>
                                                        <td className="py-4 px-6 text-right text-xs font-medium text-slate-300">{val.total}</td>
                                                        <td className="py-4 px-6 text-right font-black text-sm text-orange-600">{val.score}</td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-orange-50/30">
                                                    <td colSpan={4} className="py-6 px-6 text-xs font-black uppercase tracking-widest text-slate-400 text-right">{t("finalMatchingResult")}</td>
                                                    <td className="py-6 px-6 text-right font-black text-2xl text-orange-600 tracking-tighter">{result.total_guna} / 36</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* ANALYSIS TAB */}
                            {activeTab === 'analysis' && detailedReport && (
                                <div className="grid md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-pink-100 rounded-lg text-pink-600"><Heart className="w-5 h-5" /></div>
                                            <h3 className="text-lg font-black uppercase text-slate-800">{detailedReport.marriage.title}</h3>
                                        </div>
                                        <p className="text-slate-600 font-medium leading-relaxed">{detailedReport.marriage.verdict}</p>
                                        <div className="mt-4 inline-block px-4 py-1.5 bg-pink-50 text-pink-700 rounded-md text-xs font-bold uppercase tracking-wider">
                                            {detailedReport.marriage.rating}
                                        </div>
                                    </div>

                                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><TrendingUp className="w-5 h-5" /></div>
                                            <h3 className="text-lg font-black uppercase text-slate-800">{detailedReport.forecast.title}</h3>
                                        </div>
                                        <p className="text-slate-600 font-medium leading-relaxed">{detailedReport.forecast.verdict}</p>
                                    </div>

                                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><Timer className="w-5 h-5" /></div>
                                            <h3 className="text-lg font-black uppercase text-slate-800">{detailedReport.timing.title}</h3>
                                        </div>
                                        <p className="text-slate-600 font-medium leading-relaxed">{detailedReport.timing.verdict}</p>
                                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            <Calendar className="w-4 h-4" /> Shubh Muhurat Yoga
                                        </div>
                                    </div>

                                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg md:col-span-2 grid md:grid-cols-3 gap-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-black uppercase tracking-widest">
                                                <Users className="w-4 h-4" /> {detailedReport.nature.title}
                                            </div>
                                            <p className="text-sm text-slate-700 font-medium">{detailedReport.nature.verdict}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-black uppercase tracking-widest">
                                                <Wallet className="w-4 h-4" /> {detailedReport.finance.title}
                                            </div>
                                            <p className="text-sm text-slate-700 font-medium">{detailedReport.finance.verdict}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-black uppercase tracking-widest">
                                                <Sparkles className="w-4 h-4" /> {detailedReport.family.title}
                                            </div>
                                            <p className="text-sm text-slate-700 font-medium">{detailedReport.family.verdict}</p>
                                        </div>
                                    </div>
                                </div>

                            )}

                            {/* REMEDIES TAB */}
                            {activeTab === 'remedies' && detailedReport && (
                                <div className="space-y-8">
                                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><Shield className="w-5 h-5" /></div>
                                            <h3 className="text-lg font-black uppercase text-slate-800">{detailedReport.remedies.title}</h3>
                                        </div>
                                        <ul className="space-y-3">
                                            {detailedReport.remedies.list.map((rem: string, i: number) => (
                                                <li key={i} className="flex gap-3 text-slate-600 font-medium text-sm">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                                                    {rem}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-16 text-center">
                            <Button
                                onClick={handleDownloadPDF}
                                className="h-14 px-10 rounded-xl bg-orange-900 hover:bg-orange-800 text-white font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-orange-900/10"
                            >
                                {t("downloadReport")}
                            </Button>
                        </div>
                    </section>
                )}
            </div>
            <Footer />
        </main >
    );
}
