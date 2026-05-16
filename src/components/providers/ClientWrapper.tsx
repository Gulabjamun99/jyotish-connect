"use client";

import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { NextIntlClientProvider } from "next-intl";
import dynamic from "next/dynamic";

const HelpChatWidget = dynamic(
  () => import("@/components/support/HelpChatWidget").then((mod) => mod.HelpChatWidget),
  { ssr: false }
);


interface ClientWrapperProps {
  children: React.ReactNode;
  messages: any;
  locale: string;
}

export function ClientWrapper({ children, messages, locale }: ClientWrapperProps) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        forcedTheme="dark"
        disableTransitionOnChange
      >
        <AuthProvider>
          {children}
          <Toaster position="bottom-right" />
          <HelpChatWidget />
        </AuthProvider>

      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
