import { getCatalogItem, getMerchant } from "./catalog";
import { CartLine, RegionCode } from "./models";
import { calculateCommercePrice } from "./pricing";
export function quoteBasket(lines: CartLine[], region: RegionCode) {
  const items = lines.flatMap((line) => getCatalogItem(line.itemId) ?? []);
  const merchant = getMerchant(items[0]?.merchantId);
  const eligible = merchant?.offer
    ? lines.reduce((sum, line) => {
        const item = getCatalogItem(line.itemId);
        return (
          sum + (item?.popular ? item.priceMinor[region] * line.quantity : 0)
        );
      }, 0)
    : 0;
  return calculateCommercePrice({
    lines,
    items,
    region,
    promotionMinor: Math.round(eligible * 0.2),
  });
}
