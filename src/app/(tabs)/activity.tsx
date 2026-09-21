import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Page } from "@/components/page";
import { AppText } from "@/components/app-text";
import { Chip, ChipRow, useMoney } from "@/components/commerce";
import { Icon } from "@/components/icon";
import { EmptyState } from "@/components/empty-state";
import { deriveSnapshot } from "@/core/timeline";
import { getService } from "@/core/catalog";
import { useClock } from "@/hooks/use-clock";
import { useAppStore } from "@/store/app-store";
import { useAppTheme } from "@/hooks/use-app-theme";
export default function ActivityScreen() {
  const store = useAppStore();
  const theme = useAppTheme();
  const router = useRouter();
  const now = useClock();
  const money = useMoney();
  const [filter, setFilter] = useState("All");
  const entries = store.simulations.filter(
    (item) =>
      filter === "All" ||
      deriveSnapshot(item, now).complete === (filter === "Completed"),
  );
  return (
    <Page testID="activity-screen">
      <AppText variant="title">Activity</AppText>
      <View style={{ marginVertical: 16 }}>
        <ChipRow>
          {["All", "In progress", "Completed"].map((label) => (
            <Chip
              key={label}
              label={label}
              selected={filter === label}
              onPress={() => setFilter(label)}
            />
          ))}
        </ChipRow>
      </View>
      {!entries.length ? (
        <EmptyState
          icon="clock-outline"
          title={
            filter === "All"
              ? "Your next chapter starts here"
              : "Nothing here yet"
          }
          description="Your orders, rides and deliveries will appear here."
          actionLabel="Explore FauxGo"
          onAction={() => router.navigate("/")}
        />
      ) : (
        entries.map((item) => {
          const snapshot = deriveSnapshot(item, now);
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: "/tracking/[id]",
                  params: { id: item.id },
                })
              }
              style={({ pressed }) => ({
                paddingVertical: 22,
                borderBottomWidth: 1,
                borderColor: theme.border,
                flexDirection: "row",
                gap: 16,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: theme.surfaceMuted,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  name={getService(item.serviceType)?.icon ?? "clock-outline"}
                />
              </View>
              <View style={{ flex: 1, gap: 5 }}>
                <AppText variant="bodyStrong">{item.title}</AppText>
                <AppText
                  variant="caption"
                  color={snapshot.complete ? theme.muted : theme.brand}
                >
                  {snapshot.stage.title}
                </AppText>
                <AppText variant="caption" color={theme.muted}>
                  {item.destination.label} ·{" "}
                  {new Date(item.createdAt).toLocaleDateString()}
                </AppText>
              </View>
              <View style={{ alignItems: "flex-end", gap: 8 }}>
                <AppText variant="bodyStrong">
                  {money(item.quote.totalMinor, item.quote.currency)}
                </AppText>
                <Icon name="chevron-right" />
              </View>
            </Pressable>
          );
        })
      )}
    </Page>
  );
}
