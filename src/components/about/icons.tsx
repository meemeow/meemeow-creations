export const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
    <path
      d="M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12zm0-9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const EnvelopeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 12 9" aria-hidden="true" shapeRendering="crispEdges" className={className}>
    <path d="M0 0h12v9H0z" fill="#3b3b3b" />
    <path d="M1 1h10v7H1z" fill="#e8e4d8" />
    <path d="M1 1h1v1h1v1h1v1h1v1h2V4h1V3h1V2h1V1h1v2h-1v1H9v1H8v1H4V5H3V4H2V3H1z" fill="#a8a293" />
  </svg>
);
