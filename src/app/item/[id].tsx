import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { getCatalogItem, getMerchant } from "@/core/catalog";
import { Page } from "@/components/page";
import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { CatalogPhoto } from "@/components/catalog-photo";
import { Button } from "@/components/button";
import { Chip, ChipRow, useMoney } from "@/components/commerce";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAppStore } from "@/store/app-store";
import { useAppTheme } from "@/hooks/use-app-theme";
export default function ItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = getCatalogItem(id);
  const store = useAppStore();
  const theme = useAppTheme();
  const router = useRouter();
  const money = useMoney();
  const [options, setOptions] = useState<string[]>(
    item?.optionGroups
      ?.filter((group) => group.required)
      .map((group) => group.options[0].id) ?? [],
  );
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [substitution, setSubstitution] = useState("best-match");
  const [replace, setReplace] = useState(false);
  if (!item)
    return (
      <Page>
        <ScreenHeader title="Item unavailable" />
        <EmptyState
          icon="silverware-fork-knife"
          title="This item is no longer available"
          description="Browse the current menu to choose something else."
          actionLabel="Explore"
          onAction={() => router.replace("/")}
        />
      </Page>
    );
  const merchant = getMerchant(item.merchantId)!;
  const delta = (item.optionGroups ?? [])
    .flatMap((group) => group.options)
    .filter((option) => options.includes(option.id))
    .reduce(
      (sum, option) =>
        sum + (option.priceDeltaMinor[store.preferences.region] ?? 0),
      0,
    );
  const add = () => {
    store.addToCart({
      itemId: item.id,
      quantity,
      optionIds: options,
      substitution,
      notes,
    });
    store.haptic();
    router.replace({ pathname: "/merchant/[id]", params: { id: merchant.id } });
  };
  const reviewAdd = () => {
    const currentMerchant = getCatalogItem(store.cart[0]?.itemId)?.merchantId;
    if (currentMerchant && currentMerchant !== merchant.id) setReplace(true);
    else add();
  };
  return (
    <Page testID="item-screen" contentStyle={{ maxWidth: 780 }}>
      <ScreenHeader title={merchant.name} />
      <CatalogPhoto
        imageKey={item.imageKey}
        size="hero"
        style={{
          width: "100%",
          height: 290,
          aspectRatio: undefined,
          borderRadius: 18,
        }}
      />
      <View style={{ marginTop: 24, gap: 12 }}>
        <AppText variant="title">{item.title}</AppText>
        <AppText color={theme.muted}>{item.description}</AppText>
        <AppText variant="heading">
          {money(item.priceMinor[store.preferences.region])}
        </AppText>
        {Boolean(item.dietary) && (
          <AppText variant="caption" color={theme.muted}>
            {item.dietary}
          </AppText>
        )}
      </View>
      {(item.optionGroups ?? []).map((group) => (
        <View key={group.id} style={{ marginTop: 28, gap: 8 }}>
          <AppText variant="heading">{group.label}</AppText>
          <AppText variant="caption" color={theme.muted}>
            {group.required ? "Required" : "Optional"} · Choose{" "}
            {group.maximum === 1 ? "one" : "up to " + group.maximum}
          </AppText>
          {group.options.map((option) => {
            const selected = options.includes(option.id);
            return (
              <Pressable
                key={option.id}
                accessibilityRole={group.maximum === 1 ? "radio" : "checkbox"}
                accessibilityState={{ checked: selected }}
                onPress={() =>
                  setOptions((current) => {
                    const outside = current.filter(
                      (id) => !group.options.some((entry) => entry.id === id),
                    );
                    const within = current.filter((id) =>
                      group.options.some((entry) => entry.id === id),
                    );
                    return group.maximum === 1
                      ? [...outside, option.id]
                      : selected
                        ? current.filter((id) => id !== option.id)
                        : within.length < group.maximum
                          ? [...current, option.id]
                          : current;
                  })
                }
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: group.maximum === 1 ? 11 : 5,
                    borderWidth: selected ? 6 : 1,
                    borderColor: selected ? theme.brand : theme.muted,
                  }}
                />
                <AppText style={{ flex: 1 }}>{option.label}</AppText>
                <AppText>
                  {option.priceDeltaMinor[store.preferences.region]
                    ? "+" +
                      money(option.priceDeltaMinor[store.preferences.region]!)
                    : "Included"}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      ))}
      {item.serviceType === "market" && (
        <View style={{ marginTop: 24 }}>
          <AppText variant="heading">If unavailable</AppText>
          <ChipRow>
            <Chip
              label="Best match"
              selected={substitution === "best-match"}
              onPress={() => setSubstitution("best-match")}
            />
            <Chip
              label="Remove item"
              selected={substitution === "refund"}
              onPress={() => setSubstitution("refund")}
            />
          </ChipRow>
        </View>
      )}
      <View style={{ marginTop: 28, gap: 10 }}>
        <AppText variant="bodyStrong">Item notes</AppText>
        <TextInput
          accessibilityLabel="Item notes"
          placeholder="Preferences for this item (optional)"
          placeholderTextColor={theme.muted}
          maxLength={240}
          multiline
          value={notes}
          onChangeText={setNotes}
          style={{
            minHeight: 80,
            borderRadius: 12,
            backgroundColor: theme.surfaceMuted,
            padding: 16,
            color: theme.ink,
            fontSize: 16,
          }}
        />
        <AppText variant="caption" color={theme.muted}>
          Don’t include contact or payment information.
        </AppText>
      </View>
      <View
        style={{
          marginTop: 24,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <AppText variant="bodyStrong">Quantity</AppText>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <Button
            label="−"
            accessibilityHint="Decrease quantity"
            variant="secondary"
            disabled={quantity === 1}
            onPress={() => setQuantity(quantity - 1)}
          />
          <AppText variant="bodyStrong">{quantity}</AppText>
          <Button
            label="+"
            accessibilityHint="Increase quantity"
            variant="secondary"
            disabled={quantity === 25}
            onPress={() => setQuantity(quantity + 1)}
          />
        </View>
      </View>
      <Button
        label={
          "Add to basket · " +
          money((item.priceMinor[store.preferences.region] + delta) * quantity)
        }
        disabled={!item.available}
        onPress={reviewAdd}
        style={{ marginTop: 24 }}
      />
      <ConfirmDialog
        visible={replace}
        title="Start a new basket?"
        description={
          "Your current basket is from another place. Replace it with items from " +
          merchant.name +
          "?"
        }
        confirmLabel="Replace basket"
        cancelLabel="Keep basket"
        onCancel={() => setReplace(false)}
        onConfirm={add}
      />
    </Page>
  );
}
