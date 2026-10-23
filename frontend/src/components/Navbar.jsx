function Navbar({
  cartCount,
  currentUser,
  onNavigateToAuth,
  onLogout,
  onOpenEmployeePortal,
}) {
  const isEmployee = currentUser?.role === "employee";

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur-md">
      {/* Top Notification Bar for Employees */}
      {isEmployee && (
        <div className="bg-amber-600 px-4 py-1.5 text-center text-xs font-bold text-stone-950 flex items-center justify-center gap-2">
          <span>👔 STAFF TERMINAL MODE ACTIVE</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline font-normal">
            Logged in as <strong className="underline">{currentUser.name}</strong> ({currentUser.emp_role})
          </span>
          <button
            type="button"
            onClick={onOpenEmployeePortal}
            className="ml-2 rounded-full bg-stone-900 px-3 py-0.5 text-[11px] font-bold text-white hover:bg-stone-800 transition"
          >
            Open Staff Portal →
          </button>
        </div>
      )}

      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-8">
          <a href="#home" className="text-2xl font-black tracking-tight text-stone-900">
            THREAD<span className="text-amber-600"> & CO.</span>
          </a>

          <div className="hidden items-center gap-6 text-sm font-medium text-stone-600 md:flex">
            <a href="#home" className="hover:text-amber-700 transition">Home</a>
            <a href="#products" className="hover:text-amber-700 transition">Shop</a>
            <a href="#cart" className="hover:text-amber-700 transition">Cart</a>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Employee Exclusive Portal Button */}
          {isEmployee && (
            <button
              type="button"
              onClick={onOpenEmployeePortal}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-1.5 text-xs font-bold text-amber-950 hover:bg-amber-200 transition"
              title="Open Staff Tools & Inventory Manager"
            >
              <span>⚙️</span>
              <span>Staff Portal</span>
            </button>
          )}

          {/* User Profile Pill or Sign In Button */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onNavigateToAuth}
                className="flex items-center gap-2 rounded-full border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100 transition"
                title="View user profile"
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                    isEmployee ? "bg-amber-600" : "bg-stone-900"
                  }`}
                >
                  {isEmployee ? "👔" : currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                </span>
                <span className="max-w-[110px] truncate sm:max-w-[140px]">
                  {currentUser.name}
                </span>
                {isEmployee && (
                  <span className="rounded bg-amber-200 px-1.5 py-0.2 text-[9px] font-extrabold uppercase text-amber-900">
                    Staff
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="rounded-full px-2.5 py-1.5 text-xs font-medium text-stone-500 hover:text-red-700 transition"
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

          {/* Shopping Cart button */}
          <a
            href="#cart"
            aria-label={`View shopping cart with ${cartCount} items`}
            className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 transition"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span>Cart</span>
            <span className="ml-0.5 rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-bold text-stone-900">
              {cartCount}
            </span>
          </a>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
