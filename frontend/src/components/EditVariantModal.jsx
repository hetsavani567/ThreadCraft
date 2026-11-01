import { useState, useEffect } from "react";
import { updateProductVariant, updateProduct } from "../services/api";

function EditVariantModal({ isOpen, onClose, product, initialVariant, onVariantUpdated }) {
  if (!isOpen || !product) return null;

  const variants = Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants
    : [
        {
          variant_id: initialVariant?.variant_id || 1,
          color_size: initialVariant?.color_size || "Standard",
          selling_price: initialVariant?.selling_price || product.price || 0,
          is_active: initialVariant?.is_active !== undefined ? initialVariant.is_active : 1,
        },
      ];

  // Currently selected variant ID in modal
  const [selectedVariantId, setSelectedVariantId] = useState(
    initialVariant?.variant_id || variants[0]?.variant_id
  );

  const activeVariant =
    variants.find((v) => v.variant_id === selectedVariantId) || variants[0];

  // Form states - Variant
  const [colorSize, setColorSize] = useState(activeVariant?.color_size || "");
  const [sellingPrice, setSellingPrice] = useState(
    activeVariant?.selling_price !== undefined ? String(activeVariant.selling_price) : ""
  );
  const [discountPercent, setDiscountPercent] = useState(
    activeVariant?.discount_percent !== undefined ? String(activeVariant.discount_percent) : "0"
  );
  const [isActive, setIsActive] = useState(
    activeVariant?.is_active !== undefined ? Boolean(activeVariant.is_active) : true
  );

  // Form states - Product Photo (Image URL: 1 URL per product, not per variant)
  const [imageUrl, setImageUrl] = useState(product.image || "");
  const [previewError, setPreviewError] = useState(false);

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Sync state whenever activeVariant changes
  useEffect(() => {
    if (activeVariant) {
      setColorSize(activeVariant.color_size || "");
      setSellingPrice(
        activeVariant.selling_price !== undefined ? String(activeVariant.selling_price) : ""
      );
      setDiscountPercent(
        activeVariant.discount_percent !== undefined ? String(activeVariant.discount_percent) : "0"
      );
      setIsActive(activeVariant.is_active !== undefined ? Boolean(activeVariant.is_active) : true);
      setFormErrors({});
      setSuccessMessage("");
    }
  }, [activeVariant?.variant_id]);

  // Sync image URL whenever product changes
  useEffect(() => {
    setImageUrl(product.image || "");
    setPreviewError(false);
  }, [product.id, product.image]);

  async function handleUpdateSubmit(e) {
    e.preventDefault();
    setFormErrors({});
    setSuccessMessage("");

    const errors = {};
    const trimmedColor = colorSize.trim();
    if (!trimmedColor) {
      errors.color_size = "Variant option/size is required (e.g. 'Black-M').";
    } else if (trimmedColor.length > 50) {
      errors.color_size = "Variant description cannot exceed 50 characters.";
    }

    const priceNum = Number(sellingPrice);
    if (!sellingPrice || isNaN(priceNum) || priceNum <= 0) {
      errors.selling_price = "Selling price must be a valid positive number greater than ₹0.";
    } else if (priceNum > 10000000) {
      errors.selling_price = "Selling price cannot exceed ₹1,00,00,000.";
    }

    const discountNum = Number(discountPercent);
    if (discountPercent === "" || isNaN(discountNum) || discountNum < 0 || discountNum > 90) {
      errors.discount_percent = "Discount percentage must be a number between 0% and 90%.";
    }

    // Mandatory Image URL format check
    const trimmedImage = imageUrl.trim();
    if (!trimmedImage) {
      errors.image_url = "Product image web URL is mandatory.";
    } else {
      try {
        const parsedUrl = new URL(trimmedImage);
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
          errors.image_url = "Image URL must start with http:// or https://";
        }
      } catch {
        errors.image_url = "Invalid image URL format. Please enter a valid web URL.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const variantPayload = {
        color_size: trimmedColor,
        selling_price: priceNum,
        is_active: isActive ? 1 : 0,
        discount_percent: Math.round(discountNum),
      };

      // 1. Update product photo if changed or provided (executes sp_update_product)
      const imageToSave = trimmedImage || null;
      let photoUpdated = false;
      if (imageToSave !== (product.image || null)) {
        await updateProduct(product.id, {
          product_name: product.name,
          product_description: product.description,
          image_url: imageToSave,
        });
        photoUpdated = true;
      }

      // 2. Update variant details (executes sp_update_product_variant)
      await updateProductVariant(activeVariant.variant_id, variantPayload);

      setSuccessMessage(
        photoUpdated
          ? `🎉 Product photo updated via "sp_update_product" & Variant #${activeVariant.variant_id} updated via "sp_update_product_variant"!`
          : `🎉 Variant #${activeVariant.variant_id} updated successfully via "sp_update_product_variant"!`
      );

      if (onVariantUpdated) {
        await onVariantUpdated({
          ...activeVariant,
          ...variantPayload,
          productId: product.id,
          image: imageToSave,
        });
      }
    } catch (err) {
      setFormErrors({ submit: err.message || "Failed to save updates to MySQL database." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="bg-stone-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30 text-xl font-bold">
              ✏️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Update Product & Variant</h3>
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold uppercase text-stone-950">
                  PL/SQL Procedures
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Procedures: <code className="text-amber-300">sp_update_product</code> (Photo) & <code className="text-amber-300">sp_update_product_variant</code>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-stone-800 p-2 text-stone-400 hover:bg-stone-700 hover:text-white transition cursor-pointer"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-5">
          {/* Product Parent Info Card */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-stone-200 bg-stone-50 p-3.5">
            <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-stone-300 bg-stone-200 shadow-xs">
              {imageUrl && !previewError ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  onError={() => setPreviewError(true)}
                  className="h-full w-full object-cover transition"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-stone-400 text-[10px]">
                  <span>No image</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-200 px-2 py-0.5 rounded">
                  {product.brand || "Brand"} • {product.category || "Category"}
                </span>
                <span className="text-xs text-stone-400">Product #{product.id}</span>
              </div>
              <h4 className="text-sm font-bold text-stone-900 truncate mt-1">{product.name}</h4>
            </div>
          </div>

          {/* Product Photo URL Section (One photo per product, applies to all variants) */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <span>📸</span>
                  <span>Product Photo URL *</span>
                </span>
                <span className="rounded-full bg-amber-200 text-amber-900 text-[9px] font-extrabold uppercase px-2 py-0.5">
                  Mandatory (Web Link)
                </span>
              </div>
              <span className="text-[10px] text-amber-800 font-mono">
                sp_update_product
              </span>
            </div>

            <div className="relative">
              <input
                type="url"
                placeholder="Enter web photo URL (e.g. https://images.unsplash.com/...)"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setPreviewError(false);
                  if (formErrors.image_url) {
                    setFormErrors({ ...formErrors, image_url: null });
                  }
                }}
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none transition pr-8 ${
                  formErrors.image_url
                    ? "border-red-500 ring-2 ring-red-100"
                    : "border-stone-300 focus:border-amber-700"
                }`}
              />
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl("");
                    setPreviewError(false);
                  }}
                  className="absolute right-2.5 top-2.5 text-xs text-stone-400 hover:text-stone-700 cursor-pointer"
                  title="Clear photo URL"
                >
                  ✕
                </button>
              )}
            </div>

            {formErrors.image_url && (
              <p className="text-[11px] font-semibold text-red-600">
                {formErrors.image_url}
              </p>
            )}

            {/* Quick Unsplash Samples for Testing */}
            <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
              <span className="text-stone-500 font-medium">Quick sample:</span>
              <button
                type="button"
                onClick={() => {
                  setImageUrl("https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80");
                  setPreviewError(false);
                }}
                className="rounded-md bg-white border border-stone-200 px-2 py-0.5 text-stone-700 hover:border-amber-600 transition cursor-pointer"
              >
                👕 White T-Shirt
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageUrl("https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=700&q=80");
                  setPreviewError(false);
                }}
                className="rounded-md bg-white border border-stone-200 px-2 py-0.5 text-stone-700 hover:border-amber-600 transition cursor-pointer"
              >
                🧥 Grey Hoodie
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80");
                  setPreviewError(false);
                }}
                className="rounded-md bg-white border border-stone-200 px-2 py-0.5 text-stone-700 hover:border-amber-600 transition cursor-pointer"
              >
                👟 Red Sneaker
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageUrl("https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=700&q=80");
                  setPreviewError(false);
                }}
                className="rounded-md bg-white border border-stone-200 px-2 py-0.5 text-stone-700 hover:border-amber-600 transition cursor-pointer"
              >
                🧢 Sports Cap
              </button>
            </div>
          </div>

          {/* Variant Selector Tabs if multiple variants */}
          {variants.length > 1 && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Choose Variant to Update ({variants.length} available):
              </label>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.variant_id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.variant_id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      selectedVariantId === v.variant_id
                        ? "bg-stone-900 text-white shadow-sm ring-2 ring-stone-900"
                        : "bg-white border border-stone-300 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <span>ID #{v.variant_id}:</span>
                    <strong>{v.color_size}</strong>
                    <span className="text-[10px] opacity-80">(₹{v.selling_price})</span>
                    {v.discount_percent > 0 && (
                      <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[9px] font-bold">
                        {v.discount_percent}% OFF
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Alerts */}
          {successMessage && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-3.5 text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-fadeIn">
              <span className="text-base">✅</span>
              <span>{successMessage}</span>
            </div>
          )}

          {formErrors.submit && (
            <div className="rounded-2xl bg-red-50 border border-red-300 p-3.5 text-xs font-semibold text-red-900 flex items-center gap-2 animate-fadeIn">
              <span className="text-base">⚠️</span>
              <span>{formErrors.submit}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            {/* Selected Variant ID Badge */}
            <div className="flex items-center justify-between text-xs bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2 text-amber-900">
              <span className="font-bold flex items-center gap-1">
                <span>🎯 Target Variant ID:</span>
                <code className="bg-amber-200/80 px-1.5 py-0.5 rounded text-amber-950 font-bold">
                  #{activeVariant.variant_id}
                </code>
              </span>
              <span className="text-[11px] text-amber-800">
                Procedure: <code>sp_update_product_variant</code>
              </span>
            </div>

            {/* Color Size Field */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Option / Size (Color-Size) *
              </label>
              <input
                type="text"
                placeholder="e.g. Black-M, Navy-XL, 9-UK, Free-Size"
                value={colorSize}
                onChange={(e) => {
                  setColorSize(e.target.value);
                  if (formErrors.color_size) {
                    setFormErrors({ ...formErrors, color_size: null });
                  }
                }}
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none transition ${
                  formErrors.color_size
                    ? "border-red-500 ring-2 ring-red-100"
                    : "border-stone-300 focus:border-amber-700"
                }`}
              />
              {/* Quick suggestions */}
              <div className="mt-1.5 flex flex-wrap gap-1">
                {["Black-S", "Black-M", "Black-L", "Blue-M", "White-XL", "Free-Size"].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setColorSize(chip)}
                    className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] text-stone-600 hover:bg-stone-200 transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>
              {formErrors.color_size && (
                <p className="mt-1 text-[11px] font-semibold text-red-600">
                  {formErrors.color_size}
                </p>
              )}
            </div>

            {/* Selling Price Field */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Variant Selling Price (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-stone-400 font-bold">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 1999.00"
                  value={sellingPrice}
                  onChange={(e) => {
                    setSellingPrice(e.target.value);
                    if (formErrors.selling_price) {
                      setFormErrors({ ...formErrors, selling_price: null });
                    }
                  }}
                  className={`w-full rounded-xl border bg-white pl-8 pr-3.5 py-2.5 text-xs text-stone-900 focus:outline-none transition ${
                    formErrors.selling_price
                      ? "border-red-500 ring-2 ring-red-100"
                      : "border-stone-300 focus:border-amber-700"
                  }`}
                />
              </div>
              {formErrors.selling_price && (
                <p className="mt-1 text-[11px] font-semibold text-red-600">
                  {formErrors.selling_price}
                </p>
              )}
            </div>

            {/* Discount Percentage Field */}
            <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-stone-800">
                  🏷️ Variant Discount (% OFF)
                </label>
                <span className="text-[10px] text-stone-500 font-medium">
                  {Number(discountPercent) > 0 ? `${discountPercent}% Discount Active` : "No discount"}
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="90"
                  step="1"
                  placeholder="e.g. 30"
                  value={discountPercent}
                  onChange={(e) => {
                    setDiscountPercent(e.target.value);
                    if (formErrors.discount_percent) {
                      setFormErrors({ ...formErrors, discount_percent: null });
                    }
                  }}
                  className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none transition pr-8 ${
                    formErrors.discount_percent
                      ? "border-red-500 ring-2 ring-red-100"
                      : "border-stone-300 focus:border-amber-700"
                  }`}
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-stone-400 font-bold">%</span>
              </div>

              {/* Quick discount chip buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] text-stone-400 font-medium mr-1">Quick Select:</span>
                {[0, 10, 15, 20, 25, 30, 40, 50].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      setDiscountPercent(String(pct));
                      if (formErrors.discount_percent) {
                        setFormErrors({ ...formErrors, discount_percent: null });
                      }
                    }}
                    className={`rounded-lg px-2 py-0.5 text-[11px] font-bold transition cursor-pointer ${
                      Number(discountPercent) === pct
                        ? "bg-amber-700 text-white shadow-xs"
                        : "bg-white border border-stone-200 text-stone-700 hover:border-amber-500 hover:bg-amber-50/50"
                    }`}
                  >
                    {pct === 0 ? "0% (None)" : `${pct}%`}
                  </button>
                ))}
              </div>

              {formErrors.discount_percent && (
                <p className="mt-1 text-[11px] font-semibold text-red-600">
                  {formErrors.discount_percent}
                </p>
              )}

              {/* Real-time price breakdown preview */}
              {Number(sellingPrice) > 0 && (
                <div className="rounded-xl border border-stone-200 bg-white p-2.5 text-xs flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-stone-500 font-medium">Storefront Preview:</span>
                    {Number(discountPercent) > 0 ? (
                      <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white shadow-xs">
                        {discountPercent}% OFF
                      </span>
                    ) : (
                      <span className="rounded-full bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                        Regular Price
                      </span>
                    )}
                  </div>
                  {(() => {
                    const base = Number(sellingPrice) || 0;
                    const disc = Number(discountPercent) || 0;
                    const finalPayable = disc > 0 ? Math.round(base * (1 - disc / 100)) : base;
                    return (
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-sm font-black text-stone-900">
                          ₹{finalPayable.toLocaleString("en-IN")}
                        </span>
                        {disc > 0 && (
                          <>
                            <span className="text-xs text-stone-400 line-through font-medium">
                              ₹{base.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[11px] text-emerald-700 font-bold">
                              (Saves ₹{(base - finalPayable).toLocaleString("en-IN")})
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Active Status */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Variant Availability Status
              </label>
              <select
                value={isActive ? "1" : "0"}
                onChange={(e) => setIsActive(e.target.value === "1")}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-amber-700 focus:outline-none transition"
              >
                <option value="1">🟢 Active (Available for customers)</option>
                <option value="0">🔴 Inactive (Hidden / Discontinued)</option>
              </select>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-amber-700 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-800 active:scale-95 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Executing Procedure...</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>Save Changes (Photo & Variant)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditVariantModal;
