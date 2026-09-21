import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ComponentProps } from "react";
import { useAppTheme } from "@/hooks/use-app-theme";
export function Icon({
  name,
  size = 22,
  color,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const theme = useAppTheme();
  const supported =
    name in MaterialCommunityIcons.glyphMap ? name : "circle-outline";
  return (
    <MaterialCommunityIcons
      name={supported as ComponentProps<typeof MaterialCommunityIcons>["name"]}
      size={size}
      color={color ?? theme.ink}
    />
  );
}
