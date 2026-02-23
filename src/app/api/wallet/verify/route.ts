import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { dbAdmin } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, userId } = body;

        // 1. Verify Signature
        const key_secret = process.env.RAZORPAY_KEY_SECRET;
        if (!key_secret) throw new Error("Missing Razorpay Secret");

        const generated_signature = crypto
            .createHmac('sha256', key_secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            // Update Transaction to failed
            await dbAdmin.collection('transactions').doc(razorpay_order_id).update({
                status: 'failed',
                updatedAt: new Date().toISOString()
            });
            return NextResponse.json({ error: 'Invalid Payment Signature' }, { status: 400 });
        }

        // 2. Perform Atomic Increment on User Wallet
        const userRef = dbAdmin.collection('users').doc(userId);

        // We use a transaction to ensure we only credit the wallet ONCE
        await dbAdmin.runTransaction(async (t) => {
            const txRef = dbAdmin.collection('transactions').doc(razorpay_order_id);
            const txDoc = await t.get(txRef);

            if (!txDoc.exists) throw new Error("Transaction record missing");
            if (txDoc.data()?.status === 'completed') throw new Error("Already credited");

            // Mark transaction complete
            t.update(txRef, {
                status: 'completed',
                razorpayPaymentId: razorpay_payment_id,
                updatedAt: new Date().toISOString()
            });

            // Credit wallet
            t.set(userRef, {
                walletBalance: dbAdmin.firestore.FieldValue.increment(amount)
            }, { merge: true }); // Merge true in case the document is somehow new/missing other fields
        });

        console.log(`Successfully credited ₹${amount} to user ${userId}`);

        return NextResponse.json({ success: true, message: 'Wallet recharged successfully' });

    } catch (error: any) {
        console.error('Wallet recharge verification failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
