export type Project = {
  id: number;
  title: string;
  desc: string;
  url?: string;
};

export const projects: Project[] = [
  {
    id: 1,
    title: "ePasigLib",
    desc: "A Web and Mobile Application OPAC and Library Management System for Pasig Knowledge Center, Using NFC and Barcodes for Borrowing and Returns",
    url: "https://meemeow.github.io/ePasigLib_portfolio/",
  },
  { id: 2, title: "Cattachasm", desc: "A Platforming Game inspired by Mario and Terraria (as well as cat memes)", url: "https://meemeow.github.io/cattachasm/" },
  { id: 3, title: "Meemeow's GitCafe", desc: "A Simple Coffee Ordering Platform", url: "https://meemeow.github.io/AWD-FINALS/" },
];

// Per-project preview and alternate images
export const previewMap: Record<number, string> = {
  1: "PKC_preview1.png",
  2: "cattachasm_preview1.png",
  3: "cafe_preview.png",
};

export const altImagesMap: Record<number, string[]> = {
  1: ["/assets/images/PKC_preview2.png", "/assets/images/PKC_preview3.png", "/assets/images/PKC_preview4.png", "/assets/images/PKC_preview1.png"],
  2: ["/assets/images/cattachasm_preview2.png", "/assets/images/cattachasm_preview3.png", "/assets/images/cattachasm_preview4.png", "/assets/images/cattachasm_preview1.png"],
  3: ["/assets/images/cafe1.png", "/assets/images/cafe2.png", "/assets/images/cafe3.png", "/assets/images/cafe_preview.png"],
};
