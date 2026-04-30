import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from '@react-oauth/google';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MoneyManager | Merchant Portal",
  description: "Smart Business Money Manager for Merchants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const isValidClientId = googleClientId && !googleClientId.includes('placeholder');

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans transition-colors duration-300 bg-background text-foreground">
        <GoogleOAuthProvider clientId={googleClientId}>
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
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
