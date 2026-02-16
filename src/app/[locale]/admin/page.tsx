"use client";

import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UseProtectedRoute } from "@/hooks/useProtectedRoute";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, DollarSign, Clock, Settings, ShieldAlert } from "lucide-react";

export default function AdminDashboard() {
    const { user, role, loading } = UseProtectedRoute(["admin"]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen flex flex-col bg-secondary/10">
            <Navbar />
            <div className="container mx-auto px-4 py-12 flex-grow">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 text-white">Admin Analytics</h1>
                        <p className="text-muted-foreground">Platform performance and revenue overview</p>
                    </div>
                    <Button variant="outline" className="gap-2 border-muted hover:border-orange-500/50">
                        <Settings className="w-4 h-4" /> System Settings
                    </Button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: "Total Revenue", value: "₹45,280", icon: DollarSign, color: "text-green-500", trend: "+12%" },
                        { label: "Active Experts", value: "54", icon: Users, color: "text-orange-500", trend: "+3" },
                        { label: "Total Bookings", value: "1,240", icon: Clock, color: "text-blue-500", trend: "+15%" },
                        { label: "Reports", value: "2", icon: ShieldAlert, color: "text-red-500", trend: "0" },
                    ].map((stat, i) => (
                        <div key={i} className="glass p-6 rounded-3xl space-y-2 relative overflow-hidden">
                            <div className="flex justify-between items-center text-muted-foreground text-sm">
                                {stat.label}
                                <stat.icon className={stat.color + " w-5 h-5"} />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <span className={`text-xs font-bold ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-muted-foreground'}`}>
                                    {stat.trend}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <section className="glass rounded-3xl p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">Revenue Graph</h2>
                            <BarChart3 className="text-orange-500 w-6 h-6" />
                        </div>
                        <div className="h-64 bg-secondary/20 rounded-2xl border border-dashed border-white/10 flex items-center justify-center">
                            <span className="text-muted-foreground italic">Revenue chart placeholder (Recharts/Chart.js)</span>
                        </div>
                    </section>

                    <section className="glass rounded-3xl p-8 space-y-6">
                        <h2 className="text-xl font-bold">Pending Verifications</h2>
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="flex items-center justify-between p-4 bg-background rounded-2xl border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-secondary" />
                                        <div>
                                            <p className="font-bold text-sm">Astro Deepak</p>
                                            <p className="text-xs text-muted-foreground">Expertise: Vedic</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" className="text-xs border-orange-500/50 text-orange-500 hover:bg-orange-500/10">
                                        Review Documents
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
