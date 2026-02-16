"use client";

import { useEffect } from "react";

export function AdBanner({ slot }: { slot: string }) {
    useEffect(() => {
        try {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch (err) {
            console.error("AdSense error:", err);
        }
    }, []);

    return (
        <div className="w-full overflow-hidden my-8 bg-secondary/10 flex items-center justify-center p-4 border border-dashed border-white/5 rounded-xl">
            <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
                data-ad-slot={slot}
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
            {/* Fallback indicator for dev purposes */}
            {!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-50">
                    AdSense Banner Placeholder - {slot}
                </div>
            )}
        </div>
    );
}
