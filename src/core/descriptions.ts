function indexFor(seed: string, length: number) {
  let hash = 0;
  for (const character of seed)
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return (hash >>> 0) % length;
}
const choose = (seed: string, values: readonly string[]) =>
  values[indexFor(seed, values.length)];
const lower = (value: string) => value.toLocaleLowerCase("en");

export function describeDish(title: string, cuisine: string, seed: string) {
  const dish = lower(title);
  if (/paneer makhani/.test(dish))
    return "Cottage cheese in a creamy tomato and fenugreek gravy.";
  if (/dal tadka/.test(dish))
    return "Yellow lentils finished with cumin, garlic and tempered spices.";
  if (/butter naan/.test(dish))
    return "Soft tandoor-baked flatbread brushed with butter.";
  if (/biryani/.test(dish))
    return choose(seed, [
      "Fragrant long-grain rice layered with whole spices and a slow dum finish.",
      "Aromatic rice cooked in layers with herbs and warm whole spices.",
      "Long-grain rice, gentle saffron notes and a patient sealed-pot finish.",
    ]);
  if (/dosa|uttapam/.test(dish))
    return choose(seed, [
      "Fermented rice-and-lentil batter cooked on a hot griddle with fresh chutney.",
      "A crisp griddled rice-and-lentil classic served with sambar and chutney.",
      "Freshly griddled fermented batter with a tender centre and crisp edge.",
    ]);
  if (/idli/.test(dish))
    return "Steamed rice-and-lentil cakes with sambar and fresh chutney.";
  if (/vada/.test(dish))
    return "Crisp lentil fritters with a soft centre, served with chutney.";
  if (/\b(dal|lentil)/.test(dish))
    return choose(seed, [
      "Slow-simmered lentils finished with toasted spices and fresh herbs.",
      "Comforting lentils layered with aromatics and a fragrant tempering.",
      "A warming lentil dish with garlic, cumin and balanced spice.",
    ]);
  if (/naan|roti|paratha|kulcha|thepla|flatbread|focaccia/.test(dish))
    return choose(seed, [
      "Freshly baked flatbread with a soft centre and lightly blistered edge.",
      "Warm griddled bread made to order and finished with a little butter.",
      "A tender, freshly cooked bread with golden edges.",
    ]);
  if (/paneer/.test(dish))
    return choose(seed, [
      "Cottage cheese cooked with layered spices and a balanced savoury sauce.",
      "Tender paneer with aromatic spices, herbs and a gently rich finish.",
      "Paneer prepared with toasted spices and the kitchen’s house masala.",
    ]);
  if (/chicken/.test(dish))
    return /tikka|tandoori|grill|crispy|fried/.test(dish)
      ? "Seasoned chicken cooked for a charred or crisp finish, with fresh herbs."
      : "Tender chicken cooked with aromatics, herbs and a balanced house sauce.";
  if (/fish|salmon|prawn/.test(dish))
    return "Carefully cooked seafood with bright aromatics and a clean, savoury finish.";
  if (/pizza/.test(dish))
    return choose(seed, [
      "Slow-fermented dough, tomato and thoughtfully chosen toppings from a hot oven.",
      "A blistered, hand-stretched base with balanced sauce and melted cheese.",
      "Hot-oven pizza with a crisp edge, tender centre and fresh toppings.",
    ]);
  if (/burger|double stack/.test(dish))
    return choose(seed, [
      "A griddle-seared filling in a toasted bun with crisp pickles and house sauce.",
      "Toasted bun, savoury griddled filling and a bright, crunchy finish.",
      "Built to order with a seared centre, fresh leaves and house pickles.",
    ]);
  if (
    /sushi|maki|nigiri|\broll\b/.test(dish) &&
    /sushi|japanese/i.test(cuisine)
  )
    return "Seasoned rice and fresh fillings, carefully rolled and cut to order.";
  if (/ramen|noodle|udon|tantanmen|japchae|pad thai/.test(dish))
    return choose(seed, [
      "Springy noodles with layered aromatics, vegetables and a savoury finish.",
      "Noodles tossed or steeped with a deeply seasoned base and fresh toppings.",
      "A warming bowl of noodles balanced with herbs, vegetables and umami depth.",
    ]);
  if (/rice|pulao|bibimbap/.test(dish))
    return "Aromatic rice with vegetables, herbs and carefully balanced seasoning.";
  if (/curry|korma|stew|masala|sabzi|saag|avial|erissery|thoran/.test(dish))
    return "A slow-cooked house preparation with aromatics, vegetables and layered spice.";
  if (/salad|tabbouleh|slaw|greens/.test(dish))
    return "Fresh vegetables and herbs with a bright, balanced house dressing.";
  if (/sandwich|toast|wrap|baguette|shawarma/.test(dish))
    return "Freshly assembled with crisp leaves, a savoury filling and house dressing.";
  if (/soup|broth/.test(dish))
    return "A warming, aromatic bowl with a clean savoury finish.";
  if (/croissant|bun|loaf|muffin|bread|twist|pastry/.test(dish))
    return "Baked in small batches for a golden crust and tender centre.";
  if (
    /cake|tart|brownie|tiramisu|fondant|pudding|mousse|phirni|payasam|ghevar|churro/.test(
      dish,
    )
  )
    return "A carefully made sweet finish with balanced richness and texture.";
  if (/coffee|latte|cappuccino|mocha|brew|chocolate/.test(dish))
    return "Prepared to order for a smooth, balanced cup.";
  return choose(seed, [
    `${title} prepared with the characteristic flavours of ${cuisine}.`,
    `A thoughtful ${lower(title)} with fresh aromatics and balanced seasoning.`,
    `${title}, made to order with carefully layered flavour and texture.`,
    `A house take on ${lower(title)}, finished fresh for each order.`,
  ]);
}

export function describeGroceryProduct(
  title: string,
  category: string,
  seed: string,
) {
  const product = title.split("·")[0].trim();
  const value = lower(product);
  if (/milk|oat drink/.test(value))
    return `${product}, chilled and ready for the week ahead.`;
  if (/yoghurt/.test(value))
    return `${product} with a smooth, naturally tangy finish.`;
  if (/egg/.test(value))
    return `${product}, carefully packed and kept chilled.`;
  if (/avocado|tomato|carrot|apple|spinach|lemon|banana|broccoli/.test(value))
    return `${product}, selected for freshness and everyday cooking.`;
  if (/water|juice/.test(value)) return `${product}, ready to chill and serve.`;
  if (/coffee|tea/.test(value))
    return `${product}, an easy staple for the kitchen shelf.`;
  if (/ice cream/.test(value))
    return `${product}, kept frozen for a smooth, creamy dessert.`;
  if (/bread|loaf|croissant|bagel|pita|roll|flatbread|bun/.test(value))
    return `${product}, baked for a soft centre and fresh flavour.`;
  if (/soap|cleaner|laundry|towel|sponge|tissue|liner|paper/.test(value))
    return `${product}, a practical everyday ${lower(category)} essential.`;
  if (/shampoo|toothpaste|wash|cream|balm|cotton/.test(value))
    return `${product}, selected for the everyday personal-care range.`;
  return choose(seed, [
    `${product}, selected for quality and everyday value.`,
    `${product}, a useful staple for a well-stocked home.`,
    `${product}, chosen for the ${lower(category)} range.`,
    `${product}, packed for convenient everyday use.`,
  ]);
}
