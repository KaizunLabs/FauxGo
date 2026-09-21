import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, View } from "react-native";
import { radii, spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { AppText } from "./app-text";

export function SimulationBadge({ compact = false }: { compact?: boolean }) {
  const theme = useAppTheme();
  return (
    <View
      accessibilityLabel="Simulation only. Nothing is ordered, booked, or charged."
      style={[
        styles.badge,
        { backgroundColor: theme.brandSoft },
        compact && styles.compact,
      ]}
    >
      <MaterialCommunityIcons
        name="theater"
        color={theme.brand}
        size={compact ? 15 : 18}
      />
      <AppText
        variant={compact ? "caption" : "bodyStrong"}
        color={theme.brand}
        style={styles.copy}
      >
        {compact
          ? "Simulation"
          : "Simulation only · nothing is booked or charged"}
      </AppText>
    </View>
  );
}
const styles = StyleSheet.create({
  badge: {
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.sm,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  copy: { flexShrink: 1 },
  compact: { paddingVertical: 5, paddingHorizontal: 9 },
});
