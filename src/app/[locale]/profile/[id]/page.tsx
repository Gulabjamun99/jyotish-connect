import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle, Languages, ShieldCheck, Heart, Share2, Video, Clock } from "lucide-react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { toast } from "react-hot-toast";
import { initiatePayment } from "@/services/payment";
import { useState, useEffect } from "react";
import { getAstrologerById, createBooking } from "@/services/firestore";
// import { ScheduleCalendar } from "@/components/booking/ScheduleCalendar";

export default function ProfilePage() {
    const { user, userData } = useAuth();
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [consultationType, setConsultationType] = useState<"video" | "audio" | "chat">("video");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getAstrologerById(id);
                if (!data) {
                    toast.error("Astrologer not found");
                    router.push("/search");
                    return;
                }
                setProfile({
                    id: data.id,
                    name: data.displayName || "Unknown",
                    email: data.email,
                    expertise: data.specializations?.[0] || "Astrology",
                    languages: data.languages || ["English"],
                    rating: data.rating || 5.0,
                    reviews: data.consultations || 0,
                    price: data.consultationRate || 50,
                    image: data.photoURL || "/placeholder-avatar.png",
                    verified: data.verified || false,
                    bio: data.bio || "Experienced astrologer ready to guide you.",
                    online: data.isOnline ?? false,
                    experience: data.experience || 0,
                    education: data.education || "",
                    specializations: data.specializations || [],
                    pricing: {
                        video: data.consultationRate || 50,
                        audio: Math.round((data.consultationRate || 50) * 0.7),
                        chat: Math.round((data.consultationRate || 50) * 0.5)
                    }
                });
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("Failed to load astrologer profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id, router]);

    const getCurrentPrice = () => {
        if (!profile) return 0;
        return profile.pricing?.[consultationType] || profile.price;
    };

    const handleBooking = async () => {
        if (!user || !userData) {
            toast.error("Please login to book a session");
            router.push("/login");
            return;
        }
        if (!profile) return;
        if (!userData.profileComplete) {
            toast.error("Please complete your seeker profile first");
            router.push("/user/profile/edit");
            return;
        }

        const currentPrice = getCurrentPrice();
        const bookingData = {
            userId: user.uid,
            userName: user.displayName || userData?.displayName || "Seeker",
            userEmail: user.email || "",
            astrologerId: profile.id,
            astrologerName: profile.name,
            date: new Date(),
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            type: consultationType,
            price: currentPrice
        };

        try {
            toast.loading("Establishing direct connection...", { id: 'booking' });
            const newBooking = await createBooking({
                ...bookingData,
                price: 0,
                paymentMode: 'lead-gen'
            } as any);
            toast.success("Connection Established! Joining room...", { id: 'booking' });
            router.push(`/consult/${newBooking.id}?type=${consultationType}`);
        } catch (error: any) {
            console.error("Connection failed:", error);
            toast.error("Direct connection failed. Please try again.");
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen">
                <Navbar />
                <div className="container mx-auto px-4 py-12 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-muted-foreground">Loading profile...</p>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    if (!profile) return null;

    return (
        <main className="min-h-screen bg-zinc-950 text-slate-50 selection:bg-orange-500/30 font-sans pb-24 md:pb-0">
            <Navbar />

            {/* HERO SECTION */}
            <div className="relative w-full bg-zinc-900 border-b border-white/5 pt-10 pb-20 md:pt-16 md:pb-28 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-full md:w-[800px] h-full bg-gradient-to-l from-orange-500/10 to-transparent" />
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/20 blur-[120px] rounded-full" />
                </div>

                <div className="container mx-auto px-4 md:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start text-center md:text-left">
                        <div className="relative group">
                            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-zinc-800 shadow-2xl relative z-10">
                                <img src={profile.image} alt={profile.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            {profile.online && (
                                <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-green-500/30 text-green-500 text-[10px] font-black uppercase tracking-widest backdrop-blur-md z-20 shadow-xl">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                                    Online
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-4 md:pt-4">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
                                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">{profile.name}</h1>
                                {profile.verified && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-green-500 text-[10px] font-bold uppercase tracking-widest">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Verified Astrologer
                                    </div>
                                )}
                            </div>
                            <p className="text-xl md:text-2xl text-orange-400 font-semibold">{profile.expertise}</p>
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-8 pt-2">
                                <div className="flex items-center gap-2">
                                    <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-black text-2xl text-white">{profile.rating}</span>
                                        <span className="text-zinc-500 font-medium text-sm">/ 5 ({profile.reviews} reviews)</span>
                                    </div>
                                </div>
                                <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-zinc-800" />
                                <div className="flex items-center gap-2 text-zinc-400 font-medium">
                                    <Clock className="w-5 h-5 text-zinc-500" />
                                    {profile.experience} Years Exp.
                                </div>
                                <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-zinc-800" />
                                <div className="flex items-center gap-2 text-zinc-400 font-medium">
                                    <Languages className="w-5 h-5 text-zinc-500" />
                                    {profile.languages.join(", ")}
                                </div>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-6">
                                {user?.uid === profile.id ? (
                                    <Button onClick={() => router.push('/astrologer/onboarding')} className="rounded-xl border border-orange-500 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 font-bold gap-2 h-12 px-8 uppercase tracking-wider">
                                        Edit My Profile
                                    </Button>
                                ) : (
                                    <>
                                        <Button variant="outline" className="rounded-xl border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 gap-2 h-12 px-6">
                                            <Heart className="w-4 h-4" /> Save
                                        </Button>
                                        <Button variant="outline" className="rounded-xl border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 gap-2 h-12 px-6">
                                            <Share2 className="w-4 h-4" /> Share Profile
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-7 xl:col-span-8 space-y-12">
                        <section className="space-y-6">
                            <h2 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-4">
                                Area of Expertise <div className="h-px flex-1 bg-zinc-800" />
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {profile.specializations.map((spec: string, i: number) => (
                                    <span key={i} className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg text-sm font-semibold tracking-wide">
                                        {spec}
                                    </span>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-4">
                                About {profile.name.split(' ')[0]} <div className="h-px flex-1 bg-zinc-800" />
                            </h2>
                            <div className="bg-zinc-900/50 border border-zinc-800/50 p-8 rounded-3xl">
                                <p className="text-zinc-300 leading-relaxed text-lg">{profile.bio}</p>
                            </div>
                        </section>
                    </div>

                    <aside className="lg:col-span-5 xl:col-span-4">
                        <div className="glass bg-zinc-900/80 p-8 rounded-[2rem] sticky top-24 space-y-8 border border-white/5 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-red-500" />
                            <div className="space-y-4">
                                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Select Connect Mode</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button onClick={() => setConsultationType("video")} className={`relative p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 ${consultationType === "video" ? "border-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.1)]" : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"}`}>
                                        <Video className={`w-6 h-6 ${consultationType === "video" ? "text-orange-500" : "text-zinc-500"}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${consultationType === "video" ? "text-orange-500" : "text-zinc-500"}`}>Video</span>
                                    </button>
                                    <button onClick={() => setConsultationType("audio")} className={`relative p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 ${consultationType === "audio" ? "border-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.1)]" : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"}`}>
                                        <Clock className={`w-6 h-6 ${consultationType === "audio" ? "text-orange-500" : "text-zinc-500"}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${consultationType === "audio" ? "text-orange-500" : "text-zinc-500"}`}>Audio</span>
                                    </button>
                                    <button onClick={() => setConsultationType("chat")} className={`relative p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 ${consultationType === "chat" ? "border-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.1)]" : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"}`}>
                                        <Star className={`w-6 h-6 ${consultationType === "chat" ? "text-orange-500" : "text-zinc-500"}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${consultationType === "chat" ? "text-orange-500" : "text-zinc-500"}`}>Chat</span>
                                    </button>
                                </div>
                            </div>

                            <div className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10 space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white tracking-tight">Direct Consultation</h3>
                                    <p className="text-xs text-zinc-500 font-medium leading-relaxed uppercase tracking-widest">Connect with {profile.name.split(' ')[0]} directly.</p>
                                </div>
                                <Button onClick={handleBooking} className="w-full h-16 text-sm font-black uppercase tracking-[0.2em] bg-primary hover:bg-primary/90 text-white border-0 shadow-lg shadow-primary/20 transition-all rounded-2xl">
                                    Connect Now
                                </Button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
            <Footer />
        </main>
    );
}
