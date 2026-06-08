import { NextResponse } from 'next/server';

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

        const url = new URL(req.url);
        const origin = url.origin;

        // Redirect directly to the admin verification panel with query parameters (using the locale prefix to guarantee query parameters are not stripped by next-intl middleware redirects)
        // This lets the browser execute the Firestore write with client-side admin authorization,
        // bypassing server-side IAM/gRPC permission issues.
        if (action === 'approve') {
            return NextResponse.redirect(`${origin}/en/admin/verify-astrologers?approve=${uid}`);
        } else if (action === 'reject') {
            return NextResponse.redirect(`${origin}/en/admin/verify-astrologers?reject=${uid}`);
        }

        return new NextResponse('<h1>Invalid Action</h1>', {
            headers: { 'Content-Type': 'text/html' },
            status: 400
        });

    } catch (error: any) {
        console.error("Direct verification redirect error:", error);
        return new NextResponse(`<h1>Error</h1><p>${error.message}</p>`, {
            headers: { 'Content-Type': 'text/html' },
            status: 500
        });
    }
}
