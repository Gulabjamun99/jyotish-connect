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

import { TransactionHistory } from "@/components/profile/TransactionHistory";
import { WalletRechargeModal } from "@/components/payment/WalletRechargeModal";
import { toast } from "react-hot-toast";

export default function UserDashboard() {
    const { user, userData, loading } = UseProtectedRoute(["user"]);
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            getUserBookings(user.uid).then(data => {
                // Sort by date desc
                const sorted = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setBookings(sorted);
            });
        }
    }, [user]);

    // Remove mock transactions array

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
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
                            <p className="text-sm font-medium text-zinc-400">Your celestial journey unfolds here</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                        {!userData?.profileComplete && (
                            <Button
                                onClick={() => router.push('/user/profile/edit')}
                                className="w-full md:w-auto h-10 px-6 bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-500/20 animate-pulse"
                            >
                                Complete Profile
                            </Button>
                        )}
                        <div className="flex-1 md:flex-none glass bg-zinc-950/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-6 hover:border-orange-500/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                                    <Wallet className="w-5 h-5 text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Wallet Balance</p>
                                    <p className="text-xl font-black text-white">₹{userData?.walletBalance || 0}</p>
                                </div>
                            </div>
                            <Button
                                onClick={() => {
                                    if (!userData?.profileComplete) {
                                        toast.error("Please complete your profile first.");
                                        router.push('/user/profile/edit');
                                    } else {
                                        setIsRechargeModalOpen(true);
                                    }
                                }}
                                className="h-10 px-4 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold text-xs uppercase tracking-wider"
                            >
                                Recharge
                            </Button>
                        </div>
                    </div>
                </div>
            </div >

            {/* Profile Incomplete Banner */}
            {
                !userData?.profileComplete && (
                    <div className="bg-red-500/10 border-y border-red-500/20 py-3 px-4 text-center">
                        <p className="text-red-400 text-xs font-bold tracking-widest uppercase">
                            ⚠️ Action Required: Please complete your profile to book consultations and recharge your wallet.
                        </p>
                    </div>
                )
            }

            <div className="container mx-auto px-4 md:px-8 py-10 space-y-10">

                {/* TOP ROW: Next Session & Horoscope */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Active Consultation */}
                    <div className="lg:col-span-2 glass bg-zinc-900 border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full group-hover:bg-orange-500/20 transition-colors" />

                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                                <Video className="w-4 h-4 text-orange-500" />
                                Up Next
                            </h2>
                            {bookings.length > 0 && bookings[0].status !== 'completed' && (
                                <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-widest rounded text-center">
                                    Ready to Join
                                </span>
                            )}
                        </div>

                        {bookings.length > 0 && bookings[0].status !== 'completed' ? (
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="flex gap-5 items-center z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center font-black text-2xl text-orange-500 shadow-xl">
                                        {bookings[0].astrologerName?.[0] || 'A'}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-bold text-white tracking-tight">{bookings[0].astrologerName}</h3>
                                        <p className="text-sm font-medium text-zinc-400 capitalize">{bookings[0].type} Consultation • {bookings[0].time === 'Instant' ? 'Starting Now' : bookings[0].time}</p>
                                    </div>
                                </div>
                                <div className="flex w-full md:w-auto gap-3 mt-4 md:mt-0 z-10">
                                    <Button
                                        onClick={() => router.push(`/consult/${bookings[0].id}?type=${bookings[0].type}`)}
                                        className="h-14 flex-1 md:px-8 bg-green-500 hover:bg-green-600 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-pulse"
                                    >
                                        Join Session
                                    </Button>
                                    <Button variant="outline" className="h-14 w-14 p-0 rounded-xl border-zinc-800 hover:bg-zinc-800 text-white flex-shrink-0 flex justify-center items-center">
                                        <Calendar className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 z-10 relative">
                                <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                                    <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-bold text-zinc-300">No Upcoming Sessions</h3>
                                <p className="text-xs text-zinc-500 mt-1">Book an astrologer to seek guidance.</p>
                            </div>
                        )}
                    </div>

                    {/* Daily Horoscope Snapshot */}
                    <div className="glass bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/5 rounded-3xl p-6 md:p-8 relative">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-500" />
                                Daily Snapshot
                            </h2>
                            <span className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest">Today</span>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                <span className="text-2xl">♈</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-white">Aries</h3>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-500">March 21 - April 19</p>
                            </div>
                        </div>
                        <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed mb-6">
                            The moon transits your sector of communication today, bringing mental clarity. A highly favorable day to solve outstanding problems at work.
                        </p>
                        <Button
                            variant="ghost"
                            className="w-full h-12 border border-zinc-800 hover:bg-zinc-800 text-xs font-bold uppercase tracking-widest rounded-xl"
                            onClick={() => router.push('/horoscope')}
                        >
                            Read Full Horoscope
                        </Button>
                    </div>
                </div>

                {/* MIDDLE ROW: Saved Kundlis & Recs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Saved Kundlis */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">My Saved Kundlis</h2>
                            <Button variant="ghost" className="text-xs uppercase font-bold tracking-widest text-orange-500 hover:text-orange-400 hover:bg-transparent px-0">
                                View All
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Profile 1 */}
                            <div className="glass bg-zinc-900 border border-white/5 p-5 rounded-2xl flex items-start justify-between group hover:border-orange-500/30 transition-all cursor-pointer hover:shadow-xl">
                                <div className="space-y-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold border border-orange-500/20">
                                        M
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">Main Profile</p>
                                        <p className="text-xs text-zinc-500 mt-0.5">14 Jun 1995 • 05:30 PM</p>
                                        <p className="text-xs text-zinc-500">New Delhi, India</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="text-zinc-500 group-hover:text-orange-500 border border-transparent group-hover:border-orange-500/20">
                                    <FileText className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Profile 2 (Family) */}
                            <div className="glass bg-zinc-900 border border-white/5 p-5 rounded-2xl flex items-start justify-between group hover:border-orange-500/30 transition-all cursor-pointer hover:shadow-xl">
                                <div className="space-y-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold border border-blue-500/20">
                                        S
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">Sister Khushi</p>
                                        <p className="text-xs text-zinc-500 mt-0.5">22 Aug 1999 • 02:15 AM</p>
                                        <p className="text-xs text-zinc-500">Mumbai, India</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="text-zinc-500 group-hover:text-blue-500 border border-transparent group-hover:border-blue-500/20">
                                    <FileText className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Add New */}
                            <div
                                onClick={() => router.push('/kundli')}
                                className="glass bg-zinc-900/50 border border-dashed border-zinc-700 p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:bg-zinc-800 transition-all hover:border-orange-500/50"
                            >
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Add New Profile</p>
                            </div>
                        </div>
                    </div>

                    {/* Transaction History (Small preview) */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
                            <Button
                                onClick={() => router.push('/user/transactions')}
                                variant="ghost"
                                className="text-xs uppercase font-bold tracking-widest text-orange-500 hover:text-orange-400 hover:bg-transparent px-0"
                            >
                                View History
                            </Button>
                        </div>
                        <div className="glass bg-zinc-900 border border-white/5 rounded-3xl p-6">
                            <p className="text-center text-sm text-zinc-500 py-6">
                                Please visit your detailed <span className="text-orange-500 cursor-pointer" onClick={() => router.push('/user/transactions')}>History</span> page.
                            </p>
                        </div>
                    </div>
                </div>

                {/* BOTTOM ROW: Consultation History Log */}
                <section className="space-y-6 pt-6">
                    <div className="flex items-center gap-3">
                        <History className="w-5 h-5 text-zinc-400" />
                        <h2 className="text-xl font-bold text-white">Consultation History</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {bookings.length > 0 ? (
                            bookings.map((session) => (
                                <div key={session.id} className="glass bg-zinc-900 border border-white/5 p-5 md:p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-zinc-700 transition-[border-color]">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center font-black text-xl text-zinc-400 border border-zinc-700">
                                            {session.astrologerName?.[0] || 'A'}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">
                                                {session.astrologerName}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">
                                                <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                                                <span className="text-orange-500 capitalize">{session.type} Mode</span>
                                                <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                                                <span className={session.status === 'completed' ? 'text-green-500' : 'text-amber-500'}>
                                                    {session.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full md:w-auto h-12 rounded-xl border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 gap-2 px-6"
                                        onClick={() => router.push(`/consultation-summary/${session.id}`)}
                                    >
                                        <FileText className="w-4 h-4" /> View Report
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="glass bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl p-12 text-center">
                                <p className="text-zinc-500 text-sm">You haven't had any consultations yet.</p>
                                <Button
                                    className="mt-4 bg-white text-black hover:bg-zinc-200 font-bold uppercase tracking-wider text-xs px-6 py-2 rounded-xl"
                                    onClick={() => router.push('/search')}
                                >
                                    Browse Astrologers
                                </Button>
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

            <Footer />
        </main >
    );
}
