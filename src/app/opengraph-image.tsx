import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME} logo`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LOGO_BACKGROUND = "#fbf4ec";
const LOGO_WIDTH = size.width;
const LOGO_HEIGHT = Math.round((LOGO_WIDTH * 366) / 1096);

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/assets/images/logotext.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: LOGO_BACKGROUND,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img> only */}
      <img src={logoSrc} alt="" width={LOGO_WIDTH} height={LOGO_HEIGHT} />
    </div>,
    size,
  );
}
