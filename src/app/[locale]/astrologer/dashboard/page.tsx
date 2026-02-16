"use client";

import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UseProtectedRoute } from "@/hooks/useProtectedRoute";
import { Button } from "@/components/ui/button";
import { Calendar, IndianRupee, Users, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useState, useEffect } from "react";
import { getAstrologerBookings } from "@/services/firestore";

export default function AstrologerDashboard() {
    const { user, userData, loading } = UseProtectedRoute(["astrologer"]);
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            getAstrologerBookings(user.uid).then(data => {
                const sorted = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setBookings(sorted);
            });
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
        <main className="min-h-screen flex flex-col bg-transparent overflow-hidden selection:bg-primary/30">
            <Navbar />
            <div className="container mx-auto px-6 py-16 flex-grow relative">
                {/* Background Glows */}
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full -z-10" />
                <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-accent/5 blur-[150px] rounded-full -z-10" />

                <header className="flex flex-col md:flex-row justify-between items-end md:items-center gap-8 mb-20 animate-slide-up">
                    <div className="space-y-4">
                        <h1 className="text-7xl font-black text-gradient tracking-tighter leading-none">Master Console</h1>
                        <p className="text-sm text-foreground/40 font-medium italic">Architect of Destiny: <span className="text-primary font-black uppercase tracking-widest">{user.displayName}</span></p>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-green-500/10 text-green-500 rounded-full border border-green-500/20 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-green-500/5">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        In Resonance & Active
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    {[
                        { label: "Divine Earnings", value: `₹${userData?.walletBalance || 0}`, icon: IndianRupee, color: "from-primary/20" },
                        { label: "Sacred Sessions", value: userData?.consultations || "0", icon: Clock, color: "from-blue-500/20" },
                        { label: "Seeker Circle", value: "0", icon: Users, color: "from-accent/20" },
                        { label: "Celestial Favor", value: userData?.rating?.toFixed(1) || "5.0", icon: TrendingUp, color: "from-green-500/20" },
                    ].map((stat, i) => (
                        <div key={i} className="glass p-8 rounded-[3rem] space-y-4 group hover:border-primary/20 transition-all relative overflow-hidden shadow-xl border-primary/10">
                            <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${stat.color} blur-[80px] opacity-30`} />
                            <div className="flex justify-between items-center text-foreground/20 text-[10px] font-black uppercase tracking-[0.3em]">
                                {stat.label}
                                <stat.icon className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity text-primary" />
                            </div>
                            <div className="text-5xl font-black text-foreground group-hover:scale-105 transition-transform origin-left">{stat.value}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Calendar/Availability */}
                    <section className="lg:col-span-8 space-y-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xl">
                                    <Calendar className="w-6 h-6 text-primary" />
                                </div>
                                <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase">Timeline of Truth</h2>
                            </div>
                            <Button size="sm" variant="outline" className="h-12 px-8 rounded-2xl glass border-primary/10 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 transition-all">
                                Adjust Slots
                            </Button>
                        </div>

                        <div className="glass rounded-[3rem] p-8 border-primary/10 shadow-2xl space-y-6">
                            {(bookings.length === 0) ? (
                                <div className="text-center py-10 space-y-6">
                                    <div className="text-7xl opacity-50">🗓️</div>
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">The Silence of the Stars</h3>
                                        <p className="text-sm text-foreground/40 max-w-sm mx-auto font-medium italic">
                                            The orbits of your future callers are yet to intersect with yours. Clear your mental path.
                                        </p>
                                    </div>
                                    <Button
                                        className="orange-gradient text-white font-black h-14 px-8 rounded-2xl shadow-xl uppercase tracking-[0.2em] text-xs hover:scale-105 transition-transform"
                                        onClick={() => router.push('/consult/demo-session?demo=true')}
                                    >
                                        Initiate Live Test
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {bookings.map((booking: any) => (
                                        <div key={booking.id} className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-[2rem] bg-white/50 border border-primary/5 hover:border-primary/20 transition-all group hover:shadow-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 font-black text-xl">
                                                    {new Date(booking.date?.seconds ? booking.date.seconds * 1000 : booking.date).getDate()}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-black uppercase tracking-widest text-primary mb-1">
                                                        {new Date(booking.date?.seconds ? booking.date.seconds * 1000 : booking.date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                                    </div>
                                                    <div className="text-xl font-bold text-foreground">
                                                        {booking.time} IST
                                                    </div>
                                                    <div className="text-xs text-foreground/40 font-medium mt-1">
                                                        User: {booking.userName || "Seeker"} • {booking.type}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 w-full md:w-auto">
                                                <Button
                                                    onClick={() => router.push(`/consult/${booking.id}?type=${booking.type}`)}
                                                    className="flex-1 md:flex-none h-12 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider"
                                                >
                                                    Join Room
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="h-12 w-12 rounded-xl border-primary/10 hover:bg-primary/5 p-0 flex items-center justify-center"
                                                    title="Add to Calendar"
                                                    onClick={() => {
                                                        const b = booking;
                                                        const bookingDate = b.date?.toDate ? b.date.toDate() : new Date(b.date?.seconds ? b.date.seconds * 1000 : b.date);
                                                        const [hours, minutes] = b.time.split(':').map(Number);
                                                        bookingDate.setHours(hours || 0, minutes || 0);

                                                        const end = new Date(bookingDate.getTime() + 30 * 60000);
                                                        const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

                                                        const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//JyotishConnect//EN
BEGIN:VEVENT
UID:${b.id}@jyotishconnect.com
DTSTAMP:${fmt(new Date())}
DTSTART:${fmt(bookingDate)}
DTEND:${fmt(end)}
SUMMARY:Consultation with ${b.userName || 'Seeker'}
DESCRIPTION:Join here: https://jyotishconnect.com/consult/${b.id}
LOCATION:https://jyotishconnect.com/consult/${b.id}
END:VEVENT
END:VCALENDAR`;

                                                        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
                                                        const url = window.URL.createObjectURL(blob);
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        a.download = 'session.ics';
                                                        document.body.appendChild(a);
                                                        a.click();
                                                        document.body.removeChild(a);
                                                    }}
                                                >
                                                    <Calendar className="w-5 h-5 text-primary" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Past Actions */}
                    <aside className="lg:col-span-4 space-y-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <h2 className="text-2xl font-black text-foreground/20 uppercase tracking-[0.4em]">Direct Rituals</h2>
                        <div className="flex flex-col gap-4">
                            <Button className="w-full h-24 justify-between px-8 rounded-[2.5rem] orange-gradient text-white shadow-2xl shadow-primary/20 group overflow-hidden transition-all hover:scale-[1.02]">
                                <div className="flex items-center gap-6">
                                    <IndianRupee className="w-8 h-8" />
                                    <div className="text-left">
                                        <div className="font-black text-[10px] uppercase tracking-[0.3em] opacity-80">Wealth</div>
                                        <div className="text-lg font-black uppercase tracking-tight">Withdraw Funds</div>
                                    </div>
                                </div>
                                <span className="text-2xl group-hover:translate-x-2 transition-transform">→</span>
                            </Button>

                            {/* Past Sessions List */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-foreground/40 uppercase tracking-widest pl-2">Past Alignments</h3>
                                {bookings.filter(b => b.status === 'completed').length === 0 ? (
                                    <div className="p-8 rounded-[2.5rem] bg-primary/5 text-center text-xs text-foreground/40 font-medium italic">
                                        No completed sessions yet.
                                    </div>
                                ) : (
                                    bookings.filter(b => b.status === 'completed').slice(0, 3).map(b => (
                                        <div key={b.id} className="p-6 rounded-[2rem] glass border-primary/5 group hover:border-primary/20 transition-all flex justify-between items-center">
                                            <div>
                                                <div className="text-sm font-bold">{b.userName || "Seeker"}</div>
                                                <div className="text-[10px] text-foreground/40 uppercase tracking-wider">{new Date(b.createdAt).toLocaleDateString()}</div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.push(`/consultation-summary/${b.id}`)}
                                                className="rounded-xl border-primary/10 hover:bg-primary/5 text-[10px] uppercase tracking-wider font-bold"
                                            >
                                                Transcript
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <button className="w-full h-20 px-10 rounded-[2.5rem] border border-dashed border-red-500/20 hover:bg-red-500/5 group transition-all flex items-center justify-center gap-4">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                <span className="font-black text-[10px] uppercase tracking-[0.4em] text-red-500/60 group-hover:text-red-500 transition-colors">Go Offline</span>
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
            <Footer />
        </main>
    );
}
