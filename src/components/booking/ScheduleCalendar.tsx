import { useState, useEffect } from "react";
import { format, addDays, isSameDay, startOfToday } from "date-fns";
import { Calendar as CalendarIcon, Clock, Check, Loader2, ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import { checkAvailability } from "@/services/firestore";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface ScheduleCalendarProps {
    astrologerId: string;
    astrologerName: string;
    consultationType: "video" | "audio" | "chat";
    price: number;
    onSchedule: (date: Date, time: string) => void;
}

export function ScheduleCalendar({
    astrologerId,
    astrologerName,
    consultationType,
    price,
    onSchedule
}: ScheduleCalendarProps) {
    const { user, userData } = useAuth();
    const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'select' | 'success'>('select');

    // Generate 30 days
    const allDays = Array.from({ length: 30 }, (_, i) => addDays(startOfToday(), i));

    useEffect(() => {
        const fetchSlots = async () => {
            if (!isOpen || step !== 'select') return;
            setLoadingSlots(true);
            try {
                const slots = await checkAvailability(astrologerId, selectedDate);
                setAvailableSlots(slots);
                setSelectedTime("");
            } catch (err) {
                setAvailableSlots(["10:00", "11:30", "14:00", "16:30", "19:00", "21:00"]);
            } finally {
                setLoadingSlots(false);
            }
        };
        fetchSlots();
    }, [selectedDate, astrologerId, isOpen, step]);

    const handleConfirm = async () => {
        if (!selectedDate || !selectedTime || !user) {
            toast.error("Celestial alignment incomplete. Select date & time.");
            return;
        }

        setIsLoading(true);
        try {
            const bookingData = {
                userId: user.uid,
                userName: user.displayName || userData?.displayName || "Seeker",
                userEmail: user.email || "",
                astrologerId,
                astrologerName,
                date: selectedDate.toISOString(),
                time: selectedTime,
                type: consultationType,
                price
            };

            const res = await fetch("/api/wallet/pay", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.uid, astrologerId, amount: price, bookingData })
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error || "Portal connection failed");

            setStep('success');
            onSchedule(selectedDate, selectedTime);
            toast.success("Schedule Locked! Mails Dispatched.");
        } catch (error: any) {
            console.error("Booking Error:", error);
            toast.error(error.message || "Failed to schedule. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className="w-full h-14 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/50 text-zinc-400 hover:text-white rounded-2xl flex items-center justify-between px-6 transition-all group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="flex items-center gap-3 relative z-10">
                        <CalendarIcon className="w-5 h-5 text-orange-500" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">Schedule Session</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-orange-500 transition-colors relative z-10" />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] bg-zinc-950 border-white/5 text-white p-0 overflow-hidden rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.5)]">
                <AnimatePresence mode="wait">
                    {step === 'select' ? (
                        <div className="p-8 space-y-10">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black tracking-tighter text-white">Select Slot</h2>
                                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1.5">
                                        <Sparkles className="w-3 h-3" /> Consulting Master {astrologerName.split(' ')[0]}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-zinc-500" />
                                </div>
                            </div>

                            {/* Date Scroller - World Class Premium UI */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">Choose Date</label>
                                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1">
                                    {allDays.map((date) => {
                                        const isSelected = isSameDay(date, selectedDate);
                                        return (
                                            <button
                                                key={date.toISOString()}
                                                onClick={() => setSelectedDate(date)}
                                                className={`min-w-[64px] h-20 flex flex-col items-center justify-center rounded-2xl border transition-all duration-300 ${
                                                    isSelected 
                                                    ? "bg-white border-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.1)] scale-110" 
                                                    : "bg-zinc-900/50 border-white/5 text-zinc-500 hover:border-white/20"
                                                }`}
                                            >
                                                <span className={`text-[8px] font-black uppercase mb-1 ${isSelected ? 'text-zinc-600' : 'text-zinc-700'}`}>
                                                    {format(date, "EEE")}
                                                </span>
                                                <span className="text-lg font-black">{format(date, "d")}</span>
                                                <span className={`text-[7px] font-black uppercase mt-1 ${isSelected ? 'text-zinc-400' : 'text-zinc-800'}`}>
                                                    {format(date, "MMM")}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Time Select - Premium Dropdown */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">Select Time (IST)</label>
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                                    <select
                                        value={selectedTime}
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                        className="w-full h-16 bg-zinc-900 border border-white/5 rounded-2xl px-6 text-sm font-black text-white appearance-none focus:outline-none focus:border-white/20 transition-all cursor-pointer relative z-10"
                                    >
                                        <option value="" disabled>Select Time Slot</option>
                                        {availableSlots.map((time) => (
                                            <option key={time} value={time} className="bg-zinc-950 py-4">{time} IST</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none group-hover:text-white transition-colors z-20" />
                                </div>
                                {loadingSlots && (
                                    <div className="flex items-center gap-2 px-2">
                                        <Loader2 className="w-3 h-3 animate-spin text-orange-500" />
                                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Searching Cosmic Slots...</span>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="pt-6 border-t border-white/5">
                                <Button
                                    disabled={!selectedTime || isLoading}
                                    onClick={handleConfirm}
                                    className="w-full h-16 bg-white text-black hover:bg-orange-500 hover:text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all relative overflow-hidden"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Confirm Schedule <Check className="w-4 h-4" />
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center space-y-8 flex flex-col items-center justify-center min-h-[500px]">
                            <motion.div 
                                initial={{ scale: 0, rotate: -45 }} 
                                animate={{ scale: 1, rotate: 0 }}
                                className="w-24 h-24 bg-green-500/10 rounded-[2.5rem] flex items-center justify-center text-green-500 border border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.1)]"
                            >
                                <Check className="w-12 h-12" />
                            </motion.div>
                            <div className="space-y-3">
                                <h2 className="text-3xl font-black text-white tracking-tighter">Schedule Locked</h2>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] leading-relaxed">
                                    Vedic alignments confirmed. Mails have been dispatched to seeker and astrologer.
                                </p>
                            </div>
                            <Button 
                                onClick={() => setIsOpen(false)}
                                className="w-full h-14 bg-zinc-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl border border-white/5 hover:bg-zinc-800"
                            >
                                Dismiss
                            </Button>
                        </div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
