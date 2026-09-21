import * as Location from "expo-location";
import { requestForegroundLocation } from "@/core/location";

export const requestCurrentLocation = (precise: boolean) =>
  requestForegroundLocation(
    {
      requestPermission: async () =>
        (await Location.requestForegroundPermissionsAsync()).granted,
      currentPosition: async (usePrecise) => {
        const result = await Location.getCurrentPositionAsync({
          accuracy: usePrecise
            ? Location.Accuracy.High
            : Location.Accuracy.Balanced,
        });
        return [result.coords.longitude, result.coords.latitude];
      },
    },
    precise,
  );

export async function locationPermissionStatus() {
  try {
    return (await Location.getForegroundPermissionsAsync()).status;
  } catch {
    return "unavailable";
  }
}
