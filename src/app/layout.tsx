import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { SegmentProvider } from "@/components/segment/segment-provider";
import { ScrollRestoration } from "@/components/layout/scroll-restoration";
import { TourProvider } from "@/components/tour/tour-provider";
import { TourFab } from "@/components/tour/tour-fab";
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
  icons: {
    icon: "/favicon.ico",
    apple: "/images/apple-touch-icon.png",
  },
  openGraph: {
    title: "Domino's Pizza Australia",
    description:
      "Order your favourite Domino's pizza online. Pizzas, sides, drinks and desserts for delivery or pickup.",
    type: "website",
    siteName: "Domino's AU",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Domino's Pizza Australia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Domino's Pizza Australia",
    description: "Order your favourite Domino's pizza online.",
    images: ["/images/og-image.png"],
  },
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
        <ScrollRestoration />
        <TooltipProvider>
          <AnalyticsProvider>
            <SegmentProvider>
              {children}
              <TourProvider />
              <TourFab />
            </SegmentProvider>
          </AnalyticsProvider>
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
