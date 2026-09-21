import { photoMetadata } from "@/data/photo-metadata.generated";

export type PhotoConfidence = "high" | "family" | "generic" | "placeholder";
export type PhotoUsage = "food" | "grocery" | "merchant";
export const neutralPhotoId = "placeholder-neutral";

const broadTags = new Set([
  "food",
  "grocery",
  "merchant",
  "restaurant",
  "store",
  "indian",
  "asian",
  "western",
  "vegetarian",
  "vegan",
  "mixed",
]);
const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .map(
      (word) =>
        ({
          avocados: "avocado",
          apples: "apple",
          bagels: "bagel",
          bananas: "banana",
          berries: "berry",
          burgers: "burger",
          carrots: "carrot",
          chickpeas: "chickpea",
          croissants: "croissant",
          crisps: "chips",
          desserts: "dessert",
          dumplings: "dumpling",
          fries: "chips",
          lasagne: "lasagna",
          oranges: "orange",
          pizzas: "pizza",
          potatoes: "potato",
          rolls: "roll",
          tomatoes: "tomato",
          yoghurts: "yogurt",
          yoghurt: "yogurt",
        })[word] ?? word,
    )
    .join(" ");

function stableUnit(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;
  return (hash >>> 0) / 4294967296;
}

function stableIndex(value: string, length: number) {
  const suffix = value.match(/^(.*?)-(\d+)$/);
  if (!suffix) return Math.floor(stableUnit(value) * length);
  return (
    (Math.floor(stableUnit(suffix[1]) * length) + Number(suffix[2])) % length
  );
}

const genericIngredients = new Set([
  "chicken",
  "fish",
  "vegetable",
  "mushroom",
  "rice",
  "bread",
  "cheese",
  "tofu",
  "salad",
  "curry",
  "pasta",
  "noodles",
  "pizza",
  "roll",
]);
const categoryTags = new Set([
  "bakery",
  "beverages",
  "breakfast",
  "dairy",
  "dessert",
  "drink",
  "drinks and sides",
  "essentials",
  "frozen",
  "healthy",
  "household",
  "pantry",
  "personal care",
  "produce",
  "quick meals",
  "snacks",
]);
const dishFamilyTags = new Set(["biryani", "chaat", "dosa", "thali"]);
const cuisineGroup = (tag: string) => {
  if (
    /^(north indian|south indian|gujarati|punjabi|mughlai|bengali|maharashtrian|rajasthani|kerala|biryani|dosa|thali|chaat|street food|indian)$/.test(
      tag,
    )
  )
    return "indian";
  if (["japanese", "sushi", "ramen"].includes(tag)) return "japanese";
  if (
    [
      "korean",
      "thai",
      "chinese",
      "italian",
      "pizza",
      "mexican",
      "mediterranean",
      "western",
    ].includes(tag)
  )
    return tag === "pizza" ? "italian" : tag;
  return undefined;
};

const dishForm = (tag: string) => {
  if (/\bpizza\b/.test(tag)) return "pizza";
  if (/salad|slaw/.test(tag)) return "salad";
  if (/\bburger\b/.test(tag)) return "burger";
  if (/sandwich|toastie|baguette|wrap|shawarma|kathi roll/.test(tag))
    return "sandwich";
  if (/curry|korma|makhani|chole|rajma|\bdal\b/.test(tag)) return "curry";
  if (/pasta|lasagna|ravioli|spaghetti/.test(tag)) return "pasta";
  if (/noodle|ramen|udon|pad thai/.test(tag)) return "noodles";
  if (/sushi|maki|nigiri/.test(tag)) return "sushi";
  if (/dumpling|momo/.test(tag)) return "dumplings";
  if (/soup|stew/.test(tag)) return "soup";
  if (/bread|naan|focaccia|pita|croissant|bagel|bun/.test(tag)) return "bread";
  if (/cake|brownie|cookie|donut|ice cream|pudding|tiramisu|dessert/.test(tag))
    return "dessert";
  if (/coffee|tea|juice|cola|soda|water|lemonade|smoothie|drink|milk/.test(tag))
    return "drink";
  return undefined;
};

export function catalogImageTags(
  title: string,
  family: string,
  usage: PhotoUsage,
  dietary?: string,
) {
  const cleanTitle = normalize(title.split("·")[0]);
  const familyTag = normalize(family);
  const tags = new Set([
    cleanTitle,
    ...cleanTitle.split(" ").filter((word) => word.length > 2),
    familyTag,
    usage,
  ]);
  if (dietary) tags.add(normalize(dietary));
  if (/spinach|broccoli|lemon|cauliflower/.test(cleanTitle))
    tags.add("produce");
  if (/cheddar|paneer/.test(cleanTitle)) tags.add("cheese");
  if (/paneer makhani/.test(cleanTitle)) tags.add("paneer curry");
  if (/oat drink/.test(cleanTitle)) tags.add("oat milk");
  if (/toastie/.test(cleanTitle)) tags.add("sandwich");
  if (/\bclub\b/.test(cleanTitle)) tags.add("club sandwich");
  if (/lime drink/.test(cleanTitle)) tags.add("lemonade");
  if (/pesto spaghetti/.test(cleanTitle)) tags.add("pesto pasta");
  if (/garlic focaccia/.test(cleanTitle)) tags.add("garlic bread");
  if (/tiramisu/.test(cleanTitle)) tags.add("dessert");
  if (/chicken tikka/.test(cleanTitle)) tags.add("tandoori chicken");
  if (/black bean burger|lentil burger|mushroom melt/.test(cleanTitle))
    tags.add("veggie burger");
  if (/chicken burger/.test(cleanTitle)) tags.add("chicken burger");
  if (/classic cheeseburger|double stack|chilli crunch burger/.test(cleanTitle))
    tags.add("burger");
  if (/wholegrain bread/.test(cleanTitle)) tags.add("loaf");
  if (/soft roll/.test(cleanTitle)) tags.add("bread");
  if (/flatbreads/.test(cleanTitle)) tags.add("pita");
  if (/tacos|burrito|quesadilla/.test(cleanTitle)) tags.add("mexican");
  if (/miso/.test(cleanTitle)) tags.add("japanese");
  if (/pudding/.test(cleanTitle)) tags.add("dessert");
  if (/tomato burrata salad/.test(cleanTitle)) tags.add("caprese");
  if (/garden pesto pizza|chilli honey pizza/.test(cleanTitle))
    tags.add("vegetable pizza");
  if (/four cheese pizza/.test(cleanTitle)) tags.add("margherita");
  if (
    /north indian|south indian|gujarati|punjabi|mughlai|bengali|maharashtrian|rajasthani|kerala|biryani|dosa|thali|chaat|street food/.test(
      familyTag,
    )
  )
    tags.add("indian");
  if (/sushi|ramen|korean|thai|chinese/.test(familyTag)) tags.add("asian");
  return [...tags].filter(Boolean);
}

export function resolvePhoto(
  tags: readonly string[],
  stableId: string,
  usage: PhotoUsage,
): { id?: string; confidence: PhotoConfidence; score: number } {
  const normalizedTags = tags.map(normalize).filter(Boolean);
  const title = normalizedTags[0] ?? "";
  const titleWords = new Set(title.split(" "));
  const requestedCuisines = new Set(
    normalizedTags
      .map(cuisineGroup)
      .filter((value): value is string => Boolean(value)),
  );
  const titleForm = dishForm(title);
  const requestedForms = new Set(
    (titleForm ? [titleForm] : normalizedTags.map(dishForm)).filter(
      (value) => value !== undefined,
    ),
  );
  const candidates = photoMetadata
    .filter(
      (photo) =>
        photo.usage === usage ||
        (usage === "merchant" && photo.usage === "food") ||
        (usage === "food" &&
          photo.usage === "grocery" &&
          photo.tags.some((tag) =>
            ["sparkling water", "water", "cola", "juice", "tea"].includes(
              normalize(tag),
            ),
          )) ||
        (usage === "grocery" &&
          photo.usage === "food" &&
          photo.tags.some((tag) =>
            ["bakery", "croissant", "pastry"].includes(normalize(tag)),
          )),
    )
    .map((photo) => {
      const normalizedPhotoTags = photo.tags.map(normalize);
      const photoCuisines = new Set(
        photo.tags
          .map((tag) => cuisineGroup(normalize(tag)))
          .filter((value): value is string => Boolean(value)),
      );
      const photoForms = new Set(
        normalizedPhotoTags
          .map(dishForm)
          .filter((value) => value !== undefined),
      );
      if (
        /bin liner|baking paper/.test(title) &&
        !normalizedPhotoTags.some((tag) => title.includes(tag))
      )
        return { id: photo.id, score: 0, scope: photo.scope };
      if (
        /coconut water|still water/.test(title) &&
        normalizedPhotoTags.includes("sparkling water")
      )
        return { id: photo.id, score: 0, scope: photo.scope };
      if (titleForm && photo.scope !== "generic" && !photoForms.size)
        return { id: photo.id, score: 0, scope: photo.scope };
      if (
        requestedCuisines.size &&
        photoCuisines.size &&
        ![...photoCuisines].some((value) => requestedCuisines.has(value))
      )
        return {
          id: photo.id,
          score: 0,
          specificMatches: 0,
          scope: photo.scope,
        };
      if (
        requestedForms.size &&
        photoForms.size &&
        ![...photoForms].some((value) => requestedForms.has(value))
      )
        return {
          id: photo.id,
          score: 0,
          scope: photo.scope,
        };
      let exactScore = 0;
      let genericScore = 0;
      for (const rawTag of photo.tags) {
        const tag = normalize(rawTag);
        const requestedMatch = normalizedTags.includes(tag);
        const titleMatch =
          tag === title ||
          (!categoryTags.has(tag) &&
            !broadTags.has(tag) &&
            ` ${title} `.includes(` ${tag} `));
        if (photo.scope === "generic") {
          if (requestedMatch && !broadTags.has(tag))
            genericScore += categoryTags.has(tag) ? 20 : 30;
          continue;
        }
        if (tag === title) exactScore += 100;
        else if (titleMatch)
          exactScore += genericIngredients.has(tag) ? 15 : 60;
        else if (
          requestedMatch &&
          !categoryTags.has(tag) &&
          !broadTags.has(tag) &&
          (!cuisineGroup(tag) || dishFamilyTags.has(tag))
        )
          exactScore +=
            genericIngredients.has(tag) && titleWords.has(tag) ? 15 : 45;
        else if (
          usage === "merchant" &&
          requestedMatch &&
          (cuisineGroup(tag) ||
            ["produce", "grocery", "bakery", "coffee", "healthy"].includes(tag))
        )
          exactScore += 50;
      }
      return {
        id: photo.id,
        score: photo.scope === "generic" ? genericScore : exactScore,
        scope: photo.scope,
      };
    })
    .filter(({ score }) => score > 0);
  const exact = candidates
    .filter(({ scope, score }) => scope !== "generic" && score >= 45)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const generic = candidates
    .filter(({ scope }) => scope === "generic")
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const ranked = exact.length ? exact : generic;
  if (!ranked.length) return { confidence: "placeholder", score: 0 };
  const bestScore = ranked[0].score;
  const tied = ranked.filter((candidate) => candidate.score === bestScore);
  const selected = tied[stableIndex(stableId, tied.length)];
  return {
    id: selected.id,
    score: selected.score,
    confidence:
      selected.scope === "generic"
        ? "generic"
        : selected.score >= 100
          ? "high"
          : "family",
  };
}

export function resolvePhotoId(
  tags: readonly string[],
  stableId: string,
  usage: PhotoUsage,
) {
  return resolvePhoto(tags, stableId, usage).id ?? neutralPhotoId;
}
