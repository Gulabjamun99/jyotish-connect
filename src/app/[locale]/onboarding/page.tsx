"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { User, Briefcase } from "lucide-react";

export default function RoleSelectionPage() {
    const { user, userData, loading } = useAuth();
    const [selectedRole, setSelectedRole] = useState<"user" | "astrologer" | null>(null);
    const [updating, setUpdating] = useState(false);
    const router = useRouter();

    if (loading) return null;

    const handleCompleteProfile = async () => {
        if (!user || !selectedRole) return;

        setUpdating(true);
        try {
            await updateDoc(doc(db, "users", user.uid), {
                role: selectedRole,
                profileCompleted: true,
            });

            toast.success(`Welcome aboard as a ${selectedRole}!`);
            router.push(selectedRole === "astrologer" ? "/astrologer/dashboard" : "/user/dashboard");
        } catch (error) {
            console.error("Error updating role:", error);
            toast.error("Failed to save selection");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col relative overflow-hidden">
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-6 relative">
                {/* Divine Background Effects */}
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full -z-10 animate-float" />
                <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-accent/5 blur-[150px] rounded-full -z-10 animate-float" style={{ animationDelay: '-2s' }} />
                <div className="max-w-2xl w-full space-y-12 text-center">
                    <div className="space-y-6 animate-slide-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mb-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Fate Alignment</span>
                        </div>
                        <h1 className="text-7xl font-black text-gradient tracking-tighter leading-none">Choose Your Path</h1>
                        <p className="text-sm text-foreground/40 font-medium italic">How would you like to manifest your presence in AstroPandit?</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <button
                            onClick={() => setSelectedRole("user")}
                            className={`p-10 rounded-[3rem] border-2 transition-all text-left space-y-6 glass shadow-2xl relative overflow-hidden group ${selectedRole === "user" ? "border-primary bg-primary/[0.02] scale-105" : "border-primary/5 hover:border-primary/20"
                                }`}
                        >
                            <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center transition-all ${selectedRole === "user" ? "orange-gradient text-white rotate-6" : "bg-primary/5 text-primary group-hover:bg-primary/10"}`}>
                                <User className="w-10 h-10" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-3xl font-black tracking-tight text-foreground uppercase">I am a Seeker</h3>
                                <p className="text-sm text-foreground/40 font-medium italic">Seek guidance, book celestial consultations, and explore ancient wisdom.</p>
                            </div>
                            {selectedRole === "user" && <div className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest text-primary">Selected</div>}
                        </button>

                        <button
                            onClick={() => setSelectedRole("astrologer")}
                            className={`p-10 rounded-[3rem] border-2 transition-all text-left space-y-6 glass shadow-2xl relative overflow-hidden group ${selectedRole === "astrologer" ? "border-primary bg-primary/[0.02] scale-105" : "border-primary/5 hover:border-primary/20"
                                }`}
                        >
                            <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center transition-all ${selectedRole === "astrologer" ? "orange-gradient text-white -rotate-6" : "bg-primary/5 text-primary group-hover:bg-primary/10"}`}>
                                <Briefcase className="w-10 h-10" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-3xl font-black tracking-tight text-foreground uppercase">I am a Master</h3>
                                <p className="text-sm text-foreground/40 font-medium italic">Provide divine counsel, manage your sacred schedule, and grow your practice.</p>
                            </div>
                            {selectedRole === "astrologer" && <div className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest text-primary">Selected</div>}
                        </button>
                    </div>

                    <Button
                        size="lg"
                        className="h-20 px-16 text-xs font-black uppercase tracking-[0.4em] orange-gradient disabled:opacity-50 transition-all rounded-[2rem] shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 animate-slide-up"
                        style={{ animationDelay: '0.2s' }}
                        disabled={!selectedRole || updating}
                        onClick={handleCompleteProfile}
                    >
                        {updating ? "Aligning Orbits..." : "Begin My Journey"}
                    </Button>
                </div>
            </div>
            <Footer />
        </main>
    );
}
