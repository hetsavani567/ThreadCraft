import { useState } from "react";
import { createOrder } from "../services/api";
import RetailInvoice from "./RetailInvoice.jsx";

function PaymentPage({
  cart = [],
  cartTotal = 0,
  currentUser = null,
  onClose,
  onClearCart,
  onNavigateToAuth,
  onViewOrders,
}) {
  // Stepper / flow state: 'checkout' | 'processing' | 'success'
  const [checkoutStep, setCheckoutStep] = useState("checkout");
  const [showRetailInvoice, setShowRetailInvoice] = useState(false);

  // Selected payment method tab
  const [paymentMethod, setPaymentMethod] = useState("card"); // 'card' | 'upi' | 'netbanking' | 'cod' | 'emi'

  // Card details state
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState(currentUser?.name || "");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [saveCard, setSaveCard] = useState(true);

  // UPI state
  const [selectedUpiApp, setSelectedUpiApp] = useState("gpay");
  const [upiId, setUpiId] = useState("");
  const [isUpiVerified, setIsUpiVerified] = useState(false);

  // Net banking state
  const [selectedBank, setSelectedBank] = useState("hdfc");

  // COD state
  const [codCaptchaInput, setCodCaptchaInput] = useState("");
  const [codCaptcha] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());

  // Coupon / Promo state
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState(null);

  // Shipping address state (prefilled from currentUser if present)
  const [isEditingAddress, setIsEditingAddress] = useState(!currentUser);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: currentUser?.name || "",
    mobile: currentUser?.mobile_no || currentUser?.mobile || "",
    houseNo: currentUser?.house_no || "",
    street: currentUser?.street || "",
    area: currentUser?.area || "",
    city: currentUser?.city || "Ahmedabad",
    state: currentUser?.state || "Gujarat",
    pincode: currentUser?.pincode || "380001",
  });

  // Mock confirmed order details
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Calculate discount and final payable total
  const discountAmount = Math.round((cartTotal * appliedDiscount) / 100);
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  // Format card number with spaces every 4 digits
  function handleCardNumberChange(e) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  }

  // Format expiry MM/YY
  function handleExpiryChange(e) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  }

  // Detect card brand
  function getCardBrand() {
    const clean = cardNumber.replace(/\s/g, "");
    if (clean.startsWith("4")) return "VISA";
    if (clean.startsWith("5")) return "MASTERCARD";
    if (clean.startsWith("6") || clean.startsWith("35")) return "RUPAY";
    if (clean.startsWith("34") || clean.startsWith("37")) return "AMEX";
    return "CARD";
  }

  // Apply discount coupon
  function handleApplyCoupon(e) {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === "THREAD10" || code === "SAVE10") {
      setAppliedDiscount(10);
      setCouponMessage({ type: "success", text: "10% Discount applied successfully! 🎉" });
    } else if (code === "FIRST15") {
      setAppliedDiscount(15);
      setCouponMessage({ type: "success", text: "15% Special Welcome discount applied! ✨" });
    } else if (code === "") {
      setCouponMessage({ type: "error", text: "Please enter a coupon code." });
    } else {
      setCouponMessage({ type: "error", text: "Invalid or expired coupon code." });
    }
  }

  // Verify UPI ID
  function handleVerifyUpi() {
    if (upiId.includes("@") && upiId.length > 4) {
      setIsUpiVerified(true);
    } else {
      alert("Please enter a valid UPI ID (e.g., yourname@oksbi or mobile@upi)");
    }
  }

  // Trigger simulated payment
  function handleProcessPayment(e) {
    e.preventDefault();

    // Check basic address requirements
    if (!shippingAddress.fullName || !shippingAddress.mobile || !shippingAddress.street) {
      setIsEditingAddress(true);
      alert("Please fill in your complete shipping address details before continuing.");
      return;
    }

    if (paymentMethod === "cod" && codCaptchaInput !== codCaptcha) {
      alert("Incorrect verification code for Cash on Delivery. Please re-enter.");
      return;
    }

    setCheckoutStep("processing");

    // Submit order to backend & persist locally
    (async () => {
      const cleanPaymentMethod =
        paymentMethod === "card"
          ? `${getCardBrand()} ending in ${cardNumber.slice(-4) || "4242"}`
          : paymentMethod === "upi"
          ? `UPI (${selectedUpiApp.toUpperCase()})`
          : paymentMethod === "netbanking"
          ? `Net Banking (${selectedBank.toUpperCase()})`
          : "Cash on Delivery (COD)";

      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 3);

      let createdId = `TC-${Math.floor(100000 + Math.random() * 900000)}`;

      try {
        const payload = {
          cust_id: currentUser?.cust_id || null,
          email: currentUser?.email || "customer@demo.com",
          branch_id: 1,
          discount: discountAmount,
          final_amount: finalTotal,
          paymentMethod: cleanPaymentMethod,
          shipping: { ...shippingAddress },
          items: cart.map((c) => ({
            id: c.id,
            product_id: c.id,
            variant_id: c.selectedVariant?.variant_id || null,
            quantity: c.quantity || 1,
            price: Number(c.price) || 0,
            name: c.name,
            color_size: c.selectedColorSize || "Standard",
            image: c.image,
          })),
        };

        const res = await createOrder(payload);
        if (res?.order?.order_id) {
          createdId = res.order.order_id;
        }
      } catch (err) {
        console.warn("Could not save order directly to database, saving to local state:", err);
      }

      const orderData = {
        orderId: createdId,
        order_id: createdId,
        amount: finalTotal,
        discount: discountAmount,
        paymentMethod: cleanPaymentMethod,
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        estimatedDelivery: deliveryDate.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
        items: [...cart],
        shipping: { ...shippingAddress },
        order_status: "Placed",
      };

      // Persist to local storage
      try {
        const existing = JSON.parse(localStorage.getItem("threadcraft_orders") || "[]");
        localStorage.setItem("threadcraft_orders", JSON.stringify([orderData, ...existing]));
      } catch (e) {
        console.warn("Could not save order to localStorage:", e);
      }

      setConfirmedOrder(orderData);
      setCheckoutStep("success");
    })();
  }

  // Print authentic retail receipt
  function handlePrintReceipt() {
    setShowRetailInvoice(true);
  }

  // Done shopping -> clear cart and return to catalog
  function handleFinishAndReturn() {
    if (onClearCart) onClearCart();
    if (onClose) onClose();
    window.location.hash = "#products";
  }

  /* ------------------------------------------------------------- */
  /* SUCCESS CONFIRMATION VIEW                                     */
  /* ------------------------------------------------------------- */
  if (checkoutStep === "success" && confirmedOrder) {
    return (
      <div className="min-h-screen bg-stone-100 py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-2xl">
          {/* Success Card */}
          <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xl">
            {/* Top Green Accent Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-8 text-center text-white">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md shadow-inner">
                <svg className="h-9 w-9 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                Payment Successful!
              </h1>
              <p className="mt-1 text-sm text-emerald-100">
                Thank you for shopping with <strong className="font-bold text-white">THREAD & CO.</strong>
              </p>
            </div>

            {/* Receipt Summary Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-5">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-stone-500">Order Reference</span>
                  <p className="text-lg font-black text-stone-900">{confirmedOrder.orderId}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-bold tracking-wider text-stone-500">Amount Paid</span>
                  <p className="text-xl font-black text-amber-600">₹{confirmedOrder.amount.toLocaleString("en-IN")}</p>
                </div>
              </div>

              {/* Order Meta Grid */}
              <div className="grid grid-cols-1 gap-4 rounded-2xl bg-stone-50 p-4 text-xs sm:grid-cols-3">
                <div>
                  <span className="font-bold text-stone-500">Payment Mode</span>
                  <p className="mt-0.5 font-semibold text-stone-900">{confirmedOrder.paymentMethod}</p>
                </div>
                <div>
                  <span className="font-bold text-stone-500">Estimated Delivery</span>
                  <p className="mt-0.5 font-semibold text-emerald-700">📦 {confirmedOrder.estimatedDelivery}</p>
                </div>
                <div>
                  <span className="font-bold text-stone-500">Order Date</span>
                  <p className="mt-0.5 font-semibold text-stone-900">{confirmedOrder.date}</p>
                </div>
              </div>

              {/* Delivery To Details */}
              <div className="rounded-2xl border border-stone-200 p-4 text-xs text-stone-700">
                <span className="font-bold uppercase tracking-wider text-stone-500 block mb-1">Delivering To</span>
                <p className="font-bold text-sm text-stone-900">{confirmedOrder.shipping.fullName}</p>
                <p className="text-stone-600">{confirmedOrder.shipping.mobile}</p>
                <p className="mt-1 text-stone-600">
                  {[
                    confirmedOrder.shipping.houseNo,
                    confirmedOrder.shipping.street,
                    confirmedOrder.shipping.area,
                    confirmedOrder.shipping.city,
                    confirmedOrder.shipping.state,
                    confirmedOrder.shipping.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>

              {/* Items Snapshot */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-3">Items Purchased</span>
                <div className="divide-y divide-stone-100 max-h-48 overflow-y-auto pr-1">
                  {confirmedOrder.items.map((item) => (
                    <div key={item.cartKey} className="flex items-center justify-between py-2 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-200 text-[10px] font-bold text-stone-700">
                          {item.quantity}x
                        </span>
                        <div>
                          <p className="font-semibold text-stone-900 line-clamp-1">{item.name}</p>
                          {item.selectedColorSize && (
                            <p className="text-[11px] text-stone-500">{item.selectedColorSize}</p>
                          )}
                        </div>
                      </div>
                      <span className="font-semibold text-stone-900">
                        ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notice */}
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 flex items-center gap-2.5">
                <span className="text-base">🔔</span>
                <p>
                  A confirmation SMS & email have been simulated. In a live deployment, this order updates your inventory.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                {onViewOrders && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onClearCart) onClearCart();
                      onViewOrders(confirmedOrder.orderId);
                    }}
                    className="flex-1 rounded-full bg-amber-600 py-3.5 text-center font-bold text-sm text-white shadow-md hover:bg-amber-700 transition cursor-pointer"
                  >
                    Track Order & View History 📦
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleFinishAndReturn}
                  className="flex-1 rounded-full bg-stone-900 py-3.5 text-center font-bold text-sm text-white shadow-md hover:bg-stone-800 transition cursor-pointer"
                >
                  Continue Shopping
                </button>
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="rounded-full border border-stone-300 px-5 py-3.5 font-semibold text-sm text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                >
                  Print 🖨️
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Authentic Sharp Retail Bill Modal */}
        {showRetailInvoice && confirmedOrder && (
          <RetailInvoice
            order={confirmedOrder}
            onClose={() => setShowRetailInvoice(false)}
          />
        )}
      </div>
    );
  }

  /* ------------------------------------------------------------- */
  /* PAYMENT PROCESSING ANIMATION SCREEN                           */
  /* ------------------------------------------------------------- */
  if (checkoutStep === "processing") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute h-full w-full rounded-full border-4 border-amber-500/20 animate-ping" />
          <div className="h-16 w-16 rounded-full border-4 border-amber-600 border-t-transparent animate-spin" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-stone-900">Processing Your Payment...</h2>
        <p className="mt-2 text-sm text-stone-500 max-w-sm">
          Please do not refresh or close this window. We are securely validating your payment details with 256-bit encryption.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-100 px-4 py-1.5 text-xs font-medium text-stone-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Bank Gateway Active
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------- */
  /* MAIN PAYMENT CHECKOUT UI                                      */
  /* ------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Top Checkout Header */}
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-200 transition cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span>Back to Cart</span>
            </button>

            <span className="text-xl font-black tracking-tight text-stone-900 sm:text-2xl">
              THREAD<span className="text-amber-600"> & CO.</span>
            </span>
          </div>

          {/* SSL Encryption Badge */}
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
            <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span className="hidden sm:inline">256-Bit SSL Encrypted Checkout</span>
            <span className="sm:hidden">SSL Secure</span>
          </div>
        </div>
      </header>

      {/* Stepper Progress Bar */}
      <div className="border-b border-stone-200 bg-white py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 text-xs font-semibold sm:gap-6">
          <div className="flex items-center gap-1.5 text-stone-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">✓</span>
            <span>Bag</span>
          </div>
          <span className="text-stone-300">───</span>
          <div className="flex items-center gap-1.5 text-stone-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">✓</span>
            <span>Address</span>
          </div>
          <span className="text-stone-300">───</span>
          <div className="flex items-center gap-1.5 text-amber-700">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-white text-[11px] font-bold">3</span>
            <span className="font-bold">Payment</span>
          </div>
          <span className="text-stone-300">───</span>
          <div className="flex items-center gap-1.5 text-stone-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-200 text-stone-500 text-[11px] font-bold">4</span>
            <span>Receipt</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: Shipping & Payment Method Selection (7 cols) */}
          {/* ======================================================== */}
          <div className="space-y-6 lg:col-span-7">
            
            {/* Delivery Address Card */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-stone-100 text-stone-800 text-xs font-bold">
                    📍
                  </span>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                    Delivery Address
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 transition cursor-pointer"
                >
                  {isEditingAddress ? "Save Address" : "Change Address"}
                </button>
              </div>

              {!isEditingAddress ? (
                <div className="pt-3 text-xs text-stone-600">
                  <p className="font-bold text-sm text-stone-900">{shippingAddress.fullName}</p>
                  <p className="mt-0.5 text-stone-500">Phone: {shippingAddress.mobile}</p>
                  <p className="mt-1 leading-relaxed">
                    {[
                      shippingAddress.houseNo,
                      shippingAddress.street,
                      shippingAddress.area,
                      shippingAddress.city,
                      shippingAddress.state,
                      shippingAddress.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 pt-3 text-xs sm:grid-cols-2">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      placeholder="Receiver's name"
                      className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Mobile Number</label>
                    <input
                      type="text"
                      value={shippingAddress.mobile}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, mobile: e.target.value })}
                      placeholder="10-digit mobile"
                      className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-stone-700 mb-1">Flat / House / Building & Street</label>
                    <input
                      type="text"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      placeholder="e.g. 402 Sunshine Apts, MG Road"
                      className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">City</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">PIN Code</label>
                    <input
                      type="text"
                      value={shippingAddress.pincode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                      className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payment Options Container */}
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
              <div className="border-b border-stone-100 bg-stone-50/70 p-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                  Select Payment Option
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Choose your preferred payment method. Encrypted & 100% risk-free.
                </p>
              </div>

              {/* Payment Tab Navigation */}
              <div className="grid grid-cols-2 gap-2 border-b border-stone-200 p-3 sm:grid-cols-4 bg-stone-50/30">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition cursor-pointer ${
                    paymentMethod === "card"
                      ? "border-amber-600 bg-amber-50 text-amber-900 shadow-xs"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  }`}
                >
                  <span className="text-base">💳</span>
                  <span>Credit / Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition cursor-pointer ${
                    paymentMethod === "upi"
                      ? "border-amber-600 bg-amber-50 text-amber-900 shadow-xs"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  }`}
                >
                  <span className="text-base">⚡</span>
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("netbanking")}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition cursor-pointer ${
                    paymentMethod === "netbanking"
                      ? "border-amber-600 bg-amber-50 text-amber-900 shadow-xs"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  }`}
                >
                  <span className="text-base">🏦</span>
                  <span>Net Banking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold transition cursor-pointer ${
                    paymentMethod === "cod"
                      ? "border-amber-600 bg-amber-50 text-amber-900 shadow-xs"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  }`}
                >
                  <span className="text-base">📦</span>
                  <span>Cash on Delivery</span>
                </button>
              </div>

              {/* Tab Form Contents */}
              <div className="p-5 sm:p-6">
                
                {/* 1. CREDIT/DEBIT CARD OPTION */}
                {paymentMethod === "card" && (
                  <div className="space-y-6">
                    {/* Live Interactive Card Preview */}
                    <div className="relative mx-auto max-w-sm overflow-hidden rounded-2xl bg-gradient-to-tr from-stone-900 via-stone-800 to-amber-950 p-6 text-white shadow-xl border border-stone-700/60">
                      {/* Top Bar with Chip & Brand */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-9 rounded-md bg-amber-300/80 border border-amber-400 shadow-inner flex items-center justify-center">
                            <div className="h-4 w-6 border-y border-amber-600/40 opacity-70" />
                          </div>
                          <span className="text-[10px] uppercase tracking-wider text-amber-200 font-bold">
                            THREAD & CO. Platinum
                          </span>
                        </div>
                        <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-black tracking-widest text-amber-400 backdrop-blur-xs">
                          {getCardBrand()}
                        </span>
                      </div>

                      {/* Card Number */}
                      <div className="mt-7 font-mono text-lg font-bold tracking-widest text-stone-100 sm:text-xl">
                        {cardNumber || "•••• •••• •••• ••••"}
                      </div>

                      {/* Bottom Meta */}
                      <div className="mt-6 flex items-end justify-between text-xs">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest text-stone-400 block">
                            Card Holder
                          </span>
                          <span className="font-bold tracking-wider uppercase text-white truncate max-w-[170px] block">
                            {cardHolder || "YOUR FULL NAME"}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] uppercase tracking-widest text-stone-400 block">
                            Expires
                          </span>
                          <span className="font-mono font-bold text-white">
                            {cardExpiry || "MM/YY"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Input Fields */}
                    <form onSubmit={handleProcessPayment} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Card Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="4532 •••• •••• 4242"
                            className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm font-mono text-stone-900 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none"
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-bold text-stone-500 uppercase">
                            {getCardBrand()}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          required
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Name as printed on card"
                          className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            placeholder="MM / YY"
                            className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm font-mono text-stone-900 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            CVV / CVC
                          </label>
                          <input
                            type="password"
                            required
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                            placeholder="•••"
                            className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm font-mono text-stone-900 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          id="save-card-chk"
                          type="checkbox"
                          checked={saveCard}
                          onChange={(e) => setSaveCard(e.target.checked)}
                          className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                        />
                        <label htmlFor="save-card-chk" className="text-xs text-stone-600 select-none">
                          Save card securely for faster checkout next time
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-full bg-stone-900 py-3.5 font-bold text-sm text-white shadow-md hover:bg-amber-700 transition cursor-pointer"
                      >
                        Pay ₹{finalTotal.toLocaleString("en-IN")} Securely →
                      </button>
                    </form>
                  </div>
                )}

                {/* 2. UPI / QR OPTION */}
                {paymentMethod === "upi" && (
                  <div className="space-y-6">
                    {/* UPI App Selection */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-2">
                        Select your UPI Application
                      </label>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                          { id: "gpay", name: "Google Pay", icon: "🌐" },
                          { id: "phonepe", name: "PhonePe", icon: "🟣" },
                          { id: "paytm", name: "Paytm", icon: "🔷" },
                          { id: "bhim", name: "BHIM UPI", icon: "🇮🇳" },
                        ].map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={() => setSelectedUpiApp(app.id)}
                            className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold transition cursor-pointer ${
                              selectedUpiApp === app.id
                                ? "border-amber-600 bg-amber-50 text-amber-900 font-bold"
                                : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                            }`}
                          >
                            <span>{app.icon}</span>
                            <span>{app.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* QR Code Scan Option */}
                    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-center sm:p-6">
                      <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-xl border-2 border-dashed border-stone-400 bg-white p-2 shadow-inner">
                        {/* Simulated QR Code Canvas SVG */}
                        <svg className="h-full w-full text-stone-900" viewBox="0 0 100 100" fill="currentColor">
                          <rect x="10" y="10" width="25" height="25" rx="3" fill="#1c1917" />
                          <rect x="15" y="15" width="15" height="15" fill="#fff" />
                          <rect x="18" y="18" width="9" height="9" fill="#1c1917" />

                          <rect x="65" y="10" width="25" height="25" rx="3" fill="#1c1917" />
                          <rect x="70" y="15" width="15" height="15" fill="#fff" />
                          <rect x="73" y="18" width="9" height="9" fill="#1c1917" />

                          <rect x="10" y="65" width="25" height="25" rx="3" fill="#1c1917" />
                          <rect x="15" y="70" width="15" height="15" fill="#fff" />
                          <rect x="18" y="73" width="9" height="9" fill="#1c1917" />

                          <rect x="42" y="15" width="6" height="12" fill="#d97706" />
                          <rect x="52" y="22" width="6" height="6" fill="#1c1917" />
                          <rect x="42" y="42" width="16" height="16" rx="2" fill="#d97706" />
                          <rect x="65" y="45" width="8" height="10" fill="#1c1917" />
                          <rect x="80" y="55" width="10" height="8" fill="#1c1917" />
                          <rect x="45" y="75" width="12" height="15" fill="#1c1917" />
                          <rect x="65" y="75" width="20" height="8" fill="#d97706" />
                        </svg>
                      </div>
                      <p className="mt-3 text-xs font-bold text-stone-800">
                        Scan to Pay with Any UPI App
                      </p>
                      <p className="text-[11px] text-stone-500">
                        Scan this QR code using Google Pay, PhonePe, Paytm or BHIM
                      </p>
                    </div>

                    {/* Or Enter UPI ID */}
                    <div className="relative flex items-center justify-center">
                      <div className="border-t border-stone-200 w-full" />
                      <span className="bg-white px-3 text-xs uppercase font-bold text-stone-400 absolute">
                        OR ENTER UPI ID
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => {
                          setUpiId(e.target.value);
                          setIsUpiVerified(false);
                        }}
                        placeholder="yourname@okhdfcbank"
                        className="flex-1 rounded-xl border border-stone-300 px-3.5 py-2.5 text-xs text-stone-900 focus:border-amber-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyUpi}
                        className={`rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                          isUpiVerified
                            ? "bg-emerald-600 text-white"
                            : "bg-stone-200 text-stone-800 hover:bg-stone-300"
                        }`}
                      >
                        {isUpiVerified ? "Verified ✓" : "Verify ID"}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleProcessPayment}
                      className="w-full rounded-full bg-stone-900 py-3.5 font-bold text-sm text-white shadow-md hover:bg-amber-700 transition cursor-pointer"
                    >
                      Authorize ₹{finalTotal.toLocaleString("en-IN")} via UPI →
                    </button>
                  </div>
                )}

                {/* 3. NET BANKING OPTION */}
                {paymentMethod === "netbanking" && (
                  <div className="space-y-5">
                    <label className="block text-xs font-semibold text-stone-700">
                      Popular Indian Banks
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {[
                        { id: "hdfc", name: "HDFC Bank", badge: "HDFC" },
                        { id: "sbi", name: "State Bank of India", badge: "SBI" },
                        { id: "icici", name: "ICICI Bank", badge: "ICICI" },
                        { id: "axis", name: "Axis Bank", badge: "AXIS" },
                        { id: "kotak", name: "Kotak Mahindra", badge: "KOTAK" },
                        { id: "pnb", name: "Punjab National", badge: "PNB" },
                      ].map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBank(bank.id)}
                          className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold transition cursor-pointer ${
                            selectedBank === bank.id
                              ? "border-amber-600 bg-amber-50 text-amber-900 font-bold"
                              : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                          }`}
                        >
                          <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold text-stone-800">
                            {bank.badge}
                          </span>
                          <span className="truncate">{bank.name}</span>
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        All Other Banks
                      </label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs text-stone-800 focus:border-amber-600 focus:outline-none"
                      >
                        <option value="bankofbaroda">Bank of Baroda</option>
                        <option value="canara">Canara Bank</option>
                        <option value="indusind">IndusInd Bank</option>
                        <option value="yesbank">Yes Bank</option>
                        <option value="idbi">IDBI Bank</option>
                        <option value="union">Union Bank of India</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleProcessPayment}
                      className="w-full rounded-full bg-stone-900 py-3.5 font-bold text-sm text-white shadow-md hover:bg-amber-700 transition cursor-pointer"
                    >
                      Proceed to Net Banking Portal →
                    </button>
                  </div>
                )}

                {/* 4. CASH ON DELIVERY (COD) OPTION */}
                {paymentMethod === "cod" && (
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-950">
                      <div className="flex items-center gap-2 font-bold text-sm mb-1">
                        <span>💵</span>
                        <span>Pay in Cash or UPI upon Doorstep Delivery</span>
                      </div>
                      <p className="text-amber-800 leading-relaxed">
                        You can pay with cash or ask the delivery partner for an on-spot QR code when your parcel arrives.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Enter Security Verification Code: <strong className="font-mono text-base text-stone-900 ml-1 px-2 py-0.5 rounded bg-stone-200">{codCaptcha}</strong>
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={codCaptchaInput}
                        onChange={(e) => setCodCaptchaInput(e.target.value)}
                        placeholder="Enter the 4-digit code above"
                        className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm font-mono text-stone-900 focus:border-amber-600 focus:outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleProcessPayment}
                      className="w-full rounded-full bg-stone-900 py-3.5 font-bold text-sm text-white shadow-md hover:bg-amber-700 transition cursor-pointer"
                    >
                      Confirm Cash on Delivery Order →
                    </button>
                  </div>
                )}

              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs text-stone-500 pt-2">
              <div className="rounded-xl border border-stone-200 bg-white p-3">
                <span className="text-lg block mb-1">🔒</span>
                <span className="font-semibold text-stone-800 block">Bank Grade Security</span>
                <span className="text-[10px]">End-to-end encrypted</span>
              </div>
              <div className="rounded-xl border border-stone-200 bg-white p-3">
                <span className="text-lg block mb-1">🔄</span>
                <span className="font-semibold text-stone-800 block">7 Days Return</span>
                <span className="text-[10px]">Instant refund guarantee</span>
              </div>
              <div className="rounded-xl border border-stone-200 bg-white p-3">
                <span className="text-lg block mb-1">🏷️</span>
                <span className="font-semibold text-stone-800 block">100% Genuine</span>
                <span className="text-[10px]">Handcrafted apparel</span>
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Order Summary & Coupon Code (5 cols)       */}
          {/* ======================================================== */}
          <div className="lg:col-span-5">
            <aside className="sticky top-20 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-3">
                Order Summary ({cart.length} {cart.length === 1 ? "item" : "items"})
              </h2>

              {/* Items Mini List */}
              <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto pr-1 my-3">
                {cart.map((item) => (
                  <div key={item.cartKey} className="flex items-center gap-3 py-3">
                    <div className="h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-stone-400">
                          TC
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate">{item.name}</p>
                      {item.selectedColorSize && (
                        <p className="text-[11px] text-stone-500 truncate">{item.selectedColorSize}</p>
                      )}
                      <p className="text-xs text-stone-600">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-stone-900">
                      ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Code Input */}
              <div className="border-t border-stone-200 pt-4">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code (e.g. THREAD10)"
                    className="flex-1 rounded-xl border border-stone-300 px-3 py-2 text-xs uppercase tracking-wider text-stone-900 placeholder:normal-case placeholder:tracking-normal focus:border-amber-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition cursor-pointer"
                  >
                    Apply
                  </button>
                </form>

                {couponMessage && (
                  <p
                    className={`mt-2 text-xs ${
                      couponMessage.type === "success" ? "text-emerald-700 font-medium" : "text-red-600"
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}

                {/* Quick Suggestion Pill */}
                {appliedDiscount === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCouponCode("THREAD10");
                      setAppliedDiscount(10);
                      setCouponMessage({ type: "success", text: "10% Discount applied! 🎉" });
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 transition cursor-pointer"
                  >
                    <span>🏷️ Tap to apply code <strong>THREAD10</strong> (10% OFF)</span>
                  </button>
                )}
              </div>

              {/* Cost Breakdown */}
              <div className="mt-4 space-y-2.5 border-t border-stone-200 pt-4 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Shipping & Handling</span>
                  <span className="font-bold text-emerald-700">FREE</span>
                </div>

                <div className="flex justify-between">
                  <span>Taxes (GST Included)</span>
                  <span className="font-semibold text-stone-900">Included</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount ({appliedDiscount}%)</span>
                    <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline text-base font-black text-stone-900">
                  <span>Total Payable</span>
                  <span className="text-xl text-amber-600">
                    ₹{finalTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="mt-5 text-center text-[11px] text-stone-400">
                <span>By placing an order, you agree to THREAD & CO. terms and return policies.</span>
              </div>
            </aside>
          </div>

        </div>
      </main>
    </div>
  );
}

export default PaymentPage;
