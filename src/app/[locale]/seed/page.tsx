"use client";

import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

const DUMMY_ASTROLOGERS = [
    {
        id: "astro_1",
        name: "Pandit Rahul Shastri",
        expertise: "Vedic, Vastu",
        experience: 15,
        rating: 4.9,
        reviews: 120,
        price: 25,
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
        languages: ["Hindi", "Sanskrit"],
        verified: true,
        consultations: 1500,
        bio: "Expert in Vedic Astrology and Vastu Shastra with 15 years of experience.",
        online: true
    },
    {
        id: "astro_2",
        name: "Acharya Priya",
        expertise: "Tarot, Numerology",
        experience: 8,
        rating: 4.7,
        reviews: 85,
        price: 15,
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
        languages: ["English", "Hindi"],
        verified: true,
        consultations: 800,
        bio: "Certified Tarot Reader and Numerologist helping people find clarity.",
        online: false
    },
    {
        id: "astro_3",
        name: "Swami Anant",
        expertise: "KP System, Nadi",
        experience: 25,
        rating: 5.0,
        reviews: 300,
        price: 50,
        image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anant",
        languages: ["Hindi", "English", "Marathi"],
        verified: true,
        consultations: 5000,
        bio: "Grand master of KP System specializing in career and marriage predictions.",
        online: true
    }
];

export default function SeedingPage() {
    const [status, setStatus] = useState("");

    const seedData = async () => {
        setStatus("Seeding...");
        try {
            for (const astro of DUMMY_ASTROLOGERS) {
                await setDoc(doc(db, "astrologers", astro.id), astro);
            }
            setStatus("Success! Added 3 dummy astrologers.");
        } catch (error: any) {
            console.error(error);
            setStatus("Error: " + error.message);
        }
    };

    return (
        <div className="p-10 flex flex-col items-center gap-4">
            <h1 className="text-2xl font-bold">Database Seeder</h1>
            <p>Click below to verify database connection and add sample data.</p>
            <Button onClick={seedData}>Seed Astrologers</Button>
            <pre className="bg-gray-100 p-4 rounded">{status}</pre>
        </div>
    );
}
