import type { Metadata } from "next";
import ProjectsView from "@/components/projects/ProjectsView";

export const metadata: Metadata = {
  title: "Projects",
};

export default function Projects() {
  return (
    <main className="min-h-screen bg-[#191b1dff] text-white">
      <div className="mx-auto w-full max-w-[1920px]">
        <div className="mx-8 px-6 py-12 max-2xl:py-10 max-lg:py-8 upto-420:py-6 [transition:margin-inline_220ms_ease,padding_220ms_ease] upto-639:mx-4 min-[768px]:mx-12 min-[1024px]:mx-20 min-[1280px]:mx-24 min-[1440px]:mx-28 min-[1600px]:mx-32 upto-467:px-[12px]">
          <ProjectsView />
        </div>
      </div>
    </main>
  );
}
