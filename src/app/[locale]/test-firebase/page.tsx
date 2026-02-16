"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";

export default function FirebaseTestPage() {
    const [status, setStatus] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const addLog = (message: string) => {
        setStatus(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const testConnection = async () => {
        setStatus([]);
        setLoading(true);

        try {
            addLog("✓ Starting Firebase connection test...");

            // Test 1: Check if db is initialized
            if (!db) {
                addLog("✗ ERROR: Firestore db is not initialized");
                setLoading(false);
                return;
            }
            addLog("✓ Firestore db object exists");

            // Test 2: Try to read from a collection
            addLog("Testing read from 'users' collection...");
            try {
                const usersRef = collection(db, "users");
                const snapshot = await getDocs(usersRef);
                addLog(`✓ Successfully read from users collection (${snapshot.size} documents)`);
            } catch (error: any) {
                addLog(`✗ ERROR reading users: ${error.code} - ${error.message}`);
                throw error;
            }

            // Test 3: Try to write a test document
            addLog("Testing write to 'test' collection...");
            try {
                const testRef = doc(db, "test", "connection-test");
                await setDoc(testRef, {
                    timestamp: new Date().toISOString(),
                    message: "Connection test successful"
                });
                addLog("✓ Successfully wrote test document");
            } catch (error: any) {
                addLog(`✗ ERROR writing test: ${error.code} - ${error.message}`);
                throw error;
            }

            addLog("✓✓✓ ALL TESTS PASSED! Firebase is working correctly.");

        } catch (error: any) {
            addLog(`\n❌ FINAL ERROR: ${error.code || 'unknown'}`);
            addLog(`Message: ${error.message}`);

            if (error.code === 'unavailable' || error.message?.includes('offline')) {
                addLog("\n🔍 DIAGNOSIS: Firestore thinks it's offline");
                addLog("\nPossible causes:");
                addLog("1. Check your internet connection");
                addLog("2. Verify Firestore is enabled in Firebase Console");
                addLog("3. Check Firestore Security Rules");
                addLog("4. Verify Firebase project credentials in .env.local");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-8 bg-secondary/10">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Firebase Connection Diagnostics</h1>

                <div className="glass p-6 rounded-3xl mb-6">
                    <h2 className="text-xl font-bold mb-4">Environment Variables</h2>
                    <div className="space-y-2 text-sm font-mono">
                        <p>API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing'}</p>
                        <p>Auth Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓ Set' : '✗ Missing'}</p>
                        <p>Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing'}</p>
                    </div>
                </div>

                <Button
                    onClick={testConnection}
                    disabled={loading}
                    className="w-full h-14 text-lg font-bold mb-6"
                >
                    {loading ? "Running Tests..." : "Run Connection Test"}
                </Button>

                <div className="glass p-6 rounded-3xl">
                    <h2 className="text-xl font-bold mb-4">Test Results</h2>
                    <div className="bg-black/50 p-4 rounded-xl font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
                        {status.length === 0 ? (
                            <p className="text-muted-foreground">Click "Run Connection Test" to start...</p>
                        ) : (
                            status.map((log, i) => (
                                <p key={i} className={
                                    log.includes('✓') ? 'text-green-500' :
                                        log.includes('✗') || log.includes('❌') ? 'text-red-500' :
                                            log.includes('🔍') ? 'text-yellow-500' :
                                                'text-white'
                                }>{log}</p>
                            ))
                        )}
                    </div>
                </div>

                <div className="mt-8 glass p-6 rounded-3xl">
                    <h2 className="text-xl font-bold mb-4">Quick Fixes</h2>
                    <ol className="list-decimal list-inside space-y-3 text-sm">
                        <li>
                            <strong>Check Firestore Rules:</strong> Go to Firebase Console → Firestore Database → Rules
                            <pre className="bg-black/50 p-2 rounded mt-2 text-xs">
                                {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // For testing only!
    }
  }
}`}
                            </pre>
                        </li>
                        <li><strong>Enable Firestore:</strong> Ensure Firestore Database is created in Firebase Console</li>
                        <li><strong>Check Network:</strong> Disable VPN, firewall, or antivirus temporarily</li>
                        <li><strong>Clear Cache:</strong> Clear browser cache and restart dev server</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
