import { useLocalSearchParams, useRouter } from "expo-router";
import { useDeferredValue, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { Page } from "@/components/page";
import { AppText } from "@/components/app-text";
import { Icon } from "@/components/icon";
import { Chip, ChipRow } from "@/components/commerce";
import { CatalogPhoto } from "@/components/catalog-photo";
import { Button } from "@/components/button";
import { searchCatalog, SearchResult } from "@/core/search";
import { useAppStore } from "@/store/app-store";
import { useAppTheme } from "@/hooks/use-app-theme";
import { regions } from "@/core/regions";

export default function Search() {
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(params.q ?? "");
  const [limit, setLimit] = useState(30);
  const deferred = useDeferredValue(query);
  const theme = useAppTheme();
  const store = useAppStore();
  const router = useRouter();
  const places = [
    ...store.savedPlaces,
    ...regions[store.preferences.region].places,
  ];
  const found = searchCatalog(
    deferred,
    store.preferences.region,
    places,
    0,
    limit,
  );
  const open = (result: SearchResult) => {
    if (result.target === "place") router.push("/location");
    else if (result.target === "item")
      router.push({ pathname: "/item/[id]", params: { id: result.id } });
    else if (result.target === "merchant")
      router.push({ pathname: "/merchant/[id]", params: { id: result.id } });
    else router.push({ pathname: "/service/[id]", params: { id: result.id } });
  };
  return (
    <Page testID="search-screen">
      <AppText variant="title">Find your next favorite</AppText>
      <View
        style={{
          marginTop: 22,
          marginBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: theme.surfaceMuted,
          borderRadius: 12,
          paddingHorizontal: 16,
        }}
      >
        <Icon name="magnify" />
        <TextInput
          accessibilityLabel="Search food, stores and places"
          placeholder="Food, stores, places and more"
          placeholderTextColor={theme.muted}
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setLimit(30);
          }}
          maxLength={120}
          style={{ flex: 1, minHeight: 56, color: theme.ink, fontSize: 16 }}
        />
        {Boolean(query) && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => setQuery("")}
            style={{ padding: 12 }}
          >
            <Icon name="close" />
          </Pressable>
        )}
      </View>
      {!query.trim() ? (
        <>
          <AppText variant="bodyStrong" style={{ marginTop: 24 }}>
            Popular searches
          </AppText>
          <ChipRow>
            {["Biryani", "Pizza", "Coffee", "Healthy", "Produce", "Ride"].map(
              (label) => (
                <Chip
                  key={label}
                  label={label}
                  onPress={() => setQuery(label)}
                />
              ),
            )}
          </ChipRow>
          <AppText color={theme.muted} style={{ marginTop: 24 }}>
            Search menus, original restaurants, everyday essentials and saved
            places.
          </AppText>
        </>
      ) : (
        <View
          accessibilityLiveRegion="polite"
          style={{ opacity: query !== deferred ? 0.6 : 1 }}
        >
          {found.results.length === 0 && (
            <View style={{ paddingVertical: 50, gap: 12 }}>
              <AppText variant="heading">No matches for “{query}”</AppText>
              <AppText color={theme.muted}>
                Try a cuisine, dish or shorter search.
              </AppText>
            </View>
          )}
          {(
            [
              "Restaurants",
              "Stores",
              "Dishes",
              "Products",
              "Services",
              "Places",
            ] as const
          ).map((group) => {
            const items = found.results.filter(
              (result) => result.group === group,
            );
            if (!items.length) return null;
            return (
              <View key={group} style={{ marginTop: 24 }}>
                <AppText variant="heading">{group}</AppText>
                {items.map((result) => (
                  <Pressable
                    key={result.id}
                    accessibilityRole="button"
                    onPress={() => open(result)}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 16,
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderColor: theme.border,
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    {result.imageKey ? (
                      <CatalogPhoto
                        imageKey={result.imageKey}
                        size="thumb"
                        style={{ width: 76, height: 68, borderRadius: 10 }}
                      />
                    ) : (
                      <Icon
                        name={
                          result.target === "place"
                            ? "map-marker-outline"
                            : "arrow-top-right"
                        }
                      />
                    )}
                    <View style={{ flex: 1, gap: 3 }}>
                      <AppText variant="bodyStrong">{result.title}</AppText>
                      <AppText variant="caption" color={theme.muted}>
                        {result.subtitle}
                      </AppText>
                    </View>
                    <Icon name="chevron-right" />
                  </Pressable>
                ))}
              </View>
            );
          })}
          {found.hasMore && (
            <Button
              label="Show more results"
              variant="secondary"
              style={{ marginTop: 24 }}
              onPress={() => setLimit(limit + 30)}
            />
          )}
        </View>
      )}
    </Page>
  );
}
