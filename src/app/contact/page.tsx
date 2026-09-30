import type { Metadata } from "next";
import ContactHero from "@/components/contact/ContactHero";
import EmailSection from "@/components/contact/EmailSection";
import ScrollRevealMain from "@/components/ui/ScrollRevealMain";

export const metadata: Metadata = {
  title: "Contact",
};

export default function Contact() {
  return (
    <ScrollRevealMain tabFlag="__contactAnimated" className="min-h-screen bg-[#171615] text-white">
      <ContactHero />
      <EmailSection />
    </ScrollRevealMain>
  );
}
