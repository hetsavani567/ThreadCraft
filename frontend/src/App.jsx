import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard.jsx";
import ProductDetail from "./components/ProductDetail.jsx";
import AuthPage from "./components/AuthPage.jsx";
import OrdersHistory from "./components/OrdersHistory.jsx";
import CartBucketAnimation from "./components/CartBucketAnimation.jsx";
import { logoutUser, fetchCurrentUser, getAccessToken } from "./services/api.js";

function App() {
  const [currentView, setCurrentView] = useState("store"); // "store" | "auth" | "orders" | "product"
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [productHistory, setProductHistory] = useState([]);
  const [initialCategoryFilter, setInitialCategoryFilter] = useState(null);
  const [initialBrandFilter, setInitialBrandFilter] = useState(null);

  // Cart State persistent in localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("threadcraft_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Bucket animation state
  const [cartAnimationData, setCartAnimationData] = useState(null);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("threadcraft_customer");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("threadcraft_cart", JSON.stringify(cart));
    } catch (e) {
      console.warn("Could not save cart to localStorage", e);
    }
  }, [cart]);

  // Verify active session with backend on load
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      fetchCurrentUser()
        .then((res) => {
          if (res?.success && res.user) {
            setCurrentUser(res.user);
            localStorage.setItem("threadcraft_customer", JSON.stringify(res.user));
          }
        })
        .catch(() => {
          // Token or session expired/revoked
          console.warn("Session check returned inactive, continuing as guest");
        });
    }
  }, []);

  // Handle URL hash navigation (e.g. #login, #signup, #auth, #orders, #tracking, #product)
  useEffect(() => {
    function handleHashChange() {
      const fullHash = window.location.hash || "";
      const hashLower = fullHash.toLowerCase();

      if (hashLower === "#login" || hashLower === "#signup" || hashLower === "#auth") {
        setCurrentView("auth");
      } else if (hashLower === "#orders" || hashLower === "#tracking" || hashLower.startsWith("#orders")) {
        const idMatch = fullHash.match(/[?&]id=([^&]+)/i);
        if (idMatch && idMatch[1]) {
          setSelectedOrderId(idMatch[1]);
        }
        setCurrentView("orders");
      } else if (hashLower.startsWith("#product")) {
        const idMatch = fullHash.match(/[?&]id=([^&]+)/i);
        if (idMatch && idMatch[1]) {
          const pid = idMatch[1];
          setSelectedProductId(pid);
          setProductHistory((prev) => {
            if (prev[prev.length - 1] === pid) return prev;
            return [...prev, pid];
          });
        }
        setCurrentView("product");
      } else if (hashLower.startsWith("#category=")) {
        const catValue = decodeURIComponent(fullHash.slice("#category=".length).split("&")[0]);
        setInitialCategoryFilter(catValue);
        setCurrentView("store");
      } else if (hashLower.startsWith("#brand=")) {
        const brandValue = decodeURIComponent(fullHash.slice("#brand=".length).split("&")[0]);
        setInitialBrandFilter(brandValue);
        setCurrentView("store");
      } else {
        // default store view
        setCurrentView("store");
      }
    }

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function handleLoginSuccess(customer) {
    setCurrentUser(customer);
    try {
      localStorage.setItem("threadcraft_customer", JSON.stringify(customer));
    } catch (e) {
      console.warn("Could not persist customer to localStorage", e);
    }
  }

  async function handleLogout() {
    try {
      await logoutUser();
    } catch (e) {
      console.warn("Error during logout:", e);
    }
    setCurrentUser(null);
    try {
      localStorage.removeItem("threadcraft_customer");
    } catch (e) {
      console.warn("Could not remove customer from localStorage", e);
    }
  }

  function navigateToAuth() {
    setCurrentView("auth");
    window.location.hash = "#auth";
  }

  function navigateToStore() {
    setCurrentView("store");
    window.location.hash = "#home";
  }

  function navigateToOrders(orderId = null) {
    if (orderId) {
      setSelectedOrderId(orderId);
      window.location.hash = `#orders?id=${orderId}`;
    } else {
      window.location.hash = "#orders";
    }
    setCurrentView("orders");
  }

  function navigateToProduct(productId) {
    setSelectedProductId(productId);
    setProductHistory((prev) => {
      if (prev[prev.length - 1] === productId) return prev;
      return [...prev, productId];
    });
    // Use pushState so the hashchange listener is NOT triggered (avoids duplicate history pushes)
    window.history.pushState(null, "", `#product?id=${productId}`);
    setCurrentView("product");
  }

  // Back Navigation: walks our own productHistory stack; when exhausted, returns to store.
  // We never call window.history.back() because that re-fires the hashchange listener and
  // causes an infinite loop of re-adding the current product to productHistory.
  function handleNavigateBack() {
    if (productHistory.length > 1) {
      const newHistory = productHistory.slice(0, -1); // remove current product
      const prevProductId = newHistory[newHistory.length - 1];
      setProductHistory(newHistory);
      setSelectedProductId(prevProductId);
      // replaceState keeps the URL in sync WITHOUT triggering hashchange
      window.history.replaceState(null, "", `#product?id=${prevProductId}`);
      setCurrentView("product");
    } else {
      // No more product history — go back to store
      setProductHistory([]);
      navigateToStore();
    }
  }

  function navigateToCategory(categoryName) {
    setInitialCategoryFilter(categoryName);
    setInitialBrandFilter(null);
    setCurrentView("store");
    window.location.hash = `#category=${encodeURIComponent(categoryName)}`;
  }

  function navigateToBrand(brandName) {
    setInitialBrandFilter(brandName);
    setInitialCategoryFilter(null);
    setCurrentView("store");
    window.location.hash = `#brand=${encodeURIComponent(brandName)}`;
  }

  // Central Add to Cart handler with Bucket Animation
  function handleAddToCart(product, quantityToAdd = 1) {
    if (!currentUser) {
      navigateToAuth();
      return;
    }

    const variantId = product.selectedVariant?.variant_id || "default";
    const cartKey = `${product.id}-${variantId}`;

    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.cartKey === cartKey);

      if (existingItem) {
        return currentCart.map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          cartKey,
          quantity: quantityToAdd,
        },
      ];
    });

    // Trigger Bucket Animation coming from baseline
    setCartAnimationData({
      product,
      quantity: quantityToAdd,
      timestamp: Date.now(),
    });
  }

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

  function removeFromCart(cartKey) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.cartKey !== cartKey)
    );
  }

  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  const cartTotal = cart.reduce(
    (total, item) => total + (Number(item.price) || 0) * (item.quantity || 1),
    0
  );

  return (
    <>
      {currentView === "auth" && (
        <AuthPage
          currentUser={currentUser}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
          onNavigateToStore={navigateToStore}
        />
      )}

      {currentView === "orders" && (
        <OrdersHistory
          currentUser={currentUser}
          onNavigateToStore={navigateToStore}
          onNavigateToAuth={navigateToAuth}
          initialSelectedOrderId={selectedOrderId}
          onOpenProductDetail={navigateToProduct}
        />
      )}

      {currentView === "product" && (
        <ProductDetail
          productId={selectedProductId}
          currentUser={currentUser}
          cartCount={cartCount}
          cart={cart}
          onNavigateBack={handleNavigateBack}
          onNavigateHome={navigateToStore}
          onNavigateCategory={navigateToCategory}
          onNavigateBrand={navigateToBrand}
          onSelectProduct={navigateToProduct}
          onAddToCart={handleAddToCart}
          onNavigateToAuth={navigateToAuth}
          onNavigateToOrders={navigateToOrders}
          onLogout={handleLogout}
        />
      )}

      {currentView === "store" && (
        <Dashboard
          currentUser={currentUser}
          onNavigateToAuth={navigateToAuth}
          onLogout={handleLogout}
          onNavigateToOrders={navigateToOrders}
          onNavigateToProduct={navigateToProduct}
          initialCategoryFilter={initialCategoryFilter}
          initialBrandFilter={initialBrandFilter}
          onClearInitialFilters={() => {
            setInitialCategoryFilter(null);
            setInitialBrandFilter(null);
          }}
          cart={cart}
          setCart={setCart}
          onAddToCart={handleAddToCart}
          onChangeQuantity={changeQuantity}
          onRemoveFromCart={removeFromCart}
        />
      )}

      {/* Floating Bottom Baseline Shopping Bucket Animation */}
      <CartBucketAnimation
        animationData={cartAnimationData}
        onAnimationEnd={() => setCartAnimationData(null)}
      />
    </>
  );
}

export default App;
