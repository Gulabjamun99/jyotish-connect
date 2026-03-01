"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { FileText, Download, Share2, Star, CheckCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ConsultationSummaryPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [finalTranscript, setFinalTranscript] = useState<{ speaker: string, text: string, time: string }[]>([]);
    const [sessionInfo, setSessionInfo] = useState<{
        astrologerName: string;
        userName: string;
        date: string;
        duration: string;
        type: string;
    }>({
        astrologerName: 'Acharya',
        userName: 'User',
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
                        astrologerName: data.astrologerName || 'Acharya',
                        userName: data.userName || 'User',
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
                toast.error("Failed to load celestial transcript");
            } finally {
                setLoading(false);
                toast.success("Divine Insights Generated!");
            }
        };

        fetchSummary();
    }, [id]);

    const handleDownload = () => {
        if (finalTranscript.length === 0) {
            toast.error("No transcript available to download");
            return;
        }

        const headers = "JyotishConnect - Consultation Transcript\nDate: " + new Date().toLocaleDateString() + "\n\n";
        const content = finalTranscript.map(line => `[${line.time}] ${line.speaker}: ${line.text}`).join("\n\n");
        const fullText = headers + content;

        const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `consultation-transcript-${id}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("Transcript downloaded successfully!");
    };

    return (
        <main className="min-h-screen flex flex-col bg-transparent overflow-hidden selection:bg-primary/30">
            <Navbar />

            <div className="container mx-auto px-4 py-16 flex-grow relative">
                {/* Ethereal Glows */}
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full -z-10 animate-float" />
                <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -z-10 animate-float" style={{ animationDelay: '-2s' }} />

                <div className="max-w-5xl mx-auto space-y-12 animate-slide-up">

                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-end md:items-center gap-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mb-2">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Transit Complete</span>
                            </div>
                            <h1 className="text-6xl font-black text-gradient tracking-tighter leading-none">Cosmic Summary</h1>
                            <p className="text-sm text-foreground/40 font-medium italic flex items-center gap-3">
                                <span className="font-black text-primary uppercase tracking-widest not-italic">{sessionInfo.astrologerName}</span>
                                <span className="w-1 h-1 bg-primary/20 rounded-full" />
                                <span>{sessionInfo.date}</span>
                                <span className="w-1 h-1 bg-primary/20 rounded-full" />
                                <span className="capitalize">{sessionInfo.type}</span>
                                {sessionInfo.duration !== '—' && (
                                    <>
                                        <span className="w-1 h-1 bg-primary/20 rounded-full" />
                                        <span>{sessionInfo.duration}</span>
                                    </>
                                )}
                            </p>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <Button variant="outline" className="flex-grow md:flex-grow-0 h-16 px-10 rounded-2xl glass border-primary/10 hover:bg-primary/5 font-black text-[10px] uppercase tracking-widest text-primary gap-4 transition-all" onClick={handleDownload}>
                                <Download className="w-5 h-5" /> Export Script
                            </Button>
                            <Button className="flex-grow md:flex-grow-0 h-16 px-10 rounded-2xl orange-gradient font-black text-white shadow-2xl shadow-primary/20 gap-4 transition-all hover:scale-105 active:scale-95 text-[10px] uppercase tracking-widest">
                                <Share2 className="w-5 h-5" /> Share
                            </Button>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                        {/* Transcript Area */}
                        <div className="lg:col-span-8 space-y-8">
                            <section className="glass rounded-[3rem] p-12 relative overflow-hidden shadow-2xl border-primary/10">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50" />

                                <div className="flex justify-between items-center mb-16">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xl shadow-primary/5">
                                            <FileText className="w-8 h-8 text-primary" />
                                        </div>
                                        <h2 className="text-3xl font-black tracking-tighter text-foreground uppercase">Divine Dialogue</h2>
                                    </div>
                                    <div className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em]">Astrum Transcription</div>
                                </div>

                                {loading ? (
                                    <div className="py-24 text-center space-y-8">
                                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto shadow-2xl" />
                                        <p className="text-xl text-foreground/30 font-black italic animate-pulse tracking-widest uppercase">Scanning frequencies...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-10">
                                        {finalTranscript.length === 0 ? (
                                            <div className="py-24 text-center text-muted-foreground/50 italic bg-white/2 rounded-[2rem] border border-dashed border-white/5">
                                                The silence of the cosmos remains unrecorded.
                                            </div>
                                        ) : (
                                            finalTranscript.map((line, i) => (
                                                <div key={i} className={`group flex gap-8 ${line.speaker === "Astrologer" || line.speaker === sessionInfo.astrologerName ? "" : "flex-row-reverse"}`}>
                                                    <div className={`w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center font-black text-2xl shadow-2xl border-2 transition-transform group-hover:scale-110 ${line.speaker === "Astrologer" || line.speaker === sessionInfo.astrologerName
                                                        ? "bg-gradient-to-br from-primary to-blue-600 border-white/20 text-white"
                                                        : "bg-white border-primary/20 text-primary"}`}>
                                                        {line.speaker[0]}
                                                    </div>
                                                    <div className={`max-w-[75%] space-y-3 ${line.speaker === "Astrologer" || line.speaker === sessionInfo.astrologerName ? "" : "text-right"}`}>
                                                        <div className="flex items-center gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none text-foreground">{line.speaker}</span>
                                                            <span className="text-[10px] font-bold text-foreground/40">{line.time}</span>
                                                        </div>
                                                        <div className={`p-8 rounded-[2.5rem] leading-relaxed text-[16px] shadow-2xl transition-all group-hover:scale-[1.01] ${line.speaker === "Astrologer" || line.speaker === sessionInfo.astrologerName
                                                            ? "bg-primary/5 text-foreground/80 rounded-tl-none border border-primary/10"
                                                            : "bg-primary text-white font-medium rounded-tr-none shadow-primary/20"}`}>
                                                            {line.text}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Actions Sidebar */}
                        <aside className="lg:col-span-4 space-y-8">
                            <section className="glass p-10 rounded-[3rem] space-y-12 relative overflow-hidden border-primary/10 shadow-2xl">
                                <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 blur-[80px] rounded-full" />
                                <div className="text-center space-y-3">
                                    <h3 className="text-3xl font-black tracking-tighter text-foreground uppercase">Blessing</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">Share your experience</p>
                                </div>
                                <div className="flex justify-center gap-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className="transition-all hover:scale-125 hover:-rotate-12 active:scale-90"
                                        >
                                            <Star
                                                className={`w-12 h-12 transition-colors ${rating >= star ? 'fill-primary text-primary drop-shadow-[0_0_20px_rgba(14,165,233,0.5)]' : 'text-foreground/10'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    placeholder="Speak from your soul..."
                                    className="w-full h-48 bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 text-sm outline-none focus:ring-4 focus:ring-primary/10 placeholder:text-foreground/20 resize-none transition-all scrollbar-hide text-foreground font-medium"
                                />
                                <Button className="w-full h-16 orange-gradient font-black text-white rounded-2xl shadow-2xl shadow-primary/20 tracking-[0.3em] uppercase text-[10px] hover:scale-[1.02] transition-all">
                                    Submit Gratitude
                                </Button>
                            </section>

                            <div className="glass bg-primary/[0.02] rounded-[3rem] p-10 space-y-6 border-primary/10 relative group overflow-hidden shadow-xl">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-4 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                                    <CheckCircle className="w-6 h-6" />
                                    <span>Vedic Accuracy</span>
                                </div>
                                <p className="text-sm text-foreground/40 leading-relaxed italic font-medium">
                                    "The conversation of stars is reflected in these lines. May this guidance illuminate your path through the darkness."
                                </p>
                            </div>

                            <Button variant="ghost" className="w-full h-16 rounded-2xl hover:bg-primary/5 text-foreground/20 font-black uppercase tracking-[0.4em] text-[10px] transition-all hover:text-primary" onClick={() => router.push('/user/dashboard')}>
                                Return to Dashboard
                            </Button>
                        </aside>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
