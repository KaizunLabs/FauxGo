import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import { Page } from "@/components/page";
import { ScreenHeader } from "@/components/screen-header";
import { AppText } from "@/components/app-text";
import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { PriceSummary, Chip, ChipRow } from "@/components/commerce";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { MapView } from "@/platform/map-view";
import { deriveSnapshot } from "@/core/timeline";
import { getRouteMapPresentation, interpolateRoute } from "@/core/route";
import { useClock } from "@/hooks/use-clock";
import { useAppStore } from "@/store/app-store";
import { useAppTheme } from "@/hooks/use-app-theme";
export default function TrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useAppStore();
  const theme = useAppTheme();
  const router = useRouter();
  const now = useClock(500);
  const { width } = useWindowDimensions();
  const [receipt, setReceipt] = useState(false);
  const [message, setMessage] = useState("");
  const [remove, setRemove] = useState(false);
  const simulation = store.simulations.find((item) => item.id === id);
  if (!simulation)
    return (
      <Page>
        <ScreenHeader title="Activity unavailable" />
        <EmptyState
          icon="clock-outline"
          title="This activity isn’t on this device"
          description="It may have been deleted or created on another device."
          actionLabel="View activity"
          onAction={() => router.replace("/activity")}
        />
      </Page>
    );
  const snapshot = deriveSnapshot(simulation, now);
  const point = interpolateRoute(simulation.route, snapshot.routeProgress);
  const mapPresentation = getRouteMapPresentation(
    simulation.route,
    simulation.serviceType,
  );
  const anchorStages = simulation.stages.filter(
    (stage) =>
      stage.anchor ===
      (simulation.manualStartedAt !== undefined ? "manual-start" : "created"),
  );
  const remaining = Math.max(
    0,
    Math.ceil(
      (anchorStages.at(-1)?.offsetSeconds ?? 0) - snapshot.elapsedSeconds,
    ),
  );
  const eta = snapshot.awaitingManualStart
    ? "Ready when you are"
    : snapshot.complete
      ? "All done"
      : remaining < 60
        ? "Less than a minute"
        : Math.ceil(remaining / 60) + " min remaining";
  return (
    <Page testID="tracking-screen">
      <ScreenHeader
        title={simulation.title}
        subtitle={snapshot.complete ? "Completed" : "In progress"}
      />
      <View
        style={{ flexDirection: width >= 1024 ? "row" : "column", gap: 24 }}
      >
        <View style={{ flex: width >= 1024 ? 1.6 : undefined }}>
          <MapView
            center={simulation.origin.coordinate}
            route={simulation.route}
            position={point.coordinate}
            heading={point.heading}
            approximate={mapPresentation.approximate}
            showVehicle={mapPresentation.showVehicle}
            height={width >= 1024 ? 620 : 360}
            reducedMotion={store.preferences.reducedMotion === "on"}
          />
          {mapPresentation.approximate && (
            <AppText
              variant="caption"
              color={theme.muted}
              style={{ marginTop: 10 }}
            >
              Approximate route shown. Vehicle position is hidden because road
              routing is unavailable offline.
            </AppText>
          )}
        </View>
        <View style={{ flex: 1, gap: 20 }}>
          <View accessibilityLiveRegion="polite">
            <AppText
              variant="caption"
              color={theme.brand}
              style={{ fontWeight: "700" }}
            >
              {eta}
            </AppText>
            <AppText variant="title" style={{ marginTop: 8 }}>
              {snapshot.stage.title}
            </AppText>
            <AppText color={theme.muted} style={{ marginTop: 10 }}>
              {snapshot.stage.detail}
            </AppText>
          </View>
          {snapshot.awaitingManualStart && (
            <Button
              label={snapshot.stage.manualActionLabel ?? "Start journey"}
              onPress={() => store.startJourney(id)}
            />
          )}
          <View
            style={{
              paddingVertical: 18,
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: theme.border,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
            }}
          >
            <View
              style={{
                backgroundColor: theme.surfaceMuted,
                width: 52,
                height: 52,
                borderRadius: 26,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AppText variant="heading">{simulation.operator.name[0]}</AppText>
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyStrong">
                {simulation.operator.name} ·{" "}
                {simulation.operator.rating.toFixed(1)}
              </AppText>
              <AppText variant="caption" color={theme.muted}>
                {simulation.operator.vehicleColor} {simulation.operator.vehicle}
              </AppText>
              <AppText variant="caption">{simulation.operator.plate}</AppText>
            </View>
            <Icon name={simulation.vehicle.icon} size={36} />
          </View>
          {!snapshot.complete && (
            <View style={{ gap: 8 }}>
              <AppText variant="bodyStrong">Quick messages</AppText>
              <ChipRow>
                {["I’m here", "Take your time", "Thanks"].map((text) => (
                  <Chip
                    key={text}
                    label={text}
                    onPress={() =>
                      setMessage(
                        text === "I’m here"
                          ? "Great, I’ll meet you at the selected point."
                          : text === "Thanks"
                            ? "You’re welcome. Enjoy the rest of your day."
                            : "Thanks for letting me know. I’m on my way.",
                      )
                    }
                  />
                ))}
              </ChipRow>
              {!!message && (
                <View
                  accessibilityLiveRegion="polite"
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    backgroundColor: theme.surfaceMuted,
                  }}
                >
                  <AppText variant="caption">
                    {simulation.operator.name}: {message}
                  </AppText>
                </View>
              )}
            </View>
          )}
          <View style={{ gap: 14 }}>
            <View>
              <AppText variant="caption" color={theme.muted}>
                Pickup
              </AppText>
              <AppText variant="bodyStrong">{simulation.origin.label}</AppText>
            </View>
            <View>
              <AppText variant="caption" color={theme.muted}>
                Destination
              </AppText>
              <AppText variant="bodyStrong">
                {simulation.destination.label}
              </AppText>
              <AppText variant="caption" color={theme.muted}>
                {simulation.destination.address}
              </AppText>
            </View>
          </View>
          {snapshot.complete && (
            <View style={{ gap: 12 }}>
              <AppText variant="heading">How was the experience?</AppText>
              <View style={{ flexDirection: "row", gap: 6 }}>
                {([1, 2, 3, 4, 5] as const).map((score) => (
                  <Pressable
                    key={score}
                    accessibilityRole="button"
                    accessibilityLabel={score + " star rating"}
                    accessibilityState={{
                      selected: simulation.rating?.score === score,
                    }}
                    onPress={() =>
                      store.rateSimulation(id, {
                        score,
                        tags: [],
                        createdAt: Date.now(),
                      })
                    }
                    style={{ padding: 8 }}
                  >
                    <Icon
                      name={
                        score <= (simulation.rating?.score ?? 0)
                          ? "star"
                          : "star-outline"
                      }
                      color={theme.brand}
                      size={30}
                    />
                  </Pressable>
                ))}
              </View>
              {simulation.rating && (
                <AppText variant="caption" color={theme.muted}>
                  Thanks. Your rating is saved on this device.
                </AppText>
              )}
              <Button
                label="Explore again"
                onPress={() => router.replace("/")}
              />
            </View>
          )}
          <Button
            label={receipt ? "Hide receipt" : "View receipt & timeline"}
            variant="secondary"
            onPress={() => setReceipt(!receipt)}
          />
        </View>
      </View>
      {receipt && (
        <View style={{ maxWidth: 800, marginTop: 32, gap: 24 }}>
          <AppText variant="heading">Receipt</AppText>
          <PriceSummary quote={simulation.quote} />
          <AppText variant="caption" color={theme.muted}>
            Entertainment simulation receipt. No real payment, order, ride or
            delivery was created. People and service activity are fictional.
            Quick messages are scripted local replies and never contact anyone.
          </AppText>
          <AppText variant="caption" color={theme.muted}>
            {simulation.quote.explanation}
          </AppText>
          <AppText variant="heading">Timeline</AppText>
          {simulation.stages.map((stage, index) => (
            <View key={stage.id} style={{ flexDirection: "row", gap: 12 }}>
              <Icon
                name={
                  index <= snapshot.stageIndex
                    ? "check-circle"
                    : "circle-outline"
                }
                color={index <= snapshot.stageIndex ? theme.brand : theme.muted}
                size={20}
              />
              <View style={{ flex: 1 }}>
                <AppText variant="bodyStrong">{stage.title}</AppText>
                <AppText variant="caption" color={theme.muted}>
                  {stage.detail}
                </AppText>
              </View>
            </View>
          ))}
          <Button
            label="Delete activity"
            variant="quiet"
            onPress={() => setRemove(true)}
          />
        </View>
      )}
      <ConfirmDialog
        visible={remove}
        title="Delete this activity?"
        description="This removes its receipt and progress from this device. It cannot be undone."
        confirmLabel="Delete activity"
        onCancel={() => setRemove(false)}
        onConfirm={() => {
          store.deleteSimulation(id);
          router.replace("/activity");
        }}
      />
    </Page>
  );
}
