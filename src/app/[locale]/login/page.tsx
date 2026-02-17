"use client";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

declare global {
    interface Window {
        recaptchaVerifier: any;
    }
}

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/";
    const [loading, setLoading] = useState(false);

    // Helper to handle offline/flaky connections
    const getDocWithRetry = async (docRef: any, retries = 3): Promise<any> => {
        try {
            return await getDoc(docRef);
        } catch (err: any) {
            if ((err.message?.includes("offline") || err.code === 'unavailable') && retries > 0) {
                console.warn("Firestore offline, retrying...", retries);
                await new Promise(r => setTimeout(r, 2000));
                return getDocWithRetry(docRef, retries - 1);
            }
            throw err;
        }
    };

    // OTP State
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    const handleGoogleLogin = async () => {
        // Safe check for mock auth (if env vars missing)
        if (!auth || !auth.app) {
            console.error("Auth object is invalid/mock.", auth);
            toast.error("Configuration Error: Firebase keys missing. Please redeploy.");
            return;
        }

        setLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            await handleUserAuth(user);
        } catch (error: any) {
            console.error("Login error:", error);
            handleAuthError(error);
        } finally {
            setLoading(false);
        }
    };

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => {
                    // reCAPTCHA solved
                }
            });
        }
    };

    const handleSendOtp = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            toast.error("Please enter a valid phone number (e.g., +919999999999)");
            return;
        }

        setLoading(true);
        try {
            setupRecaptcha();
            const appVerifier = window.recaptchaVerifier;
            const formattedNumber = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;

            const result = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
            setConfirmationResult(result);
            setShowOtpInput(true);
            toast.success("OTP sent! (Use 123456 if testing)");
        } catch (error: any) {
            console.error("OTP Error:", error);
            toast.error(error.message || "Failed to send OTP");
            if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || !confirmationResult) {
            toast.error("Please enter the OTP");
            return;
        }
        setLoading(true);
        try {
            console.log("Verifying OTP...");
            const result = await confirmationResult.confirm(otp);
            const user = result.user;
            console.log("OTP verified successfully, user:", user.uid);
            await handleUserAuth(user);
        } catch (error: any) {
            console.error("OTP Verification Error:", error);
            toast.error(error.message || "Invalid OTP. Please try again.");
            setLoading(false);
        }
    };

    const handleUserAuth = async (user: any) => {
        try {
            console.log("Checking user auth status for:", user.uid);

            let userDoc = null;
            let astroDoc = null;
            let firestoreAvailable = true;

            // Try to check Firestore, but don't fail if offline
            try {
                userDoc = await getDocWithRetry(doc(db, "users", user.uid));
                astroDoc = await getDocWithRetry(doc(db, "astrologers", user.uid));
            } catch (firestoreError: any) {
                console.warn("Firestore unavailable, proceeding without user check:", firestoreError.message);
                firestoreAvailable = false;
                toast("Firestore offline - using temporary session", { icon: "⚠️" });
            }

            // If Firestore is offline OR user doesn't exist, treat as new user
            if (!firestoreAvailable || (!userDoc?.exists() && !astroDoc?.exists())) {
                const roleParam = searchParams.get("role");
                const targetRole = roleParam === "astrologer" ? "astrologer" : "user";

                if (firestoreAvailable) {
                    // Only try to create document if Firestore is available
                    const collectionName = targetRole === "astrologer" ? "astrologers" : "users";
                    console.log("Creating new user document in:", collectionName);

                    try {
                        await setDoc(doc(db, collectionName, user.uid), {
                            uid: user.uid,
                            email: user.email || "",
                            phoneNumber: user.phoneNumber || "",
                            displayName: user.displayName || "New User",
                            photoURL: user.photoURL || "",
                            role: targetRole,
                            createdAt: new Date().toISOString(),
                            walletBalance: 0,
                            ...(targetRole === "astrologer" && {
                                verified: false,
                                profileComplete: false,
                                experience: 0,
                                rating: 0,
                                consultations: 0,
                                bio: "New Expert"
                            })
                        });
                    } catch (writeError) {
                        console.warn("Failed to write to Firestore, continuing anyway:", writeError);
                    }
                }

                toast.success(targetRole === "astrologer" ? "Welcome Expert! Please complete your profile." : "Welcome to JyotishConnect!");

                if (targetRole === "astrologer") {
                    console.log("Redirecting to astrologer onboarding");
                    setTimeout(() => {
                        router.push("/astrologer/onboarding");
                    }, 500);
                    return;
                }
            }

            console.log("Redirecting to:", redirect);
            setTimeout(() => {
                router.push(redirect);
            }, 500);
        } catch (error: any) {
            console.error("User Auth Error:", error);
            toast.error("Failed to complete authentication. Please try again.");
            setLoading(false);
        }
    };

    const handleAuthError = (error: any) => {
        console.error("Auth Error Detail:", error);
        let msg = error.message || "Failed to login";
        if (error.code === 'auth/popup-closed-by-user') msg = "Login popup was closed.";
        else if (error.code === 'auth/cancelled-popup-request') msg = "Only one popup allowed at a time.";
        else if (error.code === 'auth/network-request-failed') msg = "Network error. Check your connection.";
        else if (error.code === 'auth/invalid-api-key') msg = "Invalid Firebase API Key. Check config.";
        else if (error.code === 'auth/configuration-not-found') msg = "Google Sign-In is disabled in Console.";
        else if (error.code === 'auth/internal-error') {
            msg = "Phone Auth is likely disabled. Enable 'Phone' in Firebase Console.";
        }
        else if (error.code === 'auth/invalid-phone-number') msg = "Invalid phone number format.";

        toast.error(msg, { duration: 5000 });
    };

    return (
        <main className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-4 bg-transparent relative overflow-hidden">
                {/* Divine Background Effects */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full -z-10 animate-float" />

                <div className="max-w-md w-full glass p-10 rounded-[3rem] space-y-10 animate-slide-up shadow-2xl border-primary/10">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mb-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Divine Access</span>
                        </div>
                        <h1 className="text-4xl font-black text-gradient tracking-tighter">
                            Welcome Back
                        </h1>
                        <p className="text-sm text-foreground/40 font-medium italic">Begin your spiritual journey once more</p>
                    </div>

                    <div className="space-y-4">
                        <Button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full h-14 bg-white text-foreground hover:bg-sky-50 font-bold text-lg flex items-center justify-center gap-4 rounded-2xl shadow-xl shadow-primary/5 border border-primary/10 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                            {loading ? "Signing in..." : "Continue with Google"}
                        </Button>

                        <div className="relative py-6">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-primary/10"></div></div>
                            <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white/50 backdrop-blur-sm px-4 text-foreground/40 font-black tracking-widest">Or Divine Phone</span></div>
                        </div>

                        {/* OTP Logic Section */}
                        <div id="recaptcha-container"></div>

                        {!showOtpInput ? (
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Phone Identity</label>
                                    <input
                                        type="tel"
                                        className="flex h-16 w-full rounded-2xl border border-primary/10 bg-primary/5 px-6 py-2 text-lg font-bold placeholder:text-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-foreground"
                                        placeholder="+91 99999 99999"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                    />
                                </div>
                                <Button
                                    onClick={handleSendOtp}
                                    className="w-full h-16 orange-gradient hover:opacity-90 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                                    disabled={loading}
                                >
                                    {loading ? "Requesting..." : "Send Divine OTP"}
                                </Button>
                                <p className="text-[9px] text-center text-foreground/30 font-bold uppercase tracking-widest leading-relaxed">
                                    *For Trial: Use +919999999999 and 123456
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1 text-center block w-full">Verification Code</label>
                                    <input
                                        type="text"
                                        className="flex h-16 w-full rounded-2xl border border-primary/10 bg-primary/5 px-6 py-2 text-2xl text-center tracking-[0.5em] font-black focus:border-primary/50 outline-none transition-all text-foreground"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength={6}
                                    />
                                </div>
                                <Button
                                    onClick={handleVerifyOtp}
                                    className="w-full h-16 orange-gradient hover:opacity-90 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                                    disabled={loading}
                                >
                                    {loading ? "Authenticating..." : "Establish Presence"}
                                </Button>
                                <button onClick={() => setShowOtpInput(false)} className="w-full text-[10px] font-black uppercase tracking-widest text-foreground/30 hover:text-primary transition-colors">
                                    Change Identity Pattern
                                </button>
                            </div>
                        )}
                    </div>

                    <p className="text-center text-[10px] font-black uppercase tracking-widest text-foreground/20">
                        By ascending, you honor our <a href="/terms" className="text-primary hover:text-primary/80">Divine Terms</a> & <a href="/privacy" className="text-primary hover:text-primary/80">Spirit Privacy</a>
                    </p>
                </div>
            </div>
            <Footer />
        </main>
    );
}
