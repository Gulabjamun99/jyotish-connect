import { useState, useEffect } from "react";
import { format, addDays, isSameDay, startOfToday } from "date-fns";
import { Calendar as CalendarIcon, Clock, Check, Loader2, Sun, Sunset, Moon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [timeTab, setTimeTab] = useState<'morning' | 'afternoon' | 'evening'>('morning');

    // UI States
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'select' | 'success'>('select');
    const [confirmedLink, setConfirmedLink] = useState<string>("");

    useEffect(() => {
        if (isOpen && step === 'success') {
            setStep('select');
            setSelectedDate(startOfToday());
            setSelectedTime(null);
        }
    }, [isOpen]);

    useEffect(() => {
        const fetchSlots = async () => {
            setLoadingSlots(true);
            setAvailableSlots([]);
            try {
                const slots = await checkAvailability(astrologerId, selectedDate);
                setAvailableSlots(slots);
                
                // Auto-set tab based on available slots
                if (slots.some(s => parseInt(s) < 12)) setTimeTab('morning');
                else if (slots.some(s => parseInt(s) < 17)) setTimeTab('afternoon');
                else setTimeTab('evening');
            } catch (err) {
                console.error("Failed to fetch slots", err);
                setAvailableSlots(["09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "15:00", "16:00", "19:00", "20:00"]);
            } finally {
                setLoadingSlots(false);
            }
        };
        if (isOpen && step === 'select') {
            fetchSlots();
        }
    }, [selectedDate, astrologerId, isOpen, step]);

    const days = Array.from({ length: 14 }, (_, i) => addDays(startOfToday(), i));

    const getFilteredSlots = () => {
        if (timeTab === 'morning') return availableSlots.filter(s => parseInt(s) < 12);
        if (timeTab === 'afternoon') return availableSlots.filter(s => parseInt(s) >= 12 && parseInt(s) < 17);
        return availableSlots.filter(s => parseInt(s) >= 17);
    };

    const generateICSContent = (date: Date, time: string, link: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        const startDate = new Date(date);
        startDate.setHours(hours, minutes);
        const endDate = new Date(startDate.getTime() + 30 * 60000);
        const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        return `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//JyotishConnect//EN\nBEGIN:VEVENT\nUID:${Date.now()}@jc.com\nDTSTAMP:${formatDate(new Date())}\nDTSTART:${formatDate(startDate)}\nDTEND:${formatDate(endDate)}\nSUMMARY:Session w/ ${astrologerName}\nDESCRIPTION:Join: ${link}\nSTATUS:CONFIRMED\nEND:VEVENT\nEND:VCALENDAR`;
    };

    const handleConfirm = async () => {
        if (!selectedDate || !selectedTime || !user || !userData) {
            if (!user) toast.error("Please login to book");
            else if (!userData) toast.error("Profile loading...");
            else if (!selectedTime) toast.error("Select time");
            return;
        }

        setIsLoading(true);
        try {
            const bookingData = {
                userId: user.uid,
                userName: user.displayName || "Seeker",
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
            if (!data.success) throw new Error(data.error || "Server error");

            const bookingId = data.bookingId;
            const link = `https://jyotish-connect-nine.vercel.app/en/consult/${bookingId}?type=${consultationType}`;
            setConfirmedLink(link);

            await fetch("/api/email/booking-confirmation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.uid,
                    userName: user.displayName || "Seeker",
                    userEmail: user.email || "",
                    astrologerId,
                    astrologerName,
                    date: selectedDate.toISOString(),
                    time: selectedTime,
                    type: consultationType,
                    bookingId,
                    ics: generateICSContent(selectedDate, selectedTime, link)
                })
            }).catch(() => null);

            setStep('success');
            onSchedule(selectedDate, selectedTime);
            toast.success("Scheduled successfully!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to schedule. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full h-14 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">
                    <CalendarIcon className="w-4 h-4 mr-2 text-orange-500" />
                    Schedule for Later
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl bg-zinc-950 border-white/5 text-white p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
                <AnimatePresence mode="wait">
                    {step === 'select' ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-[600px]">
                            {/* Header */}
                            <div className="p-8 bg-zinc-900/50 border-b border-white/5">
                                <h2 className="text-2xl font-black tracking-tight text-white">Schedule Sacred Time</h2>
                                <p className="text-xs text-zinc-500 mt-2 font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-orange-500" /> {consultationType} with {astrologerName}
                                </p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                                {/* Date Grid */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Select Date</h3>
                                        <span className="text-[9px] font-bold text-orange-500/60 uppercase">Availability: High</span>
                                    </div>
                                    <div className="grid grid-cols-7 gap-2">
                                        {days.map((date) => {
                                            const isSelected = isSameDay(date, selectedDate);
                                            const isWeekend = date.getDay() === 0;
                                            return (
                                                <button
                                                    key={date.toISOString()}
                                                    onClick={() => setSelectedDate(date)}
                                                    className={`h-16 flex flex-col items-center justify-center rounded-2xl border transition-all ${isSelected
                                                        ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20"
                                                        : isWeekend ? "bg-zinc-900/20 border-white/5 text-zinc-700 opacity-50" : "bg-zinc-900 border-white/5 text-zinc-400 hover:border-white/20"
                                                        }`}
                                                >
                                                    <span className="text-[8px] font-black uppercase tracking-tighter">{format(date, "EEE")}</span>
                                                    <span className="text-sm font-black">{format(date, "d")}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Time Tabs */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Select Time (IST)</h3>
                                    <div className="flex gap-2 p-1 bg-zinc-900 rounded-2xl border border-white/5">
                                        {[
                                            { id: 'morning', label: 'Morning', icon: Sun },
                                            { id: 'afternoon', label: 'Afternoon', icon: Sunset },
                                            { id: 'evening', label: 'Evening', icon: Moon },
                                        ].map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setTimeTab(tab.id as any)}
                                                className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeTab === tab.id ? 'bg-zinc-800 text-white border border-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
                                            >
                                                <tab.icon className={`w-3 h-3 ${timeTab === tab.id ? 'text-orange-500' : 'text-zinc-600'}`} />
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Slot Grid */}
                                    {loadingSlots ? (
                                        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
                                    ) : getFilteredSlots().length > 0 ? (
                                        <div className="grid grid-cols-4 gap-2">
                                            {getFilteredSlots().map((time) => (
                                                <button
                                                    key={time}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={`h-11 rounded-xl border text-xs font-black transition-all ${selectedTime === time ? 'bg-white text-black border-white shadow-xl' : 'bg-zinc-900 border-white/5 text-zinc-400 hover:border-white/10'}`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl text-[10px] font-bold text-zinc-600 uppercase tracking-widest">No slots available for this period</div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-8 border-t border-white/5 bg-zinc-900/50 flex flex-col gap-4">
                                {selectedTime && (
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-green-500" />
                                            <span className="text-xs font-bold text-zinc-300">{format(selectedDate, "EEE, MMM d")} at {selectedTime} IST</span>
                                        </div>
                                        <span className="text-xs font-black text-orange-500">₹{price}</span>
                                    </div>
                                )}
                                <Button
                                    disabled={!selectedTime || isLoading}
                                    onClick={handleConfirm}
                                    className="w-full h-16 bg-white text-black hover:bg-orange-500 hover:text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Booking"}
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-12 text-center space-y-8 h-[600px] flex flex-col items-center justify-center">
                            <div className="w-24 h-24 bg-green-500/10 rounded-[2rem] flex items-center justify-center text-green-500 border border-green-500/20">
                                <Check className="w-12 h-12" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tight">Booking Confirmed!</h2>
                                <p className="text-sm text-zinc-500 mt-2 font-bold uppercase tracking-widest">Your sacred session is ready.</p>
                            </div>
                            <div className="w-full bg-zinc-900 border border-white/5 p-6 rounded-3xl space-y-4">
                                <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Confirmation sent to your email</p>
                                <Button 
                                    onClick={() => setIsOpen(false)}
                                    className="w-full h-14 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl"
                                >
                                    Done
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
