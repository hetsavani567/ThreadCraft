import { useState, useEffect } from "react";
import { getProductDiscount } from "../utils/discount.js";

function ProductCard({ product, onAddToCart, isEmployee, onEditVariant, onSelectCategory, onSelectProduct }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [product?.image, product?.id]);

  const allVariants =
    product.variants && product.variants.length > 0
      ? product.variants
      : [];

  // For customers: only show active variants. For employees: show all variants so they can manage inactive ones.
  const variants = isEmployee
    ? allVariants
    : allVariants.filter((v) => v.is_active === 1 || v.is_active === true || v.is_active === "1");

  // Selected variant state (default to first available variant)
  const [selectedVariantId, setSelectedVariantId] = useState(
    variants[0]?.variant_id || null
  );

  const selectedVariant =
    variants.find((v) => v.variant_id === selectedVariantId) ||
    variants[0];

  const baseSellingPrice =
    selectedVariant?.selling_price ?? product.price ?? 0;

  const isOutOfStock =
    product.total_stock !== undefined && product.total_stock <= 0;

  const { discountPercent, originalPrice, displayPrice, finalPrice } = getProductDiscount(product, baseSellingPrice, selectedVariant);

  function handleAddToCartClick(e) {
    e.stopPropagation();

    if (onAddToCart) {
      onAddToCart({
        ...product,
        price: displayPrice,
        originalPrice: originalPrice,
        discountPercent: discountPercent,
        selectedVariant: selectedVariant || null,
        selectedColorSize: selectedVariant?.color_size || null,
      });
    }
  }

  function handleCardClick() {
    if (isEmployee && onEditVariant) {
      onEditVariant(product, selectedVariant);
    } else if (onSelectProduct) {
      onSelectProduct(product.id);
    } else {
      // Navigate to product detail page via hash
      window.location.hash = `#product?id=${product.id}`;
    }
  }

  return (
    <article
      onClick={handleCardClick}
      className={`group flex flex-col justify-between h-full w-full flex-1 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer ${
        isEmployee ? "ring-1 hover:ring-2 hover:ring-amber-500/70" : ""
      }`}
    >
      <div className="flex flex-col flex-1">
        {/* Product Image */}
        <div className="relative h-40 sm:h-44 w-full shrink-0 overflow-hidden bg-stone-100">
          {!imgError && product.image ? (
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              decoding="async"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-stone-200 text-stone-400">
              <svg
                className="h-10 w-10"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              <span className="mt-1 text-[11px] font-medium text-stone-500">
                ThreadCraft
              </span>
            </div>
          )}

          {/* Badges: Brand, Discount */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 items-center">
            {discountPercent > 0 && (
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black tracking-wide text-white shadow-xs backdrop-blur-sm">
                {discountPercent}% OFF
              </span>
            )}

            {product.brand && (
              <span className="rounded-full bg-stone-900/80 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase backdrop-blur-sm">
                {product.brand}
              </span>
            )}

            {isEmployee && allVariants.length > 0 && !allVariants.some((v) => v.is_active === 1 || v.is_active === true || v.is_active === "1") && (
              <span className="rounded-full bg-red-600/90 text-white px-2 py-0.5 text-[9px] font-black uppercase shadow-xs">
                Hidden (All Inactive)
              </span>
            )}
          </div>

          {/* Rating Badge */}
          {!isEmployee && product.rating && (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-bold text-amber-900 shadow-xs backdrop-blur-sm">
              <svg
                className="h-3 w-3 fill-amber-500 text-amber-500"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{Number(product.rating).toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-3.5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1.5">
              <h3
                className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-1"
                title={product.name}
              >
                {product.name}
              </h3>
            </div>

            <p className="mt-1 line-clamp-2 text-xs text-stone-500 leading-relaxed min-h-[32px]">
              {product.description}
            </p>
          </div>

          {/* Variant Selector */}
          {variants.length > 0 && (
            <div className="mt-2.5 min-h-[48px] flex flex-col justify-end">
              <div className="text-[10px] font-semibold text-stone-500 mb-1">
                Option / Size:
              </div>

              <div className="flex flex-wrap gap-1">
                {variants.map((v) => {
                  const isVarActive = v.is_active === 1 || v.is_active === true || v.is_active === "1";
                  return (
                    <button
                      key={v.variant_id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVariantId(v.variant_id);
                      }}
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition ${
                        selectedVariantId === v.variant_id
                          ? "bg-amber-700 text-white shadow-xs"
                          : "border border-stone-200 bg-stone-50 text-stone-700 hover:border-amber-700"
                      } ${!isVarActive ? "opacity-60 border-dashed" : ""}`}
                      title={!isVarActive ? `${v.color_size} (Inactive - Hidden from customers)` : v.color_size}
                    >
                      {v.color_size}
                      {!isVarActive && <span className="ml-1 text-[8px] text-red-500 font-bold">●</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Price and Footer */}
      <div className="border-t border-stone-100 p-3 pt-2.5 bg-stone-50/50 shrink-0 mt-auto">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-stone-400 block font-medium uppercase tracking-wider">
              Price
            </span>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-black text-stone-900">
                ₹{Number(displayPrice).toLocaleString("en-IN")}
              </span>
              {discountPercent > 0 && originalPrice > displayPrice && (
                <>
                  <span className="text-xs text-stone-400 line-through font-medium">
                    ₹{Number(originalPrice).toLocaleString("en-IN")}
                  </span>
                  <span className="text-[11px] font-black text-emerald-600">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Customer Add-to-Cart Button */}
          {!isEmployee && (
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCartClick}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-all duration-200 shadow-xs ${
                isOutOfStock
                  ? "bg-stone-300 cursor-not-allowed text-stone-500"
                  : "bg-stone-900 hover:bg-amber-700 hover:shadow active:scale-95 cursor-pointer"
              }`}
            >
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              <span>{isOutOfStock ? "Out" : "Add"}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
