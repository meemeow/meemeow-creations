import Image from "next/image";
import GlowHeading from "@/components/ui/GlowHeading";
import { REVEAL } from "@/lib/reveal";
import { MC_PANEL, MC_PIXEL, WIDE_GRID } from "./contact-classes";
import ContactForm from "./ContactForm";

export default function EmailSection() {
  return (
    <section id="email-form" className="border-t border-white/[0.08] bg-[#171615]">
      <div className="max-w-9xl mx-10 px-6 py-18 max-2xl:py-16 max-lg:py-12 upto-768:mx-2 upto-639:px-4 upto-639:py-10 upto-420:px-3 upto-420:py-8">
        <div
          data-reveal
          className={`${REVEAL} grid grid-cols-1 lg:grid-cols-2 gap-8 items-center upto-639:gap-6 ${WIDE_GRID}`}
        >
          <div className="flex justify-end order-2 lg:order-2">
            <div
              className={`mx-auto w-full min-[1920px]:mr-0 max-w-[680px] p-8 max-2xl:p-7 max-lg:max-w-[640px] max-lg:p-6 upto-639:p-5 upto-420:p-4 upto-376:p-3.5 ${MC_PANEL}`}
            >
              <h2
                className={`${MC_PIXEL} mb-6 text-[1.45rem] leading-[1.35] text-white max-2xl:text-[1.3rem] max-lg:mb-5 max-lg:text-[1.15rem] upto-639:mb-4 upto-639:text-[1rem] upto-420:text-[0.875rem] upto-376:text-[0.8rem]`}
              >
                SEND A MESSAGE!
              </h2>
              <ContactForm />
            </div>
          </div>

          <aside className="flex flex-col items-center text-center order-1 lg:order-1 lg:self-center lg:px-6">
            <GlowHeading text="Email me directly" className="mb-5 max-lg:mb-4 upto-639:mb-3" />
            <p className="font-gotham text-[1.25rem] font-medium text-gray-300 max-2xl:text-[1.125rem] max-lg:text-[1.0625rem] upto-639:text-[1rem] upto-420:text-[0.9375rem] upto-376:text-[0.875rem]">
              You can reach me more quickly via email by filling out the form.
            </p>
            <p className="mt-4 flex flex-wrap items-center justify-center gap-2 font-gotham text-[1rem] font-medium text-gray-400 upto-639:mt-3 upto-639:text-[0.9rem] upto-420:gap-1.5 upto-420:text-[0.82rem] upto-376:text-[0.78rem]">
              <Image
                src="/assets/images/gmail.webp"
                alt=""
                aria-hidden="true"
                width={16}
                height={16}
                className="h-4 w-4 shrink-0 object-contain"
              />
              Sent to: <span className="text-gray-200">emerson.clamor.dev@gmail.com</span>
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
