"use client";

import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UseProtectedRoute } from "@/hooks/useProtectedRoute";
import { Button } from "@/components/ui/button";
import { History, Wallet, MessageSquare, Video, Star, FileText, Calendar, Heart } from "lucide-react";
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
            <div className="relative w-full bg-zinc-900 border-b border-white/5 pt-12 pb-16 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-orange-500/10 to-transparent" />
                    <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/20 blur-[120px] rounded-full" />
                </div>

                <div className="container mx-auto px-4 md:px-8 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-3xl font-black text-white shadow-[0_0_40px_rgba(249,115,22,0.4)] group-hover:scale-105 transition-transform duration-500">
                                {user.displayName?.[0] || "U"}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-zinc-900 rounded-full" />
                        </div>
                        <div>
                            <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Seeker Sanctuary</p>
                            <h1 className="text-4xl font-black text-white tracking-tight">Namaste, {user.displayName?.split(' ')[0]}</h1>
                            <p className="text-sm font-medium text-zinc-400 mt-1">Your cosmic alignment is 84% today • <span className="text-orange-500/80">View Details</span></p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="flex-1 md:flex-none glass bg-zinc-950/40 p-5 rounded-3xl border border-white/5 flex items-center justify-between gap-8 hover:border-orange-500/30 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                    <Wallet className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Wallet Credits</p>
                                    <p className="text-2xl font-black text-white">₹{userData?.walletBalance || 0}</p>
                                </div>
                            </div>
                            <Button 
                                onClick={() => setIsRechargeModalOpen(true)}
                                className="bg-white text-black hover:bg-orange-500 hover:text-white font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl"
                            >
                                Top Up
                            </Button>
                        </div>
                    </div>
                </div>
            </div >

            {/* Daily Wisdom Banner */}
            <div className="relative border-b border-white/5 bg-zinc-950/50 py-4 overflow-hidden">
                <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-center gap-4 text-center">
                    <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-500 text-[10px] font-black uppercase tracking-widest">Today's Wisdom</span>
                    <p className="text-zinc-400 text-sm font-medium italic">"The stars don't force, they only incline. Your karma is the true master of your destiny today."</p>
                </div>
            </div>

            {/* Profile Incomplete Banner */}
            {
                !userData?.profileComplete && (
                    <div className="bg-red-500/5 border-b border-red-500/10 py-3 px-4 text-center">
                        <p onClick={() => router.push('/user/profile/edit')} className="text-red-500/60 text-[9px] font-black tracking-[0.2em] uppercase cursor-pointer hover:text-red-500 transition-colors">
                            ⚠️ Complete your profile to unlock birth chart analysis and detailed predictions.
                        </p>
                    </div>
                )
            }

            <div className="container mx-auto px-4 md:px-8 py-10 space-y-12">

                {/* ROW 1: Quick Tools & Active Consultation */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Quick Tools Grid */}
                    <div className="lg:col-span-4 space-y-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 px-2">Cosmic Utilities</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { name: "Birth Chart", icon: Star, color: "text-orange-500", bg: "bg-orange-500/10", route: "/kundli" },
                                { name: "Match Making", icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10", route: "/matching" },
                                { name: "Panchang", icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10", route: "/panchang" },
                                { name: "Horoscope", icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10", route: "/horoscope" },
                            ].map((tool) => (
                                <button 
                                    key={tool.name}
                                    onClick={() => router.push(tool.route)}
                                    className="glass bg-zinc-900/50 border border-white/5 p-4 rounded-3xl flex flex-col items-center justify-center gap-3 group hover:border-white/20 transition-all hover:-translate-y-1"
                                >
                                    <div className={`w-12 h-12 rounded-2xl ${tool.bg} flex items-center justify-center ${tool.color} group-hover:scale-110 transition-transform`}>
                                        <tool.icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">{tool.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Active Consultation Box */}
                    <div className="lg:col-span-8 glass bg-zinc-900 border border-white/5 rounded-[3rem] p-10 relative overflow-hidden group flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 blur-[100px] rounded-full group-hover:bg-orange-500/20 transition-colors -z-10" />
                        
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                                <Video className="w-4 h-4 text-orange-500" />
                                Session Center
                            </h2>
                            {bookings.length > 0 && <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{bookings.length} Total Logs</span>}
                        </div>

                        {bookings.length > 0 && bookings[0].status !== 'completed' ? (
                            <div className="flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
                                <div className="flex gap-8 items-center text-center md:text-left flex-col md:flex-row">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-[2.5rem] bg-zinc-800 flex items-center justify-center font-black text-4xl text-orange-500 shadow-2xl border border-white/5 group-hover:scale-105 transition-transform">
                                            {bookings[0].astrologerName?.[0] || 'A'}
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-zinc-900 animate-pulse" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em]">Incoming Signal</p>
                                        <h3 className="text-3xl font-black text-white tracking-tight">{bookings[0].astrologerName}</h3>
                                        <div className="flex items-center gap-3 justify-center md:justify-start">
                                            <span className="px-2 py-0.5 bg-zinc-800 rounded text-zinc-500 text-[8px] font-black uppercase tracking-widest border border-white/5">{bookings[0].type}</span>
                                            <span className="text-[10px] font-bold text-green-500 animate-pulse uppercase tracking-widest">Waiting in Sanctuary</span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => router.push(`/consult/${bookings[0].id}?type=${bookings[0].type}`)}
                                    className="h-20 w-full md:w-auto md:px-12 orange-gradient text-white font-black uppercase tracking-[0.2em] text-sm rounded-[2rem] shadow-[0_20px_50px_rgba(249,115,22,0.3)] hover:scale-105 active:scale-95 transition-all"
                                >
                                    Connect Now
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-zinc-950/20">
                                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-6 text-zinc-700">
                                    <Video className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-black text-zinc-400 tracking-tight mb-2">No Active Transmissions</h3>
                                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-8">Ready for your next spiritual guidance?</p>
                                <Button 
                                    className="bg-white text-black hover:bg-orange-500 hover:text-white font-black tracking-widest uppercase text-xs rounded-2xl px-10 h-14 transition-all shadow-xl"
                                    onClick={() => router.push('/search')}
                                >
                                    Find Your Guide
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
