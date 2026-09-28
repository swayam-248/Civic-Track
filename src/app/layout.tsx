import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CivicTrack - AI-Powered Civic Issue Reporting",
  description:
    "Report civic issues easily. AI identifies the problem and routes it to the right department. Track progress until resolved.",
  keywords: [
    "CivicTrack",
    "civic issues",
    "pothole reporting",
    "AI civic tech",
    "complaint tracking",
  ],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <SessionProviderWrapper>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
