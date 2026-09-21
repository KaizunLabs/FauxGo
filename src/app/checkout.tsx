import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import {
  getCatalogItem,
  getMerchant,
  getService,
  getVehicle,
  getVehicles,
} from "@/core/catalog";
import { quoteBasket } from "@/core/commerce";
import { normalizePlace } from "@/core/state";
import { useRoute } from "@/hooks/use-route";
import { calculateMobilityPrice } from "@/core/pricing";
import {
  createSimulation,
  createSimulationId,
  nearbyOrigin,
} from "@/core/simulation";
import { paymentMethodsFor } from "@/core/payments";
import { Page } from "@/components/page";
import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { PriceSummary } from "@/components/commerce";
import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { EmptyState } from "@/components/empty-state";
import { useAppStore } from "@/store/app-store";
import { useAppTheme } from "@/hooks/use-app-theme";
export default function CheckoutScreen() {
  const params = useLocalSearchParams<{
    service?: string;
    vehicle?: string;
    destination?: string;
  }>();
  const store = useAppStore();
  const theme = useAppTheme();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const submitting = useRef(false);
  const service = getService(params.service ?? store.cartService ?? undefined);
  const merchant = getMerchant(
    getCatalogItem(store.cart[0]?.itemId)?.merchantId,
  );
  const commerce = service?.kind === "commerce";
  let destination = commerce ? store.selectedPlace : undefined;
  if (!commerce) {
    try {
      destination = normalizePlace(JSON.parse(params.destination ?? "null"));
    } catch {
      /* A malformed link remains non-actionable. */
    }
  }
  const origin = commerce
    ? nearbyOrigin(store.selectedPlace, merchant?.id ?? "pickup")
    : store.selectedPlace;
  const vehicle = commerce
    ? getVehicle("send-cycle")
    : getVehicle(params.vehicle);
  const routing = useRoute(
    origin.coordinate,
    destination?.coordinate,
    service?.id !== "air",
  );
  const valid =
    service &&
    destination &&
    vehicle &&
    (commerce
      ? store.cart.length > 0 && merchant
      : getVehicles(service.id, store.preferences.region).some(
          (item) => item.id === vehicle.id,
        )) &&
    (origin.coordinate[0] !== destination.coordinate[0] ||
      origin.coordinate[1] !== destination.coordinate[1]);
  if (!valid || !service || !destination || !vehicle || !routing.route)
    return (
      <Page>
        <ScreenHeader title="Review details" />
        <EmptyState
          icon="clipboard-text-outline"
          title="A few details are missing"
          description="Choose your items or route before continuing."
          actionLabel="Back to Home"
          onAction={() => router.replace("/")}
        />
      </Page>
    );
  const route = routing.route;
  const quote = commerce
    ? quoteBasket(store.cart, store.preferences.region)
    : calculateMobilityPrice({
        region: store.preferences.region,
        vehicle,
        distanceMeters: route.distanceMeters,
        durationSeconds: route.durationSeconds,
        seed: route.id,
      });
  const methods = paymentMethodsFor(store.preferences.region, service.id);
  const selected =
    methods.find((method) => method.id === store.paymentMethodId) ?? methods[0];
  const confirm = () => {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const id = createSimulationId();
      const simulation = createSimulation({
        id,
        serviceType: service.id,
        title: commerce ? merchant!.name : vehicle.title,
        subtitle: commerce
          ? store.cart.reduce((sum, line) => sum + line.quantity, 0) + " items"
          : destination.label,
        region: store.preferences.region,
        pace: store.preferences.pace,
        origin,
        destination,
        vehicleId: vehicle.id,
        quote,
        route,
        itemCount: commerce
          ? store.cart.reduce((sum, line) => sum + line.quantity, 0)
          : undefined,
      });
      if (service.id === "send")
        simulation.packageDescription = packageDescription;
      simulation.paymentMethodId = selected.id;
      store.addSimulation(simulation);
      store.haptic();
      router.replace({ pathname: "/tracking/[id]", params: { id } });
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not confirm. Please try again.",
      );
      submitting.current = false;
      setBusy(false);
    }
  };
  return (
    <Page testID="checkout-screen" contentStyle={{ maxWidth: 800 }}>
      <ScreenHeader
        title={commerce ? "Checkout" : "Review booking"}
        subtitle={service.title}
      />
      <View style={{ gap: 6, marginBottom: 24 }}>
        <AppText variant="heading">
          {commerce ? merchant!.name : vehicle.title}
        </AppText>
        <AppText color={theme.muted}>
          {commerce ? "Deliver to" : "Pickup"} ·{" "}
          {commerce ? destination.label : origin.label}
        </AppText>
        <AppText color={theme.muted}>
          {commerce ? destination.address : "Dropoff · " + destination.label}
        </AppText>
        <Button
          label={commerce ? "Change delivery location" : "Change pickup"}
          variant="quiet"
          onPress={() => router.push("/location")}
          style={{ alignSelf: "flex-start" }}
        />
      </View>
      {service.id === "send" && (
        <View style={{ gap: 10, marginBottom: 24 }}>
          <AppText variant="bodyStrong">Package description</AppText>
          <TextInput
            accessibilityLabel="Package description"
            value={packageDescription}
            onChangeText={setPackageDescription}
            maxLength={240}
            placeholder="For example, a small box of books"
            placeholderTextColor={theme.muted}
            style={{
              minHeight: 52,
              backgroundColor: theme.surfaceMuted,
              color: theme.ink,
              padding: 14,
              borderRadius: 12,
            }}
          />
        </View>
      )}
      <AppText variant="heading" style={{ marginBottom: 12 }}>
        Payment method
      </AppText>
      <AppText variant="caption" color={theme.muted}>
        Select a demo method. No account details are needed.
      </AppText>
      <View style={{ marginBottom: 30 }}>
        {methods.map((method) => (
          <Pressable
            key={method.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected.id === method.id }}
            onPress={() => store.selectPayment(method.id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              paddingVertical: 18,
              borderBottomWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Icon name={method.icon} />
            <View style={{ flex: 1 }}>
              <AppText variant="bodyStrong">{method.title}</AppText>
              <AppText variant="caption" color={theme.muted}>
                {method.detail}
              </AppText>
            </View>
            <Icon
              name={
                selected.id === method.id ? "radiobox-marked" : "radiobox-blank"
              }
              color={selected.id === method.id ? theme.brand : theme.muted}
            />
          </Pressable>
        ))}
      </View>
      <PriceSummary quote={quote} />
      <View style={{ marginTop: 28, gap: 14 }}>
        <AppText variant="caption" color={theme.muted}>
          No real payment, order, ride or delivery will be created.
        </AppText>
        {!!error && (
          <AppText accessibilityRole="alert" color={theme.danger}>
            {error}
          </AppText>
        )}
        <Button
          label={
            commerce
              ? "Place order"
              : service.id === "air"
                ? "Confirm flight"
                : service.id === "send"
                  ? "Confirm courier"
                  : "Confirm ride"
          }
          onPress={confirm}
          loading={busy || routing.loading}
        />
      </View>
    </Page>
  );
}
