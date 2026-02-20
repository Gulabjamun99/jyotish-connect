"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

const MASTER_PROFILES = [
    {
        displayName: "Acharya Devraj",
        email: "devraj.master@astropandit.test",
        online: true,
        verified: true,
        profileComplete: true,
        role: "astrologer",
        rating: 4.9,
        consultations: 1240,
        experience: 15,
        consultationRate: 150,
        languages: ["English", "Hindi", "Sanskrit"],
        specializations: ["Vedic Astrology", "Vastu Shastra"],
        bio: "A 5th generation Vedic scholar from Varanasi. Specializing in matching cosmic frequencies for career and marital harmony. I blend ancient calculations with modern psychological understanding.",
        education: "PhD in Jyotish Vidya, BHU",
        photoURL: "https://images.unsplash.com/photo-1620288627223-53302f4e8c74?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        walletBalance: 45000,
        createdAt: new Date().toISOString()
    },
    {
        displayName: "Tarot Priya",
        email: "priya.tarot@astropandit.test",
        online: true,
        verified: true,
        profileComplete: true,
        role: "astrologer",
        rating: 4.8,
        consultations: 856,
        experience: 8,
        consultationRate: 99,
        languages: ["English", "Hindi"],
        specializations: ["Tarot Reading", "Numerology", "Love & Relationships"],
        bio: "Intuitive empath and certified Master Tarot Reader. I use the Rider-Waite deck to unlock subconscious blocks and guide you toward your true soulmate and life purpose.",
        education: "Certified Master Tarot Reader, IFA",
        photoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        walletBalance: 28000,
        createdAt: new Date().toISOString()
    },
    {
        displayName: "Dr. K.V. Sharma",
        email: "kv.sharma@astropandit.test",
        online: false,
        verified: true,
        profileComplete: true,
        role: "astrologer",
        rating: 4.7,
        consultations: 3200,
        experience: 25,
        consultationRate: 250,
        languages: ["English", "Telugu", "Hindi"],
        specializations: ["Nadi Astrology", "Medical Astrology"],
        bio: "Pioneer in Nadi Astrology with over two decades of experience. I specialize in pinpointing exact life events and providing ancient, highly effective karmic remedies.",
        education: "Jyotish Visharad, ICAS",
        photoURL: "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        walletBalance: 120500,
        createdAt: new Date().toISOString()
    },
    {
        displayName: "Yogini Meera",
        email: "meera.yogini@astropandit.test",
        online: true,
        verified: true,
        profileComplete: true,
        role: "astrologer",
        rating: 4.9,
        consultations: 430,
        experience: 12,
        consultationRate: 120,
        languages: ["English", "Gujarati", "Hindi"],
        specializations: ["Palmistry", "Prashna Kundli", "Spiritual Healing"],
        bio: "Gifted clairvoyant and palmist. I read the map of your hands to help you navigate financial hurdles and find inner peace through guided spiritual healing.",
        education: "Traditional Gurukul Training, Rishikesh",
        photoURL: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        walletBalance: 15400,
        createdAt: new Date().toISOString()
    },
    {
        displayName: "Astro Arjun",
        email: "astro.arjun@astropandit.test",
        online: true,
        verified: false, // Intentional for testing Admin Dashboard
        profileComplete: true,
        role: "astrologer",
        rating: 4.5,
        consultations: 120,
        experience: 4,
        consultationRate: 50,
        languages: ["English", "Bengali"],
        specializations: ["Career Counseling", "Vedic Astrology"],
        bio: "Modern astrologer focusing on career and startup astrology. I help founders and professionals time their moves for maximum success using planetary transits.",
        education: "B.Tech + Jyotish Praveena",
        photoURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        walletBalance: 4000,
        createdAt: new Date().toISOString()
    }
];

export default function SeederPage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    const handleSeed = async () => {
        setLoading(true);
        setStatus("Seeding completely realistic data...");

        try {
            for (let i = 0; i < MASTER_PROFILES.length; i++) {
                const profile = MASTER_PROFILES[i];
                // Use a predictable ID for these seeded users
                const docId = `seed_astro_${i + 1}`;
                const docRef = doc(collection(db, "users"), docId);

                await setDoc(docRef, { ...profile, uid: docId });
                setStatus(`Injected ${profile.displayName}...`);
            }

            setStatus("✅ Seeding Complete! Realistic Astrologers are now live in the database.");
            toast.success("Database Seeded Successfully");
        } catch (error: any) {
            console.error("Seeding failed", error);
            setStatus(`❌ Error: ${error.message}`);
            toast.error("Failed to seed database");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 text-white relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 blur-[150px] rounded-full -z-10" />

            <div className="max-w-md w-full glass p-10 rounded-3xl space-y-8 text-center border border-white/10 shadow-2xl relative z-10">
                <div className="space-y-4">
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                        Database Seeder
                    </h1>
                    <p className="text-sm text-white/50">
                        Injects premium, highly realistic Astrologer profiles into the Firestore database to populate the Search and Discover maps.
                    </p>
                </div>

                <Button
                    onClick={handleSeed}
                    disabled={loading}
                    className="w-full h-14 bg-orange-500 hover:bg-orange-600 font-bold uppercase tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all hover:scale-105"
                >
                    {loading ? "Generating Cosmic Forms..." : "Execute Seed Protocol"}
                </Button>

                {status && (
                    <div className="pt-6 border-t border-white/10 text-xs font-mono text-white/70 bg-black/50 p-4 rounded-xl text-left h-32 overflow-y-auto">
                        > {status}
                    </div>
                )}
            </div>
        </div>
    );
}
