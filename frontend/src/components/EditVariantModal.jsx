import { useState, useEffect } from "react";
import { updateProductVariant } from "../services/api";

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

  // Form states
  const [colorSize, setColorSize] = useState(activeVariant?.color_size || "");
  const [sellingPrice, setSellingPrice] = useState(
    activeVariant?.selling_price !== undefined ? String(activeVariant.selling_price) : ""
  );
  const [isActive, setIsActive] = useState(
    activeVariant?.is_active !== undefined ? Boolean(activeVariant.is_active) : true
  );

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
      setIsActive(activeVariant.is_active !== undefined ? Boolean(activeVariant.is_active) : true);
      setFormErrors({});
      setSuccessMessage("");
    }
  }, [activeVariant?.variant_id]);

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

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        color_size: trimmedColor,
        selling_price: priceNum,
        is_active: isActive ? 1 : 0,
      };

      const res = await updateProductVariant(activeVariant.variant_id, payload);

      setSuccessMessage(
        `🎉 Variant #${activeVariant.variant_id} successfully updated using stored procedure "sp_update_product_variant"!`
      );

      if (onVariantUpdated) {
        await onVariantUpdated({
          ...activeVariant,
          ...payload,
          productId: product.id,
        });
      }
    } catch (err) {
      setFormErrors({ submit: err.message || "Failed to update variant in database." });
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
                <h3 className="text-lg font-bold">Update Product Variant</h3>
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold uppercase text-stone-950">
                  PL/SQL Stored Procedure
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Target Table: <code className="text-amber-300">product_variant</code> (via <code>sp_update_product_variant</code>)
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
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="h-16 w-16 rounded-xl object-cover border border-stone-200"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-200 px-2 py-0.5 rounded">
                  {product.brand || "Brand"} • {product.category || "Category"}
                </span>
                <span className="text-xs text-stone-400">Product #{product.id}</span>
              </div>
              <h4 className="text-sm font-bold text-stone-900 truncate mt-1">{product.name}</h4>
              <p className="text-xs text-stone-500">
                Base Catalog Price: <strong className="text-stone-800">₹{Number(product.price).toLocaleString("en-IN")}</strong>
              </p>
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
                    <span>Save & Update Variant</span>
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
