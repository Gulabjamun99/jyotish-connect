import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { dbAdmin } from '@/lib/firebase-admin';

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { amount, userId } = body;

        if (!amount || !userId) {
            return NextResponse.json({ error: 'Missing amount or userId' }, { status: 400 });
        }

        const options = {
            amount: amount * 100, // Razorpay works in paise
            currency: 'INR',
            receipt: `recharge_${userId}_${Date.now()}`,
            payment_capture: 1,
        };

        const order = await razorpay.orders.create(options);

        // Pre-create a "pending" transaction in Firestore
        await dbAdmin.collection('transactions').doc(order.id).set({
            userId,
            amount,
            type: 'recharge',
            status: 'pending',
            paymentMode: 'razorpay',
            razorpayOrderId: order.id,
            description: `Wallet Recharge of ₹${amount}`,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true, order });
    } catch (error: any) {
        console.error('Wallet recharge order creation failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
