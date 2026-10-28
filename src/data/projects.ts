export type Project = {
  id: number;
  title: string;
  desc: string;
  url?: string;
  stack: string[];
  // Development time, e.g. "Dec 2024 – Sep 2026" or "Oct 2026 – Present".
  period: string;
  // Still being built: no link yet, so the card shows a placeholder and a disabled button.
  inProgress?: boolean;
};

// A split preview shows the dark and light themes side by side, cut diagonally.
export type PreviewImage = string | { dark: string; light: string };

export const projects: Project[] = [
  {
    id: 6,
    title: "Booking System",
    desc: "A Reservation Platform with Real-Time Slot Availability, Scheduling, and Automated Reminders, Built with ASP.NET Core",
    stack: ["ASP.NET Core", "C#", "Angular", "PostgreSQL", "SignalR"],
    period: "Oct 2026 – Present",
    inProgress: true,
  },
  {
    id: 5,
    title: "E-Commerce App",
    desc: "A Full-Stack Online Store with Product Catalog, Cart, Checkout, and Admin Dashboard, Built with Angular and Spring Boot",
    stack: ["Angular", "TypeScript", "Spring Boot", "Java", "PostgreSQL", "Stripe"],
    period: "Oct 2026 – Present",
    inProgress: true,
  },
  {
    id: 7,
    title: "Marci Metzger Homes",
    desc: "A Technical Assessment Redesigning a Pahrump Realtor's Website, Rebuilt with Property Search, Services, and a Photo Gallery",
    url: "https://clamor-marcimetzger.vercel.app/",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    period: "Oct 2026",
  },
  {
    id: 4,
    title: "Sakura",
    desc: "A Non-Commercial Demo Casino with Play-Money Wallets, Simulated Deposits, and Recreated Slot Games",
    url: "https://meemeow.github.io/sakura-ecasino/",
    stack: ["Vue 3", "TypeScript", "Vite", "PrimeVue", "Pinia", "Firebase"],
    period: "Sep 2026 – Oct 2026",
  },
  {
    id: 1,
    title: "ePasigLib",
    desc: "A Web and Mobile Application OPAC and Library Management System for Pasig Knowledge Center, Using NFC and Barcodes for Borrowing and Returns",
    url: "https://meemeow.github.io/ePasigLib_portfolio/",
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "Firebase", "Firestore"],
    period: "Dec 2024 – Sep 2026",
  },
  {
    id: 2,
    title: "Cattachasm",
    desc: "A Terraria-Inspired Platforming Game Featuring Popular Cat Memes, Originally Built as a Personalized Digital Gift",
    url: "https://meemeow.github.io/cattachasm/",
    stack: ["React", "TypeScript", "Vite"],
    period: "Dec 2025 – Jan 2026",
  },
  {
    id: 3,
    title: "Meemeow's GitCafe",
    desc: "A Coffee Ordering Platform Built as an Academic Final Project, Focused on Designing an Intuitive Ordering Experience",
    url: "https://meemeow.github.io/AWD-FINALS/",
    stack: ["HTML", "CSS", "JavaScript"],
    period: "Mar 2024",
  },
];

// Logo file (in /assets/images/tech) for each stack entry; entries without one show a dot instead.
export const STACK_LOGOS: Record<string, string> = {
  "ASP.NET Core": "dotnet-color",
  "C#": "csharp-color",
  SignalR: "dotnet-color",
  Angular: "angular-color",
  TypeScript: "typescript-white",
  JavaScript: "javascript-white",
  "Spring Boot": "springboot-color",
  Java: "java-color",
  PostgreSQL: "postgresql-color",
  Stripe: "stripe-color",
  "Vue 3": "vue-color",
  Vite: "vite-color",
  PrimeVue: "primevue-color",
  Pinia: "pinia-color",
  Firebase: "firebase-brand",
  Firestore: "firebase-brand",
  React: "react",
  "Tailwind CSS": "tailwindcss",
  HTML: "html5-color",
  CSS: "css3-color",
};

const sakura = (screen: string) => ({
  dark: `/assets/images/sakura_${screen}_dark.png`,
  light: `/assets/images/sakura_${screen}_light.png`,
});

export const previewMap: Record<number, PreviewImage> = {
  1: "/assets/images/PKC_preview1.png",
  2: "/assets/images/cattachasm_preview1.png",
  3: "/assets/images/MGC_preview1.png",
  4: sakura("login"),
  7: "/assets/images/marcimetzger_preview1.png",
};

export const altImagesMap: Record<number, PreviewImage[]> = {
  1: [
    "/assets/images/PKC_preview2.png",
    "/assets/images/PKC_preview3.png",
    "/assets/images/PKC_preview4.png",
    "/assets/images/PKC_preview1.png",
  ],
  2: [
    "/assets/images/cattachasm_preview2.png",
    "/assets/images/cattachasm_preview3.png",
    "/assets/images/cattachasm_preview4.png",
    "/assets/images/cattachasm_preview1.png",
  ],
  3: [
    "/assets/images/MGC_preview2.png",
    "/assets/images/MGC_preview3.png",
    "/assets/images/MGC_preview4.png",
    "/assets/images/MGC_preview1.png",
  ],
  4: [sakura("account"), sakura("wallet"), sakura("vip"), sakura("login")],
  7: [
    "/assets/images/marcimetzger_preview2.png",
    "/assets/images/marcimetzger_preview3.png",
    "/assets/images/marcimetzger_preview4.png",
    "/assets/images/marcimetzger_preview1.png",
  ],
};
