"use client";

import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UseProtectedRoute } from "@/hooks/useProtectedRoute";
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowDownLeft, ArrowUpRight, IndianRupee, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function AstrologerTransactionsPage() {
    const { user, userData, loading } = UseProtectedRoute(["astrologer"]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchTransactions = async () => {
            try {
                // Fetch transactions where the astrologer is the receiver (earnings) or sender (payouts)
                const q = query(
                    collection(db, "transactions"),
                    where("astrologerId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );
                const querySnapshot = await getDocs(q);
                const txs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setTransactions(txs);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, [user]);

    const handleWithdrawRequest = () => {
        if (userData?.walletBalance < 500) {
            toast.error("Minimum withdrawal amount is ₹500");
            return;
        }
        toast.success("Withdrawal request submitted! Our team will process it within 24-48 hours.");
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-zinc-950 font-sans pb-24 md:pb-0">
            <Navbar />

            <div className="container mx-auto px-4 md:px-8 pt-32 pb-16 max-w-4xl">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                            <IndianRupee className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">Earnings & Ledger</h1>
                            <p className="text-zinc-500 font-medium">Track your consultation income and withdrawals</p>
                        </div>
                    </div>

                    <div className="glass bg-zinc-900 border border-white/5 p-4 rounded-2xl flex items-center gap-6">
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Available to Withdraw</div>
                            <div className="text-2xl font-black text-white">₹{userData?.walletBalance || 0}</div>
                        </div>
                        <Button
                            onClick={handleWithdrawRequest}
                            disabled={!userData?.walletBalance || userData.walletBalance < 500}
                            className="h-12 px-6 bg-white hover:bg-zinc-200 text-black font-bold uppercase tracking-widest text-xs rounded-xl"
                        >
                            Withdraw
                        </Button>
                    </div>
                </div>

                <div className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="p-4 border-b border-white/5 bg-zinc-950/50">
                        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Transaction History</h2>
                    </div>
                    {transactions.length > 0 ? (
                        <div className="divide-y divide-zinc-800/50">
                            {transactions.map((tx) => {
                                const isCredit = tx.type === 'earning';
                                return (
                                    <div key={tx.id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-800/20 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center border ${isCredit
                                                ? 'bg-green-500/10 border-green-500/20 text-green-500'
                                                : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                                                }`}>
                                                {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-white">{tx.description}</h3>
                                                <div className="flex items-center gap-3 mt-1 text-xs font-bold uppercase tracking-widest text-zinc-500">
                                                    <span>{new Date(tx.createdAt).toLocaleString()}</span>
                                                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                                    <span className={
                                                        tx.status === 'completed' ? 'text-green-500' :
                                                            tx.status === 'failed' ? 'text-red-500' : 'text-amber-500'
                                                    }>
                                                        {tx.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-left md:text-right pl-14 md:pl-0">
                                            <p className={`text-xl font-black ${isCredit ? 'text-green-500' : 'text-white'}`}>
                                                {isCredit ? '+' : '-'}₹{tx.amount}
                                            </p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">
                                                {tx.type}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-16 text-center text-zinc-500 flex flex-col items-center">
                            <IndianRupee className="w-12 h-12 opacity-20 mb-4" />
                            <p className="font-bold text-lg text-white">No earnings yet</p>
                            <p className="text-sm mt-1">Your consultation income will appear here.</p>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}
