import { useColorScheme } from "react-native";
import { darkPalette, palette } from "@/constants/theme";
import { useAppStore } from "@/store/app-store";
import { resolveAppearance } from "@/core/preferences";

export function useAppTheme() {
  const system = useColorScheme();
  const { preferences } = useAppStore();
  return resolveAppearance(
    preferences.appearance,
    system === "dark" ? "dark" : "light",
  ) === "dark"
    ? darkPalette
    : palette;
}
