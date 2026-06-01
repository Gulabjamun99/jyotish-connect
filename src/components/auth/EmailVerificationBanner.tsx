"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { sendEmailVerification } from "firebase/auth";
import { toast } from "react-hot-toast";
import { Mail, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmailVerificationBanner() {
    const { user } = useAuth();
    const [isVerified, setIsVerified] = useState(false);
    const [sending, setSending] = useState(false);
    const [checking, setChecking] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    // Sync with Firebase user instance
    useEffect(() => {
        if (user) {
            setIsVerified(user.emailVerified);
        }
    }, [user]);

    // Handle verification email resending cooldown
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    // Show banner only if the user is authenticated via email and is NOT verified
    if (!user || !user.email || isVerified) {
        return null;
    }

    const handleResend = async () => {
        if (cooldown > 0) return;
        setSending(true);
        try {
            await sendEmailVerification(user);
            toast.success("Verification link sent! Please check your email inbox and spam folder.");
            setCooldown(60); // 1 minute cooldown
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
            // Force Firebase to reload user token and status
            await user.reload();
            if (user.emailVerified) {
                setIsVerified(true);
                toast.success("Congratulations! Your email has been successfully verified. ✨", {
                    icon: "✨",
                    duration: 5000
                });
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

    return (
        <div className="w-full bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border-b border-orange-500/20 backdrop-blur-md relative overflow-hidden animate-in fade-in slide-in-from-top duration-500">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-orange-500/[0.02] -z-10" />
            <div className="absolute -left-20 -top-20 w-48 h-48 bg-amber-500/10 blur-[80px] rounded-full -z-10" />

            <div className="container mx-auto px-4 md:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 text-center sm:text-left flex-col sm:flex-row">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)] animate-pulse">
                        <Mail className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                        <h4 className="text-xs font-black text-amber-200 uppercase tracking-widest flex items-center gap-1.5 justify-center sm:justify-start">
                            <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                            Email Verification Required
                        </h4>
                        <p className="text-[11px] text-zinc-300 font-medium">
                            Please verify <span className="text-white font-semibold">{user.email}</span> to secure your account and unlock all features.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
                    <Button
                        onClick={handleCheckStatus}
                        disabled={checking}
                        variant="ghost"
                        className="h-9 px-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5"
                    >
                        <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
                        Verify Status
                    </Button>
                    <Button
                        onClick={handleResend}
                        disabled={sending || cooldown > 0}
                        className="h-9 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-[10px] uppercase tracking-wider transition-all shadow-lg hover:shadow-orange-500/20 active:scale-95 disabled:opacity-50"
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
            </div>
        </div>
    );
}
