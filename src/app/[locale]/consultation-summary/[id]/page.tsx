"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { FileText, Download, Share2, Star, CheckCircle, Search, Clock, ListChecks, Target, Sparkles, MessageSquare } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";

export default function ConsultationSummaryPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [finalTranscript, setFinalTranscript] = useState<{ speaker: string, text: string, time: string }[]>([]);
    const [sessionInfo, setSessionInfo] = useState<{
        astrologerName: string;
        userName: string;
        date: string;
        duration: string;
        type: string;
    }>({
        astrologerName: 'Astrologer',
        userName: 'Client',
        date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
        duration: '—',
        type: 'video'
    });

    useEffect(() => {
        const fetchSummary = async () => {
            if (!id) return;
            try {
                // Fetch real transcript from Firestore
                const docRef = doc(db, "consultations", id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.transcript) {
                        setFinalTranscript(data.transcript);
                    }
                    // Populate session info from Firestore data
                    const duration = data.duration || 0;
                    const mins = Math.floor(duration / 60);
                    const secs = duration % 60;
                    setSessionInfo({
                        astrologerName: data.astrologerName || 'Astrologer',
                        userName: data.userName || 'Client',
                        date: data.endedAt
                            ? new Date(data.endedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                            : new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
                        duration: duration > 0 ? `${mins}m ${secs}s` : '—',
                        type: data.type || 'video'
                    });
                } else {
                    // Fallback to local storage if firestore doc doesn't exist (legacy/test)
                    const saved = localStorage.getItem(`transcript_${id === 'demo-session' ? 'demo' : id}`);
                    if (saved) {
                        setFinalTranscript(JSON.parse(saved));
                    }
                }
            } catch (error) {
                console.error("Error fetching summary:", error);
                toast.error("Failed to load transcript");
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [id]);

    const handleDownload = async () => {
        if (finalTranscript.length === 0) {
            toast.error("No transcript available to download");
            return;
        }

        const toastId = toast.loading("Generating your premium PDF transcript summary...");

        try {
            // Dynamically import to prevent SSR compiling issues
            const { default: jsPDF } = await import("jspdf");
            const { default: autoTable } = await import("jspdf-autotable");

            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            // Header Banner
            doc.setFillColor(15, 23, 42); // Deep Slate Navy
            doc.rect(0, 0, 210, 40, "F");

            // Gold line under banner
            doc.setFillColor(249, 115, 22); // Celestial Gold/Orange
            doc.rect(0, 0, 210, 3.5, "F");

            // Brand title
            doc.setTextColor(255, 255, 255);
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(22);
            doc.text("JYOTISHCONNECT", 20, 20);

            // Subtitle
            doc.setTextColor(249, 115, 22);
            doc.setFont("Helvetica", "italic");
            doc.setFontSize(10);
            doc.text("Vedic Consultation Dialogue & Remedy Record", 20, 27);

            // Section 1: Metadata
            doc.setTextColor(51, 65, 85);
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(11);
            doc.text("CONSULTATION METADATA", 20, 52);

            // Gray background panel
            doc.setFillColor(248, 250, 252);
            doc.rect(20, 56, 170, 32, "F");

            doc.setFont("Helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(71, 85, 105);
            doc.text("Seeker Name:", 25, 62);
            doc.text("Acharya / Guide:", 25, 68);
            doc.text("Session Date:", 25, 74);
            doc.text("Call Duration:", 25, 80);

            doc.setFont("Helvetica", "normal");
            doc.setTextColor(15, 23, 42);
            doc.text(String(sessionInfo.userName), 60, 62);
            doc.text(String(sessionInfo.astrologerName), 60, 68);
            doc.text(String(sessionInfo.date), 60, 74);
            doc.text(String(sessionInfo.duration), 60, 80);

            // Section 2: AI Remedies & Highlights
            doc.setTextColor(249, 115, 22); // Orange
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(11);
            doc.text("VEDIC AI TRANSCRIPT REMEDIES SUMMARY", 20, 96);

            // Orange warning outline block
            doc.setDrawColor(254, 215, 170); // Light gold border
            doc.setFillColor(255, 247, 237); // Light gold background
            doc.rect(20, 100, 170, 46, "FD");

            doc.setFont("Helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(194, 65, 12);
            doc.text("✨ DAKSHINA KEY VEDIC RECOMMENDATIONS & REMEDIES:", 25, 106);

            doc.setFont("Helvetica", "normal");
            doc.setTextColor(67, 20, 7);
            
            const remedies = [
                "1. Career Focus: Planetary transits analyzed indicate Autority and authorities' support in the 10th house.",
                "2. Action Remedy: Chanting of 'Om Namah Shivaya' (108 times daily) is suggested for planetary alignment.",
                "3. Caution Guidance: Avoid major new financial investments or authority disputes until transit cycles clear."
            ];

            let remedyY = 113;
            remedies.forEach(rem => {
                const lines = doc.splitTextToSize(rem, 160);
                doc.text(lines, 25, remedyY);
                remedyY += 8;
            });

            // Section 3: Full Dialogues
            doc.setTextColor(15, 23, 42);
            doc.setFont("Helvetica", "bold");
            doc.setFontSize(11);
            doc.text("CONSULTATION DIALOGUE LOG", 20, 155);

            const tableRows = finalTranscript.map(line => [
                line.time,
                line.speaker,
                line.text
            ]);

            autoTable(doc, {
                startY: 160,
                head: [["Time", "Speaker", "Dialogue Text"]],
                body: tableRows,
                theme: "striped",
                headStyles: {
                    fillColor: [15, 23, 42],
                    textColor: [255, 255, 255],
                    fontSize: 9,
                    fontStyle: "bold"
                },
                columnStyles: {
                    0: { cellWidth: 20, fontStyle: "bold", textColor: [100, 116, 139] },
                    1: { cellWidth: 35, fontStyle: "bold", textColor: [249, 115, 22] },
                    2: { cellWidth: 115 }
                },
                styles: {
                    fontSize: 8.5,
                    cellPadding: 4.5,
                    overflow: "linebreak"
                },
                margin: { left: 20, right: 20 },
                didDrawPage: (data) => {
                    const pageCount = doc.getNumberOfPages();
                    doc.setFont("Helvetica", "normal");
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);

                    // footer border line
                    doc.setDrawColor(241, 245, 249);
                    doc.line(20, 282, 190, 282);

                    doc.text("May the cosmos illuminate your path. Generated by JyotishConnect.", 20, 288);
                    doc.text(`Page ${pageCount}`, 180, 288);
                }
            });

            doc.save(`Consultation-Summary-${id}.pdf`);
            toast.success("Premium PDF transcript downloaded successfully!", { id: toastId });

        } catch (error) {
            console.error("PDF generation failed, falling back to raw export:", error);
            toast.error("Failed to generate PDF. Exporting raw text file...", { id: toastId });
            
            // Raw text fallback
            const headers = `JyotishConnect - Meeting Transcript\nConsultation with ${sessionInfo.astrologerName}\nDate: ${sessionInfo.date}\nDuration: ${sessionInfo.duration}\n\n`;
            const content = finalTranscript.map(line => `[${line.time}] ${line.speaker}: ${line.text}`).join("\n\n");
            const fullText = headers + content;

            const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Consultation-Transcript-${id}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const filteredTranscript = useMemo(() => {
        if (!searchQuery.trim()) return finalTranscript;
        const query = searchQuery.toLowerCase();
        return finalTranscript.filter(line => 
            line.text.toLowerCase().includes(query) || 
            line.speaker.toLowerCase().includes(query)
        );
    }, [finalTranscript, searchQuery]);

    // Simple mock keypoints for AI sidebar
    const mockKeypoints = [
        "Planetary positions analyzed indicating career growth in Q3.",
        "Saturn transit suggests patience required until next month.",
        "Daily meditation and chanting 'Om Namah Shivaya' recommended."
    ];

    return (
        <main className="min-h-screen flex flex-col bg-[#0a0a0b] text-zinc-100 font-sans selection:bg-orange-500/30">
            <Navbar />

            <div className="flex-grow container mx-auto px-4 py-8 md:py-12 max-w-7xl">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-6 border-b border-zinc-800">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-xs font-semibold text-zinc-400">
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800">
                                <FileText className="w-3.5 h-3.5" /> Meeting Transcript
                            </span>
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800">
                                <Clock className="w-3.5 h-3.5" /> {sessionInfo.duration}
                            </span>
                            <span className="capitalize hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800">
                                <MessageSquare className="w-3.5 h-3.5" /> {sessionInfo.type}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                            Consultation with {sessionInfo.astrologerName}
                        </h1>
                        <p className="text-sm text-zinc-500 font-medium">
                            {sessionInfo.date} • Participants: {sessionInfo.userName}, {sessionInfo.astrologerName}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button variant="outline" className="flex-grow md:flex-grow-0 h-10 px-5 rounded-lg bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-2 transition-all font-semibold text-sm" onClick={handleDownload}>
                            <Download className="w-4 h-4" /> Export
                        </Button>
                        <Button className="flex-grow md:flex-grow-0 h-10 px-6 rounded-lg bg-orange-600 hover:bg-orange-700 text-white gap-2 transition-all font-semibold text-sm border-0 shadow-lg shadow-orange-900/20">
                            <Share2 className="w-4 h-4" /> Share
                        </Button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Transcript Area (Left) */}
                    <div className="lg:col-span-8 flex flex-col h-full bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
                        
                        {/* Transcript Toolbar */}
                        <div className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/80 flex justify-between items-center sticky top-0 z-10">
                            <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                                Transcript
                            </h2>
                            <div className="relative w-64 hidden sm:block">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <Input 
                                    placeholder="Search in transcript..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-9 pl-9 bg-zinc-950 border-zinc-800 text-sm focus-visible:ring-1 focus-visible:ring-zinc-700 rounded-md"
                                />
                            </div>
                        </div>

                        {/* Mobile Search */}
                        <div className="p-4 sm:hidden border-b border-zinc-800 bg-zinc-900">
                            <div className="relative w-full">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <Input 
                                    placeholder="Search in transcript..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-10 pl-9 bg-zinc-950 border-zinc-800"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-20 text-center space-y-4 m-auto">
                                <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin mx-auto" />
                                <p className="text-sm text-zinc-500 font-medium">Processing meeting transcript...</p>
                            </div>
                        ) : (
                            <div className="p-6 md:p-8 space-y-8 overflow-y-auto max-h-[800px] scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                                {filteredTranscript.length === 0 ? (
                                    <div className="py-20 text-center text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-xl">
                                        {searchQuery ? "No matches found in transcript." : "No transcript available for this meeting."}
                                    </div>
                                ) : (
                                    filteredTranscript.map((line, i) => {
                                        const isAstrologer = line.speaker === sessionInfo.astrologerName || line.speaker === "Astrologer" || line.speaker.includes("Jyotishi");
                                        return (
                                            <div key={i} className="flex gap-4 sm:gap-5 group hover:bg-zinc-800/30 p-2 sm:-m-2 rounded-xl transition-colors">
                                                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm select-none ${isAstrologer ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                                                    {line.speaker[0]?.toUpperCase()}
                                                </div>
                                                <div className="flex-1 space-y-1 min-w-0">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-semibold text-zinc-200 truncate">{line.speaker}</span>
                                                        <span className="text-xs font-medium text-zinc-500 tabular-nums">{line.time}</span>
                                                    </div>
                                                    <div className="text-[15px] leading-relaxed text-zinc-300 whitespace-pre-wrap">
                                                        {line.text}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    {/* AI Notetaker Sidebar (Right) */}
                    <aside className="lg:col-span-4 space-y-6">
                        {/* AI Summary Widget */}
                        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                            <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-orange-400" />
                                <h3 className="text-base font-semibold text-zinc-100">AI Meeting Notes</h3>
                            </div>
                            
                            <div className="p-5 space-y-6">
                                {/* Summary Blocks */}
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <Target className="w-3.5 h-3.5" /> Key Takeaways
                                    </h4>
                                    <ul className="space-y-3">
                                        {mockKeypoints.map((point, idx) => (
                                            <li key={idx} className="flex gap-3 text-sm text-zinc-300 leading-relaxed">
                                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500/50 mt-1.5 flex-shrink-0" />
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="pt-5 border-t border-zinc-800/50">
                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <ListChecks className="w-3.5 h-3.5" /> Action Items
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
                                            <div className="w-4 h-4 rounded border border-zinc-600 mt-0.5" />
                                            <span className="text-sm text-zinc-300 line-clamp-2">Perform Shiva Abhishek on the coming Monday morning.</span>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
                                            <div className="w-4 h-4 rounded border border-zinc-600 mt-0.5" />
                                            <span className="text-sm text-zinc-300 line-clamp-2">Avoid starting new ventures until Mercury retrograde ends.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Upsell / Info bar */}
                            <div className="mt-auto px-5 py-3 bg-zinc-950/50 border-t border-zinc-800 text-xs text-zinc-500 flex justify-between items-center">
                                <span>Powered by Astrum AI</span>
                                <Button variant="link" className="text-orange-500 h-auto p-0 text-xs font-semibold">Copy Notes</Button>
                            </div>
                        </section>

                        {/* Feedback Widget */}
                        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5 shadow-sm">
                            <div className="space-y-1 border-b border-zinc-800/50 pb-4">
                                <h3 className="text-base font-semibold text-zinc-100">Rate your session</h3>
                                <p className="text-xs text-zinc-500">Your feedback helps improve our Astrologers.</p>
                            </div>
                            
                            <div className="flex justify-between items-center px-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className="transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <Star
                                            className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-zinc-700 hover:text-zinc-600'}`}
                                        />
                                    </button>
                                ))}
                            </div>
                            
                            <textarea
                                placeholder="Add private feedback for the astrologer..."
                                className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 resize-none"
                            />
                            
                            <Button className="w-full h-10 bg-white text-black hover:bg-zinc-200 rounded-lg text-sm font-semibold transition-colors">
                                Submit Feedback
                            </Button>
                        </section>

                    </aside>
                </div>
            </div>

            <Footer />
        </main>
    );
}

