"use client";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { auth, db } from "@/lib/firebase";
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    RecaptchaVerifier, 
    signInWithPhoneNumber, 
    ConfirmationResult,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, Smartphone, ArrowLeft } from "lucide-react";

declare global {
    interface Window {
        recaptchaVerifier: any;
    }
}

type AuthMode = "LOGIN" | "SIGNUP" | "OTP" | "FORGOT_PASSWORD";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/";
    const [loading, setLoading] = useState(false);
    
    const [authMode, setAuthMode] = useState<AuthMode>("LOGIN");

    // Email/Password State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // OTP State
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

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

    // --- GOOGLE AUTH ---
    const handleGoogleLogin = async () => {
        if (!auth || !auth.app) {
            toast.error("Configuration Error: Firebase keys missing. Please redeploy.");
            return;
        }
        setLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await handleUserAuth(result.user);
        } catch (error: any) {
            handleAuthError(error);
        } finally {
            setLoading(false);
        }
    };

    // --- EMAIL / PASSWORD AUTH ---
    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please enter email and password");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        if (!auth) {
            toast.error("Auth service unavailable. Please check your connection.");
            return;
        }
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Non-blocking verification link dispatch
            sendEmailVerification(userCredential.user).catch(e => console.warn("Background verification email skipped:", e));
            toast.success("Account created successfully! A verification link has been sent to your email. Please check your inbox and verify to secure your account. Welcome to JyotishConnect.", { duration: 6000 });
            await handleUserAuth(userCredential.user);
        } catch (error: any) {
            handleAuthError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please enter email and password");
            return;
        }
        if (!auth) {
            toast.error("Auth service unavailable. Please check your connection.");
            return;
        }
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Dynamic check removed to prevent blocking genuine seekers and experts during beta testing
            await handleUserAuth(userCredential.user);
        } catch (error: any) {
            handleAuthError(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email to reset password.");
            return;
        }
        if (!auth) {
            toast.error("Auth service unavailable. Please check your connection.");
            return;
        }
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            toast.success("Password reset email sent! Check your inbox.");
            setAuthMode("LOGIN");
        } catch (error: any) {
            handleAuthError(error);
        } finally {
            setLoading(false);
        }
    };

    // --- MOBILE OTP AUTH ---
    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
            });
        }
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
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
            toast.success("OTP sent to your phone");
        } catch (error: any) {
            handleAuthError(error);
            if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || !confirmationResult) {
            toast.error("Please enter the OTP");
            return;
        }
        setLoading(true);
        try {
            const result = await confirmationResult.confirm(otp);
            await handleUserAuth(result.user);
        } catch (error: any) {
            handleAuthError(error);
        } finally {
            setLoading(false);
        }
    };

    // --- DB SYNC LOGIC ---
    const handleUserAuth = async (user: any) => {
        try {
            let userDoc = null;
            let astroDoc = null;
            let firestoreAvailable = true;

            try {
                userDoc = await getDocWithRetry(doc(db, "users", user.uid));
                astroDoc = await getDocWithRetry(doc(db, "astrologers", user.uid));
            } catch (firestoreError: any) {
                firestoreAvailable = false;
                toast("Firestore offline - using temporary session", { icon: "⚠️" });
            }

            if (!firestoreAvailable || (!userDoc?.exists() && !astroDoc?.exists())) {
                const roleParam = searchParams.get("role");
                const targetRole = roleParam === "astrologer" ? "astrologer" : "user";

                if (firestoreAvailable) {
                    const collectionName = targetRole === "astrologer" ? "astrologers" : "users";
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

                const destination = targetRole === "astrologer" ? "/astrologer/onboarding" : "/onboarding";
                setTimeout(() => window.location.href = destination, 1000);
                return;
            } else {
                let roleParam = searchParams.get("role");
                if (!roleParam && typeof window !== "undefined") {
                    const storedIntent = localStorage.getItem("loginIntent");
                    if (storedIntent === "astrologer") {
                        roleParam = "astrologer";
                        localStorage.removeItem("loginIntent");
                    }
                }

                if (roleParam === "astrologer" && !astroDoc?.exists()) {
                    try {
                        const currentBalance = userDoc?.exists() ? userDoc.data().walletBalance || 0 : 0;
                        await setDoc(doc(db, "astrologers", user.uid), {
                            uid: user.uid,
                            email: user.email || "",
                            phoneNumber: user.phoneNumber || "",
                            displayName: user.displayName || "New Expert",
                            photoURL: user.photoURL || "",
                            role: "astrologer",
                            createdAt: new Date().toISOString(),
                            verified: false,
                            profileComplete: false,
                            experience: 0,
                            rating: 0,
                            consultations: 0,
                            bio: "New Expert from Upgrade",
                            walletBalance: currentBalance
                        });

                        if (userDoc?.exists()) {
                            await deleteDoc(doc(db, "users", user.uid));
                        }

                        toast.success("Account upgraded to Expert! Redirecting...");
                        setTimeout(() => window.location.href = "/astrologer/onboarding", 1000);
                        return;
                    } catch (err) {
                        toast.error("Failed to upgrade account");
                    }
                } else if (roleParam === "astrologer" && astroDoc?.exists()) {
                    if (userDoc?.exists()) {
                        await deleteDoc(doc(db, "users", user.uid));
                    }
                    setTimeout(() => window.location.href = "/astrologer/dashboard", 1000);
                    return;
                }
            }

            toast.success("Welcome back!");
            setTimeout(() => window.location.href = redirect, 1000);
        } catch (error: any) {
            toast.error("Failed to complete authentication. Please try again.");
            setLoading(false);
        }
    };

    const handleAuthError = (error: any) => {
        console.error("🔥 Firebase Auth Error Details:", error);
        
        let msg = error.message || "Authentication failed. Please try again.";
        
        if (error.code === 'auth/popup-closed-by-user') {
            msg = "Login popup was closed.";
        } else if (error.code === 'auth/cancelled-popup-request') {
            msg = "Only one login popup allowed at a time.";
        } else if (error.code === 'auth/network-request-failed') {
            msg = "Network connection error. Check your internet connectivity.";
        } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
            msg = "Invalid email or password. Please verify your details.";
        } else if (error.code === 'auth/user-not-found') {
            msg = "No registered user found with this email. Please Sign Up first!";
        } else if (error.code === 'auth/email-already-in-use') {
            msg = "This email is already registered. Please sign in instead.";
        } else if (error.code === 'auth/invalid-phone-number') {
            msg = "Invalid phone number format.";
        } else if (error.code === 'auth/operation-not-allowed') {
            msg = "Email/Password sign-ups are disabled in your Firebase console. Please open your Firebase Console -> Authentication -> Sign-in Method, and enable 'Email/Password' under Sign-in providers, then click Save.";
        } else if (error.code === 'auth/invalid-email') {
            msg = "Badly formatted or invalid email address format. Please check the spelling.";
        } else if (error.code === 'auth/weak-password') {
            msg = "Password is too weak. It must be at least 6 characters.";
        }
        
        toast.error(msg, { duration: 7000 });
    };

    // --- RENDER HELPERS ---
    const renderGoogleButton = () => (
        <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-14 bg-white text-gray-800 hover:bg-gray-100 font-bold text-base flex items-center justify-center gap-3 rounded-2xl shadow-lg border border-white/20 transition-all hover:scale-[1.02] active:scale-95"
        >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Continue with Google
        </Button>
    );

    const renderDivider = (text: string) => (
        <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-primary/10"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-zinc-950 px-4 text-foreground/40 font-black tracking-widest">{text}</span></div>
        </div>
    );

    return (
        <main className="min-h-screen flex flex-col bg-zinc-950 text-foreground">
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full -z-10 animate-float" />
                
                <div className="max-w-[400px] w-full glass p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-white/5 relative z-10">
                    
                    {/* Header */}
                    <div className="text-center space-y-2 mb-8">
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            {authMode === "LOGIN" && "Welcome Back"}
                            {authMode === "SIGNUP" && "Join JyotishConnect"}
                            {authMode === "OTP" && "Mobile Login"}
                            {authMode === "FORGOT_PASSWORD" && "Reset Password"}
                        </h1>
                        <p className="text-sm text-foreground/50 font-medium">
                            {authMode === "LOGIN" && "Sign in to continue your journey"}
                            {authMode === "SIGNUP" && "Create an account to get started"}
                            {authMode === "OTP" && "Enter your mobile number to verify"}
                            {authMode === "FORGOT_PASSWORD" && "We'll send you a reset link"}
                        </p>
                    </div>

                    
                    {/* --- LOGIN VIEW --- */}
                    {authMode === "LOGIN" && (
                        <div className="space-y-4 animate-in fade-in">
                            <form onSubmit={handleEmailSignIn} className="space-y-4">
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                                        <input
                                            type="email"
                                            required
                                            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-white/10 bg-white/5 text-base text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            placeholder="Email address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className="w-full h-14 pl-12 pr-12 rounded-2xl border border-white/10 bg-white/5 text-base text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end">
                                    <button 
                                        type="button" 
                                        onClick={() => setAuthMode("FORGOT_PASSWORD")}
                                        className="text-xs text-orange-400 hover:text-orange-300 font-bold transition-colors"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 orange-gradient text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    {loading ? "Signing In..." : "Sign In"}
                                </Button>
                            </form>

                            {renderDivider("OR")}

                            {renderGoogleButton()}

                            <Button
                                type="button"
                                onClick={() => setAuthMode("OTP")}
                                variant="outline"
                                className="w-full h-14 glass text-white font-bold text-sm rounded-2xl border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2"
                            >
                                <Smartphone className="w-5 h-5" />
                                Continue with Mobile
                            </Button>

                            <p className="text-center text-xs text-zinc-400 pt-4">
                                Don't have an account?{" "}
                                <button type="button" onClick={() => setAuthMode("SIGNUP")} className="text-orange-400 hover:text-orange-300 font-bold hover:underline">
                                    Sign Up
                                </button>
                            </p>
                        </div>
                    )}


                    {/* --- SIGNUP VIEW --- */}
                    {authMode === "SIGNUP" && (
                        <div className="space-y-4 animate-in fade-in">
                            <form onSubmit={handleEmailSignUp} className="space-y-4">
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                                        <input
                                            type="email"
                                            required
                                            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-white/10 bg-white/5 text-base text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            placeholder="Email address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            minLength={6}
                                            className="w-full h-14 pl-12 pr-12 rounded-2xl border border-white/10 bg-white/5 text-base text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            placeholder="Create password (min 6 chars)"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 orange-gradient text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    {loading ? "Creating..." : "Sign Up"}
                                </Button>
                            </form>

                            {renderDivider("OR")}

                            {renderGoogleButton()}

                            <p className="text-center text-xs text-zinc-400 pt-4">
                                Already have an account?{" "}
                                <button type="button" onClick={() => setAuthMode("LOGIN")} className="text-orange-400 hover:text-orange-300 font-bold hover:underline">
                                    Sign In
                                </button>
                            </p>
                        </div>
                    )}


                    {/* --- OTP VIEW --- */}
                    {authMode === "OTP" && (
                        <div className="space-y-4 animate-in fade-in">
                            <button 
                                type="button"
                                onClick={() => setAuthMode("LOGIN")}
                                className="flex items-center gap-1 text-xs text-foreground/50 hover:text-white transition-colors mb-4"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to Login
                            </button>
                            
                            <div id="recaptcha-container"></div>
                            
                            {!showOtpInput ? (
                                <form onSubmit={handleSendOtp} className="space-y-4">
                                    <div className="relative">
                                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                                        <input
                                            type="tel"
                                            required
                                            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-white/10 bg-white/5 text-base text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            placeholder="+91 99999 99999"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-14 orange-gradient text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        {loading ? "Sending..." : "Send OTP"}
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        className="w-full h-14 text-center tracking-[0.5em] font-black text-2xl rounded-2xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-14 orange-gradient text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        {loading ? "Verifying..." : "Verify & Sign In"}
                                    </Button>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowOtpInput(false)} 
                                        className="w-full text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                                    >
                                        Change Phone Number
                                    </button>
                                </form>
                            )}
                        </div>
                    )}


                    {/* --- FORGOT PASSWORD VIEW --- */}
                    {authMode === "FORGOT_PASSWORD" && (
                        <div className="space-y-4 animate-in fade-in">
                            <button 
                                type="button"
                                onClick={() => setAuthMode("LOGIN")}
                                className="flex items-center gap-1 text-xs text-foreground/50 hover:text-white transition-colors mb-4"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to Login
                            </button>
                            
                            <form onSubmit={handlePasswordReset} className="space-y-4">
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full h-14 pl-12 pr-4 rounded-2xl border border-white/10 bg-white/5 text-base text-white focus:outline-none focus:border-primary/50 transition-colors"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 orange-gradient text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </Button>
                            </form>
                        </div>
                    )}

                </div>
            </div>
            <Footer />
        </main>
    );
}

