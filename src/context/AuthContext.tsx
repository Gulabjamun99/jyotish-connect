"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    userData: any | null;
    loading: boolean;
    role: "user" | "astrologer" | "admin" | null;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
    role: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<any | null>(null);
    const [role, setRole] = useState<"user" | "astrologer" | "admin" | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Safe check for mock/missing auth
        if (!auth || !auth.currentUser && !auth.app) {
            console.warn("Auth not initialized (missing env vars?), skipping auth check.");
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                try {
                    // Retry logic for flaky connections
                    let retries = 3;
                    let userDoc = null;
                    let astroDoc = null;

                    while (retries > 0) {
                        try {
                            // Safe check for dummy db
                            if ((db as any).type === 'dummy') {
                                console.warn("Firestore is in dummy mode. Skipping user data fetch.");
                                break;
                            }
                            userDoc = await getDoc(doc(db, "users", user.uid));
                            break;
                        } catch (err: any) {
                            if ((err.message?.includes("offline") || err.code === 'unavailable') && retries > 1) {
                                console.warn("Firestore offline/unavailable, retrying...", retries);
                                await new Promise(r => setTimeout(r, 1500));
                                retries--;
                                continue;
                            }
                            console.error("Firestore read failed:", err);
                            // If it's a critical failure, we might want to fallback to a 'guest' state or stop retrying
                            if (retries <= 1) throw err; // Throw on last retry
                            retries--;
                        }
                    }

                    if (userDoc && userDoc.exists()) {
                        const data = userDoc.data();
                        setUserData(data);
                        setRole(data.role || "user");
                    } else {
                        // Reset retries for second fetch
                        retries = 3;

                        // Check in astrologers collection if not in users
                        while (retries > 0) { // Reuse retry count if needed or reset
                            try {
                                astroDoc = await getDoc(doc(db, "astrologers", user.uid));
                                break;
                            } catch (err: any) {
                                if ((err.message?.includes("offline") || err.code === 'unavailable') && retries > 1) {
                                    console.warn("Firestore (Astro) offline/unavailable, retrying...", retries);
                                    await new Promise(r => setTimeout(r, 1500));
                                    retries--;
                                    continue;
                                }
                                if (retries <= 1) throw err;
                                retries--;
                            }
                        }

                        if (astroDoc && astroDoc.exists()) {
                            const data = astroDoc.data();
                            setUserData(data);
                            setRole("astrologer");
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                setUserData(null);
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, userData, loading, role }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
