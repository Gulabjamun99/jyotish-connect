"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AstrologerSignupPage() {
    const router = useRouter();

    useEffect(() => {
        // Set intent so Login page knows even if query params are lost due to redirects
        if (typeof window !== "undefined") {
            localStorage.setItem("loginIntent", "astrologer");
        }
        router.push("/login?role=astrologer");
    }, [router]);

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="animate-pulse">Redirecting to Expert Login...</div>
        </div>
    );
}
