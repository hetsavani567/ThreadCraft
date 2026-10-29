import { useState, useEffect } from "react";

/**
 * CartBucketAnimation
 *
 * When triggered:
 * 1. An elegant shopping bucket rises up from the bottom baseline of the screen.
 * 2. The added product thumbnail drops from above smoothly into the bucket opening.
 * 3. The bucket catches the product with a bounce and "+1 In Bucket" celebration.
 * 4. The bucket returns down beneath the baseline carrying the product.
 */
function CartBucketAnimation({ animationData, onAnimationEnd }) {
  const [stage, setStage] = useState("idle"); // "idle" | "rising" | "dropping" | "caught" | "sinking"

  useEffect(() => {
    if (!animationData) {
      setStage("idle");
      return;
    }

    // Step 1: Bucket rises from baseline (0ms)
    setStage("rising");

    // Step 2: Product starts swooping down into the bucket (300ms)
    const tDrop = setTimeout(() => {
      setStage("dropping");
    }, 320);

    // Step 3: Product hits bucket -> impact bounce & checkmark (750ms)
    const tCaught = setTimeout(() => {
      setStage("caught");
    }, 780);

    // Step 4: Bucket sinks back below the baseline (1200ms)
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
                ? `Added to Bucket! (+${quantity})`
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

        {/* The Bucket / Basket */}
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
                +{quantity} IN CART
              </span>
              <span className="text-base select-none">✨</span>
            </div>
          )}

          {/* Bucket Container SVG Graphic */}
          <div className="relative flex flex-col items-center">
            <svg
              className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-2xl"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Bucket body gradient */}
                <linearGradient id="bucketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="50%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#78350f" />
                </linearGradient>

                {/* Metal rim gradient */}
                <linearGradient id="metalRim" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#e5e7eb" />
                  <stop offset="50%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#9ca3af" />
                </linearGradient>

                {/* Interior shadow */}
                <linearGradient id="innerShadow" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#451a03" />
                  <stop offset="100%" stopColor="#78350f" />
                </linearGradient>
              </defs>

              {/* Bucket Handle */}
              <path
                d="M 32 46 C 32 16, 88 16, 88 46"
                stroke="url(#metalRim)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              {/* Handle grip */}
              <rect
                x="52"
                y="18"
                width="16"
                height="6"
                rx="3"
                fill="#1c1917"
                stroke="#d1d5db"
                strokeWidth="1"
              />

              {/* Bucket Interior Opening (Dark depth) */}
              <ellipse
                cx="60"
                cy="46"
                rx="32"
                ry="10"
                fill="url(#innerShadow)"
              />

              {/* Product inside bucket visible when caught */}
              {(isCaught || isSinking) && (
                <g className="transition-all duration-300">
                  <ellipse
                    cx="60"
                    cy="45"
                    rx="16"
                    ry="6"
                    fill="#fef3c7"
                    opacity="0.8"
                  />
                  <rect
                    x="50"
                    y="36"
                    width="20"
                    height="12"
                    rx="3"
                    fill="#f59e0b"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                </g>
              )}

              {/* Bucket Body: Tapered Trapezoid */}
              <path
                d="M 28 46 L 38 102 C 39 108, 81 108, 82 102 L 92 46 Z"
                fill="url(#bucketGrad)"
                stroke="#78350f"
                strokeWidth="2"
              />

              {/* Front Bucket Top Lip Rim */}
              <ellipse
                cx="60"
                cy="46"
                rx="32"
                ry="8"
                fill="url(#metalRim)"
                stroke="#9ca3af"
                strokeWidth="1.5"
              />

              {/* Embossed Brand Stripes on Bucket */}
              <path
                d="M 34 68 Q 60 76 86 68"
                stroke="#fbbf24"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.8"
                fill="none"
              />
              <path
                d="M 36 84 Q 60 92 84 84"
                stroke="#fbbf24"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.6"
                fill="none"
              />

              {/* ThreadCraft T Monogram on Bucket */}
              <circle cx="60" cy="74" r="9" fill="#1c1917" opacity="0.9" />
              <path
                d="M 55 70 L 65 70 M 60 70 L 60 78"
                stroke="#f59e0b"
                strokeWidth="2"
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
