"use client";

import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UseProtectedRoute } from "@/hooks/useProtectedRoute";
import { Button } from "@/components/ui/button";
import { History, Wallet, MessageSquare, Video, Star, FileText, Calendar } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useState, useEffect } from "react";
import { getUserBookings } from "@/services/firestore";

import { WalletRechargeModal } from "@/components/payment/WalletRechargeModal";
import { toast } from "react-hot-toast";
import { Sarvagya } from "@/components/ai/Sarvagya";
import { AstroPassport } from "@/components/ai/AstroPassport";
import { KundliChart } from "@/components/astrology/KundliChart";
import { CosmicTransitHub } from "@/components/astrology/CosmicTransitHub";

export default function UserDashboard() {
    const { user, userData, loading } = UseProtectedRoute(["user"]);
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            getUserBookings(user.uid).then(data => {
                const sorted = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setBookings(sorted);
            }).catch(err => {
                console.error("Dashboard: Error fetching bookings", err);
            });
        }
    }, [user]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Entering Cosmic Realm...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-slate-50 selection:bg-orange-500/30 font-sans pb-24 md:pb-0">
            <Navbar />

            {/* Top Greeting Section */}
            <div className="relative w-full bg-zinc-900 border-b border-white/5 pt-8 pb-12 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-orange-500/10 to-transparent" />
                    <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/20 blur-[120px] rounded-full" />
                </div>

                <div className="container mx-auto px-4 md:px-8 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-2xl font-black text-white shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                            {user.displayName?.[0] || "U"}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Namaste, {user.displayName?.split(' ')[0]}</h1>
                            <p className="text-sm font-medium text-zinc-400">Welcome to your Personal Cosmic Dashboard</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="flex-1 md:flex-none glass bg-zinc-950/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-6 hover:border-primary/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                                    <Wallet className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Wallet Balance</p>
                                    <p className="text-xl font-black text-white">₹{userData?.walletBalance || 0}</p>
                                </div>
                            </div>
                            <Button 
                                onClick={() => setIsRechargeModalOpen(true)}
                                className="bg-white text-black hover:bg-zinc-200 font-bold px-4 py-2 rounded-xl text-xs"
                            >
                                Add Cash
                            </Button>
                        </div>
                    </div>
                </div>
            </div >

            {/* Profile Incomplete Banner */}
            {
                !userData?.profileComplete && (
                    <div className="bg-red-500/10 border-y border-red-500/20 py-3 px-4 text-center">
                        <p className="text-red-400 text-[10px] font-black tracking-widest uppercase">
                            ⚠️ Complete your profile to unlock birth chart analysis and bookings.
                        </p>
                    </div>
                )
            }

            <div className="container mx-auto px-4 md:px-8 py-10 space-y-12">

                {/* ROW 1: Active Consultation & Live Transits */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Active Consultation Box */}
                    <div className="lg:col-span-2 glass bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full group-hover:bg-orange-500/20 transition-colors" />
                        
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                                <Video className="w-4 h-4 text-orange-500" />
                                Action Station
                            </h2>
                        </div>

                        {bookings.length > 0 && bookings[0].status !== 'completed' ? (
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                                <div className="flex gap-6 items-center">
                                    <div className="w-20 h-20 rounded-3xl bg-zinc-800 flex items-center justify-center font-black text-3xl text-orange-500 shadow-2xl border border-white/5">
                                        {bookings[0].astrologerName?.[0] || 'A'}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-white tracking-tight">{bookings[0].astrologerName}</h3>
                                        <p className="text-sm font-bold text-zinc-500">{bookings[0].type.toUpperCase()} Consultation • LIVE NOW</p>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => router.push(`/consult/${bookings[0].id}?type=${bookings[0].type}`)}
                                    className="h-16 w-full md:w-auto md:px-10 orange-gradient text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-2xl animate-pulse"
                                >
                                    Start Meeting
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-10 border border-dashed border-white/5 rounded-3xl">
                                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">No Active Session Right Now</p>
                                <Button 
                                    variant="ghost" 
                                    className="mt-4 text-orange-500 font-black tracking-widest uppercase text-[10px] hover:bg-orange-500/10"
                                    onClick={() => router.push('/search')}
                                >
                                    Book a Call
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Real-time Transit Engine */}
                    <div className="glass bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8">
                        <CosmicTransitHub natalPositions={userData?.kundliData?.[0]?.planets} />
                    </div>
                </div>

                {/* ROW 2: Kundli Visualizer & Passport */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    
                    {/* SVG Birth Chart */}
                    <div className="glass bg-zinc-950 border border-white/5 rounded-[2.5rem] p-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                                <Star className="w-5 h-5 text-accent" />
                                Natal Chart
                            </h2>
                            <Button variant="ghost" onClick={() => router.push('/kundli')} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white px-0">Manage Data</Button>
                        </div>
                        <KundliChart 
                            houses={userData?.kundliData?.[0]?.houses} 
                            rashiNumbers={userData?.kundliData?.[0]?.rashiNumbers} 
                        />
                    </div>

                    {/* Integrated Astro-Passport */}
                    <div className="h-full flex flex-col justify-center">
                        <AstroPassport userData={userData} />
                    </div>
                </div>

                {/* ROW 3: Saved Profiles (Horizontal) */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-white tracking-tight">Cosmic Circles</h2>
                        <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:bg-transparent">See All Profiles</Button>
                    </div>
                    <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar">
                        <div className="min-w-[300px] glass bg-zinc-900 border border-white/5 p-6 rounded-3xl group hover:border-accent/40 transition-all cursor-pointer">
                            <div className="flex justify-between items-start">
                                <div className="space-y-4">
                                    <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent font-black border border-accent/30 shadow-xl">U</div>
                                    <div>
                                        <p className="font-black text-white">Main Identity</p>
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">Natal Data Applied</p>
                                    </div>
                                </div>
                                <FileText className="w-5 h-5 text-zinc-700 group-hover:text-accent transition-colors" />
                            </div>
                        </div>
                        <div onClick={() => router.push('/kundli')} className="min-w-[200px] glass border border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-zinc-900 hover:border-zinc-500 transition-all cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">+</div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">New Profile</span>
                        </div>
                    </div>
                </section>

                {/* ROW 4: History Table */}
                <section className="space-y-8 pt-6">
                    <div className="flex items-center gap-3">
                        <History className="w-5 h-5 text-zinc-500" />
                        <h2 className="text-xl font-black text-white tracking-tight">Recent Sessions</h2>
                    </div>

                    <div className="space-y-4">
                        {bookings.length > 0 ? (
                            bookings.map((session) => (
                                <div key={session.id} className="glass bg-zinc-900 border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-zinc-800/50 transition-colors">
                                    <div className="flex items-center gap-6 w-full md:w-auto">
                                        <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center font-black text-xl text-zinc-400 border border-white/5">
                                            {session.astrologerName?.[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-white">{session.astrologerName}</h3>
                                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.1em] text-zinc-600 mt-1">
                                                <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                                                <span className="text-orange-500">{session.type}</span>
                                                <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                                                <span className={session.status === 'completed' ? 'text-green-500' : 'text-amber-500'}>{session.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full md:w-auto h-12 rounded-xl border-zinc-800 text-xs font-black uppercase tracking-widest hover:bg-zinc-700 text-zinc-300"
                                        onClick={() => router.push(`/consultation-summary/${session.id}`)}
                                    >
                                        Review Details
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 glass border-dashed border-white/5 rounded-[3rem]">
                                <p className="text-zinc-600 font-bold text-sm">Your history is as clear as an empty sky.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <WalletRechargeModal
                isOpen={isRechargeModalOpen}
                onClose={() => setIsRechargeModalOpen(false)}
                currentBalance={userData?.walletBalance || 0}
            />

            <Sarvagya userData={userData} />
            <Footer />
        </main >
    );
}
