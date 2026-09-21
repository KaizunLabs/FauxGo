import { Coordinate, Route } from "@/core/models";
export type MapProps = {
  center: Coordinate;
  route?: Route;
  position?: Coordinate;
  heading?: number;
  approximate?: boolean;
  showVehicle?: boolean;
  onPick?: (coordinate: Coordinate) => void;
  height?: number;
  reducedMotion?: boolean;
};
export const mapStyleURL =
  process.env.EXPO_PUBLIC_MAP_STYLE_URL ||
  "https://tiles.openfreemap.org/styles/positron";
export const routeGeoJSON = (
  route: Route,
): GeoJSON.Feature<GeoJSON.LineString> => ({
  type: "Feature",
  properties: {},
  geometry: {
    type: "LineString",
    coordinates: route.points.map((point) => [...point]),
  },
});
export const routeBounds = (route: Route): [number, number, number, number] => [
  Math.min(...route.points.map((point) => point[0])),
  Math.min(...route.points.map((point) => point[1])),
  Math.max(...route.points.map((point) => point[0])),
  Math.max(...route.points.map((point) => point[1])),
];
