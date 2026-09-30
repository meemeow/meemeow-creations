import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollMomentum from "@/components/layout/ScrollMomentum";
import ScrollToTop from "@/components/ui/ScrollToTop";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: "Emerson Clamor" }],
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "./",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${pressStart.variable} min-h-full`}>
      <body
        className="flex min-h-screen flex-col bg-background text-foreground antialiased [font-family:Arial,Helvetica,sans-serif]"
        style={{ minHeight: "100dvh" }}
      >
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
