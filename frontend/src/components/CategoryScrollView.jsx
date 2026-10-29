import { useRef, useState, useEffect } from "react";
import ProductCard from "./ProductCard.jsx";

// Helper for category-specific icon
function getCategoryIcon(name = "") {
  const lower = name.toLowerCase();
  if (lower.includes("upper") || lower.includes("cloth") || lower.includes("shirt") || lower.includes("apparel") || lower.includes("top")) {
    return (
      <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    );
  }
  if (lower.includes("lower") || lower.includes("pant") || lower.includes("jean") || lower.includes("trouser") || lower.includes("bottom")) {
    return (
      <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h12v4l-2 14h-3.5L12 11l-.5 10H8L6 7V3z" />
      </svg>
    );
  }
  if (lower.includes("foot") || lower.includes("shoe")) {
    return (
      <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    );
  }
  if (lower.includes("access") || lower.includes("cap") || lower.includes("bag")) {
    return (
      <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-8.25M21 11.25l-9-6-9 6m18 0l-9 6-9-6" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  );
}

function CategoryScrollView({
  categoryName,
  products = [],
  onAddToCart,
  isEmployee,
  onAdjustStock,
  onEditVariant,
  onSelectCategory,
}) {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function checkScrollability() {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    // Tolerance of 10px for rounding discrepancies
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }

  useEffect(() => {
    checkScrollability();
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleResize = () => checkScrollability();
    window.addEventListener("resize", handleResize);

    // Also observe content width changes
    let observer = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => checkScrollability());
      observer.observe(el);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (observer) observer.disconnect();
    };
  }, [products]);

  function handleScroll(direction) {
    const el = scrollContainerRef.current;
    if (!el) return;
    // Scroll by roughly 2 cards width
    const scrollAmount = 520;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkScrollability, 350);
  }

  if (!products || products.length === 0) return null;

  return (
    <section className="mt-8 rounded-3xl border border-stone-200/80 bg-white/70 p-5 sm:p-6 shadow-xs backdrop-blur-xs transition hover:border-stone-300">
      {/* Category Header with Title, Count and Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-200/70 shadow-xs">
            {getCategoryIcon(categoryName)}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900">
                {categoryName}
              </h3>
              <span className="rounded-full bg-amber-100/80 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                {products.length} {products.length === 1 ? "product" : "products"}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Swipe or use arrows to view all products in this category
            </p>
          </div>
        </div>

        {/* Scroll Navigation Arrows & View in Grid */}
        <div className="flex items-center gap-2">
          {onSelectCategory && (
            <button
              type="button"
              onClick={() => onSelectCategory(categoryName)}
              className="mr-1 inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 shadow-xs hover:border-amber-600 hover:text-amber-800 transition cursor-pointer"
            >
              <span>View in Grid</span>
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            aria-label={`Scroll ${categoryName} left`}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
              canScrollLeft
                ? "border-stone-300 bg-white text-stone-800 shadow-xs hover:bg-stone-100 hover:border-stone-400 active:scale-95 cursor-pointer"
                : "border-stone-200 bg-stone-100 text-stone-300 cursor-not-allowed"
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            aria-label={`Scroll ${categoryName} right`}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
              canScrollRight
                ? "border-stone-300 bg-white text-stone-800 shadow-xs hover:bg-stone-100 hover:border-stone-400 active:scale-95 cursor-pointer"
                : "border-stone-200 bg-stone-100 text-stone-300 cursor-not-allowed"
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Horizontal Scroll View Container */}
      <div className="relative mt-4">
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollability}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-2 px-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-none w-[220px] sm:w-[240px] snap-start"
            >
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                isEmployee={isEmployee}
                onAdjustStock={onAdjustStock}
                onEditVariant={onEditVariant}
                onSelectCategory={onSelectCategory}
              />
            </div>
          ))}
        </div>

        {/* Right edge subtle gradient fade hint when more items are available to scroll */}
        {canScrollRight && (
          <div
            onClick={() => handleScroll("right")}
            className="pointer-events-none absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-white/90 to-transparent rounded-r-2xl hidden sm:block"
            aria-hidden="true"
          />
        )}
      </div>
    </section>
  );
}

export default CategoryScrollView;
