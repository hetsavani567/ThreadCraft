import { useState } from "react";

function EmployeePortal({
  isOpen,
  onClose,
  employee,
  products,
  onUpdateStock,
  onApplyStaffDiscount,
  staffDiscountActive,
}) {
  const [activeTab, setActiveTab] = useState("inventory"); // "inventory" | "orders" | "pos"
  const [stockSuccess, setStockSuccess] = useState("");

  // Simulated branch orders based on database sample_data.sql
  const [orders, setOrders] = useState([
    {
      order_id: 1,
      customer: "Rahul Mehta (Surat)",
      branch: "Surat Central",
      items: "Running T-Shirt (x2), Sports Cap (x1)",
      date: "2026-09-01",
      amount: 1997,
      status: "Completed",
      payment: "UPI - Paid",
    },
    {
      order_id: 2,
      customer: "Priya Shah (Surat)",
      branch: "Surat Central",
      items: "Running Shoes (x1)",
      date: "2026-09-05",
      amount: 3399,
      status: "Completed",
      payment: "Card + Cash - Paid",
    },
    {
      order_id: 3,
      customer: "Amit Patel (Ahmedabad)",
      branch: "Ahmedabad West",
      items: "Training Shorts (x3)",
      date: "2026-09-10",
      amount: 2595,
      status: "Completed",
      payment: "Cash - Paid",
    },
    {
      order_id: 4,
      customer: "Neha Verma (Mumbai)",
      branch: "Mumbai Andheri",
      items: "Hoodie Grey-L (x1), Navy-XL (x1)",
      date: "2026-09-15",
      amount: 3898,
      status: "Placed",
      payment: "UPI - Pending",
    },
    {
      order_id: 5,
      customer: "Rahul Mehta (Surat)",
      branch: "Ahmedabad West",
      items: "Running Shoes Black-8 (x1)",
      date: "2026-09-20",
      amount: 3499,
      status: "Cancelled",
      payment: "Refunded",
    },
  ]);

  if (!isOpen) return null;

  function handleQuickStock(productId, delta) {
    onUpdateStock(productId, delta);
    setStockSuccess(`Stock adjusted (${delta > 0 ? `+${delta}` : delta}) for product #${productId}`);
    setTimeout(() => setStockSuccess(""), 2500);
  }

  function handleOrderStatusChange(orderId, newStatus) {
    setOrders((prev) =>
      prev.map((ord) => (ord.order_id === orderId ? { ...ord, status: newStatus } : ord))
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-stone-200">
        {/* Header with Employee Badge */}
        <div className="bg-stone-900 p-6 text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30 font-bold text-xl">
              🏢
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">ThreadCraft Staff Portal</h3>
                <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-stone-950">
                  {employee?.emp_role || "Staff Member"}
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Staff: <strong className="text-white">{employee?.name}</strong> • Branch:{" "}
                <span className="text-amber-300 font-medium">
                  {employee?.branch_name || "Surat Central"} (Branch #{employee?.branch_id || 1})
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-stone-800 p-2 text-stone-400 hover:bg-stone-700 hover:text-white transition"
            aria-label="Close Staff Portal"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6">
          <button
            type="button"
            onClick={() => setActiveTab("inventory")}
            className={`border-b-2 px-4 py-3 text-sm font-bold transition flex items-center gap-2 ${
              activeTab === "inventory"
                ? "border-amber-700 text-stone-900 bg-white"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            📦 Inventory & Stock Controls
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`border-b-2 px-4 py-3 text-sm font-bold transition flex items-center gap-2 ${
              activeTab === "orders"
                ? "border-amber-700 text-stone-900 bg-white"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            📋 Branch Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pos")}
            className={`border-b-2 px-4 py-3 text-sm font-bold transition flex items-center gap-2 ${
              activeTab === "pos"
                ? "border-amber-700 text-stone-900 bg-white"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            🏷️ POS & Staff Discount
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {stockSuccess && (
            <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fadeIn">
              <span>✅</span>
              <span>{stockSuccess}</span>
            </div>
          )}

          {/* ================= TAB 1: INVENTORY & STOCK ================= */}
          {activeTab === "inventory" && (
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-stone-900">Live Inventory Adjustment</h4>
                  <p className="text-xs text-stone-500">
                    Restock items or adjust branch quantities directly from this terminal.
                  </p>
                </div>
                <span className="text-xs bg-stone-100 rounded-lg px-2.5 py-1 text-stone-600 font-medium border border-stone-200">
                  Total Catalog: {products.length} Products
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-stone-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-600 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3">Brand / Cat</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Total Stock</th>
                      <th className="p-3">Stock Status</th>
                      <th className="p-3 text-center">Quick Adjust</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 bg-white">
                    {products.map((product) => {
                      const stock = product.total_stock ?? 0;
                      return (
                        <tr key={product.id} className="hover:bg-stone-50/80 transition">
                          <td className="p-3 font-bold text-stone-900 flex items-center gap-2">
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-8 w-8 rounded-md object-cover"
                              />
                            )}
                            <div>
                              <p>{product.name}</p>
                              <span className="text-[10px] text-stone-400 font-normal">
                                ID: #{product.id}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-stone-600">
                            <span className="font-semibold text-stone-800">{product.brand}</span>
                            <span className="text-stone-400"> • </span>
                            {product.category}
                          </td>
                          <td className="p-3 font-semibold text-stone-900">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                          </td>
                          <td className="p-3 font-bold text-stone-800 text-sm">{stock} units</td>
                          <td className="p-3">
                            {stock <= 0 ? (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                                OUT OF STOCK
                              </span>
                            ) : stock <= 15 ? (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                ⚠️ REORDER LEVEL
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                OPTIMAL
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                disabled={stock <= 0}
                                onClick={() => handleQuickStock(product.id, -1)}
                                className="rounded bg-stone-100 px-2 py-1 font-bold text-stone-700 hover:bg-stone-200 disabled:opacity-30 transition"
                                title="Reduce stock by 1"
                              >
                                -1
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickStock(product.id, 5)}
                                className="rounded bg-stone-100 px-2 py-1 font-bold text-stone-700 hover:bg-stone-200 transition"
                                title="Add 5 units"
                              >
                                +5
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickStock(product.id, 20)}
                                className="rounded bg-amber-600 px-2.5 py-1 font-bold text-white hover:bg-amber-700 transition"
                                title="Bulk restock 20 units"
                              >
                                +20 Restock
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 2: BRANCH ORDERS ================= */}
          {activeTab === "orders" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900">Branch Orders Overview</h4>
                  <p className="text-xs text-stone-500">
                    Real-time orders for {employee?.branch_name || "Surat Central"}. Update fulfillment status.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {orders.map((ord) => (
                  <div
                    key={ord.order_id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-800">
                          ORDER #{ord.order_id}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            ord.status === "Completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : ord.status === "Placed"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {ord.status}
                        </span>
                        <span className="text-xs text-stone-400">• {ord.date}</span>
                      </div>
                      <p className="mt-1 font-bold text-stone-900 text-sm">{ord.customer}</p>
                      <p className="text-xs text-stone-600 mt-0.5">{ord.items}</p>
                      <p className="text-xs font-medium text-stone-500 mt-0.5">
                        Payment: <span className="text-stone-800">{ord.payment}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-xs text-stone-400 block font-medium">Total</span>
                        <span className="text-base font-black text-stone-900">
                          ₹{ord.amount.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <select
                        value={ord.status}
                        onChange={(e) => handleOrderStatusChange(ord.order_id, e.target.value)}
                        className="rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 outline-none focus:border-amber-700"
                      >
                        <option value="Placed">Placed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3: POS & STAFF DISCOUNT ================= */}
          {activeTab === "pos" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-amber-900 text-base">Employee Staff Discount (20%)</h4>
                    <p className="text-xs text-amber-800 mt-1">
                      As an authenticated employee of ThreadCraft, you can apply an exclusive 20% staff discount to your shopping cart or in-store purchases.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onApplyStaffDiscount(!staffDiscountActive)}
                    className={`shrink-0 rounded-full px-5 py-2 text-xs font-bold shadow-sm transition ${
                      staffDiscountActive
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-stone-900 text-white hover:bg-amber-700"
                    }`}
                  >
                    {staffDiscountActive ? "✓ 20% Discount Active" : "Apply 20% Discount"}
                  </button>
                </div>
              </div>

              {/* POS Cashier Quick Calculator */}
              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <h4 className="font-bold text-stone-900 mb-1">Cashier Fast POS Receipt</h4>
                <p className="text-xs text-stone-500 mb-4">
                  Quick in-store order verification with GST calculation.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl bg-stone-50 p-3 border border-stone-200">
                    <span className="text-stone-400 block font-medium">Assigned Branch</span>
                    <strong className="text-stone-800 text-sm">
                      {employee?.branch_name || "Surat Central"}
                    </strong>
                  </div>
                  <div className="rounded-xl bg-stone-50 p-3 border border-stone-200">
                    <span className="text-stone-400 block font-medium">Cashier ID</span>
                    <strong className="text-stone-800 text-sm font-mono">
                      EMP-#{employee?.emp_id || 101}
                    </strong>
                  </div>
                  <div className="rounded-xl bg-stone-50 p-3 border border-stone-200">
                    <span className="text-stone-400 block font-medium">Shift Status</span>
                    <strong className="text-emerald-700 text-sm">Active & Verified</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 bg-stone-50 p-4 px-6 flex items-center justify-between text-xs text-stone-500">
          <span>ThreadCraft Retail Management System • Employee Access</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-stone-900 px-5 py-2 font-semibold text-white hover:bg-amber-700 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmployeePortal;
