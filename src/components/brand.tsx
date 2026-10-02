import { Link } from "expo-router";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { brandMarkPath, brandWordmarkPath } from "@/constants/brand.generated";
import { spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { AppText } from "./app-text";

type BrandProps = { compact?: boolean; markOnly?: boolean; size?: number };

export function Brand({
  compact = false,
  markOnly = false,
  size = compact ? 30 : 40,
}: BrandProps) {
  const theme = useAppTheme();
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="FauxGo"
      style={[styles.row, { gap: size / 4 }]}
    >
      <Svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        accessible={Platform.OS === "web" ? undefined : false}
        aria-hidden
      >
        <Path d={brandMarkPath} fill={theme.brand} />
      </Svg>
      {!markOnly && (
        <Svg
          width={size * 3.125}
          height={size * 0.75}
          viewBox="0 0 200 48"
          accessible={Platform.OS === "web" ? undefined : false}
          aria-hidden
        >
          <Path d={brandWordmarkPath} fill={theme.ink} fillRule="evenodd" />
        </Svg>
      )}
    </View>
  );
}

export function BrandHomeLink(props: BrandProps) {
  return (
    <Link href="/" dismissTo asChild>
      <Pressable
        accessible
        accessibilityRole="link"
        accessibilityLabel="FauxGo home"
        accessibilityHint="Returns to the home screen"
        style={styles.home}
      >
        {({ pressed }) => (
          <View style={{ opacity: pressed ? 0.7 : 1 }}>
            <Brand {...props} />
          </View>
        )}
      </Pressable>
    </Link>
  );
}

export function BrandCredit({ showAbout = true }: { showAbout?: boolean }) {
  const theme = useAppTheme();
  return (
    <View style={[styles.credit, { borderColor: theme.border }]}>
      <View style={styles.row}>
        <Brand markOnly size={20} />
        <AppText variant="caption" color={theme.muted}>
          Made by Kaizun Labs
        </AppText>
      </View>
      {showAbout && (
        <Link href="/legal/about" asChild>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="About FauxGo"
            style={styles.about}
          >
            {({ pressed }) => (
              <AppText
                variant="caption"
                color={theme.brand}
                style={{ fontWeight: "600", opacity: pressed ? 0.7 : 1 }}
              >
                About FauxGo
              </AppText>
            )}
          </Pressable>
        </Link>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexShrink: 0,
  },
  home: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  credit: {
    marginTop: spacing.xxl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: spacing.lg,
  },
  about: {
    minHeight: 44,
    paddingHorizontal: spacing.xs,
    justifyContent: "center",
  },
});
