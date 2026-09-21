import {
  CatalogItem,
  Merchant,
  RegionCode,
  Service,
  ServiceType,
  VehicleCategory,
} from "./models";
import { cuisines, groceryCategories } from "./catalog-seeds";
import { describeDish, describeGroceryProduct } from "./descriptions";
import { catalogImageTags, resolvePhotoId } from "./photo-resolver";
import { deterministicUnit } from "./pricing";
import { regions } from "./regions";

export const services: Service[] = [
  {
    id: "eats",
    title: "FauxGo Eats",
    shortTitle: "Eats",
    description: "Something good, whenever you’re hungry.",
    icon: "silverware-fork-knife",
    kind: "commerce",
  },
  {
    id: "market",
    title: "FauxGo Market",
    shortTitle: "Market",
    description: "Fresh finds and everyday essentials.",
    icon: "basket-outline",
    kind: "commerce",
  },
  {
    id: "ride",
    title: "FauxGo Ride",
    shortTitle: "Ride",
    description: "Your next stop, a little closer.",
    icon: "car-outline",
    kind: "mobility",
  },
  {
    id: "black",
    title: "FauxGo Black",
    shortTitle: "Black",
    description: "A quieter way to travel.",
    icon: "car-limousine",
    kind: "mobility",
  },
  {
    id: "air",
    title: "FauxGo Air",
    shortTitle: "Air",
    description: "A different perspective on your day.",
    icon: "helicopter",
    kind: "mobility",
  },
  {
    id: "send",
    title: "FauxGo Send",
    shortTitle: "Send",
    description: "From your door to theirs.",
    icon: "package-variant-closed",
    kind: "mobility",
  },
];

export const vehicles: VehicleCategory[] = [
  {
    id: "bike",
    serviceType: "ride",
    title: "Bike",
    description: "A nimble two-wheeler",
    capacity: "1 seat",
    icon: "motorbike",
    multiplier: 0.58,
    etaMinutes: 2,
  },
  {
    id: "auto",
    serviceType: "ride",
    title: "Auto",
    description: "An everyday three-wheeler",
    capacity: "3 seats",
    icon: "rickshaw",
    multiplier: 0.72,
    etaMinutes: 3,
    regions: ["IN"],
  },
  {
    id: "economy",
    serviceType: "ride",
    title: "Economy",
    description: "A comfortable everyday car",
    capacity: "4 seats",
    icon: "car-side",
    multiplier: 1,
    etaMinutes: 3,
  },
  {
    id: "comfort",
    serviceType: "ride",
    title: "Comfort",
    description: "More legroom, a quieter cabin",
    capacity: "4 seats",
    icon: "car-estate",
    multiplier: 1.35,
    etaMinutes: 5,
  },
  {
    id: "xl",
    serviceType: "ride",
    title: "XL",
    description: "Room for everyone",
    capacity: "6 seats",
    icon: "van-passenger",
    multiplier: 1.7,
    etaMinutes: 6,
  },
  {
    id: "black-sedan",
    serviceType: "black",
    title: "Executive sedan",
    description: "Refined comfort with a chauffeur",
    capacity: "4 seats",
    icon: "car-limousine",
    multiplier: 2.3,
    etaMinutes: 5,
  },
  {
    id: "black-suv",
    serviceType: "black",
    title: "Premium SUV",
    description: "Generous space and quiet comfort",
    capacity: "6 seats",
    icon: "car-estate",
    multiplier: 2.9,
    etaMinutes: 7,
  },
  {
    id: "black-electric",
    serviceType: "black",
    title: "Executive electric",
    description: "A smooth, near-silent cabin",
    capacity: "4 seats",
    icon: "car-electric",
    multiplier: 2.6,
    etaMinutes: 6,
  },
  {
    id: "air-rotor",
    serviceType: "air",
    title: "Helicopter",
    description: "A private city-to-city experience",
    capacity: "4 seats",
    icon: "helicopter",
    multiplier: 18,
    etaMinutes: 12,
  },
  {
    id: "air-plane",
    serviceType: "air",
    title: "Private aircraft",
    description: "Space to settle in above the clouds",
    capacity: "8 seats",
    icon: "airplane",
    multiplier: 58,
    etaMinutes: 18,
  },
  {
    id: "air-taxi",
    serviceType: "air",
    title: "Urban air taxi",
    description: "An entirely imagined electric craft",
    capacity: "2 seats",
    icon: "helicopter",
    multiplier: 12,
    etaMinutes: 8,
  },
  {
    id: "send-cycle",
    serviceType: "send",
    title: "Cycle courier",
    description: "Documents and small packages",
    capacity: "Up to 2 kg",
    icon: "bike",
    multiplier: 0.65,
    etaMinutes: 6,
  },
  {
    id: "send-scooter",
    serviceType: "send",
    title: "Scooter courier",
    description: "Everyday parcels",
    capacity: "Up to 5 kg",
    icon: "motorbike",
    multiplier: 0.9,
    etaMinutes: 5,
  },
  {
    id: "send-van",
    serviceType: "send",
    title: "Cargo van",
    description: "Room for larger boxes",
    capacity: "Up to 20 kg",
    icon: "van-utility",
    multiplier: 1.8,
    etaMinutes: 10,
  },
];

export const getService = (id: string | undefined) =>
  services.find((service) => service.id === id);
export const getVehicle = (id: string | undefined) =>
  vehicles.find((vehicle) => vehicle.id === id);
export const getVehicles = (serviceType: ServiceType, region: RegionCode) =>
  vehicles.filter(
    (vehicle) =>
      vehicle.serviceType === serviceType &&
      (!vehicle.regions || vehicle.regions.includes(region)),
  );

const merchantCache = new Map<RegionCode, Merchant[]>();
const marketNames = [
  "Common Market",
  "Sprig Grocer",
  "After Five",
  "The Daily Shelf",
];
const regionCuisines: Record<RegionCode, string[]> = {
  IN: [
    "north-indian",
    "south-indian",
    "biryani",
    "dosa",
    "punjabi",
    "chaat",
    "thali",
    "pizza",
    "healthy",
  ],
  US: [
    "burgers",
    "pizza",
    "mexican",
    "healthy",
    "sushi",
    "sandwiches",
    "coffee",
    "vegan",
  ],
  GB: [
    "indian",
    "north-indian",
    "pizza",
    "bakery",
    "coffee",
    "sandwiches",
    "thai",
    "healthy",
  ],
};

export function getMerchants(region: RegionCode): Merchant[] {
  const cached = merchantCache.get(region);
  if (cached) return cached;
  const preferred = regionCuisines[region];
  const ordered = [...cuisines].sort((a, b) => {
    const first = preferred.indexOf(a.id);
    const second = preferred.indexOf(b.id);
    return (first < 0 ? 100 : first) - (second < 0 ? 100 : second);
  });
  const restaurants = ordered.flatMap((cuisine) =>
    cuisine.names.map((name, branch) => {
      const id = `${region.toLowerCase()}-${cuisine.id}-${branch}`;
      const unit = deterministicUnit(id);
      const eta = 15 + Math.floor(unit * 18);
      const imageTags = catalogImageTags(
        cuisine.title,
        cuisine.title,
        "merchant",
      );
      return {
        id,
        serviceType: "eats" as const,
        name,
        description: cuisine.description,
        category: cuisine.title,
        rating: Math.round((4.2 + unit * 0.7) * 10) / 10,
        etaMinutes: [eta, eta + 10] as const,
        offer: branch === 0 ? "20% off selected items" : undefined,
        icon: "silverware-fork-knife",
        heroTone: "sand" as const,
        region,
        cuisineId: cuisine.id,
        imageKey: resolvePhotoId(imageTags, id, "merchant"),
        imageTags,
        ratingCount: 80 + Math.floor(unit * 2100),
        distanceMeters: 600 + Math.round(unit * 5200),
        deliveryFeeMinor: regions[region].deliveryFeeMinor,
        priceTier: (1 + (branch % 3)) as 1 | 2 | 3,
      };
    }),
  );
  const stores: Merchant[] = marketNames.map((name, index) => {
    const id = `${region.toLowerCase()}-market-${index}`;
    const imageTags = catalogImageTags(
      index % 2 ? "grocery shelves" : "fresh produce",
      "grocery",
      "merchant",
    );
    return {
      id,
      serviceType: "market",
      name,
      description:
        "Fresh produce, pantry staples and the things your day needs.",
      category: "Groceries & essentials",
      rating: 4.6 + (index % 3) / 10,
      etaMinutes: [12 + index * 3, 22 + index * 3],
      offer: index === 0 ? "Fresh picks, everyday prices" : undefined,
      icon: "basket-outline",
      heroTone: "sage",
      region,
      cuisineId: "market",
      imageKey: resolvePhotoId(imageTags, id, "merchant"),
      imageTags,
      ratingCount: 230 + index * 170,
      distanceMeters: 800 + index * 650,
      deliveryFeeMinor: regions[region].deliveryFeeMinor,
      priceTier: 1,
    };
  });
  const result = [...restaurants, ...stores];
  merchantCache.set(region, result);
  return result;
}

export function getMerchant(id: string | undefined): Merchant | undefined {
  if (typeof id !== "string" || !id || id.length > 120) return undefined;
  const prefix = id.split("-")[0]?.toUpperCase();
  if (prefix !== "IN" && prefix !== "US" && prefix !== "GB") return undefined;
  return getMerchants(prefix).find((merchant) => merchant.id === id);
}

function prices(baseRupees: number, seed: string) {
  const factor = 0.9 + deterministicUnit(seed) * 0.25;
  return {
    IN: Math.round((baseRupees * factor) / 5) * 500,
    US: Math.round((baseRupees * factor * 4.1) / 25) * 25,
    GB: Math.round((baseRupees * factor * 3.5) / 25) * 25,
  };
}

function dietaryFor(title: string, base: "vegetarian" | "vegan" | "mixed") {
  if (/chicken|fish|salmon|prawn|pepperoni|seekh/i.test(title))
    return "non-vegetarian" as const;
  return base === "vegan" ? ("vegan" as const) : ("vegetarian" as const);
}

export function getMenu(merchantId: string): CatalogItem[] {
  const merchant = getMerchant(merchantId);
  if (!merchant) return [];
  if (merchant.serviceType === "market") {
    return groceryCategories.flatMap((category, categoryIndex) =>
      category.products.map((title, index) => {
        const id = `${merchantId}~${category.id}~${index}`;
        const imageTags = catalogImageTags(title, category.title, "grocery");
        return {
          id,
          serviceType: "market" as const,
          merchantId,
          title,
          description: describeGroceryProduct(title, category.title, id),
          category: category.title,
          priceMinor: prices(55 + categoryIndex * 18 + index * 16, id),
          available: !(index === 7 && categoryIndex % 3 === 0),
          popular: index < 2,
          icon: "basket-outline",
          imageKey: resolvePhotoId(imageTags, id, "grocery"),
          imageTags,
          substitutionIds: [
            `${merchantId}~${category.id}~${(index + 1) % category.products.length}`,
          ],
          optionGroups: [
            {
              id: "pack",
              label: "Pack size",
              required: true,
              maximum: 1,
              options: [
                { id: "standard", label: "Standard pack", priceDeltaMinor: {} },
                {
                  id: "family",
                  label: "Family pack",
                  priceDeltaMinor: prices(45 + index * 10, id),
                },
              ],
            },
          ],
        };
      }),
    );
  }
  const cuisine = cuisines.find(
    (candidate) => candidate.id === merchant.cuisineId,
  )!;
  const mains = cuisine.dishes.map((title, index): CatalogItem => {
    const id = `${merchantId}~dish~${index}`;
    const dietary = dietaryFor(title, cuisine.dietary);
    const imageTags = catalogImageTags(title, cuisine.title, "food", dietary);
    return {
      id,
      serviceType: "eats",
      merchantId,
      title,
      description: describeDish(title, cuisine.title, id),
      category: index < 5 ? "Recommended" : "More to enjoy",
      priceMinor: prices(cuisine.priceIN + index * 12, id),
      dietary,
      available: index !== 7 || !merchantId.endsWith("-3"),
      popular: index < 3,
      icon: "silverware-fork-knife",
      imageKey: resolvePhotoId(imageTags, id, "food"),
      imageTags,
      optionGroups: [
        {
          id: "portion",
          label: "Portion",
          required: true,
          maximum: 1,
          options: [
            { id: "regular", label: "Regular", priceDeltaMinor: {} },
            {
              id: "generous",
              label: "Generous",
              priceDeltaMinor: prices(70, id),
            },
          ],
        },
        {
          id: "extras",
          label: "Make it yours",
          required: false,
          maximum: 2,
          options: [
            {
              id: "extra-sauce",
              label: "Extra house sauce",
              priceDeltaMinor: prices(25, id),
            },
            {
              id: "side-salad",
              label: "Side salad",
              priceDeltaMinor: prices(60, id),
            },
          ],
        },
      ],
    };
  });
  const sides = [
    "Sparkling water",
    "Fresh lime drink",
    "Seasonal side salad",
    "House dessert",
  ];
  return [
    ...mains,
    ...sides.map((title, index): CatalogItem => {
      const id = `${merchantId}~side~${index}`;
      const imageTags = catalogImageTags(title, "drinks and sides", "food");
      return {
        id,
        merchantId,
        serviceType: "eats",
        title,
        description: `A ${title.toLowerCase()} to round out your order.`,
        category: "Sides & drinks",
        priceMinor: prices(70 + index * 25, `${merchantId}-${title}`),
        dietary: index === 3 ? "vegetarian" : "vegan",
        available: true,
        icon: "silverware-fork-knife",
        imageKey: resolvePhotoId(imageTags, id, "food"),
        imageTags,
      };
    }),
  ];
}

export function getCatalogItem(id: string | undefined) {
  if (typeof id !== "string" || !id || id.length > 160) return undefined;
  return getMenu(id.split("~")[0]).find((item) => item.id === id);
}

export type CatalogFilter =
  "all" | "offers" | "fastest" | "vegetarian" | "healthy";
export function discoverMerchants(
  region: RegionCode,
  service: "eats" | "market",
  category = "all",
  filter: CatalogFilter = "all",
) {
  const matches = getMerchants(region).filter(
    (merchant) =>
      merchant.serviceType === service &&
      (category === "all" || merchant.cuisineId === category),
  );
  if (filter === "fastest")
    return [...matches].sort((a, b) => a.etaMinutes[0] - b.etaMinutes[0]);
  if (filter === "offers")
    return matches.filter((merchant) => Boolean(merchant.offer));
  if (filter === "healthy")
    return matches.filter((merchant) =>
      ["healthy", "vegan", "mediterranean"].includes(merchant.cuisineId),
    );
  if (filter === "vegetarian")
    return matches.filter(
      (merchant) =>
        cuisines.find((cuisine) => cuisine.id === merchant.cuisineId)
          ?.dietary !== "mixed",
    );
  return matches;
}

export function catalogEntryCount(region: RegionCode) {
  return getMerchants(region).reduce(
    (count, merchant) =>
      count + 1 + (merchant.serviceType === "market" ? 80 : 12),
    0,
  );
}
