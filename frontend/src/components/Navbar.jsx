function Navbar({
  cartCount = 0,
  currentUser,
  onNavigateToAuth,
  onLogout,
  onOpenEmployeePortal,
  onNavigateToOrders,
  onNavigateToStore,
  searchQuery = "",
  onSearchChange,
}) {
  const isEmployee = Boolean(
    currentUser &&
      (currentUser.role === "employee" ||
        currentUser.userType === "employee" ||
        Boolean(currentUser.emp_id) ||
        (currentUser.email && currentUser.email.toLowerCase().endsWith("@thread.com")))
  );
  const isLoggedInCustomer = Boolean(currentUser && !isEmployee);

  function handleHomeClick(e) {
    if (!isEmployee) {
      e.preventDefault();
      if (onSearchChange) onSearchChange("");
      if (onNavigateToStore) {
        onNavigateToStore();
      } else {
        if (window.location.hash) {
          window.history.pushState(null, "", window.location.pathname);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }

  function handleShopClick(e) {
    e.preventDefault();
    const el = document.getElementById("products");
    if (el) {
      const header = document.querySelector("header");
      const navbarHeight = header ? header.offsetHeight : 61;
      const y = el.getBoundingClientRect().top + window.pageYOffset - navbarHeight + 1;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      window.history.pushState(null, "", "#products");
    } else {
      if (onNavigateToStore) onNavigateToStore();
      window.location.hash = "#products";
    }
  }

  function handleCartClick(e) {
    e.preventDefault();
    const el = document.getElementById("cart");
    if (el) {
      const header = document.querySelector("header");
      const navbarHeight = header ? header.offsetHeight : 61;
      const y = el.getBoundingClientRect().top + window.pageYOffset - navbarHeight + 1;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      window.history.pushState(null, "", "#cart");
    } else {
      if (onNavigateToStore) onNavigateToStore();
      window.location.hash = "#cart";
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 gap-3 md:gap-5">
        <div className="flex items-center gap-5 lg:gap-8 shrink-0">
          <a
            href={isEmployee ? "#products" : "/"}
            onClick={handleHomeClick}
            className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 cursor-pointer shrink-0"
          >
            THREAD<span className="text-amber-600"> & CO.</span>
          </a>

          <div className="hidden items-center gap-5 text-sm font-medium text-stone-600 md:flex">
            {!isEmployee ? (
              <>
                <a
                  href="/"
                  onClick={handleHomeClick}
                  className="hover:text-amber-700 transition cursor-pointer"
                >
                  Home
                </a>
                <a
                  href="#products"
                  onClick={handleShopClick}
                  className="hover:text-amber-700 transition cursor-pointer"
                >
                  Shop
                </a>
                {isLoggedInCustomer && (
                  <>
                    <a
                      href="#orders"
                      onClick={(e) => {
                        if (onNavigateToOrders) {
                          e.preventDefault();
                          onNavigateToOrders();
                        }
                      }}
                      className="hover:text-amber-700 transition flex items-center gap-1 cursor-pointer"
                    >
                      Orders & Tracking
                    </a>
                    <a
                      href="#cart"
                      onClick={handleCartClick}
                      className="hover:text-amber-700 transition cursor-pointer"
                    >
                      Cart{cartCount > 0 ? ` (${cartCount})` : ""}
                    </a>
                  </>
                )}
              </>
            ) : (
              <a
                href="#products"
                onClick={handleShopClick}
                className="hover:text-amber-700 transition cursor-pointer"
              >
                Inventory & Products
              </a>
            )}
          </div>
        </div>

        {/* Middle Search Bar */}
        <div className="flex-1 max-w-md mx-1 sm:mx-3">
          <div className="relative w-full">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </span>
            <input
              id="navbar-product-search"
              type="text"
              autoComplete="off"
              value={searchQuery || ""}
              onChange={(e) => {
                const val = e.target.value;
                if (onSearchChange) onSearchChange(val);
                if (val.trim()) {
                  const el = document.getElementById("products");
                  if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top > 350) {
                      const header = document.querySelector("header");
                      const navbarHeight = header ? header.offsetHeight : 61;
                      const y = rect.top + window.pageYOffset - navbarHeight + 1;
                      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
                    }
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const el = document.getElementById("products");
                  if (el) {
                    const header = document.querySelector("header");
                    const navbarHeight = header ? header.offsetHeight : 61;
                    const y = el.getBoundingClientRect().top + window.pageYOffset - navbarHeight + 1;
                    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
                  }
                }
              }}
              placeholder="Search by name, brand, category..."
              className="w-full rounded-xl border border-stone-300 bg-stone-50/80 py-2 pl-9 pr-8 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-amber-700 focus:bg-white focus:ring-2 focus:ring-amber-100 shadow-2xs [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-ms-clear]:hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  if (onSearchChange) onSearchChange("");
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                title="Clear search"
                aria-label="Clear search"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-stone-200 text-[10px] font-bold text-stone-600 hover:bg-stone-300 transition">
                  ✕
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* User Profile Avatar or Sign In Button */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={isEmployee ? onOpenEmployeePortal : onNavigateToAuth}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 bg-stone-50 hover:bg-stone-100 hover:border-stone-400 transition cursor-pointer shadow-2xs"
                title={isEmployee ? "Open Staff Portal" : (currentUser.name ? `${currentUser.name} - Profile` : "View profile")}
                aria-label={isEmployee ? "Open Staff Portal" : "View profile"}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${
                    isEmployee ? "bg-amber-600" : "bg-stone-900"
                  }`}
                >
                  {isEmployee ? "👔" : currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                </span>
              </button>

              <button
                type="button"
                id="logout-btn"
                onClick={onLogout}
                className="rounded-full px-2.5 py-1.5 text-xs font-medium text-stone-500 hover:text-red-700 transition cursor-pointer"
                title="Sign out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onNavigateToAuth}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-800 shadow-xs hover:border-stone-900 hover:bg-stone-50 transition"
            >
              <svg className="h-4 w-4 text-stone-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <span>Sign In</span>
            </button>
          )}

        </div>
      </nav>
    </header>
  );
}

export default Navbar;
