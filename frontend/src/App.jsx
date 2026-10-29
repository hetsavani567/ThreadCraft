import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard.jsx";
import ProductDetail from "./components/ProductDetail.jsx";
import AuthPage from "./components/AuthPage.jsx";
import OrdersHistory from "./components/OrdersHistory.jsx";
import { logoutUser, fetchCurrentUser, getAccessToken } from "./services/api.js";

function App() {
  const [currentView, setCurrentView] = useState("store"); // "store" | "auth" | "orders" | "product"
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [initialCategoryFilter, setInitialCategoryFilter] = useState(null);
  const [initialBrandFilter, setInitialBrandFilter] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("threadcraft_customer");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

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

  // Handle URL hash navigation (e.g. #login, #signup, #auth, #orders, #tracking)
  // URL hash navigation
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
          setSelectedProductId(idMatch[1]);
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
    window.location.hash = `#product?id=${productId}`;
    setCurrentView("product");
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

  if (currentView === "auth") {
    return (
      <AuthPage
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onNavigateToStore={navigateToStore}
      />
    );
  }

  if (currentView === "orders") {
    return (
      <OrdersHistory
        currentUser={currentUser}
        onNavigateToStore={navigateToStore}
        onNavigateToAuth={navigateToAuth}
        initialSelectedOrderId={selectedOrderId}
      />
    );
  }

  if (currentView === "product") {
    return (
      <ProductDetail
        productId={selectedProductId}
        onNavigateBack={navigateToStore}
        onNavigateCategory={navigateToCategory}
        onNavigateBrand={navigateToBrand}
        onSelectProduct={navigateToProduct}
      />
    );
  }

  // Default store view
  return (
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
    />
  );
}

export default App;
