import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, View } from "react-native";
import { radii } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { ServiceKind } from "@/types";

export function FauxMap({
  progress,
  serviceId,
}: {
  progress: number;
  serviceId: ServiceKind;
}) {
  const theme = useAppTheme();
  const icon =
    serviceId === "food" || serviceId === "grocery" || serviceId === "courier"
      ? "bike-fast"
      : serviceId === "sky"
        ? "helicopter"
        : "car-side";
  return (
    <View
      accessibilityLabel={`Decorative fictional route map, ${Math.round(progress * 100)} percent complete`}
      style={[styles.map, { backgroundColor: theme.surfaceMuted }]}
    >
      <View style={[styles.park, { backgroundColor: theme.brandSoft }]} />
      <View
        style={[
          styles.block,
          styles.blockOne,
          { backgroundColor: theme.surface },
        ]}
      />
      <View
        style={[
          styles.block,
          styles.blockTwo,
          { backgroundColor: theme.surface },
        ]}
      />
      <View
        style={[
          styles.block,
          styles.blockThree,
          { backgroundColor: theme.surface },
        ]}
      />
      <View
        style={[
          styles.street,
          styles.streetOne,
          { backgroundColor: theme.canvas },
        ]}
      />
      <View
        style={[
          styles.street,
          styles.streetTwo,
          { backgroundColor: theme.canvas },
        ]}
      />
      <View style={[styles.route, { backgroundColor: theme.ink }]}>
        <View
          style={[
            styles.routeDone,
            {
              backgroundColor: theme.brand,
              width: `${Math.max(4, progress * 100)}%`,
            },
          ]}
        />
      </View>
      <View style={[styles.origin, { backgroundColor: theme.ink }]} />
      <View
        style={[
          styles.destination,
          { borderColor: theme.brand, backgroundColor: theme.surface },
        ]}
      />
      <View
        style={[
          styles.vehicle,
          { left: `${12 + progress * 72}%`, backgroundColor: theme.brand },
        ]}
      >
        <MaterialCommunityIcons name={icon} size={20} color={theme.surface} />
      </View>
      <View style={[styles.fiction, { backgroundColor: theme.surface }]}>
        <MaterialCommunityIcons name="theater" size={15} color={theme.brand} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  map: { height: 330, borderRadius: radii.lg, overflow: "hidden" },
  park: {
    position: "absolute",
    width: 150,
    height: 110,
    left: 28,
    top: 28,
    borderRadius: 55,
    transform: [{ rotate: "-12deg" }],
  },
  block: { position: "absolute", borderRadius: 18, opacity: 0.75 },
  blockOne: {
    width: 130,
    height: 70,
    right: 40,
    top: 28,
    transform: [{ rotate: "9deg" }],
  },
  blockTwo: {
    width: 180,
    height: 85,
    right: 80,
    bottom: 30,
    transform: [{ rotate: "-4deg" }],
  },
  blockThree: {
    width: 90,
    height: 100,
    left: 45,
    bottom: 20,
    transform: [{ rotate: "12deg" }],
  },
  street: { position: "absolute", width: "120%", height: 24, left: "-10%" },
  streetOne: { top: 150, transform: [{ rotate: "-7deg" }] },
  streetTwo: { top: 100, transform: [{ rotate: "35deg" }] },
  route: {
    position: "absolute",
    height: 7,
    width: "72%",
    left: "14%",
    top: "51%",
    borderRadius: 4,
    transform: [{ rotate: "-7deg" }],
  },
  routeDone: { height: 7, borderRadius: 4 },
  origin: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    left: "13%",
    top: "50%",
  },
  destination: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 5,
    right: "12%",
    top: "42%",
  },
  vehicle: {
    position: "absolute",
    width: 42,
    height: 42,
    borderRadius: 21,
    top: "42%",
    alignItems: "center",
    justifyContent: "center",
  },
  fiction: {
    position: "absolute",
    right: 14,
    top: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});
