import { useState, useEffect } from "react";
import { format, addDays, isSameDay, startOfToday } from "date-fns";
import { Calendar as CalendarIcon, Clock, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import { createBooking, checkAvailability, getAstrologerById } from "@/services/firestore";
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
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // UI States
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'select' | 'success'>('select');
    const [confirmedLink, setConfirmedLink] = useState<string>("");

    // Reset state on open
    useEffect(() => {
        if (isOpen && step === 'success') {
            setStep('select');
            setSelectedDate(startOfToday());
            setSelectedTime(null);
        }
    }, [isOpen]);

    // Fetch availability when date changes
    useEffect(() => {
        const fetchSlots = async () => {
            setLoadingSlots(true);
            setAvailableSlots([]); // Clear previous
            try {
                const slots = await checkAvailability(astrologerId, selectedDate);
                setAvailableSlots(slots);
            } catch (err) {
                console.error("Failed to fetch slots", err);
                setAvailableSlots([
                    "10:00", "10:30", "11:00", "11:30",
                    "14:00", "14:30", "15:00", "15:30", "16:00"
                ]);
            } finally {
                setLoadingSlots(false);
            }
        };
        if (isOpen && step === 'select') {
            fetchSlots();
        }
    }, [selectedDate, astrologerId, isOpen, step]);

    const days = Array.from({ length: 14 }, (_, i) => addDays(startOfToday(), i));

    const generateICSContent = (date: Date, time: string, link: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        const startDate = new Date(date);
        startDate.setHours(hours, minutes);
        const endDate = new Date(startDate.getTime() + 30 * 60000); // 30 mins duration

        const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//JyotishConnect//Consultation//EN
BEGIN:VEVENT
UID:${Date.now()}@jyotishconnect.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${consultationType.toUpperCase()} Session w/ ${astrologerName}
DESCRIPTION:Join via: ${link}
LOCATION:${link}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;
    };

    const triggerDownload = (content: string) => {
        const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.setAttribute('download', 'consultation-invite.ics');
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    const handleConfirm = async () => {
        if (!selectedDate || !selectedTime || !user || !userData) {
            if (!user) toast.error("Please login to book a consultation");
            return;
        }

        if (userData.walletBalance < price) {
            toast.error("Insufficient wallet balance. Please recharge first.");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Deduct Wallet & Create Booking in Firestore via API
            const bookingData = {
                userId: user.uid,
                astrologerId,
                astrologerName,
                date: selectedDate,
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
            if (!data.success) throw new Error(data.error);

            const bookingId = data.bookingId;
            const link = `https://jyotishconnect.com/consult/${bookingId}`;
            setConfirmedLink(link);
            const icsContent = generateICSContent(selectedDate, selectedTime, link);
            const formattedDate = format(selectedDate, "EEEE, MMMM d, yyyy");

            // 2. Send Emails (Dual Notification)
            // Fetch astrologer email first
            let astrologerEmail = "";
            try {
                const astroDoc = await getAstrologerById(astrologerId);
                if (astroDoc) astrologerEmail = astroDoc.email || "";
            } catch (e) { console.error("Failed to fetch astrologer email", e); }

            // Email to User (with ICS)
            if (user.email) {
                await fetch("/api/email/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        to: user.email,
                    })
                }).catch(e => console.warn("Email API trigger failed", e));
            }

            // 3. Auto-Download ICS & Change Step
            triggerDownload(icsContent);
            setStep('success');
            onSchedule(selectedDate, selectedTime);
            toast.success("Booking confirmed!");

        } catch (error) {
            console.error(error);
            toast.error("Failed to schedule. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-xl shadow-orange-500/20 rounded-2xl font-bold uppercase tracking-wider text-xs">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Schedule for Later
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-white/95 backdrop-blur-xl border-orange-100/50 shadow-2xl rounded-[2rem] p-0 overflow-hidden text-center">
                {step === 'select' ? (
                    <>
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 p-8 border-b border-orange-100 text-left">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black text-orange-900">
                                    Schedule Sacred Time
                                </DialogTitle>
                                <p className="text-sm text-orange-800/60 font-medium mt-2">
                                    Select a propitious moment for your {consultationType} session with <span className="text-orange-700 font-bold">{astrologerName}</span>.
                                </p>
                            </DialogHeader>
                        </div>

                        <div className="p-6 space-y-6 text-left">
                            {/* Date Selection */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-900/40">Select Date</label>
                                    <span className="text-[10px] font-bold text-orange-400">Next 14 Days</span>
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {days.map((date) => {
                                        const isSelected = isSameDay(date, selectedDate);
                                        const isBlocked = date.getDay() === 0;
                                        const isToday = isSameDay(date, new Date());
                                        return (
                                            <button
                                                key={date.toISOString()}
                                                disabled={isBlocked}
                                                onClick={() => {
                                                    setSelectedDate(date);
                                                    setSelectedTime(null);
                                                }}
                                                className={`group relative flex flex-col items-center py-3 rounded-xl border-2 transition-all duration-300 ${isSelected
                                                    ? "bg-orange-500 border-orange-500 text-white shadow-xl shadow-orange-500/20 z-10 scale-105"
                                                    : isBlocked
                                                        ? "bg-gray-50/50 border-gray-100/50 text-gray-300 cursor-not-allowed opacity-40 px-1"
                                                        : "bg-white border-orange-50 text-orange-900/40 hover:border-orange-200 hover:bg-orange-50/50"
                                                    }`}
                                            >
                                                {isToday && !isSelected && (
                                                    <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-orange-500 rounded-full m-1" title="Today" />
                                                )}
                                                <span className="text-[7px] font-black uppercase tracking-widest opacity-60 mb-0.5">{format(date, "EEE")}</span>
                                                <span className="text-sm font-black tracking-tight">{format(date, "d")}</span>
                                                {isToday && (
                                                    <span className={`text-[6px] font-bold uppercase mt-0.5 ${isSelected ? "text-white/60" : "text-orange-500"}`}>
                                                        {format(date, "MMM")}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Time Selection */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-900/40">Select Time (IST)</label>
                                    {loadingSlots && <Loader2 className="w-3 h-3 animate-spin text-orange-500" />}
                                </div>
                                {availableSlots.length === 0 && !loadingSlots ? (
                                    <div className="text-center py-8 text-orange-900/40 text-xs">No slots available.</div>
                                ) : (
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-40 overflow-y-auto pr-1 flex-scrollable scrollbar-thin">
                                        {availableSlots.map((time) => {
                                            const isSelected = selectedTime === time;
                                            return (
                                                <button
                                                    key={time}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${isSelected
                                                        ? "bg-orange-600 text-white border-orange-600"
                                                        : "bg-white border-orange-50 text-orange-900/50 hover:bg-orange-50"
                                                        }`}
                                                >
                                                    {time}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Confirm Button */}
                            {selectedDate && selectedTime && (
                                <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100/50 space-y-3 animate-in fade-in">
                                    <div className="flex flex-col gap-1">
                                        <div className="text-[9px] font-black text-orange-900/30 uppercase tracking-widest">Selected Slot</div>
                                        <div className="text-xs font-bold text-orange-900 flex items-center gap-2">
                                            <Check className="w-3 h-3 text-green-500" />
                                            {format(selectedDate, "EEE, MMM d")} at {selectedTime}
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleConfirm}
                                        disabled={isLoading}
                                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black h-12 rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-orange-600/10"
                                    >
                                        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm Booking"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="p-10 flex flex-col items-center animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <Check className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Booking Confirmed!</h2>
                        <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto">
                            We have sent a confirmation email to <strong>{user?.email}</strong>.
                        </p>

                        <div className="w-full space-y-3">
                            <Button
                                onClick={() => {
                                    const ics = generateICSContent(selectedDate, selectedTime!, confirmedLink);
                                    triggerDownload(ics);
                                }}
                                className="w-full bg-white border-2 border-orange-100 hover:border-orange-200 text-orange-700 font-bold h-12 rounded-xl"
                            >
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                Add to Calendar
                            </Button>

                            <Button
                                onClick={() => setIsOpen(false)}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold h-12 rounded-xl"
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
