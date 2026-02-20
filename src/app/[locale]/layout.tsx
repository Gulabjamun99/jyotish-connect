import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Noto_Sans,
  Noto_Sans_Devanagari,
  Noto_Sans_Bengali,
  Noto_Sans_Tamil,
  Noto_Sans_Telugu,
  Noto_Sans_Kannada,
  Noto_Sans_Gujarati
} from "next/font/google";

import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
// import { EnvVarChecker } from "@/components/debug/EnvVarChecker"; // Import added
import { Toaster } from "react-hot-toast";
import { HelpChatWidget } from "@/components/support/HelpChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "700"], // Keep weights for Devanagari just in case
});

const notoBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali"],
});

const notoTamil = Noto_Sans_Tamil({
  variable: "--font-noto-tamil",
  subsets: ["tamil"],
});

const notoTelugu = Noto_Sans_Telugu({
  variable: "--font-noto-telugu",
  subsets: ["telugu"],
});

const notoKannada = Noto_Sans_Kannada({
  variable: "--font-noto-kannada",
  subsets: ["kannada"],
});

const notoGujarati = Noto_Sans_Gujarati({
  variable: "--font-noto-gujarati",
  subsets: ["gujarati"],
});

export const metadata: Metadata = {
  title: "JyotishConnect - Premium Astrology Consultation",
  description: "Connect with expert astrologers for personalized readings, Kundli matching, and more.",
};

import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export default async function SelectedLocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  // Validate that the incoming `locale` parameter is valid
  const locales = ["en", "hi", "ta", "te", "mr", "bn", "gu", "kn"];
  if (!locales.includes(locale)) notFound();

  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0ea5e9" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSans.variable} ${notoDevanagari.variable} ${notoBengali.variable} ${notoTamil.variable} ${notoTelugu.variable} ${notoKannada.variable} ${notoGujarati.variable} antialiased font-sans`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              {children}
              <Toaster position="bottom-right" />
              <HelpChatWidget />
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
