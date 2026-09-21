import { Image, StyleSheet, View } from "react-native";
import { radii, spacing } from "@/constants/theme";
import { AppText } from "./app-text";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <View accessibilityLabel="FauxGo" style={styles.row}>
      <Image
        source={require("@/assets/images/fauxgo-icon.png")}
        style={[styles.mark, compact && styles.markCompact]}
      />
      <AppText variant="heading" style={compact && styles.wordCompact}>
        FauxGo
      </AppText>
    </View>
  );
}
const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  mark: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
  },
  markCompact: { width: 30, height: 30 },
  wordCompact: { fontSize: 19 },
});
