"use client";

import { Toaster } from "react-hot-toast";
import { HelpChatWidget } from "@/components/support/HelpChatWidget";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { NextIntlClientProvider } from "next-intl";

interface ClientWrapperProps {
  children: React.ReactNode;
  messages: any;
}

export function ClientWrapper({ children, messages }: ClientWrapperProps) {
  return (
    <NextIntlClientProvider messages={messages}>
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
