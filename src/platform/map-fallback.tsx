import { View } from "react-native";
import { AppText } from "@/components/app-text";
import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import { useAppTheme } from "@/hooks/use-app-theme";
import { MapProps } from "./map-types";
export function MapFallback({
  height = 400,
  route,
  onRetry,
}: MapProps & { onRetry?: () => void }) {
  const theme = useAppTheme();
  return (
    <View
      accessibilityRole="summary"
      style={{
        minHeight: height,
        borderRadius: 16,
        backgroundColor: theme.surfaceMuted,
        padding: 28,
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
      }}
    >
      <Icon name="map-outline" size={36} />
      <AppText variant="heading">Map unavailable</AppText>
      <AppText
        color={theme.muted}
        style={{ maxWidth: 400, textAlign: "center" }}
      >
        You can still choose saved places, book and follow progress. The map
        will return when a connection is available.
      </AppText>
      {route && (
        <AppText>
          {(route.distanceMeters / 1000).toFixed(1)} km ·{" "}
          {Math.ceil(route.durationSeconds / 60)} min route estimate
        </AppText>
      )}
      {onRetry && (
        <Button label="Retry map" variant="secondary" onPress={onRetry} />
      )}
    </View>
  );
}
