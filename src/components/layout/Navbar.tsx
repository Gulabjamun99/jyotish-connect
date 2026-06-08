"use client";

import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Moon, Sun, User as UserIcon, LogOut, Menu, Languages, Home, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";

export function Navbar() {
    const { user, role } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations("Index");
    const tNav = useTranslations("Nav");

    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    const handleLogout = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const switchLanguage = (newLocale: string) => {
        // Use router.push with locale parameter
        // The pathname from usePathname() is already locale-stripped
        const currentPath = pathname || '/';

        // Create the full URL with new locale
        const url = `/${newLocale}${currentPath}${window.location.search}`;

        console.log('[Language Switch]', {
            currentLocale: locale,
            newLocale,
            pathname,
            url
        });

        // Use window.location for immediate navigation
        window.location.href = url;
    };

    const dashboardHref = role === "admin" 
        ? "/admin" 
        : role === "astrologer" 
            ? "/astrologer/dashboard" 
            : "/user/dashboard";

    const navLinks = [
        { href: "/search", label: tNav("find_astrologers") },
        { href: "/horoscope", label: tNav("daily_horoscope") },
        { href: "/kundli", label: tNav("free_kundli") },
        { href: "/kundli/matching", label: tNav("matching") },
    ];

    if (role === "admin") {
        navLinks.push({ href: "/admin/verify-astrologers", label: "Verify Astrologers" });
    }

    const languages = [
        { code: "en", name: "English" },
        { code: "hi", name: "हिन्दी" },
        { code: "ta", name: "தமிழ்" },
        { code: "te", name: "తెలుగు" },
        { code: "mr", name: "मराठी" },
        { code: "bn", name: "বাংলা" },
        { code: "gu", name: "ગુજરાતી" },
        { code: "kn", name: "ಕನ್ನಡ" },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full glass border-none border-b border-primary/10 backdrop-blur-2xl">
            <div className="container mx-auto flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-1">
                    <Link href="/" className="flex items-center space-x-1.5 group">
                        <div className="w-8 h-8 md:w-9 md:h-9 bg-primary rounded-lg rotate-12 group-hover:rotate-0 transition-transform duration-500 shadow-lg shadow-primary/20 flex items-center justify-center font-black text-white text-lg">
                            J
                        </div>
                        <span className="text-xl md:text-2xl font-black text-gradient tracking-tighter">
                            JyotishConnect
                        </span>
                    </Link>
                    <Link href="/" title="Home">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors ml-1">
                            <Home className="w-3.5 h-3.5 text-primary" />
                        </div>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-xs font-black uppercase tracking-widest text-foreground/60 hover:text-primary transition-all"
                        >
                            {link.label}
                        </Link>
                    ))}

                    <div className="flex items-center space-x-4 border-l border-primary/10 pl-8 ml-4">
                        {/* Language Switcher Dropdown */}
                        <div className="relative group">
                            <Button variant="ghost" size="sm" className="gap-2 h-10 px-4 rounded-xl glass border-primary/10 hover:bg-primary/5">
                                <Languages className="w-4 h-4 text-primary" />
                                <span className="uppercase text-[10px] font-black tracking-widest">{locale}</span>
                            </Button>
                            <div className="absolute top-[calc(100%+8px)] right-0 w-48 glass backdrop-blur-3xl rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-3 z-[60] border-primary/10">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => switchLanguage(lang.code)}
                                        className="w-full text-left px-4 py-2.5 hover:bg-white/5 rounded-xl text-[11px] font-bold tracking-wide flex justify-between items-center transition-colors"
                                    >
                                        <span>{lang.name}</span>
                                        {locale === lang.code && <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(14,165,233,0.5)]" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {user ? (
                            <div className="relative group flex items-center">
                                {/* Trigger Button */}
                                <div className="flex items-center gap-2 cursor-pointer h-10 px-3 py-1.5 rounded-xl glass border-primary/10 hover:bg-primary/5 transition-all">
                                    {/* Avatar */}
                                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-black text-white uppercase overflow-hidden border border-primary/20 shadow-inner">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{(user.email || "U")[0]}</span>
                                        )}
                                    </div>
                                    {/* Role Pill */}
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                        role === "admin" 
                                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/20" 
                                            : role === "astrologer"
                                                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/20"
                                                : "bg-amber-500/20 text-amber-400 border border-amber-500/20"
                                    }`}>
                                        {role === "admin" ? "Admin" : role === "astrologer" ? "Expert" : "Seeker"}
                                    </span>
                                    {/* Arrow Down */}
                                    <span className="text-foreground/40 text-[9px] font-bold group-hover:rotate-180 transition-transform duration-300">▼</span>
                                </div>

                                {/* Dropdown Menu Content */}
                                <div className="absolute top-[calc(100%+8px)] right-0 w-56 glass backdrop-blur-3xl rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-3.5 z-[60] border-primary/10 space-y-2.5">
                                    {/* User Header */}
                                    <div className="px-2 py-1">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Signed in as</p>
                                        <p className="text-xs font-black truncate text-white max-w-[190px]">{user.email || user.phoneNumber}</p>
                                    </div>
                                    
                                    <div className="border-t border-primary/10" />

                                    {/* Navigation Links */}
                                    <div className="space-y-1">
                                        <Link href={dashboardHref} className="flex items-center gap-2.5 w-full text-left px-3 py-2 hover:bg-white/5 rounded-xl text-[11px] font-bold text-foreground/80 hover:text-white transition-all">
                                            <span className="text-primary text-[10px]">💻</span>
                                            <span>My Dashboard</span>
                                        </Link>

                                        {role === "admin" && (
                                            <Link href="/admin/verify-astrologers" className="flex items-center gap-2.5 w-full text-left px-3 py-2 hover:bg-white/5 rounded-xl text-[11px] font-bold text-foreground/80 hover:text-white transition-all">
                                                <span className="text-purple-400 text-[10px]">🛡️</span>
                                                <span>Verify Astrologers</span>
                                            </Link>
                                        )}

                                        {role === "astrologer" && (
                                            <Link href={`/astrologer/profile/${user.uid}`} className="flex items-center gap-2.5 w-full text-left px-3 py-2 hover:bg-white/5 rounded-xl text-[11px] font-bold text-foreground/80 hover:text-white transition-all">
                                                <span className="text-indigo-400 text-[10px]">🔮</span>
                                                <span>My Public Profile</span>
                                            </Link>
                                        )}

                                        {role === "user" && (
                                            <Link href="/user/profile/edit" className="flex items-center gap-2.5 w-full text-left px-3 py-2 hover:bg-white/5 rounded-xl text-[11px] font-bold text-foreground/80 hover:text-white transition-all">
                                                <span className="text-amber-400 text-[10px]">👤</span>
                                                <span>Edit Profile</span>
                                            </Link>
                                        )}
                                    </div>

                                    <div className="border-t border-primary/10" />

                                    {/* Logout Button */}
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2.5 w-full text-left px-3 py-2 hover:bg-red-500/10 rounded-xl text-[11px] font-bold text-red-400 hover:text-red-300 transition-all"
                                    >
                                        <span className="text-[10px]">🚪</span>
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link href="/login">
                                <Button className="h-9 px-6 rounded-lg orange-gradient font-black text-[10px] uppercase tracking-widest text-white shadow-md shadow-primary/10">
                                    {tNav("login")}
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <Menu className="h-6 w-6" />
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t p-4 space-y-4 bg-background">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="block text-sm font-medium">{link.label}</Link>
                    ))}
                    <div className="py-2 border-y">
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Language</p>
                        <div className="grid grid-cols-2 gap-2">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => switchLanguage(lang.code)}
                                    className={cn(
                                        "px-3 py-2 rounded-lg text-xs font-medium border text-center",
                                        locale === lang.code ? "bg-orange-500 text-white border-orange-500" : "bg-secondary text-secondary-foreground"
                                    )}
                                >
                                    {lang.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    {user ? (
                        <div className="space-y-4">
                            <Link href={dashboardHref} className="block text-sm font-medium underline">
                                My Dashboard
                            </Link>
                            <Button onClick={handleLogout} variant="destructive" className="w-full justify-center">
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <Link href="/login" className="block w-full">
                            <Button className="w-full bg-orange-500 text-white justify-center">
                                {tNav("login")}
                            </Button>
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}
