import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { AppText } from "./app-text";
import { CatalogPhoto } from "./catalog-photo";
import { Icon } from "./icon";
import { Button } from "./button";
import { Merchant, PriceBreakdown } from "@/core/models";
import { formatMinor } from "@/core/regions";
import { useAppStore } from "@/store/app-store";
import { useAppTheme } from "@/hooks/use-app-theme";
import { convertMinor } from "@/core/preferences";

export function useMoney() {
  const { preferences } = useAppStore();
  return (
    amount: number,
    currency = preferences.region === "IN"
      ? ("INR" as const)
      : preferences.region === "US"
        ? ("USD" as const)
        : ("GBP" as const),
  ) =>
    formatMinor(
      convertMinor(amount, currency, preferences.currency),
      preferences.region,
      preferences.currency,
    );
}
export function Chip({
  label,
  selected = false,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: string;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.ink : theme.surfaceMuted,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {Boolean(icon) && (
        <Icon
          name={icon!}
          size={18}
          color={selected ? theme.canvas : theme.ink}
        />
      )}
      <AppText
        variant="caption"
        style={{ fontWeight: "600" }}
        color={selected ? theme.canvas : theme.ink}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
export function ChipRow({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
    >
      {children}
    </ScrollView>
  );
}
export function MerchantCard({ merchant }: { merchant: Merchant }) {
  const router = useRouter();
  const theme = useAppTheme();
  const money = useMoney();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        merchant.name +
        ", " +
        merchant.category +
        ", " +
        merchant.rating.toFixed(1) +
        " stars"
      }
      onPress={() =>
        router.push({ pathname: "/merchant/[id]", params: { id: merchant.id } })
      }
      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, gap: 8 })}
    >
      <View>
        <CatalogPhoto
          imageKey={merchant.imageKey}
          style={{ borderRadius: 14 }}
        />
        {Boolean(merchant.offer) && (
          <View
            style={{
              position: "absolute",
              bottom: 10,
              left: 10,
              backgroundColor: theme.surface,
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 5,
            }}
          >
            <AppText variant="caption" style={{ fontWeight: "700" }}>
              {merchant.offer}
            </AppText>
          </View>
        )}
      </View>
      <View style={styles.between}>
        <AppText variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
          {merchant.name}
        </AppText>
        <View style={styles.inline}>
          <Icon name="star" size={14} />
          <AppText variant="caption">{merchant.rating.toFixed(1)}</AppText>
        </View>
      </View>
      <AppText variant="caption" color={theme.muted} numberOfLines={1}>
        {merchant.category} · {"$".repeat(merchant.priceTier)} ·{" "}
        {merchant.etaMinutes.join("–")} min
      </AppText>
      <AppText variant="caption" color={theme.muted}>
        {money(merchant.deliveryFeeMinor)} delivery ·{" "}
        {(merchant.distanceMeters / 1000).toFixed(1)} km
      </AppText>
    </Pressable>
  );
}
export function MerchantGrid({ merchants }: { merchants: Merchant[] }) {
  const { width } = useWindowDimensions();
  const columns = width >= 1440 ? 4 : width >= 1024 ? 3 : width >= 640 ? 2 : 1;
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: -8,
        rowGap: 28,
      }}
    >
      {merchants.map((merchant) => (
        <View
          key={merchant.id}
          style={{
            width: (100 / columns + "%") as `${number}%`,
            paddingHorizontal: 8,
          }}
        >
          <MerchantCard merchant={merchant} />
        </View>
      ))}
    </View>
  );
}
export function PriceSummary({ quote }: { quote: PriceBreakdown }) {
  const money = useMoney();
  const theme = useAppTheme();
  return (
    <View style={{ gap: 13 }}>
      {quote.lines.map((line) => (
        <View key={line.id} style={styles.between}>
          <AppText color={theme.muted}>{line.label}</AppText>
          <AppText>{money(line.amountMinor, quote.currency)}</AppText>
        </View>
      ))}
      <View
        style={[
          styles.between,
          { borderTopWidth: 1, borderColor: theme.border, paddingTop: 16 },
        ]}
      >
        <AppText variant="bodyStrong">Total</AppText>
        <AppText variant="heading">
          {money(quote.totalMinor, quote.currency)}
        </AppText>
      </View>
    </View>
  );
}
export function BasketBar() {
  const store = useAppStore();
  const router = useRouter();
  if (!store.cart.length) return null;
  const count = store.cart.reduce((sum, line) => sum + line.quantity, 0);
  return (
    <View style={{ paddingTop: 20 }}>
      <Button
        label={"View basket · " + count + (count === 1 ? " item" : " items")}
        icon="shopping-outline"
        onPress={() => router.push("/cart")}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  inline: { flexDirection: "row", alignItems: "center", gap: 3 },
});
