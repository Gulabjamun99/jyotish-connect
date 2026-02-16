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
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { CheckCircle, Upload, Sparkles } from "lucide-react";

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
        experience: 0,
        specializations: [] as string[],
        languages: [] as string[],
        consultationRate: 500,
        bio: "",
        education: "",
    });

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [certFile, setCertFile] = useState<File | null>(null);

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
                toast.error("Please fill in all personal details");
                return false;
            }
        } else if (step === 2) {
            if (formData.experience < 0 || formData.experience > 50) {
                toast.error("Experience must be between 0-50 years");
                return false;
            }
            if (formData.specializations.length === 0) {
                toast.error("Select at least one specialization");
                return false;
            }
            if (formData.languages.length === 0) {
                toast.error("Select at least one language");
                return false;
            }
            if (formData.consultationRate < 100 || formData.consultationRate > 10000) {
                toast.error("Rate must be between ₹100-₹10,000 per session");
                return false;
            }
        } else if (step === 3) {
            if (!formData.bio || formData.bio.length < 50) {
                toast.error("Bio must be at least 50 characters");
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            setStep(step + 1);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep() || !user) return;

        setLoading(true);
        try {
            let photoURL = userData?.photoURL || "";
            let certificationURL = "";

            // Upload photo if provided
            if (photoFile) {
                const photoRef = ref(storage, `astrologers/${user.uid}/profile.jpg`);
                await uploadBytes(photoRef, photoFile);
                photoURL = await getDownloadURL(photoRef);
            }

            // Upload certification if provided
            if (certFile) {
                const certRef = ref(storage, `astrologers/${user.uid}/certification.pdf`);
                await uploadBytes(certRef, certFile);
                certificationURL = await getDownloadURL(certRef);
            }

            // Update Firestore
            await updateDoc(doc(db, "astrologers", user.uid), {
                displayName: formData.displayName,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                photoURL,
                experience: formData.experience,
                specializations: formData.specializations,
                languages: formData.languages,
                consultationRate: formData.consultationRate,
                bio: formData.bio,
                education: formData.education,
                certificationURL,
                profileComplete: true,
                updatedAt: new Date().toISOString()
            });

            toast.success("Profile completed! Waiting for admin verification.");
            router.push("/astrologer/dashboard");
        } catch (error: any) {
            console.error("Onboarding error:", error);
            toast.error("Failed to save profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Show loading spinner while auth is loading
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect if not authenticated or not an astrologer
    if (!user || userData?.role !== "astrologer") {
        router.push("/login?role=astrologer");
        return null;
    }

    return (
        <main className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-grow bg-secondary/20 py-12">
                <div className="container mx-auto px-4 max-w-3xl">
                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            {[1, 2, 3].map(s => (
                                <div key={s} className="flex items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${s < step ? "bg-green-500 text-white" :
                                        s === step ? "bg-orange-500 text-white" :
                                            "bg-secondary text-muted-foreground"
                                        }`}>
                                        {s < step ? <CheckCircle className="w-6 h-6" /> : s}
                                    </div>
                                    {s < 3 && <div className={`h-1 w-24 mx-2 ${s < step ? "bg-green-500" : "bg-secondary"}`} />}
                                </div>
                            ))}
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">
                                {step === 1 && "Personal Information"}
                                {step === 2 && "Professional Details"}
                                {step === 3 && "Bio & Credentials"}
                            </h2>
                            <p className="text-muted-foreground">Step {step} of 3</p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="glass p-8 rounded-3xl space-y-6">
                        {step === 1 && (
                            <div className="space-y-4">
                                <div>
                                    <Label>Full Name *</Label>
                                    <Input
                                        value={formData.displayName}
                                        onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                                        placeholder="Your full name"
                                    />
                                </div>
                                <div>
                                    <Label>Email *</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div>
                                    <Label>Phone Number</Label>
                                    <Input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        placeholder="+91 9999999999"
                                    />
                                </div>
                                <div>
                                    <Label>Profile Photo (Optional)</Label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => setPhotoFile(e.target.files?.[0] || null)}
                                        />
                                        {photoFile && <span className="text-sm text-green-500">✓ Selected</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <Label>Years of Experience *</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="50"
                                        value={formData.experience}
                                        onChange={e => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div>
                                    <Label>Specializations * (Select at least 1)</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {SPECIALIZATIONS.map(spec => (
                                            <label key={spec} className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.specializations.includes(spec)}
                                                    onChange={() => handleCheckboxChange("specializations", spec)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm">{spec}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label>Languages Spoken * (Select at least 1)</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {LANGUAGES.map(lang => (
                                            <label key={lang} className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.languages.includes(lang)}
                                                    onChange={() => handleCheckboxChange("languages", lang)}
                                                    className="w-4 h-4"
                                                />
                                                <span className="text-sm">{lang}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label>Fixed Session Rate (₹) *</Label>
                                    <Input
                                        type="number"
                                        min="100"
                                        max="10000"
                                        value={formData.consultationRate}
                                        onChange={e => setFormData({ ...formData, consultationRate: parseInt(e.target.value) || 500 })}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Flat fee for a consultation session of up to 1 hour 30 minutes (90 mins)</p>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <div>
                                    <Label>Professional Bio * (Min 50 characters)</Label>
                                    <textarea
                                        className="flex min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        placeholder="Tell clients about your expertise, approach, and what makes you unique..."
                                        maxLength={500}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">{formData.bio.length}/500 characters</p>
                                </div>

                                <div>
                                    <Label>Education Background</Label>
                                    <Input
                                        value={formData.education}
                                        onChange={e => setFormData({ ...formData, education: e.target.value })}
                                        placeholder="e.g., Jyotish Acharya from XYZ Institute"
                                    />
                                </div>

                                <div>
                                    <Label>Certifications (Optional - PDF only)</Label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="file"
                                            accept=".pdf"
                                            onChange={e => setCertFile(e.target.files?.[0] || null)}
                                        />
                                        {certFile && <span className="text-sm text-green-500">✓ {certFile.name}</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-6">
                            {step > 1 && (
                                <Button variant="outline" onClick={() => setStep(step - 1)}>
                                    Previous
                                </Button>
                            )}
                            {step < 3 ? (
                                <Button onClick={handleNext} className="ml-auto bg-orange-500 hover:bg-orange-600">
                                    Next Step
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="ml-auto bg-green-600 hover:bg-green-700 gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    {loading ? "Submitting..." : "Complete Profile"}
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
