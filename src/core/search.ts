import { getMenu, getMerchants, services } from "./catalog";
import { RegionCode, SavedPlace } from "./models";

export type SearchResult = {
  id: string;
  group:
    "Restaurants" | "Stores" | "Dishes" | "Products" | "Services" | "Places";
  title: string;
  subtitle: string;
  imageKey?: string;
  target: "merchant" | "item" | "service" | "place";
};

const normalize = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim();

export function searchCatalog(
  query: string,
  region: RegionCode,
  places: SavedPlace[] = [],
  offset = 0,
  limit = 30,
) {
  const terms = normalize(query).slice(0, 120).split(/\s+/).filter(Boolean);
  if (!terms.length) return { results: [] as SearchResult[], hasMore: false };
  const matches = (text: string) =>
    terms.every((term) => normalize(text).includes(term));
  const results: SearchResult[] = [];
  let found = 0;
  const add = (result: SearchResult) => {
    if (found >= offset && results.length < limit) results.push(result);
    found += 1;
  };
  for (const service of services)
    if (matches(`${service.title} ${service.description}`))
      add({
        id: service.id,
        group: "Services",
        title: service.title,
        subtitle: service.description,
        target: "service",
      });
  for (const place of places)
    if (matches(`${place.label} ${place.address}`))
      add({
        id: place.id,
        group: "Places",
        title: place.label,
        subtitle: place.address,
        target: "place",
      });
  for (const merchant of getMerchants(region)) {
    if (matches(`${merchant.name} ${merchant.category}`))
      add({
        id: merchant.id,
        group: merchant.serviceType === "eats" ? "Restaurants" : "Stores",
        title: merchant.name,
        subtitle: merchant.category,
        imageKey: merchant.imageKey,
        target: "merchant",
      });
    for (const item of getMenu(merchant.id)) {
      if (matches(`${item.title} ${item.category} ${merchant.category}`))
        add({
          id: item.id,
          group: item.serviceType === "eats" ? "Dishes" : "Products",
          title: item.title,
          subtitle: merchant.name,
          imageKey: item.imageKey,
          target: "item",
        });
      if (found > offset + limit) return { results, hasMore: true };
    }
  }
  return { results, hasMore: false };
}
