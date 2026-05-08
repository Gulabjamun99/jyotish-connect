import { useState, useEffect } from "react";
import { format, addDays, isSameDay, startOfToday } from "date-fns";
import { Calendar as CalendarIcon, Clock, Check, Loader2, Sparkles, ChevronDown } from "lucide-react";
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

    // Next 30 days for dropdown
    const dateOptions = Array.from({ length: 30 }, (_, i) => addDays(startOfToday(), i));

    useEffect(() => {
        const fetchSlots = async () => {
            if (!isOpen || step !== 'select') return;
            setLoadingSlots(true);
            try {
                const slots = await checkAvailability(astrologerId, selectedDate);
                setAvailableSlots(slots.length > 0 ? slots : ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"]);
                setSelectedTime("");
            } catch (err) {
                setAvailableSlots(["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"]);
            } finally {
                setLoadingSlots(false);
            }
        };
        fetchSlots();
    }, [selectedDate, astrologerId, isOpen, step]);

    const handleConfirm = async () => {
        if (!selectedDate || !selectedTime || !user) {
            toast.error("Please select date and time");
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
                date: format(selectedDate, "EEE, MMM d, yyyy"),
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
            toast.success("Scheduled!");
        } catch (error: any) {
            toast.error(error.message || "Failed to schedule");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full h-14 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] gap-3">
                    <CalendarIcon className="w-4 h-4 text-orange-500" />
                    Pick a Schedule
                </Button>
            </DialogTrigger>
            <DialogContent 
                className="sm:max-w-[400px] p-0 overflow-hidden rounded-[2rem] shadow-2xl z-[9999]"
                style={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
            >
                {step === 'select' ? (
                    <div className="p-8 space-y-8" style={{ backgroundColor: '#09090b' }}>
                        {/* VERSION BANNER */}
                        <div className="bg-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-xl text-center border border-orange-500/30">
                            V3.0 Compact Dropdown Mode Active
                        </div>

                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-white">Book Your Time</h2>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Master {astrologerName.split(' ')[0]}</p>
                        </div>

                        {/* 1. Pick Date Dropdown */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest flex items-center gap-2">
                                <CalendarIcon className="w-3.5 h-3.5" /> 1. Select Date
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedDate.toISOString()}
                                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                    className="w-full h-14 bg-zinc-900 border border-white/5 rounded-xl px-5 text-sm font-bold text-white appearance-none focus:outline-none focus:border-orange-500/50 transition-all cursor-pointer"
                                    style={{ backgroundColor: '#18181b', color: 'white' }}
                                >
                                    {dateOptions.map((date) => (
                                        <option key={date.toISOString()} value={date.toISOString()} style={{ backgroundColor: '#09090b' }}>
                                            {format(date, "EEEE, d MMM")}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                            </div>
                        </div>

                        {/* 2. Pick Time Dropdown */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" /> 2. Select Time (IST)
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    className="w-full h-14 bg-zinc-900 border border-white/5 rounded-xl px-5 text-sm font-bold text-white appearance-none focus:outline-none focus:border-orange-500/50 transition-all cursor-pointer"
                                    style={{ backgroundColor: '#18181b', color: 'white' }}
                                >
                                    <option value="" disabled>--- Select Time Slot ---</option>
                                    {availableSlots.map((time) => (
                                        <option key={time} value={time} style={{ backgroundColor: '#09090b' }}>{time} IST</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                            </div>
                        </div>

                        {/* Confirm Button */}
                        <div className="pt-4 space-y-4">
                            <Button
                                disabled={!selectedTime || isLoading}
                                onClick={handleConfirm}
                                className="w-full h-16 bg-white text-black hover:bg-orange-600 hover:text-white rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Schedule"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="p-10 text-center space-y-6 flex flex-col items-center" style={{ backgroundColor: '#09090b' }}>
                        <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center text-green-500 border border-green-500/20">
                            <Check className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-white">Confirmed!</h2>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Mails sent to seeker and astrologer.</p>
                        </div>
                        <Button 
                            onClick={() => setIsOpen(false)}
                            className="w-full h-14 bg-zinc-900 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl border border-white/5"
                        >
                            Close
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
