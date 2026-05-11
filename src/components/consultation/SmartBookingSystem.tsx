"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, ChevronDown, CheckCircle2 } from "lucide-react";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { toast } from "react-hot-toast";
import { createBooking } from "@/services/firestore";
import { sendBookingConfirmation, sendAstrologerAlert } from "@/services/email";
import { useRouter } from "@/i18n/navigation";

interface SmartBookingProps {
    astrologerId: string;
    astrologerName: string;
    astrologerEmail?: string;
    user: any;
    userData: any;
}

export const SmartBookingSystem = ({ astrologerId, astrologerName, astrologerEmail, user, userData }: SmartBookingProps) => {
    console.log("Rendering SmartBookingSystem for:", astrologerName);
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [selectedSlot, setSelectedSlot] = useState<string>("");
    const [duration, setDuration] = useState<string>("30");
    const [mode, setMode] = useState<"video" | "audio" | "chat">("video");
    const [loading, setLoading] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [fetchingSlots, setFetchingSlots] = useState(false);
    const [astrologerData, setAstrologerData] = useState<any>(null);

    // Generate next 14 days for dropdown
    const dates = Array.from({ length: 14 }, (_, i) => {
        const d = addDays(new Date(), i);
        return {
            label: format(d, "EEEE, MMMM do"),
            value: format(d, "yyyy-MM-dd")
        };
    });

    // Fetch astrologer data on mount
    useEffect(() => {
        const fetchAstro = async () => {
            const data = await getDoc(doc(db, "astrologers", astrologerId));
            if (data.exists()) setAstrologerData(data.data());
        };
        fetchAstro();
    }, [astrologerId]);

    // Generate slots based on availability
    useEffect(() => {
        const fetchSlots = async () => {
            setFetchingSlots(true);
            try {
                // Get availability settings
                const av = astrologerData?.availability || {
                    days: [0, 1, 2, 3, 4, 5, 6],
                    startTime: "10:00",
                    endTime: "20:00"
                };

                const dateObj = new Date(selectedDate);
                const dayOfWeek = dateObj.getDay();

                if (!av.days.includes(dayOfWeek)) {
                    setAvailableSlots([]);
                    return;
                }

                const slots: string[] = [];
                const [startH, startM] = av.startTime.split(":").map(Number);
                const [endH, endM] = av.endTime.split(":").map(Number);
                
                let current = startH * 60 + startM;
                const end = endH * 60 + endM;
                const dur = parseInt(duration);

                while (current <= end - dur) {
                    const hours = Math.floor(current / 60);
                    const minutes = current % 60;
                    const timeString = `${hours % 12 || 12}:${minutes === 0 ? "00" : (minutes < 10 ? "0" + minutes : minutes)} ${hours >= 12 ? "PM" : "AM"}`;
                    slots.push(timeString);
                    current += 30; // 30 min intervals for slot starts
                }
                setAvailableSlots(slots);
            } catch (e) {
                console.error("Error generating slots:", e);
            } finally {
                setFetchingSlots(false);
            }
        };

        if (astrologerData) {
            fetchSlots();
        }
    }, [selectedDate, duration, astrologerData]);

    const handleBookSession = async () => {
        if (!user || !userData) {
            toast.error("Please login to book a session");
            router.push("/login");
            return;
        }

        if (!selectedSlot) {
            toast.error("Please select a time slot");
            return;
        }

        setLoading(true);
        const bookingId = `book_${Math.random().toString(36).substring(2, 9)}`;

        try {
            await createBooking({
                id: bookingId,
                userId: user.uid,
                userName: user.displayName || userData?.displayName || "Seeker",
                userEmail: user.email || "",
                astrologerId,
                astrologerName,
                astrologerEmail: astrologerEmail || "",
                date: selectedDate,
                time: selectedSlot,
                duration: parseInt(duration),
                type: mode,
                status: "scheduled",
                paymentStatus: "completed",
                meetingLink: `/consult/${bookingId}`
            } as any);

            // Send Emails
            try {
                await sendBookingConfirmation({
                    userEmail: user.email,
                    userName: user.displayName || userData?.displayName || "Seeker",
                    astrologerName,
                    date: new Date(selectedDate),
                    time: selectedSlot,
                    bookingId,
                    amount: 0,
                    type: mode // Added type
                } as any);
                
                if (astrologerEmail) {
                    await sendAstrologerAlert({
                        astrologerEmail,
                        astrologerName,
                        userName: user.displayName || userData?.displayName || "Seeker",
                        date: new Date(selectedDate),
                        time: selectedSlot,
                        bookingId,
                        type: mode // Added type
                    } as any);
                }
            } catch (e) {
                console.error("Non-blocking email error:", e);
            }

            toast.success("Scheduled! Check your mail for invite.");
            setTimeout(() => router.push("/user/dashboard"), 2000);

        } catch (error) {
            console.error("Booking failed:", error);
            toast.error("Failed to schedule. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 space-y-6 shadow-2xl relative overflow-hidden max-w-md mx-auto">
            {/* Header */}
            <div className="space-y-1">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    Quick Booking
                </h3>
                <p className="text-xs text-zinc-500 font-medium">Schedule a professional video consultation</p>
            </div>

            {/* Dropdown Style Controls */}
            <div className="space-y-4">
                {/* Date Select */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Select Date
                    </label>
                    <div className="relative">
                        <select 
                            value={selectedDate}
                            onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(""); }}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-bold"
                        >
                            {dates.map((d) => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>
                </div>

                {/* Mode Select */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Video className="w-3 h-3" /> Consultation Mode
                    </label>
                    <div className="relative">
                        <select 
                            value={mode}
                            onChange={(e) => setMode(e.target.value as any)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-bold"
                        >
                            <option value="video">Video Call</option>
                            <option value="audio">Audio Call</option>
                            <option value="chat">Chat Session</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Duration Select */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-3 h-3" /> Duration
                        </label>
                        <div className="relative">
                            <select 
                                value={duration}
                                onChange={(e) => { setDuration(e.target.value); setSelectedSlot(""); }}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-bold"
                            >
                                <option value="30">30 Min</option>
                                <option value="60">60 Min</option>
                                <option value="90">90 Min</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* Time Select */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-3 h-3" /> Select Time
                        </label>
                        <div className="relative">
                            <select 
                                value={selectedSlot}
                                onChange={(e) => setSelectedSlot(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-bold"
                            >
                                <option value="" disabled>{fetchingSlots ? "Loading..." : "Choose Time"}</option>
                                {availableSlots.map((slot) => (
                                    <option key={slot} value={slot}>{slot}</option>
                                ))}
                                {availableSlots.length === 0 && !fetchingSlots && (
                                    <option disabled>No Slots Available</option>
                                )}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / Confirm */}
            <div className="pt-4 border-t border-zinc-800">
                <Button
                    onClick={handleBookSession}
                    disabled={!selectedSlot || loading}
                    className={`w-full h-14 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                        selectedSlot 
                        ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-xl shadow-orange-500/20 active:scale-[0.98]" 
                        : "bg-zinc-800 text-zinc-600"
                    }`}
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Video className="w-4 h-4" />
                            Book Session
                        </>
                    )}
                </Button>

                {selectedSlot && (
                    <p className="text-[10px] text-center text-zinc-500 mt-4 font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        Confirming for {format(new Date(selectedDate), "MMM do")} at {selectedSlot}
                    </p>
                )}
            </div>

            {/* Hint */}
            <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50 text-[9px] text-zinc-500 font-medium leading-tight">
                💡 <strong>How it works:</strong> After booking, a unique video link will be sent to your registered email. Both you and the Acharya can join using that link at the scheduled time.
            </div>
        </div>
    );
};
