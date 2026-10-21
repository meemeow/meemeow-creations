export type Project = {
  id: number;
  title: string;
  desc: string;
  url?: string;
};

// A split preview shows the dark and light themes side by side, cut diagonally.
export type PreviewImage = string | { dark: string; light: string };

export const projects: Project[] = [
  {
    id: 4,
    title: "Sakura",
    desc: "A Cherry Blossom-Themed Online Casino Platform with GCash and Maya Wallets, VIP Tiers, and Light and Dark Modes",
    url: "https://meemeow.github.io/sakura-ecasino/",
  },
  {
    id: 1,
    title: "ePasigLib",
    desc: "A Web and Mobile Application OPAC and Library Management System for Pasig Knowledge Center, Using NFC and Barcodes for Borrowing and Returns",
    url: "https://meemeow.github.io/ePasigLib_portfolio/",
  },
  {
    id: 2,
    title: "Cattachasm",
    desc: "A Platforming Game inspired by Mario and Terraria (as well as cat memes)",
    url: "https://meemeow.github.io/cattachasm/",
  },
  {
    id: 3,
    title: "Meemeow's GitCafe",
    desc: "A Simple Coffee Ordering Platform",
    url: "https://meemeow.github.io/AWD-FINALS/",
  },
];

const sakura = (screen: string) => ({
  dark: `/assets/images/sakura_${screen}_dark.png`,
  light: `/assets/images/sakura_${screen}_light.png`,
});

export const previewMap: Record<number, PreviewImage> = {
  1: "/assets/images/PKC_preview1.png",
  2: "/assets/images/cattachasm_preview1.png",
  3: "/assets/images/MGC_preview1.png",
  4: sakura("login"),
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
};
