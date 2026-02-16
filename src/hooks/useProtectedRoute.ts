"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function UseProtectedRoute(allowedRoles: string[] = ["user", "astrologer", "admin"]) {
    const { user, userData, role, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push(`/login?redirect=${pathname}`);
            } else if (role && !allowedRoles.includes(role)) {
                router.push("/unauthorized");
            }
        }
    }, [user, role, loading, router, pathname, allowedRoles]);

    return { user, userData, role, loading };
}
