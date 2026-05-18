"use client";

import { useTranslations, useLocale } from "next-intl";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef } from "react";
import { Heart, Sparkles, AlertCircle, CheckCircle, Calendar, Timer, Shield, Info, TrendingUp, Users, Wallet, Activity } from "lucide-react";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { LocationInput } from "@/components/kundli/LocationInput";
import { generateMatchingPDF } from "@/lib/astrology/generateMatchingPDF";
// import { calculatePlanets, calculateGunMilan, calculatePanchang } from "@/lib/astrology/calculator";
// ... imports
import { translateSign, translatePlanet, getTrans } from "@/lib/astrology/i18n";
import { generateFullMatchAnalysis, generateDetailedMatchingReport } from "@/lib/astrology/prediction-engine";
import { LagnaChart } from "@/components/kundli/LagnaChart";

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
    const pdfContentRef = useRef<HTMLDivElement>(null);
    const pdfBoyChartRef = useRef<HTMLDivElement>(null);
    const pdfGirlChartRef = useRef<HTMLDivElement>(null);

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

            const fullReport = generateFullMatchAnalysis(matchResult, locale);
            const detailedReportPart = generateDetailedMatchingReport(matchResult, locale);
            const mergedReport = {
                ...fullReport,
                ...detailedReportPart
            };
            setDetailedReport(mergedReport);

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
                girlDasha: matchResult.girl.dasha,
                boyPlanets: matchResult.boy.planets,
                girlPlanets: matchResult.girl.planets,
                boyChart: matchResult.boy.charts,
                girlChart: matchResult.girl.charts,
                boyAscendant: matchResult.boy.ascendantLongitude,
                girlAscendant: matchResult.girl.ascendantLongitude
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
        if (!result || !detailedReport) return;

        toast.loading(locale === 'hi' ? "आपका दिव्य प्रतिवेदन तैयार किया जा रहा है..." : "Preparing your divine report...", { id: "pdf-match" });

        try {
            await generateMatchingPDF(result, boy, girl, locale, detailedReport);
            toast.success(locale === 'hi' ? "रिपोर्ट तैयार है!" : "Match Report ready!", { id: "pdf-match" });
        } catch (error) {
            console.error("PDF Generation Error:", error);
            toast.error(locale === 'hi' ? "रिपोर्ट तैयार करने में त्रुटि हुई" : "Error generating report", { id: "pdf-match" });
        }
    };

    const getCompatibilityMessage = (score: number) => {
        if (score > 24) return t("excellentMatch");
        if (score > 18) return t("averageMatch");
        return t("lowCompatibility");
    };

    const getMarriageStabilityMessage = (score: number) => {
        if (score >= 28) return t("stabilityMessage.highlyFavorable");
        if (score >= 18) return t("stabilityMessage.averageCompatibility");
        return t("stabilityMessage.notRecommended");
    };

    return (
        <main className="min-h-screen bg-[#050510] text-white flex flex-col selection:bg-orange-500/30">
            <Navbar />

            <div className="container mx-auto px-4 py-12 md:py-20 flex-grow">
                <header className="text-center space-y-4 mb-20 animate-slide-up">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-xs font-bold tracking-wider uppercase">
                        <Heart className="w-3.5 h-3.5 fill-orange-500" /> {t("sacredUnion")}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">{t("kundliMatchingTitle")}</span>
                    </h1>
                    <p className="text-white/60 max-w-xl mx-auto">
                        {t("kundliMatchingDescription")}
                    </p>
                </header>

                <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto animate-slide-up">
                    <div className="bg-white/5 backdrop-blur-3xl p-8 md:p-10 rounded-3xl space-y-8 border border-white/10 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{t("boyIdentityTitle")}</h2>
                                <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">{t("seekerOfWisdom")}</p>
                            </div>
                        </div>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-white/60 uppercase tracking-wider">{t("fullNameLabel")}</Label>
                                <Input className="h-12 rounded-xl bg-white/5 border-white/10 focus:ring-orange-500 text-white placeholder:text-white/30" value={boy.name} onChange={e => setBoy({ ...boy, name: e.target.value })} placeholder={t("enterNamePlaceholder")} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-white/60 uppercase tracking-wider">{t("manifestationDateLabel")}</Label>
                                    <Input className="h-12 rounded-xl bg-white/5 border-white/10 focus:ring-orange-500 text-white [color-scheme:dark]" type="date" value={boy.dob} onChange={e => setBoy({ ...boy, dob: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-white/60 uppercase tracking-wider">{t("timeOfBreathLabel")}</Label>
                                    <Input className="h-12 rounded-xl bg-white/5 border-white/10 focus:ring-orange-500 text-white [color-scheme:dark]" type="time" value={boy.tob} onChange={e => setBoy({ ...boy, tob: e.target.value })} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-white/60 uppercase tracking-wider">{t("birthCoordinatesLabel")}</Label>
                                <LocationInput
                                    value={boy.place}
                                    onChange={(location: string, lat?: number, lng?: number) => {
                                        setBoy(prev => ({
                                            ...prev,
                                            place: location,
                                            lat: lat ?? prev.lat,
                                            lng: lng ?? prev.lng
                                        }));
                                    }}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-3xl p-8 md:p-10 rounded-3xl space-y-8 border border-white/10 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{t("girlIdentityTitle")}</h2>
                                <p className="text-xs font-bold text-red-500 uppercase tracking-wider">{t("seekerOfGrace")}</p>
                            </div>
                        </div>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-white/60 uppercase tracking-wider">{t("fullNameLabel")}</Label>
                                <Input className="h-12 rounded-xl bg-white/5 border-white/10 focus:ring-red-500 text-white placeholder:text-white/30" value={girl.name} onChange={e => setGirl({ ...girl, name: e.target.value })} placeholder={t("enterNamePlaceholder")} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-white/60 uppercase tracking-wider">{t("manifestationDateLabel")}</Label>
                                    <Input className="h-12 rounded-xl bg-white/5 border-white/10 focus:ring-red-500 text-white [color-scheme:dark]" type="date" value={girl.dob} onChange={e => setGirl({ ...girl, dob: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-white/60 uppercase tracking-wider">{t("timeOfBreathLabel")}</Label>
                                    <Input className="h-12 rounded-xl bg-white/5 border-white/10 focus:ring-red-500 text-white [color-scheme:dark]" type="time" value={girl.tob} onChange={e => setGirl({ ...girl, tob: e.target.value })} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-white/60 uppercase tracking-wider">{t("birthCoordinatesLabel")}</Label>
                                <LocationInput
                                    value={girl.place}
                                    onChange={(location: string, lat?: number, lng?: number) => {
                                        setGirl(prev => ({
                                            ...prev,
                                            place: location,
                                            lat: lat ?? prev.lat,
                                            lng: lng ?? prev.lng
                                        }));
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
                    <section id="match-result" className="max-w-6xl mx-auto bg-white/5 backdrop-blur-3xl p-8 md:p-16 rounded-[4rem] border border-white/10 shadow-2xl animate-slide-up relative text-white">
                        <div className="text-center mb-8 relative z-10">
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase mb-4">{t("compatibilityReportTitle")}</h2>
                            <p className="text-white/60 font-medium">{t("between")} <span className="text-orange-500 font-black uppercase tracking-widest">{result.boy}</span> & <span className="text-red-500 font-black uppercase tracking-widest">{result.girl}</span></p>
                        </div>

                        <div className="bg-slate-100 p-1.5 rounded-2xl flex overflow-x-auto gap-2 mb-12 relative z-10">
                            {[
                                { id: 'overview', label: locale === 'hi' ? 'अवलोकन' : 'Overview', icon: Heart },
                                { id: 'ashtakoot', label: locale === 'hi' ? 'अष्टकूट' : 'Ashtakoot', icon: Activity },
                                { id: 'detailed', label: locale === 'hi' ? 'विस्तृत रिपोर्ट' : 'Detailed Report', icon: TrendingUp },
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

                        <div className="min-h-[400px]">
                            {activeTab === 'overview' && (
                                <div className="grid md:grid-cols-4 gap-8">
                                    <div className="md:col-span-1 bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 text-center flex flex-col justify-center items-center">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-7xl font-black text-orange-500">{result.total_guna}</span>
                                            <span className="text-xl text-white/20 font-black">/ 36</span>
                                        </div>
                                        <p className="font-black text-[10px] uppercase tracking-widest text-orange-400 mt-4">{t("totalGunas")}</p>
                                    </div>
                                    <div className="md:col-span-3 space-y-4">
                                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                            <h4 className="text-orange-500 font-bold mb-2 uppercase text-xs tracking-wider">{detailedReport.section2.quality}</h4>
                                            <p className="text-white/70 leading-relaxed">{detailedReport.section2.recommendation}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                                <p className="text-[10px] text-white/40 uppercase mb-1">{locale === 'hi' ? 'भावनात्मक' : 'Emotional'}</p>
                                                <p className="font-bold text-sm">{detailedReport.section2.emotional}</p>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                                <p className="text-[10px] text-white/40 uppercase mb-1">{locale === 'hi' ? 'शारीरिक' : 'Physical'}</p>
                                                <p className="font-bold text-sm">{detailedReport.section2.physical}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'ashtakoot' && (
                                <div className="grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl">
                                        <div className="flex items-center gap-2 mb-3 text-orange-400 text-xs font-black uppercase tracking-widest">
                                            <Users className="w-4 h-4" /> {detailedReport.nature.title}
                                        </div>
                                        <p className="text-sm text-white/70 leading-relaxed">{detailedReport.nature.verdict}</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl">
                                        <div className="flex items-center gap-2 mb-3 text-blue-400 text-xs font-black uppercase tracking-widest">
                                            <Wallet className="w-4 h-4" /> {detailedReport.finance.title}
                                        </div>
                                        <p className="text-sm text-white/70 leading-relaxed">{detailedReport.finance.verdict}</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl">
                                        <div className="flex items-center gap-2 mb-3 text-purple-400 text-xs font-black uppercase tracking-widest">
                                            <Sparkles className="w-4 h-4" /> {detailedReport.family.title}
                                        </div>
                                        <p className="text-sm text-white/70 leading-relaxed">{detailedReport.family.verdict}</p>
                                    </div>
                                </div>
                            )}
 
                            {activeTab === 'detailed' && detailedReport && (
                                <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl space-y-2">
                                        <div className="text-orange-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                            <Heart className="w-4 h-4" /> {detailedReport.marriage.title}
                                        </div>
                                        <p className="text-sm text-white/70 leading-relaxed">{detailedReport.marriage.verdict}</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl space-y-2">
                                        <div className="text-blue-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                            <Users className="w-4 h-4" /> {detailedReport.nature.title}
                                        </div>
                                        <p className="text-sm text-white/70 leading-relaxed">{detailedReport.nature.verdict}</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl space-y-2">
                                        <div className="text-purple-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" /> {detailedReport.family.title}
                                        </div>
                                        <p className="text-sm text-white/70 leading-relaxed">{detailedReport.family.verdict}</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl space-y-2">
                                        <div className="text-emerald-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                            <Wallet className="w-4 h-4" /> {detailedReport.finance.title}
                                        </div>
                                        <p className="text-sm text-white/70 leading-relaxed">{detailedReport.finance.verdict}</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl space-y-2">
                                        <div className="text-pink-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" /> {detailedReport.bond.title}
                                        </div>
                                        <p className="text-sm text-white/70 leading-relaxed">{detailedReport.bond.verdict}</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl space-y-2">
                                        <div className="text-yellow-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                            <Timer className="w-4 h-4" /> {detailedReport.timing.title}
                                        </div>
                                        <p className="text-sm text-white/70 leading-relaxed font-bold">{detailedReport.timing.verdict}</p>
                                    </div>
                                    <div className="md:col-span-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 p-8 rounded-3xl border border-orange-500/20 shadow-xl space-y-2">
                                        <div className="text-orange-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" /> {detailedReport.forecast.title}
                                        </div>
                                        <p className="text-sm text-white/80 leading-relaxed">{detailedReport.forecast.verdict}</p>
                                    </div>
                                </div>
                            )}

                            {/* REMEDIES TAB */}
                            {activeTab === 'remedies' && detailedReport && (
                                <div className="space-y-8">
                                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><Shield className="w-5 h-5" /></div>
                                            <h3 className="text-lg font-black uppercase text-white">{detailedReport.remedies.title}</h3>
                                        </div>
                                        <ul className="space-y-3">
                                            {detailedReport.remedies.list.map((rem: string, i: number) => (
                                                <li key={i} className="flex gap-3 text-white/70 font-medium text-sm">
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

            {/* Hidden PDF Export Content for Matching */}
            {result && (
                <div 
                    ref={pdfContentRef}
                    className="fixed -left-[9999px] top-0 leading-relaxed bg-white"
                    style={{ width: '800px' }}
                >
                    <div id="pdf-boy-chart" ref={pdfBoyChartRef} className="bg-white p-8">
                        <LagnaChart chart={result.boyChart?.D1 || {}} planets={result.boyPlanets} ascendant={result.boyAscendant} title={`${result.boy} (Boy)`} subTitle="D1 Chart" />
                    </div>
                    <div id="pdf-girl-chart" ref={pdfGirlChartRef} className="bg-white p-8">
                        <LagnaChart chart={result.girlChart?.D1 || {}} planets={result.girlPlanets} ascendant={result.girlAscendant} title={`${result.girl} (Girl)`} subTitle="D1 Chart" />
                    </div>
                    {/* Page 1: Overview & Score */}
                    <div id="pdf-match-overview" className="p-10 mb-20 bg-white min-h-[1100px] border-8 border-orange-500/10">
                        <div className="flex justify-between items-center border-b-4 border-orange-500 pb-6 mb-10">
                            <h1 className="text-4xl font-black text-orange-600 uppercase tracking-tighter">
                                {t("finalMatchingResult") || "Match Report"}
                            </h1>
                            <div className="text-right">
                                <div className="text-5xl font-black text-orange-500">{result.total_guna} / 36</div>
                                <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">{t("totalGunas")}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-10 mb-12">
                            <div className="bg-orange-50 p-6 rounded-3xl border-2 border-orange-100">
                                <h3 className="text-sm font-black text-orange-600 uppercase mb-4 tracking-widest">{t("boyIdentityTitle")}</h3>
                                <div className="text-2xl font-black text-slate-900 mb-1">{result.boy}</div>
                                <div className="text-xs text-slate-500 font-bold uppercase">{boy.dob} | {boy.tob}</div>
                            </div>
                            <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-100">
                                <h3 className="text-sm font-black text-red-600 uppercase mb-4 tracking-widest">{t("girlIdentityTitle")}</h3>
                                <div className="text-2xl font-black text-slate-900 mb-1">{result.girl}</div>
                                <div className="text-xs text-slate-500 font-bold uppercase">{girl.dob} | {girl.tob}</div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-slate-800 border-l-4 border-orange-500 pl-4">{t("compatibilityReportTitle")}</h3>
                            <div className="p-8 bg-slate-50 rounded-3xl text-xl leading-relaxed text-slate-700 italic border border-slate-200">
                                "{getCompatibilityMessage(result.total_guna)}: {getMarriageStabilityMessage(result.total_guna)}"
                            </div>
                        </div>

                        <div className="mt-12 grid grid-cols-2 gap-8">
                             <div className={`p-6 rounded-2xl border-2 ${result.is_manglik_boy ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                                <div className="text-[10px] font-black uppercase text-slate-400 mb-2">{t("boyManglikStatus")}</div>
                                <div className={`text-lg font-black ${result.is_manglik_boy ? "text-red-600" : "text-green-600"}`}>
                                    {result.is_manglik_boy ? t("manglikPresence") : t("doshMukt")}
                                </div>
                             </div>
                             <div className={`p-6 rounded-2xl border-2 ${result.is_manglik_girl ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                                <div className="text-[10px] font-black uppercase text-slate-400 mb-2">{t("girlManglikStatus")}</div>
                                <div className={`text-lg font-black ${result.is_manglik_girl ? "text-red-600" : "text-green-600"}`}>
                                    {result.is_manglik_girl ? t("manglikPresence") : t("doshMukt")}
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Page 2: Ashtakoot & Panchang */}
                    <div id="pdf-match-details" className="p-10 mb-20 bg-white min-h-[1100px]">
                        <h2 className="text-3xl font-black text-blue-600 border-b-4 border-blue-500 pb-4 mb-8 uppercase tracking-widest">
                            {t("ganMilanTitle") || "Detailed Koota Analysis"}
                        </h2>
                        
                        <table className="w-full border-collapse mb-12">
                            <thead>
                                <tr className="bg-blue-600 text-white">
                                    <th className="p-4 text-left border border-blue-500">{t("table.koota") || "Koota"}</th>
                                    <th className="p-4 text-center border border-blue-500">{t("boy") || "Boy"}</th>
                                    <th className="p-4 text-center border border-blue-500">{t("girl") || "Girl"}</th>
                                    <th className="p-4 text-right border border-blue-500">{t("table.max") || "Max"}</th>
                                    <th className="p-4 text-right border border-blue-500">{t("table.obtained") || "Obtained"}</th>
                                </tr>
                            </thead>
                            <tbody className="text-lg">
                                {Object.entries(result.ashtakoot).map(([key, val]: any, idx) => (
                                    <tr key={key} className={idx % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                                        <td className="p-4 border border-slate-200 font-bold">{(getTrans(locale).kootas as any)[key] || key}</td>
                                        <td className="p-4 border border-slate-200 text-center">{val.boyVal || "-"}</td>
                                        <td className="p-4 border border-slate-200 text-center">{val.girlVal || "-"}</td>
                                        <td className="p-4 border border-slate-200 text-right text-slate-400">{val.total}</td>
                                        <td className="p-4 border border-slate-200 text-right font-black text-blue-600">{val.score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <h2 className="text-3xl font-black text-purple-600 border-b-4 border-purple-500 pb-4 mb-8">
                            {t("vedicPanchang")}
                        </h2>
                        <table className="w-full border-collapse text-lg">
                            <thead className="bg-purple-600 text-white">
                                <tr>
                                    <th className="p-4 text-left border border-purple-500">{t("attribute")}</th>
                                    <th className="p-4 text-left border border-purple-500">{t("boy")}</th>
                                    <th className="p-4 text-left border border-purple-500">{t("girl")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { label: t("label_nakshatra"), boy: getTrans(locale).nakshatras[result.boyPanchang.nakshatraId - 1] || "-", girl: getTrans(locale).nakshatras[result.girlPanchang.nakshatraId - 1] || "-" },
                                    { label: t("label_tithi"), boy: getTrans(locale).panchang.tithi[result.boyPanchang.tithiId], girl: getTrans(locale).panchang.tithi[result.girlPanchang.tithiId] },
                                    { label: t("label_yoga"), boy: getTrans(locale).panchang.yoga[result.boyPanchang.yogaId], girl: getTrans(locale).panchang.yoga[result.girlPanchang.yogaId] },
                                    { label: t("label_karan"), boy: getTrans(locale).panchang.karan[result.boyPanchang.karanaId], girl: getTrans(locale).panchang.karan[result.girlPanchang.karanaId] },
                                    { label: t("label_vara"), boy: getTrans(locale).panchang.vara[result.boyPanchang.vara], girl: getTrans(locale).panchang.vara[result.girlPanchang.vara] }
                                ].map((row, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                                        <td className="p-4 border border-slate-200 font-bold">{row.label}</td>
                                        <td className="p-4 border border-slate-200 font-black">{row.boy}</td>
                                        <td className="p-4 border border-slate-200 font-black">{row.girl}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Page 3: Detailed Findings */}
                    {detailedReport && (
                        <div id="pdf-match-findings" className="p-10 bg-white min-h-[1100px]">
                            <h2 className="text-3xl font-black text-emerald-600 border-b-4 border-emerald-500 pb-4 mb-8 uppercase tracking-widest">
                                {t("detailedAnalysis") || "Detailed Findings"}
                            </h2>
                            <div className="space-y-12">
                                {[
                                    detailedReport.marriage,
                                    detailedReport.nature,
                                    detailedReport.family,
                                    detailedReport.finance,
                                    detailedReport.forecast
                                ].map((sec, idx) => (
                                    <div key={idx} className="border-l-8 border-slate-100 pl-8">
                                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-3">{sec.title}</h3>
                                        <p className="text-lg text-slate-600 leading-relaxed text-justify">{sec.verdict}</p>
                                    </div>
                                ))}
                                
                                <div className="bg-emerald-50 p-8 rounded-[3rem] border-2 border-emerald-100">
                                    <h3 className="text-2xl font-black text-emerald-700 mb-6 flex items-center gap-3">
                                        ✨ {detailedReport.remedies.title}
                                    </h3>
                                    <ul className="space-y-4 text-lg text-emerald-900">
                                        {detailedReport.remedies.list.map((r: string, i: number) => (
                                            <li key={i} className="flex gap-4 items-start">
                                                <span className="text-emerald-500 font-black mt-1">•</span> {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
