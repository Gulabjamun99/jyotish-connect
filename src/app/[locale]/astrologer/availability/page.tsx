"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "@/i18n/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckCircle2, Save, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const DAYS = [
    { label: "Sunday", value: 0 },
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 }
];

export default function AvailabilityPage() {
    const { user, userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [availability, setAvailability] = useState({
        days: [1, 2, 3, 4, 5], // Mon-Fri default
        startTime: "10:00",
        endTime: "20:00"
    });

    useEffect(() => {
        if (userData?.availability) {
            setAvailability(userData.availability);
        }
    }, [userData]);

    const handleToggleDay = (day: number) => {
        setAvailability(prev => ({
            ...prev,
            days: prev.days.includes(day)
                ? prev.days.filter(d => d !== day)
                : [...prev.days, day].sort()
        }));
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        const toastId = toast.loading("Syncing your schedule with the cosmos...");

        try {
            await updateDoc(doc(db, "astrologers", user.uid), {
                availability: availability
            });
            toast.success("Schedule Updated Successfully!", { id: toastId });
            setTimeout(() => router.push("/astrologer/dashboard"), 1500);
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Failed to update availability.", { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    if (authLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

    if (!user || userData?.role !== "astrologer") {
        router.push("/login?role=astrologer");
        return null;
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-white selection:bg-orange-500/30">
            <Navbar />

            <div className="container mx-auto px-4 py-12 max-w-3xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <button 
                            onClick={() => router.push("/astrologer/dashboard")}
                            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Console
                        </button>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Manage Availability</h1>
                        <p className="text-zinc-400 font-medium">Define your working hours and days for consultations.</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Working Days */}
                    <div className="glass bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Working Days</h3>
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">Select the days you are available for bookings</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {DAYS.map(day => (
                                <button
                                    key={day.value}
                                    onClick={() => handleToggleDay(day.value)}
                                    className={`h-14 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                                        availability.days.includes(day.value)
                                        ? "bg-orange-500/10 border-orange-500/50 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.1)]"
                                        : "bg-zinc-950 border-zinc-800 text-zinc-600 hover:border-zinc-700"
                                    }`}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Working Hours */}
                    <div className="glass bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Session Window</h3>
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">Define your daily start and end times</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Daily Start Time</label>
                                <input 
                                    type="time"
                                    value={availability.startTime}
                                    onChange={(e) => setAvailability(prev => ({ ...prev, startTime: e.target.value }))}
                                    className="w-full h-16 bg-zinc-950 border border-zinc-800 rounded-2xl px-6 text-xl font-black text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all [color-scheme:dark]"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Daily End Time</label>
                                <input 
                                    type="time"
                                    value={availability.endTime}
                                    onChange={(e) => setAvailability(prev => ({ ...prev, endTime: e.target.value }))}
                                    className="w-full h-16 bg-zinc-950 border border-zinc-800 rounded-2xl px-6 text-xl font-black text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                                <strong className="text-orange-500">Pro Tip:</strong> Setting a wider window allows more seekers to book sessions. Ensure you have a stable internet connection during these hours.
                            </p>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={saving || availability.days.length === 0}
                            className="w-full h-16 rounded-2xl bg-white text-black hover:bg-orange-500 hover:text-white font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Schedule
                                </>
                            )}
                        </Button>
                        <p className="text-center text-[10px] text-zinc-500 mt-6 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                            Changes are reflected instantly on your public profile
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
