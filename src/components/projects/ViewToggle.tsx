import type { ProjectView } from "./use-project-reveal";

const toggleClass = (active: boolean) =>
  `p-2 rounded-lg border-2 ${active ? "bg-white/10 border-white" : "border-white/20"}`;

type ViewToggleProps = {
  view: ProjectView;
  onChange: (view: ProjectView) => void;
};

export default function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        aria-pressed={view === "masonry"}
        onClick={() => onChange("masonry")}
        className={toggleClass(view === "masonry")}
        title="Masonry view"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          className="text-white h-8 w-8 max-2xl:h-7 max-2xl:w-7"
          aria-hidden="true"
        >
          <rect x="2" y="4" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="16" y="4" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="2" y="10" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="10" y="10" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="2" y="16" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="16" y="16" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      <button
        aria-pressed={view === "stacked"}
        onClick={() => onChange("stacked")}
        className={toggleClass(view === "stacked")}
        title="Stacked list view"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          className="text-white h-8 w-8 max-2xl:h-7 max-2xl:w-7"
        >
          <rect x="3" y="4" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="17" y="4" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="3" y="10" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="17" y="10" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="3" y="16" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="17" y="16" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
    </div>
  );
}
