import { Platform } from "react-native";

export const palette = {
  ink: "#20201F",
  muted: "#706D68",
  canvas: "#FCFBF8",
  surface: "#FFFFFF",
  surfaceMuted: "#F1EEEA",
  border: "#E6E2DD",
  brand: "#C94332",
  brandDark: "#A83225",
  brandSoft: "#FBE9E4",
  peach: "#F1B58E",
  lemon: "#E9D77A",
  sky: "#9CCAD6",
  lavender: "#B9AFD6",
  danger: "#A33C36",
  warning: "#A55C14",
  overlay: "rgba(23, 33, 27, 0.48)",
} as const;

export const darkPalette = {
  ink: "#F5F2ED",
  muted: "#B5AFA6",
  canvas: "#171716",
  surface: "#222220",
  surfaceMuted: "#2D2C29",
  border: "#403D38",
  brand: "#F58B79",
  brandDark: "#FFAB9D",
  brandSoft: "#402B26",
  peach: "#B87551",
  lemon: "#A18F3D",
  sky: "#568D9B",
  lavender: "#7569A1",
  danger: "#EF9189",
  warning: "#F1AE67",
  overlay: "rgba(0, 0, 0, 0.66)",
} as const;

export type AppPalette = typeof palette;
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  huge: 48,
} as const;
export const radii = { sm: 10, md: 16, lg: 22, pill: 999 } as const;
export const contentWidth = 1400;
export const readingWidth = 680;
export const fonts = Platform.select({
  web: {
    regular: "Inter, system-ui, sans-serif",
    display: "Inter, system-ui, sans-serif",
    mono: "ui-monospace, monospace",
  },
  default: { regular: "System", display: "System", mono: "monospace" },
})!;
export const shadows = Platform.select({
  web: { boxShadow: "0 10px 30px rgba(23, 33, 27, 0.07)" },
  default: {
    shadowColor: "#17211B",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
});
