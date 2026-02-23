"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { useRouter } from "@/i18n/navigation";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function UserProfileEditPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        displayName: "",
        phone: "",
        email: "",
        address: "",
        dob: "",
        tob: "",
        pob: ""
    });

    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
        }

        const fetchProfile = async () => {
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        displayName: data.displayName || user.displayName || "",
                        phone: data.phone || user.phoneNumber || "",
                        email: data.email || user.email || "",
                        address: data.address || "",
                        dob: data.dob || "",
                        tob: data.tob || "",
                        pob: data.pob || ""
                    });
                } else {
                    // Pre-fill from auth if completely new
                    setFormData(prev => ({
                        ...prev,
                        displayName: user.displayName || "",
                        email: user.email || "",
                        phone: user.phoneNumber || ""
                    }));
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("Failed to load profile data");
            }
        };

        fetchProfile();
    }, [user, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            const userRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userRef);

            const payload = {
                ...formData,
                uid: user.uid,
                profileComplete: true,
                updatedAt: new Date().toISOString()
            };

            if (docSnap.exists()) {
                await updateDoc(userRef, payload);
            } else {
                await setDoc(userRef, {
                    ...payload,
                    walletBalance: 0,
                    createdAt: new Date().toISOString()
                });
            }

            toast.success("Profile saved successfully!");
            router.push("/user/dashboard");
        } catch (error) {
            console.error("Error saving profile:", error);
            toast.error("Failed to save profile");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <main className="min-h-screen bg-zinc-50 relative">
            <Navbar />

            <div className="container mx-auto px-4 py-24 md:py-32 relative z-10 max-w-2xl">
                <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-zinc-100">
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Your Profile</h1>
                        <p className="text-zinc-500 mt-2">Complete your details to book sessions and get better astrological readings.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-orange-500">Basic Info (Required)</h2>

                            <div>
                                <label className="text-xs font-bold text-zinc-600 uppercase mb-1 block">Full Name</label>
                                <Input
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    required
                                    className="h-12 border-zinc-200 focus:border-orange-500 rounded-xl"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-zinc-600 uppercase mb-1 block">Phone Number</label>
                                    <Input
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="h-12 border-zinc-200 focus:border-orange-500 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-zinc-600 uppercase mb-1 block">Email</label>
                                    <Input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        disabled
                                        className="h-12 border-zinc-200 bg-zinc-50 rounded-xl text-zinc-500"
                                    />
                                    <p className="text-[10px] text-zinc-400 mt-1">Email cannot be changed</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-zinc-600 uppercase mb-1 block">Full Address</label>
                                <Input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    className="h-12 border-zinc-200 focus:border-orange-500 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-zinc-100">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-500">Birth Details (Optional)</h2>
                            <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                                Providing accurate birth details helps our experts pre-calculate your Kundli before the session starts.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-zinc-600 uppercase mb-1 block">Date of Birth</label>
                                    <Input
                                        name="dob"
                                        type="date"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        className="h-12 border-zinc-200 focus:border-indigo-500 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-zinc-600 uppercase mb-1 block">Time of Birth</label>
                                    <Input
                                        name="tob"
                                        type="time"
                                        value={formData.tob}
                                        onChange={handleChange}
                                        className="h-12 border-zinc-200 focus:border-indigo-500 rounded-xl"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-600 uppercase mb-1 block">Place of Birth (City, State)</label>
                                <Input
                                    name="pob"
                                    value={formData.pob}
                                    onChange={handleChange}
                                    placeholder="e.g. New Delhi, India"
                                    className="h-12 border-zinc-200 focus:border-indigo-500 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl shadow-lg"
                            >
                                {loading ? "Saving..." : "Save Profile & Continue"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            <Footer />
        </main>
    );
}
