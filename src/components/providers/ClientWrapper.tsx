"use client";

import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { NextIntlClientProvider } from "next-intl";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  // Render support widget only on root landing page or localized homepage
  const isHomePage = pathname === "/" || pathname === `/${locale}` || pathname === `/${locale}/`;

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
          {isHomePage && <HelpChatWidget />}
        </AuthProvider>

      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
