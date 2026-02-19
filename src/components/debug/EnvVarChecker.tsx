"use client";

import { useEffect, useState } from "react";
import { app } from "@/lib/firebase";

export function EnvVarChecker() {
    const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
    const [missingKeys, setMissingKeys] = useState<string[]>([]);

    useEffect(() => {
        // Only run on client
        const checkKeys = () => {
            const required = [
                "NEXT_PUBLIC_FIREBASE_API_KEY",
                "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
                "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
                "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
                "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
                "NEXT_PUBLIC_FIREBASE_APP_ID"
            ];

            const missing = required.filter(key => !process.env[key]);

            if (missing.length > 0) {
                setMissingKeys(missing);
                setStatus("error");
            } else {
                try {
                    // Double check if Firebase app initialized
                    if (!app) throw new Error("Firebase App not initialized");
                    setStatus("ok");
                } catch (e) {
                    setStatus("error");
                }
            }
        };

        checkKeys();
    }, []);

    if (status === "ok") return null; // Don't show anything if healthy

    if (status === "loading") return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 p-6 bg-red-900/90 text-white rounded-xl shadow-2xl border border-red-500 max-w-md backdrop-blur-xl">
            <h3 className="font-bold text-lg mb-2">🔥 Critical Config Error</h3>
            <p className="text-sm opacity-90 mb-4">
                The application cannot connect to the "Live" database because the following Environment Variables are missing in Vercel:
            </p>
            <ul className="list-disc pl-5 text-xs font-mono space-y-1 mb-4 text-red-200">
                {missingKeys.map(key => (
                    <li key={key}>{key}</li>
                ))}
            </ul>
            <p className="text-xs italic opacity-75">
                Go to Vercel Dashboard {">"} Settings {">"} Environment Variables to fix this.
            </p>
        </div>
    );
}
