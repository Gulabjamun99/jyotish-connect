"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
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
        let unsubscribeUser: () => void;
        let unsubscribeAstro: () => void;

        const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
            setUser(authUser);
            setLoading(true);

            if (authUser) {
                // 1. Listen to the generic 'users' collection first
                unsubscribeUser = onSnapshot(doc(db, "users", authUser.uid),
                    (userSnap: any) => {
                        if (userSnap.exists()) {
                            const data = userSnap.data();
                            const userRole = data.role || "user";

                            // If role is astrologer, we MUST listen to the astrologers collection
                            // because that's where profileComplete lives
                            if (userRole === "astrologer") {
                                setRole("astrologer");

                                // Subscribe to astrologer profile
                                if (unsubscribeAstro) unsubscribeAstro(); // Clear existing if any
                                unsubscribeAstro = onSnapshot(doc(db, "astrologers", authUser.uid),
                                    (astroSnap: any) => {
                                        if (astroSnap.exists()) {
                                            // Merge user doc data with astrologer doc data, giving priority to astrologer data
                                            setUserData({ ...data, ...astroSnap.data() });
                                        } else {
                                            // Fallback if astrologer doc doesn't exist yet (signup phase)
                                            setUserData(data);
                                        }
                                        setLoading(false);
                                    },
                                    (error: any) => {
                                        console.error("Error listening to astrologer profile:", error);
                                        setLoading(false);
                                    }
                                );
                            } else {
                                // Regular user
                                setRole(userRole as any);
                                setUserData(data);
                                setLoading(false);
                                if (unsubscribeAstro) {
                                    unsubscribeAstro();
                                    unsubscribeAstro = undefined as any;
                                }
                            }
                        } else {
                            // 2. User doc not found in 'users', check 'astrologers' directly
                            // This handles cases where they might only exist in 'astrologers'
                            if (unsubscribeAstro) unsubscribeAstro();
                            unsubscribeAstro = onSnapshot(doc(db, "astrologers", authUser.uid),
                                (astroSnap: any) => {
                                    if (astroSnap.exists()) {
                                        setRole("astrologer");
                                        setUserData(astroSnap.data());
                                    } else {
                                        // User exists in Auth but no DB record yet
                                        setUserData(null);
                                        setRole(null);
                                    }
                                    setLoading(false);
                                },
                                (error: any) => {
                                    console.error("Error listening to astrologer profile (fallback):", error);
                                    setLoading(false);
                                }
                            );
                        }
                    },
                    (error: any) => {
                        console.error("Error listening to user profile:", error);
                        setLoading(false);
                    }
                );
            } else {
                // No user
                setUserData(null);
                setRole(null);
                setLoading(false);
                if (unsubscribeUser) unsubscribeUser();
                if (unsubscribeAstro) unsubscribeAstro();
            }
        });

        // Cleanup function
        return () => {
            unsubscribeAuth();
            if (unsubscribeUser) unsubscribeUser();
            if (unsubscribeAstro) unsubscribeAstro();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, userData, loading, role }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
