
function ProductCard({ product, onAddToCart }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <div className="aspect-[4/5] overflow-hidden bg-stone-100">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">
          {product.category}
        </p>

        <h3 className="mt-2 text-lg font-bold text-stone-900">
          {product.name}
        </h3>

        <p className="mt-1 text-sm text-stone-500">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-lg font-bold text-stone-900">
            ₹{product.price.toLocaleString("en-IN")}
          </p>

          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
