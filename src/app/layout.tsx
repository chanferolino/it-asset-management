import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IT Asset Management",
  description: "Internal system for tracking and managing IT assets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(geistSans.variable, geistMono.variable, "h-full antialiased")}
    >
      <body className="relative min-h-full flex flex-col bg-[#f5f5f5]">
        {/* Decorative blurred red shapes for depth */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-red-500/[0.08] blur-[100px]" />
          <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-red-500/[0.08] blur-[100px]" />
          <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-red-500/[0.08] blur-[100px]" />
        </div>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
