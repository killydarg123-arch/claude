import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const COLORS = {
  bg: "#F5F5F7",
  ink: "#0A0A0A",
  white: "#FFFFFF",
  grey: "#6E6E73",
  lightGrey: "#A1A1A6",
  blue: "#0B1D3A",
};

export const LIGHT_BG =
  "radial-gradient(120% 80% at 50% 35%, #FFFFFF 0%, #F5F5F7 55%, #E8E8ED 100%)";

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

// Phone geometry, in 1080x1920 frame coordinates. The phone sits low and
// is cropped by the bottom edge, like an Apple product shot.
export const PHONE = {
  left: 174,
  top: 600,
  width: 732,
  height: 1486,
  radius: 108,
  bezel: 16,
};
export const SCREEN_WIDTH = PHONE.width - PHONE.bezel * 2;
export const SCREEN_RADIUS = PHONE.radius - PHONE.bezel;
export const STATUS_H = 76;
export const PHONE_SHADOW =
  "0 70px 120px -40px rgba(0,0,0,0.35), 0 30px 60px -30px rgba(0,0,0,0.25)";
