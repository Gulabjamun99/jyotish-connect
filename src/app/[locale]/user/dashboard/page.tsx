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
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
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
                <section className="space-y-6 pt-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <History className="w-5 h-5 text-zinc-500" />
                            <h2 className="text-xl font-bold text-white tracking-tight">Your Sessions</h2>
                        </div>
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
                            const filteredBookings = bookings.filter(b => {
                                const isDone = b.status === 'completed' || b.status === 'cancelled' || b.status === 'canceled';
                                return activeTab === 'upcoming' ? !isDone : isDone;
                            });

                            if (filteredBookings.length === 0) {
                                return (
                                    <div className="text-center py-12 glass border-dashed bg-zinc-900/50 border-white/5 rounded-2xl flex flex-col items-center">
                                        <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center mb-2">
                                            <Calendar className="w-4 h-4 text-zinc-500" />
                                        </div>
                                        <h3 className="text-sm font-bold text-zinc-300">No {activeTab} Sessions</h3>
                                        <p className="text-[10px] text-zinc-500 mt-1 max-w-sm font-medium italic">
                                            {activeTab === 'upcoming' ? "Your cosmic schedule is clear." : "No previous sessions found."}
                                        </p>
                                    </div>
                                );
                            }

                            return filteredBookings.map((session) => {
                                const isCompleted = session.status === 'completed' || session.status === 'cancelled' || session.status === 'canceled';
                                const isActive = session.status === 'active';
                                const sessionDate = new Date(session.createdAt);

                                return (
                                    <div key={session.id} className={`glass bg-zinc-900 border p-3 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${isCompleted ? 'border-zinc-800/30 opacity-60' : isActive ? 'border-orange-500/30 ring-1 ring-orange-500/20' : 'border-white/5 hover:border-zinc-700'}`}>
                                        <div className="flex items-center gap-3 w-full md:w-auto">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-md shrink-0 ${isActive ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30 shadow-lg shadow-orange-500/10' : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50'}`}>
                                                {session.astrologerName?.[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h3 className="text-sm font-bold text-white truncate">{session.astrologerName}</h3>
                                                    {(isActive && activeTab === 'upcoming') && <span className="px-1.5 py-0.5 bg-green-500/10 text-green-500 text-[7px] font-black uppercase rounded tracking-widest animate-pulse">Live</span>}
                                                    {(!isActive && !isCompleted && activeTab === 'upcoming') && <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[7px] font-black uppercase rounded tracking-widest">Booked</span>}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter text-zinc-600">
                                                    <span>{sessionDate.toLocaleDateString()}</span>
                                                    <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                                                    <span className={session.type === 'video' ? 'text-orange-500' : 'text-blue-500'}>{session.type}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex w-full md:w-auto gap-2 mt-1 md:mt-0">
                                            {isActive && activeTab === 'upcoming' ? (
                                                <Button
                                                    onClick={() => router.push(`/consult/${session.id}?type=${session.type}`)}
                                                    className="h-8 flex-1 md:flex-none md:px-5 font-black uppercase tracking-widest text-[8px] rounded-lg bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-500/20 animate-pulse"
                                                >
                                                    Join
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    className="h-8 flex-1 md:flex-none md:px-5 font-black uppercase tracking-widest text-[8px] rounded-lg border-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                                    onClick={() => router.push(`/consultation-summary/${session.id}`)}
                                                >
                                                    Summary
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            });
                        })()}
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
