import { useState } from "react";

function ProductCard({ product, onAddToCart, isEmployee, onAdjustStock, onEditVariant }) {
  const [imgError, setImgError] = useState(false);
  const variants = product.variants && product.variants.length > 0 ? product.variants : [];
  
  // Selected variant state (default to first active variant if available)
  const [selectedVariantId, setSelectedVariantId] = useState(
    variants[0]?.variant_id || null
  );

  const selectedVariant = variants.find((v) => v.variant_id === selectedVariantId) || variants[0];
  const displayPrice = selectedVariant?.selling_price || product.price || 0;
  const isOutOfStock = product.total_stock !== undefined && product.total_stock <= 0;

  function handleAddToCartClick(e) {
    if (e) e.stopPropagation();
    if (onAddToCart) {
      onAddToCart({
        ...product,
        price: displayPrice,
        selectedVariant: selectedVariant || null,
        selectedColorSize: selectedVariant?.color_size || null,
      });
    }
  }

  function handleCardClick() {
    if (isEmployee && onEditVariant) {
      onEditVariant(product, selectedVariant);
    } else {
      // Navigate to product detail page via hash
      window.location.hash = `#product?id=${product.id}`;
    }
  }

  return (
    <article
      onClick={handleCardClick}
      className={`group flex flex-col justify-between overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer ${
        isEmployee ? "ring-1 hover:ring-2 hover:ring-amber-500/70" : ""
      }`}
    >
      <div>
        {/* Product Image container */}
        <div className="relative aspect-4/5 overflow-hidden bg-stone-100">
          {!imgError && product.image ? (
            <img
              src={product.image}
              alt={product.name}
              onError={() => setImgError(true)}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-stone-200 text-stone-400">
              <svg
                className="h-16 w-16"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              <span className="mt-2 text-xs font-medium text-stone-500">ThreadCraft</span>
            </div>
          )}

          {/* Brand & Category Badge */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {product.brand && (
              <span className="rounded-full bg-stone-900/80 px-2.5 py-1 text-[11px] font-bold tracking-wider text-white uppercase backdrop-blur-sm">
                {product.brand}
              </span>
            )}
            {product.category && (
              <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-stone-700 shadow-sm backdrop-blur-sm">
                {product.category}
              </span>
            )}
          </div>


          {/* Rating Badge */}
          {!isEmployee && product.rating && (
            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-amber-900 shadow-sm backdrop-blur-sm">
              <svg className="h-3.5 w-3.5 fill-amber-500 text-amber-500" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{Number(product.rating).toFixed(1)}</span>
              {product.review_count > 0 && (
                <span className="text-[10px] font-normal text-stone-500">
                  ({product.review_count})
                </span>
              )}
            </div>
          )}

          {/* Stock Tag */}
          {product.total_stock !== undefined && (
            <div className="absolute bottom-3 left-3">
              {product.total_stock <= 0 ? (
                <span className="rounded-full bg-red-600/90 px-2.5 py-0.5 text-[11px] font-bold text-white shadow">
                  Out of Stock
                </span>
              ) : product.total_stock <= 10 ? (
                <span className="rounded-full bg-amber-600/90 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow">
                  Only {product.total_stock} left
                </span>
              ) : (
                <span className="rounded-full bg-emerald-800/80 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow backdrop-blur-sm">
                  In Stock ({product.total_stock})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
              {product.name}
            </h3>
            {isEmployee && (
              <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold shrink-0">
                Click to Edit
              </span>
            )}
          </div>

          <p className="mt-1 line-clamp-2 text-sm text-stone-500">
            {product.description}
          </p>

          {/* Variant Selector */}
          {variants.length > 0 && (
            <div className="mt-3">
              <label
                htmlFor={`variant-select-${product.id}`}
                className="block text-xs font-semibold text-stone-500 mb-1"
              >
                Option / Size:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {variants.map((v) => (
                  <button
                    key={v.variant_id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVariantId(v.variant_id);
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      selectedVariantId === v.variant_id
                        ? "bg-amber-700 text-white shadow-xs"
                        : "border border-stone-200 bg-stone-50 text-stone-700 hover:border-amber-700"
                    }`}
                  >
                    {v.color_size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Price Section */}
      <div className="border-t border-stone-100 p-4 pt-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-xs text-stone-400 block font-medium">Selling Price</span>
            <p className="text-xl font-extrabold text-stone-900">
              ₹{Number(displayPrice).toLocaleString("en-IN")}
            </p>
          </div>
          {/* Non-Employee: Add to Cart button */}
          {!isEmployee && (
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCartClick}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white transition-all duration-200 shadow-sm ${
                isOutOfStock
                  ? "bg-stone-300 cursor-not-allowed text-stone-500"
                  : "bg-stone-900 hover:bg-amber-700 hover:shadow active:scale-95 cursor-pointer"
              }`}
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
            </button>
          )}

          {isEmployee && (
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
              ✏️ Tap to Edit
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
