"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

export default function DebugAstrologersPage() {
    const [astrologers, setAstrologers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<string[]>([]);

    const log = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const fetchAllAstrologers = async () => {
        setLoading(true);
        try {
            log("Fetching all astrologers (no filters)...");
            const snapshot = await getDocs(collection(db, "astrologers"));
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setAstrologers(data);
            log(`Fetched ${data.length} documents.`);
        } catch (err: any) {
            log(`Error fetching: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fixAstrologer = async (id: string, currentData: any) => {
        try {
            log(`Fixing astrologer ${id}...`);
            const updates: any = {};
            if (currentData.verified === undefined) updates.verified = false;
            if (currentData.rating === undefined) updates.rating = 5.0;
            if (currentData.consultations === undefined) updates.consultations = 0;

            if (Object.keys(updates).length === 0) {
                log("No updates needed.");
                return;
            }

            await updateDoc(doc(db, "astrologers", id), updates);
            log(`Updated ${id} with ${JSON.stringify(updates)}`);
            await fetchAllAstrologers(); // Refresh
        } catch (err: any) {
            log(`Error keeping astrologer: ${err.message}`);
        }
    };

    const fixAll = async () => {
        for (const astro of astrologers) {
            if (astro.verified === true) { // Only fix verified ones to ensure they show up
                await fixAstrologer(astro.id, astro);
            }
        }
        log("Finished fixing all verified astrologers.");
    };

    useEffect(() => {
        fetchAllAstrologers();
    }, []);

    return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold">Debug Astrologers</h1>
            <div className="flex gap-4">
                <Button onClick={fetchAllAstrologers}>Refresh</Button>
                <Button onClick={fixAll} variant="destructive">Fix All Verified (Add Missing Fields)</Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <h2 className="font-bold">Astrologers ({astrologers.length})</h2>
                    <div className="h-[500px] overflow-auto border p-2 rounded bg-gray-50">
                        {astrologers.map(astro => (
                            <div key={astro.id} className="mb-4 p-2 border rounded bg-white text-xs">
                                <div className="font-bold">{astro.displayName || astro.name || "No Name"} ({astro.id})</div>
                                <div>Verified: {String(astro.verified)}</div>
                                <div className={astro.rating === undefined ? "text-red-500 font-bold" : "text-green-600"}>
                                    Rating: {astro.rating !== undefined ? astro.rating : "MISSING"}
                                </div>
                                <div>Consultations: {astro.consultations}</div>
                                <Button size="sm" variant="outline" className="mt-2 h-6" onClick={() => fixAstrologer(astro.id, astro)}>
                                    Fix This One
                                </Button>
                                <pre className="mt-1 bg-gray-100 p-1 overflow-x-auto">
                                    {JSON.stringify(astro, null, 2)}
                                </pre>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="font-bold">Logs</h2>
                    <div className="h-[500px] overflow-auto border p-2 rounded bg-black text-green-400 font-mono text-xs">
                        {logs.map((l, i) => <div key={i}>{l}</div>)}
                    </div>
                </div>
            </div>
        </div>
    );
}
