import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard.jsx";
import AuthPage from "./components/AuthPage.jsx";
import OrdersHistory from "./components/OrdersHistory.jsx";

function App() {
  const [currentView, setCurrentView] = useState("store"); // "store" | "auth" | "orders"
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("threadcraft_customer");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Handle URL hash navigation (e.g. #login, #signup, #auth, #orders, #tracking)
  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash.toLowerCase();
      if (hash === "#login" || hash === "#signup" || hash === "#auth") {
        setCurrentView("auth");
      } else if (hash === "#orders" || hash === "#tracking" || hash.startsWith("#orders")) {
        // Extract order ID if present (e.g., #orders?id=3)
        const idMatch = window.location.hash.match(/[?&]id=([^&]+)/i);
        if (idMatch && idMatch[1]) {
          setSelectedOrderId(idMatch[1]);
        }
        setCurrentView("orders");
      } else if (hash === "#home" || hash === "#products" || hash === "#cart" || hash === "#payment" || hash === "") {
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

  function handleLogout() {
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

  return (
    <Dashboard
      currentUser={currentUser}
      onNavigateToAuth={navigateToAuth}
      onLogout={handleLogout}
      onNavigateToOrders={navigateToOrders}
    />
  );
}

export default App;
