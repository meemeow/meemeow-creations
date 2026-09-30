import type { Metadata } from "next";
import AboutSection, { type Section } from "@/components/about/AboutSection";
import Approach from "@/components/about/Approach";
import Background, { GraduationCarousel } from "@/components/about/Background";
import BeyondCoding from "@/components/about/BeyondCoding";
import Ending from "@/components/about/Ending";
import FeaturedProject from "@/components/about/FeaturedProject";
import Introduction, { IntroPortrait } from "@/components/about/Introduction";
import Journey from "@/components/about/Journey";
import Skills from "@/components/about/Skills";
import WorkExperience from "@/components/about/WorkExperience";
import { OPEN_SLOT_CSS } from "@/components/about/about-classes";
import AboutShowcase from "@/components/about/AboutShowcase";

export const metadata: Metadata = {
  title: "About",
};

const SECTIONS: Section[] = [
  { title: "Introduction", asideFrom: "xl", eyebrow: true, aside: <IntroPortrait />, content: <Introduction /> },
  { title: "Background", asideFrom: "2xl", eyebrow: true, aside: <GraduationCarousel />, content: <Background /> },
  { title: "Work Experience", eyebrow: true, content: <WorkExperience /> },
  { title: "Skills & Technologies", eyebrow: true, content: <Skills /> },
  { title: "My Approach", eyebrow: true, eyebrowFull: true, content: <Approach /> },
  { title: "Featured Project", eyebrow: true, eyebrowFull: true, content: <FeaturedProject /> },
  { title: "My Journey", eyebrow: true, content: <Journey /> },
  { title: "Beyond Coding", eyebrow: true, eyebrowFull: true, content: <BeyondCoding /> },
  { title: null, video: "/assets/others/about_bg.mp4", content: <Ending /> },
];

export default function About() {
  return (
    <AboutShowcase>
      <style>{OPEN_SLOT_CSS}</style>
      {SECTIONS.map((section, i) => (
        <AboutSection key={i} section={section} index={i} />
      ))}
    </AboutShowcase>
  );
}

