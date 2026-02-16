"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle, Video, Phone, MessageSquare, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function AstrologerProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [astrologer, setAstrologer] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAstrologer = async () => {
            try {
                const astroDoc = await getDoc(doc(db, "astrologers", id as string));
                if (astroDoc.exists()) {
                    setAstrologer({ id: astroDoc.id, ...astroDoc.data() });
                } else {
                    toast.error("Astrologer not found");
                    router.push("/search");
                }
            } catch (error) {
                console.error("Error fetching astrologer:", error);
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchAstrologer();
    }, [id, router]);

    const handleInstantBooking = (type: "video" | "audio" | "chat") => {
        if (!user) {
            toast.error("Please login to book consultation");
            router.push("/login");
            return;
        }

        // Create instant consultation
        const consultId = `instant_${Date.now()}`;
        router.push(`/consult/${consultId}?type=${type}&astrologer=${id}&instant=true`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!astrologer) return null;

    return (
        <main className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50">
            <Navbar />

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-5xl mx-auto">
                    {/* Profile Header */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="relative">
                                <img
                                    src={astrologer.image}
                                    alt={astrologer.name}
                                    className="w-48 h-48 rounded-2xl object-cover"
                                />
                                {astrologer.verified && (
                                    <div className="absolute top-2 right-2 bg-blue-500 text-white p-2 rounded-full">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                )}
                                {astrologer.online && (
                                    <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                        Online
                                    </div>
                                )}
                            </div>

                            <div className="flex-grow space-y-4">
                                <div>
                                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{astrologer.name}</h1>
                                    <p className="text-lg text-gray-600">{astrologer.expertise}</p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 bg-amber-100 px-4 py-2 rounded-full">
                                        <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                                        <span className="font-bold text-amber-700">{astrologer.rating}</span>
                                    </div>
                                    <span className="text-gray-600">{astrologer.reviews} reviews</span>
                                    <span className="text-gray-600">•</span>
                                    <span className="text-gray-600">{astrologer.experience || 10}+ years exp</span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {astrologer.languages?.map((lang: string) => (
                                        <span key={lang} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                            {lang}
                                        </span>
                                    ))}
                                </div>

                                <div className="pt-4 border-t">
                                    <div className="text-3xl font-bold text-orange-600">
                                        ₹{astrologer.price}<span className="text-lg text-gray-500">/session</span>
                                    </div>
                                    <p className="text-sm text-gray-500">Up to 90 minutes consultation</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Options */}
                    <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                        <h2 className="text-2xl font-bold mb-6">Book Consultation</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => handleInstantBooking("video")}
                                className="p-6 border-2 border-orange-500 rounded-2xl hover:bg-orange-50 transition-colors group"
                            >
                                <Video className="w-12 h-12 text-orange-500 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                                <h3 className="font-bold text-lg mb-2">Video Call</h3>
                                <p className="text-sm text-gray-600">Face-to-face consultation</p>
                            </button>

                            <button
                                onClick={() => handleInstantBooking("audio")}
                                className="p-6 border-2 border-blue-500 rounded-2xl hover:bg-blue-50 transition-colors group"
                            >
                                <Phone className="w-12 h-12 text-blue-500 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                                <h3 className="font-bold text-lg mb-2">Audio Call</h3>
                                <p className="text-sm text-gray-600">Voice consultation</p>
                            </button>

                            <button
                                onClick={() => handleInstantBooking("chat")}
                                className="p-6 border-2 border-green-500 rounded-2xl hover:bg-green-50 transition-colors group"
                            >
                                <MessageSquare className="w-12 h-12 text-green-500 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                                <h3 className="font-bold text-lg mb-2">Chat</h3>
                                <p className="text-sm text-gray-600">Text consultation</p>
                            </button>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                            <p className="text-sm text-blue-800">
                                💡 <strong>Demo Mode:</strong> Click any option above to start instant consultation in demo mode. No payment required for testing!
                            </p>
                        </div>
                    </div>

                    {/* About */}
                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold mb-4">About</h2>
                        <p className="text-gray-700 leading-relaxed">
                            {astrologer.bio || `${astrologer.name} is an experienced ${astrologer.expertise} practitioner with ${astrologer.experience || 10}+ years of helping people find clarity and guidance. Known for accurate predictions and compassionate counseling.`}
                        </p>

                        <div className="mt-6">
                            <h3 className="font-bold text-lg mb-3">Specializations</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span>Career Guidance</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span>Relationship Advice</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span>Financial Planning</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span>Health & Wellness</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
