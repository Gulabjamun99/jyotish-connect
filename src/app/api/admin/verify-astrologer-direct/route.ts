import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const uid = searchParams.get('uid');
        const action = searchParams.get('action');

        if (!uid || !action) {
            return new NextResponse('<h1>Invalid Request</h1><p>Missing uid or action parameters.</p>', {
                headers: { 'Content-Type': 'text/html' },
                status: 400
            });
        }

        if (action === 'approve') {
            await updateDoc(doc(db, "astrologers", uid), {
                verified: true,
                rating: 5.0,
                consultations: 0,
                verifiedAt: new Date().toISOString()
            });

            return new NextResponse(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Astrologer Approved</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; text-align: center; padding: 50px 20px; background: #faf5ff; margin: 0; }
                        .card { max-width: 500px; margin: 0 auto; background: white; padding: 40px 30px; border-radius: 32px; box-shadow: 0 10px 25px -5px rgba(88, 28, 135, 0.1); border: 1px solid #e9d5ff; }
                        .icon { font-size: 60px; margin-bottom: 20px; }
                        h1 { color: #581c87; font-size: 28px; font-weight: 800; margin: 0 0 10px; }
                        p { color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px; }
                        .btn { background: #581c87; color: white; padding: 14px 28px; text-decoration: none; border-radius: 14px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(88, 28, 135, 0.2); }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="icon">🔮</div>
                        <h1>Expert Verified!</h1>
                        <p>The astrologer has been successfully approved and is now live on the platform to accept consultations.</p>
                        <a href="https://jyotish-connect-nine.vercel.app/" class="btn">Go to JyotishConnect</a>
                    </div>
                </body>
                </html>
            `, {
                headers: { 'Content-Type': 'text/html' }
            });

        } else if (action === 'reject') {
            await updateDoc(doc(db, "astrologers", uid), {
                rejected: true,
                rejectedAt: new Date().toISOString(),
                rejectionReason: "Rejected directly via email link."
            });

            return new NextResponse(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Astrologer Rejected</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; text-align: center; padding: 50px 20px; background: #fef2f2; margin: 0; }
                        .card { max-width: 500px; margin: 0 auto; background: white; padding: 40px 30px; border-radius: 32px; box-shadow: 0 10px 25px -5px rgba(220, 38, 38, 0.05); border: 1px solid #fee2e2; }
                        .icon { font-size: 60px; margin-bottom: 20px; }
                        h1 { color: #dc2626; font-size: 28px; font-weight: 800; margin: 0 0 10px; }
                        p { color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px; }
                        .btn { background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 14px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2); }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="icon">❌</div>
                        <h1>Application Rejected</h1>
                        <p>The astrologer application has been rejected and will not be live.</p>
                        <a href="https://jyotish-connect-nine.vercel.app/" class="btn">Go to JyotishConnect</a>
                    </div>
                </body>
                </html>
            `, {
                headers: { 'Content-Type': 'text/html' }
            });
        }

        return new NextResponse('<h1>Invalid Action</h1>', {
            headers: { 'Content-Type': 'text/html' },
            status: 400
        });

    } catch (error: any) {
        console.error("Direct verification error:", error);
        return new NextResponse(`<h1>Error</h1><p>${error.message}</p>`, {
            headers: { 'Content-Type': 'text/html' },
            status: 500
        });
    }
}
