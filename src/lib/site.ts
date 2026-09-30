const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000");

export const SITE_NAME = "Meemeow Creations";

export const SITE_DESCRIPTION =
  "Portfolio of Emerson Clamor, a frontend developer building with React, Next.js, and TypeScript.";

export const ROUTES = ["/", "/about", "/projects", "/contact"] as const;
