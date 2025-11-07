import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "@/providers/query-provider";
import { MSWProvider } from "./msw-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Note: PT Sans and Hoefler Text will be loaded via Google Fonts or system fonts

export const metadata: Metadata = {
  title: "Prisere Insurance Renewal Comparison Tool",
  description: "Compare your insurance policy renewals with AI-powered analysis. Understand what changed in plain English.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <MSWProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
          </MSWProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
