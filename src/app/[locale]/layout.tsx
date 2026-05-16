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
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "700"],
  display: "swap",
});

const notoBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali"],
  weight: ["400", "700"],
  display: "swap",
});

const notoTamil = Noto_Sans_Tamil({
  variable: "--font-noto-tamil",
  subsets: ["tamil"],
  weight: ["400", "700"],
  display: "swap",
});

const notoTelugu = Noto_Sans_Telugu({
  variable: "--font-noto-telugu",
  subsets: ["telugu"],
  weight: ["400", "700"],
  display: "swap",
});

const notoKannada = Noto_Sans_Kannada({
  variable: "--font-noto-kannada",
  subsets: ["kannada"],
  weight: ["400", "700"],
  display: "swap",
});

const notoGujarati = Noto_Sans_Gujarati({
  variable: "--font-noto-gujarati",
  subsets: ["gujarati"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JyotishConnect - Premium Astrology Consultation",
  description: "Connect with expert astrologers for personalized readings, Kundli matching, and more.",
};

import { ClientWrapper } from "@/components/providers/ClientWrapper";
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

  // Map of fonts to variables
  const fontVars: Record<string, string> = {
    hi: notoDevanagari.variable,
    mr: notoDevanagari.variable,
    bn: notoBengali.variable,
    ta: notoTamil.variable,
    te: notoTelugu.variable,
    kn: notoKannada.variable,
    gu: notoGujarati.variable,
  };

  // Only include fonts needed for the current locale + base fonts
  const activeFontVar = fontVars[locale] || "";
  const bodyClasses = [
    geistSans.variable,
    geistMono.variable,
    notoSans.variable,
    activeFontVar,
    "antialiased font-sans"
  ].filter(Boolean).join(" ");

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0ea5e9" />
      </head>
      <body className={bodyClasses}>
        <ClientWrapper messages={messages} locale={locale}>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
