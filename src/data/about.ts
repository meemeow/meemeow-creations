export type TechItem = { logo?: string; name: string; detail: string };

export const CERT_GROUPS: {
  label: string;
  items: { id: string; img: string; tile?: boolean; name: string; issuer: string; date: string }[];
}[] = [
  {
    label: "Programming",
    items: [
      {
        id: "56e40311-f63a-456c-8a18-1f0178296c17",
        img: "it-specialist-python",
        name: "IT Specialist: Python",
        issuer: "Certiport",
        date: "Mar 2024",
      },
      {
        id: "946cf358-2c54-4635-abd9-c5281df2ac47",
        img: "it-specialist-html-and-css",
        name: "IT Specialist: HTML and CSS",
        issuer: "Certiport",
        date: "Nov 2024",
      },
      {
        id: "968ee7ae-4637-4b5a-8b44-429b497fbb34",
        img: "it-specialist-javascript",
        name: "IT Specialist: JavaScript",
        issuer: "Certiport",
        date: "Nov 2025",
      },
    ],
  },
  {
    label: "Networking",
    items: [
      {
        id: "0d1e16fa-b1fc-43ef-97bf-085273d6f5b7",
        img: "ccna-introduction-to-networks",
        name: "CCNA: Introduction to Networks",
        issuer: "Cisco",
        date: "Mar 2024",
      },
      {
        id: "0331903d-35e0-490f-b097-e0e214cbb270",
        img: "ccna-switching-routing-wireless",
        name: "CCNA: Switching, Routing, and Wireless Essentials",
        issuer: "Cisco",
        date: "Jul 2024",
      },
      {
        id: "b99f16a9-04a3-464a-bd0b-e6f3402d465c",
        img: "ccna-enterprise-networking",
        name: "CCNA: Enterprise Networking, Security, and Automation",
        issuer: "Cisco",
        date: "Jan 2025",
      },
      {
        id: "01d6ee35-d548-4caf-a654-da2e47ee7365",
        img: "it-specialist-networking",
        name: "IT Specialist: Networking",
        issuer: "Certiport",
        date: "Jul 2024",
      },
      {
        id: "753b7f65-da75-4ba0-abf2-1ce6ec86f531",
        img: "devnet-associate",
        name: "DevNet Associate",
        issuer: "Cisco",
        date: "Mar 2025",
      },
    ],
  },
  {
    label: "Cybersecurity",
    items: [
      {
        id: "4812b8be-2e8d-41e7-aaab-20add5794987",
        img: "ccst-cybersecurity",
        tile: true,
        name: "Cisco Certified Support Technician: Cybersecurity",
        issuer: "Cisco",
        date: "Nov 2025",
      },
    ],
  },
  {
    label: "Project Management",
    items: [
      {
        id: "9e363fc8-280f-45c9-a244-59b2fdf442b4",
        img: "pmi-project-management-ready",
        name: "Project Management Ready",
        issuer: "PMI",
        date: "Mar 2025",
      },
    ],
  },
];

export const SIMPLEVIA_STACK: TechItem[] = [
  { logo: "react", name: "React", detail: "Components & navigation" },
  { logo: "typescript-white", name: "TypeScript", detail: "Type-safe frontend" },
  { logo: "tailwindcss", name: "Tailwind CSS", detail: "Responsive layouts" },
  { logo: "mantine-white", name: "Mantine", detail: "UI component library" },
];

export const OPEN_ROLE_STACK: TechItem[] = [
  { name: "Your framework", detail: "Learned fast" },
  { name: "Your language", detail: "Picked up fast" },
  { name: "Your tooling", detail: "Set up day one" },
  { name: "Your stack", detail: "Ready when you are" },
];

export const EPASIGLIB_STACK: TechItem[] = [
  { logo: "react", name: "React", detail: "Web interfaces" },
  { logo: "typescript-white", name: "TypeScript", detail: "Typed codebase" },
  { logo: "vite-color", name: "Vite", detail: "Build tool" },
  { logo: "tailwindcss", name: "Tailwind CSS", detail: "Responsive layouts" },
  { logo: "firebase-brand", name: "Firebase", detail: "Auth & Cloud Functions" },
  { logo: "firebase-brand", name: "Firestore", detail: "Real-time data" },
];

export const SKILL_GROUPS: {
  label: string;
  items: { logo: string; name: string; detail: string; large?: boolean; wide?: boolean }[];
}[] = [
  {
    label: "Frontend",
    items: [
      { logo: "html5-color", name: "HTML5", detail: "Markup" },
      { logo: "css3-color", name: "CSS3", detail: "Styling" },
      { logo: "javascript-white", name: "JavaScript", detail: "Language" },
      { logo: "typescript-white", name: "TypeScript", detail: "Typed JavaScript" },
      { logo: "react", name: "React", detail: "UI library" },
      { logo: "nextdotjs", name: "Next.js", detail: "React framework" },
      { logo: "tailwindcss", name: "Tailwind CSS", detail: "Utility-first CSS" },
      { logo: "mantine-white", name: "Mantine", detail: "Component library" },
    ],
  },
  {
    label: "Backend & Database",
    items: [
      { logo: "firebase-brand", name: "Firebase", detail: "Backend platform" },
      { logo: "firebase-brand", name: "Firestore", detail: "NoSQL database" },
      { logo: "php-color", name: "PHP", detail: "Server-side language", wide: true },
      { logo: "mysql-logo", name: "MySQL", detail: "Relational database", wide: true },
    ],
  },
  {
    label: "Tools & AI",
    items: [
      { logo: "git-full", name: "Git", detail: "Version control" },
      { logo: "vite-color", name: "Vite", detail: "Build tool" },
      { logo: "nodedotjs-color", name: "Node.js", detail: "JavaScript runtime" },
      { logo: "claude-color", name: "Claude", detail: "AI-assisted development" },
      { logo: "chatgpt-white", name: "ChatGPT", detail: "Research & general inquiries" },
      { logo: "gemini-logo", name: "Gemini", detail: "Image editing & asset generation" },
    ],
  },
  {
    label: "Other Languages",
    items: [
      { logo: "python-color", name: "Python", detail: "General purpose", large: true },
      { logo: "java-color", name: "Java", detail: "Object-oriented", large: true },
      { logo: "cplusplus-color", name: "C++", detail: "Systems programming" },
    ],
  },
  {
    label: "Design",
    items: [
      { logo: "figma-color", name: "Figma", detail: "Design & prototyping" },
      { logo: "wireframe", name: "Wireframing", detail: "Layout planning" },
      { logo: "uiux", name: "UI/UX Design", detail: "User-centred design" },
    ],
  },
  {
    label: "Mobile",
    items: [
      { logo: "react", name: "React Native", detail: "Cross-platform apps" },
      { logo: "swift-white", name: "Swift", detail: "iOS apps" },
    ],
  },
];

export const APPROACH_GROUPS: { title: string; points: [lead: string, text: string][] }[] = [
  {
    title: "Problem Solving",
    points: [
      ["Problem first.", "Understand what users need before writing any code."],
      ["Clear scope.", "Pin down requirements and edge cases, then ship in small pieces."],
      ["Root causes.", "Fix why a bug happens, not just where it shows up."],
    ],
  },
  {
    title: "Design",
    points: [
      ["Faithful to the design.", "Turn UI/UX designs into production-ready components."],
      ["Responsive by default.", "Consistent layouts across screen sizes and browsers."],
      ["Accessible.", "Semantic HTML, keyboard support, and readable contrast."],
    ],
  },
  {
    title: "Development",
    points: [
      ["Reusable components.", "Build shared pieces instead of one-off screens."],
      ["Typed and predictable.", "TypeScript, with clear state and data flow."],
      ["Maintainable.", "Refactor to cut duplication before it slows new features down."],
    ],
  },
  {
    title: "Testing",
    points: [
      ["Every device.", "Check features across screens and browsers before they ship."],
      ["Every state.", "Loading, empty, and error states, not just the happy path."],
      ["Clean history.", "Review my own changes and keep Git easy to follow."],
    ],
  },
  {
    title: "Performance",
    points: [
      ["Fast loads.", "Optimized images, lazy loading, and lean bundles."],
      ["Smooth UI.", "Avoid unnecessary re-renders and heavy main-thread work."],
      ["Nothing wasted.", "Pause animations and media that are off screen."],
    ],
  },
  {
    title: "Collaboration",
    points: [
      ["Clean integration.", "APIs and backend services with clear loading and error handling."],
      ["Talk early.", "Stay in sync with designers and backend developers, remote or on-site."],
      ["Leave it better.", "Code and notes that make the next feature easier to build."],
    ],
  },
];

export const JOURNEY: { date: string; title: string; text: string; now?: boolean }[] = [
  {
    date: "Aug 2022",
    title: "Started at FEU Institute of Technology",
    text: "Began a BS in Information Technology, specializing in Web and Mobile Applications.",
  },
  {
    date: "2022 – 2023",
    title: "Foundations",
    text: "Completed my general education subjects and introductory courses in programming and web development.",
  },
  {
    date: "Mar 2024",
    title: "First certifications",
    text: "Earned IT Specialist: Python and CCNA: Introduction to Networks.",
  },
  {
    date: "Jul – Nov 2024",
    title: "Networking and web foundations",
    text: "Added CCNA: Switching, Routing, and Wireless Essentials, IT Specialist: Networking, and IT Specialist: HTML and CSS.",
  },
  {
    date: "Dec 2024",
    title: "Started ePasigLib",
    text: "Began building a library management system for Pasig Knowledge Center as my capstone project.",
  },
  {
    date: "Jan – Mar 2025",
    title: "Broadening my skills",
    text: "Completed CCNA: Enterprise Networking, Security, and Automation, DevNet Associate, and PMI Project Management Ready.",
  },
  {
    date: "Nov 2025",
    title: "JavaScript and cybersecurity",
    text: "Earned IT Specialist: JavaScript and Cisco Certified Support Technician: Cybersecurity.",
  },
  {
    date: "Jan – Jun 2026",
    title: "Frontend Developer Intern at Simplevia Technologies Inc.",
    text: "Built the frontend of a B2B school management system over 1,040 hours, fully remote.",
  },
  {
    date: "Sep 2026",
    title: "Graduated",
    text: "Completed my degree at FEU Tech's 67th Commencement Exercises, with ePasigLib delivered.",
  },
  {
    date: "Present",
    title: "The next chapter",
    text: "Looking for an entry-level frontend developer role where I can keep learning and building.",
    now: true,
  },
];

export const HOBBY_ICONS: Record<string, string> = {
  Valorant: "games/valorant-red",
  Minecraft: "games/minecraft-icon",
  "R.E.P.O.": "games/repo-robot",
  "Genshin Impact": "games/genshin-impact-icon",
  "Honkai: Star Rail": "games/honkai-star-rail-icon",
  "Counter-Strike 2": "games/counterstrike-icon",
  "Stardew Valley": "games/stardew-valley-icon",
  Terraria: "games/terraria-icon",
  "Dota 2": "games/dota2-cutout",
  "Mobile Legends: Bang Bang": "games/mobile-legends-icon",
  Romance: "anime/romance-face-3",
  Comedy: "anime/comedy-face-2",
  Adventure: "anime/adventure-face-4",
  Action: "anime/action-face",
  Shounen: "anime/shounen-face-5",
  Sports: "anime/sports-face",
  Mystery: "anime/mystery-face",
  School: "anime/school-face",
  Drama: "anime/drama-face-4",
  Isekai: "anime/isekai-face",
  "Ice Cream": "food/samanco-3",
  Bingsu: "food/bingsu",
  Tempura: "food/tempura-8",
  Ramen: "food/ramen",
  Sushi: "food/sushi",
  "Fried Chicken": "food/fried-chicken",
  Fries: "food/fries",
  Coffee: "food/coffee",
  Curry: "food/curry",
};

export const HOBBY_GROUPS: { label: string; note: string; items: string[] }[] = [
  {
    label: "Online Games",
    note:
      "Gaming is how I unwind after a long day, whether through competitive matches with friends or " +
      "slower-paced titles like Minecraft.",
    items: [
      "Valorant",
      "Minecraft",
      "R.E.P.O.",
      "Genshin Impact",
      "Honkai: Star Rail",
      "Counter-Strike 2",
      "Stardew Valley",
      "Terraria",
      "Dota 2",
      "Mobile Legends: Bang Bang",
    ],
  },
  {
    label: "Anime",
    note:
      "Anime is my preferred way to relax, and I enjoy a wide range of genres, from romantic comedies to " +
      "large-scale adventures.",
    items: ["Romance", "Comedy", "Adventure", "Action", "Shounen", "School", "Mystery", "Sports", "Drama", "Isekai"],
  },
  {
    label: "Food",
    note:
      "I enjoy exploring different cuisines, with a particular fondness for Japanese food and a standing " +
      "weakness for desserts.",
    items: ["Ice Cream", "Bingsu", "Tempura", "Ramen", "Sushi", "Fried Chicken", "Fries", "Coffee", "Curry"],
  },
];
