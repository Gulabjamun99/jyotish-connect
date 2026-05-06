import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, collection, runTransaction, getDoc } from 'firebase/firestore';
import { sendAstrologerAlert, sendMeetingInvite } from '@/services/email';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, astrologerId, amount, bookingData } = body;

        if (!userId || !astrologerId || amount === undefined || !bookingData) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const userRef = doc(db, 'users', userId);
        const astroUserRef = doc(db, 'astrologers', userId);
        const astrologerRef = doc(db, 'astrologers', astrologerId);

        let bookingId = '';
        let astrologerEmail = bookingData.astrologerEmail;

        // Fetch astrologer data for email if not provided
        if (!astrologerEmail) {
            const astroSnap = await getDoc(astrologerRef);
            if (astroSnap.exists()) {
                astrologerEmail = astroSnap.data().email;
            }
        }

        await runTransaction(db, async (t) => {
            // Check both users and astrologers collections for the seeker's profile
            let userDoc = await t.get(userRef);
            if (!userDoc.exists()) {
                userDoc = await t.get(astroUserRef);
            }

            if (!userDoc.exists()) {
                throw new Error("User profile not found. Please ensure you have completed your profile.");
            }

            const currentBalance = userDoc.data()?.walletBalance || 0;
            
            // Note: Wallet deduction logic is currently bypassed for testing as per user request
            // if (currentBalance < amount) throw new Error("Insufficient balance");

            const bookingsRef = collection(db, 'bookings');
            const newBookingRef = doc(bookingsRef);
            bookingId = newBookingRef.id;

            t.set(newBookingRef, {
                ...bookingData,
                id: bookingId,
                status: "upcoming",
                paymentMode: 'wallet',
                astrologerEmail: astrologerEmail || "",
                createdAt: new Date().toISOString()
            });

            const txRef = doc(collection(db, 'transactions'));
            t.set(txRef, {
                userId,
                astrologerId,
                amount,
                type: 'payment',
                status: 'completed',
                paymentMode: 'wallet',
                bookingId: bookingId,
                description: `Booking: ${bookingData.type}`,
                createdAt: new Date().toISOString()
            });
        });

        // Async Email Triggers for BOTH parties
        try {
            // 1. Send to User
            if (bookingData.userEmail) {
                sendMeetingInvite({
                    to: bookingData.userEmail,
                    userName: bookingData.userName || "Seeker",
                    astrologerName: bookingData.astrologerName || "Master",
                    type: bookingData.type,
                    date: bookingData.date,
                    time: bookingData.time,
                    bookingId: bookingId
                }).catch(e => console.error("User Email error:", e));
            }

            // 2. Send to Astrologer
            if (astrologerEmail) {
                sendAstrologerAlert({
                    astrologerEmail,
                    astrologerName: bookingData.astrologerName || "Master",
                    userName: bookingData.userName || "Seeker",
                    date: bookingData.date,
                    time: bookingData.time,
                    bookingId: bookingId
                }).catch(e => console.error("Astrologer Email error:", e));
            }
        } catch (e) {
            console.error("Email dispatch failed:", e);
        }

        return NextResponse.json({ success: true, bookingId });

    } catch (error: any) {
        console.error('Booking failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
