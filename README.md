# Meemeow Creations

My personal developer portfolio, built with **Next.js**, **React**, **TypeScript**, and **Tailwind CSS**, with a **Minecraft-inspired theme**.

## Overview

**Meemeow Creations** is my first fully personalized developer portfolio. It marks a significant step forward in my growth as a developer, focusing on structure, maintainability, and modern best practices.

The site takes its look from Minecraft: pixel type, beveled stone buttons and inventory-style slots, an End island landing scene with an animated intro and a playable ender pearl throw, and a clean, professional presentation of my work and background.

## Highlights

- Minecraft-inspired UI/UX, including an animated landing scene
- Fully responsive layout across desktop, tablet, and mobile
- Server components by default, with client components only where interaction needs them
- Feature-based component structure with reusable pieces
- Working contact form with shared client/server validation
- Linted, type-checked, formatted, and tested in CI

## Pages

| Route       | Content                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `/`         | Landing scene                                                                                   |
| `/about`    | Introduction, background, work experience, skills, approach, featured project, journey, hobbies |
| `/projects` | Project showcase with masonry and stacked views                                                 |
| `/contact`  | Contact links and email form                                                                    |

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript (strict)
- **Styling:** Tailwind CSS v4
- **3D:** Three.js
- **Forms and email:** Zod validation, Nodemailer over SMTP
- **Tooling:** ESLint, Prettier, Vitest, GitHub Actions

## Getting started

Requires Node.js 24.

```bash
npm install
cp .env.example .env.local   # then fill in your SMTP details
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Set these in `.env.local` (and in your hosting provider's settings):

| Variable               | Description                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the site, used for the sitemap, canonical links, and link previews. Optional on Vercel |
| `SMTP_HOST`            | SMTP server host                                                                                     |
| `SMTP_PORT`            | SMTP port (default `587`)                                                                            |
| `SMTP_SECURE`          | `true` for implicit TLS (port 465)                                                                   |
| `SMTP_USER`            | SMTP username                                                                                        |
| `SMTP_PASS`            | SMTP password or app password                                                                        |
| `FROM_EMAIL`           | Sender address                                                                                       |
| `TO_EMAIL`             | Where contact form messages are delivered                                                            |

## Scripts

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `npm run dev`       | Start the development server |
| `npm run build`     | Create a production build    |
| `npm start`         | Serve the production build   |
| `npm run lint`      | Lint with ESLint             |
| `npm run typecheck` | Type-check with TypeScript   |
| `npm run format`    | Format with Prettier         |
| `npm test`          | Run the Vitest test suite    |

## Project structure

```
src/
├── app/                  # Routes (App Router), root layout, global styles
│   ├── about/
│   ├── contact/
│   ├── projects/
│   └── api/contact/      # Contact form endpoint
├── components/
│   ├── home/             # Landing scene: island, Steve, HUD, pearl game, intro animation
│   ├── about/            # About page sections
│   ├── projects/         # Project cards, rows, and view toggle
│   ├── contact/          # Contact hero, links, and form
│   ├── layout/           # Navbar, footer, scroll behaviour
│   └── ui/               # Shared building blocks (headings, modal, reveal wrapper)
├── data/                 # Page content: projects, certifications, skills, timeline
├── hooks/                # Shared React hooks
├── lib/                  # Validation, mail transport, shared class strings
└── types/
```

Components are grouped by the page or feature they belong to; anything used across pages lives in `ui/` or `layout/`. Page content lives in `data/` so copy can change without touching markup.

## Assets & credits

Some visual assets were sourced from external materials, including **official Minecraft videos**, and are credited in the site footer. Future updates will replace them with original or royalty-free alternatives to avoid potential copyright concerns.
