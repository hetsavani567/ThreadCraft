import { useRef, useState, useEffect } from "react";
import ProductCard from "./ProductCard.jsx";

// Helper for category-specific icon
function getCategoryIcon(name = "") {
  const lower = name.toLowerCase();
  if (lower.includes("top") || lower.includes("shirt") || lower.includes("upper") || lower.includes("cloth") || lower.includes("tee")) {
    return (
      <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l-4.5 3 2.25 4.5 2.5-1.5V20.25h11v-9.75l2.5 1.5 2.25-4.5-4.5-3a3 3 0 00-4.5 2.25 3 3 0 00-4.5-2.25z" />
      </svg>
    );
  }
  if (lower.includes("bottom") || lower.includes("pant") || lower.includes("jean") || lower.includes("trouser") || lower.includes("lower") || lower.includes("short")) {
    return (
      <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 3.75h12v3.75l-1.5 12.75h-3.25L12 11.25l-1.25 9H7.5L6 7.5V3.75z" />
      </svg>
    );
  }
  if (lower.includes("winter") || lower.includes("jacket") || lower.includes("coat") || lower.includes("sweater")) {
    return (
      <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m-6-15l12 12m0-12L6 18M3 12h18" />
      </svg>
    );
  }
  if (lower.includes("formal") || lower.includes("suit") || lower.includes("blazer")) {
    return (
      <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5l2 4-2 9-2-9 2-4zm-5 0l3 3m7-3l-3 3M4.5 7.5l4 12h7l4-12" />
      </svg>
    );
  }
  if (lower.includes("active") || lower.includes("gym") || lower.includes("sport") || lower.includes("athletic")) {
    return (
      <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  }
  if (lower.includes("ethnic") || lower.includes("kurta") || lower.includes("tradition")) {
    return (
      <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    );
  }
  if (lower.includes("foot") || lower.includes("shoe") || lower.includes("sneaker") || lower.includes("boot")) {
    return (
      <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    );
  }
  if (lower.includes("access") || lower.includes("cap") || lower.includes("bag") || lower.includes("belt") || lower.includes("wallet")) {
    return (
      <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H4.5a1.5 1.5 0 01-1.5-1.5v-8.25M21 11.25l-9-6-9 6m18 0l-9 6-9-6" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
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
  onSelectProduct,
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
      {/* Category Header with Title, Count and Navigation Buttons - Entire header bar is clickable to open Grid View */}
      <div
        onClick={() => onSelectCategory && onSelectCategory(categoryName)}
        className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4 cursor-pointer group hover:bg-amber-50/40 -mx-2 sm:-mx-3 px-2 sm:px-3 pt-1 rounded-2xl transition-colors duration-200"
        title={`Click anywhere in this header to open ${categoryName} section`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 border border-amber-200/70 shadow-xs group-hover:scale-105 group-hover:bg-amber-100 transition">
            {getCategoryIcon(categoryName)}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 group-hover:text-amber-800 transition">
                {categoryName}
              </h3>
              <span className="rounded-full bg-amber-100/80 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                {products.length} {products.length === 1 ? "product" : "products"}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 group-hover:text-amber-700 transition flex items-center gap-1">
              <span>Click section to open {categoryName} in Grid View</span>
              <span className="font-bold text-amber-700">→</span>
            </p>
          </div>
        </div>

        {/* Scroll Navigation Arrows */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
          className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-4 pt-2 px-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-none w-[220px] sm:w-[240px] snap-start flex flex-col"
            >
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                isEmployee={isEmployee}
                onAdjustStock={onAdjustStock}
                onEditVariant={onEditVariant}
                onSelectCategory={onSelectCategory}
                onSelectProduct={onSelectProduct}
              />
            </div>
          ))}

          {onSelectCategory && (
            <div
              onClick={() => onSelectCategory(categoryName)}
              className="flex-none w-[180px] sm:w-[200px] snap-start flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50/70 p-6 text-center hover:border-amber-600 hover:bg-amber-50/50 transition cursor-pointer group shadow-2xs self-stretch"
              title={`Click to open all ${categoryName} in Grid View`}
            >
              <div className="h-12 w-12 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 text-lg group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-stone-950 transition">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
              <p className="mt-3 text-sm font-bold text-stone-900 group-hover:text-amber-800 transition">
                View All {categoryName}
              </p>
              <span className="mt-1 text-xs text-stone-500 group-hover:text-amber-700 transition">
                Open in Grid View →
              </span>
            </div>
          )}
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
