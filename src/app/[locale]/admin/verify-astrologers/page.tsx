"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import { CheckCircle, XCircle, Download, Clock, Star } from "lucide-react";
import { useRouter } from "next/navigation";

type PendingAstrologer = {
    uid: string;
    displayName: string;
    email: string;
    phoneNumber: string;
    photoURL: string;
    experience: number;
    specializations: string[];
    languages: string[];
    consultationRate: number;
    bio: string;
    education: string;
    certificationURL?: string;
    createdAt: string;
};

export default function VerifyAstrologersPage() {
    const { userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const [astrologers, setAstrologers] = useState<PendingAstrologer[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAstrologer, setSelectedAstrologer] = useState<PendingAstrologer | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && userData?.role !== "admin") {
            router.push("/");
        }
    }, [authLoading, userData, router]);

    useEffect(() => {
        fetchPendingAstrologers();
    }, []);

    const fetchPendingAstrologers = async () => {
        try {
            const q = query(
                collection(db, "astrologers"),
                where("profileComplete", "==", true),
                where("verified", "==", false)
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as PendingAstrologer));
            setAstrologers(data);
        } catch (error) {
            console.error("Error fetching astrologers:", error);
            toast.error("Failed to load pending astrologers");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (uid: string) => {
        setActionLoading(true);
        try {
            await updateDoc(doc(db, "astrologers", uid), {
                verified: true,
                verifiedAt: new Date().toISOString()
            });
            toast.success("Astrologer approved successfully!");
            fetchPendingAstrologers();
            setSelectedAstrologer(null);
        } catch (error) {
            console.error("Approval error:", error);
            toast.error("Failed to approve astrologer");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (uid: string) => {
        if (!rejectionReason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
        }
        setActionLoading(true);
        try {
            await updateDoc(doc(db, "astrologers", uid), {
                rejected: true,
                rejectionReason,
                rejectedAt: new Date().toISOString()
            });
            toast.success("Astrologer rejected");
            fetchPendingAstrologers();
            setSelectedAstrologer(null);
            setRejectionReason("");
        } catch (error) {
            console.error("Rejection error:", error);
            toast.error("Failed to reject astrologer");
        } finally {
            setActionLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (userData?.role !== "admin") {
        return null;
    }

    return (
        <main className="min-h-screen flex flex-col bg-secondary/10">
            <Navbar />
            <div className="container mx-auto px-4 py-12 flex-grow">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold mb-2">Verify Astrologers</h1>
                    <p className="text-muted-foreground">Review and approve pending astrologer applications</p>
                </header>

                {astrologers.length === 0 ? (
                    <div className="glass rounded-3xl p-12 text-center space-y-4">
                        <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                        <h3 className="text-2xl font-bold">All Caught Up!</h3>
                        <p className="text-muted-foreground">No pending astrologer applications at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* List */}
                        <div className="lg:col-span-1 space-y-4">
                            <h2 className="text-xl font-bold mb-4">Pending ({astrologers.length})</h2>
                            {astrologers.map(astro => (
                                <div
                                    key={astro.uid}
                                    onClick={() => setSelectedAstrologer(astro)}
                                    className={`glass p-4 rounded-2xl cursor-pointer transition-all hover:border-orange-500/50 ${selectedAstrologer?.uid === astro.uid ? "border-orange-500 bg-orange-500/5" : ""
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={astro.photoURL || "/placeholder-avatar.png"}
                                            alt={astro.displayName}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold truncate">{astro.displayName}</h3>
                                            <p className="text-xs text-muted-foreground">{astro.experience} years exp</p>
                                        </div>
                                        <Clock className="w-4 h-4 text-orange-500" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Details */}
                        <div className="lg:col-span-2">
                            {selectedAstrologer ? (
                                <div className="glass p-8 rounded-3xl space-y-6">
                                    <div className="flex items-start gap-6">
                                        <img
                                            src={selectedAstrologer.photoURL || "/placeholder-avatar.png"}
                                            alt={selectedAstrologer.displayName}
                                            className="w-24 h-24 rounded-full object-cover"
                                        />
                                        <div className="flex-1">
                                            <h2 className="text-3xl font-bold mb-2">{selectedAstrologer.displayName}</h2>
                                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                                <span>📧 {selectedAstrologer.email}</span>
                                                {selectedAstrologer.phoneNumber && <span>📱 {selectedAstrologer.phoneNumber}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-secondary/30 p-4 rounded-xl">
                                            <p className="text-xs text-muted-foreground mb-1">Experience</p>
                                            <p className="font-bold">{selectedAstrologer.experience} years</p>
                                        </div>
                                        <div className="bg-secondary/30 p-4 rounded-xl">
                                            <p className="text-xs text-muted-foreground mb-1">Rate</p>
                                            <p className="font-bold">₹{selectedAstrologer.consultationRate}/min</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold mb-2">Specializations</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedAstrologer.specializations.map(spec => (
                                                <span key={spec} className="px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full text-sm">
                                                    {spec}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold mb-2">Languages</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedAstrologer.languages.map(lang => (
                                                <span key={lang} className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-sm">
                                                    {lang}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold mb-2">Bio</h3>
                                        <p className="text-muted-foreground">{selectedAstrologer.bio}</p>
                                    </div>

                                    {selectedAstrologer.education && (
                                        <div>
                                            <h3 className="font-bold mb-2">Education</h3>
                                            <p className="text-muted-foreground">{selectedAstrologer.education}</p>
                                        </div>
                                    )}

                                    {selectedAstrologer.certificationURL && (
                                        <div>
                                            <h3 className="font-bold mb-2">Certification</h3>
                                            <a
                                                href={selectedAstrologer.certificationURL}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-orange-500 hover:underline"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download Certificate
                                            </a>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="pt-6 border-t space-y-4">
                                        <div className="flex gap-4">
                                            <Button
                                                onClick={() => handleApprove(selectedAstrologer.uid)}
                                                disabled={actionLoading}
                                                className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                                {actionLoading ? "Processing..." : "Approve"}
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => handleReject(selectedAstrologer.uid)}
                                                disabled={actionLoading || !rejectionReason.trim()}
                                                className="flex-1 gap-2"
                                            >
                                                <XCircle className="w-5 h-5" />
                                                Reject
                                            </Button>
                                        </div>
                                        <textarea
                                            className="w-full min-h-[80px] rounded-xl border border-input bg-background px-3 py-2 text-sm"
                                            placeholder="Rejection reason (required for rejection)"
                                            value={rejectionReason}
                                            onChange={e => setRejectionReason(e.target.value)}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="glass rounded-3xl p-12 text-center">
                                    <p className="text-muted-foreground">Select an astrologer to review their profile</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}
