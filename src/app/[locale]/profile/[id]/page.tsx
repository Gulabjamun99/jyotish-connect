"use client";

import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle, Languages, ShieldCheck, Heart, Share2, Video, Clock } from "lucide-react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { toast } from "react-hot-toast";
import { initiatePayment } from "@/services/payment";
import { useState, useEffect } from "react";
import { getAstrologerById, createBooking } from "@/services/firestore";
import { ScheduleCalendar } from "@/components/booking/ScheduleCalendar";

export default function ProfilePage() {
    const { user, userData } = useAuth();
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [consultationType, setConsultationType] = useState<"video" | "audio" | "chat">("video");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getAstrologerById(id);
                if (!data) {
                    toast.error("Astrologer not found");
                    router.push("/search");
                    return;
                }
                // Map Firestore data to profile format
                setProfile({
                    id: data.id,
                    name: data.displayName || "Unknown",
                    email: data.email, // Added email
                    expertise: data.specializations?.[0] || "Astrology",
                    languages: data.languages || ["English"],
                    rating: data.rating || 5.0,
                    reviews: data.consultations || 0,
                    price: data.consultationRate || 50,
                    image: data.photoURL || "/placeholder-avatar.png",
                    verified: data.verified || false,
                    bio: data.bio || "Experienced astrologer ready to guide you.",
                    online: data.online || true,
                    experience: data.experience || 0,
                    education: data.education || "",
                    specializations: data.specializations || [],
                    // Pricing by consultation type
                    pricing: {
                        video: data.consultationRate || 50,
                        audio: Math.round((data.consultationRate || 50) * 0.7), // 30% discount for audio
                        chat: Math.round((data.consultationRate || 50) * 0.5)   // 50% discount for chat
                    }
                });
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("Failed to load astrologer profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id, router]);

    const getCurrentPrice = () => {
        if (!profile) return 0;
        return profile.pricing?.[consultationType] || profile.price;
    };

    const handleBooking = async () => {
        if (!user || !userData) {
            toast.error("Please login to book a session");
            router.push("/login");
            return;
        }

        if (!profile) return;

        // Check if Profile Complete
        if (!userData.profileComplete) {
            toast.error("Please complete your seeker profile first");
            router.push("/user/profile/edit");
            return;
        }

        const currentPrice = getCurrentPrice();
        const bookingData = {
            userId: user.uid,
            astrologerId: profile.id,
            astrologerName: profile.name,
            date: new Date(),
            time: "Instant",
            type: consultationType,
            price: currentPrice
        };

        try {
            // Option A: Pay via Wallet (Preferred) - FORCED TRUE FOR FREE TESTING
            if (true || userData.walletBalance >= currentPrice) {
                toast.loading("Processing free test booking...", { id: 'booking' });
                
                // CLIENT-SIDE DIRECT BOOKING FOR FREE TESTING BYPASS
                const newBooking = await createBooking({
                    ...bookingData,
                    paymentMode: 'wallet'
                } as any);

                toast.success("Free Booking Created! Connecting...", { id: 'booking' });
                router.push(`/consult/${newBooking.id}?type=${consultationType}`);
                return;
            }

            // Option B: Pay via Razorpay (Fallback)
            toast.error("Insufficient wallet balance. Redirecting to Payment Gateway.", { duration: 4000 });

            initiatePayment({
                amount: currentPrice,
                name: `Consultation with ${profile.name}`,
                description: `${consultationType} specific consultation`,
                user: {
                    name: user.displayName || "User",
                    email: user.email,
                    contact: user.phoneNumber || "9999999999"
                },
                onSuccess: async (response: any) => {
                    // SERVER-SIDE VERIFICATION & BOOKING CREATION
                    try {
                        toast.loading("Verifying payment...", { id: 'booking' });

                        const verifyRes = await fetch("/api/payment/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                bookingData
                            })
                        });

                        const verifyData = await verifyRes.json();

                        if (!verifyData.success) {
                            throw new Error(verifyData.message || "Verification Failed");
                        }

                        toast.success("Payment verified! Session confirmed.", { id: 'booking' });
                        router.push(`/consult/${verifyData.bookingId}?type=${consultationType}`);
                    } catch (error: any) {
                        console.error("Payment Verification Failed:", error);
                        toast.error("Payment failed verification.", { id: 'booking' });
                    }
                }
            });

        } catch (error: any) {
            console.error("Payment failed:", error);
            toast.error(`Payment failed: ${error.message || "Something went wrong"}`, { id: 'booking' });
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen">
                <Navbar />
                <div className="container mx-auto px-4 py-12 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-muted-foreground">Loading profile...</p>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-slate-50 selection:bg-orange-500/30 font-sans pb-24 md:pb-0">
            <Navbar />

            {/* HERO SECTION */}
            <div className="relative w-full bg-zinc-900 border-b border-white/5 pt-10 pb-20 md:pt-16 md:pb-28 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-full md:w-[800px] h-full bg-gradient-to-l from-orange-500/10 to-transparent" />
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/20 blur-[120px] rounded-full" />
                </div>

                <div className="container mx-auto px-4 md:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start text-center md:text-left">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-zinc-800 shadow-2xl relative z-10">
                                <img src={profile.image} alt={profile.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            {profile.online && (
                                <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-green-500/30 text-green-500 text-[10px] font-black uppercase tracking-widest backdrop-blur-md z-20 shadow-xl">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                                    Online
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-4 md:pt-4">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
                                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">{profile.name}</h1>
                                {profile.verified && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-green-500 text-[10px] font-bold uppercase tracking-widest">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Verified Astrologer
                                    </div>
                                )}
                            </div>

                            <p className="text-xl md:text-2xl text-orange-400 font-semibold">{profile.expertise}</p>

                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-8 pt-2">
                                <div className="flex items-center gap-2">
                                    <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-black text-2xl text-white">{profile.rating}</span>
                                        <span className="text-zinc-500 font-medium text-sm">/ 5 ({profile.reviews} reviews)</span>
                                    </div>
                                </div>
                                <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-zinc-800" />
                                <div className="flex items-center gap-2 text-zinc-400 font-medium">
                                    <Clock className="w-5 h-5 text-zinc-500" />
                                    {profile.experience} Years Exp.
                                </div>
                                <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-zinc-800" />
                                <div className="flex items-center gap-2 text-zinc-400 font-medium">
                                    <Languages className="w-5 h-5 text-zinc-500" />
                                    {profile.languages.join(", ")}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-6">
                                <Button variant="outline" className="rounded-xl border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 gap-2 h-12 px-6">
                                    <Heart className="w-4 h-4" /> Save
                                </Button>
                                <Button variant="outline" className="rounded-xl border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 gap-2 h-12 px-6">
                                    <Share2 className="w-4 h-4" /> Share Profile
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* LEFT COLUMN: ABOUT & REVIEWS */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-12">

                        {/* Expertise Cloud */}
                        <section className="space-y-6">
                            <h2 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-4">
                                Area of Expertise
                                <div className="h-px flex-1 bg-zinc-800" />
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {profile.specializations.map((spec: string, i: number) => (
                                    <span key={i} className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg text-sm font-semibold tracking-wide">
                                        {spec}
                                    </span>
                                ))}
                            </div>
                        </section>

                        {/* Bio */}
                        <section className="space-y-6">
                            <h2 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-4">
                                About {profile.name.split(' ')[0]}
                                <div className="h-px flex-1 bg-zinc-800" />
                            </h2>
                            <div className="bg-zinc-900/50 border border-zinc-800/50 p-8 rounded-3xl">
                                <p className="text-zinc-300 leading-relaxed text-lg">
                                    {profile.bio}
                                </p>
                                {profile.education && (
                                    <div className="mt-8 pt-8 border-t border-zinc-800/50">
                                        <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Education & Certifications</p>
                                        <p className="font-semibold text-zinc-200">{profile.education}</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Reviews */}
                        <section className="space-y-6">
                            <h2 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-4">
                                Celestial Feedback
                                <div className="h-px flex-1 bg-zinc-800" />
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { name: "Amit K.", date: "2 days ago", comment: "Very accurate and helpful session. Explained everything in detail and provided simple remedies. Highly recommended!" },
                                    { name: "Priya S.", date: "1 week ago", comment: "The tarot reading was spot on. I got clarity on my career path and feel much more confident now." },
                                    { name: "Rahul V.", date: "2 weeks ago", comment: "Excellent Kundli matching analysis. Answered all our doubts patiently." },
                                    { name: "Neha G.", date: "1 month ago", comment: "Felt very positive after the session. Guided me perfectly through a tough phase." }
                                ].map((review, i) => (
                                    <div key={i} className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, j) => (
                                                    <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-600">{review.date}</span>
                                        </div>
                                        <p className="text-zinc-400 text-sm leading-relaxed italic">"{review.comment}"</p>
                                        <p className="font-black text-xs text-zinc-200 uppercase tracking-wider">{review.name}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN: BOOKING CARD */}
                    <aside className="lg:col-span-5 xl:col-span-4">
                        <div className="glass bg-zinc-900/80 p-8 rounded-[2rem] sticky top-24 space-y-8 border border-white/5 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-red-500" />

                            {/* Consultation Type Selector */}
                            <div className="space-y-4">
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Select Connect Mode</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={() => setConsultationType("video")}
                                        className={`relative p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 ${consultationType === "video"
                                            ? "border-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.1)]"
                                            : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                                            }`}
                                    >
                                        <Video className={`w-6 h-6 ${consultationType === "video" ? "text-orange-500" : "text-zinc-500"}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${consultationType === "video" ? "text-orange-500" : "text-zinc-500"}`}>
                                            Video
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setConsultationType("audio")}
                                        className={`relative p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 ${consultationType === "audio"
                                            ? "border-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.1)]"
                                            : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                                            }`}
                                    >
                                        <svg className={`w-6 h-6 ${consultationType === "audio" ? "text-orange-500" : "text-zinc-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        </svg>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${consultationType === "audio" ? "text-orange-500" : "text-zinc-500"}`}>
                                            Audio
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setConsultationType("chat")}
                                        className={`relative p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 ${consultationType === "chat"
                                            ? "border-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.1)]"
                                            : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                                            }`}
                                    >
                                        <svg className={`w-6 h-6 ${consultationType === "chat" ? "text-orange-500" : "text-zinc-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${consultationType === "chat" ? "text-orange-500" : "text-zinc-500"}`}>
                                            Chat
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="bg-black/20 rounded-2xl p-6 border border-white/5 flex justify-between items-center">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Consultation Fee</p>
                                    <div className="flex flex-col">
                                        {consultationType !== "video" && (
                                            <span className="text-xs text-zinc-500 line-through">₹{profile.pricing?.video} / session</span>
                                        )}
                                        <span className="text-3xl font-black text-white tracking-tight">₹{getCurrentPrice()}<span className="text-sm text-zinc-500 font-bold"> / session</span></span>
                                    </div>
                                </div>
                                {consultationType !== "video" && (
                                    <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest">
                                        Save {Math.round(((profile.pricing?.video - getCurrentPrice()) / profile.pricing?.video) * 100)}%
                                    </div>
                                )}
                            </div>

                            {/* Features */}
                            <div className="space-y-4 py-2 border-y border-white/5">
                                <div className="flex items-center gap-4 text-sm font-medium text-zinc-300">
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-zinc-400" />
                                    </div>
                                    Full 90 Minutes Session
                                </div>
                                <div className="flex items-center gap-4 text-sm font-medium text-zinc-300">
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                        <ShieldCheck className="w-4 h-4 text-zinc-400" />
                                    </div>
                                    Secure & Private Rooms
                                </div>
                            </div>

                            {/* Scheduling Block (Mobile & Desktop) */}
                            <div className="space-y-4 pt-2 pb-24 md:pb-0">
                                {profile.online ? (
                                    <>
                                        {/* Desktop-only Connect Instantly button (Mobile uses sticky footer) */}
                                        <div className="hidden md:block">
                                            <Button
                                                onClick={handleBooking}
                                                className="w-full h-16 text-sm font-black uppercase tracking-[0.2em] bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-[0_0_30px_rgba(249,115,22,0.15)] hover:shadow-[0_0_40px_rgba(249,115,22,0.3)] transition-all rounded-2xl"
                                            >
                                                Connect Instantly
                                            </Button>
                                        </div>
                                        <div className="relative pt-4 md:pt-2">
                                            <div className="absolute inset-0 flex items-center">
                                                <span className="w-full border-t border-zinc-800" />
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
                                                <span className="bg-zinc-900 px-4 text-zinc-600">Or Book Later</span>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-black/20 border border-white/5 rounded-2xl mt-4">
                                            <ScheduleCalendar
                                                astrologerId={profile.id}
                                                astrologerName={profile.name}
                                                consultationType={consultationType}
                                                price={getCurrentPrice()}
                                                onSchedule={(date, time) => {
                                                    toast.success("Scheduled! Check your dashboard.");
                                                }}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-4 bg-black/20 border border-white/5 rounded-2xl space-y-4">
                                        <p className="text-center text-xs font-black text-amber-500 uppercase tracking-widest">Astrologer Offline. Book a slot below.</p>
                                        <ScheduleCalendar
                                            astrologerId={profile.id}
                                            astrologerName={profile.name}
                                            consultationType={consultationType}
                                            price={getCurrentPrice()}
                                            onSchedule={(date, time) => {
                                                toast.success("Scheduled! Check your dashboard.");
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Mobile Sticky Action */}
                            <div className="fixed bottom-0 left-0 w-full p-4 bg-zinc-950/80 backdrop-blur-xl border-t border-white/5 md:hidden z-50 flex items-center justify-between gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total</span>
                                    <span className="text-xl font-black text-white">₹{getCurrentPrice()}</span>
                                </div>
                                <Button
                                    onClick={handleBooking}
                                    disabled={!profile.online}
                                    className="h-14 flex-1 text-sm font-black uppercase tracking-widest bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-xl shadow-orange-500/20 rounded-xl"
                                >
                                    Buy Session
                                </Button>
                            </div>

                            <p className="text-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest hidden md:block mt-8">
                                Payments Secured by Razorpay
                            </p>
                        </div>
                    </aside>

                </div>
            </div>
            <Footer />
        </main>
    );
}
