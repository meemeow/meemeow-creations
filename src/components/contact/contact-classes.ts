export const MC_PANEL =
  "border-[3px] bg-[#2f2d2c] " +
  "border-t-[#3d3938] border-r-[#3d3938] border-b-[#000000] border-l-[#000000] " +
  "[box-shadow:0_12px_34px_rgba(0,0,0,0.55)]";

export const FIELD =
  "border-2 border-[#4f4f4f] bg-[var(--mc-field)] px-3 py-[0.45rem] font-gotham font-medium text-white " +
  "placeholder:font-gotham placeholder:font-medium placeholder:text-[#6f6f6f] " +
  "[box-shadow:inset_0_2px_0_rgba(0,0,0,0.45)] [transition:border-color_120ms_ease,background-color_120ms_ease] " +
  "hover:border-[#6e6e6e] focus:border-white focus:bg-[#232323] focus:[outline:none] " +
  "w-full text-[1rem] upto-639:px-2.5 upto-639:py-[0.4rem] upto-420:py-[0.35rem]";

export const LABEL =
  "mb-1.5 font-gotham text-[0.875rem] font-medium tracking-wide text-white " +
  "upto-639:mb-1 upto-639:text-[0.8125rem] upto-420:text-[0.78rem]";

export const MC_PIXEL = "font-pixel [text-shadow:2px_2px_0_rgba(0,0,0,0.75)]";

export const MC_BUTTON =
  "group inline-flex cursor-pointer items-center gap-3 border-2 border-[var(--mc-green-dark)] " +
  "bg-[linear-gradient(180deg,var(--mc-green-lit)_0%,var(--mc-green)_48%,#4a942f_100%)] px-6 py-[0.65rem] " +
  MC_PIXEL +
  " text-[0.72rem] uppercase text-white " +
  "[box-shadow:inset_0_2px_0_rgba(255,255,255,0.28),inset_0_-3px_0_rgba(0,0,0,0.28),0_0_0_2px_var(--mc-panel-dark)] " +
  "[transition:filter_120ms_ease,transform_80ms_ease] hover:brightness-110 active:[transform:translateY(2px)] " +
  "disabled:cursor-not-allowed disabled:[filter:grayscale(0.55)_brightness(0.8)] " +
  "max-lg:text-[0.68rem] upto-639:w-full upto-639:justify-center upto-639:px-4 upto-639:py-[0.6rem] upto-639:text-[0.62rem] " +
  "upto-420:py-[0.55rem] upto-420:text-[0.58rem]";

export const ERROR_TEXT = "mt-1 font-gotham text-[0.875rem] text-[var(--mc-red)] upto-639:text-[0.78rem]";

export const STONE_FACE =
  "relative flex h-12 w-full shrink-0 items-center justify-center gap-4 bg-[#8b8b8b] px-4 text-white [image-rendering:pixelated] " +
  "[box-shadow:inset_3px_3px_0_0_#c6c6c6,inset_-3px_-3px_0_0_#4f4f4f,0_0_0_3px_#000000,0_5px_0_3px_rgba(0,0,0,0.35)] " +
  "[transition:background-color_100ms_steps(2),box-shadow_100ms_steps(2),transform_100ms_steps(2)] " +
  "group-hover:bg-[#a4a4a4] " +
  "group-hover:[box-shadow:inset_3px_3px_0_0_#dcdcdc,inset_-3px_-3px_0_0_#5f5f5f,0_0_0_3px_#000000,0_0_0_5px_rgba(255,255,255,0.35),0_5px_0_3px_rgba(0,0,0,0.35)] " +
  "group-active:[transform:translateY(4px)] " +
  "group-active:[box-shadow:inset_3px_3px_0_0_#4f4f4f,inset_-3px_-3px_0_0_#c6c6c6,0_0_0_3px_#000000,0_1px_0_3px_rgba(0,0,0,0.35)] " +
  "group-focus-visible:[box-shadow:inset_3px_3px_0_0_#dcdcdc,inset_-3px_-3px_0_0_#5f5f5f,0_0_0_3px_#000000,0_0_0_6px_rgba(255,255,160,0.7),0_5px_0_3px_rgba(0,0,0,0.35)] " +
  "max-lg:h-11 upto-639:gap-3 upto-639:px-5";

export const MC_SLOT =
  "flex items-center gap-4 overflow-hidden border-[3px] bg-[#2f2d2c] px-5 py-4 font-gotham font-medium text-gray-200 " +
  "border-t-[#3d3938] border-r-[#3d3938] border-b-[#000000] border-l-[#000000] " +
  "[box-shadow:0_6px_18px_rgba(0,0,0,0.45)] [transition:background-color_140ms_ease,color_140ms_ease,transform_100ms_ease] " +
  "hover:bg-[#3a3735] hover:text-white active:[transform:translateY(2px)] " +
  "text-[1.05rem] whitespace-nowrap upto-639:gap-3 upto-639:px-4 upto-639:py-3 upto-639:text-[0.9rem] " +
  "upto-420:text-[0.85rem] upto-376:px-3 upto-376:text-[clamp(0.625rem,calc(5.2vw-0.33rem),0.8rem)]";

export const SLOT_TEXT = "min-w-0 truncate";

export const WIDE_GRID = "min-[1920px]:mx-auto min-[1920px]:max-w-[max(1792px,calc(50vw+608px))]";

export const HERO_TITLE =
  "mb-3 text-[4rem] leading-[1.05] font-extrabold whitespace-nowrap min-[1920px]:text-[5rem] min-[1920px]:leading-[1.02] max-2xl:text-[3.75rem] max-lg:text-[3.25rem] " +
  "upto-768:mx-auto upto-768:text-center upto-768:text-[2.75rem] upto-639:mb-2 upto-639:text-[clamp(1.2rem,calc(9.6vw-0.5rem),2.5rem)]";

export const HERO_LINE =
  "text-[1.25rem] text-gray-200 max-2xl:text-[1.125rem] max-lg:text-[1.0625rem] upto-768:mx-auto upto-768:text-center " +
  "upto-639:text-[1rem] upto-639:text-balance upto-420:text-[0.9375rem] upto-376:text-[0.875rem]";
