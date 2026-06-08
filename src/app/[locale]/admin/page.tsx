"use client";

import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UseProtectedRoute } from "@/hooks/useProtectedRoute";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, DollarSign, Clock, Settings, ShieldAlert, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Link } from "@/i18n/navigation";

export default function AdminDashboard() {
    const { user, role, loading } = UseProtectedRoute(["admin"]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeExperts: 0,
        totalBookings: 0,
        reportsCount: 0
    });
    const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                // 1. Fetch active experts & pending verifications
                const astroQuery = query(collection(db, "astrologers"));
                const astroSnapshot = await getDocs(astroQuery);
                let activeCount = 0;
                let pendingList: any[] = [];
                
                astroSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.verified === true) {
                        activeCount++;
                    } else if (data.profileComplete === true && data.verified === false) {
                        pendingList.push({ id: doc.id, ...data });
                    }
                });

                // 2. Fetch bookings
                const bookingsQuery = query(collection(db, "bookings"));
                const bookingsSnapshot = await getDocs(bookingsQuery);
                const totalBookings = bookingsSnapshot.size;

                // 3. Fetch transactions for revenue (recharge amount)
                const txQuery = query(
                    collection(db, "transactions"),
                    where("type", "==", "recharge"),
                    where("status", "==", "completed")
                );
                const txSnapshot = await getDocs(txQuery);
                let totalRevenue = 0;
                txSnapshot.forEach(doc => {
                    totalRevenue += doc.data().amount || 0;
                });

                setStats({
                    totalRevenue,
                    activeExperts: activeCount,
                    totalBookings,
                    reportsCount: 0 // Mocked
                });
                setPendingVerifications(pendingList);
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setStatsLoading(false);
            }
        };

        if (user && role === "admin") {
            fetchAdminStats();
        }
    }, [user, role]);

    if (loading || !user || statsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
        );
    }

    const statCards = [
        { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-500", desc: "Lifetime recharges" },
        { label: "Active Experts", value: stats.activeExperts.toString(), icon: Users, color: "text-orange-500", desc: "Verified astrologers" },
        { label: "Total Bookings", value: stats.totalBookings.toString(), icon: Clock, color: "text-blue-500", desc: "Total sessions booked" },
        { label: "Reports / Flagged", value: stats.reportsCount.toString(), icon: ShieldAlert, color: "text-red-500", desc: "Requires attention" },
    ];

    return (
        <main className="min-h-screen flex flex-col bg-zinc-950 text-foreground font-sans">
            <Navbar />
            <div className="container mx-auto px-4 pt-24 pb-12 flex-grow max-w-6xl">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-black mb-2 text-white tracking-tight">Admin Console</h1>
                        <p className="text-zinc-500 font-medium">Platform performance and revenue overview</p>
                    </div>
                    <Button variant="outline" className="gap-2 border-white/10 hover:border-orange-500/50 hover:bg-white/5 text-white">
                        <Settings className="w-4 h-4" /> System Settings
                    </Button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {statCards.map((stat, i) => (
                        <div key={i} className="glass p-6 rounded-[2rem] space-y-2 relative overflow-hidden border border-white/5 bg-zinc-900/50">
                            <div className="flex justify-between items-center text-zinc-500 text-xs font-black uppercase tracking-wider">
                                {stat.label}
                                <stat.icon className={stat.color + " w-5 h-5"} />
                            </div>
                            <div className="text-3xl font-black text-white">{stat.value}</div>
                            <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">{stat.desc}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <section className="lg:col-span-2 glass rounded-[2.5rem] p-8 space-y-6 border border-white/5 bg-zinc-900/50">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-white tracking-tight">Revenue Analytics</h2>
                            <BarChart3 className="text-orange-500 w-6 h-6" />
                        </div>
                        <div className="h-64 bg-zinc-950/50 rounded-2xl border border-dashed border-white/10 flex items-center justify-center">
                            <span className="text-zinc-500 italic text-sm">Revenue chart logs and charts</span>
                        </div>
                    </section>

                    <section className="glass rounded-[2.5rem] p-8 space-y-6 border border-white/5 bg-zinc-900/50">
                        <h2 className="text-xl font-black text-white tracking-tight">Pending Verifications ({pendingVerifications.length})</h2>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                            {pendingVerifications.length > 0 ? (
                                pendingVerifications.map(astro => (
                                    <div key={astro.id} className="flex items-center justify-between p-4 bg-zinc-950/40 rounded-2xl border border-white/5 hover:border-orange-500/20 transition-all">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={astro.photoURL || "/placeholder-avatar.png"}
                                                alt={astro.displayName}
                                                className="w-10 h-10 rounded-full object-cover border border-white/10"
                                            />
                                            <div>
                                                <p className="font-bold text-sm text-white truncate max-w-[130px]">{astro.displayName}</p>
                                                <p className="text-xs text-zinc-500">Exp: {astro.experience} years</p>
                                            </div>
                                        </div>
                                        <Link href={`/admin/verify-astrologers?reject=${astro.id}`}>
                                            <Button size="sm" variant="outline" className="text-xs border-orange-500/30 text-orange-500 hover:bg-orange-500/10 rounded-xl">
                                                Review
                                            </Button>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-zinc-600">
                                    <p className="text-sm italic">All caught up! No pending reviews.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
