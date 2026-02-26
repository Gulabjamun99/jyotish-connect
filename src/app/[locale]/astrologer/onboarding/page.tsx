"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { doc, setDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { CheckCircle, Upload, Sparkles, User, BookOpen, Star, Briefcase, Camera, ChevronRight, ChevronLeft } from "lucide-react";

const SPECIALIZATIONS = [
    "Vedic Astrology", "Numerology", "Tarot Reading", "Palmistry",
    "Vastu Shastra", "KP Astrology", "Lal Kitab", "Prashna Kundali"
];

const LANGUAGES = [
    "English", "Hindi", "Tamil", "Telugu", "Marathi",
    "Bengali", "Gujarati", "Kannada", "Malayalam", "Punjabi"
];

export default function AstrologerOnboardingPage() {
    const { user, userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        displayName: userData?.displayName || "",
        phoneNumber: userData?.phoneNumber || "",
        email: userData?.email || "",
        experience: "" as string | number, // Changed to allow empty strings during typing
        specializations: [] as string[],
        languages: [] as string[],
        consultationRate: "" as string | number, // Changed to allow empty strings during typing
        bio: "",
        education: "",
    });

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(userData?.photoURL || null);
    const [certFile, setCertFile] = useState<File | null>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleCheckboxChange = (field: "specializations" | "languages", value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(item => item !== value)
                : [...prev[field], value]
        }));
    };

    const validateStep = () => {
        if (step === 1) {
            if (!formData.displayName || !formData.email) {
                toast.error("Please fill in all mandatory personal details.");
                return false;
            }
        } else if (step === 2) {
            const exp = Number(formData.experience);
            if (formData.experience === "" || isNaN(exp) || exp < 0 || exp > 50) {
                toast.error("Please enter a valid experience between 0 and 50 years.");
                return false;
            }
            if (formData.specializations.length === 0) {
                toast.error("Please select at least one powerful specialization.");
                return false;
            }
            if (formData.languages.length === 0) {
                toast.error("Please select at least one language to communicate.");
                return false;
            }
        } else if (step === 3) {
            const rate = Number(formData.consultationRate);
            if (formData.consultationRate === "" || isNaN(rate) || rate < 100 || rate > 10000) {
                toast.error("Please set a session rate between ₹100 and ₹10,000.");
                return false;
            }
            if (!formData.bio || formData.bio.length < 50) {
                toast.error("Your bio must be at least 50 characters to build trust with seekers.");
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            setStep(step + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        setStep(step - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleSubmit = async () => {
        if (!validateStep() || !user) return;

        setLoading(true);
        const toastId = toast.loading("Invoking stars and building your Master Console...");
        try {
            let photoURL = userData?.photoURL || "";
            let certificationURL = "";

            if (photoFile) {
                toast.loading("Uploading your divine portrait...", { id: toastId });
                const photoRef = ref(storage, `astrologers/${user.uid}/profile.jpg`);
                await uploadBytes(photoRef, photoFile);
                photoURL = await getDownloadURL(photoRef);
            }

            if (certFile) {
                toast.loading("Uploading certifications...", { id: toastId });
                const certRef = ref(storage, `astrologers/${user.uid}/certification.pdf`);
                await uploadBytes(certRef, certFile);
                certificationURL = await getDownloadURL(certRef);
            }

            toast.loading("Finalizing destiny records...", { id: toastId });
            await setDoc(doc(db, "astrologers", user.uid), {
                displayName: formData.displayName,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                photoURL,
                experience: Number(formData.experience),
                specializations: formData.specializations,
                languages: formData.languages,
                consultationRate: Number(formData.consultationRate),
                bio: formData.bio,
                education: formData.education,
                certificationURL,
                profileComplete: true,
                rating: 5.0,
                consultations: 0,
                walletBalance: 0,
                totalEarnings: 0,
                verified: true,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            toast.success("Profile Activated! You are now live.", { id: toastId });
            router.push("/astrologer/dashboard");
        } catch (error: any) {
            console.error("Onboarding error:", error);
            toast.error("Failed to save profile. The cosmos encountered an anomaly.", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
        );
    }

    if (!user || userData?.role !== "astrologer") {
        router.push("/login?role=astrologer");
        return null;
    }

    return (
        <main className="min-h-screen flex flex-col bg-zinc-950 text-white selection:bg-orange-500/30">
            <Navbar />
            
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-orange-500/10 blur-[150px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/5 blur-[150px] rounded-full mix-blend-screen" />
            </div>

            <div className="flex-grow py-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    
                    {/* Header */}
                    <div className="text-center mb-16 space-y-4 animate-slide-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-full border border-orange-500/20 text-orange-400">
                            <Star className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Master Onboarding</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Become a Guide</h1>
                        <p className="text-zinc-400 max-w-2xl mx-auto text-lg">Complete your professional profile to start accepting consultations from seekers across the globe.</p>
                    </div>

                    {/* Elite Stepper */}
                    <div className="mb-12 relative max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-800 -translate-y-1/2 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 transition-all duration-500 ease-out" style={{ width: `${((step - 1) / 2) * 100}%` }} />
                        </div>
                        <div className="relative flex justify-between">
                            {[
                                { icon: User, label: "Identity" },
                                { icon: Briefcase, label: "Expertise" },
                                { icon: BookOpen, label: "Portfolio" }
                            ].map((s, i) => {
                                const isCompleted = i + 1 < step;
                                const isCurrent = i + 1 === step;
                                return (
                                    <div key={i} className="flex flex-col items-center gap-3">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 relative z-10 ${
                                            isCompleted ? "bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]" :
                                            isCurrent ? "bg-zinc-800 border-2 border-orange-500 text-orange-500" :
                                            "bg-zinc-900 border border-zinc-800 text-zinc-500"
                                        }`}>
                                            {isCompleted ? <CheckCircle className="w-6 h-6" /> : <s.icon className="w-6 h-6" />}
                                        </div>
                                        <span className={`text-[10px] uppercase font-bold tracking-widest ${isCurrent || isCompleted ? 'text-white' : 'text-zinc-500'}`}>{s.label}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Dynamic Form Container */}
                    <div className="glass bg-zinc-900/50 border border-zinc-800/50 p-8 md:p-12 rounded-[2.5rem] shadow-2xl backdrop-blur-xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        
                        {/* STEP 1: IDENTITY */}
                        {step === 1 && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black">Personal Identity</h2>
                                    <p className="text-zinc-400 text-sm">This information represents you on the platform.</p>
                                </div>
                                
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    {/* Photo Upload Area */}
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative group cursor-pointer w-32 h-32 rounded-[2rem] overflow-hidden bg-zinc-800 border-2 border-dashed border-zinc-700 hover:border-orange-500 transition-colors">
                                            {photoPreview ? (
                                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 group-hover:text-orange-500">
                                                    <Camera className="w-8 h-8 mb-2" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                        <div className="text-center">
                                            <Label className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Profile Photo</Label>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-6 w-full">
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Full Name Displayed *</Label>
                                            <Input
                                                className="bg-zinc-950 border-zinc-800 h-14 rounded-2xl px-6 text-lg focus-visible:ring-orange-500"
                                                value={formData.displayName}
                                                onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                                                placeholder="e.g. Acharya Krishnakant"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Email Address *</Label>
                                                <Input
                                                    type="email"
                                                    className="bg-zinc-950 border-zinc-800 h-14 rounded-2xl px-6 focus-visible:ring-orange-500"
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="master@domain.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Phone Number</Label>
                                                <Input
                                                    type="tel"
                                                    className="bg-zinc-950 border-zinc-800 h-14 rounded-2xl px-6 focus-visible:ring-orange-500"
                                                    value={formData.phoneNumber}
                                                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                    placeholder="+91 9999999999"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: EXPERTISE */}
                        {step === 2 && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black">Spiritual Expertise</h2>
                                    <p className="text-zinc-400 text-sm">Define the boundaries of your knowledge and languages.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Years of Experience *</Label>
                                    <Input
                                        type="number"
                                        className="bg-zinc-950 border-zinc-800 h-14 rounded-2xl px-6 text-lg focus-visible:ring-orange-500 max-w-xs"
                                        placeholder="E.g. 15"
                                        value={formData.experience}
                                        onChange={e => setFormData({ ...formData, experience: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-xs uppercase tracking-widest text-zinc-500 font-bold flex justify-between">
                                        <span>Specializations *</span>
                                        <span className="text-orange-500">{formData.specializations.length} Selected</span>
                                    </Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {SPECIALIZATIONS.map(spec => (
                                            <button
                                                key={spec}
                                                onClick={() => handleCheckboxChange("specializations", spec)}
                                                className={`h-12 rounded-xl text-xs font-bold transition-all border ${
                                                    formData.specializations.includes(spec) 
                                                    ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' 
                                                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                                                }`}
                                            >
                                                {spec}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-xs uppercase tracking-widest text-zinc-500 font-bold flex justify-between">
                                        <span>Languages Spoken *</span>
                                        <span className="text-orange-500">{formData.languages.length} Selected</span>
                                    </Label>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {LANGUAGES.map(lang => (
                                            <button
                                                key={lang}
                                                onClick={() => handleCheckboxChange("languages", lang)}
                                                className={`h-10 rounded-xl text-xs font-bold transition-all border ${
                                                    formData.languages.includes(lang) 
                                                    ? 'bg-orange-500/10 border-orange-500/50 text-orange-400' 
                                                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                                                }`}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: PORTFOLIO */}
                        {step === 3 && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black">Portfolio & Rates</h2>
                                    <p className="text-zinc-400 text-sm">Complete your profile to inspire trust and set your worth.</p>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-xs uppercase tracking-widest text-zinc-500 font-bold flex justify-between">
                                        <span>Professional Bio *</span>
                                        <span className={formData.bio.length >= 50 ? 'text-green-500' : 'text-orange-500'}>
                                            {formData.bio.length}/500 chars (Min 50)
                                        </span>
                                    </Label>
                                    <textarea
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-zinc-300 min-h-[150px] focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none"
                                        placeholder="Greetings! I am an expert in Vedic astrology with a lineage spanning 3 generations. My focus is providing clear, actionable remedies..."
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        maxLength={500}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Standard Session Rate (₹) *</Label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-zinc-500">₹</span>
                                            <Input
                                                type="number"
                                                className="bg-zinc-950 border-zinc-800 h-14 xl rounded-2xl pl-12 pr-6 text-lg focus-visible:ring-orange-500 text-white font-bold"
                                                placeholder="800"
                                                value={formData.consultationRate}
                                                onChange={e => setFormData({ ...formData, consultationRate: e.target.value })}
                                            />
                                        </div>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Base fee for up to 90 min consultation.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Education (Optional)</Label>
                                        <Input
                                            className="bg-zinc-950 border-zinc-800 h-14 rounded-2xl px-6 focus-visible:ring-orange-500"
                                            placeholder="Ph.D in Sanskrit, XYZ University"
                                            value={formData.education}
                                            onChange={e => setFormData({ ...formData, education: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="p-6 border border-dashed border-zinc-800 rounded-3xl bg-zinc-950 flex flex-col items-center justify-center text-center">
                                    <Upload className="w-8 h-8 text-zinc-600 mb-4" />
                                    <h3 className="font-bold mb-1">Upload Certifications</h3>
                                    <p className="text-xs text-zinc-500 mb-4">PDF format only. Highly recommended for trust.</p>
                                    <div className="relative cursor-pointer bg-zinc-900 border border-zinc-800 hover:border-orange-500 transition-colors px-6 py-3 rounded-xl">
                                        <span className="text-xs font-bold uppercase tracking-wider text-orange-500">
                                            {certFile ? certFile.name : "Select File"}
                                        </span>
                                        <input type="file" accept=".pdf" onChange={e => setCertFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Control Deck */}
                        <div className="flex border-t border-zinc-800/50 pt-8 mt-8 justify-between items-center">
                            {step > 1 ? (
                                <Button variant="ghost" onClick={handleBack} className="text-zinc-400 hover:text-white hover:bg-zinc-800 px-6 h-12 rounded-xl text-xs uppercase font-bold tracking-widest">
                                    Go Back
                                </Button>
                            ) : <div></div>}

                            {step < 3 ? (
                                <Button onClick={handleNext} className="bg-white text-black hover:bg-zinc-200 h-12 px-8 rounded-xl text-xs uppercase font-bold tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all">
                                    Continue <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="bg-orange-500 text-white hover:bg-orange-600 h-12 px-8 rounded-xl text-xs uppercase font-bold tracking-widest shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] transition-all disabled:opacity-50"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 
                                            Invoking...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" /> Finalize Profile
                                        </span>
                                    )}
                                </Button>
                            )}
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
