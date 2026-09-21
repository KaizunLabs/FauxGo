import { useRouter } from "expo-router";
import { Pressable, View, useWindowDimensions } from "react-native";
import { AppText } from "@/components/app-text";
import { Page } from "@/components/page";
import { CatalogPhoto } from "@/components/catalog-photo";
import { Chip, ChipRow, MerchantGrid } from "@/components/commerce";
import { Icon } from "@/components/icon";
import { services, getMerchants } from "@/core/catalog";
import { useAppStore } from "@/store/app-store";
import { useAppTheme } from "@/hooks/use-app-theme";
export default function Home() {
  const store = useAppStore();
  const theme = useAppTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const merchants = getMerchants(store.preferences.region);
  const featured = ["indian", "pizza", "noodles", "produce"].flatMap(
    (key) => merchants.find((merchant) => merchant.imageKey === key) ?? [],
  );
  return (
    <Page testID="home-screen">
      <ChipRow>
        {services.map((service) => (
          <Chip
            key={service.id}
            label={service.shortTitle}
            icon={service.icon}
            onPress={() =>
              router.push({
                pathname: "/service/[id]",
                params: { id: service.id },
              })
            }
          />
        ))}
      </ChipRow>
      <View
        style={{
          flexDirection: width >= 900 ? "row" : "column",
          gap: 16,
          marginTop: 16,
          marginBottom: 32,
        }}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/service/eats")}
          style={({ pressed }) => ({
            flex: 1.7,
            minHeight: width >= 900 ? 290 : 240,
            borderRadius: 20,
            overflow: "hidden",
            backgroundColor: "#EDE4D8",
            opacity: pressed ? 0.88 : 1,
          })}
        >
          <CatalogPhoto
            imageKey="indian"
            size="hero"
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "68%",
              height: "100%",
              aspectRatio: undefined,
            }}
          />
          <View
            style={{
              width: "55%",
              backgroundColor: "#EDE4D8",
              padding: width < 520 ? 22 : 30,
              flex: 1,
              justifyContent: "center",
              gap: 12,
            }}
          >
            <AppText
              variant="caption"
              color="#62594D"
              style={{ fontWeight: "700" }}
            >
              GOOD FOOD, GOOD MOOD
            </AppText>
            <AppText
              variant={width < 520 ? "title" : "display"}
              color="#25211D"
            >
              Your next{"\n"}great bite.
            </AppText>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <AppText variant="bodyStrong" color="#25211D">
                Explore Eats
              </AppText>
              <Icon name="arrow-right" color="#25211D" />
            </View>
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/service/ride")}
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 200,
            backgroundColor: theme.surfaceMuted,
            borderRadius: 20,
            padding: 28,
            gap: 16,
            justifyContent: "space-between",
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <AppText variant="title">Where to?</AppText>
            <Icon name="car-side" size={52} />
          </View>
          <AppText color={theme.muted}>
            Across the city or a change of scenery. Find your ride.
          </AppText>
          <View
            style={{
              backgroundColor: theme.surface,
              borderRadius: 12,
              padding: 15,
              flexDirection: "row",
              gap: 10,
              alignItems: "center",
            }}
          >
            <Icon name="magnify" />
            <AppText variant="bodyStrong">Enter destination</AppText>
          </View>
        </Pressable>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <AppText variant="heading">A little of what you love</AppText>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/service/eats")}
          style={{ padding: 10 }}
        >
          <AppText variant="caption" color={theme.brand}>
            See all
          </AppText>
        </Pressable>
      </View>
      <MerchantGrid merchants={featured} />
      <View style={{ marginTop: 38, marginBottom: 18 }}>
        <AppText variant="heading">Worth making room for</AppText>
        <AppText color={theme.muted} style={{ marginTop: 5 }}>
          Local favorites, familiar comforts and something new.
        </AppText>
      </View>
      <MerchantGrid
        merchants={merchants
          .filter((merchant) => merchant.serviceType === "eats")
          .slice(4, 12)}
      />
      {store.simulations.length > 0 && (
        <View style={{ marginTop: 32, gap: 12 }}>
          <AppText variant="heading">Pick up where you left off</AppText>
          {store.simulations.slice(0, 2).map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: "/tracking/[id]",
                  params: { id: item.id },
                })
              }
              style={{
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderColor: theme.border,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View>
                <AppText variant="bodyStrong">{item.title}</AppText>
                <AppText variant="caption" color={theme.muted}>
                  {item.destination.label}
                </AppText>
              </View>
              <Icon name="arrow-right" />
            </Pressable>
          ))}
        </View>
      )}
    </Page>
  );
}
