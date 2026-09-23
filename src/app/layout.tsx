import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollMomentum from "@/components/layout/ScrollMomentum";
import ScrollToTop from "@/components/ui/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Blocky pixel face for the Minecraft-style contact panel.
const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meemeow Creations",
  description: "Made by Memo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${pressStart.variable} min-h-full`}>
      <body className="flex min-h-screen flex-col bg-background text-foreground antialiased [font-family:Arial,Helvetica,sans-serif]">
        <Navbar />
        <ScrollMomentum>
          <div className="flex flex-[1_0_auto] flex-col [&>main]:flex-[1_0_auto]">{children}</div>
        </ScrollMomentum>
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  );
}
