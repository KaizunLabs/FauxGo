import { RegionCode, ServiceType } from "./models";

export type DemoPaymentMethod = {
  id:
    | "demo-card-4242"
    | "demo-card-4444"
    | "demo-upi"
    | "demo-wallet"
    | "demo-cash";
  title: string;
  detail: string;
  icon: "credit-card-outline" | "wallet-outline" | "cash" | "bank-transfer";
  regions: RegionCode[];
};

export const demoPaymentMethods: DemoPaymentMethod[] = [
  {
    id: "demo-card-4242",
    title: "Card •••• 4242",
    detail: "Demo card",
    icon: "credit-card-outline",
    regions: ["IN", "US", "GB"],
  },
  {
    id: "demo-card-4444",
    title: "Card •••• 4444",
    detail: "Demo card",
    icon: "credit-card-outline",
    regions: ["IN", "US", "GB"],
  },
  {
    id: "demo-upi",
    title: "UPI",
    detail: "Demo UPI account",
    icon: "bank-transfer",
    regions: ["IN"],
  },
  {
    id: "demo-wallet",
    title: "FauxGo Wallet",
    detail: "Demo wallet",
    icon: "wallet-outline",
    regions: ["IN", "US", "GB"],
  },
  {
    id: "demo-cash",
    title: "Cash",
    detail: "Pay-at-arrival selection",
    icon: "cash",
    regions: ["IN", "US"],
  },
];

export function paymentMethodsFor(region: RegionCode, service: ServiceType) {
  const list = demoPaymentMethods.filter(
    (method) =>
      method.regions.includes(region) &&
      (method.id !== "demo-cash" || !["air", "black"].includes(service)),
  );
  return region === "IN"
    ? [...list].sort(
        (a, b) => Number(b.id === "demo-upi") - Number(a.id === "demo-upi"),
      )
    : list;
}

export function normalizePaymentMethod(
  value: unknown,
  region: RegionCode,
): DemoPaymentMethod["id"] {
  return (
    demoPaymentMethods.find(
      (method) => method.id === value && method.regions.includes(region),
    )?.id ?? (region === "IN" ? "demo-upi" : "demo-card-4242")
  );
}
