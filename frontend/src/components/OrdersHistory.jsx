import { useState, useEffect, useMemo } from "react";
import { fetchOrders, updateOrderStatus } from "../services/api";
import RetailInvoice from "./RetailInvoice.jsx";

const STATUS_STEPS = [
  { key: "Placed", label: "Order Placed", desc: "Order confirmed & payment verified" },
  { key: "Packed", label: "Packed & Inspected", desc: "Garments tailored, inspected & packed" },
  { key: "Shipped", label: "In Transit", desc: "Handed to ThreadCraft Express courier" },
  { key: "Delivered", label: "Delivered", desc: "Package delivered with signature verification" },
];

function getStatusStepIndex(status) {
  const norm = (status || "").toLowerCase();
  if (norm === "placed") return 0;
  if (norm === "packed") return 1;
  if (norm === "shipped") return 2;
  if (norm === "delivered" || norm === "completed") return 3;
  if (norm === "cancelled") return -1;
  return 0;
}

function OrdersHistory({
  currentUser,
  onNavigateToStore,
  initialSelectedOrderId = null,
  onOpenProductDetail = null,
}) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(initialSelectedOrderId);
  const [filterStatus, setFilterStatus] = useState("All"); // "All" | "Active" | "Delivered" | "Cancelled"
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Load orders from MySQL backend and merge with localStorage fallback
  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);

    let backendOrders = [];
    try {
      const params = {};
      if (currentUser?.cust_id) {
        params.cust_id = currentUser.cust_id;
      } else if (currentUser?.email && !currentUser.email.includes("@thread.com")) {
        params.email = currentUser.email;
      }
      const data = await fetchOrders(params);
      if (Array.isArray(data)) {
        backendOrders = data;
      }
    } catch (err) {
      console.warn("Backend orders fetch error, falling back to local records:", err);
      setError("Note: Operating with local sync while connecting to database.");
    }

    // Merge with any client-placed local orders stored in localStorage
    try {
      const localSaved = localStorage.getItem("threadcraft_orders");
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed)) {
          // Normalize local orders to match schema
          const mappedLocal = parsed.map((lo, idx) => ({
            order_id: lo.order_id || lo.orderId || `LOCAL-${idx + 1}`,
            cust_id: lo.cust_id || currentUser?.cust_id || 1,
            customer_name: lo.customer_name || lo.shipping?.fullName || currentUser?.name || "Customer",
            customer_email: lo.customer_email || lo.shipping?.email || currentUser?.email || "customer@demo.com",
            customer_mobile: lo.customer_mobile || lo.shipping?.mobile || "9876543210",
            house_no: lo.house_no || lo.shipping?.houseNo || "",
            street: lo.street || lo.shipping?.street || "",
            area: lo.area || lo.shipping?.area || "",
            city: lo.city || lo.shipping?.city || "Ahmedabad",
            state: lo.state || lo.shipping?.state || "Gujarat",
            pincode: lo.pincode || lo.shipping?.pincode || "380001",
            branch_id: lo.branch_id || 1,
            branch_name: lo.branch_name || "Surat Central Hub",
            branch_city: lo.branch_city || "Surat",
            order_date: lo.order_date || lo.date || new Date().toISOString().split("T")[0],
            order_status: lo.order_status || "Placed",
            discount: Number(lo.discount) || 0,
            final_amount: Number(lo.final_amount || lo.amount) || 0,
            items: (lo.items || []).map((it) => ({
              variant_id: it.variant_id || it.cartKey || 1,
              product_id: it.id || it.product_id,
              product_name: it.name || it.product_name,
              color_size: it.selectedColorSize || it.color_size || "Standard",
              image: it.image || it.Image_URL || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80",
              quantity: it.quantity || 1,
              unit_price: Number(it.price) || Number(it.unit_price) || 0,
              subtotal: (Number(it.price) || Number(it.unit_price) || 0) * (it.quantity || 1),
            })),
            payments: lo.payments || [
              {
                payment_id: 1,
                amount: Number(lo.final_amount || lo.amount) || 0,
                method: lo.paymentMethod || "Card",
                payment_status: "Paid",
                payment_datetime: new Date().toISOString(),
              },
            ],
          }));

          // Deduplicate by order_id
          const existingIds = new Set(backendOrders.map((o) => String(o.order_id)));
          const additional = mappedLocal.filter((o) => !existingIds.has(String(o.order_id)));
          backendOrders = [...additional, ...backendOrders];
        }
      }
    } catch (e) {
      console.warn("Could not parse local orders:", e);
    }

    setOrders(backendOrders);
    setIsLoading(false);

    // Auto-select initial order or latest order
    if (backendOrders.length > 0) {
      if (initialSelectedOrderId) {
        const found = backendOrders.find(
          (o) => String(o.order_id) === String(initialSelectedOrderId)
        );
        setSelectedOrderId(found ? found.order_id : backendOrders[0].order_id);
      } else if (!selectedOrderId) {
        setSelectedOrderId(backendOrders[0].order_id);
      }
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentUser]);

  // Selected Order object
  const selectedOrder = useMemo(() => {
    return orders.find((o) => String(o.order_id) === String(selectedOrderId)) || orders[0] || null;
  }, [orders, selectedOrderId]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = (order.order_status || "").toLowerCase();
      // Status category filter
      if (filterStatus === "Active") {
        if (status === "delivered" || status === "completed" || status === "cancelled") {
          return false;
        }
      } else if (filterStatus === "Delivered") {
        if (status !== "delivered" && status !== "completed") return false;
      } else if (filterStatus === "Cancelled") {
        if (status !== "cancelled") return false;
      }

      // Search query filter (Order ID, product name, branch)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesId = String(order.order_id).toLowerCase().includes(query) ||
                          `tc-${order.order_id}`.toLowerCase().includes(query);
        const matchesBranch = (order.branch_name || "").toLowerCase().includes(query) ||
                              (order.branch_city || "").toLowerCase().includes(query);
        const matchesProduct = (order.items || []).some((item) =>
          (item.product_name || "").toLowerCase().includes(query)
        );
        return matchesId || matchesBranch || matchesProduct;
      }

      return true;
    });
  }, [orders, filterStatus, searchQuery]);

  // Advance / Simulate order tracking step (Placed -> Packed -> Shipped -> Delivered)
  const handleAdvanceTracking = async () => {
    if (!selectedOrder || isUpdatingStatus) return;

    const currentStepIndex = getStatusStepIndex(selectedOrder.order_status);
    if (currentStepIndex >= 3) return; // already delivered

    const nextStatus = STATUS_STEPS[currentStepIndex + 1].key;
    setIsUpdatingStatus(true);

    try {
      // If it's a numeric backend order, send PATCH to API
      if (!isNaN(Number(selectedOrder.order_id))) {
        await updateOrderStatus(selectedOrder.order_id, nextStatus);
      }

      // Update state locally
      setOrders((prev) =>
        prev.map((o) =>
          String(o.order_id) === String(selectedOrder.order_id)
            ? { ...o, order_status: nextStatus }
            : o
        )
      );

      // Also sync to localStorage
      try {
        const localSaved = localStorage.getItem("threadcraft_orders");
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          const updated = parsed.map((o) =>
            String(o.order_id || o.orderId) === String(selectedOrder.order_id)
              ? { ...o, order_status: nextStatus }
              : o
          );
          localStorage.setItem("threadcraft_orders", JSON.stringify(updated));
        }
      } catch (e) {
        console.warn("Could not sync tracking to localStorage:", e);
      }
    } catch (err) {
      console.error("Failed to advance order status:", err);
      // Still update UI for delightful interaction
      setOrders((prev) =>
        prev.map((o) =>
          String(o.order_id) === String(selectedOrder.order_id)
            ? { ...o, order_status: nextStatus }
            : o
        )
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Status badge styling
  const renderStatusBadge = (status) => {
    const norm = (status || "").toLowerCase();
    if (norm === "placed") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          Order Placed
        </span>
      );
    }
    if (norm === "packed") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Packed & Ready
        </span>
      );
    }
    if (norm === "shipped") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-700 border border-sky-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-ping" />
          🚚 Out for Delivery
        </span>
      );
    }
    if (norm === "delivered" || norm === "completed") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-500/20">
          <svg className="h-3.5 w-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Delivered
        </span>
      );
    }
    if (norm === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-500/20">
          ✕ Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
        {status}
      </span>
    );
  };

  const currentStep = selectedOrder ? getStatusStepIndex(selectedOrder.order_status) : 0;
  const isCancelled = (selectedOrder?.order_status || "").toLowerCase() === "cancelled";

  return (
    <div className="min-h-screen bg-stone-50/70 text-stone-900 pb-20">
      {/* Top Header / Breadcrumb */}
      <div className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateToStore}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span>Back to Shop</span>
            </button>
            <div className="h-4 w-px bg-stone-300" />
            <h1 className="text-lg font-black tracking-tight text-stone-900 sm:text-xl">
              My Orders & Delivery Tracking
            </h1>
            <span className="hidden rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900 sm:inline-flex">
              {orders.length} {orders.length === 1 ? "Order" : "Orders"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadOrders}
              disabled={isLoading}
              title="Refresh order records"
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:border-stone-900 hover:bg-stone-50 transition cursor-pointer"
            >
              <svg className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        {/* Notice Banner if offline or synced */}
        {error && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">⚡</span>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={loadOrders}
              className="font-bold underline hover:text-amber-950 cursor-pointer"
            >
              Retry Database
            </button>
          </div>
        )}

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Filters & Orders List (5 Cols)               */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-4">
            {/* Search and Tabs */}
            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Order #, product, or branch..."
                  className="w-full rounded-xl border border-stone-300 bg-stone-50/80 pl-9 pr-3.5 py-2 text-xs text-stone-900 placeholder-stone-400 focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
                <svg className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-xs font-bold text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 border-t border-stone-100 pt-3">
                {["All", "Active", "Delivered", "Cancelled"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setFilterStatus(tab)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      filterStatus === tab
                        ? "bg-stone-900 text-white shadow-xs"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Cards List */}
            {isLoading ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-amber-600" />
                <p className="mt-3 text-xs font-medium text-stone-500">Retrieving orders from retail database...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
                <span className="text-3xl">🛍️</span>
                <h3 className="mt-2 text-sm font-bold text-stone-900">No orders found</h3>
                <p className="mt-1 text-xs text-stone-500">
                  {searchQuery || filterStatus !== "All"
                    ? "Try adjusting your search query or filter tab."
                    : "You haven't placed any orders yet."}
                </p>
                <button
                  type="button"
                  onClick={onNavigateToStore}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 transition cursor-pointer"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
                {filteredOrders.map((order) => {
                  const isSelected = String(order.order_id) === String(selectedOrder?.order_id);
                  const itemCount = (order.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);

                  return (
                    <div
                      key={order.order_id}
                      onClick={() => setSelectedOrderId(order.order_id)}
                      className={`relative cursor-pointer rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-50/20 shadow-md ring-1 ring-amber-500/40"
                          : "border-stone-200 bg-white hover:border-stone-400 hover:shadow-xs"
                      }`}
                    >
                      {/* Card Top: Order ID & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black tracking-tight text-stone-900">
                              #TC-{String(order.order_id).padStart(4, "0")}
                            </span>
                            <span className="text-[11px] text-stone-400">•</span>
                            <span className="text-[11px] font-medium text-stone-500">
                              {order.order_date}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-stone-500">
                            Fulfillment: <strong className="font-semibold text-stone-700">{order.branch_name || "ThreadCraft Hub"}</strong>
                          </p>
                        </div>

                        <div>{renderStatusBadge(order.order_status)}</div>
                      </div>

                      {/* Card Middle: Garment thumbnails preview */}
                      <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2 overflow-hidden">
                            {(order.items || []).slice(0, 3).map((item, i) => (
                              <img
                                key={i}
                                src={item.image}
                                alt={item.product_name}
                                className="inline-block h-8 w-8 rounded-lg border-2 border-white object-cover bg-stone-100 shadow-2xs"
                                onError={(e) => {
                                  e.target.src = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=150&q=80";
                                }}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-medium text-stone-600">
                            {itemCount} {itemCount === 1 ? "garment" : "garments"}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-stone-400 block">Total</span>
                          <span className="text-sm font-black text-amber-700">
                            ₹{Number(order.final_amount).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      {/* Selected Indicator Arrow */}
                      {isSelected && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden lg:block">
                          <span className="text-amber-600 font-bold">›</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Interactive Delivery Tracker & Order Detail */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-6">
            {selectedOrder ? (
              <>
                {/* 1. INTERACTIVE DELIVERY TRACKER CARD */}
                <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                  {/* Card Header */}
                  <div className="border-b border-stone-100 bg-gradient-to-r from-stone-900 to-stone-800 p-5 text-white sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-amber-500/20 px-2 py-0.5 font-mono text-[11px] font-bold tracking-wide text-amber-300 uppercase">
                            Tracking ID: TC-EXP-{String(selectedOrder.order_id).padStart(5, "0")}
                          </span>
                        </div>
                        <h2 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">
                          Order #TC-{String(selectedOrder.order_id).padStart(4, "0")}
                        </h2>
                        <p className="mt-0.5 text-xs text-stone-300">
                          Placed on {selectedOrder.order_date} • Expected delivery within 2-3 business days
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        {renderStatusBadge(selectedOrder.order_status)}
                        <span className="text-xs text-stone-300 font-medium">
                          Dispatch: {selectedOrder.branch_name || "Main Hub"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stepper Timeline Body */}
                  <div className="p-6 sm:p-8">
                    {isCancelled ? (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-5 text-center">
                        <span className="text-3xl">🛑</span>
                        <h4 className="mt-2 text-sm font-bold text-rose-900">Order Was Cancelled</h4>
                        <p className="mt-1 text-xs text-rose-700 max-w-md mx-auto">
                          This order was marked as cancelled. Any processed payment will be credited back according to your bank's 3-5 day refund policy.
                        </p>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-6">
                          Live Shipment Journey
                        </h3>

                        {/* Responsive Stepper */}
                        <div className="relative">
                          {/* Desktop horizontal timeline / Mobile vertical timeline */}
                          <div className="grid grid-cols-1 gap-6 sm:grid-cols-4 sm:gap-2">
                            {STATUS_STEPS.map((step, idx) => {
                              const isPast = idx < currentStep;
                              const isCurrent = idx === currentStep;
                              const isUpcoming = idx > currentStep;

                              return (
                                <div key={step.key} className="relative flex items-start gap-3.5 sm:flex-col sm:items-center sm:text-center">
                                  {/* Step Icon / Circle */}
                                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all">
                                    {isPast ? (
                                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                      </div>
                                    ) : isCurrent ? (
                                      <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-amber-600 text-white shadow-md shadow-amber-600/30">
                                        <span className="absolute -inset-1 animate-ping rounded-full bg-amber-500/30" />
                                        <span className="font-bold text-xs">{idx + 1}</span>
                                      </div>
                                    ) : (
                                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-stone-200 bg-stone-50 text-stone-400 font-bold text-xs">
                                        {idx + 1}
                                      </div>
                                    )}
                                  </div>

                                  {/* Step Labels */}
                                  <div className="pt-0.5 sm:pt-2">
                                    <p className={`text-xs font-bold ${
                                      isCurrent ? "text-amber-700" : isPast ? "text-stone-900" : "text-stone-400"
                                    }`}>
                                      {step.label}
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-stone-500 max-w-[130px] sm:mx-auto">
                                      {step.desc}
                                    </p>
                                    {isCurrent && (
                                      <span className="mt-1 inline-block rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-extrabold uppercase text-amber-900 animate-pulse">
                                        Current Stage
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Interactive Simulation Controls */}
                        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-stone-50 border border-stone-200 p-4">
                          <div className="text-xs text-stone-600">
                            <span className="font-bold text-stone-900">Interactive Simulation:</span>
                            <span className="ml-1 text-stone-500">
                              Advance the order status in MySQL to test the live tracker.
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={handleAdvanceTracking}
                            disabled={isUpdatingStatus || currentStep >= 3}
                            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer ${
                              currentStep >= 3
                                ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                                : "bg-stone-900 text-white hover:bg-amber-700 hover:shadow-md"
                            }`}
                          >
                            {isUpdatingStatus ? (
                              <>
                                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span>Updating...</span>
                              </>
                            ) : currentStep >= 3 ? (
                              <span>✓ Order Delivered</span>
                            ) : (
                              <>
                                <span>Advance Status to &ldquo;{STATUS_STEPS[currentStep + 1]?.key}&rdquo;</span>
                                <span>➔</span>
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 2. ITEMIZED ORDER ITEMS BREAKDOWN */}
                <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-sm">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                      Garments in this Package
                    </h3>
                    <span className="text-xs font-medium text-stone-500">
                      {(selectedOrder.items || []).length} unique {(selectedOrder.items || []).length === 1 ? "style" : "styles"}
                    </span>
                  </div>

                  <div className="divide-y divide-stone-100 mt-2">
                    {(selectedOrder.items || []).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-3.5 gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.product_name}
                            className="h-14 w-14 shrink-0 rounded-xl object-cover bg-stone-100 border border-stone-200 shadow-2xs"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80";
                            }}
                          />
                          <div>
                            <p className="font-bold text-sm text-stone-900 line-clamp-1">
                              {item.product_name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="rounded bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-700">
                                Variant: {item.color_size || "Standard"}
                              </span>
                              <span className="text-xs text-stone-500 font-medium">
                                Qty: {item.quantity}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-stone-400">
                            ₹{Number(item.unit_price).toLocaleString("en-IN")} each
                          </p>
                          <p className="text-sm font-black text-stone-900">
                            ₹{Number(item.subtotal || item.unit_price * item.quantity).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Price Calculations Summary */}
                  <div className="mt-6 border-t border-stone-100 pt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>Items Subtotal</span>
                      <span className="font-semibold text-stone-800">
                        ₹{(
                          Number(selectedOrder.final_amount) + Number(selectedOrder.discount || 0)
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>

                    {Number(selectedOrder.discount) > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Promotional Discount</span>
                        <span>-₹{Number(selectedOrder.discount).toLocaleString("en-IN")}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-stone-600">
                      <span>Express Shipping (ThreadCraft Priority)</span>
                      <span className="font-semibold text-emerald-700">FREE</span>
                    </div>

                    <div className="flex justify-between text-stone-500 text-[11px]">
                      <span>GST / Taxes</span>
                      <span>Included (Applicable Slab)</span>
                    </div>

                    <div className="flex justify-between border-t border-stone-200 pt-3 text-sm font-black text-stone-900">
                      <span>Total Amount Paid</span>
                      <span className="text-base text-amber-700">
                        ₹{Number(selectedOrder.final_amount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. SHIPPING & PAYMENT METADATA GRID */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Delivery Address */}
                  <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">📍</span>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                        Shipping Address
                      </h4>
                    </div>
                    <p className="text-sm font-bold text-stone-900">{selectedOrder.customer_name}</p>
                    <p className="text-xs text-stone-600 mt-0.5">{selectedOrder.customer_mobile}</p>
                    <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                      {[
                        selectedOrder.house_no,
                        selectedOrder.street,
                        selectedOrder.area,
                        selectedOrder.city,
                        selectedOrder.state,
                        selectedOrder.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ") || "Address recorded on file."}
                    </p>
                  </div>

                  {/* Payment Details & Invoice Action */}
                  <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base">💳</span>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                          Payment Details
                        </h4>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <p className="text-stone-600">
                          Mode: <strong className="font-semibold text-stone-900">
                            {selectedOrder.payments?.[0]?.method || "UPI / Card"}
                          </strong>
                        </p>
                        <p className="text-stone-600">
                          Status: <span className="inline-block rounded bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-800">
                            {selectedOrder.payments?.[0]?.payment_status || "Paid"}
                          </span>
                        </p>
                        <p className="text-stone-500 text-[11px]">
                          Processed via ThreadCraft Secured Gateway
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-100 mt-4">
                      <button
                        type="button"
                        onClick={() => setShowInvoiceModal(true)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-stone-50 py-2.5 text-xs font-bold text-stone-800 hover:bg-stone-100 hover:border-stone-400 transition cursor-pointer"
                      >
                        <svg className="h-4 w-4 text-stone-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <span>Download Tax Invoice</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-16 text-center">
                <span className="text-4xl">📦</span>
                <h3 className="mt-3 text-base font-bold text-stone-900">Select an Order</h3>
                <p className="mt-1 text-xs text-stone-500">
                  Choose any order from the left list to review delivery milestones, items, and tax invoices.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* 4. AUTHENTIC RETAIL BILL / TAX INVOICE MODAL                  */}
      {/* ============================================================= */}
      {showInvoiceModal && selectedOrder && (
        <RetailInvoice
          order={selectedOrder}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </div>
  );
}

export default OrdersHistory;
