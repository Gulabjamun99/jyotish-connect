import { db } from "../lib/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    increment,
    setDoc,
    onSnapshot,
    arrayUnion,
    orderBy,
    limit,
    startAfter
} from "firebase/firestore";

function sanitize(data: any) {
    const payload = { ...data };
    Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
            delete payload[key];
        } else if (payload[key] !== null && typeof payload[key] === 'object') {
            payload[key] = sanitize(payload[key]);
        }
    });
    return payload;
}

// --- NEW SCHEMAS FOR PROFILES & WALLETS ---

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    phone?: string;
    address?: string;
    walletBalance: number;
    profileComplete: boolean;
    createdAt: any;
    updatedAt: any;
    // Optional esoteric details
    dob?: string;
    tob?: string;
    pob?: string;
}

export interface Transaction {
    id?: string;
    userId: string;
    astrologerId?: string;
    amount: number;
    type: 'recharge' | 'payment' | 'earning' | 'payout' | 'refund';
    status: 'pending' | 'completed' | 'failed';
    paymentMode: 'wallet' | 'razorpay';
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    bookingId?: string;
    description: string;
    createdAt: any;
}

export interface Booking {
    id?: string;
    userId: string;
    astrologerId: string;
    astrologerName: string;
    date: any; // Firestore Timestamp
    time: string;
    type: "video" | "audio" | "chat";
    price: number;
    paymentMode?: 'wallet' | 'razorpay';
    status: "pending" | "active" | "completed" | "cancelled";
    durationSeconds?: number;
    transcript?: string;
    createdAt?: any;
}

// ------------------------------------------

export interface Astrologer {
    id: string;
    name: string;
    email?: string; // Added for notifications
    displayName?: string;
    expertise: string;
    specializations?: string[];
    languages: string[];
    rating: number;
    reviews: number;
    consultations?: number;
    price: number;
    consultationRate?: number;
    image: string;
    photoURL?: string;
    verified: boolean;
    online: boolean;
    bio?: string;
    experience?: number;
    education?: string;
    availability?: {
        days: number[]; // 0-6 (Sun-Sat)
        startTime: string; // "09:00"
        endTime: string; // "18:00"
        slots?: string[]; // Specific slots overrides
    };
}

export const getAstrologers = async (filters?: any, limitCount: number = 50, lastDoc?: any) => {
    try {
        if ((db as any).type === 'dummy') {
            console.warn("Firestore is in dummy mode. Returning empty list.");
            return { astrologers: [], lastDoc: null };
        }

        const astroRef = collection(db, "astrologers");

        // Fetch all verified. We will sort in-memory to prevent requiring Firestore Composite Indexes.
        const q = query(astroRef, where("verified", "==", true));

        const querySnapshot = await getDocs(q);
        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

        const ensureArray = (data: any) => {
            if (Array.isArray(data)) return data;
            if (data && typeof data === 'object') return Object.values(data);
            return [];
        };

        let data = querySnapshot.docs.map(doc => {
            const raw = doc.data();
            return {
                ...raw,
                id: doc.id,
                name: raw.displayName || "Unknown",
                expertise: ensureArray(raw.specializations)[0] || "Astrology",
                rating: raw.rating || 5.0,
                reviews: raw.consultations || 0,
                price: raw.consultationRate || 50,
                image: raw.photoURL || "/placeholder-avatar.png",
                verified: raw.verified || false,
                online: true,
                bio: raw.bio || "",
                specializations: ensureArray(raw.specializations),
                languages: ensureArray(raw.languages).length > 0 ? ensureArray(raw.languages) : ["English"]
            } as Astrologer;
        });

        // In-memory filter by expertise if requested
        if (filters?.expertise && filters.expertise.length > 0) {
            data = data.filter(a => filters.expertise.includes(a.expertise));
        }

        // In-memory sort by rating
        data.sort((a, b) => b.rating - a.rating);

        return { astrologers: data.slice(0, limitCount), lastDoc: lastVisible };
    } catch (error: any) {
        console.error("Error fetching astrologers:", error);
        // Return empty array if Firestore is offline
        if (error.message?.includes("offline") || error.code === "unavailable") {
            console.warn("Firestore offline, returning empty array");
            return { astrologers: [], lastDoc: null };
        }
        throw error;
    }
};

export const getAstrologerById = async (id: string) => {
    const docRef = doc(db, "astrologers", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Astrologer;
    }
    return null;
};

export const startConsultation = async (id: string, data: any) => {
    const docRef = doc(db, "consultations", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        const payload = sanitize({
            ...data,
            transcript: [],
            status: "active",
            createdAt: new Date().toISOString()
        });
        await setDoc(docRef, payload);
    }
};

export const addTranscriptLine = async (id: string, entry: { speaker: string, text: string, time: string }) => {
    const docRef = doc(db, "consultations", id);
    await updateDoc(docRef, {
        transcript: arrayUnion(sanitize(entry))
    });
};

export const listenToConsultation = (id: string, callback: (data: any) => void) => {
    const docRef = doc(db, "consultations", id);
    return onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data());
        }
    });
};

// Old Booking interface removed in favor of the new one at the top of the file

export const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    try {
        const bookingsRef = collection(db, "bookings");
        const docRef = doc(bookingsRef); // Auto-ID
        const newBooking: Booking = {
            ...bookingData,
            id: docRef.id,
            status: 'active', // Active immediately upon creation for MVP
            createdAt: new Date().toISOString()
        };
        await setDoc(docRef, newBooking);
        return newBooking;
    } catch (error) {
        console.error("Error creating booking:", error);
        throw error;
    }
};

export const getUserBookings = async (userId: string) => {
    try {
        const q = query(collection(db, "bookings"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return [];
    }
};

export const getAstrologerBookings = async (astrologerId: string) => {
    try {
        const q = query(collection(db, "bookings"), where("astrologerId", "==", astrologerId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching astrologer bookings:", error);
        return [];
    }
};

export const checkAvailability = async (astrologerId: string, date: Date) => {
    // 1. Get Astrologer Schedule
    const astrologer = await getAstrologerById(astrologerId);
    if (!astrologer) return [];

    const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon...

    // Default availability: Mon-Sat, 9am - 6pm
    const availability = astrologer.availability || {
        days: [1, 2, 3, 4, 5, 6],
        startTime: "09:00",
        endTime: "18:00"
    };

    if (!availability.days.includes(dayOfWeek)) {
        return []; // Not working today
    }

    // 2. Generate Slots
    const slots: string[] = [];
    const current = new Date(date);
    const [startHour, startMinute] = availability.startTime.split(':').map(Number);
    const [endHour, endMinute] = availability.endTime.split(':').map(Number);

    current.setHours(startHour, startMinute, 0, 0);
    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);

    while (current < endTime) {
        slots.push(current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
        current.setMinutes(current.getMinutes() + 30); // 30 min slots
    }

    // 3. Remove Booked Slots
    const bookingsQuery = query(
        collection(db, "bookings"),
        where("astrologerId", "==", astrologerId),
        // Simplification: In real app, query by date range (start of day to end of day)
    );
    // Client-side filtering for simplicity in this demo
    const bookingsSnap = await getDocs(bookingsQuery);
    const bookedTimes = bookingsSnap.docs
        .map(d => d.data())
        .filter(b => {
            const bDate = new Date(b.date?.seconds ? b.date.seconds * 1000 : b.date);
            return bDate.getDate() === date.getDate() &&
                bDate.getMonth() === date.getMonth() &&
                bDate.getFullYear() === date.getFullYear();
        })
        .map(b => b.time);

    return slots.filter(time => !bookedTimes.includes(time));
};
export const getAllAstrologers = async () => {
    try {
        const astroRef = collection(db, "astrologers");
        const q = query(astroRef, orderBy("createdAt", "desc")); // Fetch all, newest first
        const snapshot = await getDocs(q);

        const ensureArray = (data: any) => {
            if (Array.isArray(data)) return data;
            if (data && typeof data === 'object') return Object.values(data);
            return [];
        };

        return snapshot.docs.map(doc => {
            const raw = doc.data();
            return {
                id: doc.id,
                name: raw.displayName || "Unknown",
                email: raw.email,
                expertise: ensureArray(raw.specializations)[0] || "Astrology",
                languages: ensureArray(raw.languages).length > 0 ? ensureArray(raw.languages) : ["English"],
                rating: raw.rating || 5.0,
                reviews: raw.consultations || 0,
                price: raw.consultationRate || 50,
                image: raw.photoURL || "/placeholder-avatar.png",
                verified: raw.verified || false,
                online: raw.online || false,
                bio: raw.bio || "",
                experience: raw.experience || 0
            } as Astrologer;
        });
    } catch (error) {
        console.error("Error fetching all astrologers:", error);
        return [];
    }
};

export const toggleVerification = async (astrologerId: string, status: boolean) => {
    try {
        const ref = doc(db, "astrologers", astrologerId);
        await updateDoc(ref, { verified: status });
        return true;
    } catch (error) {
        console.error("Error toggling verification:", error);
        throw error;
    }
};
