import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import Navbar from "./Navbar.jsx";
import ProductCard from "./ProductCard.jsx";
import Footer from "./Footer.jsx";
import products from "../data/products.js";

const categories = ["All", "Men", "Women", "Accessories"];

function Dashboard() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [apiStatus, setApiStatus] = useState("Checking backend...");

  useEffect(() => {
    apiRequest("/health")
      .then((data) => {
        setApiStatus(data.message);
      })
      .catch((error) => {
        setApiStatus(`Connection failed: ${error.message}`);
      });
  }, []);

  // Add a product or increase its quantity
  function handleAddToCart(product) {
    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  }

  // Increase or decrease a product quantity
  function changeQuantity(productId, amount) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  // Remove a product completely
  function removeFromCart(productId) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId)
    );
  }

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <Navbar cartCount={cartCount} />

      <main>
        {/* Hero section */}
        <section
          id="home"
          className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 md:grid-cols-2 md:py-20"
        >
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-700">
              Everyday style, made simple
            </p>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Find your
              <span className="block text-amber-700">
                everyday look.
              </span>
            </h1>

            <p className="mt-5 max-w-lg leading-7 text-stone-600">
              Explore clothing and accessories for every day.
              Discover timeless essentials and fresh styles.
            </p>

            <a
              href="#products"
              className="mt-7 inline-flex rounded-full bg-stone-900 px-7 py-3 font-semibold text-white hover:bg-amber-700"
            >
              Shop Collection
            </a>
          </div>

          <div className="overflow-hidden rounded-3xl bg-stone-200">
            <img
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=85"
              alt="Clothing collection in a fashion store"
              className="h-72 w-full object-cover sm:h-96"
            />
          </div>
        </section>

        {/* Product catalogue */}
        <section
          id="products"
          className="mx-auto max-w-7xl px-5 py-12"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-amber-700">
                Our collection
              </p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Shop your style
              </h2>
            </div>

            <div className="w-full sm:max-w-sm">
              <label
                htmlFor="product-search"
                className="mb-2 block text-sm font-semibold"
              >
                Search products
              </label>

              <input
                id="product-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search clothing..."
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100"
              />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                aria-pressed={selectedCategory === category}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold ${
                  selectedCategory === category
                    ? "bg-stone-900 text-white"
                    : "border border-stone-300 bg-white hover:border-stone-900"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <p className="mt-6 text-sm text-stone-600">
            {filteredProducts.length} products found
          </p>

          {filteredProducts.length > 0 ? (
            <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl bg-white p-10 text-center">
              <h3 className="text-xl font-bold">No products found</h3>
              <p className="mt-2 text-stone-600">
                Try another search or category.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setSelectedCategory("All")
                }}
                className="mt-4 rounded-full bg-stone-900 px-5 py-2.5 text-white"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* Shopping cart */}
        <section
          id="cart"
          className="mx-auto max-w-7xl px-5 py-12"
        >
          <p className="text-sm font-bold uppercase tracking-widest text-amber-700">
            Your selection
          </p>
          <h2 className="mt-2 text-3xl font-black">
            Shopping Cart ({cartCount})
          </h2>

          {cart.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
              <p className="text-lg font-semibold">
                Your cart is empty
              </p>
              <p className="mt-2 text-stone-600">
                Add some products from our collection to get started.
              </p>
              <a
                href="#products"
                className="mt-5 inline-block rounded-full bg-stone-900 px-6 py-3 font-semibold text-white hover:bg-amber-700"
              >
                Browse Products
              </a>
            </div>
          ) : (
            <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
              <div className="space-y-4">
                {cart.map((item) => (
                  <article
                    key={item.id}
                    className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-28 w-24 rounded-xl object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                        {item.category}
                      </p>
                      <h3 className="mt-1 font-bold">{item.name}</h3>
                      <p className="mt-1 text-stone-600">
                        ₹{item.price.toLocaleString("en-IN")} each
                      </p>
                      <p className="mt-2 font-bold">
                        Subtotal: ₹
                        {(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center rounded-full border border-stone-300">
                        <button
                          type="button"
                          aria-label={`Decrease ${item.name} quantity`}
                          onClick={() => changeQuantity(item.id, -1)}
                          className="px-3 py-2 hover:bg-stone-100"
                        >
                          −
                        </button>

                        <span className="min-w-8 text-center font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          aria-label={`Increase ${item.name} quantity`}
                          onClick={() => changeQuantity(item.id, 1)}
                          className="px-3 py-2 hover:bg-stone-100"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm font-semibold text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* Order summary */}
              <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-6">
                <h3 className="text-xl font-bold">Order Summary</h3>

                <div className="mt-5 flex justify-between gap-3 text-stone-600">
                  <span>Total items</span>
                  <span>{cartCount}</span>
                </div>

                <div className="mt-3 flex justify-between gap-3 text-stone-600">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>

                <div className="mt-4 border-t border-stone-200 pt-4">
                  <div className="flex justify-between gap-3 text-lg font-black">
                    <span>Total</span>
                    <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <p className="mt-2 text-xs text-stone-500">
                    Shipping and taxes are not included in this demo.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    alert("Checkout will be added after backend integration.")
                  }
                  className="mt-6 w-full rounded-full bg-stone-900 px-5 py-3 font-semibold text-white hover:bg-amber-700"
                >
                  Proceed to Checkout
                </button>

                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="mt-3 w-full rounded-full border border-stone-300 px-5 py-3 font-semibold hover:bg-stone-100"
                >
                  Clear Cart
                </button>
              </aside>
            </div>
          )}
        </section>
      </main>

      <p className="mx-auto max-w-7xl px-5 py-3 text-sm text-stone-600">
        Backend status: {apiStatus}
      </p>

      <Footer />
    </div>
  );
}

export default Dashboard;
