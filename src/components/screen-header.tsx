import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { AppText } from "./app-text";

export function ScreenHeader({
  title,
  subtitle,
  back = true,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
}) {
  const router = useRouter();
  const theme = useAppTheme();
  return (
    <View style={styles.wrap}>
      <View style={styles.main}>
        {back && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/")
            }
            style={({ pressed }) => [
              styles.back,
              {
                backgroundColor: theme.surfaceMuted,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              color={theme.ink}
              size={22}
            />
          </Pressable>
        )}
        <View style={styles.copy}>
          <AppText variant="heading">{title}</AppText>
          {Boolean(subtitle) && (
            <AppText variant="caption" color={theme.muted}>
              {subtitle}
            </AppText>
          )}
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  main: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flexShrink: 1,
  },
  copy: { flexShrink: 1 },
  back: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
