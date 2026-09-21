import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { AppText } from "@/components/app-text";
import { Brand } from "@/components/brand";
import { Button } from "@/components/button";
import { Page } from "@/components/page";
import { radii, spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAppStore } from "@/store/app-store";

const promises = [
  {
    icon: "theater",
    title: "A simulation, always",
    copy: "Every service, person, place, price and journey is fictional. FauxGo never sends a real request.",
  },
  {
    icon: "credit-card-off-outline",
    title: "No money can move",
    copy: "There are no payment forms, partner APIs, calls, messages or real-world bookings anywhere in the app.",
  },
  {
    icon: "map-marker-radius-outline",
    title: "Realistic, not real",
    copy: "Browse, choose, confirm and watch a complete accelerated story unfold entirely on your device.",
  },
] as const;

export default function OnboardingScreen() {
  const theme = useAppTheme();
  const store = useAppStore();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const start = () => {
    store.completeOnboarding();
    store.haptic();
    router.replace("/");
  };
  return (
    <Page testID="onboarding-screen" contentStyle={styles.page}>
      <Brand />
      <View style={styles.hero}>
        <View style={[styles.orbit, { borderColor: theme.border }]}>
          <View
            style={[styles.innerOrbit, { backgroundColor: theme.brandSoft }]}
          >
            <MaterialCommunityIcons
              name="navigation-variant-outline"
              size={48}
              color={theme.brand}
            />
          </View>
          <View style={[styles.dot, { backgroundColor: theme.peach }]} />
          <View style={[styles.dotTwo, { backgroundColor: theme.sky }]} />
        </View>
        <View style={styles.heroCopy}>
          <AppText variant={width < 520 ? "title" : "display"}>
            All the journey.{`\n`}None of the going.
          </AppText>
          <AppText color={theme.muted} style={styles.lede}>
            FauxGo is a beautifully detailed entertainment simulator inspired by
            the rituals of modern on-demand life—not any real service.
          </AppText>
        </View>
      </View>
      <View style={styles.cards}>
        {promises.map((promise) => (
          <View
            key={promise.title}
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View
              style={[styles.icon, { backgroundColor: theme.surfaceMuted }]}
            >
              <MaterialCommunityIcons
                name={promise.icon}
                size={24}
                color={theme.brand}
              />
            </View>
            <AppText variant="bodyStrong">{promise.title}</AppText>
            <AppText variant="caption" color={theme.muted}>
              {promise.copy}
            </AppText>
          </View>
        ))}
      </View>
      <View style={[styles.notice, { backgroundColor: theme.brandSoft }]}>
        <MaterialCommunityIcons
          name="information-outline"
          size={21}
          color={theme.brand}
        />
        <AppText
          variant="caption"
          color={theme.brand}
          style={styles.noticeCopy}
        >
          By continuing, you acknowledge that FauxGo is fictional entertainment
          and cannot order, book, pay for, or contact anything.
        </AppText>
      </View>
      <Button
        label="Enter the imaginary city"
        icon="arrow-right"
        onPress={start}
        style={styles.cta}
        accessibilityHint="Accepts the simulation notice and opens FauxGo"
      />
    </Page>
  );
}
const styles = StyleSheet.create({
  page: { maxWidth: 940 },
  hero: {
    marginTop: spacing.huge,
    marginBottom: spacing.xxl,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xxl,
  },
  heroCopy: { flex: 1, minWidth: 280, gap: spacing.lg },
  lede: { fontSize: 18, lineHeight: 27, maxWidth: 580 },
  orbit: {
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  innerOrbit: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-8deg" }],
  },
  dot: {
    position: "absolute",
    top: 18,
    right: 22,
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  dotTwo: {
    position: "absolute",
    bottom: 22,
    left: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  cards: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  card: {
    flex: 1,
    minWidth: 230,
    padding: spacing.xl,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  notice: {
    marginTop: spacing.xl,
    borderRadius: radii.md,
    padding: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
  },
  noticeCopy: { flex: 1 },
  cta: { marginTop: spacing.xl, alignSelf: "flex-end" },
});
