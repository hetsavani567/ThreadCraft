/**
 * Computes discount percentage, original MRP price, and savings for any product or variant.
 *
 * Priority order:
 * 1. If variant or product has an explicit `discount_percent` or `discountPercent`, use that.
 * 2. If variant or product has `original_price` or `mrp` greater than current price, compute `(original - current) / original * 100`.
 * 3. Specific product / category discount tiers:
 *    - Footwear / Shoes: 30% OFF
 *    - Jackets / Winterwear / Hoodies: 25% OFF
 *    - Ethnic / Festive / Kurtas: 35% OFF
 *    - Accessories / Caps / Belts: 15% OFF
 *    - Formalwear / Suits / Blazers: 20% OFF
 *    - T-Shirts / Casuals: 20% OFF
 *    - Others: deterministic 18% - 30% OFF based on product ID
 */
export function getProductDiscount(product, displayPrice = null, variant = null) {
  if (!product) {
    return { discountPercent: 0, originalPrice: 0, displayPrice: 0, savings: 0 };
  }

  const currentPrice = Number(
    displayPrice !== null && displayPrice !== undefined
      ? displayPrice
      : variant?.selling_price ?? product.selling_price ?? product.price ?? 0
  );

  let discount =
    variant?.discount_percent ??
    variant?.discountPercent ??
    product.discount_percent ??
    product.discountPercent;

  if (discount === undefined || discount === null) {
    const original =
      variant?.original_price ??
      variant?.mrp ??
      product.original_price ??
      product.mrp;

    if (original && Number(original) > currentPrice) {
      discount = Math.round(
        ((Number(original) - currentPrice) / Number(original)) * 100
      );
    } else {
      const id = Number(product.id || product.product_id || 1);
      const cat = (product.category || product.category_type || "").toLowerCase();
      const name = (product.name || product.product_name || "").toLowerCase();

      if (
        cat.includes("shoes") ||
        cat.includes("footwear") ||
        name.includes("shoe") ||
        name.includes("sneaker") ||
        name.includes("boot") ||
        name.includes("loafer")
      ) {
        discount = 30;
      } else if (
        cat.includes("winter") ||
        cat.includes("jacket") ||
        cat.includes("outerwear") ||
        name.includes("jacket") ||
        name.includes("hoodie") ||
        name.includes("sweater") ||
        name.includes("coat") ||
        name.includes("puffer")
      ) {
        discount = 25;
      } else if (
        cat.includes("ethnic") ||
        cat.includes("festive") ||
        name.includes("kurta") ||
        name.includes("chikankari")
      ) {
        discount = 35;
      } else if (
        cat.includes("accessor") ||
        name.includes("cap") ||
        name.includes("belt") ||
        name.includes("wallet") ||
        name.includes("sunglass") ||
        name.includes("backpack")
      ) {
        discount = 15;
      } else if (
        cat.includes("formal") ||
        name.includes("suit") ||
        name.includes("blazer") ||
        name.includes("tuxedo") ||
        name.includes("dress shirt")
      ) {
        discount = 20;
      } else if (
        name.includes("t-shirt") ||
        name.includes("tee") ||
        name.includes("tank")
      ) {
        discount = 20;
      } else if (name.includes("jeans") || name.includes("chino")) {
        discount = 18;
      } else {
        const tiers = [20, 25, 15, 30, 22, 18, 35, 28];
        discount = tiers[id % tiers.length];
      }
    }
  }

  const discountPercent = Math.max(0, Math.min(90, Math.round(Number(discount) || 0)));

  const explicitOriginal =
    variant?.original_price ??
    variant?.mrp ??
    product.original_price ??
    product.mrp;

  const originalPrice =
    explicitOriginal && Number(explicitOriginal) > currentPrice
      ? Number(explicitOriginal)
      : discountPercent > 0 && currentPrice > 0
      ? Math.round(currentPrice / (1 - discountPercent / 100))
      : currentPrice;

  const savings = Math.max(0, originalPrice - currentPrice);

  return {
    discountPercent,
    originalPrice,
    displayPrice: currentPrice,
    savings,
  };
}
