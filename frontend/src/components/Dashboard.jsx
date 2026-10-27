import { useEffect, useState, useCallback } from "react";
import { apiRequest, fetchProducts, fetchCategories } from "../services/api";
import Navbar from "./Navbar.jsx";
import ProductCard from "./ProductCard.jsx";
import Footer from "./Footer.jsx";
import EmployeePortal from "./EmployeePortal.jsx";
import EditVariantModal from "./EditVariantModal.jsx";
import HeroImageSlider from "./HeroImageSlider.jsx";
import { BANNER_SLIDES } from "../data/bannerSlides.js";
import PaymentPage from "./PaymentPage.jsx";

function Dashboard({ currentUser, onNavigateToAuth, onLogout, onNavigateToOrders }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEmployeePortalOpen, setIsEmployeePortalOpen] = useState(false);
  const [editingVariantProduct, setEditingVariantProduct] = useState(null);
  const [staffDiscountActive, setStaffDiscountActive] = useState(false);
  const [isPaymentPageOpen, setIsPaymentPageOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    ok: false,
    message: "Connecting to MySQL database...",
    database: ""
  });

  // Persistent Banner Slides State (editable via Staff Portal Banner Manager)
  const [bannerSlides, setBannerSlides] = useState(() => {
    try {
      const saved = localStorage.getItem("threadcraft_banner_slides");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Could not load banner slides from localStorage", e);
    }
    return BANNER_SLIDES;
  });

  function handleUpdateBannerSlides(newSlides) {
    setBannerSlides(newSlides);
    try {
      localStorage.setItem("threadcraft_banner_slides", JSON.stringify(newSlides));
    } catch (e) {
      console.warn("Could not save banner slides to localStorage", e);
    }
  }

  const isEmployee = currentUser?.role === "employee";

  // Employee live stock update handler (purely client-side state)
  function handleUpdateStock(productId, delta) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, total_stock: Math.max(0, (p.total_stock || 0) + delta) }
          : p
      )
    );
  }

  // Fetch products and categories from MySQL database
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Health check & DB connection
      try {
        const health = await apiRequest("/health");
        setApiStatus({
          ok: true,
          message: health.message,
          database: health.database || "retail_db"
        });
      } catch (err) {
        setApiStatus({
          ok: false,
          message: `Backend or MySQL not reachable: ${err.message}`,
          database: ""
        });
      }

      // 2. Fetch categories from MySQL
      try {
        const cats = await fetchCategories();
        if (Array.isArray(cats) && cats.length > 0) {
          const list = ["All", ...cats.map((c) => c.category_type)];
          setCategories(Array.from(new Set(list)));
        }
      } catch (catErr) {
        console.warn("Could not load categories endpoint:", catErr);
      }

      // 3. Fetch products from MySQL
      const data = await fetchProducts();
      const productList = Array.isArray(data) ? data : [];
      setProducts(productList);

      // Fallback: derive categories from products if category list was empty
      if (productList.length > 0) {
        setCategories((prev) => {
          if (prev.length > 1) return prev;
          const found = ["All", ...productList.map((p) => p.category).filter(Boolean)];
          return Array.from(new Set(found));
        });
      }
    } catch (err) {
      console.error("Failed to load products from MySQL:", err);
      setError(
        err.message ||
          "Could not connect to the backend API or MySQL database. Please verify backend is running on port 5000 and MySQL retail_db is active."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Synchronize hash navigation for #payment
  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash.toLowerCase();
      if (hash === "#payment") {
        setIsPaymentPageOpen(true);
      } else if (hash === "#home" || hash === "#products" || hash === "#cart") {
        setIsPaymentPageOpen(false);
      }
    }

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Add a product or increase its quantity in cart
  function handleAddToCart(product) {
    const variantId = product.selectedVariant?.variant_id || "default";
    const cartKey = `${product.id}-${variantId}`;

    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.cartKey === cartKey);

      if (existingItem) {
        return currentCart.map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          cartKey,
          quantity: 1,
        },
      ];
    });
  }

  // Increase or decrease item quantity in cart
  function changeQuantity(cartKey, amount) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  // Remove an item from cart
  function removeFromCart(cartKey) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.cartKey !== cartKey)
    );
  }

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) => total + (Number(item.price) || 0) * item.quantity,
    0
  );


  const filteredProducts = products.filter((product) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      product.name?.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower) ||
      product.category?.toLowerCase().includes(searchLower) ||
      product.brand?.toLowerCase().includes(searchLower);

    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (isPaymentPageOpen) {
    return (
      <PaymentPage
        cart={cart}
        cartTotal={cartTotal}
        currentUser={currentUser}
        onClose={() => {
          setIsPaymentPageOpen(false);
          window.location.hash = "#cart";
        }}
        onClearCart={() => setCart([])}
        onNavigateToAuth={onNavigateToAuth}
        onViewOrders={(orderId) => {
          setIsPaymentPageOpen(false);
          if (onNavigateToOrders) onNavigateToOrders(orderId);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Navbar
        cartCount={cartCount}
        currentUser={currentUser}
        onNavigateToAuth={onNavigateToAuth}
        onLogout={onLogout}
        onOpenEmployeePortal={() => setIsEmployeePortalOpen(true)}
        onNavigateToOrders={onNavigateToOrders}
      />

      <main>
        {/* Hero section (Hidden for Employees, visible to Guests and Customers) */}
        {!isEmployee && (
          <section
            id="home"
            className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 md:grid-cols-2 md:py-20"
          >
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-700">
                Everyday style, made simple
              </p>

              <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Find your
                <span className="block text-amber-700">
                  everyday look.
                </span>
              </h1>

              <p className="mt-5 max-w-lg leading-7 text-stone-600">
                Explore authentic clothing and accessories directly from our MySQL retail inventory.
                Discover timeless essentials, verified stock, and premier brands.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#products"
                  className="rounded-full bg-stone-900 px-7 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-amber-700 transition"
                >
                  Shop Collection
                </a>
                <a
                  href="#cart"
                  className="rounded-full border border-stone-300 bg-white px-7 py-3.5 text-sm font-semibold text-stone-900 shadow-xs hover:border-stone-900 hover:bg-stone-50 transition"
                >
                  View Cart ({cartCount})
                </a>
              </div>
            </div>

            <HeroImageSlider slides={bannerSlides} />
          </section>
        )}

        {/* Product catalogue */}
        <section
          id="products"
          className="mx-auto max-w-7xl px-5 py-12"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold uppercase tracking-widest text-amber-700">
                  Our Collection
                </p>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                  MySQL Database
                </span>
              </div>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Shop your style
              </h2>
            </div>

            <div className="w-full sm:max-w-sm">
              <label
                htmlFor="product-search"
                className="mb-2 block text-sm font-semibold"
              >
                Search products
              </label>

              <div className="relative">
                <input
                  id="product-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, brand, category..."
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 pr-10 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100 transition"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-8 flex flex-wrap gap-2.5">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                aria-pressed={selectedCategory === category}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  selectedCategory === category
                    ? "bg-stone-900 text-white shadow-sm"
                    : "border border-stone-300 bg-white text-stone-700 hover:border-stone-900"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Count and refresh */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-stone-600">
              {isLoading
                ? "Loading products from database..."
                : `${filteredProducts.length} ${
                    filteredProducts.length === 1 ? "product" : "products"
                  } found`}
            </p>

            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-950 transition"
            >
              <svg
                className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
              Refresh Database
            </button>
          </div>

          {/* Products List / Loading / Error states */}
          {isLoading ? (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="animate-pulse rounded-2xl border border-stone-200 bg-white p-4 shadow-xs"
                >
                  <div className="aspect-4/5 rounded-xl bg-stone-200" />
                  <div className="mt-4 h-4 w-1/3 rounded bg-stone-200" />
                  <div className="mt-2 h-6 w-3/4 rounded bg-stone-200" />
                  <div className="mt-2 h-4 w-full rounded bg-stone-200" />
                  <div className="mt-4 flex justify-between">
                    <div className="h-6 w-1/4 rounded bg-stone-200" />
                    <div className="h-8 w-1/3 rounded-full bg-stone-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-900">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <h3 className="mt-3 text-lg font-bold">Failed to load from MySQL</h3>
              <p className="mt-1 text-sm text-red-700 max-w-md mx-auto">{error}</p>
              <div className="mt-5 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={loadData}
                  className="rounded-full bg-red-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-800 transition"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  isEmployee={isEmployee}
                  onAdjustStock={handleUpdateStock}
                  onEditVariant={(prod, variant) =>
                    setEditingVariantProduct({ product: prod, variant })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl bg-white p-10 text-center border border-stone-200">
              <h3 className="text-xl font-bold">No products found</h3>
              <p className="mt-2 text-stone-600">
                Try another search term or select another category.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                }}
                className="mt-4 rounded-full bg-stone-900 px-5 py-2.5 text-white hover:bg-amber-700 transition"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* Shopping cart (Visible only to Customers and Guests, NOT Employees) */}
        {!isEmployee && (
          <section
            id="cart"
            className="mx-auto max-w-7xl px-5 py-12"
          >
            <p className="text-sm font-bold uppercase tracking-widest text-amber-700">
              Your selection
            </p>
            <h2 className="mt-2 text-3xl font-black">
              Shopping Cart ({cartCount})
            </h2>

            {cart.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
                <p className="text-lg font-semibold">
                  Your cart is empty
                </p>
                <p className="mt-2 text-stone-600">
                  Add some products from our collection to get started.
                </p>
                <a
                  href="#products"
                  className="mt-5 inline-block rounded-full bg-stone-900 px-6 py-3 font-semibold text-white hover:bg-amber-700 transition"
                >
                  Browse Products
                </a>
              </div>
            ) : (
              <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
                <div className="space-y-4">
                  {cart.map((item) => (
                    <article
                      key={item.cartKey}
                      className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center shadow-xs"
                    >
                      <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-stone-400 text-xs">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {item.brand && (
                            <span className="text-xs font-bold uppercase text-stone-900">
                              {item.brand}
                            </span>
                          )}
                          <span className="text-xs font-semibold uppercase text-amber-700">
                            {item.category}
                          </span>
                        </div>

                        <h3 className="mt-1 font-bold text-stone-900">{item.name}</h3>

                        {item.selectedColorSize && (
                          <p className="mt-0.5 text-xs font-medium text-stone-500">
                            Option: <span className="font-semibold text-stone-700">{item.selectedColorSize}</span>
                          </p>
                        )}

                        <p className="mt-1 text-sm text-stone-600">
                          ₹{Number(item.price).toLocaleString("en-IN")} each
                        </p>

                        <p className="mt-2 font-bold text-stone-900">
                          Subtotal: ₹
                          {(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center rounded-full border border-stone-300 bg-stone-50">
                          <button
                            type="button"
                            aria-label={`Decrease ${item.name} quantity`}
                            onClick={() => changeQuantity(item.cartKey, -1)}
                            className="px-3 py-2 hover:bg-stone-200 rounded-l-full transition cursor-pointer"
                          >
                            −
                          </button>

                          <span className="min-w-8 text-center font-semibold text-sm">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            aria-label={`Increase ${item.name} quantity`}
                            onClick={() => changeQuantity(item.cartKey, 1)}
                            className="px-3 py-2 hover:bg-stone-200 rounded-r-full transition cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.cartKey)}
                          className="text-sm font-semibold text-red-600 hover:text-red-800 transition cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Order summary */}
                <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
                  <h3 className="text-xl font-bold">Order Summary</h3>

                  <div className="mt-5 flex justify-between gap-3 text-stone-600">
                    <span>Total items</span>
                    <span className="font-semibold">{cartCount}</span>
                  </div>

                  <div className="mt-3 flex justify-between gap-3 text-stone-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="mt-4 border-t border-stone-200 pt-4">
                    <div className="flex justify-between gap-3 text-lg font-black">
                      <span>Total</span>
                      <span className="text-stone-900">
                        ₹{cartTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-stone-500">
                      Direct from MySQL retail database inventory.
                    </p>
                  </div>

                  {/* Customer / Guest Delivery details */}
                  {currentUser ? (
                    <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-3.5 text-xs">
                      <div className="flex items-center justify-between text-stone-500 font-bold uppercase tracking-wider mb-1">
                        <span>Delivery Details</span>
                        <button
                          type="button"
                          onClick={onNavigateToAuth}
                          className="text-[10px] text-amber-700 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="font-bold text-stone-900">{currentUser.name}</p>
                      <p className="text-stone-600">{currentUser.mobile_no || currentUser.mobile}</p>
                      <p className="mt-1 text-stone-600 leading-snug">
                        {[
                          currentUser.house_no,
                          currentUser.street,
                          currentUser.area,
                          currentUser.city,
                          currentUser.state,
                          currentUser.pincode,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Standard Customer Address"}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 p-3 text-xs text-amber-900">
                      <p className="font-semibold">Have a Customer Account?</p>
                      <p className="mt-0.5 text-amber-800 text-[11px]">
                        Sign in to save your address details and track orders.
                      </p>
                      <button
                        type="button"
                        onClick={onNavigateToAuth}
                        className="mt-2 font-bold text-amber-900 underline hover:text-stone-900 cursor-pointer"
                      >
                        Sign In / Register Customer →
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (cart.length === 0) {
                        alert("Your cart is empty. Please add items before proceeding to payment.");
                        return;
                      }
                      setIsPaymentPageOpen(true);
                      window.location.hash = "#payment";
                    }}
                    className="mt-5 w-full rounded-full bg-stone-900 px-5 py-3 font-semibold text-white hover:bg-amber-700 transition cursor-pointer"
                  >
                    Proceed to Payment →
                  </button>

                  <button
                    type="button"
                    onClick={() => setCart([])}
                    className="mt-3 w-full rounded-full border border-stone-300 px-5 py-3 font-semibold hover:bg-stone-100 transition cursor-pointer"
                  >
                    Clear Cart
                  </button>
                </aside>
              </div>
            )}
          </section>
        )}

      </main>

      {/* Staff Exclusive Floating Portal Trigger (Visible only to employees) */}
      {isEmployee && (
        <button
          type="button"
          onClick={() => setIsEmployeePortalOpen(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-amber-600 px-4 py-3 font-bold text-stone-950 shadow-xl border-2 border-amber-300 hover:bg-amber-500 hover:scale-105 active:scale-95 transition"
        >
          <span className="text-lg">⚙️</span>
          <span className="text-xs uppercase tracking-wider">Staff Terminal</span>
        </button>
      )}

      {/* Employee Portal Modal */}
      {isEmployee && (
        <EmployeePortal
          isOpen={isEmployeePortalOpen}
          onClose={() => setIsEmployeePortalOpen(false)}
          employee={currentUser}
          products={products}
          onUpdateStock={handleUpdateStock}
          onApplyStaffDiscount={(active) => setStaffDiscountActive(active)}
          staffDiscountActive={staffDiscountActive}
          onProductCreated={loadData}
          bannerSlides={bannerSlides}
          onUpdateBannerSlides={handleUpdateBannerSlides}
        />
      )}

      {/* Edit Product Variant Modal (invokes sp_update_product_variant) */}
      {editingVariantProduct && (
        <EditVariantModal
          isOpen={Boolean(editingVariantProduct)}
          onClose={() => setEditingVariantProduct(null)}
          product={editingVariantProduct.product}
          initialVariant={editingVariantProduct.variant}
          onVariantUpdated={async (updated) => {
            // Instantly update product in local state so price & variant size change immediately
            setProducts((prev) =>
              prev.map((p) => {
                if (p.id === updated.productId) {
                  const updatedVariants = (p.variants || []).map((v) =>
                    v.variant_id === updated.variant_id
                      ? {
                          ...v,
                          color_size: updated.color_size,
                          selling_price: updated.selling_price,
                          is_active: updated.is_active,
                        }
                      : v
                  );
                  return {
                    ...p,
                    variants: updatedVariants,
                    price: updated.selling_price || p.price,
                    image: updated.image !== undefined ? updated.image : p.image,
                  };
                }
                return p;
              })
            );
            // Refresh catalog from MySQL database
            await loadData();
          }}
        />
      )}

      {/* Database connection status badge */}
      <div className="border-t border-stone-200 bg-white/50 backdrop-blur-xs py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                apiStatus.ok ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span className="font-medium">
              Database: <strong className="text-stone-800">{apiStatus.message}</strong>
            </span>
          </div>

          <span className="hidden sm:inline text-stone-400">
            MySQL Workbench • retail_db
          </span>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Dashboard;
