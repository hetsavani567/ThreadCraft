import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard.jsx";
import AuthPage from "./components/AuthPage.jsx";

function App() {
  const [currentView, setCurrentView] = useState("store"); // "store" | "auth"
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("threadcraft_customer");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Handle URL hash navigation (e.g. #login, #signup, #auth)
  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash.toLowerCase();
      if (hash === "#login" || hash === "#signup" || hash === "#auth") {
        setCurrentView("auth");
      } else if (hash === "#home" || hash === "#products" || hash === "#cart" || hash === "") {
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

  return (
    <Dashboard
      currentUser={currentUser}
      onNavigateToAuth={navigateToAuth}
      onLogout={handleLogout}
    />
  );
}

export default App;
