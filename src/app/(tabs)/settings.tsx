import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Switch, View } from "react-native";
import { AppText } from "@/components/app-text";
import { Button } from "@/components/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Page } from "@/components/page";
import { Chip, ChipRow } from "@/components/commerce";
import { Icon } from "@/components/icon";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAppStore } from "@/store/app-store";
import { regions } from "@/core/regions";
import { RegionCode, UserPreference } from "@/core/models";
import { exportLocalData } from "@/platform/export-data";
import { requestNotificationPermission } from "@/platform/notifications";
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const theme = useAppTheme();
  return (
    <View
      style={{
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderColor: theme.border,
        gap: 10,
      }}
    >
      <AppText variant="heading">{title}</AppText>
      {Boolean(description) && (
        <AppText variant="caption" color={theme.muted}>
          {description}
        </AppText>
      )}
      {children}
    </View>
  );
}
function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const theme = useAppTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        minHeight: 52,
      }}
    >
      <AppText style={{ flex: 1 }}>{label}</AppText>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        trackColor={{ true: theme.brand, false: theme.border }}
      />
    </View>
  );
}
export default function SettingsScreen() {
  const store = useAppStore();
  const theme = useAppTheme();
  const router = useRouter();
  const preferences = store.preferences;
  const [confirm, setConfirm] = useState<"reset" | "history" | null>(null);
  const [message, setMessage] = useState("");
  const [region, setRegion] = useState<RegionCode | null>(null);
  const update = (patch: Partial<UserPreference>) =>
    store.updatePreferences(patch);
  return (
    <Page testID="settings-screen" contentStyle={{ maxWidth: 900 }}>
      <AppText variant="title">Settings</AppText>
      <AppText color={theme.muted} style={{ marginTop: 8 }}>
        Your experience, your way. Saved on this device.
      </AppText>
      {!!message && (
        <View
          accessibilityRole="alert"
          style={{
            padding: 16,
            marginTop: 18,
            borderRadius: 12,
            backgroundColor: theme.surfaceMuted,
          }}
        >
          <AppText>{message}</AppText>
        </View>
      )}
      <Section title="Appearance">
        <ChipRow>
          {(["light", "dark", "system"] as const).map((appearance) => (
            <Chip
              key={appearance}
              label={appearance[0].toUpperCase() + appearance.slice(1)}
              selected={preferences.appearance === appearance}
              onPress={() => update({ appearance })}
            />
          ))}
        </ChipRow>
        <Toggle
          label="Expanded desktop navigation"
          value={preferences.sidebarExpanded}
          onChange={(sidebarExpanded) => update({ sidebarExpanded })}
        />
      </Section>
      <Section
        title="Region & display"
        description="Region changes menus, vehicles and payment choices. Display currency uses fixed reference conversions, not live exchange rates."
      >
        <ChipRow>
          {(Object.keys(regions) as RegionCode[]).map((code) => (
            <Chip
              key={code}
              label={regions[code].label}
              selected={preferences.region === code}
              onPress={() =>
                store.cart.length && preferences.region !== code
                  ? setRegion(code)
                  : update({ region: code })
              }
            />
          ))}
        </ChipRow>
        <AppText variant="bodyStrong">Display currency</AppText>
        <ChipRow>
          {(["INR", "USD", "GBP"] as const).map((currency) => (
            <Chip
              key={currency}
              label={currency}
              selected={preferences.currency === currency}
              onPress={() => update({ currency })}
            />
          ))}
        </ChipRow>
        <AppText variant="bodyStrong">Distance units</AppText>
        <ChipRow>
          {(["km", "mi"] as const).map((units) => (
            <Chip
              key={units}
              label={units === "km" ? "Kilometers" : "Miles"}
              selected={preferences.units === units}
              onPress={() => update({ units })}
            />
          ))}
        </ChipRow>
      </Section>
      <Section
        title="Locations"
        description="Foreground only. No background tracking. Saved coordinates stay on this device; maps request tiles for the area you view."
      >
        <Button
          label="Manage your locations"
          icon="map-marker-outline"
          variant="secondary"
          onPress={() => router.push("/location")}
        />
        <Toggle
          label="Use precise foreground location"
          value={preferences.preciseLocation}
          onChange={(preciseLocation) => update({ preciseLocation })}
        />
        {store.savedPlaces.map((place) => (
          <View
            key={place.id}
            style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
          >
            <View style={{ flex: 1 }}>
              <AppText variant="bodyStrong">{place.label}</AppText>
              <AppText variant="caption" color={theme.muted}>
                {place.address}
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={"Delete " + place.label}
              onPress={() => store.deletePlace(place.id)}
              style={{ padding: 12 }}
            >
              <Icon name="delete-outline" />
            </Pressable>
          </View>
        ))}
      </Section>
      <Section
        title="Pace & feedback"
        description="Pace applies to new journeys. Rides and flights wait for you to start."
      >
        <ChipRow>
          {(["quick", "relaxed", "realtime"] as const).map((pace) => (
            <Chip
              key={pace}
              label={
                pace === "realtime"
                  ? "Real time"
                  : pace === "quick"
                    ? "Quick"
                    : "Relaxed"
              }
              selected={preferences.pace === pace}
              onPress={() => update({ pace })}
            />
          ))}
        </ChipRow>
        <Toggle
          label="Haptic feedback"
          value={preferences.haptics}
          onChange={(haptics) => update({ haptics })}
        />
        <AppText variant="bodyStrong">Reduced motion</AppText>
        <ChipRow>
          {(["system", "on", "off"] as const).map((reducedMotion) => (
            <Chip
              key={reducedMotion}
              label={reducedMotion[0].toUpperCase() + reducedMotion.slice(1)}
              selected={preferences.reducedMotion === reducedMotion}
              onPress={() => update({ reducedMotion })}
            />
          ))}
        </ChipRow>
      </Section>
      <Section
        title="Notifications"
        description="Local progress updates. No push token or account is needed."
      >
        {Boolean(store.notificationError) && (
          <AppText accessibilityRole="alert" color={theme.brand}>
            {store.notificationError}
          </AppText>
        )}
        <Toggle
          label="Journey notifications"
          value={preferences.notifications}
          onChange={async (enabled) => {
            if (!enabled) return update({ notifications: false });
            const result = await requestNotificationPermission();
            update({ notifications: result.granted });
            setMessage(result.message);
          }}
        />
        <Toggle
          label="Delivery updates"
          value={preferences.deliveryNotifications}
          onChange={(deliveryNotifications) =>
            update({ deliveryNotifications })
          }
        />
        <Toggle
          label="Ride updates"
          value={preferences.rideNotifications}
          onChange={(rideNotifications) => update({ rideNotifications })}
        />
        <Toggle
          label="Notification sound"
          value={preferences.sound}
          onChange={(sound) => update({ sound })}
        />
        <AppText variant="caption" color={theme.muted}>
          Device notification and silent-mode settings take precedence.
        </AppText>
      </Section>
      <Section
        title="Privacy & data"
        description="Guest mode is complete. No account, payment information or analytics tracking is required. Exports may include your saved addresses; share them carefully."
      >
        <Button
          label="Export local data"
          variant="secondary"
          onPress={async () => {
            try {
              await exportLocalData(store.exportData());
              setMessage("Export prepared. Keep your saved addresses private.");
            } catch {
              setMessage("Could not export data. Please try again.");
            }
          }}
        />
        <Button
          label="Clear activity history"
          variant="quiet"
          onPress={() => setConfirm("history")}
        />
        <Button
          label="Delete all local data"
          variant="quiet"
          onPress={() => setConfirm("reset")}
        />
      </Section>
      <Section
        title="Advertising"
        description="Advertising is disabled in this release. No ad SDK is initialized, and location is never used for ads."
      >
        <AppText variant="caption" color={theme.muted}>
          Ad consent: disabled
        </AppText>
      </Section>
      <Section
        title="About FauxGo"
        description="An independent entertainment simulation. No real payment, order, ride or delivery can be created."
      >
        <AppText variant="caption" color={theme.muted}>
          Version 1.0.0 · Open source · MIT license
        </AppText>
        {[
          ["privacy", "Privacy"],
          ["terms", "Terms & simulation disclosure"],
          ["licenses", "Open-source licenses"],
        ].map(([document, label]) => (
          <Button
            key={document}
            label={label}
            variant="quiet"
            onPress={() =>
              router.push({
                pathname: "/legal/[document]",
                params: { document },
              })
            }
          />
        ))}
      </Section>
      <ConfirmDialog
        visible={confirm !== null}
        title={
          confirm === "reset"
            ? "Delete all local data?"
            : "Clear activity history?"
        }
        description={
          confirm === "reset"
            ? "This permanently removes saved places, history, basket and preferences from this device."
            : "This permanently removes all receipts and journey progress from this device."
        }
        confirmLabel="Delete data"
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          if (confirm === "history") {
            store.clearHistory();
            setConfirm(null);
          } else {
            try {
              await store.resetAll();
              setConfirm(null);
              router.replace("/onboarding");
            } catch {
              setMessage("Data could not be deleted. Please try again.");
              setConfirm(null);
            }
          }
        }}
      />
      <ConfirmDialog
        visible={region !== null}
        title="Change region?"
        description="Your current basket will be cleared because it belongs to another regional catalog. Saved places and history will be kept."
        confirmLabel="Change region"
        cancelLabel="Keep region"
        onCancel={() => setRegion(null)}
        onConfirm={() => {
          if (region) update({ region });
          setRegion(null);
        }}
      />
    </Page>
  );
}
