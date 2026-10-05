import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const COLORS = {
  ink: "#0A0A0A",
  white: "#FFFFFF",
  grey: "#6E6E73",
  blue: "#0B1D3A",
};

// Soft studio sweep behind the phone.
export const STAGE_BG =
  "radial-gradient(130% 90% at 50% 30%, #FFFFFF 0%, #F4F4F6 55%, #E8E8ED 100%)";

// Inter stands in for SF Pro. Bodoni Moda matches the app's serif headlines.
export const SANS = "Inter";
export const SERIF = "Bodoni Moda";

const FONT_FILES: [string, string, string][] = [
  [SANS, "400", "inter-latin-400-normal.woff2"],
  [SANS, "500", "inter-latin-500-normal.woff2"],
  [SANS, "600", "inter-latin-600-normal.woff2"],
  [SANS, "700", "inter-latin-700-normal.woff2"],
  [SERIF, "500", "bodoni-moda-latin-500-normal.woff2"],
  [SERIF, "600", "bodoni-moda-latin-600-normal.woff2"],
  [SERIF, "700", "bodoni-moda-latin-700-normal.woff2"],
];

for (const [family, weight, file] of FONT_FILES) {
  loadFont({ family, weight, url: staticFile(`fonts/${file}`) });
}
