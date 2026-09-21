import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import { getMerchant, getMenu } from "@/core/catalog";
import { Page } from "@/components/page";
import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { CatalogPhoto } from "@/components/catalog-photo";
import { BasketBar, Chip, ChipRow, useMoney } from "@/components/commerce";
import { Icon } from "@/components/icon";
import { EmptyState } from "@/components/empty-state";
import { useAppStore } from "@/store/app-store";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function MerchantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const merchant = getMerchant(id);
  const menu = getMenu(id);
  const [section, setSection] = useState("All");
  const router = useRouter();
  const theme = useAppTheme();
  const store = useAppStore();
  const money = useMoney();
  const { width } = useWindowDimensions();
  if (!merchant)
    return (
      <Page>
        <ScreenHeader title="Restaurant unavailable" />
        <EmptyState
          icon="store-outline"
          title="We couldn’t find this place"
          description="Browse the current restaurants and stores to find something new."
          actionLabel="Explore"
          onAction={() => router.replace("/")}
        />
      </Page>
    );
  const favorite = store.favorites.some(
    (entry) => entry.targetId === id && entry.kind === "merchant",
  );
  const sections = ["All", ...new Set(menu.map((item) => item.category))];
  return (
    <Page testID="merchant-screen">
      <ScreenHeader title={merchant.name} subtitle={merchant.category} />
      <CatalogPhoto
        imageKey={merchant.imageKey}
        size="hero"
        style={{
          height: width < 640 ? 210 : 310,
          width: "100%",
          aspectRatio: undefined,
          borderRadius: 18,
        }}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          marginTop: 22,
        }}
      >
        <AppText variant="title" style={{ flex: 1 }}>
          {merchant.name}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            favorite ? "Remove from favorites" : "Save to favorites"
          }
          accessibilityState={{ selected: favorite }}
          onPress={() => store.toggleFavorite("merchant", id)}
          style={{ padding: 12 }}
        >
          <Icon
            name={favorite ? "heart" : "heart-outline"}
            color={favorite ? theme.brand : theme.ink}
          />
        </Pressable>
      </View>
      <AppText color={theme.muted} style={{ marginTop: 7 }}>
        {merchant.rating.toFixed(1)} stars ({merchant.ratingCount}) ·{" "}
        {merchant.etaMinutes.join("–")} min · {money(merchant.deliveryFeeMinor)}{" "}
        delivery
      </AppText>
      <AppText color={theme.muted} style={{ marginTop: 12, maxWidth: 720 }}>
        {merchant.description}
      </AppText>
      {Boolean(merchant.offer) && (
        <View
          style={{
            padding: 14,
            borderRadius: 12,
            marginTop: 18,
            backgroundColor: theme.brandSoft,
          }}
        >
          <AppText variant="bodyStrong">{merchant.offer}</AppText>
          <AppText variant="caption">
            Applied to eligible food items at checkout.
          </AppText>
        </View>
      )}
      <View style={{ marginVertical: 18 }}>
        <ChipRow>
          {sections.map((category) => (
            <Chip
              key={category}
              label={category}
              selected={section === category}
              onPress={() => setSection(category)}
            />
          ))}
        </ChipRow>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
        {menu
          .filter((item) => section === "All" || item.category === section)
          .map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() =>
                router.push({ pathname: "/item/[id]", params: { id: item.id } })
              }
              style={({ pressed }) => ({
                width: width >= 1000 ? "48.5%" : "100%",
                flexDirection: "row",
                gap: 16,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderColor: theme.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View style={{ flex: 1, gap: 6 }}>
                {item.popular && (
                  <AppText variant="caption" color={theme.brand}>
                    Popular
                  </AppText>
                )}
                <AppText variant="bodyStrong">{item.title}</AppText>
                <AppText
                  variant="caption"
                  color={theme.muted}
                  numberOfLines={2}
                >
                  {item.description}
                </AppText>
                <AppText variant="bodyStrong">
                  {money(item.priceMinor[store.preferences.region])}
                </AppText>
                {Boolean(item.dietary) && (
                  <AppText variant="caption" color={theme.muted}>
                    {item.dietary}
                  </AppText>
                )}
              </View>
              <View>
                <CatalogPhoto
                  imageKey={item.imageKey}
                  size="thumb"
                  style={{
                    width: width < 430 ? 100 : 130,
                    height: 110,
                    borderRadius: 12,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    right: 6,
                    bottom: 6,
                    padding: 6,
                    borderRadius: 18,
                    backgroundColor: theme.surface,
                  }}
                >
                  <Icon name="plus" size={20} />
                </View>
              </View>
            </Pressable>
          ))}
      </View>
      <BasketBar />
    </Page>
  );
}
