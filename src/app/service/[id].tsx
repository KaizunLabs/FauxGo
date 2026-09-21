import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import { getService, getVehicles, discoverMerchants } from "@/core/catalog";
import { cuisines } from "@/core/catalog-seeds";
import { normalizePlace } from "@/core/state";
import { regions } from "@/core/regions";
import { useRoute } from "@/hooks/use-route";
import { calculateMobilityPrice } from "@/core/pricing";
import { Page } from "@/components/page";
import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { Button } from "@/components/button";
import {
  Chip,
  ChipRow,
  MerchantGrid,
  BasketBar,
  useMoney,
} from "@/components/commerce";
import { Icon } from "@/components/icon";
import { EmptyState } from "@/components/empty-state";
import { MapView } from "@/platform/map-view";
import { useAppStore } from "@/store/app-store";
import { useAppTheme } from "@/hooks/use-app-theme";
const aliases: Record<string, string> = {
  food: "eats",
  grocery: "market",
  premium: "black",
  courier: "send",
  sky: "air",
};
export default function ServiceScreen() {
  const params = useLocalSearchParams<{ id: string; destination?: string }>();
  const id = aliases[params.id] ?? params.id;
  const service = getService(id);
  const store = useAppStore();
  const theme = useAppTheme();
  const router = useRouter();
  const money = useMoney();
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState<
    "all" | "offers" | "fastest" | "vegetarian" | "healthy"
  >("all");
  const [cuisine, setCuisine] = useState<string | undefined>();
  const [limit, setLimit] = useState(12);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  let destination = undefined;
  try {
    destination = normalizePlace(JSON.parse(params.destination ?? "null"));
  } catch {
    /* Invalid deep links fall back to selection. */
  }
  const routing = useRoute(
    store.selectedPlace.coordinate,
    destination?.coordinate,
    id !== "air",
  );
  if (!service)
    return (
      <Page>
        <ScreenHeader title="Service unavailable" />
        <EmptyState
          icon="map-marker-question-outline"
          title="We couldn’t find this service"
          description="Choose a service from Home."
          actionLabel="Home"
          onAction={() => router.replace("/")}
        />
      </Page>
    );
  if (service.kind === "commerce") {
    const found = discoverMerchants(
      store.preferences.region,
      service.id === "market" ? "market" : "eats",
      cuisine ?? "all",
      filter,
    );
    return (
      <Page testID={"service-" + id}>
        <ScreenHeader
          title={service.title}
          subtitle={store.selectedPlace.address}
        />
        <AppText variant="title">
          {id === "eats" ? "What are you craving?" : "Everyday, well stocked."}
        </AppText>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/search")}
          style={{
            padding: 16,
            backgroundColor: theme.surfaceMuted,
            borderRadius: 12,
            flexDirection: "row",
            gap: 12,
            marginTop: 20,
          }}
        >
          <Icon name="magnify" />
          <AppText color={theme.muted}>
            {id === "eats"
              ? "Search dishes and restaurants"
              : "Search products and stores"}
          </AppText>
        </Pressable>
        <View style={{ marginVertical: 12 }}>
          <ChipRow>
            {(
              [
                "all",
                "offers",
                "fastest",
                ...(id === "eats" ? (["vegetarian", "healthy"] as const) : []),
              ] as const
            ).map((value) => (
              <Chip
                key={value}
                selected={filter === value}
                label={
                  value === "all"
                    ? "For you"
                    : value[0].toUpperCase() + value.slice(1)
                }
                onPress={() => {
                  setFilter(value);
                  setLimit(12);
                }}
              />
            ))}
          </ChipRow>
          {id === "eats" && (
            <ChipRow>
              <Chip
                label="All cuisines"
                selected={!cuisine}
                onPress={() => setCuisine(undefined)}
              />
              {cuisines.map((entry) => (
                <Chip
                  key={entry.id}
                  label={entry.title}
                  selected={cuisine === entry.id}
                  onPress={() => {
                    setCuisine(entry.id);
                    setLimit(12);
                  }}
                />
              ))}
            </ChipRow>
          )}
        </View>
        <View style={{ marginBottom: 20 }}>
          <AppText variant="heading">
            {id === "market"
              ? "Your neighborhood stores"
              : "Find your next favorite"}
          </AppText>
          <AppText
            variant="caption"
            color={theme.muted}
            style={{ marginTop: 5 }}
          >
            {found.length} places to explore
          </AppText>
        </View>
        <MerchantGrid merchants={found.slice(0, limit)} />
        {!found.length && (
          <EmptyState
            icon="store-outline"
            title="No places match these filters"
            description="Try another cuisine or clear your filters."
            actionLabel="Clear filters"
            onAction={() => {
              setFilter("all");
              setCuisine(undefined);
            }}
          />
        )}
        {found.length > limit && (
          <Button
            label="Show more places"
            variant="secondary"
            style={{ marginTop: 24 }}
            onPress={() => setLimit(limit + 12)}
          />
        )}
        <BasketBar />
      </Page>
    );
  }
  const origin = store.selectedPlace;
  const options = getVehicles(service.id, store.preferences.region);
  const route = routing.route;
  const selectedVehicle =
    options.find((option) => option.id === vehicleId) ?? options[0];
  const different =
    destination &&
    (origin.coordinate[0] !== destination.coordinate[0] ||
      origin.coordinate[1] !== destination.coordinate[1]);
  return (
    <Page testID={"service-" + id}>
      <ScreenHeader title={service.title} />
      <View
        style={{ flexDirection: width >= 1024 ? "row" : "column", gap: 24 }}
      >
        <View style={{ flex: 1, gap: 16 }}>
          <AppText variant="title">
            {id === "send"
              ? "Where is it going?"
              : id === "air"
                ? "A different perspective."
                : "Where to?"}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/location")}
            style={{
              backgroundColor: theme.surfaceMuted,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <AppText variant="caption" color={theme.muted}>
              Pickup
            </AppText>
            <AppText variant="bodyStrong">{origin.label}</AppText>
            <AppText variant="caption" color={theme.muted}>
              {origin.address}
            </AppText>
          </Pressable>
          <Button
            label={destination?.label ?? "Enter destination"}
            icon="magnify"
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: "/location",
                params: { returnService: id },
              })
            }
          />
          {!destination && (
            <>
              <AppText variant="bodyStrong">Suggested places</AppText>
              {regions[store.preferences.region].places
                .filter((place) => place.id !== origin.id)
                .map((place) => (
                  <Pressable
                    key={place.id}
                    accessibilityRole="button"
                    onPress={() =>
                      router.setParams({ destination: JSON.stringify(place) })
                    }
                    style={{
                      flexDirection: "row",
                      gap: 12,
                      paddingVertical: 12,
                    }}
                  >
                    <Icon name="map-marker-outline" />
                    <View style={{ flex: 1 }}>
                      <AppText variant="bodyStrong">{place.label}</AppText>
                      <AppText variant="caption" color={theme.muted}>
                        {place.address}
                      </AppText>
                    </View>
                  </Pressable>
                ))}
            </>
          )}
          {route && (
            <>
              <AppText color={theme.muted}>
                {(route.distanceMeters / 1000).toFixed(1)} km · about{" "}
                {Math.ceil(route.durationSeconds / 60)} min
              </AppText>
              <AppText variant="heading">
                {id === "send"
                  ? "Choose a courier"
                  : id === "air"
                    ? "Choose your aircraft"
                    : "Choose your ride"}
              </AppText>
              {options.map((option) => {
                const quote = calculateMobilityPrice({
                  region: store.preferences.region,
                  vehicle: option,
                  distanceMeters: route.distanceMeters,
                  durationSeconds: route.durationSeconds,
                  seed: route.id,
                });
                const selected = option.id === selectedVehicle.id;
                return (
                  <Pressable
                    key={option.id}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    onPress={() => setVehicleId(option.id)}
                    style={{
                      borderWidth: selected ? 2 : 1,
                      borderColor: selected ? theme.ink : theme.border,
                      backgroundColor: theme.surface,
                      borderRadius: 14,
                      padding: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <Icon name={option.icon} size={42} />
                    <View style={{ flex: 1 }}>
                      <AppText variant="bodyStrong">{option.title}</AppText>
                      <AppText variant="caption" color={theme.muted}>
                        {option.capacity} · {option.etaMinutes} min away
                      </AppText>
                      <AppText variant="caption" color={theme.muted}>
                        {option.description}
                      </AppText>
                    </View>
                    <AppText variant="bodyStrong">
                      {money(quote.totalMinor)}
                    </AppText>
                  </Pressable>
                );
              })}
              <Button
                label="Review booking"
                disabled={!different || routing.loading}
                onPress={() =>
                  router.push({
                    pathname: "/checkout",
                    params: {
                      service: id,
                      vehicle: selectedVehicle.id,
                      destination: JSON.stringify(destination),
                    },
                  })
                }
              />
              {!different && (
                <AppText color={theme.danger}>
                  Choose a destination different from pickup.
                </AppText>
              )}
              {routing.loading && (
                <AppText accessibilityLiveRegion="polite" color={theme.muted}>
                  Finding a road route…
                </AppText>
              )}
              {route.source === "demo" && (
                <AppText variant="caption" color={theme.muted}>
                  {id === "air"
                    ? "Illustrative flight path."
                    : "Approximate route. Road routing is unavailable; the experience still works offline."}
                </AppText>
              )}
              {routing.failed && (
                <Button
                  label="Retry road route"
                  variant="quiet"
                  onPress={routing.retry}
                />
              )}
            </>
          )}
        </View>
        <View style={{ flex: width >= 1024 ? 1.5 : undefined }}>
          <MapView
            key={route?.id ?? origin.id}
            center={origin.coordinate}
            route={route}
            approximate={route?.source === "demo" && id !== "air"}
            height={width >= 1024 ? 680 : 350}
            reducedMotion={store.preferences.reducedMotion === "on"}
          />
        </View>
      </View>
    </Page>
  );
}
