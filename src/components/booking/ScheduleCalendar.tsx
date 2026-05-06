import { useState, useEffect } from "react";
import { format, addDays, isSameDay, startOfToday } from "date-fns";
import { Calendar as CalendarIcon, Clock, Check, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import { checkAvailability } from "@/services/firestore";
import { useAuth } from "@/context/AuthContext";

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

    // Next 10 days for selection
    const days = Array.from({ length: 10 }, (_, i) => addDays(startOfToday(), i));

    useEffect(() => {
        const fetchSlots = async () => {
            if (!isOpen || step !== 'select') return;
            setLoadingSlots(true);
            try {
                const slots = await checkAvailability(astrologerId, selectedDate);
                setAvailableSlots(slots);
                if (slots.length > 0) setSelectedTime(""); // Reset time when date changes
            } catch (err) {
                setAvailableSlots(["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "19:00", "20:00"]);
            } finally {
                setLoadingSlots(false);
            }
        };
        fetchSlots();
    }, [selectedDate, astrologerId, isOpen, step]);

    const handleConfirm = async () => {
        if (!selectedDate || !selectedTime || !user) {
            toast.error("Please select both date and time");
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
            if (!data.success) throw new Error(data.error || "Booking failed");

            setStep('success');
            onSchedule(selectedDate, selectedTime);
            toast.success("Scheduled successfully!");
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full h-12 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-white rounded-xl font-bold uppercase tracking-widest text-[10px]">
                    <CalendarIcon className="w-4 h-4 mr-2 text-orange-500" />
                    Schedule for Later
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] bg-zinc-950 border-white/5 text-white p-0 overflow-hidden rounded-3xl shadow-2xl">
                {step === 'select' ? (
                    <div className="p-8 space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-xl font-black text-white">Schedule Session</h2>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Select date and time for consultation</p>
                        </div>

                        {/* Date Picker - Minimal Grid */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                                <CalendarIcon className="w-3 h-3" /> 1. Choose Date
                            </label>
                            <div className="grid grid-cols-5 gap-2">
                                {days.map((date) => {
                                    const isSelected = isSameDay(date, selectedDate);
                                    return (
                                        <button
                                            key={date.toISOString()}
                                            onClick={() => setSelectedDate(date)}
                                            className={`h-12 flex flex-col items-center justify-center rounded-xl border transition-all ${
                                                isSelected 
                                                ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20" 
                                                : "bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/20"
                                            }`}
                                        >
                                            <span className="text-[7px] font-black uppercase opacity-60">{format(date, "EEE")}</span>
                                            <span className="text-xs font-black">{format(date, "d")}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Time Picker - Dropdown */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                                <Clock className="w-3 h-3" /> 2. Choose Time (IST)
                            </label>
                            <div className="relative group">
                                <select
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    className="w-full h-14 bg-zinc-900 border border-white/5 rounded-2xl px-6 text-sm font-black text-white appearance-none focus:outline-none focus:border-orange-500/50 transition-all cursor-pointer group-hover:border-white/10"
                                >
                                    <option value="" disabled className="bg-zinc-900">Select Time Slot</option>
                                    {availableSlots.map((time) => (
                                        <option key={time} value={time} className="bg-zinc-900 py-4">{time} IST</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none group-hover:text-orange-500 transition-colors" />
                            </div>
                            {loadingSlots && <p className="text-[9px] text-orange-500 animate-pulse font-bold uppercase">Updating slots...</p>}
                        </div>

                        {/* Action Button */}
                        <Button
                            disabled={!selectedTime || isLoading}
                            onClick={handleConfirm}
                            className="w-full h-16 bg-white text-black hover:bg-orange-500 hover:text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Schedule"}
                        </Button>
                    </div>
                ) : (
                    <div className="p-12 text-center space-y-8">
                        <div className="w-20 h-20 bg-green-500/10 rounded-3xl mx-auto flex items-center justify-center text-green-500 border border-green-500/20">
                            <Check className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-white">All Set!</h2>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Meeting links have been sent to you and {astrologerName}.</p>
                        </div>
                        <Button 
                            onClick={() => setIsOpen(false)}
                            className="w-full h-14 bg-zinc-900 text-white font-bold uppercase tracking-widest text-[10px] rounded-2xl"
                        >
                            Close
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
