
function Navbar({ cartCount }) {
  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <a href="#" className="text-2xl font-black tracking-tight text-stone-900">
          THREAD<span className="text-amber-600"> & CO.</span>
        </a>

        <div className="hidden items-center gap-7 text-sm font-medium text-stone-600 md:flex">
          <a href="#home" className="hover:text-amber-700">Home</a>
          <a href="#products" className="hover:text-amber-700">Shop</a>
          <a href="#footer" className="hover:text-amber-700">About</a>
        </div>


        <a
          href="#cart"
          aria-label={`View shopping cart with ${cartCount} items`}
          className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold hover:bg-stone-100"
        >
          Cart ({cartCount})
        </a>

      </nav>
    </header>
  )
}

export default Navbar
