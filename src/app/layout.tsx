import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { SegmentProvider } from "@/components/segment/segment-provider";
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
  title: "Domino's Pizza Australia | Order Pizza Online for Delivery",
  description:
    "Order your favourite Domino's pizza online. Choose from our menu of pizzas, sides, drinks and desserts. Delivery or pickup available.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider>
          <AnalyticsProvider>
            <SegmentProvider>{children}</SegmentProvider>
          </AnalyticsProvider>
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
