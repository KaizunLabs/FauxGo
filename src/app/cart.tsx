import { useRouter } from "expo-router";
import { View } from "react-native";
import { Page } from "@/components/page";
import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { CatalogPhoto } from "@/components/catalog-photo";
import { Button } from "@/components/button";
import { PriceSummary, useMoney } from "@/components/commerce";
import { EmptyState } from "@/components/empty-state";
import { getCatalogItem, getMerchant } from "@/core/catalog";
import { quoteBasket } from "@/core/commerce";
import { itemUnitPrice } from "@/core/pricing";
import { cartLineKey } from "@/core/state";
import { useAppStore } from "@/store/app-store";
import { useAppTheme } from "@/hooks/use-app-theme";
export default function CartScreen() {
  const store = useAppStore();
  const theme = useAppTheme();
  const router = useRouter();
  const money = useMoney();
  const items = store.cart.flatMap((line) => getCatalogItem(line.itemId) ?? []);
  const merchant = getMerchant(items[0]?.merchantId);
  const quote = quoteBasket(store.cart, store.preferences.region);
  return (
    <Page testID="cart-screen" contentStyle={{ maxWidth: 800 }}>
      <ScreenHeader title="Your basket" subtitle={merchant?.name} />
      {!items.length ? (
        <EmptyState
          icon="shopping-outline"
          title="Good things go in here"
          description="Find a favorite dish or stock up on everyday essentials."
          actionLabel="Start exploring"
          onAction={() => router.replace("/")}
        />
      ) : (
        <>
          {store.cart.map((line) => {
            const item = getCatalogItem(line.itemId)!;
            const key = cartLineKey(line);
            return (
              <View
                key={key}
                style={{
                  flexDirection: "row",
                  gap: 16,
                  paddingVertical: 20,
                  borderBottomWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <CatalogPhoto
                  imageKey={item.imageKey}
                  size="thumb"
                  style={{ width: 80, height: 80, borderRadius: 12 }}
                />
                <View style={{ flex: 1, gap: 7 }}>
                  <AppText variant="bodyStrong">{item.title}</AppText>
                  <AppText variant="caption" color={theme.muted}>
                    {(item.optionGroups ?? [])
                      .flatMap((group) => group.options)
                      .filter((option) => line.optionIds.includes(option.id))
                      .map((option) => option.label)
                      .join(" · ")}
                  </AppText>
                  {Boolean(line.notes) && (
                    <AppText variant="caption" color={theme.muted}>
                      {line.notes}
                    </AppText>
                  )}
                  <AppText>
                    {money(itemUnitPrice(item, line, store.preferences.region))}{" "}
                    each
                  </AppText>
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 12,
                      alignItems: "center",
                      marginTop: 5,
                    }}
                  >
                    <Button
                      label="−"
                      accessibilityHint={"Remove one " + item.title}
                      variant="secondary"
                      onPress={() => store.setQuantity(key, line.quantity - 1)}
                    />
                    <AppText>{line.quantity}</AppText>
                    <Button
                      label="+"
                      accessibilityHint={"Add one " + item.title}
                      variant="secondary"
                      disabled={line.quantity === 25}
                      onPress={() => store.setQuantity(key, line.quantity + 1)}
                    />
                  </View>
                </View>
              </View>
            );
          })}
          <View style={{ marginVertical: 28 }}>
            <PriceSummary quote={quote} />
          </View>
          <Button
            label="Continue to checkout"
            onPress={() => router.push("/checkout")}
          />
          <Button
            label="Add more items"
            variant="quiet"
            onPress={() =>
              router.push({
                pathname: "/merchant/[id]",
                params: { id: merchant!.id },
              })
            }
            style={{ marginTop: 12 }}
          />
        </>
      )}
    </Page>
  );
}
