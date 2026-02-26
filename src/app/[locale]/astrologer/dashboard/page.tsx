"use client";

import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UseProtectedRoute } from "@/hooks/useProtectedRoute";
import { Button } from "@/components/ui/button";
import { Calendar, IndianRupee, Users, Clock, TrendingUp, AlertCircle, FileText } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useState, useEffect, useRef } from "react";
import { subscribeAstrologerBookings } from "@/services/firestore";
import toast from "react-hot-toast";

export default function AstrologerDashboard() {
    const { user, userData, loading } = UseProtectedRoute(["astrologer"]);
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
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

            {/* Top Greeting Section */}
            <div className="relative w-full bg-zinc-900 border-b border-white/5 pt-8 pb-12 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-r from-orange-500/10 to-transparent" />
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/20 blur-[120px] rounded-full" />
                </div>

                <div className="container mx-auto px-4 md:px-8 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-2xl font-black text-white shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                                {user.displayName?.[0] || "A"}
                            </div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-zinc-900 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Master {user.displayName?.split(' ')[0] || "Astrologer"}</h1>
                            <p className="text-sm font-medium text-zinc-400">Your spiritual dashboard • UID: {user.uid}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex-1 md:flex-none glass bg-zinc-950/50 p-2 rounded-2xl border border-white/5 flex items-center gap-2 hover:border-orange-500/30 transition-colors">
                            <Button className="flex-1 md:flex-none h-10 px-6 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                                Online Now
                            </Button>
                            <Button variant="ghost" className="h-10 px-4 text-zinc-400 hover:text-white font-bold text-[10px] uppercase tracking-wider">
                                Go Offline
                            </Button>
                        </div>
                        <Button
                            onClick={() => window.open(`/profile/${user.uid}`, '_blank')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl px-6 h-10 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                        >
                            View My Public Profile
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-8 py-10 space-y-10">

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {[
                        { label: "Today's Earnings", value: `₹${userData?.walletBalance || 0}`, icon: IndianRupee, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
                        { label: "Sessions Today", value: "3", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                        { label: "Total Seekers", value: userData?.consultations || "0", icon: Users, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
                        { label: "Global Rating", value: userData?.rating?.toFixed(1) || "5.0", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                    ].map((stat, i) => (
                        <div key={i} className="glass bg-zinc-900 border border-white/5 p-6 rounded-3xl group hover:border-zinc-700 transition-[border-color] relative overflow-hidden">
                            <div className={`absolute -top-10 -right-10 w-24 h-24 ${stat.bg} blur-[40px] rounded-full opacity-50`} />

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className={`w-10 h-10 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                            </div>
                            <div className="relative z-10">
                                <div className="text-3xl font-black text-white">{stat.value}</div>
                                <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mt-1">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Upcoming Appointments */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-zinc-400" />
                                <h2 className="text-xl font-bold text-white">Upcoming Sessions</h2>
                            </div>
                            <Button variant="ghost" className="text-xs uppercase font-bold tracking-widest text-orange-500 hover:text-orange-400 hover:bg-transparent px-0">
                                Manage Schedule
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {bookings.length === 0 ? (
                                <div className="glass bg-zinc-900/50 border border-dashed border-zinc-800 rounded-3xl p-16 text-center">
                                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-700/50">
                                        <Clock className="w-6 h-6 text-zinc-500" />
                                    </div>
                                    <h3 className="text-base font-bold text-zinc-300">No Upcoming Sessions</h3>
                                    <p className="text-xs text-zinc-500 mt-2 max-w-sm mx-auto">
                                        Your schedule is currently clear. Ensure your availability is set correctly to receive bookings.
                                    </p>
                                    <Button className="mt-6 bg-white text-black hover:bg-zinc-200 font-bold uppercase tracking-wider text-xs px-6 py-2 rounded-xl">
                                        Update Availability
                                    </Button>
                                </div>
                            ) : (
                                bookings.map((booking: any, index: number) => (
                                    <div key={booking.id} className={`glass bg-zinc-900 border p-5 md:p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-[border-color] relative overflow-hidden ${index === 0 && booking.status !== 'completed' ? 'border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.05)]' : 'border-white/5 hover:border-zinc-700'}`}>

                                        {index === 0 && booking.status !== 'completed' && (
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px] rounded-full" />
                                        )}

                                        <div className="flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-8 w-full md:w-auto relative z-10">
                                            {/* Date/Time Block */}
                                            <div className="flex items-center gap-4 min-w-[120px]">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${index === 0 && booking.status !== 'completed' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' : 'bg-zinc-800 text-zinc-400 border border-zinc-700/50'}`}>
                                                    {new Date(booking.date?.seconds ? booking.date.seconds * 1000 : booking.date).getDate()}
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">
                                                        {new Date(booking.date?.seconds ? booking.date.seconds * 1000 : booking.date).toLocaleString(undefined, { month: 'short' })}
                                                    </div>
                                                    <div className={`text-lg font-black ${index === 0 && booking.status !== 'completed' ? 'text-white' : 'text-zinc-300'}`}>
                                                        {booking.time}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Divider hidden on mobile */}
                                            <div className="hidden md:block w-px h-10 bg-zinc-800"></div>

                                            {/* User Details */}
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-bold text-white tracking-tight">{booking.userName || "Seeker Profile"}</h3>
                                                    {index === 0 && booking.status !== 'completed' && (
                                                        <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[9px] font-bold uppercase tracking-widest rounded">Up Next</span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium text-zinc-400 capitalize">{booking.type} Consultation • 30 Mins</p>
                                            </div>
                                        </div>

                                        <div className="flex w-full md:w-auto gap-3 relative z-10 mt-2 md:mt-0">
                                            <Button
                                                onClick={() => router.push(`/consult/${booking.id}?type=${booking.type}&role=astrologer`)}
                                                className={`h-12 flex-1 md:flex-none md:px-8 font-bold uppercase tracking-wider text-[10px] rounded-xl transition-all ${index === 0 && booking.status !== 'completed' ? 'bg-green-500 hover:bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse' : 'bg-white text-black hover:bg-zinc-200'}`}
                                            >
                                                Join Room
                                            </Button>
                                            <Button variant="outline" className="h-12 w-12 p-0 rounded-xl border-zinc-800 hover:bg-zinc-800 text-zinc-300 flex-shrink-0 flex justify-center items-center">
                                                <Calendar className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Withdraw & Recent */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center gap-3">
                            <IndianRupee className="w-5 h-5 text-zinc-400" />
                            <h2 className="text-xl font-bold text-white">Quick Actions</h2>
                        </div>

                        <Button
                            onClick={() => router.push('/astrologer/transactions')}
                            className="w-full h-20 justify-between px-6 rounded-[2rem] bg-gradient-to-r from-orange-500/10 to-orange-500/5 hover:from-orange-500/20 hover:to-orange-500/10 border border-orange-500/20 text-white group transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                                    <IndianRupee className="w-5 h-5" />
                                </div>
                                <div className="text-left flex flex-col justify-center">
                                    <div className="text-sm font-bold">Withdraw Funds & Ledger</div>
                                    <div className="text-[10px] text-zinc-400 uppercase tracking-widest leading-none mt-0.5">Wallet: ₹{userData?.walletBalance || 0}</div>
                                </div>
                            </div>
                            <span className="text-zinc-500 group-hover:text-orange-500 group-hover:translate-x-1 transition-all">→</span>
                        </Button>

                        <div className="pt-6">
                            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Past Sessions</h3>
                            {bookings.filter((b: any) => b.status === 'completed').length === 0 ? (
                                <div className="p-8 rounded-3xl bg-zinc-900 border border-white/5 text-center">
                                    <p className="text-xs text-zinc-500">No completed sessions yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {bookings.filter((b: any) => b.status === 'completed').slice(0, 4).map((b: any) => (
                                        <div key={b.id} className="p-4 rounded-2xl glass bg-zinc-900 border border-white/5 group hover:border-zinc-700 transition-[border-color] flex justify-between items-center cursor-pointer" onClick={() => router.push(`/consultation-summary/${b.id}`)}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold border border-zinc-700/50 group-hover:border-orange-500/30 group-hover:text-orange-500 transition-colors">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-zinc-200">{b.userName || "Seeker"}</div>
                                                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{new Date(b.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-bold text-green-500">+ ₹{b.amount || 250}</div>
                                                <div className="text-[9px] text-zinc-500 uppercase tracking-wider">{b.type}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
