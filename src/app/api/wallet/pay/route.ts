import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, collection, runTransaction, getDoc } from 'firebase/firestore';
import { sendAstrologerAlert, sendMeetingInvite } from '@/services/email';

export async function POST(req: Request) {
    console.log("--- STARTING WALLET BOOKING TRANSACTION ---");
    try {
        const body = await req.json();
        const { userId, astrologerId, amount, bookingData } = body;

        console.log(`Booking Request: User=${userId}, Astro=${astrologerId}, Amount=${amount}`);

        if (!userId || !astrologerId || amount === undefined || !bookingData) {
            console.error("Validation Failed: Missing parameters");
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const userRef = doc(db, 'users', userId);
        const astroUserRef = doc(db, 'astrologers', userId);
        const astrologerRef = doc(db, 'astrologers', astrologerId);

        let bookingId = '';
        let astrologerEmail = bookingData.astrologerEmail;

        // Fetch astrologer data for email if not provided
        if (!astrologerEmail) {
            console.log("Fetching astrologer email from DB...");
            const astroSnap = await getDoc(astrologerRef);
            if (astroSnap.exists()) {
                astrologerEmail = astroSnap.data().email;
                console.log(`Astro Email Found: ${astrologerEmail}`);
            } else {
                console.warn("Astro Email NOT found in DB");
            }
        }

        await runTransaction(db, async (t) => {
            let userDoc = await t.get(userRef);
            if (!userDoc.exists()) {
                userDoc = await t.get(astroUserRef);
            }

            if (!userDoc.exists()) {
                throw new Error("User profile not found. Please complete your seeker profile.");
            }

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

        console.log(`Transaction Success: BookingID=${bookingId}`);

        // Async Email Triggers for BOTH parties
        const emailLogs: any = { user: null, astrologer: null };
        
        try {
            // 1. Send to User
            if (bookingData.userEmail) {
                console.log(`Dispatching User Email: ${bookingData.userEmail}`);
                emailLogs.user = await sendMeetingInvite({
                    to: bookingData.userEmail,
                    userName: bookingData.userName || "Seeker",
                    astrologerName: bookingData.astrologerName || "Master",
                    type: bookingData.type,
                    date: bookingData.date,
                    time: bookingData.time,
                    bookingId: bookingId
                });
            }

            // 2. Send to Astrologer
            if (astrologerEmail) {
                console.log(`Dispatching Astrologer Email: ${astrologerEmail}`);
                emailLogs.astrologer = await sendAstrologerAlert({
                    astrologerEmail,
                    astrologerName: bookingData.astrologerName || "Master",
                    userName: bookingData.userName || "Seeker",
                    date: bookingData.date,
                    time: bookingData.time,
                    bookingId: bookingId
                });
            }
        } catch (e: any) {
            console.error("Email dispatch failed:", e);
            emailLogs.error = e.message;
        }

        return NextResponse.json({ 
            success: true, 
            bookingId,
            emailStatus: emailLogs 
        });

    } catch (error: any) {
        console.error('Wallet payment failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
