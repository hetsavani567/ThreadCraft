import { useState, useEffect } from "react";
import { fetchCategories, fetchBrands, createProduct } from "../services/api";

function EmployeePortal({
  isOpen,
  onClose,
  employee,
  products,
  onUpdateStock,
  onApplyStaffDiscount,
  staffDiscountActive,
  onProductCreated,
}) {
  const [activeTab, setActiveTab] = useState("inventory"); // "inventory" | "orders" | "pos" | "new-product"
  const [stockSuccess, setStockSuccess] = useState("");

  // Categories and Brands from Database
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Form State for Adding Product & Variant
  const initialFormState = {
    product_name: "",
    category_id: "",
    brand_id: "",
    base_price: "",
    product_description: "",
    image_url: "",
    color_size: "",
    selling_price: "",
    initial_stock: "25",
  };
  const [newProductForm, setNewProductForm] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [createSuccess, setCreateSuccess] = useState("");

  // Load Categories & Brands when portal opens
  useEffect(() => {
    if (isOpen) {
      fetchCategories()
        .then((cats) => {
          if (Array.isArray(cats)) setCategories(cats);
        })
        .catch((e) => console.warn("Could not load categories in portal", e));

      fetchBrands()
        .then((brs) => {
          if (Array.isArray(brs)) setBrands(brs);
        })
        .catch((e) => console.warn("Could not load brands in portal", e));
    }
  }, [isOpen]);

  // Simulated branch orders based on database sample_data.sql
  const [orders, setOrders] = useState([
    {
      order_id: 1,
      customer: "Rahul Mehta (Surat)",
      branch: "Surat Central",
      items: "Running T-Shirt (x2), Sports Cap (x1)",
      date: "2026-09-01",
      amount: 1997,
      status: "Completed",
      payment: "UPI - Paid",
    },
    {
      order_id: 2,
      customer: "Priya Shah (Surat)",
      branch: "Surat Central",
      items: "Running Shoes (x1)",
      date: "2026-09-05",
      amount: 3399,
      status: "Completed",
      payment: "Card + Cash - Paid",
    },
    {
      order_id: 3,
      customer: "Amit Patel (Ahmedabad)",
      branch: "Ahmedabad West",
      items: "Training Shorts (x3)",
      date: "2026-09-10",
      amount: 2595,
      status: "Completed",
      payment: "Cash - Paid",
    },
    {
      order_id: 4,
      customer: "Neha Verma (Mumbai)",
      branch: "Mumbai Andheri",
      items: "Hoodie Grey-L (x1), Navy-XL (x1)",
      date: "2026-09-15",
      amount: 3898,
      status: "Placed",
      payment: "UPI - Pending",
    },
    {
      order_id: 5,
      customer: "Rahul Mehta (Surat)",
      branch: "Ahmedabad West",
      items: "Running Shoes Black-8 (x1)",
      date: "2026-09-20",
      amount: 3499,
      status: "Cancelled",
      payment: "Refunded",
    },
  ]);

  if (!isOpen) return null;

  function handleQuickStock(productId, delta) {
    onUpdateStock(productId, delta);
    setStockSuccess(`Stock adjusted (${delta > 0 ? `+${delta}` : delta}) for product #${productId}`);
    setTimeout(() => setStockSuccess(""), 2500);
  }

  function handleOrderStatusChange(orderId, newStatus) {
    setOrders((prev) =>
      prev.map((ord) => (ord.order_id === orderId ? { ...ord, status: newStatus } : ord))
    );
  }

  // Helper to update form field and immediately clear its specific error
  function handleFieldChange(field, value) {
    setNewProductForm((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-populate selling_price if user is typing base_price and selling_price is empty
      if (field === "base_price" && (!prev.selling_price || prev.selling_price === prev.base_price)) {
        next.selling_price = value;
      }
      return next;
    });

    if (formErrors[field] || formErrors.submit) {
      setFormErrors((prev) => {
        const nextErrors = { ...prev };
        delete nextErrors[field];
        delete nextErrors.submit;
        return nextErrors;
      });
    }
  }

  // Handle New Product & Variant Submission with Strict Error Handling
  async function handleCreateProductSubmit(e) {
    e.preventDefault();
    setFormErrors({});
    setCreateSuccess("");

    const errors = {};

    // 1. Product Name Validation
    const trimmedName = (newProductForm.product_name || "").trim();
    if (!trimmedName) {
      errors.product_name = "Product name is required.";
    } else if (trimmedName.length < 3) {
      errors.product_name = "Product name must be at least 3 characters long.";
    } else if (trimmedName.length > 150) {
      errors.product_name = "Product name cannot exceed 150 characters.";
    }

    // 2. Category Validation
    const catId = Number(newProductForm.category_id);
    if (!newProductForm.category_id || isNaN(catId) || catId <= 0) {
      errors.category_id = "Please select a valid product category.";
    }

    // 3. Brand Validation
    const brId = Number(newProductForm.brand_id);
    if (!newProductForm.brand_id || isNaN(brId) || brId <= 0) {
      errors.brand_id = "Please select a valid brand.";
    }

    // 4. Base Price Validation
    const basePriceNum = Number(newProductForm.base_price);
    if (!newProductForm.base_price || isNaN(basePriceNum) || basePriceNum <= 0) {
      errors.base_price = "Base price must be a valid number greater than ₹0.";
    } else if (basePriceNum > 10000000) {
      errors.base_price = "Base price cannot exceed ₹1,00,00,000.";
    }

    // 5. Variant Option (Color-Size) Validation
    const trimmedColorSize = (newProductForm.color_size || "").trim();
    if (!trimmedColorSize) {
      errors.color_size = "Variant size/color is required (e.g. 'Black-M' or 'Free-Size').";
    } else if (trimmedColorSize.length > 50) {
      errors.color_size = "Variant description cannot exceed 50 characters.";
    }

    // 6. Variant Selling Price Validation
    const rawSellingPrice = newProductForm.selling_price || newProductForm.base_price;
    const sellingPriceNum = Number(rawSellingPrice);
    if (rawSellingPrice === undefined || rawSellingPrice === "" || isNaN(sellingPriceNum) || sellingPriceNum <= 0) {
      errors.selling_price = "Selling price must be a positive number greater than ₹0.";
    } else if (sellingPriceNum > 10000000) {
      errors.selling_price = "Selling price cannot exceed ₹1,00,00,000.";
    }

    // 7. Initial Stock Validation
    const stockVal = newProductForm.initial_stock;
    const stockNum = stockVal === "" ? 0 : Number(stockVal);
    if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      errors.initial_stock = "Stock quantity must be a non-negative whole integer (0 or more).";
    }

    // 8. Image URL Format Check (if provided)
    const trimmedImg = (newProductForm.image_url || "").trim();
    if (trimmedImg) {
      try {
        const parsed = new URL(trimmedImg);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          errors.image_url = "Image URL must start with http:// or https://";
        }
      } catch (_) {
        errors.image_url = "Please enter a valid image web URL or leave blank.";
      }
    }

    // 9. Description length check
    if (newProductForm.product_description && newProductForm.product_description.length > 500) {
      errors.product_description = "Description cannot exceed 500 characters.";
    }

    // If any validation failed, block submission and highlight fields
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        product_name: trimmedName,
        category_id: catId,
        brand_id: brId,
        base_price: basePriceNum,
        product_description: (newProductForm.product_description || "").trim(),
        image_url:
          trimmedImg ||
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80",
        color_size: trimmedColorSize,
        selling_price: sellingPriceNum,
        initial_stock: stockNum,
        branch_id: employee?.branch_id || 1,
      };

      const result = await createProduct(payload);

      setCreateSuccess(
        `🎉 Successfully registered "${payload.product_name}" with variant "${payload.color_size}" (Stock: ${payload.initial_stock}) in MySQL database!`
      );
      setNewProductForm(initialFormState);

      // Trigger instant live update in dashboard catalog
      if (onProductCreated) {
        await onProductCreated();
      }
    } catch (err) {
      setFormErrors({ submit: err.message || "Failed to add product to database." });
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-stone-200">
        {/* Header with Employee Badge */}
        <div className="bg-stone-900 p-6 text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30 font-bold text-xl">
              🏢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">ThreadCraft Staff Portal</h3>
                <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-stone-950">
                  {employee?.emp_role || "Staff Member"}
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Staff: <strong className="text-white">{employee?.name}</strong> • Branch:{" "}
                <span className="text-amber-300 font-medium">
                  {employee?.branch_name || "Surat Central"} (Branch #{employee?.branch_id || 1})
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-stone-800 p-2 text-stone-400 hover:bg-stone-700 hover:text-white transition cursor-pointer"
            aria-label="Close Staff Portal"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Tabs (Now 4 Staff Options) */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("inventory")}
            className={`border-b-2 px-4 py-3 text-sm font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "inventory"
                ? "border-amber-700 text-stone-900 bg-white"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            📦 Inventory Controls
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("new-product")}
            className={`border-b-2 px-4 py-3 text-sm font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "new-product"
                ? "border-amber-700 text-amber-900 bg-amber-50/50"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            ✨ Add Product & Variant
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`border-b-2 px-4 py-3 text-sm font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "orders"
                ? "border-amber-700 text-stone-900 bg-white"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            📋 Branch Orders ({orders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pos")}
            className={`border-b-2 px-4 py-3 text-sm font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === "pos"
                ? "border-amber-700 text-stone-900 bg-white"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            🏷️ POS & Staff Discount
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {stockSuccess && (
            <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fadeIn">
              <span>✅</span>
              <span>{stockSuccess}</span>
            </div>
          )}

          {/* ================= TAB 1: INVENTORY & STOCK ================= */}
          {activeTab === "inventory" && (
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-stone-900">Live Inventory Adjustment</h4>
                  <p className="text-xs text-stone-500">
                    Restock items or adjust branch quantities directly from this terminal.
                  </p>
                </div>
                <span className="text-xs bg-stone-100 rounded-lg px-2.5 py-1 text-stone-600 font-medium border border-stone-200">
                  Total Catalog: {products.length} Products
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-stone-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-600 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Brand / Cat</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Total Stock</th>
                      <th className="p-3">Stock Status</th>
                      <th className="p-3 text-center">Quick Adjust</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 bg-white">
                    {products.map((product) => {
                      const stock = product.total_stock ?? 0;
                      return (
                        <tr key={product.id} className="hover:bg-stone-50/80 transition">
                          <td className="p-3 font-bold text-stone-900 flex items-center gap-2">
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-8 w-8 rounded-lg object-cover"
                              />
                            )}
                            <span>{product.name}</span>
                          </td>
                          <td className="p-3 text-stone-500">
                            {product.brand} • {product.category}
                          </td>
                          <td className="p-3 font-semibold text-stone-900">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                          </td>
                          <td className="p-3 font-bold text-stone-900">{stock} units</td>
                          <td className="p-3">
                            {stock <= 0 ? (
                              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-800">
                                Out of Stock
                              </span>
                            ) : stock <= 15 ? (
                              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                                Low Stock
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                Healthy
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleQuickStock(product.id, -5)}
                                className="rounded bg-stone-100 px-2 py-1 font-bold text-stone-700 hover:bg-stone-200 transition"
                                title="Reduce 5 units"
                              >
                                -5
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickStock(product.id, 5)}
                                className="rounded bg-amber-800 px-2 py-1 font-bold text-white hover:bg-amber-900 transition"
                                title="Add 5 units"
                              >
                                +5
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickStock(product.id, 20)}
                                className="rounded bg-stone-900 px-2 py-1 font-bold text-white hover:bg-stone-800 transition"
                                title="Bulk Restock +20 units"
                              >
                                +20
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 2: ADD PRODUCT & VARIANT (NEW) ================= */}
          {activeTab === "new-product" && (
            <div>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-4">
                <div>
                  <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <span>✨</span> Staff Catalog Entry: Add Product & Initial Variant
                  </h4>
                  <p className="text-xs text-stone-500">
                    Inserts directly into MySQL <code>product</code>, <code>product_variant</code>, and <code>inventory</code> tables.
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-300">
                  Staff Verified Access
                </span>
              </div>

              {/* Success Notification */}
              {createSuccess && (
                <div className="mb-5 rounded-2xl bg-emerald-50 border border-emerald-300 p-4 text-sm font-semibold text-emerald-900 flex items-center justify-between gap-3 animate-fadeIn shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">✅</span>
                    <span>{createSuccess}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCreateSuccess("")}
                    className="text-xs text-emerald-700 hover:underline cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* General Submission Error */}
              {formErrors.submit && (
                <div className="mb-5 rounded-2xl bg-red-50 border border-red-300 p-4 text-sm font-semibold text-red-900 flex items-center gap-2 animate-fadeIn shadow-xs">
                  <span className="text-xl">⚠️</span>
                  <span>{formErrors.submit}</span>
                </div>
              )}

              <form onSubmit={handleCreateProductSubmit} className="space-y-6">
                {/* --- Section 1: Main Product Details --- */}
                <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                      <span>1️⃣</span> Product Information (Parent Table)
                    </h5>
                    <span className="text-[11px] text-stone-400">* Required fields</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Product Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Vintage Wash Denim Jacket, Silk Kurta, Running Pro Shoes"
                        value={newProductForm.product_name}
                        onChange={(e) => handleFieldChange("product_name", e.target.value)}
                        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none transition ${
                          formErrors.product_name
                            ? "border-red-500 ring-2 ring-red-100"
                            : "border-stone-300 focus:border-amber-700"
                        }`}
                      />
                      {formErrors.product_name && (
                        <p className="mt-1 text-[11px] font-semibold text-red-600">
                          {formErrors.product_name}
                        </p>
                      )}
                    </div>

                    {/* Category Select */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Category *
                      </label>
                      <select
                        value={newProductForm.category_id}
                        onChange={(e) => handleFieldChange("category_id", e.target.value)}
                        className={`w-full rounded-xl border bg-white px-3 py-2.5 text-xs text-stone-900 focus:outline-none transition ${
                          formErrors.category_id
                            ? "border-red-500 ring-2 ring-red-100"
                            : "border-stone-300 focus:border-amber-700"
                        }`}
                      >
                        <option value="">-- Choose Category --</option>
                        {categories.map((c) => (
                          <option key={c.category_id} value={c.category_id}>
                            {c.category_type} (ID: #{c.category_id})
                          </option>
                        ))}
                      </select>
                      {formErrors.category_id && (
                        <p className="mt-1 text-[11px] font-semibold text-red-600">
                          {formErrors.category_id}
                        </p>
                      )}
                    </div>

                    {/* Brand Select */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Brand *
                      </label>
                      <select
                        value={newProductForm.brand_id}
                        onChange={(e) => handleFieldChange("brand_id", e.target.value)}
                        className={`w-full rounded-xl border bg-white px-3 py-2.5 text-xs text-stone-900 focus:outline-none transition ${
                          formErrors.brand_id
                            ? "border-red-500 ring-2 ring-red-100"
                            : "border-stone-300 focus:border-amber-700"
                        }`}
                      >
                        <option value="">-- Choose Brand --</option>
                        {brands.map((b) => (
                          <option key={b.brand_id} value={b.brand_id}>
                            {b.brand_name} (ID: #{b.brand_id})
                          </option>
                        ))}
                      </select>
                      {formErrors.brand_id && (
                        <p className="mt-1 text-[11px] font-semibold text-red-600">
                          {formErrors.brand_id}
                        </p>
                      )}
                    </div>

                    {/* Base Price */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Base Price (₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-xs text-stone-400 font-bold">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="e.g. 1499.00"
                          value={newProductForm.base_price}
                          onChange={(e) => handleFieldChange("base_price", e.target.value)}
                          className={`w-full rounded-xl border bg-white pl-8 pr-3.5 py-2.5 text-xs text-stone-900 focus:outline-none transition ${
                            formErrors.base_price
                              ? "border-red-500 ring-2 ring-red-100"
                              : "border-stone-300 focus:border-amber-700"
                          }`}
                        />
                      </div>
                      {formErrors.base_price && (
                        <p className="mt-1 text-[11px] font-semibold text-red-600">
                          {formErrors.base_price}
                        </p>
                      )}
                    </div>

                    {/* Image URL */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Image URL (Optional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={newProductForm.image_url}
                        onChange={(e) => handleFieldChange("image_url", e.target.value)}
                        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none transition ${
                          formErrors.image_url
                            ? "border-red-500 ring-2 ring-red-100"
                            : "border-stone-300 focus:border-amber-700"
                        }`}
                      />
                      {formErrors.image_url && (
                        <p className="mt-1 text-[11px] font-semibold text-red-600">
                          {formErrors.image_url}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-stone-700">
                          Product Description
                        </label>
                        <span className="text-[10px] text-stone-400">
                          {newProductForm.product_description.length}/500 chars
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        maxLength={500}
                        placeholder="Breathable cotton fabric with comfort fit, ideal for casual and daily wear..."
                        value={newProductForm.product_description}
                        onChange={(e) => handleFieldChange("product_description", e.target.value)}
                        className={`w-full rounded-xl border bg-white px-3.5 py-2 text-xs text-stone-900 focus:outline-none transition ${
                          formErrors.product_description
                            ? "border-red-500 ring-2 ring-red-100"
                            : "border-stone-300 focus:border-amber-700"
                        }`}
                      />
                      {formErrors.product_description && (
                        <p className="mt-1 text-[11px] font-semibold text-red-600">
                          {formErrors.product_description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* --- Section 2: Product Variant & Stock --- */}
                <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                      <span>2️⃣</span> Initial Variant & Stock (Child Tables: <code>product_variant</code> & <code>inventory</code>)
                    </h5>
                    <span className="text-[11px] text-amber-800 font-semibold">
                      Auto-allocated to Branch #{employee?.branch_id || 1}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Variant Option / Size */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Option / Size (Color-Size) *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Black-M, Navy-XL, 9-UK"
                        value={newProductForm.color_size}
                        onChange={(e) => handleFieldChange("color_size", e.target.value)}
                        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none transition ${
                          formErrors.color_size
                            ? "border-red-500 ring-2 ring-red-100"
                            : "border-stone-300 focus:border-amber-700"
                        }`}
                      />
                      {/* Quick chips */}
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {["Black-M", "Blue-L", "White-XL", "Free-Size"].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => handleFieldChange("color_size", chip)}
                            className="rounded-md bg-stone-200 px-1.5 py-0.5 text-[10px] text-stone-700 hover:bg-stone-300 transition"
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

                    {/* Variant Selling Price */}
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
                          placeholder="e.g. 1499.00"
                          value={newProductForm.selling_price}
                          onChange={(e) => handleFieldChange("selling_price", e.target.value)}
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

                    {/* Initial Stock */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Initial Stock Quantity *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="e.g. 50"
                        value={newProductForm.initial_stock}
                        onChange={(e) => handleFieldChange("initial_stock", e.target.value)}
                        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none transition ${
                          formErrors.initial_stock
                            ? "border-red-500 ring-2 ring-red-100"
                            : "border-stone-300 focus:border-amber-700"
                        }`}
                      />
                      {formErrors.initial_stock && (
                        <p className="mt-1 text-[11px] font-semibold text-red-600">
                          {formErrors.initial_stock}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewProductForm(initialFormState);
                      setFormErrors({});
                    }}
                    className="rounded-full border border-stone-300 px-5 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                  >
                    Reset Form
                  </button>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-amber-700 px-7 py-3 text-sm font-bold text-white shadow-md hover:bg-amber-800 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                  >
                    {formLoading ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <span>Saving to MySQL...</span>
                      </>
                    ) : (
                      <>
                        <span>💾</span>
                        <span>Save Product & Variant to Database</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= TAB 3: ORDERS ================= */}
          {activeTab === "orders" && (
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-stone-900">Branch Orders Management</h4>
                  <p className="text-xs text-stone-500">
                    Live branch status records from database tables.
                  </p>
                </div>
                <span className="text-xs bg-stone-100 rounded-lg px-2.5 py-1 text-stone-600 font-medium border border-stone-200">
                  {orders.length} Active Orders
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-stone-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-600 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Items Summary</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 bg-white">
                    {orders.map((ord) => (
                      <tr key={ord.order_id} className="hover:bg-stone-50/80 transition">
                        <td className="p-3 font-mono font-bold text-stone-900">
                          #{ord.order_id}
                        </td>
                        <td className="p-3 font-medium text-stone-800">{ord.customer}</td>
                        <td className="p-3 text-stone-500 max-w-xs truncate">{ord.items}</td>
                        <td className="p-3 font-semibold text-stone-900">
                          ₹{ord.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 text-stone-600">{ord.payment}</td>
                        <td className="p-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              ord.status === "Completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : ord.status === "Cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              handleOrderStatusChange(ord.order_id, e.target.value)
                            }
                            className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-[11px] font-medium text-stone-700"
                          >
                            <option value="Placed">Placed</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 4: POS & STAFF DISCOUNT ================= */}
          {activeTab === "pos" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block mb-1">
                      Staff Privilege Feature
                    </span>
                    <h4 className="text-lg font-black text-amber-950">
                      20% Staff Purchase Discount
                    </h4>
                    <p className="text-xs text-amber-800/80 mt-1 max-w-lg">
                      Enable the storewide 20% discount on in-store checkout for verified employees of ThreadCraft.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold ${
                        staffDiscountActive ? "text-emerald-700" : "text-stone-500"
                      }`}
                    >
                      {staffDiscountActive ? "Discount ACTIVE" : "Discount Inactive"}
                    </span>
                    <button
                      type="button"
                      onClick={() => onApplyStaffDiscount(!staffDiscountActive)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer ${
                        staffDiscountActive ? "bg-emerald-600" : "bg-stone-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          staffDiscountActive ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <h4 className="font-bold text-stone-900 mb-1">Cashier Fast POS Receipt</h4>
                <p className="text-xs text-stone-500 mb-4">
                  Quick in-store order verification with GST calculation.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl bg-stone-50 p-3 border border-stone-200">
                    <span className="text-stone-400 block font-medium">Assigned Branch</span>
                    <strong className="text-stone-800 text-sm">
                      {employee?.branch_name || "Surat Central"}
                    </strong>
                  </div>
                  <div className="rounded-xl bg-stone-50 p-3 border border-stone-200">
                    <span className="text-stone-400 block font-medium">Cashier ID</span>
                    <strong className="text-stone-800 text-sm font-mono">
                      EMP-#{employee?.emp_id || 101}
                    </strong>
                  </div>
                  <div className="rounded-xl bg-stone-50 p-3 border border-stone-200">
                    <span className="text-stone-400 block font-medium">Shift Status</span>
                    <strong className="text-emerald-700 text-sm">Active & Verified</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 bg-stone-50 p-4 px-6 flex items-center justify-between text-xs text-stone-500">
          <span>ThreadCraft Retail Management System • Staff Access Only</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-stone-900 px-5 py-2 font-semibold text-white hover:bg-amber-700 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmployeePortal;
