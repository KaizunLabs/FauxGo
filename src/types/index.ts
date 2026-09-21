export type ServiceKind =
  "food" | "grocery" | "ride" | "premium" | "courier" | "sky";
export type Service = {
  id: ServiceKind;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  color: string;
  kind: "commerce" | "mobility";
  startingPrice: number;
};
export type CatalogItem = {
  id: string;
  serviceId: "food" | "grocery";
  vendor: string;
  vendorId: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  eta: string;
  emoji: string;
  color: string;
  tags: string[];
};
export type MobilityOption = {
  id: string;
  serviceId: Exclude<ServiceKind, "food" | "grocery">;
  title: string;
  description: string;
  price: number;
  eta: string;
  icon: string;
};
export type CartLine = { itemId: string; quantity: number };
export type SimulationStage = {
  title: string;
  detail: string;
  offsetSeconds: number;
};
export type Simulation = {
  id: string;
  serviceId: ServiceKind;
  title: string;
  subtitle: string;
  total: number;
  createdAt: number;
  stages: SimulationStage[];
  origin: string;
  destination: string;
  operatorName: string;
  vehicle: string;
};
export type AppSettings = { haptics: boolean };
