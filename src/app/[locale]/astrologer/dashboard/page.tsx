"use client";

import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UseProtectedRoute } from "@/hooks/useProtectedRoute";
import { Button } from "@/components/ui/button";
import { Calendar, IndianRupee, Users, Clock, TrendingUp, AlertCircle, FileText, User } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useState, useEffect, useRef } from "react";
import { subscribeAstrologerBookings } from "@/services/firestore";
import toast from "react-hot-toast";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AstrologerDashboard() {
    const { user, userData, loading } = UseProtectedRoute(["astrologer"]);
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const prevBookingsLength = useRef(0);
    const seenBookingIds = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (user) {
            const unsubscribe = subscribeAstrologerBookings(user.uid, (data) => {
                const sorted = data.sort((a: any, b: any) => {
                    // Prioritize active bookings
                    if (a.status === 'active' && b.status !== 'active') return -1;
                    if (b.status === 'active' && a.status !== 'active') return 1;
                    // Then sort by date
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });
                setBookings(sorted);

                // Play sound and show toast if a NEW active booking arrives
                const activeBookings = data.filter(b => b.status === "active");

                // Find any active booking that we haven't alerted about yet
                const newActiveBookings = activeBookings.filter(b => !seenBookingIds.current.has(b.id));

                if (newActiveBookings.length > 0) {
                    try {
                        const audio = new Audio('/sounds/bell.mp3');
                        audio.play().catch(e => console.log("Audio play prevented by browser", e));
                    } catch (e) { }

                    toast((t) => (
                        <div className="flex flex-col gap-2">
                            <span className="font-bold text-lg">🔔 New Seeker Waiting!</span>
                            <span className="text-sm">Someone just joined your consultation room.</span>
                            <Button
                                className="bg-green-500 hover:bg-green-600 text-white mt-2"
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    window.scrollTo({ top: 500, behavior: 'smooth' }); // Scroll down to appointments
                                }}
                            >
                                View Room Request
                            </Button>
                        </div>
                    ), { duration: 15000, position: 'top-center' });

                    // Mark these as seen
                    newActiveBookings.forEach(b => seenBookingIds.current.add(b.id));
                }
                prevBookingsLength.current = activeBookings.length;
            });

            return () => unsubscribe();
        }
    }, [user]);

    useEffect(() => {
        if (userData !== undefined) {
            setIsOnline(userData?.isOnline !== false);
        }
    }, [userData]);

    useEffect(() => {
        if (userData && !loading) {
            // Redirect to onboarding if profile not complete
            if (!userData.profileComplete) {
                router.push("/astrologer/onboarding");
            }
        }
    }, [userData, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    // Show pending verification screen
    if (userData?.profileComplete && !userData?.verified) {
        return (
            <main className="min-h-screen flex flex-col bg-transparent overflow-hidden selection:bg-primary/30">
                <Navbar />
                <div className="flex-grow flex items-center justify-center p-6 relative">
                    <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10 animate-float" />
                    <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-accent/5 blur-[120px] rounded-full -z-10 animate-float" style={{ animationDelay: '-2s' }} />

                    <div className="max-w-xl glass p-16 rounded-[4rem] text-center space-y-10 relative overflow-hidden shadow-2xl border-primary/10">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50" />

                        <div className="w-24 h-24 mx-auto bg-primary/10 rounded-[2.5rem] flex items-center justify-center border border-primary/20 shadow-2xl shadow-primary/10 transition-transform hover:scale-110">
                            <Clock className="w-12 h-12 text-primary animate-pulse" />
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-gradient tracking-tighter leading-none">Vedic Verification Pending</h2>
                            <p className="text-sm text-foreground/40 font-medium leading-relaxed italic">
                                Your profile is currently undergoing a sacred review by our masters.
                                We seek perfection to ensure the highest spiritual guidance for our seekers.
                            </p>
                        </div>

                        <div className="glass bg-primary/[0.02] rounded-[2.5rem] p-10 space-y-4 border-primary/10">
                            <div className="flex items-center justify-center gap-2 font-black uppercase tracking-[0.3em] text-[10px] text-primary">
                                <AlertCircle className="w-4 h-4" />
                                <span>Celestial Timeline</span>
                            </div>
                            <p className="text-foreground/40 font-medium italic leading-relaxed text-xs">"Patience is the ornament of the wise. Expect alignment within 24-48 solar hours."</p>
                        </div>

                        <Button variant="ghost" className="text-foreground/20 hover:text-primary uppercase tracking-[0.4em] font-black text-[10px] transition-colors" onClick={() => router.push('/')}>
                            Return to Sanctuary
                        </Button>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-slate-50 selection:bg-orange-500/30 font-sans pb-24 md:pb-0">
            <Navbar />

            {/* Top Status & Greeting Section */}
            <div className="relative w-full bg-zinc-900 border-b border-white/5 pt-12 pb-20 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-0 w-[800px] h-full bg-gradient-to-r from-orange-500/10 to-transparent" />
                    <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-orange-500/20 blur-[150px] rounded-full" />
                </div>

                <div className="container mx-auto px-4 md:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                        <div className="flex items-center gap-8">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-4xl font-black text-white shadow-[0_20px_50px_rgba(249,115,22,0.4)] group-hover:scale-105 transition-transform duration-500">
                                    {user.displayName?.[0] || "A"}
                                </div>
                                <div className={`absolute -bottom-2 -right-2 w-8 h-8 ${isOnline ? 'bg-green-500 shadow-[0_0_20px_#22c55e]' : 'bg-zinc-700'} border-4 border-zinc-900 rounded-full transition-all duration-500`} />
                            </div>
                            <div>
                                <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Master Consultant</p>
                                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">Master {user.displayName?.split(' ')[0] || "Astrologer"}</h1>
                                <div className="flex items-center gap-4 mt-4">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-zinc-500'}`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{isOnline ? 'Accepting Seekers' : 'Currently Resting'}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">UID: {user.uid.slice(0, 8)}...</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                            {/* Online/Offline Large Toggle */}
                            <div className="w-full sm:w-auto glass bg-zinc-950/40 p-2 rounded-[2rem] border border-white/5 flex items-center gap-2">
                                <Button
                                    onClick={async () => {
                                        if (isUpdatingStatus || isOnline) return;
                                        setIsUpdatingStatus(true);
                                        setIsOnline(true);
                                        try {
                                            await updateDoc(doc(db, "astrologers", user.uid), { isOnline: true });
                                            toast.success("Divine Connection Active!");
                                        } catch(e) { 
                                            toast.error("Failed to update status"); 
                                            setIsOnline(false);
                                        }
                                        setIsUpdatingStatus(false);
                                    }}
                                    className={`flex-1 sm:flex-none h-14 px-8 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all ${isOnline ? "bg-green-600 text-white shadow-2xl shadow-green-500/20" : "bg-transparent text-zinc-500 hover:text-white"}`}
                                >
                                    {isOnline && <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>}
                                    Go Online
                                </Button>
                                <Button
                                    onClick={async () => {
                                        if (isUpdatingStatus || !isOnline) return;
                                        setIsUpdatingStatus(true);
                                        setIsOnline(false);
                                        try {
                                            await updateDoc(doc(db, "astrologers", user.uid), { isOnline: false });
                                            toast.success("Taking a Celestial Break");
                                        } catch(e) { 
                                            toast.error("Failed to update status");
                                            setIsOnline(true);
                                        }
                                        setIsUpdatingStatus(false);
                                    }}
                                    className={`flex-1 sm:flex-none h-14 px-8 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${!isOnline ? "bg-zinc-800 text-white border border-white/10 shadow-inner" : "bg-transparent text-zinc-500 hover:text-white"}`}
                                >
                                    Go Offline
                                </Button>
                            </div>
                            
                            <Button
                                onClick={() => window.open(`/profile/${user.uid}`, '_blank')}
                                className="w-full sm:w-auto bg-white text-black hover:bg-orange-500 hover:text-white font-black text-xs uppercase tracking-[0.2em] rounded-[1.5rem] px-8 h-14 transition-all shadow-xl"
                            >
                                Public Profile
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-8 py-10 space-y-10">

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 -mt-10 relative z-20">
                    {[
                        { label: "Total Earnings", value: "₹" + (userData?.totalEarnings || "0"), icon: IndianRupee, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
                        { label: "Today's Consults", value: "8", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                        { label: "Active Seekers", value: userData?.consultations || "0", icon: Users, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
                        { label: "Expert Rating", value: userData?.rating?.toFixed(1) || "5.0", icon: Star, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                    ].map((stat, i) => (
                        <div key={i} className="glass bg-zinc-900 border border-white/5 p-8 rounded-[2.5rem] group hover:border-white/20 transition-all hover:-translate-y-1 relative overflow-hidden">
                            <div className={`absolute -top-10 -right-10 w-32 h-32 ${stat.bg} blur-[60px] rounded-full opacity-40 group-hover:opacity-60 transition-opacity`} />

                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className={`w-12 h-12 rounded-2xl ${stat.bg} border ${stat.border} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div className="text-[10px] font-black text-zinc-600 tracking-widest uppercase">Live</div>
                            </div>
                            <div className="relative z-10">
                                <div className="text-4xl font-black text-white tracking-tight">{stat.value}</div>
                                <div className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 mt-2">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Appointments Tabs */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-zinc-400" />
                                <h2 className="text-xl font-bold text-white">Your Sessions</h2>
                            </div>
                            <Button 
                                onClick={() => router.push('/astrologer/availability')}
                                variant="ghost" 
                                className="text-[10px] uppercase font-bold tracking-widest text-orange-500 hover:text-orange-400 hover:bg-transparent px-0"
                            >
                                Manage Schedule
                            </Button>
                        </div>

                        {/* TABS */}
                        <div className="flex gap-2 bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5 w-max">
                            <button
                                onClick={() => setActiveTab('upcoming')}
                                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'upcoming' ? 'bg-zinc-800 text-white shadow-xl border border-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Upcoming
                            </button>
                            <button
                                onClick={() => setActiveTab('past')}
                                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'past' ? 'bg-zinc-800 text-white shadow-xl border border-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Past Sessions
                            </button>
                        </div>

                        <div className="space-y-2 pt-2">
                            {(() => {
                                const isSessionPast = (b: any) => {
                                    if (b.status === 'completed' || b.status === 'cancelled' || b.status === 'canceled') return true;
    
                                    // Extract timestamp safely handling Firestore objects or strings
                                    const getValidTime = (val: any) => {
                                        if (!val) return null;
                                        if (typeof val === 'number') return val;
                                        if (val.seconds) return val.seconds * 1000;
                                        if (val._seconds) return val._seconds * 1000; // Firebase Admin format
                                        const d = new Date(val);
                                        if (!isNaN(d.getTime())) return d.getTime();
                                        return null;
                                    };

                                    const baseTime = getValidTime(b.date) || getValidTime(b.createdAt) || Date.now();
                                    const dateObj = new Date(baseTime);
                                    
                                    if (b.time) {
                                        try {
                                            const [timeField, ampm] = String(b.time).split(' ');
                                            if (timeField) {
                                                const [hoursStr, minutesStr] = timeField.split(':');
                                                let hours = parseInt(hoursStr, 10);
                                                const minutes = parseInt(minutesStr || "0", 10);
                                                
                                                // Ensure valid numbers
                                                if (!isNaN(hours) && !isNaN(minutes)) {
                                                    if (ampm?.toUpperCase() === 'PM' && hours < 12) hours += 12;
                                                    if (ampm?.toUpperCase() === 'AM' && hours === 12) hours = 0;
                                                    dateObj.setHours(hours, minutes, 0, 0);
                                                }
                                            }
                                        } catch (e) {
                                            console.error("Error parsing booking time", e);
                                        }
                                    }
                                    
                                    // Add 2 hours (120 mins) buffer so it stays in "Upcoming" during the session
                                    const endTime = dateObj.getTime() + (120 * 60 * 1000);
                                    return endTime < Date.now();
                                };

                                const filteredBookings = bookings.filter(b => {
                                    const isPast = isSessionPast(b);
                                    return activeTab === 'upcoming' ? !isPast : isPast;
                                });

                                if (filteredBookings.length === 0) {
                                    return (
                                        <div className="glass bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl p-8 text-center flex flex-col items-center">
                                            <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center mb-2">
                                                <Clock className="w-4 h-4 text-zinc-500" />
                                            </div>
                                            <h3 className="text-sm font-bold text-zinc-300">No {activeTab} Sessions</h3>
                                            <p className="text-[10px] text-zinc-500 mt-1 max-w-sm font-medium italic">
                                                {activeTab === 'upcoming' ? "Your schedule is currently clear." : "No session history found."}
                                            </p>
                                        </div>
                                    );
                                }

                                return filteredBookings.map((booking: any, index: number) => {
                                    const isActive = booking.status === 'active';
                                    const isCompleted = booking.status === 'completed' || booking.status === 'cancelled' || booking.status === 'canceled';
                                    const bookingDate = new Date(booking.date?.seconds ? booking.date.seconds * 1000 : booking.date);
                                    const typeIcon = booking.type === 'video' ? '🎥' : booking.type === 'audio' ? '🎙️' : '💬';

                                    return (
                                        <div key={booking.id} className={`glass bg-zinc-900 border p-3 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${isActive && index === 0 && activeTab === 'upcoming' ? 'border-orange-500/30 ring-1 ring-orange-500/20 bg-orange-500/[0.02]' : isCompleted ? 'border-zinc-800/30 opacity-60' : 'border-white/5 hover:border-zinc-700'}`}>
                                            <div className="flex items-center gap-3 w-full md:w-auto">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-md shrink-0 ${isActive && index === 0 ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30 shadow-lg shadow-orange-500/10' : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50'}`}>
                                                    {bookingDate.getDate()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <h3 className="text-sm font-bold text-white tracking-tight truncate">
                                                            {booking.userName || "Seeker"}
                                                        </h3>
                                                        {(isActive && index === 0 && activeTab === 'upcoming') && <span className="px-1.5 py-0.5 bg-green-500/10 text-green-500 text-[7px] font-black uppercase rounded tracking-widest animate-pulse">Live</span>}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">
                                                        <span>{typeIcon} {booking.time}</span>
                                                        <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                                                        <span>{bookingDate.toLocaleString(undefined, { month: 'short' })}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex w-full md:w-auto gap-2 mt-1 md:mt-0">
                                                {!isCompleted && activeTab === 'upcoming' ? (
                                                    <Button
                                                        onClick={() => router.push(`/consult/${booking.id}?type=${booking.type}&role=astrologer`)}
                                                        className={`h-8 flex-1 md:flex-none md:px-5 font-black uppercase tracking-widest text-[8px] rounded-lg transition-all ${isActive && index === 0 ? 'bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-500/20' : 'bg-white text-black hover:bg-zinc-200'}`}
                                                    >
                                                        Join Room
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={() => router.push(`/consultation-summary/${booking.id}`)}
                                                        className="h-8 flex-1 md:flex-none md:px-5 font-black uppercase tracking-widest text-[8px] rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700/50"
                                                    >
                                                        Review
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Withdraw & Recent */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-zinc-400" />
                            <h2 className="text-xl font-bold text-white">Engagement Actions</h2>
                        </div>

                        <Button
                            onClick={() => router.push('/search')}
                            className="w-full h-20 justify-between px-6 rounded-[2rem] bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border border-primary/20 text-white group transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div className="text-left flex flex-col justify-center">
                                    <div className="text-sm font-bold">Grow Your Network</div>
                                    <div className="text-[10px] text-zinc-400 uppercase tracking-widest leading-none mt-0.5">Scale your spiritual reach today</div>
                                </div>
                            </div>
                            <span className="text-zinc-500 group-hover:text-primary group-hover:translate-x-1 transition-all">→</span>
                        </Button>

                            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Quick Access</h3>
                            <Button variant="outline" className="w-full justify-start h-12 rounded-xl text-xs font-bold border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white" onClick={() => router.push('/astrologer/transactions')}>
                                <IndianRupee className="w-4 h-4 mr-3 opacity-60" /> Earnings & Wallet
                            </Button>
                            <Button variant="outline" className="w-full justify-start h-12 rounded-xl text-xs font-bold border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white" onClick={() => router.push('/astrologer/onboarding')}>
                                <User className="w-4 h-4 mr-3 opacity-60" /> Edit Public Profile
                            </Button>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
