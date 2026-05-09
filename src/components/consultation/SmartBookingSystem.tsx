"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ChevronRight, ChevronLeft, CheckCircle2, Video } from "lucide-react";
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
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [duration, setDuration] = useState<number>(30); // minutes
    const [loading, setLoading] = useState(false);

    // Generate next 14 days
    const dates = Array.from({ length: 14 }, (_, i) => addDays(startOfDay(new Date()), i));

    // Generate time slots from 10 AM to 8 PM
    const generateSlots = () => {
        const slots = [];
        let current = 10 * 60; // 10:00 AM in minutes
        const end = 20 * 60; // 08:00 PM in minutes

        while (current <= end - duration) {
            const hours = Math.floor(current / 60);
            const minutes = current % 60;
            const timeString = `${hours % 12 || 12}:${minutes === 0 ? "00" : minutes} ${hours >= 12 ? "PM" : "AM"}`;
            slots.push(timeString);
            current += 30; // 30-minute increments for slot start times
        }
        return slots;
    };

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
            // 1. Create Booking in Firestore
            await createBooking({
                id: bookingId,
                userId: user.uid,
                userName: user.displayName || userData?.displayName || "Seeker",
                userEmail: user.email || "",
                astrologerId,
                astrologerName,
                astrologerEmail: astrologerEmail || "",
                date: selectedDate.toISOString(),
                time: selectedSlot,
                duration,
                type: "video",
                status: "scheduled",
                paymentStatus: "completed",
                meetingLink: `/consult/${bookingId}`
            } as any);

            // 2. Send Emails (Non-blocking for UI)
            sendBookingConfirmation({
                userEmail: user.email,
                userName: user.displayName || userData?.displayName || "Seeker",
                astrologerName,
                date: selectedDate,
                time: selectedSlot,
                bookingId,
                amount: 0
            });

            if (astrologerEmail) {
                sendAstrologerAlert({
                    astrologerEmail,
                    astrologerName,
                    userName: user.displayName || userData?.displayName || "Seeker",
                    date: selectedDate,
                    time: selectedSlot,
                    bookingId
                });
            }

            toast.success("Session Scheduled! Check your email for the invite.", { duration: 5000 });
            setSelectedSlot(null);
            
            // Redirect to dashboard or success page
            setTimeout(() => {
                router.push("/user/dashboard");
            }, 2000);

        } catch (error) {
            console.error("Booking failed:", error);
            toast.error("Failed to schedule session. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 bg-zinc-900/50 border border-zinc-800 p-6 md:p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-orange-500" />
                        Schedule Session
                    </h3>
                    <p className="text-zinc-400 text-sm font-medium italic">Book a personalized consultation at your convenience</p>
                </div>
                
                {/* Duration Picker */}
                <div className="flex bg-zinc-800/50 p-1 rounded-xl border border-zinc-700/50 w-fit">
                    {[30, 60, 90].map((d) => (
                        <button
                            key={d}
                            onClick={() => { setDuration(d); setSelectedSlot(null); }}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                duration === d ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-zinc-500 hover:text-zinc-300"
                            }`}
                        >
                            {d}m
                        </button>
                    ))}
                </div>
            </div>

            {/* Date Strip */}
            <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Select Date</label>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
                    {dates.map((date, i) => (
                        <button
                            key={i}
                            onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                            className={`flex flex-col items-center min-w-[70px] p-4 rounded-2xl border transition-all duration-300 ${
                                isSameDay(selectedDate, date)
                                    ? "bg-orange-500 border-orange-400 shadow-xl shadow-orange-500/20 translate-y-[-4px]"
                                    : "bg-zinc-800/30 border-zinc-700/50 hover:border-zinc-500 text-zinc-400"
                            }`}
                        >
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${isSameDay(selectedDate, date) ? "text-orange-100" : "text-zinc-500"}`}>
                                {format(date, "EEE")}
                            </span>
                            <span className={`text-xl font-black mt-1 ${isSameDay(selectedDate, date) ? "text-white" : "text-zinc-200"}`}>
                                {format(date, "d")}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Time Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Available Slots</label>
                    <span className="text-[10px] text-zinc-500 font-medium">10:00 AM - 08:00 PM IST</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {generateSlots().map((slot, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-3 rounded-xl border text-[11px] font-bold transition-all ${
                                selectedSlot === slot
                                    ? "bg-white border-white text-zinc-950 shadow-xl shadow-white/10 scale-[1.02]"
                                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600"
                            }`}
                        >
                            {slot}
                        </button>
                    ))}
                </div>
            </div>

            {/* Confirmation Area */}
            <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-full">
                        <Video className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <div className="text-xs font-black text-zinc-500 uppercase tracking-widest">Selected Session</div>
                        <div className="text-sm font-bold text-white">
                            {selectedSlot ? `${format(selectedDate, "MMMM d")} at ${selectedSlot}` : "Select a time above"}
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleBookSession}
                    disabled={!selectedSlot || loading}
                    className={`h-14 px-10 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all ${
                        selectedSlot 
                        ? "bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/20" 
                        : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                    }`}
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Scheduling...
                        </div>
                    ) : (
                        "Confirm Booking"
                    )}
                </Button>
            </div>

            {/* Policy Note */}
            <div className="mt-4 flex items-center gap-2 text-[10px] text-zinc-500 font-medium bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
                <CheckCircle2 className="w-3 h-3 text-orange-500" />
                Both parties will receive email invites with the video link automatically.
            </div>
        </div>
    );
};
