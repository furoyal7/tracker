import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Ethiopic } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from '@react-oauth/google';
import SocketInitializer from "@/components/socket/SocketInitializer";
import { I18nProvider } from "@/components/providers/I18nProvider";

import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoEthiopic = Noto_Sans_Ethiopic({
  variable: "--font-noto-ethiopic",
  subsets: ["ethiopic", "latin"],
});

export const metadata: Metadata = {
  title: "MoneyManager | Merchant Portal",
  description: "Smart Business Money Manager for Merchants",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoEthiopic.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="UTF-8" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full font-sans transition-colors duration-300 bg-background text-foreground" style={{ fontFamily: "'Noto Sans Ethiopic', sans-serif" }}>
        <GoogleOAuthProvider clientId={googleClientId}>
          <I18nProvider>
            <SocketInitializer />
            <ServiceWorkerRegister />
            {children}
            <Toaster 
              position="top-center" 
              expand={false} 
              richColors 
              closeButton
              toastOptions={{
                className: 'rounded-3xl border-none shadow-2xl font-sans',
              }}
            />
          </I18nProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
