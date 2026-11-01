import { useState, useEffect } from "react";
import { BANNER_SLIDES } from "../data/bannerSlides.js";

function HeroImageSlider({ slides = BANNER_SLIDES, autoPlayInterval = 4000, children }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Keep currentIndex valid if slides count decreases
  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

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
    <section
      id="home"
      className="relative flex min-h-[calc(100vh-61px)] h-[calc(100vh-61px)] min-h-[calc(100dvh-61px)] h-[calc(100dvh-61px)] items-center overflow-hidden bg-stone-950 select-none border-0 border-none outline-none scroll-mt-[65px]"
      role="region"
      aria-label="ThreadCraft Storefront Showcase"
    >
      {/* Background Animated Photo Slides */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id || index}
              className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out ${isActive ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
                }`}
            >
              <img
                src={slide.url}
                alt={slide.title || "Background banner"}
                className={`h-full w-full object-cover transition-transform duration-7000 ease-out ${isActive ? "scale-105" : "scale-100"
                  }`}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          );
        })}

        {/* Cinematic Dual Gradient Overlays:
            - Left-to-Right gradient: dark on left for ultra-crisp readable text, transparent towards right to showcase clothing photos
            - Bottom gradient: smooth dark blend into the next section
        */}
        <div className="absolute inset-0 z-20 bg-gradient-to-r from-stone-950/75 via-stone-950/25 to-stone-950/30" />
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-stone-950/75 via-transparent to-stone-950/40" />
      </div>

      {/* Foreground Content: Left-side Hero text */}
      <div className="relative z-30 mx-auto max-w-7xl w-full px-5 py-16 sm:py-24">
        {children}

        {/* Current Slide Info Badge */}
        {activeSlide && (
          <div className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-stone-900/60 backdrop-blur-md border border-white/10 px-4 py-1.5 text-xs text-stone-300 shadow-md">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            {activeSlide.tag && (
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                {activeSlide.tag}
              </span>
            )}
            <span className="text-stone-500">•</span>
            <span className="font-medium text-white">{activeSlide.title}</span>
          </div>
        )}
      </div>

      {/* Scroll Down Indicator into Lower Product Portion */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
        <a
          href="#products"
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById("products");
            if (el) {
              const header = document.querySelector("header");
              const navbarHeight = header ? header.offsetHeight : 61;
              const y = el.getBoundingClientRect().top + window.pageYOffset - navbarHeight + 1;
              window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
              window.history.pushState(null, "", "#products");
            }
          }}
          className="flex flex-col items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-white/70 hover:text-amber-400 transition cursor-pointer"
        >
          <span>Shop Collection</span>
          <svg className="h-4 w-4 animate-bounce text-amber-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </a>
      </div>
    </section>
  );
}

export default HeroImageSlider;
