import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ComponentProps } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { radii, spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { AppText } from "./app-text";

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "quiet" | "danger";
  icon?: ComponentProps<typeof MaterialCommunityIcons>["name"];
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};
export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  disabled,
  loading,
  style,
  accessibilityHint,
}: Props) {
  const theme = useAppTheme();
  const backgroundColor =
    variant === "primary"
      ? theme.brand
      : variant === "secondary"
        ? theme.surfaceMuted
        : variant === "danger"
          ? theme.danger
          : "transparent";
  const color =
    variant === "primary" || variant === "danger" ? theme.surface : theme.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor, opacity: disabled ? 0.45 : pressed ? 0.76 : 1 },
        variant === "quiet" && styles.quiet,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <>
          {Boolean(icon) && (
            <MaterialCommunityIcons name={icon} size={20} color={color} />
          )}
          <AppText variant="bodyStrong" color={color}>
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  quiet: { minHeight: 40, paddingHorizontal: spacing.md },
});
