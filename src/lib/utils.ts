import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(amount);
}

export function getPlatformFee(amount: number) {
    return amount * 0.2;
}

export function getAstrologerShare(amount: number) {
    return amount * 0.8;
}
