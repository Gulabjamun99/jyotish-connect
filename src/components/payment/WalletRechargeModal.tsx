"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import { doc, updateDoc, increment, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

interface WalletRechargeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBalance: number;
}

const AMOUNTS = [100, 500, 1000, 5000];

export function WalletRechargeModal({ isOpen, onClose, currentBalance }: WalletRechargeModalProps) {
    const { user } = useAuth();
    const [amount, setAmount] = useState<number>(500);
    const [loading, setLoading] = useState(false);

    const handleRecharge = async () => {
        if (!user) return;
        if (amount < 100) {
            toast.error("Minimum recharge amount is ₹100");
            return;
        }

        setLoading(true);
        try {
            // 1. Create Razorpay Order
            const orderRes = await fetch("/api/wallet/recharge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, userId: user.uid }),
            });

            if (!orderRes.ok) throw new Error("Failed to create order");
            const { order } = await orderRes.json();

            // 2. Initialize Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "JyotishConnect Wallet",
                description: `Add ₹${amount} to Wallet`,
                order_id: order.id,
                prefill: {
                    name: user.displayName || "",
                    email: user.email || "",
                },
                theme: { color: "#f97316" }, // Orange-500
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch("/api/wallet/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                amount: amount,
                                userId: user.uid
                            }),
                        });

                        if (!verifyRes.ok) throw new Error("Payment verification failed");

                        toast.success(`Successfully added ₹${amount} to your wallet!`);
                        onClose();
                    } catch (error) {
                        console.error("Verification error:", error);
                        toast.error("Payment verification failed. If money was deducted, contact support.");
                    }
                },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on("payment.failed", function (response: any) {
                toast.error(`Payment Failed: ${response.error.description}`);
            });
            rzp.open();

        } catch (error) {
            console.error("Recharge error:", error);
            toast.error("Could not initiate recharge. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white shadow-2xl rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black text-center">Recharge Wallet</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
                        <p className="text-sm text-zinc-400 font-bold uppercase tracking-widest mb-1">Current Balance</p>
                        <p className="text-3xl font-black text-orange-500">₹{currentBalance}</p>
                    </div>

                    <div>
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mb-3">Select Amount</p>
                        <div className="grid grid-cols-2 gap-3">
                            {AMOUNTS.map((amt) => (
                                <button
                                    key={amt}
                                    onClick={() => setAmount(amt)}
                                    className={`h-12 rounded-xl font-bold border transition-all ${amount === amt
                                            ? "bg-orange-500/10 border-orange-500 text-orange-500"
                                            : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800"
                                        }`}
                                >
                                    + ₹{amt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            onClick={handleRecharge}
                            disabled={loading || amount < 100}
                            className="w-full h-14 bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-widest rounded-xl text-sm shadow-xl"
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                            ) : (
                                `Pay ₹${amount}`
                            )}
                        </Button>
                        <p className="text-center text-[10px] text-zinc-500 mt-3 uppercase tracking-wider">Secure Payment via Razorpay</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
