import { describe, expect, it } from "vitest";
import { describeDish, describeGroceryProduct } from "./descriptions";

describe("catalog descriptions", () => {
  it("is deterministic and specific for known dishes", () => {
    expect(describeDish("Paneer makhani", "North Indian", "same")).toBe(
      describeDish("Paneer makhani", "North Indian", "same"),
    );
    expect(describeDish("Paneer makhani", "North Indian", "same")).toContain(
      "Cottage cheese",
    );
    expect(describeDish("Dal tadka", "North Indian", "same")).toContain(
      "lentils",
    );
    expect(describeDish("Butter naan", "North Indian", "same")).toContain(
      "flatbread",
    );
  });

  it("does not collapse unrelated dishes into one sentence", () => {
    const descriptions = [
      describeDish("Vegetable dum biryani", "Biryani", "a"),
      describeDish("Classic masala dosa", "Dosa", "b"),
      describeDish("Classic cheeseburger", "Burgers", "c"),
      describeDish("Miso mushroom ramen", "Ramen", "d"),
      describeDish("Butter croissant", "Bakery", "e"),
    ];
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("describes grocery families without merchant boilerplate", () => {
    const milk = describeGroceryProduct(
      "Whole milk · 1 L",
      "Dairy & eggs",
      "milk",
    );
    const soap = describeGroceryProduct(
      "Dish soap · 500 ml",
      "Household",
      "soap",
    );
    const iceCream = describeGroceryProduct(
      "Vanilla ice cream · 500 ml",
      "Frozen",
      "ice-cream",
    );
    expect(milk).toContain("chilled");
    expect(soap).toContain("Household".toLowerCase());
    expect(iceCream).toContain("frozen");
    expect(iceCream).not.toContain("personal-care");
    expect(milk).not.toBe(soap);
  });
});
