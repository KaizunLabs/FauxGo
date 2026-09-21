import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { Page } from "@/components/page";
import { AppText } from "@/components/app-text";
import { ScreenHeader } from "@/components/screen-header";
import { Button } from "@/components/button";
import { Chip, ChipRow } from "@/components/commerce";
import { Icon } from "@/components/icon";
import { MapView } from "@/platform/map-view";
import { requestCurrentLocation } from "@/platform/location";
import {
  searchPlaces,
  placeSearchEnabled,
  placeSearchProvider,
} from "@/platform/geography";
import { manualPlace } from "@/core/location";
import { Coordinate, SavedPlace } from "@/core/models";
import { regions } from "@/core/regions";
import { getService } from "@/core/catalog";
import { useAppStore } from "@/store/app-store";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function LocationScreen() {
  const { returnService } = useLocalSearchParams<{ returnService?: string }>();
  const store = useAppStore();
  const theme = useAppTheme();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [label, setLabel] = useState("");
  const [coordinate, setCoordinate] = useState<Coordinate>(
    store.selectedPlace.coordinate,
  );
  const [kind, setKind] = useState<SavedPlace["kind"]>("custom");
  const [explain, setExplain] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [searchResults, setSearchResults] = useState<SavedPlace[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRequest = useRef<AbortController | null>(null);
  useEffect(() => () => searchRequest.current?.abort(), []);
  const searchAddresses = async () => {
    searchRequest.current?.abort();
    const controller = new AbortController();
    searchRequest.current = controller;
    setSearching(true);
    setMessage("");
    setSearchResults([]);
    try {
      const results = await searchPlaces(query, controller.signal);
      if (!controller.signal.aborted) {
        setSearchResults(results);
        if (!results.length)
          setMessage(
            "No address matches. Try a fuller address or select a point manually.",
          );
      }
    } catch {
      if (!controller.signal.aborted)
        setMessage(
          "Address search is unavailable. Saved places and map selection still work.",
        );
    } finally {
      if (!controller.signal.aborted) setSearching(false);
    }
  };
  const finish = (place: SavedPlace) => {
    if (returnService && getService(returnService))
      router.replace({
        pathname: "/service/[id]",
        params: { id: returnService, destination: JSON.stringify(place) },
      });
    else {
      store.selectPlace(place);
      if (router.canGoBack()) router.back();
      else router.replace("/");
    }
  };
  const locate = async () => {
    setBusy(true);
    setMessage("");
    const result = await requestCurrentLocation(
      store.preferences.preciseLocation,
    );
    setBusy(false);
    if (result.status === "success") {
      setCoordinate(result.place.coordinate);
      setQuery(result.place.address);
      setLabel("Current location");
      setMessage("Location found. Check the point below, then confirm.");
    } else setMessage(result.message);
  };
  const places = [
    ...new Map(
      [
        ...store.savedPlaces,
        ...store.recentPlaces,
        ...regions[store.preferences.region].places,
      ].map((place) => [place.id, place]),
    ).values(),
  ].filter((place) =>
    (place.label + " " + place.address)
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const inputStyle = {
    minHeight: 52,
    backgroundColor: theme.surfaceMuted,
    color: theme.ink,
    padding: 15,
    fontSize: 16,
    borderRadius: 12,
  };
  return (
    <Page testID="location-screen" contentStyle={{ maxWidth: 960 }}>
      <ScreenHeader
        title={returnService ? "Choose destination" : "Your location"}
        subtitle="Search saved places or choose a point on the map"
      />
      <TextInput
        accessibilityLabel="Search or enter address"
        placeholder="Search saved places or enter an address"
        placeholderTextColor={theme.muted}
        value={query}
        onChangeText={(text) => {
          searchRequest.current?.abort();
          setSearching(false);
          setSearchResults([]);
          setQuery(text);
        }}
        maxLength={180}
        style={inputStyle}
      />
      {placeSearchEnabled && (
        <View style={{ marginTop: 12, gap: 8 }}>
          <AppText variant="caption" color={theme.muted}>
            Search sends this address text to {placeSearchProvider}. Your saved
            location is not sent.
          </AppText>
          <Button
            label="Search addresses"
            variant="secondary"
            disabled={query.trim().length < 3}
            loading={searching}
            onPress={searchAddresses}
          />
        </View>
      )}
      {searchResults.map((place) => (
        <Pressable
          key={place.id}
          accessibilityRole="button"
          onPress={() => {
            setCoordinate(place.coordinate);
            setLabel(place.label);
            setQuery(place.address);
            setSearchResults([]);
            setMessage("Address found. Check the map point, then confirm.");
          }}
          style={{
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderColor: theme.border,
          }}
        >
          <AppText variant="bodyStrong">{place.label}</AppText>
          <AppText variant="caption" color={theme.muted}>
            {place.address}
          </AppText>
        </Pressable>
      ))}
      <Button
        label="Use my location"
        icon="crosshairs-gps"
        variant="quiet"
        onPress={() => setExplain(true)}
        style={{ alignSelf: "flex-start", marginVertical: 12 }}
      />
      {explain && (
        <View
          style={{
            backgroundColor: theme.surfaceMuted,
            borderRadius: 14,
            padding: 18,
            gap: 12,
            marginBottom: 18,
          }}
        >
          <AppText variant="bodyStrong">Find places around you</AppText>
          <AppText color={theme.muted}>
            FauxGo uses foreground location to set your pickup or delivery
            point. Your saved location stays on this device. Map providers
            receive the area you view; location is never used for ads or
            analytics. You can always choose manually.
          </AppText>
          <Button
            label="Continue with location"
            loading={busy}
            onPress={locate}
          />
          <Button
            label="Choose manually"
            variant="quiet"
            onPress={() => setExplain(false)}
          />
        </View>
      )}
      {!!message && (
        <AppText
          accessibilityRole="alert"
          style={{ marginBottom: 16 }}
          color={theme.muted}
        >
          {message}
        </AppText>
      )}
      {places.map((place) => (
        <Pressable
          key={place.id}
          accessibilityRole="button"
          onPress={() => finish(place)}
          style={{
            flexDirection: "row",
            gap: 14,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Icon
            name={
              place.kind === "home"
                ? "home-outline"
                : place.kind === "work"
                  ? "briefcase-outline"
                  : "map-marker-outline"
            }
          />
          <View style={{ flex: 1 }}>
            <AppText variant="bodyStrong">{place.label}</AppText>
            <AppText variant="caption" color={theme.muted}>
              {place.address}
            </AppText>
          </View>
          <Icon name="chevron-right" />
        </Pressable>
      ))}
      <View style={{ marginTop: 26, gap: 14 }}>
        <AppText variant="heading">Choose on map</AppText>
        <AppText variant="caption" color={theme.muted}>
          Tap the map to place the point. Typed addresses are labels, not
          verified geocoding results.
        </AppText>
        <MapView
          center={coordinate}
          position={coordinate}
          onPick={setCoordinate}
          height={350}
          reducedMotion={store.preferences.reducedMotion === "on"}
        />
        <AppText variant="caption" color={theme.muted}>
          {coordinate[1].toFixed(5)}, {coordinate[0].toFixed(5)}
        </AppText>
        <TextInput
          accessibilityLabel="Place label"
          placeholder="Name this place (optional)"
          placeholderTextColor={theme.muted}
          value={label}
          onChangeText={setLabel}
          maxLength={80}
          style={inputStyle}
        />
        <ChipRow>
          {(["custom", "home", "work"] as const).map((value) => (
            <Chip
              key={value}
              label={
                value === "custom"
                  ? "Custom"
                  : value === "home"
                    ? "Home"
                    : "Work"
              }
              selected={kind === value}
              onPress={() => setKind(value)}
            />
          ))}
        </ChipRow>
        <Button
          label="Confirm this location"
          onPress={() => {
            const place = manualPlace(
              label ||
                (kind === "custom"
                  ? "Selected place"
                  : kind === "home"
                    ? "Home"
                    : "Work"),
              query || "Selected map point",
              coordinate,
            );
            if (place) finish({ ...place, kind });
          }}
        />
        <Button
          label="Save this place"
          variant="secondary"
          onPress={() => {
            const place = manualPlace(
              label ||
                (kind === "custom"
                  ? "Saved place"
                  : kind === "home"
                    ? "Home"
                    : "Work"),
              query || "Selected map point",
              coordinate,
            );
            if (place) {
              store.savePlace({ ...place, kind });
              setMessage("Place saved on this device.");
            }
          }}
        />
      </View>
    </Page>
  );
}
