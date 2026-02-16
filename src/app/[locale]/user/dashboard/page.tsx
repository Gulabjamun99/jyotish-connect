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

export default function UserDashboard() {
    const { user, userData, loading } = UseProtectedRoute(["user"]);
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            getUserBookings(user.uid).then(data => {
                // Sort by date desc
                const sorted = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setBookings(sorted);
            });
        }
    }, [user]);


    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen flex flex-col bg-transparent overflow-hidden selection:bg-primary/30">
            <Navbar />

            <div className="container mx-auto px-6 py-16 flex-grow relative">
                {/* Cosmic Background Elements */}
                <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10 animate-float" />
                <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-accent/5 blur-[120px] rounded-full -z-10 animate-float" style={{ animationDelay: '-2s' }} />

                <header className="mb-16 space-y-4 animate-slide-up">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.5rem] orange-gradient flex items-center justify-center shadow-2xl shadow-primary/20 border border-white/20">
                            <span className="text-3xl font-black text-white">{user.displayName?.[0] || "U"}</span>
                        </div>
                        <div>
                            <h1 className="text-5xl font-black text-gradient tracking-tighter leading-none">Namaste, {user.displayName?.split(' ')[0]}</h1>
                            <p className="text-sm text-foreground/40 font-medium italic">Your celestial journey unfolds here</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="glass p-8 rounded-[2.5rem] space-y-6 group hover:border-primary/30 transition-all border-primary/10">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground/40 group-hover:text-primary transition-colors">Orbit Balance</span>
                            <Wallet className="text-foreground/20 group-hover:text-primary transition-colors w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                            <div className="text-4xl font-black text-foreground">₹{userData?.walletBalance || 0}</div>
                            <div className="text-[10px] text-foreground/40 font-medium uppercase tracking-widest">Available Credit</div>
                        </div>
                        <Button className="w-full orange-gradient font-black h-14 rounded-2xl shadow-xl shadow-primary/20 text-white uppercase tracking-widest text-[10px]">Recharge Now</Button>
                    </div>

                    <div className="glass p-8 rounded-[2.5rem] space-y-6 group hover:border-primary/30 transition-all border-primary/10">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground/40 group-hover:text-primary transition-colors">Celestial Transit</span>
                            <Video className="text-foreground/20 group-hover:text-primary transition-colors w-5 h-5" />
                        </div>

                        {bookings.length > 0 && bookings[0].status !== 'completed' ? (
                            <>
                                <div className="space-y-1">
                                    <div className="text-xl font-bold text-foreground">{bookings[0].astrologerName}</div>
                                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">
                                        {bookings[0].time === 'Instant' ? 'Ready to Join' : `Scheduled: ${bookings[0].time}`}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1 h-14 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold animate-pulse shadow-lg shadow-green-500/20 text-[11px] uppercase tracking-widest transition-all"
                                        onClick={() => router.push(`/consult/${bookings[0].id}?type=${bookings[0].type}`)}
                                    >
                                        Join Ritual Room
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-14 w-14 rounded-2xl border-primary/10 hover:bg-primary/5 flex items-center justify-center"
                                        title="Add to Calendar"
                                        onClick={() => {
                                            const b = bookings[0];
                                            const bookingDate = b.date?.toDate ? b.date.toDate() : new Date(b.date);
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
SUMMARY:Astrology Session with ${b.astrologerName}
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
                            </>
                        ) : (
                            <>
                                <div className="space-y-1">
                                    <div className="text-xl font-bold text-foreground/60 italic">No Active Transits</div>
                                    <p className="text-[10px] text-foreground/40 font-medium uppercase tracking-widest">Next guidance awaiting booking</p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full h-14 rounded-2xl border-primary/10 bg-primary/5 hover:bg-primary/10 font-bold text-primary text-[11px] uppercase tracking-widest transition-all"
                                    onClick={() => router.push('/consult/demo-session?demo=true')}
                                >
                                    Start Demo Ritual
                                </Button>
                            </>
                        )}
                    </div>

                    <div className="glass p-8 rounded-[2.5rem] space-y-6 group hover:border-accent/30 transition-all border-accent/10">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground/40 group-hover:text-accent transition-colors">Soul Reviews</span>
                            <Star className="text-foreground/20 group-hover:text-accent transition-colors w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                            <div className="text-4xl font-black text-foreground">0</div>
                            <div className="text-[10px] text-foreground/40 font-medium uppercase tracking-widest">Shared Insights</div>
                        </div>
                        <div className="h-14 flex items-center justify-center border border-dashed border-primary/10 rounded-2xl text-[9px] font-bold text-foreground/20 uppercase tracking-widest">
                            Contribute Wisdom
                        </div>
                    </div>
                </div>

                <section className="space-y-10 pb-20 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-2xl">
                                <History className="w-6 h-6 text-primary" />
                            </div>
                            <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase">Previous Alignments</h2>
                        </div>
                        <div className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em]">Scroll for more</div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {bookings.map((session) => (
                            <div key={session.id} className="relative group overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]" />
                                <div className="glass p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-primary/10 transition-all group-hover:scale-[1.01] group-hover:border-primary/20 shadow-xl">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-[1.5rem] bg-white flex items-center justify-center font-black text-3xl text-primary border border-primary/10 shadow-2xl transition-transform group-hover:rotate-6">
                                            {session.astrologerName?.[0] || 'A'}
                                        </div>
                                        <div className="space-y-1.5">
                                            <h3 className="text-2xl font-black tracking-tighter group-hover:text-primary transition-colors uppercase text-foreground">
                                                {session.astrologerName}
                                            </h3>
                                            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                                                <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 bg-primary/20 rounded-full" />
                                                <span className="text-primary capitalize">{session.type} Mode</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8 w-full md:w-auto">
                                        <div className="text-right hidden md:block space-y-1">
                                            <div className="text-xl font-black text-foreground/80">30 min</div>
                                            <div className={`text-[9px] font-black uppercase tracking-[0.2em] ${session.status === 'completed' ? 'text-green-500' : 'text-orange-500'}`}>
                                                {session.status === 'completed' ? 'Transited' : 'Confirmed'}
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="flex-grow md:flex-grow-0 h-16 px-10 rounded-2xl glass border-primary/10 hover:bg-primary hover:text-white hover:border-primary transition-all font-black text-[10px] uppercase tracking-[0.2em] gap-4"
                                            onClick={() => router.push(`/consultation-summary/${session.id}`)}
                                        >
                                            <FileText className="w-5 h-5" /> View Transcript
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
            <Footer />
        </main>
    );
}
