export type RegionCode = "IN" | "US" | "GB";
export type CurrencyCode = "INR" | "USD" | "GBP";
export type ServiceType = "eats" | "market" | "ride" | "black" | "air" | "send";
export type SimulationPace = "quick" | "relaxed" | "realtime";

export type Coordinate = readonly [longitude: number, latitude: number];

export type SavedPlace = {
  id: string;
  label: string;
  address: string;
  coordinate: Coordinate;
  kind: "home" | "work" | "recent" | "custom";
};

export type Profile = {
  displayName: string;
  mode: "guest" | "account";
};

export type Service = {
  id: ServiceType;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  kind: "commerce" | "mobility";
};

export type Merchant = {
  id: string;
  serviceType: "eats" | "market";
  name: string;
  description: string;
  category: string;
  rating: number;
  etaMinutes: readonly [number, number];
  offer?: string;
  icon: string;
  heroTone: "coral" | "sand" | "sage" | "ink";
  region: RegionCode;
  cuisineId: string;
  imageKey: string;
  imageTags: string[];
  ratingCount: number;
  distanceMeters: number;
  deliveryFeeMinor: number;
  priceTier: 1 | 2 | 3;
};

export type ItemOption = {
  id: string;
  label: string;
  priceDeltaMinor: Partial<Record<RegionCode, number>>;
};

export type ItemOptionGroup = {
  id: string;
  label: string;
  required: boolean;
  maximum: number;
  options: ItemOption[];
};

export type CatalogItem = {
  id: string;
  serviceType: "eats" | "market";
  merchantId: string;
  title: string;
  description: string;
  category: string;
  priceMinor: Record<RegionCode, number>;
  dietary?: "vegetarian" | "vegan" | "non-vegetarian";
  available: boolean;
  popular?: boolean;
  icon: string;
  imageKey: string;
  imageTags: string[];
  optionGroups?: ItemOptionGroup[];
  substitutionIds?: string[];
};

export type CartLine = {
  itemId: string;
  quantity: number;
  optionIds: string[];
  substitution: "best-match" | "refund" | string;
  notes?: string;
};

export type VehicleCategory = {
  id: string;
  serviceType: "ride" | "black" | "air" | "send";
  title: string;
  description: string;
  capacity: string;
  icon: string;
  multiplier: number;
  etaMinutes: number;
  regions?: RegionCode[];
};

export type Operator = {
  id: string;
  name: string;
  role: "driver" | "courier" | "captain" | "chauffeur" | "picker";
  rating: number;
  vehicle: string;
  vehicleColor: string;
  plate: string;
  message: string;
};

export type Route = {
  id: string;
  source: "demo" | "provider";
  points: Coordinate[];
  distanceMeters: number;
  durationSeconds: number;
  attribution?: string;
};

export type PriceLine = {
  id: string;
  label: string;
  amountMinor: number;
  kind: "base" | "fee" | "tax" | "discount" | "adjustment";
};

export type PriceBreakdown = {
  currency: CurrencyCode;
  lines: PriceLine[];
  totalMinor: number;
  explanation: string;
};

export type NotificationEvent = {
  id: string;
  title: string;
  body: string;
  stageId: string;
};

export type TimelineStage = {
  id: string;
  title: string;
  detail: string;
  offsetSeconds: number;
  anchor: "created" | "manual-start";
  notification?: NotificationEvent;
  manualActionLabel?: string;
};

export type Rating = {
  score: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  createdAt: number;
};

export type Simulation = {
  schemaVersion: 2;
  id: string;
  serviceType: ServiceType;
  title: string;
  subtitle: string;
  createdAt: number;
  manualStartedAt?: number;
  completedAt?: number;
  pace: SimulationPace;
  region: RegionCode;
  origin: SavedPlace;
  destination: SavedPlace;
  route: Route;
  quote: PriceBreakdown;
  stages: TimelineStage[];
  operator: Operator;
  vehicle: VehicleCategory;
  itemCount?: number;
  packageDescription?: string;
  paymentMethodId?: string;
  rating?: Rating;
};

export type Favorite = {
  id: string;
  kind: "merchant" | "item" | "place";
  targetId: string;
  createdAt: number;
};

export type ConsentPreference =
  "unset" | "non-personalized" | "personalized" | "disabled";

export type UserPreference = {
  appearance: "light" | "dark" | "system";
  sidebarExpanded: boolean;
  units: "km" | "mi";
  regionSource: "locale" | "manual" | "location";
  preciseLocation: boolean;
  deliveryNotifications: boolean;
  rideNotifications: boolean;
  region: RegionCode;
  currency: CurrencyCode;
  pace: SimulationPace;
  haptics: boolean;
  sound: boolean;
  notifications: boolean;
  reducedMotion: "system" | "on" | "off";
  adConsent: ConsentPreference;
};

export type AppStateV2 = {
  schemaVersion: 2;
  onboardingComplete: boolean;
  onboardingCompletedAt?: number;
  profile: Profile;
  preferences: UserPreference;
  savedPlaces: SavedPlace[];
  selectedPlace: SavedPlace;
  recentPlaces: SavedPlace[];
  paymentMethodId: string;
  favorites: Favorite[];
  cartService: "eats" | "market" | null;
  cart: CartLine[];
  simulations: Simulation[];
  completionAdTimestamps: number[];
};
