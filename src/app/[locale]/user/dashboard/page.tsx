"use client";

import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { UseProtectedRoute } from "@/hooks/useProtectedRoute";
import { Button } from "@/components/ui/button";
import { 
    History, Wallet, MessageSquare, Video, Star, FileText, Calendar, Heart, User, 
    Sparkles, Zap, ShieldCheck, Share2, Download 
} from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useState, useEffect } from "react";
import { getUserBookings } from "@/services/firestore";
import { WalletRechargeModal } from "@/components/payment/WalletRechargeModal";
import { toast } from "react-hot-toast";
import { Sarvagya } from "@/components/ai/Sarvagya";
import { AstroPassport } from "@/components/ai/AstroPassport";
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
                const sorted = data.sort((a: any, b: any) => {
                    const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt).getTime();
                    const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt).getTime();
                    return timeB - timeA;
                });
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
                    <p className="text-zinc-500 text-xs font-black uppercase tracking-widest text-center">Opening Cosmic Portals...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-slate-50 selection:bg-orange-500/30 font-sans pb-24 md:pb-0">
            <Navbar />
            <EmailVerificationBanner />

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
                            <h1 className="text-4xl font-black text-white tracking-tight">Namaste, {user.displayName?.split(' ')[0] || 'Seeker'}</h1>
                            <p className="text-sm font-medium text-zinc-400 mt-1">Your cosmic alignment is 84% today • <button onClick={() => router.push('/user/profile/edit')} className="text-orange-500/80 hover:text-orange-500 underline underline-offset-4 decoration-orange-500/30 transition-all">View Details</button></p>
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

            <div className="container mx-auto px-4 md:px-8 py-10 space-y-12">

                {/* ROW 1: Quick Tools & Active Consultation */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Quick Tools Grid */}
                    <div className="lg:col-span-4 space-y-6">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 px-2">Cosmic Utilities</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { name: "My Profile", icon: User, color: "text-orange-500", bg: "bg-orange-500/10", route: "/user/profile/edit" },
                                { name: "Match Making", icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10", route: "/kundli-matching" },
                                { name: "Kundli", icon: Star, color: "text-blue-500", bg: "bg-blue-500/10", route: "/kundli" },
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
                            {bookings.length > 0 && <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{bookings.length} Records</span>}
                        </div>

                        {bookings.length > 0 && bookings[0].status !== 'completed' && bookings[0].status !== 'cancelled' ? (
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
                                            <span className="text-[10px] font-bold text-green-500 animate-pulse uppercase tracking-widest">Waiting for you</span>
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
                </div>

                {/* ROW 2: Cosmic Transits & Astro Passport */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    
                    {/* Real-time Transit Engine */}
                    <div className="glass bg-zinc-900 border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 blur-[60px] rounded-full" />
                        <CosmicTransitHub natalPositions={userData?.kundliData?.[0]?.planets} />
                        <p className="text-[10px] text-zinc-500 mt-4 leading-relaxed italic">
                            *Transits show how current planet movements interact with your unique birth stars.
                        </p>
                    </div>

                    {/* Integrated Astro-Passport */}
                    <div className="h-full flex flex-col justify-center">
                        <AstroPassport userData={userData} />
                    </div>
                </div>

                {/* ROW 3: Family Profiles (Horizontal) */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-white tracking-tight">Family & Friends</h2>
                        <Button variant="ghost" onClick={() => router.push('/user/profile/edit')} className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:bg-transparent">Manage All</Button>
                    </div>
                    <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar">
                        <div onClick={() => router.push('/user/profile/edit')} className="min-w-[300px] glass bg-zinc-900 border border-white/5 p-6 rounded-3xl group hover:border-accent/40 transition-all cursor-pointer">
                            <div className="flex justify-between items-start">
                                <div className="space-y-4">
                                    <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent font-black border border-accent/30 shadow-xl">
                                        {user.displayName?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-black text-white">Your Profile (Main)</p>
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">Birth Data Applied</p>
                                    </div>
                                </div>
                                <FileText className="w-5 h-5 text-zinc-700 group-hover:text-accent transition-colors" />
                            </div>
                        </div>
                        <div onClick={() => router.push('/user/profile/edit')} className="min-w-[200px] glass border border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-zinc-900 hover:border-zinc-500 transition-all cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">+</div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Add Family Member</span>
                        </div>
                    </div>
                </section>

                {/* ROW 4: History Summary */}
                <section className="space-y-6 pt-6">
                    <div className="flex items-center gap-3">
                        <History className="w-5 h-5 text-zinc-500" />
                        <h2 className="text-xl font-bold text-white tracking-tight">Session History</h2>
                    </div>

                    <div className="flex gap-2 bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5 w-max">
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'upcoming' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Upcoming
                        </button>
                        <button
                            onClick={() => setActiveTab('past')}
                            className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'past' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Past
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bookings.filter(b => {
                            const isPast = b.status === 'completed' || b.status === 'cancelled';
                            return activeTab === 'upcoming' ? !isPast : isPast;
                        }).slice(0, 4).map(session => (
                            <div key={session.id} className="glass bg-zinc-900/50 border border-white/5 p-5 rounded-3xl flex justify-between items-center group hover:border-white/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center font-bold text-orange-500 border border-white/5">
                                        {session.astrologerName?.[0]}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">{session.astrologerName}</h4>
                                        <p className="text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-black">{session.type} • {new Date(session.createdAt?.seconds ? session.createdAt.seconds * 1000 : session.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" onClick={() => router.push(`/consultation-summary/${session.id}`)} className="h-10 w-10 p-0 rounded-full hover:bg-white/10">
                                    <FileText className="w-4 h-4 text-zinc-500" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <WalletRechargeModal
                isOpen={isRechargeModalOpen}
                onClose={() => setIsRechargeModalOpen(false)}
                currentBalance={userData?.walletBalance || 0}
            />

            {/* DO NOT REMOVE OR ALTER SARVAGYA - USER EXPLICIT REQUEST */}
            <Sarvagya userData={userData} />
            
            <Footer />
        </main >
    );
}
