import { useState } from "react";

function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail("");
        setSubscribed(false);
      }, 3500);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      id="footer"
      className="relative mt-16 overflow-hidden border-t border-stone-800/80 bg-stone-950 text-stone-300"
    >
      {/* Subtle ambient lighting / glow behind footer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-24 flex justify-center opacity-25 blur-3xl"
      >
        <div className="h-44 w-3/4 max-w-4xl bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-amber-700/30" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pt-12 pb-8 sm:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 lg:gap-12 pb-10 border-b border-stone-800/60">
          
          {/* Brand Info & Newsletter */}
          <div className="md:col-span-6 lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                T
              </span>
              <a
                href="#home"
                className="text-2xl font-black tracking-tight text-white transition hover:opacity-90"
              >
                THREAD<span className="text-amber-500 font-serif italic font-normal"> & CO.</span>
              </a>
            </div>

            <p className="text-sm leading-relaxed text-stone-400 max-w-md">
              Elevating daily wardrobes through thoughtful craft, sustainable tailoring, and timeless silhouette essentials. Engineered for elegance, comfort, and enduring quality.
            </p>

            {/* Quick newsletter inline mini-form with glassmorphic input */}
            <div className="pt-2">
              <p className="text-xs font-semibold tracking-wider uppercase text-stone-400 mb-2">
                Join our exclusive insider list
              </p>
              <form onSubmit={handleSubscribe} className="flex max-w-md items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-xl border border-stone-800 bg-stone-900/70 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 backdrop-blur-md transition focus:border-amber-500/80 focus:bg-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500/60"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-amber-900/20 transition hover:from-amber-500 hover:to-amber-600 hover:shadow-amber-600/30 active:scale-95 cursor-pointer"
                >
                  {subscribed ? "Joined ✓" : "Subscribe"}
                </button>
              </form>
              {subscribed && (
                <p className="mt-1.5 text-xs text-emerald-400 animate-pulse">
                  Thank you! You're now on our priority list.
                </p>
              )}
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-500/90">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="#home"
                  className="group inline-flex items-center gap-1.5 text-stone-400 transition hover:text-white"
                >
                  <span className="h-1 w-1 rounded-full bg-stone-600 group-hover:bg-amber-400 group-hover:w-2 transition-all"></span>
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#products"
                  className="group inline-flex items-center gap-1.5 text-stone-400 transition hover:text-white"
                >
                  <span className="h-1 w-1 rounded-full bg-stone-600 group-hover:bg-amber-400 group-hover:w-2 transition-all"></span>
                  Explore Catalog
                </a>
              </li>
              <li>
                <a
                  href="#cart"
                  className="group inline-flex items-center gap-1.5 text-stone-400 transition hover:text-white"
                >
                  <span className="h-1 w-1 rounded-full bg-stone-600 group-hover:bg-amber-400 group-hover:w-2 transition-all"></span>
                  Shopping Cart
                </a>
              </li>
              <li>
                <a
                  href="#products"
                  className="group inline-flex items-center gap-1.5 text-stone-400 transition hover:text-white"
                >
                  <span className="h-1 w-1 rounded-full bg-stone-600 group-hover:bg-amber-400 group-hover:w-2 transition-all"></span>
                  Featured & New Arrivals
                </a>
              </li>
            </ul>
          </div>

          {/* Store & Quality Commitments */}
          <div className="md:col-span-3 lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-500/90">
              Craftsmanship
            </h4>
            <div className="space-y-2 text-xs text-stone-400">
              <div className="flex items-start gap-2.5 rounded-lg border border-stone-800/80 bg-stone-900/40 p-2.5 backdrop-blur-xs">
                <span className="text-amber-400 text-sm mt-0.5">✦</span>
                <div>
                  <strong className="text-stone-200 block font-medium">100% Premium Fabric</strong>
                  <span>Ethically sourced textiles with precision stitching.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-lg border border-stone-800/80 bg-stone-900/40 p-2.5 backdrop-blur-xs">
                <span className="text-amber-400 text-sm mt-0.5">✦</span>
                <div>
                  <strong className="text-stone-200 block font-medium">Seamless Experience</strong>
                  <span>Instant checkout, live stock syncing & real-time inventory.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Icons & Highlights Bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Social Icons */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-800 bg-stone-900/80 text-stone-400 transition hover:border-amber-500/50 hover:bg-stone-800 hover:text-amber-400 hover:scale-105"
              aria-label="Instagram"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-800 bg-stone-900/80 text-stone-400 transition hover:border-amber-500/50 hover:bg-stone-800 hover:text-amber-400 hover:scale-105"
              aria-label="Twitter / X"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>

          {/* Quick Back to Top button */}
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 rounded-full border border-stone-800 bg-stone-900/60 px-4 py-1.5 text-xs font-medium text-stone-300 transition hover:border-amber-500/50 hover:bg-stone-800 hover:text-amber-400 cursor-pointer"
          >
            <span>Back to top</span>
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Bottom Credits & Copyright Bar */}
        <div className="pt-6 border-t border-stone-800/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© {currentYear} THREAD & CO. All rights reserved.</p>
          <div className="flex items-center gap-4 text-stone-400">
            <span className="hover:text-stone-300 transition cursor-default">Modern Retail System</span>
            <span>•</span>
            <span className="hover:text-stone-300 transition cursor-default">Privacy & Terms</span>
            <span>•</span>
            <span className="text-amber-500/80 font-medium">Crafted with Care</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
