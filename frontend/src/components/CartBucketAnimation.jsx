import { useState, useEffect } from "react";

/**
 * CartBagAnimation
 *
 * When triggered:
 * 1. An elegant shopping bag rises up from the bottom baseline of the screen.
 * 2. The added product thumbnail drops from above smoothly into the bag opening.
 * 3. The bag catches the product with a bounce and "+1 Added" celebration.
 * 4. The bag returns down beneath the baseline carrying the product.
 */
function CartBucketAnimation({ animationData, onAnimationEnd }) {
  const [stage, setStage] = useState("idle"); // "idle" | "rising" | "dropping" | "caught" | "sinking"

  useEffect(() => {
    if (!animationData) {
      setStage("idle");
      return;
    }

    // Step 1: Bag rises from baseline (0ms)
    setStage("rising");

    // Step 2: Product starts swooping down into the bag (300ms)
    const tDrop = setTimeout(() => {
      setStage("dropping");
    }, 320);

    // Step 3: Product hits bag -> impact bounce & checkmark (750ms)
    const tCaught = setTimeout(() => {
      setStage("caught");
    }, 780);

    // Step 4: Bag sinks back below the baseline (1200ms)
    const tSink = setTimeout(() => {
      setStage("sinking");
    }, 1250);

    // Step 5: Animation complete (1700ms)
    const tDone = setTimeout(() => {
      setStage("idle");
      if (onAnimationEnd) onAnimationEnd();
    }, 1700);

    return () => {
      clearTimeout(tDrop);
      clearTimeout(tCaught);
      clearTimeout(tSink);
      clearTimeout(tDone);
    };
  }, [animationData, onAnimationEnd]);

  if (stage === "idle" || !animationData) return null;

  const { product, quantity = 1 } = animationData;
  const isRising = stage === "rising";
  const isDropping = stage === "dropping";
  const isCaught = stage === "caught";
  const isSinking = stage === "sinking";

  return (
    <aside
      aria-label="Cart animation notification"
      className="fixed inset-x-0 bottom-0 z-50 pointer-events-none flex justify-center items-end overflow-hidden pb-6 sm:pb-8"
    >
      <div className="relative flex flex-col items-center">
        {/* Floating Top Label / Toast banner */}
        <div
          className={`mb-3 transition-all duration-300 ease-out transform ${
            isSinking
              ? "opacity-0 -translate-y-2 scale-95"
              : isCaught
              ? "opacity-100 translate-y-0 scale-100"
              : isDropping
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-4 scale-90"
          }`}
        >
          <div className="bg-stone-900/95 text-white backdrop-blur-md px-4 py-1.5 rounded-full shadow-xl border border-stone-700/80 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold tracking-wide">
              {isCaught
                ? `Added to Bag! (+${quantity})`
                : `Adding ${product?.name?.slice(0, 22) || "item"}...`}
            </span>
          </div>
        </div>

        {/* Dropping Product Item Token */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 z-20 transition-all ease-in-out pointer-events-none ${
            isRising
              ? "opacity-0 -top-24 scale-50"
              : isDropping
              ? "opacity-100 top-2 scale-90 duration-400"
              : isCaught
              ? "opacity-0 top-14 scale-40 duration-200"
              : "opacity-0 top-16 scale-25"
          }`}
        >
          <div className="relative h-14 w-14 rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400 bg-white flex items-center justify-center">
            {product?.image ? (
              <img
                src={product.image}
                alt={product.name || "Product"}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xl">🛍️</span>
            )}
            <span className="absolute -bottom-1 -right-1 bg-amber-600 text-white text-[9px] font-black px-1.5 rounded-full shadow">
              +{quantity}
            </span>
          </div>
        </div>

        {/* The Shopping Bag */}
        <div
          className={`relative z-10 transition-all duration-400 transform ease-out ${
            isRising
              ? "translate-y-0 opacity-100 scale-105"
              : isDropping
              ? "translate-y-0 opacity-100 scale-100"
              : isCaught
              ? "translate-y-1 opacity-100 scale-110"
              : isSinking
              ? "translate-y-36 opacity-0 scale-90 duration-350"
              : "translate-y-40 opacity-0"
          }`}
        >
          {/* Sparkles / Burst effect when caught */}
          {isCaught && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30 pointer-events-none animate-bounce">
              <span className="text-base select-none">✨</span>
              <span className="bg-emerald-600 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-full shadow-lg border border-emerald-400">
                +{quantity} IN BAG
              </span>
              <span className="text-base select-none">✨</span>
            </div>
          )}

          {/* Shopping Bag SVG */}
          <div className="relative flex flex-col items-center">
            <svg
              className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-2xl"
              viewBox="0 0 120 130"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Bag body gradient — warm amber brand colour */}
                <linearGradient id="bagBody" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="50%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#92400e" />
                </linearGradient>

                {/* Bag top-fold darker strip */}
                <linearGradient id="bagTop" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#78350f" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>

                {/* Rope handle gradient */}
                <linearGradient id="handleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#92400e" />
                  <stop offset="50%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#92400e" />
                </linearGradient>
              </defs>

              {/* ── Bag handles (two arched ropes from top corners) ── */}
              {/* Left handle */}
              <path
                d="M 38 44 C 34 18, 52 10, 60 10"
                stroke="url(#handleGrad)"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Right handle */}
              <path
                d="M 82 44 C 86 18, 68 10, 60 10"
                stroke="url(#handleGrad)"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />

              {/* ── Top folded cuff of the bag ── */}
              <rect
                x="22"
                y="38"
                width="76"
                height="14"
                rx="3"
                fill="url(#bagTop)"
              />

              {/* ── Bag body (slightly wider at bottom — trapezoid shape) ── */}
              <path
                d="M 22 50 L 18 116 C 18 120, 102 120, 102 116 L 98 50 Z"
                fill="url(#bagBody)"
                stroke="#92400e"
                strokeWidth="1.5"
              />

              {/* ── Product inside bag visible when caught ── */}
              {(isCaught || isSinking) && (
                <g className="transition-all duration-300">
                  {/* Tissue paper peek */}
                  <path
                    d="M 35 50 Q 60 44 85 50 L 82 60 Q 60 54 38 60 Z"
                    fill="#fef3c7"
                    opacity="0.9"
                  />
                </g>
              )}

              {/* ── Decorative side-fold crease lines ── */}
              <line x1="28" y1="52" x2="24" y2="114" stroke="#b45309" strokeWidth="1.5" opacity="0.5" />
              <line x1="92" y1="52" x2="96" y2="114" stroke="#b45309" strokeWidth="1.5" opacity="0.5" />

              {/* ── Brand stripe ── */}
              <rect x="35" y="74" width="50" height="2.5" rx="1.25" fill="#1c1917" opacity="0.25" />

              {/* ── ThreadCraft "T" monogram badge ── */}
              <circle cx="60" cy="88" r="11" fill="#1c1917" opacity="0.9" />
              <path
                d="M 54 84 L 66 84 M 60 84 L 60 94"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default CartBucketAnimation;
