// Side-effect CSS imports (`import "./globals.css"`) have no types of their own,
// so TypeScript 6+ reports ts(2882) on them. Declaring the module shape here
// covers both relative and aliased stylesheet imports.
declare module "*.css";
