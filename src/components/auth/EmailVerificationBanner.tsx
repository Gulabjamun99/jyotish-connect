"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import { Mail, RefreshCw, LogOut, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmailVerificationBanner() {
    const { user } = useAuth();
    const [isVerified, setIsVerified] = useState(false);
    const [sending, setSending] = useState(false);
    const [checking, setChecking] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    // Sync state with Firebase Auth user instance
    useEffect(() => {
        if (user) {
            setIsVerified(user.emailVerified);
        }
    }, [user]);

    // Cooldown timer for resending verification mail
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    // If verified or no user, render nothing
    if (!user || !user.email || isVerified) {
        return null;
    }

    const handleResend = async () => {
        if (cooldown > 0) return;
        setSending(true);
        try {
            await sendEmailVerification(user);
            toast.success("Verification link sent! Please check your email inbox and spam folder.");
            setCooldown(60); // 1-minute cooldown
        } catch (error: any) {
            console.error("Resend Verification Error:", error);
            if (error.code === "auth/too-many-requests") {
                toast.error("Too many requests. Please wait a few moments before trying again.");
            } else {
                toast.error(error.message || "Failed to send verification link.");
            }
        } finally {
            setSending(false);
        }
    };

    const handleCheckStatus = async () => {
        setChecking(true);
        try {
            // Force Firebase to reload user token and verify state
            await user.reload();
            if (user.emailVerified) {
                setIsVerified(true);
                toast.success("Congratulations! Your email has been successfully verified. ✨", {
                    icon: "✨",
                    duration: 6000
                });
                // Force page refresh to update auth status globally
                setTimeout(() => window.location.reload(), 1000);
            } else {
                toast.error("Email not verified yet. Please check your inbox and click the verification link.");
            }
        } catch (error: any) {
            console.error("Check Verification Error:", error);
            toast.error("Failed to check status. Please check your internet connection.");
        } finally {
            setChecking(false);
        }
    };

    const handleSignOut = async () => {
        try {
            if (auth) {
                await signOut(auth);
                toast.success("Signed out successfully.");
                window.location.href = "/";
            }
        } catch (error: any) {
            toast.error("Failed to sign out.");
        }
    };

    return (
        <div className="w-full min-h-[70vh] flex items-center justify-center p-4 relative overflow-hidden bg-zinc-950">
            {/* Celestial background graphics */}
            <div className="absolute inset-0 z-0 opacity-40">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/10 blur-[130px] rounded-full animate-pulse" />
                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-500/5 blur-[100px] rounded-full" />
            </div>

            <div className="max-w-[480px] w-full glass p-8 sm:p-10 rounded-[3rem] border border-orange-500/20 shadow-2xl relative z-10 text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                {/* Glowing border stripe */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500" />
                
                {/* Icon Wrapper */}
                <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-orange-500/15 to-amber-500/5 rounded-[2.5rem] border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-[0_0_30px_rgba(249,115,22,0.15)] group hover:scale-105 transition-transform duration-500">
                    <Mail className="w-10 h-10 animate-pulse text-amber-300" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-zinc-950">
                        <ShieldAlert className="w-3.5 h-3.5 text-white" />
                    </div>
                </div>

                {/* Typography and Descriptions */}
                <div className="space-y-3.5">
                    <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em] mb-1 flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-orange-400" />
                        Align Your Cosmic Profile
                    </p>
                    <h2 className="text-3xl font-black text-white tracking-tight leading-none">
                        Verification Required
                    </h2>
                    <p className="text-xs text-zinc-400 font-medium px-2 leading-relaxed">
                        A verification link has been sent to <span className="text-amber-200 font-bold">{user.email}</span>. To protect your identity and access your dashboard, consultations, Kundli, and horoscopes, please verify your email first.
                    </p>
                </div>

                {/* Helpful Reminder Hint */}
                <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl text-[10px] text-zinc-400 font-bold uppercase tracking-wider text-left leading-relaxed">
                    💡 <span className="text-white">Did not receive it?</span> Check your email spam or junk folder, or click the "Resend Link" button below to dispatch a new one.
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3.5 pt-2">
                    <div className="grid grid-cols-2 gap-3.5">
                        <Button
                            onClick={handleCheckStatus}
                            disabled={checking}
                            variant="outline"
                            className="h-14 rounded-2xl border border-white/10 glass text-white hover:bg-white/5 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 text-orange-400 ${checking ? 'animate-spin' : ''}`} />
                            {checking ? "Checking..." : "Verify Status"}
                        </Button>

                        <Button
                            onClick={handleResend}
                            disabled={sending || cooldown > 0}
                            className="h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:shadow-orange-500/20 active:scale-95 disabled:opacity-50"
                        >
                            {sending ? (
                                "Sending..."
                            ) : cooldown > 0 ? (
                                `Resend in ${cooldown}s`
                            ) : (
                                "Resend Link"
                            )}
                        </Button>
                    </div>

                    <Button
                        onClick={handleSignOut}
                        variant="ghost"
                        className="h-12 w-full rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-4 h-4 text-zinc-600" />
                        Sign Out / Change Account
                    </Button>
                </div>
            </div>
        </div>
    );
}
