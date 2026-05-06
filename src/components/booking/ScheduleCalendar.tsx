import { useState, useEffect } from "react";
import { format, addDays, isSameDay, startOfToday } from "date-fns";
import { Calendar as CalendarIcon, Clock, Check, Loader2, Sun, Sunset, Moon } from "lucide-react";
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
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [timeTab, setTimeTab] = useState<'morning' | 'afternoon' | 'evening'>('morning');

    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'select' | 'success'>('select');

    // Calendar Days (Next 14 days in a simple grid)
    const calendarDays = Array.from({ length: 14 }, (_, i) => addDays(startOfToday(), i));

    useEffect(() => {
        const fetchSlots = async () => {
            if (!isOpen || step !== 'select') return;
            setLoadingSlots(true);
            try {
                const slots = await checkAvailability(astrologerId, selectedDate);
                setAvailableSlots(slots);
                if (slots.some(s => parseInt(s) < 12)) setTimeTab('morning');
                else if (slots.some(s => parseInt(s) < 17)) setTimeTab('afternoon');
                else if (slots.length > 0) setTimeTab('evening');
            } catch (err) {
                console.error("Slot fetch failed", err);
                setAvailableSlots(["10:00", "11:00", "14:00", "15:00", "16:00", "19:00", "20:00"]);
            } finally {
                setLoadingSlots(false);
            }
        };
        fetchSlots();
    }, [selectedDate, astrologerId, isOpen, step]);

    const handleConfirm = async () => {
        if (!selectedDate || !selectedTime || !user) {
            toast.error("Please login and select a slot");
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
                body: JSON.stringify({
                    userId: user.uid,
                    astrologerId,
                    amount: price,
                    bookingData
                })
            });

            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || "Booking failed on server");
            }

            setStep('success');
            onSchedule(selectedDate, selectedTime);
            toast.success("Successfully Scheduled!");
        } catch (error: any) {
            console.error("Booking Failure:", error);
            toast.error(error.message || "Failed to schedule. Try again.");
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
            <DialogContent className="sm:max-w-md bg-zinc-950 border-white/5 text-white p-0 overflow-hidden rounded-[2rem] shadow-2xl">
                <AnimatePresence mode="wait">
                    {step === 'select' ? (
                        <div className="flex flex-col h-[600px]">
                            {/* Header */}
                            <div className="p-6 bg-zinc-900/50 border-b border-white/5">
                                <h2 className="text-lg font-black text-white">Select a Date & Time</h2>
                                <p className="text-[9px] text-zinc-500 mt-1 uppercase tracking-widest font-bold">Consultation with {astrologerName}</p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                                {/* Date Selection Grid */}
                                <div className="space-y-4">
                                    <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-600 flex items-center gap-2">
                                        <CalendarIcon className="w-3 h-3" /> Select Date
                                    </h3>
                                    <div className="grid grid-cols-7 gap-1.5">
                                        {calendarDays.map((date) => {
                                            const isSelected = isSameDay(date, selectedDate);
                                            const isToday = isSameDay(date, new Date());
                                            return (
                                                <button
                                                    key={date.toISOString()}
                                                    onClick={() => {
                                                        setSelectedDate(date);
                                                        setSelectedTime(null);
                                                    }}
                                                    className={`aspect-square flex flex-col items-center justify-center rounded-xl border transition-all ${
                                                        isSelected 
                                                        ? "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/20" 
                                                        : "bg-zinc-900 border-white/5 text-zinc-400 hover:border-white/20"
                                                    }`}
                                                >
                                                    <span className="text-[7px] font-black uppercase mb-0.5 opacity-60">{format(date, "EEE")}</span>
                                                    <span className="text-xs font-black">{format(date, "d")}</span>
                                                    {isToday && !isSelected && <div className="w-1 h-1 bg-orange-500 rounded-full mt-1" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Time Selection Section */}
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-600 flex items-center gap-2">
                                            <Clock className="w-3 h-3" /> Select Time (IST)
                                        </h3>
                                        <div className="flex gap-1 p-0.5 bg-zinc-900 rounded-lg border border-white/5">
                                            {[
                                                { id: 'morning', icon: Sun },
                                                { id: 'afternoon', icon: Sunset },
                                                { id: 'evening', icon: Moon },
                                            ].map((tab) => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setTimeTab(tab.id as any)}
                                                    className={`p-1.5 rounded-md transition-all ${timeTab === tab.id ? 'bg-zinc-800 text-orange-500' : 'text-zinc-600 hover:text-zinc-400'}`}
                                                >
                                                    <tab.icon className="w-3.5 h-3.5" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {loadingSlots ? (
                                        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
                                    ) : (
                                        <div className="grid grid-cols-4 gap-2">
                                            {availableSlots.filter(s => {
                                                const hour = parseInt(s);
                                                if (timeTab === 'morning') return hour < 12;
                                                if (timeTab === 'afternoon') return hour >= 12 && hour < 17;
                                                return hour >= 17;
                                            }).map((time) => (
                                                <button
                                                    key={time}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={`h-10 rounded-xl border text-[10px] font-black transition-all ${
                                                        selectedTime === time 
                                                        ? "bg-white text-black border-white shadow-xl" 
                                                        : "bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/20"
                                                    }`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                            {availableSlots.length === 0 && <p className="col-span-4 text-center py-6 text-[9px] font-black text-zinc-700 uppercase tracking-widest">No slots available</p>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer / Confirm */}
                            <div className="p-6 bg-zinc-900/50 border-t border-white/5 space-y-4">
                                {selectedTime && (
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                                                {format(selectedDate, "EEE, MMM d")} • {selectedTime}
                                            </span>
                                        </div>
                                        <span className="text-xs font-black text-orange-500">₹{price}</span>
                                    </div>
                                )}
                                <Button
                                    disabled={!selectedTime || isLoading}
                                    onClick={handleConfirm}
                                    className="w-full h-14 bg-white text-black hover:bg-orange-500 hover:text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-white/5"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Booking"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center space-y-8 flex flex-col items-center justify-center h-[600px]">
                            <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center text-green-500 border border-green-500/20">
                                <Check className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black text-white tracking-tight">Booking Confirmed!</h2>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">A calendar invite has been sent to your email.</p>
                            </div>
                            <Button 
                                onClick={() => setIsOpen(false)}
                                className="w-full h-14 bg-zinc-900 text-white font-bold uppercase tracking-widest text-[10px] rounded-2xl border border-white/5"
                            >
                                Great, Thanks!
                            </Button>
                        </div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
