"use client";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useRouter } from "@/i18n/navigation";
import { ShieldAlert, Home, LogOut } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { toast } from "react-hot-toast";

export default function UnauthorizedPage() {
    const router = useRouter();

    const handleLogout = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
            toast.success("Logged out successfully");
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error("Failed to log out");
        }
    };

    return (
        <main className="min-h-screen flex flex-col bg-zinc-950 text-foreground">
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 blur-[120px] rounded-full -z-10" />
                
                <div className="max-w-[450px] w-full glass p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-red-500/10 text-center space-y-6 relative z-10">
                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-500/5">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black tracking-tight text-white">
                            Unauthorized Access
                        </h1>
                        <p className="text-sm text-foreground/50">
                            You do not have the necessary admin permissions to view this restricted console.
                        </p>
                    </div>

                    <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-xs text-red-400 font-medium">
                        If you are the administrator, please ensure you are signed in with the correct registered admin Gmail account.
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button
                            onClick={() => router.push("/")}
                            className="flex-1 h-12 bg-white/5 hover:bg-white/10 text-white font-bold text-sm rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            Back to Home
                        </Button>
                        <Button
                            onClick={handleLogout}
                            className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Log Out & Switch
                        </Button>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
