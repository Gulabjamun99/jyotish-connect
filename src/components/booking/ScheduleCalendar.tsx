import { useState, useEffect } from "react";
import { format, addDays, isSameDay, startOfToday } from "date-fns";
import { Calendar as CalendarIcon, Clock, Check, Loader2, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
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
    
    // Calendar Pagination (Next 30 days)
    const [startIndex, setStartIndex] = useState(0);
    const totalDays = 30; // Increased to 30 days
    const daysPerPage = 10;
    const allDays = Array.from({ length: totalDays }, (_, i) => addDays(startOfToday(), i));
    const visibleDays = allDays.slice(startIndex, startIndex + daysPerPage);

    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'select' | 'success'>('select');

    useEffect(() => {
        const fetchSlots = async () => {
            if (!isOpen || step !== 'select') return;
            setLoadingSlots(true);
            try {
                const slots = await checkAvailability(astrologerId, selectedDate);
                setAvailableSlots(slots);
                setSelectedTime(""); // Reset time on date change
            } catch (err) {
                // Fallback slots for testing
                setAvailableSlots(["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"]);
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
            toast.success("Successfully Scheduled!");
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
            <DialogContent className="sm:max-w-[420px] bg-zinc-950 border-white/5 text-white p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
                {step === 'select' ? (
                    <div className="p-8 space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-xl font-black text-white">Select a Slot</h2>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Consultation with {astrologerName}</p>
                        </div>

                        {/* Date Picker - Compact Grid with Navigation */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest flex items-center gap-2">
                                    <CalendarIcon className="w-3 h-3" /> 1. Select Date
                                </label>
                                <div className="flex gap-1">
                                    <button 
                                        disabled={startIndex === 0}
                                        onClick={() => setStartIndex(Math.max(0, startIndex - daysPerPage))}
                                        className="p-1 hover:text-orange-500 disabled:opacity-20 transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button 
                                        disabled={startIndex + daysPerPage >= totalDays}
                                        onClick={() => setStartIndex(Math.min(totalDays - daysPerPage, startIndex + daysPerPage))}
                                        className="p-1 hover:text-orange-500 disabled:opacity-20 transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-5 gap-2">
                                {visibleDays.map((date) => {
                                    const isSelected = isSameDay(date, selectedDate);
                                    return (
                                        <button
                                            key={date.toISOString()}
                                            onClick={() => setSelectedDate(date)}
                                            className={`h-14 flex flex-col items-center justify-center rounded-xl border transition-all ${
                                                isSelected 
                                                ? "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/20" 
                                                : "bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/20"
                                            }`}
                                        >
                                            <span className="text-[7px] font-black uppercase opacity-60 mb-0.5">{format(date, "EEE")}</span>
                                            <span className="text-sm font-black">{format(date, "d")}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Time Picker - Simple Dropdown */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest flex items-center gap-2">
                                <Clock className="w-3 h-3" /> 2. Select Time (IST)
                            </label>
                            <div className="relative group">
                                <select
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    className="w-full h-14 bg-zinc-900 border border-white/5 rounded-2xl px-6 text-sm font-black text-white appearance-none focus:outline-none focus:border-orange-500/50 transition-all cursor-pointer hover:border-white/10"
                                >
                                    <option value="" disabled>Choose a time slot</option>
                                    {availableSlots.map((time) => (
                                        <option key={time} value={time}>{time} IST</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none group-hover:text-orange-500 transition-colors" />
                            </div>
                            {loadingSlots && <p className="text-[8px] text-orange-500 animate-pulse font-bold uppercase tracking-widest">Finding available slots...</p>}
                        </div>

                        {/* Action Button */}
                        <Button
                            disabled={!selectedTime || isLoading}
                            onClick={handleConfirm}
                            className="w-full h-16 bg-white text-black hover:bg-orange-600 hover:text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all shadow-xl shadow-white/5"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Schedule Consultation"}
                        </Button>
                    </div>
                ) : (
                    <div className="p-12 text-center space-y-8 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center text-green-500 border border-green-500/20">
                            <Check className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-white">Confirmed!</h2>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Emails have been sent to you and {astrologerName.split(' ')[0]}.</p>
                        </div>
                        <Button 
                            onClick={() => setIsOpen(false)}
                            className="w-full h-14 bg-zinc-900 text-white font-bold uppercase tracking-widest text-[10px] rounded-2xl border border-white/5"
                        >
                            Back to Profile
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
