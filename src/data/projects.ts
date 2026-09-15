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
    desc: "A Web & Mobile OPAC and Library System with Record and Circulation Automation using NFC and Barcodes for Pasig City Library ",
    url: "https://epasiglibrary.com/opac/home",
  },
  { id: 2, title: "The Cat Platformer", desc: "A Platforming Game inspired by Mario and Terraria", url: "https://catplatformer.vercel.app/games" },
  { id: 3, title: "Meemeow's GitCafe", desc: "A Simple Coffee Ordering Platform", url: "https://meemeow.github.io/AWD-FINALS/" },
];

// Per-project preview and alternate images
export const previewMap: Record<number, string> = {
  1: "library_preview.png",
  2: "cat_preview.png",
  3: "cafe_preview.png",
};

export const altImagesMap: Record<number, string[]> = {
  1: ["/assets/images/library1.png", "/assets/images/library2.png", "/assets/images/library3.png", "/assets/images/library_preview.png"],
  2: ["/assets/images/cat1.png", "/assets/images/cat2.png", "/assets/images/cat3.png", "/assets/images/cat_preview.png"],
  3: ["/assets/images/cafe1.png", "/assets/images/cafe2.png", "/assets/images/cafe3.png", "/assets/images/cafe_preview.png"],
};
