"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { checkAvailability, createBooking } from "@/services/firestore";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface SchedulingModalProps {
    isOpen: boolean;
    onClose: () => void;
    astrologerId: string;
    astrologerName: string;
    price: number;
}

export function SchedulingModal({ isOpen, onClose, astrologerId, astrologerName, price }: SchedulingModalProps) {
    const { user } = useAuth();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [slots, setSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string>("");
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [bookingType, setBookingType] = useState<"video" | "audio" | "chat">("video");
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        if (date && isOpen) {
            const fetchSlots = async () => {
                setLoadingSlots(true);
                try {
                    const availableSlots = await checkAvailability(astrologerId, date);
                    setSlots(availableSlots);
                } catch (error) {
                    console.error("Error fetching slots:", error);
                    toast.error("Failed to load available slots");
                } finally {
                    setLoadingSlots(false);
                }
            };
            fetchSlots();
        }
    }, [date, astrologerId, isOpen]);

    const handleBook = async () => {
        if (!user) {
            toast.error("Please login to book a consultation");
            return;
        }
        if (!date || !selectedSlot) {
            toast.error("Please select a date and time");
            return;
        }

        setIsBooking(true);
        try {
            await createBooking({
                userId: user.uid,
                userName: user.displayName || "Seeker",
                userEmail: user.email || "",
                astrologerId,
                astrologerName,
                date: date,
                time: selectedSlot,
                type: bookingType,
                price
            });
            toast.success("Booking confirmed! Check your dashboard.");
            onClose();
        } catch (error) {
            console.error("Booking error:", error);
            toast.error("Failed to create booking");
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Schedule Consultation with {astrologerName}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Consultation Type</label>
                        <Select value={bookingType} onValueChange={(v: "video" | "audio" | "chat") => setBookingType(v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="video">Video Call</SelectItem>
                                <SelectItem value="audio">Audio Call</SelectItem>
                                <SelectItem value="chat">Chat</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Date</label>
                        <div className="border rounded-md p-2 flex justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                disabled={(date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                className="rounded-md border"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Available Slots</label>
                        {loadingSlots ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                        ) : slots.length > 0 ? (
                            <div className="grid grid-cols-4 gap-2">
                                {slots.map((slot) => (
                                    <Button
                                        key={slot}
                                        variant={selectedSlot === slot ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedSlot(slot)}
                                        className="text-xs"
                                    >
                                        {slot}
                                    </Button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No slots available for this date.</p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleBook} disabled={isBooking || !selectedSlot}>
                        {isBooking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Confirm Booking
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
