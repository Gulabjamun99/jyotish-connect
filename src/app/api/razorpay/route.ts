import Razorpay from "razorpay";
import { NextResponse } from "next/server";

// Lazy initialization to avoid build-time errors when env vars are missing
let razorpay: Razorpay | null = null;

const getRazorpay = () => {
    if (!razorpay) {
        if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error("Razorpay credentials missing");
        }
        razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpay;
};

export async function POST(req: Request) {
    try {
        const { amount, currency = "INR" } = await req.json();
        const client = getRazorpay();

        const options = {
            amount: amount * 100,
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        const order = await client.orders.create(options);
        return NextResponse.json(order);
    } catch (error) {
        console.error("Razorpay error:", error);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}
