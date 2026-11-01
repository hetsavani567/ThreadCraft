/**
 * Computes discount percentage, original MRP price, and discounted payable price for any product or variant.
 *
 * The `selling_price` stored in MySQL `product_variant` is the BASE / LISTING price.
 * When a discount percentage is applied:
 * - `originalPrice`: the base listing price (the variant's selling_price)
 * - `finalPrice` (and `displayPrice`): the price after discount is deducted!
 *   finalPrice = Math.round(basePrice * (1 - discountPercent / 100))
 * - `savings`: basePrice - finalPrice
 *
 * Increasing the discount percentage directly LOWERS the customer's payable price.
 * No dummy inflated price is generated!
 */
export function getProductDiscount(product, baseSellingPrice = null, variant = null) {
  if (!product) {
    return {
      discountPercent: 0,
      originalPrice: 0,
      displayPrice: 0,
      finalPrice: 0,
      basePrice: 0,
      savings: 0,
    };
  }

  // The base / listing price from the variant or product
  const basePrice = Number(
    baseSellingPrice !== null && baseSellingPrice !== undefined
      ? baseSellingPrice
      : variant?.selling_price ?? product.selling_price ?? product.price ?? 0
  );

  // Discount percentage from variant or product
  let discount =
    variant?.discount_percent ??
    variant?.discountPercent ??
    product.discount_percent ??
    product.discountPercent;

  if (discount === undefined || discount === null) {
    // Check category defaults or deterministic tiers
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

  const discountPercent = Math.max(0, Math.min(90, Math.round(Number(discount) || 0)));

  // Discount is calculated directly ON the base selling price:
  // e.g. Base Price: ₹1,000, Discount: 30%
  // originalPrice = ₹1,000 (shown crossed-out)
  // finalPrice = ₹700 (what customer actually pays)
  // savings = ₹300
  const originalPrice = basePrice;
  const finalPrice =
    discountPercent > 0 && basePrice > 0
      ? Math.round(basePrice * (1 - discountPercent / 100))
      : basePrice;

  const savings = Math.max(0, originalPrice - finalPrice);

  return {
    discountPercent,
    originalPrice,
    displayPrice: finalPrice, // Customer payable price
    finalPrice,
    basePrice,
    savings,
  };
}
