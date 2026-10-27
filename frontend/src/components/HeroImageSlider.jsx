import { useState, useEffect } from "react";
import { BANNER_SLIDES } from "../data/bannerSlides.js";

function HeroImageSlider({ slides = BANNER_SLIDES, autoPlayInterval = 4000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Purely automatic continuous photo transition (No manual change controls)
  useEffect(() => {
    if (!slides || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [slides, autoPlayInterval]);

  const activeSlide = slides[currentIndex] || slides[0];

  return (
    <div
      className="relative overflow-hidden rounded-3xl bg-stone-900 shadow-xl select-none"
      role="region"
      aria-label="Featured Collection Showcase"
    >
      {/* Aspect Ratio Container */}
      <div className="relative h-72 w-full overflow-hidden sm:h-96">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id || index}
              className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
              }`}
            >
              <img
                src={slide.url}
                alt={slide.title || "Collection visual"}
                className={`h-full w-full object-cover transition-transform duration-6000 ease-out ${
                  isActive ? "scale-105" : "scale-100"
                }`}
                loading={index === 0 ? "eager" : "lazy"}
              />
              {/* Subtle Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-black/25" />
            </div>
          );
        })}

        {/* Top Badges: Category Tag & Auto-play Slide Counter (Informational only, non-clickable) */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
          {activeSlide?.tag && (
            <span className="rounded-full bg-amber-500/90 backdrop-blur-md px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-stone-950 shadow-md">
              {activeSlide.tag}
            </span>
          )}
        </div>

        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full bg-stone-900/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white/90 shadow-md pointer-events-none">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {String(currentIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
        </div>

        {/* Bottom Slide Caption & Info (Non-clickable) */}
        <div className="absolute bottom-5 left-5 right-5 z-20 pointer-events-none">
          <h3 className="text-lg font-bold text-white drop-shadow sm:text-xl transition-all duration-500">
            {activeSlide?.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-white/80 drop-shadow sm:text-sm">
            {activeSlide?.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

export default HeroImageSlider;
