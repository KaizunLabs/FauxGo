import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import { radii, spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { AppText } from "./app-text";
import { Button } from "./button";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const theme = useAppTheme();
  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: theme.brandSoft }]}>
        <MaterialCommunityIcons name={icon} size={30} color={theme.brand} />
      </View>
      <AppText variant="heading">{title}</AppText>
      <AppText color={theme.muted} style={styles.copy}>
        {description}
      </AppText>
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} style={styles.button} />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.xxl,
    alignItems: "center",
    gap: spacing.md,
  },
  icon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { textAlign: "center", maxWidth: 420 },
  button: { marginTop: spacing.sm },
});
