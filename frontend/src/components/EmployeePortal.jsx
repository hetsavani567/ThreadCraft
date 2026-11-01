import { useState, useEffect, useMemo } from "react";
import { fetchCategories, fetchBrands, createProduct, addProductVariant } from "../services/api";
import BannerManager from "./BannerManager.jsx";

function EmployeePortal({
  isOpen,
  onClose,
  employee,
  products = [],
  onUpdateStock,
  onApplyStaffDiscount,
  staffDiscountActive,
  onProductCreated,
  bannerSlides = [],
  onUpdateBannerSlides,
}) {
  const [activeTab, setActiveTab] = useState("inventory"); // "inventory" | "new-product" | "orders" | "pos" | "banner"
  const [stockSuccess, setStockSuccess] = useState("");

  // Inventory filtering & search
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState("all"); // "all" | "healthy" | "low" | "out"

  // Orders filtering & search
  const [ordersSearch, setOrdersSearch] = useState("");
  const [ordersFilter, setOrdersFilter] = useState("all");

  // Mobile sidebar toggle
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // POS Calculator Simulator State
  const [posItemPrice, setPosItemPrice] = useState("2499");
  const [posItemQty, setPosItemQty] = useState("1");

  // Categories and Brands from Database
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Catalog Sub-Mode: "product-only" | "variant-only" | "both"
  const [catalogMode, setCatalogMode] = useState("product-only");
  const [lastCreatedProductId, setLastCreatedProductId] = useState(null);

  // 1. Form State: Adding Product Only
  const initialProductOnlyState = {
    product_name: "",
    category_id: "",
    brand_id: "",
    product_description: "",
    image_url: "",
  };
  const [productOnlyForm, setProductOnlyForm] = useState(initialProductOnlyState);
  const [productOnlyErrors, setProductOnlyErrors] = useState({});
  const [productOnlyLoading, setProductOnlyLoading] = useState(false);
  const [productOnlySuccess, setProductOnlySuccess] = useState("");

  // 2. Form State: Adding Product Variant Only
  const initialVariantOnlyState = {
    product_id: "",
    color_size: "",
    selling_price: "",
    discount_percent: "0",
    initial_stock: "25",
  };
  const [variantOnlyForm, setVariantOnlyForm] = useState(initialVariantOnlyState);
  const [variantOnlyErrors, setVariantOnlyErrors] = useState({});
  const [variantOnlyLoading, setVariantOnlyLoading] = useState(false);
  const [variantOnlySuccess, setVariantOnlySuccess] = useState("");

  // 3. Form State: Adding Both Product & Variant (Bundle)
  const initialFormState = {
    product_name: "",
    category_id: "",
    brand_id: "",
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

  // Orders State
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

  // Escape key handler
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Metrics for Top KPI Bar
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => (p.total_stock ?? 0) <= 15 && (p.total_stock ?? 0) > 0);
  }, [products]);

  const outOfStockProducts = useMemo(() => {
    return products.filter((p) => (p.total_stock ?? 0) <= 0);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const stock = p.total_stock ?? 0;
      if (inventoryFilter === "healthy" && stock <= 15) return false;
      if (inventoryFilter === "low" && (stock > 15 || stock <= 0)) return false;
      if (inventoryFilter === "out" && stock > 0) return false;

      if (!inventorySearch.trim()) return true;
      const q = inventorySearch.toLowerCase();
      return (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        String(p.id).includes(q)
      );
    });
  }, [products, inventoryFilter, inventorySearch]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (ordersFilter !== "all" && o.status !== ordersFilter) return false;
      if (!ordersSearch.trim()) return true;
      const q = ordersSearch.toLowerCase();
      return (
        String(o.order_id).includes(q) ||
        (o.customer && o.customer.toLowerCase().includes(q)) ||
        (o.items && o.items.toLowerCase().includes(q))
      );
    });
  }, [orders, ordersFilter, ordersSearch]);

  // Target product for Variant-Only mode (lookup by entered/selected Product ID)
  const selectedTargetProduct = useMemo(() => {
    if (!variantOnlyForm.product_id) return null;
    const pId = Number(variantOnlyForm.product_id);
    if (isNaN(pId) || pId <= 0) return null;
    return products.find((p) => p.id === pId) || null;
  }, [products, variantOnlyForm.product_id]);

  async function handleQuickStock(productId, delta) {
    if (onUpdateStock) {
      await onUpdateStock(productId, delta);
    }
    setStockSuccess(`Stock adjusted (${delta > 0 ? `+${delta}` : delta}) for product #${productId} & saved to MySQL database`);
    setTimeout(() => setStockSuccess(""), 3000);
  }

  function handleOrderStatusChange(orderId, newStatus) {
    setOrders((prev) =>
      prev.map((ord) => (ord.order_id === orderId ? { ...ord, status: newStatus } : ord))
    );
  }

  function handleProductOnlyFieldChange(field, value) {
    setProductOnlyForm((prev) => ({ ...prev, [field]: value }));
    if (productOnlyErrors[field] || productOnlyErrors.submit) {
      setProductOnlyErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        delete next.submit;
        return next;
      });
    }
  }

  async function handleCreateProductOnlySubmit(e) {
    e.preventDefault();
    setProductOnlyErrors({});
    setProductOnlySuccess("");

    const errors = {};
    const trimmedName = (productOnlyForm.product_name || "").trim();
    if (!trimmedName) {
      errors.product_name = "Product name is required.";
    } else if (trimmedName.length < 3) {
      errors.product_name = "Product name must be at least 3 characters long.";
    } else if (trimmedName.length > 150) {
      errors.product_name = "Product name cannot exceed 150 characters.";
    }

    const catId = Number(productOnlyForm.category_id);
    if (!productOnlyForm.category_id || isNaN(catId) || catId <= 0) {
      errors.category_id = "Please select a valid product category.";
    }

    const brId = Number(productOnlyForm.brand_id);
    if (!productOnlyForm.brand_id || isNaN(brId) || brId <= 0) {
      errors.brand_id = "Please select a valid brand.";
    }

    // MANDATORY Product Image URL
    const trimmedImg = (productOnlyForm.image_url || "").trim();
    if (!trimmedImg) {
      errors.image_url = "Product image web URL is mandatory.";
    } else {
      try {
        const parsed = new URL(trimmedImg);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          errors.image_url = "Image URL must start with http:// or https://";
        }
      } catch (_) {
        errors.image_url = "Please enter a valid image web URL.";
      }
    }

    if (productOnlyForm.product_description && productOnlyForm.product_description.length > 500) {
      errors.product_description = "Description cannot exceed 500 characters.";
    }

    if (Object.keys(errors).length > 0) {
      setProductOnlyErrors(errors);
      return;
    }

    setProductOnlyLoading(true);
    try {
      const payload = {
        product_name: trimmedName,
        category_id: catId,
        brand_id: brId,
        product_description: (productOnlyForm.product_description || "").trim(),
        image_url: trimmedImg,
        product_only: true,
      };

      const res = await createProduct(payload);
      const newId = res?.product?.id || res?.product?.product_id;
      if (newId) setLastCreatedProductId(newId);

      setProductOnlySuccess(
        newId
          ? `Product #${newId} - "${payload.product_name}" created successfully in MySQL product table!`
          : `Product "${payload.product_name}" created successfully in MySQL product table!`
      );
      setProductOnlyForm(initialProductOnlyState);

      if (onProductCreated) {
        await onProductCreated();
      }
    } catch (err) {
      setProductOnlyErrors({ submit: err.message || "Failed to add product to database." });
    } finally {
      setProductOnlyLoading(false);
    }
  }

  function handleVariantOnlyFieldChange(field, value) {
    setVariantOnlyForm((prev) => ({ ...prev, [field]: value }));
    if (variantOnlyErrors[field] || variantOnlyErrors.submit) {
      setVariantOnlyErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        delete next.submit;
        return next;
      });
    }
  }

  async function handleCreateVariantOnlySubmit(e) {
    e.preventDefault();
    setVariantOnlyErrors({});
    setVariantOnlySuccess("");

    const errors = {};
    const pId = Number(variantOnlyForm.product_id);
    if (!variantOnlyForm.product_id || isNaN(pId) || pId <= 0) {
      errors.product_id = "Please enter or select a valid Product ID.";
    }

    const trimmedColorSize = (variantOnlyForm.color_size || "").trim();
    if (!trimmedColorSize) {
      errors.color_size = "Variant size/color is required (e.g. 'Black-M' or 'Free-Size').";
    } else if (trimmedColorSize.length > 50) {
      errors.color_size = "Variant description cannot exceed 50 characters.";
    }

    const priceNum = Number(variantOnlyForm.selling_price);
    if (!variantOnlyForm.selling_price || isNaN(priceNum) || priceNum <= 0) {
      errors.selling_price = "Selling price must be a positive number greater than ₹0.";
    } else if (priceNum > 10000000) {
      errors.selling_price = "Selling price cannot exceed ₹1,00,00,000.";
    }

    const discountNum = Number(variantOnlyForm.discount_percent);
    if (
      variantOnlyForm.discount_percent !== "" &&
      (isNaN(discountNum) || discountNum < 0 || discountNum > 90)
    ) {
      errors.discount_percent = "Discount percentage must be between 0% and 90%.";
    }

    const stockVal = variantOnlyForm.initial_stock;
    const stockNum = stockVal === "" ? 0 : Number(stockVal);
    if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      errors.initial_stock = "Stock quantity must be a non-negative whole integer (0 or more).";
    }

    if (Object.keys(errors).length > 0) {
      setVariantOnlyErrors(errors);
      return;
    }

    setVariantOnlyLoading(true);
    try {
      const payload = {
        color_size: trimmedColorSize,
        selling_price: priceNum,
        discount_percent: Math.round(discountNum || 0),
        initial_stock: stockNum,
        branch_id: employee?.branch_id || 1,
      };

      await addProductVariant(pId, payload);
      const targetName = selectedTargetProduct?.name ? ` to "${selectedTargetProduct.name}"` : "";

      setVariantOnlySuccess(
        `Variant "${trimmedColorSize}" (₹${priceNum}, Stock: ${stockNum}) successfully added${targetName} (Product #${pId}) in MySQL database!`
      );
      setVariantOnlyForm((prev) => ({
        ...initialVariantOnlyState,
        product_id: prev.product_id,
      }));

      if (onProductCreated) {
        await onProductCreated();
      }
    } catch (err) {
      setVariantOnlyErrors({ submit: err.message || "Failed to add variant to product." });
    } finally {
      setVariantOnlyLoading(false);
    }
  }

  function handleFieldChange(field, value) {
    setNewProductForm((prev) => ({ ...prev, [field]: value }));

    if (formErrors[field] || formErrors.submit) {
      setFormErrors((prev) => {
        const nextErrors = { ...prev };
        delete nextErrors[field];
        delete nextErrors.submit;
        return nextErrors;
      });
    }
  }

  async function handleCreateProductSubmit(e) {
    e.preventDefault();
    setFormErrors({});
    setCreateSuccess("");

    const errors = {};

    const trimmedName = (newProductForm.product_name || "").trim();
    if (!trimmedName) {
      errors.product_name = "Product name is required.";
    } else if (trimmedName.length < 3) {
      errors.product_name = "Product name must be at least 3 characters long.";
    } else if (trimmedName.length > 150) {
      errors.product_name = "Product name cannot exceed 150 characters.";
    }

    const catId = Number(newProductForm.category_id);
    if (!newProductForm.category_id || isNaN(catId) || catId <= 0) {
      errors.category_id = "Please select a valid product category.";
    }

    const brId = Number(newProductForm.brand_id);
    if (!newProductForm.brand_id || isNaN(brId) || brId <= 0) {
      errors.brand_id = "Please select a valid brand.";
    }

    const trimmedColorSize = (newProductForm.color_size || "").trim();
    if (!trimmedColorSize) {
      errors.color_size = "Variant size/color is required (e.g. 'Black-M' or 'Free-Size').";
    } else if (trimmedColorSize.length > 50) {
      errors.color_size = "Variant description cannot exceed 50 characters.";
    }

    const sellingPriceNum = Number(newProductForm.selling_price);
    if (!newProductForm.selling_price || isNaN(sellingPriceNum) || sellingPriceNum <= 0) {
      errors.selling_price = "Selling price must be a positive number greater than ₹0.";
    } else if (sellingPriceNum > 10000000) {
      errors.selling_price = "Selling price cannot exceed ₹1,00,00,000.";
    }

    const stockVal = newProductForm.initial_stock;
    const stockNum = stockVal === "" ? 0 : Number(stockVal);
    if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      errors.initial_stock = "Stock quantity must be a non-negative whole integer (0 or more).";
    }

    // MANDATORY Product Image URL
    const trimmedImg = (newProductForm.image_url || "").trim();
    if (!trimmedImg) {
      errors.image_url = "Product image web URL is mandatory.";
    } else {
      try {
        const parsed = new URL(trimmedImg);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          errors.image_url = "Image URL must start with http:// or https://";
        }
      } catch (_) {
        errors.image_url = "Please enter a valid image web URL.";
      }
    }

    if (newProductForm.product_description && newProductForm.product_description.length > 500) {
      errors.product_description = "Description cannot exceed 500 characters.";
    }

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
        product_description: (newProductForm.product_description || "").trim(),
        image_url: trimmedImg,
        color_size: trimmedColorSize,
        selling_price: sellingPriceNum,
        initial_stock: stockNum,
        branch_id: employee?.branch_id || 1,
      };

      await createProduct(payload);

      setCreateSuccess(
        `🎉 Successfully registered "${payload.product_name}" with variant "${payload.color_size}" (Stock: ${payload.initial_stock}) in MySQL database!`
      );
      setNewProductForm(initialFormState);

      if (onProductCreated) {
        await onProductCreated();
      }
    } catch (err) {
      setFormErrors({ submit: err.message || "Failed to add product to database." });
    } finally {
      setFormLoading(false);
    }
  }

  // Navigation Items Definition
  const navItems = [
    {
      id: "inventory",
      label: "Inventory & Stock",
      icon: "📦",
      badge: `${products.length}`,
      alert: lowStockProducts.length > 0,
      description: "Live branch stock adjustments & replenishment",
    },
    {
      id: "new-product",
      label: "Add Product & Variant",
      icon: "✨",
      badge: "Create",
      alert: false,
      description: "Direct MySQL catalog insertion into tables",
    },
    {
      id: "orders",
      label: "Branch Orders",
      icon: "📋",
      badge: `${orders.length}`,
      alert: false,
      description: "Manage branch transactions & fulfilment",
    },
    {
      id: "pos",
      label: "POS & Staff Discount",
      icon: "🏷️",
      badge: staffDiscountActive ? "20% Active" : "Normal",
      alert: staffDiscountActive,
      description: "Cashier fast terminal & employee perks",
    },
    {
      id: "banner",
      label: "Banner Showcase",
      icon: "🖼️",
      badge: `${bannerSlides?.length || 0}`,
      alert: false,
      description: "Configure homepage visual promotions",
    },
  ];

  const currentTabObj = navItems.find((n) => n.id === activeTab) || navItems[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 sm:p-4 md:p-6 backdrop-blur-xs font-sans animate-fadeIn">
      <div className="relative flex h-[94vh] w-full max-w-[1440px] flex-col md:flex-row overflow-hidden rounded-3xl bg-stone-950 shadow-2xl border border-stone-800">
        {/* ========================================================================= */}
        {/* LEFT VERTICAL SIDEBAR                                                     */}
        {/* ========================================================================= */}
        <aside className="w-full md:w-72 lg:w-80 shrink-0 bg-stone-950 text-white flex flex-col border-b md:border-b-0 md:border-r border-stone-800/80 z-20">
          {/* Top Brand / Terminal Profile */}
          <div className="p-5 border-b border-stone-800/80 bg-gradient-to-b from-stone-900/90 to-stone-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xl font-black shadow-inner">
                  🏢
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold tracking-tight text-white text-base">ThreadCraft</span>
                    <span className="rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                      Staff POS
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 flex items-center gap-1.5 mt-0.5 font-medium">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{employee?.branch_name || "Surat Central"}</span>
                    <span className="text-stone-500">#{employee?.branch_id || 1}</span>
                  </p>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <div className="flex md:hidden items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-stone-400 hover:text-white bg-stone-900 border border-stone-800"
                  title="Close Terminal"
                >
                  ✕
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                  className="rounded-lg p-1.5 text-stone-300 hover:text-white bg-amber-600/30 border border-amber-500/40"
                  aria-label="Toggle Navigation"
                >
                  ☰
                </button>
              </div>
            </div>

            {/* Operator Card */}
            <div className="mt-4 rounded-2xl bg-stone-900/90 p-3 border border-stone-800/90 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center">
                  {(employee?.name || employee?.emp_name || "Staff").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-200 leading-tight">
                    {employee?.name || employee?.emp_name || "Verified Associate"}
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono">
                    ID: EMP-{employee?.emp_id || "101"} • {employee?.emp_role || "Staff"}
                  </div>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                Active
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav
            className={`p-3 space-y-1.5 overflow-y-auto flex-1 transition-all ${
              isMobileNavOpen ? "block" : "hidden md:block"
            }`}
          >
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-500">
              Terminal Workspaces
            </div>

            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileNavOpen(false);
                  }}
                  className={`w-full group flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-amber-600/25 to-stone-900 text-amber-300 border border-amber-500/40 shadow-sm"
                      : "text-stone-400 hover:text-stone-100 hover:bg-stone-900/70 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <div className="text-left">
                      <div className={`font-bold ${isActive ? "text-amber-200" : "text-stone-300"}`}>
                        {item.label}
                      </div>
                      <div className="text-[10px] text-stone-400 hidden lg:block leading-tight mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide transition-colors ${
                      isActive
                        ? "bg-amber-400 text-stone-950 font-black shadow-xs"
                        : item.alert
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-stone-800 text-stone-400 group-hover:bg-stone-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}

            {/* Sidebar Quick Widget: 20% Staff Purchase Privilege */}
            <div className="pt-3">
              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-900/90 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold text-sm">🏷️</span>
                    <span className="text-xs font-bold text-stone-200">Staff Privilege (20%)</span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                      staffDiscountActive
                        ? "bg-emerald-500 text-stone-950 shadow-xs"
                        : "bg-stone-800 text-stone-400"
                    }`}
                  >
                    {staffDiscountActive ? "ON" : "OFF"}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Toggle storewide 20% discount applied to in-store cashier invoices.
                </p>
                <button
                  type="button"
                  onClick={() => onApplyStaffDiscount(!staffDiscountActive)}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition cursor-pointer shadow-sm ${
                    staffDiscountActive
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : "bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700"
                  }`}
                >
                  <span>{staffDiscountActive ? "✓ 20% Discount ACTIVE" : "Activate 20% Discount"}</span>
                </button>
              </div>
            </div>
          </nav>

          {/* Sidebar Footer Controls */}
          <div className="p-3 border-t border-stone-800/80 bg-stone-950 hidden md:flex flex-col gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-stone-900 border border-stone-800 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:border-red-800/50 transition cursor-pointer"
              title="Exit Terminal"
            >
              <span>✕ Exit</span>
            </button>
            <div className="text-center text-[10px] text-stone-400 tracking-wider">
              ThreadCraft Terminal v2.4 • Shift Active
            </div>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* RIGHT MAIN CONTENT AREA                                                   */}
        {/* ========================================================================= */}
        <main className="flex-1 flex flex-col min-w-0 bg-stone-100 overflow-hidden">
          {/* Top Bar with View Title, KPI Metrics, and Window Controls */}
          <header className="bg-white border-b border-stone-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-xs shrink-0">
            {/* View Title & Context */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-800 border border-stone-200 text-lg">
                {currentTabObj.icon}
              </div>
              <div>
                <h3 className="text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
                  <span>{currentTabObj.label}</span>
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  {currentTabObj.description}
                </p>
              </div>
            </div>

            {/* Quick KPI Badges & Window Controls */}
            <div className="flex items-center gap-3">
              {/* Metric 1: Total Catalog */}
              <div className="hidden sm:flex items-center gap-2 rounded-xl bg-stone-50 border border-stone-200 px-3 py-1.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Catalog</span>
                <span className="text-xs font-black text-stone-900">{products.length}</span>
              </div>

              {/* Metric 2: Low Stock Warning */}
              <div
                className={`hidden sm:flex items-center gap-2 rounded-xl px-3 py-1.5 border ${
                  lowStockProducts.length > 0
                    ? "bg-amber-50 border-amber-200 text-amber-900"
                    : "bg-emerald-50 border-emerald-200 text-emerald-900"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {lowStockProducts.length > 0 ? "⚠️ Low Stock" : "✓ Inventory"}
                </span>
                <span className="text-xs font-black">
                  {lowStockProducts.length > 0 ? `${lowStockProducts.length} items` : "Healthy"}
                </span>
              </div>

              {/* Metric 3: Orders Count */}
              <div className="hidden lg:flex items-center gap-2 rounded-xl bg-stone-50 border border-stone-200 px-3 py-1.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Orders</span>
                <span className="text-xs font-black text-stone-900">{orders.length}</span>
              </div>

              {/* Close Window Control */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-stone-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-stone-200 bg-stone-50 p-2 text-stone-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition cursor-pointer"
                  title="Close Terminal"
                  aria-label="Close Staff Portal"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </header>

          {/* Body Content Canvas */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
            {/* Quick Success Toast */}
            {stockSuccess && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-3.5 text-xs font-bold text-emerald-900 flex items-center justify-between gap-3 animate-fadeIn shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base">✅</span>
                  <span>{stockSuccess}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStockSuccess("")}
                  className="text-emerald-700 hover:underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 1: INVENTORY & STOCK MANAGEMENT                                       */}
            {/* ========================================================================= */}
            {activeTab === "inventory" && (
              <div className="space-y-5">
                {/* Control Bar: Filters, Search, and Action Shortcut */}
                <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <span className="absolute left-3.5 top-3 text-stone-400">🔍</span>
                    <input
                      type="text"
                      placeholder="Search product, category, or brand..."
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50/70 pl-10 pr-4 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:border-amber-600 focus:outline-none transition"
                    />
                    {inventorySearch && (
                      <button
                        type="button"
                        onClick={() => setInventorySearch("")}
                        className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Stock Filter Chips */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInventoryFilter("all")}
                      className={`rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
                        inventoryFilter === "all"
                          ? "bg-stone-900 text-white shadow-xs"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      All ({products.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInventoryFilter("healthy")}
                      className={`rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
                        inventoryFilter === "healthy"
                          ? "bg-emerald-700 text-white shadow-xs"
                          : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      }`}
                    >
                      Healthy ({products.filter((p) => (p.total_stock ?? 0) > 15).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInventoryFilter("low")}
                      className={`rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
                        inventoryFilter === "low"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                      }`}
                    >
                      Low Stock ({lowStockProducts.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInventoryFilter("out")}
                      className={`rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
                        inventoryFilter === "out"
                          ? "bg-red-700 text-white shadow-xs"
                          : "bg-red-50 text-red-800 hover:bg-red-100"
                      }`}
                    >
                      Out of Stock ({outOfStockProducts.length})
                    </button>
                  </div>

                  {/* Add Product Shortcut */}
                  <button
                    type="button"
                    onClick={() => setActiveTab("new-product")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-500 transition cursor-pointer"
                  >
                    <span>✨</span>
                    <span>Add New Product</span>
                  </button>
                </div>

                {/* Products Table Card */}
                <div className="rounded-3xl border border-stone-200 bg-white shadow-xs overflow-hidden">
                  <div className="p-4 px-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/60">
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">Catalog Inventory Records</h4>
                      <p className="text-[11px] text-stone-500">
                        Adjust stock numbers live for Branch #{employee?.branch_id || 1} ({employee?.branch_name || "Surat Central"}).
                      </p>
                    </div>
                    <span className="text-xs font-bold text-stone-500">
                      Showing {filteredProducts.length} of {products.length} products
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-100/80 text-stone-600 uppercase font-bold text-[11px] tracking-wider border-b border-stone-200">
                        <tr>
                          <th className="py-3.5 px-4">Item & Code</th>
                          <th className="py-3.5 px-4">Brand / Category</th>
                          <th className="py-3.5 px-4">Price</th>
                          <th className="py-3.5 px-4">Current Stock</th>
                          <th className="py-3.5 px-4">Stock Health</th>
                          <th className="py-3.5 px-4 text-center">Quick Stock Adjust</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200">
                        {filteredProducts.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-12 text-center text-stone-400">
                              <div className="text-3xl mb-2">🔍</div>
                              <div className="font-bold text-sm text-stone-700">No matching products found</div>
                              <div className="text-xs text-stone-400 mt-1">Try clearing your search query or filter</div>
                            </td>
                          </tr>
                        ) : (
                          filteredProducts.map((product) => {
                            const stock = product.total_stock ?? 0;
                            return (
                              <tr key={product.id} className="hover:bg-amber-50/30 transition-colors">
                                <td className="py-3 px-4 font-bold text-stone-900">
                                  <div className="flex items-center gap-3">
                                    {product.image ? (
                                      <img
                                        src={product.image}
                                        alt={product.name}
                                        referrerPolicy="no-referrer"
                                        className="h-10 w-10 rounded-xl object-cover border border-stone-200 shrink-0"
                                      />
                                    ) : (
                                      <div className="h-10 w-10 rounded-xl bg-stone-200 text-stone-500 flex items-center justify-center font-bold shrink-0">
                                        👕
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-extrabold text-stone-900 leading-snug">{product.name}</div>
                                      <div className="text-[10px] font-mono text-stone-400">ID: #{product.id}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-stone-600">
                                  <span className="font-semibold text-stone-800">{product.brand}</span>
                                  <span className="text-stone-400 mx-1">•</span>
                                  <span className="text-stone-500">{product.category}</span>
                                </td>
                                <td className="py-3 px-4 font-black text-stone-900">
                                  ₹{Number(product.price).toLocaleString("en-IN")}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-black text-sm text-stone-900">{stock} units</div>
                                  <div className="w-24 bg-stone-200 h-1.5 rounded-full overflow-hidden mt-1">
                                    <div
                                      className={`h-full rounded-full ${
                                        stock <= 0
                                          ? "bg-red-500 w-0"
                                          : stock <= 15
                                          ? "bg-amber-500 w-1/3"
                                          : "bg-emerald-500 w-full"
                                      }`}
                                    />
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  {stock <= 0 ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 border border-red-200 px-2.5 py-0.5 text-[10px] font-extrabold text-red-800">
                                      <span>●</span> Out of Stock
                                    </span>
                                  ) : stock <= 15 ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800">
                                      <span>●</span> Low Stock ({stock})
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                                      <span>●</span> Healthy ({stock})
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <div className="inline-flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200">
                                    <button
                                      type="button"
                                      onClick={() => handleQuickStock(product.id, -5)}
                                      className="rounded-lg bg-white px-2.5 py-1 font-bold text-stone-700 hover:bg-stone-200 active:scale-95 transition cursor-pointer shadow-2xs"
                                      title="Deduct 5 units"
                                    >
                                      -5
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleQuickStock(product.id, 5)}
                                      className="rounded-lg bg-amber-600 px-2.5 py-1 font-bold text-white hover:bg-amber-500 active:scale-95 transition cursor-pointer shadow-2xs"
                                      title="Add 5 units"
                                    >
                                      +5
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleQuickStock(product.id, 20)}
                                      className="rounded-lg bg-stone-900 px-2.5 py-1 font-bold text-white hover:bg-stone-800 active:scale-95 transition cursor-pointer shadow-2xs"
                                      title="Bulk Restock +20 units"
                                    >
                                      +20
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: CATALOG MANAGEMENT (ADD PRODUCT / ADD VARIANT)                     */}
            {/* ========================================================================= */}
            {activeTab === "new-product" && (
              <div className="space-y-6">
                {/* Header Information Banner */}
                <div className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-amber-50/50 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h4 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                      <span>✨</span> MySQL Catalog Operations
                    </h4>
                    <p className="text-xs text-stone-600 mt-1">
                      Add standalone products to <code>product</code>, attach variants to existing products via <code>sp_add_product_variant</code>, or create both.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900">
                      Auto-Allocated to Branch #{employee?.branch_id || 1}
                    </span>
                  </div>
                </div>

<<<<<<< HEAD
                {/* Success Notification */}
                {createSuccess && (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-4 text-sm font-semibold text-emerald-900 flex items-center justify-between gap-3 animate-fadeIn shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎉</span>
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

                {/* Form General Error */}
                {formErrors.submit && (
                  <div className="rounded-2xl bg-red-50 border border-red-300 p-4 text-sm font-semibold text-red-900 flex items-center gap-2 animate-fadeIn shadow-xs">
                    <span className="text-xl">⚠️</span>
                    <span>{formErrors.submit}</span>
                  </div>
                )}

                <form onSubmit={handleCreateProductSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Main Product Details */}
                    <div className="lg:col-span-2 rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                        <h5 className="text-xs font-extrabold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                          <span>1️⃣</span> Product Information (Parent Table)
                        </h5>
                        <span className="text-[11px] text-stone-400 font-medium">* Required fields</span>
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
                            Base MRP Price (₹) *
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
                            Image Web URL (Optional)
                          </label>
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/..."
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
                            rows={3}
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

                    {/* Right 1 Col: Initial Variant & Stock + Preview */}
                    <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-5 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="border-b border-stone-200 pb-3">
                          <h5 className="text-xs font-extrabold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                            <span>2️⃣</span> Initial Variant & Stock
                          </h5>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Auto-creates initial SKU entry
                          </p>
                        </div>

                        {/* Color Size */}
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            Size / Option (Color-Size) *
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
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {["Black-M", "Blue-L", "White-XL", "Free-Size"].map((chip) => (
                              <button
                                key={chip}
                                type="button"
                                onClick={() => handleFieldChange("color_size", chip)}
                                className="rounded-md bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] text-stone-700 hover:bg-stone-200 transition cursor-pointer"
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

                        {/* Selling Price */}
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
                            Branch Initial Stock Quantity *
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

                      {/* Mini Live Preview Card */}
                      <div className="rounded-2xl bg-stone-50 border border-stone-200 p-3.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                          Live Catalog Preview
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-stone-200 overflow-hidden shrink-0 border border-stone-300 flex items-center justify-center text-lg">
                            {newProductForm.image_url ? (
                              <img
                                src={newProductForm.image_url}
                                alt="Preview"
                                referrerPolicy="no-referrer"
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              "👕"
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-xs text-stone-900 truncate">
                              {newProductForm.product_name || "New Product Title"}
                            </div>
                            <div className="text-[11px] font-black text-amber-800">
                              ₹{newProductForm.selling_price || newProductForm.base_price || "0.00"}
                            </div>
                            <div className="text-[10px] text-stone-500">
                              SKU: {newProductForm.color_size || "Option"} • Stock: {newProductForm.initial_stock || "0"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
=======
                {/* Sub-Mode Selector Pill Bar */}
                <div className="rounded-3xl border border-stone-200 bg-white p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
>>>>>>> 677ec24df5958ddaac8b9382eac3a8918ef17532
                    <button
                      type="button"
                      onClick={() => {
                        setCatalogMode("product-only");
                        setProductOnlySuccess("");
                        setVariantOnlySuccess("");
                        setCreateSuccess("");
                      }}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
                        catalogMode === "product-only"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      <span className="text-sm">📦</span>
                      <span>Add Product Only</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCatalogMode("variant-only");
                        setProductOnlySuccess("");
                        setVariantOnlySuccess("");
                        setCreateSuccess("");
                      }}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
                        catalogMode === "variant-only"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      <span className="text-sm">🎨</span>
                      <span>Add Product Variant Only</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCatalogMode("both");
                        setProductOnlySuccess("");
                        setVariantOnlySuccess("");
                        setCreateSuccess("");
                      }}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
                        catalogMode === "both"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      <span className="text-sm">✨</span>
                      <span>Both (Product + Variant)</span>
                    </button>
                  </div>
                  <div className="text-[11px] font-semibold text-stone-500 pr-2">
                    {catalogMode === "product-only" && "Creates entry in product table • Web link mandatory"}
                    {catalogMode === "variant-only" && "Select or type Product ID to attach new variant & stock"}
                    {catalogMode === "both" && "Full insertion into product, variant & inventory tables"}
                  </div>
                </div>

                {/* ------------------------------------------------------------------------- */}
                {/* SUB-MODE 1: ADD PRODUCT ONLY                                              */}
                {/* ------------------------------------------------------------------------- */}
                {catalogMode === "product-only" && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Success Notification */}
                    {productOnlySuccess && (
                      <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-4 text-sm font-semibold text-emerald-900 flex flex-wrap items-center justify-between gap-3 animate-fadeIn shadow-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🎉</span>
                          <span>{productOnlySuccess}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {lastCreatedProductId && (
                            <button
                              type="button"
                              onClick={() => {
                                setVariantOnlyForm((prev) => ({
                                  ...prev,
                                  product_id: String(lastCreatedProductId),
                                }));
                                setCatalogMode("variant-only");
                                setProductOnlySuccess("");
                              }}
                              className="rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3.5 py-1.5 transition cursor-pointer shadow-xs"
                            >
                              ➕ Add Variant for Product #{lastCreatedProductId}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setProductOnlySuccess("")}
                            className="text-xs text-emerald-700 hover:underline cursor-pointer"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    )}

                    {/* General Error */}
                    {productOnlyErrors.submit && (
                      <div className="rounded-2xl bg-red-50 border border-red-300 p-4 text-sm font-semibold text-red-900 flex items-center gap-2 animate-fadeIn shadow-xs">
                        <span className="text-xl">⚠️</span>
                        <span>{productOnlyErrors.submit}</span>
                      </div>
                    )}

                    <form onSubmit={handleCreateProductOnlySubmit} className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left 2 Cols: Product Details */}
                        <div className="lg:col-span-2 rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
                          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                            <h5 className="text-xs font-extrabold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                              <span>📦</span> Product Master Record (product Table)
                            </h5>
                            <span className="text-[11px] text-stone-400 font-medium">* Required fields</span>
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
                                value={productOnlyForm.product_name}
                                onChange={(e) => handleProductOnlyFieldChange("product_name", e.target.value)}
                                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none transition ${
                                  productOnlyErrors.product_name
                                    ? "border-red-500 ring-2 ring-red-100"
                                    : "border-stone-300 focus:border-amber-700"
                                }`}
                              />
                              {productOnlyErrors.product_name && (
                                <p className="mt-1 text-[11px] font-semibold text-red-600">
                                  {productOnlyErrors.product_name}
                                </p>
                              )}
                            </div>

                            {/* Category Select */}
                            <div>
                              <label className="block text-xs font-bold text-stone-700 mb-1">
                                Category *
                              </label>
                              <select
                                value={productOnlyForm.category_id}
                                onChange={(e) => handleProductOnlyFieldChange("category_id", e.target.value)}
                                className={`w-full rounded-xl border bg-white px-3 py-2.5 text-xs text-stone-900 focus:outline-none transition ${
                                  productOnlyErrors.category_id
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
                              {productOnlyErrors.category_id && (
                                <p className="mt-1 text-[11px] font-semibold text-red-600">
                                  {productOnlyErrors.category_id}
                                </p>
                              )}
                            </div>

                            {/* Brand Select */}
                            <div>
                              <label className="block text-xs font-bold text-stone-700 mb-1">
                                Brand *
                              </label>
                              <select
                                value={productOnlyForm.brand_id}
                                onChange={(e) => handleProductOnlyFieldChange("brand_id", e.target.value)}
                                className={`w-full rounded-xl border bg-white px-3 py-2.5 text-xs text-stone-900 focus:outline-none transition ${
                                  productOnlyErrors.brand_id
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
                              {productOnlyErrors.brand_id && (
                                <p className="mt-1 text-[11px] font-semibold text-red-600">
                                  {productOnlyErrors.brand_id}
                                </p>
                              )}
                            </div>

                            {/* Mandatory Product Photo URL */}
                            <div className="sm:col-span-2">
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-bold text-stone-700">
                                  Product Photo Web URL * <span className="text-amber-800 text-[10px] font-bold">(Mandatory)</span>
                                </label>
                                <span className="text-[10px] text-stone-400">Must start with http:// or https://</span>
                              </div>
                              <input
                                type="url"
                                placeholder="https://images.unsplash.com/..."
                                value={productOnlyForm.image_url}
                                onChange={(e) => handleProductOnlyFieldChange("image_url", e.target.value)}
                                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none transition ${
                                  productOnlyErrors.image_url
                                    ? "border-red-500 ring-2 ring-red-100"
                                    : "border-stone-300 focus:border-amber-700"
                                }`}
                              />
                              {productOnlyErrors.image_url && (
                                <p className="mt-1 text-[11px] font-semibold text-red-600">
                                  {productOnlyErrors.image_url}
                                </p>
                              )}
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-bold text-stone-500">Quick Demo Links:</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleProductOnlyFieldChange(
                                      "image_url",
                                      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80"
                                    )
                                  }
                                  className="rounded-md bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] text-stone-700 hover:bg-stone-200 transition cursor-pointer"
                                >
                                  👕 White T-Shirt
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleProductOnlyFieldChange(
                                      "image_url",
                                      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=700&q=80"
                                    )
                                  }
                                  className="rounded-md bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] text-stone-700 hover:bg-stone-200 transition cursor-pointer"
                                >
                                  🧥 Grey Hoodie
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleProductOnlyFieldChange(
                                      "image_url",
                                      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80"
                                    )
                                  }
                                  className="rounded-md bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] text-stone-700 hover:bg-stone-200 transition cursor-pointer"
                                >
                                  👟 Red Sneaker
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleProductOnlyFieldChange(
                                      "image_url",
                                      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=700&q=80"
                                    )
                                  }
                                  className="rounded-md bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] text-stone-700 hover:bg-stone-200 transition cursor-pointer"
                                >
                                  🧢 Sports Cap
                                </button>
                              </div>
                            </div>

                            {/* Description */}
                            <div className="sm:col-span-2">
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-bold text-stone-700">
                                  Product Description (Optional)
                                </label>
                                <span className="text-[10px] text-stone-400">
                                  {productOnlyForm.product_description.length}/500 chars
                                </span>
                              </div>
                              <textarea
                                rows={3}
                                maxLength={500}
                                placeholder="Breathable cotton fabric with comfort fit, ideal for casual and daily wear..."
                                value={productOnlyForm.product_description}
                                onChange={(e) => handleProductOnlyFieldChange("product_description", e.target.value)}
                                className={`w-full rounded-xl border bg-white px-3.5 py-2 text-xs text-stone-900 focus:outline-none transition ${
                                  productOnlyErrors.product_description
                                    ? "border-red-500 ring-2 ring-red-100"
                                    : "border-stone-300 focus:border-amber-700"
                                }`}
                              />
                              {productOnlyErrors.product_description && (
                                <p className="mt-1 text-[11px] font-semibold text-red-600">
                                  {productOnlyErrors.product_description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right 1 Col: Live Product Preview */}
                        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4 flex flex-col justify-between">
                          <div>
                            <div className="border-b border-stone-200 pb-3 mb-4">
                              <h5 className="text-xs font-extrabold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                                <span>👁️</span> Live Product Preview
                              </h5>
                              <p className="text-[11px] text-stone-500 mt-0.5">
                                Preview of product card before inserting variants
                              </p>
                            </div>

                            <div className="rounded-2xl border border-stone-200 bg-stone-50 overflow-hidden">
                              <div className="h-44 bg-stone-200 relative flex items-center justify-center overflow-hidden">
                                {productOnlyForm.image_url ? (
                                  <img
                                    src={productOnlyForm.image_url}
                                    alt="Preview"
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <span className="text-4xl">📦</span>
                                )}
                                <span className="absolute top-2 left-2 rounded-md bg-stone-900/80 text-white text-[10px] font-bold px-2 py-0.5 backdrop-blur-xs">
                                  {categories.find((c) => String(c.category_id) === String(productOnlyForm.category_id))
                                    ?.category_type || "Category"}
                                </span>
                              </div>
                              <div className="p-4 space-y-2">
                                <div className="font-extrabold text-sm text-stone-900 truncate">
                                  {productOnlyForm.product_name || "New Product Title"}
                                </div>
                                <div className="text-xs text-stone-500">
                                  Brand:{" "}
                                  <span className="font-bold text-stone-800">
                                    {brands.find((b) => String(b.brand_id) === String(productOnlyForm.brand_id))
                                      ?.brand_name || "Brand"}
                                  </span>
                                </div>
                                <p className="text-xs text-stone-600 line-clamp-2">
                                  {productOnlyForm.product_description ||
                                    "No description provided. You can attach size & color variants in the next step."}
                                </p>
                                <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-[11px] text-amber-900 font-semibold flex items-center gap-2">
                                  <span>ℹ️</span>
                                  <span>Created as standalone product. Variants can be added immediately.</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="text-[11px] text-stone-400 text-center">
                            MySQL Stored Procedure: <code>sp_insert_product</code>
                          </div>
                        </div>
                      </div>

                      {/* Actions Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setProductOnlyForm(initialProductOnlyState);
                            setProductOnlyErrors({});
                          }}
                          className="rounded-2xl border border-stone-300 bg-white px-6 py-3 text-xs font-bold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                        >
                          Reset Form
                        </button>

                        <button
                          type="submit"
                          disabled={productOnlyLoading}
                          className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-8 py-3.5 text-sm font-extrabold text-white shadow-md hover:bg-amber-500 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                        >
                          {productOnlyLoading ? (
                            <>
                              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                              <span>Inserting Product into MySQL...</span>
                            </>
                          ) : (
                            <>
                              <span>💾</span>
                              <span>Save Product to Database (sp_insert_product)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* ------------------------------------------------------------------------- */}
                {/* SUB-MODE 2: ADD PRODUCT VARIANT ONLY                                      */}
                {/* ------------------------------------------------------------------------- */}
                {catalogMode === "variant-only" && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Success Notification */}
                    {variantOnlySuccess && (
                      <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-4 text-sm font-semibold text-emerald-900 flex items-center justify-between gap-3 animate-fadeIn shadow-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🎉</span>
                          <span>{variantOnlySuccess}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setVariantOnlySuccess("")}
                          className="text-xs text-emerald-700 hover:underline cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}

                    {/* General Error */}
                    {variantOnlyErrors.submit && (
                      <div className="rounded-2xl bg-red-50 border border-red-300 p-4 text-sm font-semibold text-red-900 flex items-center gap-2 animate-fadeIn shadow-xs">
                        <span className="text-xl">⚠️</span>
                        <span>{variantOnlyErrors.submit}</span>
                      </div>
                    )}

                    <form onSubmit={handleCreateVariantOnlySubmit} className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left 2 Cols: Product Target Selector & Variant Details */}
                        <div className="lg:col-span-2 rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-6">
                          {/* Step 1: Target Product Selection */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                              <h5 className="text-xs font-extrabold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                                <span>1️⃣</span> Select Target Product (By Product ID)
                              </h5>
                              <span className="text-[11px] text-stone-400 font-medium">* Required</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {/* Direct Product ID Number Input */}
                              <div className="sm:col-span-1">
                                <label className="block text-xs font-bold text-stone-700 mb-1">
                                  Product ID # *
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="e.g. 1"
                                  value={variantOnlyForm.product_id}
                                  onChange={(e) => handleVariantOnlyFieldChange("product_id", e.target.value)}
                                  className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none transition ${
                                    variantOnlyErrors.product_id
                                      ? "border-red-500 ring-2 ring-red-100"
                                      : "border-stone-300 focus:border-amber-700"
                                  }`}
                                />
                              </div>

                              {/* Dropdown Product Selector */}
                              <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-stone-700 mb-1">
                                  Or Select from Catalog ({products.length} Products)
                                </label>
                                <select
                                  value={variantOnlyForm.product_id}
                                  onChange={(e) => handleVariantOnlyFieldChange("product_id", e.target.value)}
                                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-700 transition"
                                >
                                  <option value="">-- Choose Product from Catalog --</option>
                                  {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      [ID #{p.id}] {p.name} ({p.brand || "Brand"} • {p.category || "Category"})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            {variantOnlyErrors.product_id && (
                              <p className="text-[11px] font-semibold text-red-600">
                                {variantOnlyErrors.product_id}
                              </p>
                            )}

                            {/* Target Product Confirmation Card */}
                            {selectedTargetProduct ? (
                              <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50/60 to-white p-3.5 flex items-center gap-3.5">
                                <img
                                  src={selectedTargetProduct.image}
                                  alt={selectedTargetProduct.name}
                                  className="h-14 w-14 rounded-xl object-cover border border-amber-300 bg-stone-100 shrink-0"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-extrabold text-xs text-stone-900 truncate">
                                      #{selectedTargetProduct.id} — {selectedTargetProduct.name}
                                    </span>
                                    <span className="rounded-md bg-white border border-amber-300 text-amber-900 text-[10px] font-bold px-2 py-0.5">
                                      {selectedTargetProduct.category}
                                    </span>
                                    <span className="rounded-md bg-stone-100 border border-stone-300 text-stone-700 text-[10px] font-bold px-2 py-0.5">
                                      {selectedTargetProduct.brand}
                                    </span>
                                  </div>
                                  <div className="mt-1 text-[11px] text-stone-600">
                                    Existing SKUs ({selectedTargetProduct.variants?.length || 0}):{" "}
                                    {selectedTargetProduct.variants && selectedTargetProduct.variants.length > 0 ? (
                                      <span className="font-mono text-[10px] text-stone-800">
                                        {selectedTargetProduct.variants
                                          .map((v) => `${v.color_size} (₹${v.selling_price})`)
                                          .join(", ")}
                                      </span>
                                    ) : (
                                      <span className="italic text-stone-400">No variants registered yet</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : variantOnlyForm.product_id ? (
                              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 flex items-center gap-2">
                                <span>⚠️</span>
                                <span>
                                  Product ID #{variantOnlyForm.product_id} not found in the current loaded catalog. Please verify the ID.
                                </span>
                              </div>
                            ) : null}
                          </div>

                          {/* Step 2: Variant Details */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                              <h5 className="text-xs font-extrabold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                                <span>2️⃣</span> New Variant Specifications
                              </h5>
                              <span className="text-[11px] text-stone-400 font-medium">product_variant table</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Option / Size */}
                              <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-stone-700 mb-1">
                                  Size / Option (Color-Size) *
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Black-M, Navy-XL, 9-UK, Olive-L, Free-Size"
                                  value={variantOnlyForm.color_size}
                                  onChange={(e) => handleVariantOnlyFieldChange("color_size", e.target.value)}
                                  className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none transition ${
                                    variantOnlyErrors.color_size
                                      ? "border-red-500 ring-2 ring-red-100"
                                      : "border-stone-300 focus:border-amber-700"
                                  }`}
                                />
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {["Black-M", "Blue-L", "White-XL", "Free-Size", "8-UK", "9-UK", "10-UK"].map((chip) => (
                                    <button
                                      key={chip}
                                      type="button"
                                      onClick={() => handleVariantOnlyFieldChange("color_size", chip)}
                                      className="rounded-md bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] text-stone-700 hover:bg-stone-200 transition cursor-pointer"
                                    >
                                      {chip}
                                    </button>
                                  ))}
                                </div>
                                {variantOnlyErrors.color_size && (
                                  <p className="mt-1 text-[11px] font-semibold text-red-600">
                                    {variantOnlyErrors.color_size}
                                  </p>
                                )}
                              </div>

                              {/* Selling Price */}
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
                                    value={variantOnlyForm.selling_price}
                                    onChange={(e) => handleVariantOnlyFieldChange("selling_price", e.target.value)}
                                    className={`w-full rounded-xl border bg-white pl-8 pr-3.5 py-2.5 text-xs text-stone-900 focus:outline-none transition ${
                                      variantOnlyErrors.selling_price
                                        ? "border-red-500 ring-2 ring-red-100"
                                        : "border-stone-300 focus:border-amber-700"
                                    }`}
                                  />
                                </div>
                                {variantOnlyErrors.selling_price && (
                                  <p className="mt-1 text-[11px] font-semibold text-red-600">
                                    {variantOnlyErrors.selling_price}
                                  </p>
                                )}
                              </div>

                              {/* Discount Percent */}
                              <div>
                                <label className="block text-xs font-bold text-stone-700 mb-1">
                                  Variant Discount (% OFF)
                                </label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="0"
                                    max="90"
                                    step="1"
                                    placeholder="0"
                                    value={variantOnlyForm.discount_percent}
                                    onChange={(e) => handleVariantOnlyFieldChange("discount_percent", e.target.value)}
                                    className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none transition pr-8 ${
                                      variantOnlyErrors.discount_percent
                                        ? "border-red-500 ring-2 ring-red-100"
                                        : "border-stone-300 focus:border-amber-700"
                                    }`}
                                  />
                                  <span className="absolute right-3.5 top-2.5 text-xs text-stone-400 font-bold">%</span>
                                </div>
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {["0", "10", "20", "30", "40", "50"].map((d) => (
                                    <button
                                      key={d}
                                      type="button"
                                      onClick={() => handleVariantOnlyFieldChange("discount_percent", d)}
                                      className="rounded-md bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] text-stone-700 hover:bg-stone-200 transition cursor-pointer"
                                    >
                                      {d}%
                                    </button>
                                  ))}
                                </div>
                                {variantOnlyErrors.discount_percent && (
                                  <p className="mt-1 text-[11px] font-semibold text-red-600">
                                    {variantOnlyErrors.discount_percent}
                                  </p>
                                )}
                              </div>

                              {/* Initial Stock */}
                              <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-stone-700 mb-1">
                                  Branch Initial Stock Quantity *
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  placeholder="e.g. 25"
                                  value={variantOnlyForm.initial_stock}
                                  onChange={(e) => handleVariantOnlyFieldChange("initial_stock", e.target.value)}
                                  className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none transition ${
                                    variantOnlyErrors.initial_stock
                                      ? "border-red-500 ring-2 ring-red-100"
                                      : "border-stone-300 focus:border-amber-700"
                                  }`}
                                />
                                {variantOnlyErrors.initial_stock && (
                                  <p className="mt-1 text-[11px] font-semibold text-red-600">
                                    {variantOnlyErrors.initial_stock}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right 1 Col: Live Variant Card Preview */}
                        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4 flex flex-col justify-between">
                          <div>
                            <div className="border-b border-stone-200 pb-3 mb-4">
                              <h5 className="text-xs font-extrabold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                                <span>👁️</span> Live Variant Card Preview
                              </h5>
                              <p className="text-[11px] text-stone-500 mt-0.5">
                                Real-time customer card representation
                              </p>
                            </div>

                            <div className="rounded-2xl border border-stone-200 bg-stone-50 overflow-hidden">
                              <div className="h-44 bg-stone-200 relative flex items-center justify-center overflow-hidden">
                                {selectedTargetProduct?.image ? (
                                  <img
                                    src={selectedTargetProduct.image}
                                    alt="Product Preview"
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <span className="text-4xl">🎨</span>
                                )}

                                {/* Discount badge */}
                                {Number(variantOnlyForm.discount_percent || 0) > 0 && (
                                  <span className="absolute top-2 left-2 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 shadow-xs">
                                    {variantOnlyForm.discount_percent}% OFF
                                  </span>
                                )}

                                {/* Stock badge */}
                                <span className="absolute bottom-2 left-2 rounded-md bg-stone-900/80 text-white text-[10px] font-bold px-2 py-0.5 backdrop-blur-xs">
                                  In Stock: {variantOnlyForm.initial_stock || "0"}
                                </span>
                              </div>

                              <div className="p-4 space-y-2">
                                <div className="font-extrabold text-sm text-stone-900 truncate">
                                  {selectedTargetProduct?.name || "Target Product Name"}
                                </div>
                                <div className="text-[11px] text-stone-500">
                                  Option:{" "}
                                  <span className="rounded bg-amber-100 border border-amber-300 text-amber-900 font-bold px-1.5 py-0.5 text-[10px]">
                                    {variantOnlyForm.color_size || "Option / Size"}
                                  </span>
                                </div>

                                {(() => {
                                  const base = Number(variantOnlyForm.selling_price) || 0;
                                  const disc = Number(variantOnlyForm.discount_percent) || 0;
                                  const finalPrice = disc > 0 ? Math.round(base * (1 - disc / 100)) : base;
                                  return (
                                    <div className="flex items-baseline gap-2 pt-1 flex-wrap">
                                      <span className="text-base font-black text-stone-950">
                                        ₹{finalPrice.toLocaleString("en-IN")}
                                      </span>
                                      {disc > 0 && base > 0 && (
                                        <>
                                          <span className="text-xs text-stone-400 line-through font-semibold">
                                            ₹{base.toLocaleString("en-IN")}
                                          </span>
                                          <span className="text-[11px] font-bold text-emerald-700">
                                            (Saves ₹{(base - finalPrice).toLocaleString("en-IN")})
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>

                          <div className="text-[11px] text-stone-400 text-center">
                            MySQL Stored Procedure: <code>sp_add_product_variant</code>
                          </div>
                        </div>
                      </div>

                      {/* Actions Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setVariantOnlyForm(initialVariantOnlyState);
                            setVariantOnlyErrors({});
                          }}
                          className="rounded-2xl border border-stone-300 bg-white px-6 py-3 text-xs font-bold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                        >
                          Reset Form
                        </button>

                        <button
                          type="submit"
                          disabled={variantOnlyLoading || !variantOnlyForm.product_id}
                          className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-8 py-3.5 text-sm font-extrabold text-white shadow-md hover:bg-amber-500 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                        >
                          {variantOnlyLoading ? (
                            <>
                              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                              <span>Attaching Variant to Product in MySQL...</span>
                            </>
                          ) : (
                            <>
                              <span>💾</span>
                              <span>Save Variant to Product #{variantOnlyForm.product_id || "?"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* ------------------------------------------------------------------------- */}
                {/* SUB-MODE 3: BOTH PRODUCT & VARIANT (FULL BUNDLE)                         */}
                {/* ------------------------------------------------------------------------- */}
                {catalogMode === "both" && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Success Notification */}
                    {createSuccess && (
                      <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-4 text-sm font-semibold text-emerald-900 flex items-center justify-between gap-3 animate-fadeIn shadow-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🎉</span>
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

                    {/* Form General Error */}
                    {formErrors.submit && (
                      <div className="rounded-2xl bg-red-50 border border-red-300 p-4 text-sm font-semibold text-red-900 flex items-center gap-2 animate-fadeIn shadow-xs">
                        <span className="text-xl">⚠️</span>
                        <span>{formErrors.submit}</span>
                      </div>
                    )}

                    <form onSubmit={handleCreateProductSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left 2 Cols: Main Product Details */}
                        <div className="lg:col-span-2 rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
                          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                            <h5 className="text-xs font-extrabold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                              <span>1️⃣</span> Product Information (Parent Table)
                            </h5>
                            <span className="text-[11px] text-stone-400 font-medium">* Required fields</span>
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

                            {/* Mandatory Product Photo URL */}
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-bold text-stone-700 mb-1">
                                Product Photo Web URL * <span className="text-amber-800 text-[10px] font-bold">(Mandatory)</span>
                              </label>
                              <input
                                type="url"
                                placeholder="https://images.unsplash.com/..."
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
                                  Product Description (Optional)
                                </label>
                                <span className="text-[10px] text-stone-400">
                                  {newProductForm.product_description.length}/500 chars
                                </span>
                              </div>
                              <textarea
                                rows={3}
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

                        {/* Right 1 Col: Initial Variant & Stock + Preview */}
                        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-5 flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="border-b border-stone-200 pb-3">
                              <h5 className="text-xs font-extrabold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                                <span>2️⃣</span> Initial Variant & Stock
                              </h5>
                              <p className="text-[11px] text-stone-500 mt-0.5">
                                Auto-creates initial SKU entry
                              </p>
                            </div>

                            {/* Color Size */}
                            <div>
                              <label className="block text-xs font-bold text-stone-700 mb-1">
                                Size / Option (Color-Size) *
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
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {["Black-M", "Blue-L", "White-XL", "Free-Size"].map((chip) => (
                                  <button
                                    key={chip}
                                    type="button"
                                    onClick={() => handleFieldChange("color_size", chip)}
                                    className="rounded-md bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] text-stone-700 hover:bg-stone-200 transition cursor-pointer"
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

                            {/* Selling Price */}
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
                                Branch Initial Stock Quantity *
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

                          {/* Mini Live Preview Card */}
                          <div className="rounded-2xl bg-stone-50 border border-stone-200 p-3.5">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                              Live Catalog Preview
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-xl bg-stone-200 overflow-hidden shrink-0 border border-stone-300 flex items-center justify-center text-lg">
                                {newProductForm.image_url ? (
                                  <img
                                    src={newProductForm.image_url}
                                    alt="Preview"
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  "👕"
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-xs text-stone-900 truncate">
                                  {newProductForm.product_name || "New Product Title"}
                                </div>
                                <div className="text-[11px] font-black text-amber-800">
                                  ₹{newProductForm.selling_price || "0.00"}
                                </div>
                                <div className="text-[10px] text-stone-500">
                                  SKU: {newProductForm.color_size || "Option"} • Stock: {newProductForm.initial_stock || "0"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setNewProductForm(initialFormState);
                            setFormErrors({});
                          }}
                          className="rounded-2xl border border-stone-300 bg-white px-6 py-3 text-xs font-bold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                        >
                          Reset Form
                        </button>

                        <button
                          type="submit"
                          disabled={formLoading}
                          className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-8 py-3.5 text-sm font-extrabold text-white shadow-md hover:bg-amber-500 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                        >
                          {formLoading ? (
                            <>
                              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                              <span>Writing to Database...</span>
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
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: BRANCH ORDERS MANAGEMENT                                           */}
            {/* ========================================================================= */}
            {activeTab === "orders" && (
              <div className="space-y-5">
                {/* Orders Filter & Search Bar */}
                <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <span className="absolute left-3.5 top-3 text-stone-400">🔍</span>
                    <input
                      type="text"
                      placeholder="Search by Order ID, customer, or items..."
                      value={ordersSearch}
                      onChange={(e) => setOrdersSearch(e.target.value)}
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50/70 pl-10 pr-4 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:border-amber-600 focus:outline-none transition"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {["all", "Placed", "Completed", "Cancelled"].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setOrdersFilter(st)}
                        className={`rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer ${
                          ordersFilter === st
                            ? "bg-stone-900 text-white shadow-xs"
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        {st === "all" ? `All (${orders.length})` : st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orders Table */}
                <div className="rounded-3xl border border-stone-200 bg-white shadow-xs overflow-hidden">
                  <div className="p-4 px-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/60">
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">Branch Order Records</h4>
                      <p className="text-[11px] text-stone-500">
                        Live orders assigned to branch {employee?.branch_name || "Surat Central"}.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-stone-500">
                      Showing {filteredOrders.length} orders
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-100/80 text-stone-600 uppercase font-bold text-[11px] tracking-wider border-b border-stone-200">
                        <tr>
                          <th className="py-3.5 px-4">Order ID</th>
                          <th className="py-3.5 px-4">Customer & Branch</th>
                          <th className="py-3.5 px-4">Items Summary</th>
                          <th className="py-3.5 px-4">Amount</th>
                          <th className="py-3.5 px-4">Payment</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4 text-center">Update Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200">
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-12 text-center text-stone-400">
                              <div className="text-3xl mb-2">📋</div>
                              <div className="font-bold text-sm text-stone-700">No orders matching criteria</div>
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((ord) => (
                            <tr key={ord.order_id} className="hover:bg-amber-50/30 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                                #{ord.order_id}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-stone-900">{ord.customer}</div>
                                <div className="text-[10px] text-stone-400">{ord.branch} • {ord.date}</div>
                              </td>
                              <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate">
                                {ord.items}
                              </td>
                              <td className="py-3.5 px-4 font-black text-stone-900">
                                ₹{ord.amount.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="rounded-lg bg-stone-100 px-2 py-1 text-[11px] font-semibold text-stone-700">
                                  {ord.payment}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                                    ord.status === "Completed"
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                      : ord.status === "Cancelled"
                                      ? "bg-red-100 text-red-800 border border-red-200"
                                      : "bg-amber-100 text-amber-800 border border-amber-200"
                                  }`}
                                >
                                  {ord.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <select
                                  value={ord.status}
                                  onChange={(e) => handleOrderStatusChange(ord.order_id, e.target.value)}
                                  className="rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 focus:outline-none focus:border-amber-600 transition cursor-pointer"
                                >
                                  <option value="Placed">Placed</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 4: POS & STAFF DISCOUNT MANAGEMENT                                    */}
            {/* ========================================================================= */}
            {activeTab === "pos" && (
              <div className="space-y-6">
                {/* 20% Privilege Master Card */}
                <div className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-amber-50/50 p-6 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="max-w-xl">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 block mb-1">
                        Staff Privilege Feature
                      </span>
                      <h4 className="text-xl font-black text-amber-950">
                        20% Storewide Employee Discount
                      </h4>
                      <p className="text-xs text-amber-900/80 mt-1.5 leading-relaxed">
                        When enabled, all items in the customer checkout cart or retail counter automatically receive an instant 20% discount deduction upon invoice generation.
                      </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl border border-amber-200 shadow-xs">
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-stone-900">
                          {staffDiscountActive ? "20% Discount ACTIVE" : "Normal Retail Pricing"}
                        </div>
                        <div className="text-[10px] text-stone-500 font-medium">
                          {staffDiscountActive ? "Applied at checkout" : "Toggle switch to apply"}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onApplyStaffDiscount(!staffDiscountActive)}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors cursor-pointer ${
                          staffDiscountActive ? "bg-emerald-600" : "bg-stone-300"
                        }`}
                        aria-label="Toggle Staff Discount"
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${
                            staffDiscountActive ? "translate-x-7" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2-Column POS Cockpit: Shift Verification & Fast Calculator */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column: Shift & Cashier Details */}
                  <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
                    <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                      <span>🏢</span> Cashier Session & Assigned Counter
                    </h4>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-2xl bg-stone-50 p-4 border border-stone-200">
                        <span className="text-stone-400 block font-medium mb-1">Store Branch</span>
                        <strong className="text-stone-900 text-sm">
                          {employee?.branch_name || "Surat Central"}
                        </strong>
                        <div className="text-[10px] text-stone-500 mt-0.5">Branch #{employee?.branch_id || 1}</div>
                      </div>

                      <div className="rounded-2xl bg-stone-50 p-4 border border-stone-200">
                        <span className="text-stone-400 block font-medium mb-1">Cashier Identity</span>
                        <strong className="text-stone-900 text-sm font-mono">
                          EMP-#{employee?.emp_id || 101}
                        </strong>
                        <div className="text-[10px] text-stone-500 mt-0.5">{employee?.emp_role || "Associate"}</div>
                      </div>

                      <div className="rounded-2xl bg-stone-50 p-4 border border-stone-200">
                        <span className="text-stone-400 block font-medium mb-1">Shift Status</span>
                        <strong className="text-emerald-700 text-sm flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                          <span>Verified & Open</span>
                        </strong>
                      </div>

                      <div className="rounded-2xl bg-stone-50 p-4 border border-stone-200">
                        <span className="text-stone-400 block font-medium mb-1">GST Registration</span>
                        <strong className="text-stone-900 text-sm font-mono">
                          24AAACT1234F1Z5
                        </strong>
                        <div className="text-[10px] text-stone-500 mt-0.5">Tax Invoice Ready</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: POS Fast Bill Calculator */}
                  <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
                    <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
                      <span>🧮</span> Fast Cashier Invoice Simulator
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Item MRP (₹)
                        </label>
                        <input
                          type="number"
                          value={posItemPrice}
                          onChange={(e) => setPosItemPrice(e.target.value)}
                          className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs font-bold text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={posItemQty}
                          onChange={(e) => setPosItemQty(e.target.value)}
                          className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs font-bold text-stone-900"
                        />
                      </div>
                    </div>

                    {/* Calculated Bill Breakdown */}
                    {(() => {
                      const price = Math.max(0, Number(posItemPrice) || 0);
                      const qty = Math.max(1, Number(posItemQty) || 1);
                      const subtotal = price * qty;
                      const discountAmount = staffDiscountActive ? subtotal * 0.2 : 0;
                      const discountedTotal = subtotal - discountAmount;
                      const gst = discountedTotal * 0.12;
                      const finalTotal = discountedTotal + gst;

                      return (
                        <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4 space-y-2 text-xs">
                          <div className="flex justify-between text-stone-600">
                            <span>Subtotal ({qty} units)</span>
                            <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                          </div>

                          <div className="flex justify-between text-stone-600">
                            <span>
                              Staff Discount (20%) {staffDiscountActive ? "✅" : "(Disabled)"}
                            </span>
                            <span className={`font-mono ${staffDiscountActive ? "text-emerald-700 font-bold" : "text-stone-400"}`}>
                              -₹{discountAmount.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex justify-between text-stone-600">
                            <span>GST (12% Apparel)</span>
                            <span className="font-mono">₹{gst.toFixed(2)}</span>
                          </div>

                          <div className="pt-2 border-t border-stone-300 flex justify-between font-black text-sm text-stone-900">
                            <span>Estimated Payable</span>
                            <span className="text-amber-800 font-mono">₹{finalTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 5: BANNER SHOWCASE MANAGEMENT                                         */}
            {/* ========================================================================= */}
            {activeTab === "banner" && (
              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs">
                <BannerManager
                  slides={bannerSlides}
                  onUpdateSlides={onUpdateBannerSlides}
                />
              </div>
            )}
          </div>

          {/* Clean Footer Bar */}
          <footer className="border-t border-stone-200 bg-white px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 shrink-0">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>ThreadCraft Retail Management System • Staff Access Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-stone-900 px-5 py-1.5 text-xs font-bold text-white hover:bg-amber-600 transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default EmployeePortal;
