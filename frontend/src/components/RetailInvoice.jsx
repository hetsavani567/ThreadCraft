import { useRef } from "react";

function numberToWordsINR(num) {
  if (!num || isNaN(num) || num <= 0) return "Zero Rupees Only";
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = (n) => {
    if (n === 0) return "";
    if (n < 20) return a[n] + " ";
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "") + " ";
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + "Thousand " + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + "Lakh " + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + "Crore " + inWords(n % 10000000);
  };

  const integerPart = Math.floor(num);
  return `${inWords(integerPart).trim()} Rupees Only`;
}

function getHSNCode(name = "") {
  const lower = name.toLowerCase();
  if (lower.includes("shirt") || lower.includes("t-shirt") || lower.includes("polo")) return "610910";
  if (lower.includes("pant") || lower.includes("trouser") || lower.includes("short")) return "620342";
  if (lower.includes("shoe") || lower.includes("sneaker") || lower.includes("boot")) return "640411";
  if (lower.includes("hoodie") || lower.includes("jacket") || lower.includes("sweat")) return "611020";
  if (lower.includes("cap") || lower.includes("hat")) return "650500";
  return "610990";
}

function RetailInvoice({ order, onClose }) {
  const invoiceRef = useRef(null);

  if (!order) return null;

  const items = order.items || [];
  const rawOrderId = String(order.order_id || order.orderId || "1").replace(/^TC-/i, "");
  const formattedInvoiceNo = `TC-RET-2026-${rawOrderId.padStart(5, "0")}`;
  const totalAmount = Number(order.final_amount || order.amount) || 0;
  const discountAmount = Number(order.discount) || 0;
  const grossAmount = totalAmount + discountAmount;

  // Standard Indian apparel GST slab (5% inclusive)
  const taxableAmount = Math.round((totalAmount / 1.05) * 100) / 100;
  const totalGst = Math.round((totalAmount - taxableAmount) * 100) / 100;
  const cgst = Math.round((totalGst / 2) * 100) / 100;
  const sgst = Math.round((totalGst - cgst) * 100) / 100;

  const totalQty = items.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);

  const customerName =
    order.customer_name ||
    order.shipping?.fullName ||
    order.customer?.name ||
    "Retail Walk-in / Customer";

  const customerPhone =
    order.customer_mobile ||
    order.shipping?.mobile ||
    order.customer?.mobile_no ||
    "9876500001";

  const customerAddress = [
    order.house_no || order.shipping?.houseNo,
    order.street || order.shipping?.street,
    order.area || order.shipping?.area,
    order.city || order.shipping?.city || "Surat",
    order.state || order.shipping?.state || "Gujarat",
    order.pincode || order.shipping?.pincode || "395009",
  ]
    .filter(Boolean)
    .join(", ");

  const branchName = order.branch_name || "Surat Central Branch";
  const branchCity = order.branch_city || "Surat";
  const paymentMethod =
    order.payments?.[0]?.method ||
    order.paymentMethod ||
    "UPI / Digital";

  const orderDate = order.order_date || order.date || new Date().toISOString().split("T")[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 overflow-y-auto">
      {/* Top Floating Action Controls for Screen View */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="rounded-none border border-black bg-stone-900 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-black transition cursor-pointer"
        >
          Print Retail Bill (A4 / 80mm) 🖨️
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-none border border-black bg-white px-3.5 py-2 text-xs font-bold text-black hover:bg-stone-200 transition cursor-pointer"
        >
          Close ✕
        </button>
      </div>

      {/* RETAIL BILL CONTAINER - FORMAL LAYOUT, ZERO ROUNDED CORNERS */}
      <div
        id="retail-invoice-print-area"
        ref={invoiceRef}
        className="w-full max-w-2xl bg-white text-black border border-black p-6 sm:p-8 font-mono text-[11px] leading-tight shadow-2xl print:m-0 print:p-0 print:border-none print:shadow-none print:max-w-none"
      >
        {/* ========================================================= */}
        {/* 1. STORE HEADING                                          */}
        {/* ========================================================= */}
        <div className="text-center border-b-2 border-black pb-3">
          <h1 className="text-xl font-black tracking-widest uppercase font-sans">
            THREAD & CO.
          </h1>
          <p className="text-[12px] font-bold tracking-wide uppercase mt-0.5">
            ThreadCraft Apparel India Private Limited
          </p>
          <p className="text-[10px] mt-0.5 text-stone-700">
            Store: {branchName}, City Center Complex, Ring Road, {branchCity}, Gujarat - 395009
          </p>
          <p className="text-[10px] text-stone-700">
            CIN: U17100GJ2026PTC099881 • GSTIN: 24AAACT1234F1Z8
          </p>
          <p className="text-[10px] text-stone-700">
            Phone: +91 98765 00001 • Email: billing@threadcraft.in • Web: www.threadcraft.in
          </p>
        </div>

        {/* INVOICE TITLE STRIP */}
        <div className="text-center my-2 border-b border-black py-1">
          <span className="font-bold text-xs uppercase tracking-widest">
            TAX INVOICE / CASH MEMO
          </span>
        </div>

        {/* INVOICE REFERENCE HEADER BAR */}
        <div className="flex flex-wrap items-center justify-between border-b border-black py-1.5 text-[10.5px]">
          <div>
            <span className="text-stone-600">Invoice No:</span>{" "}
            <strong className="font-bold">{formattedInvoiceNo}</strong>
          </div>
          <div>
            <span className="text-stone-600">Date:</span>{" "}
            <span>{orderDate} 12:45 PM</span>
          </div>
          <div>
            <span className="text-stone-600">Order ID:</span>{" "}
            <strong className="font-bold">#TC-{rawOrderId.padStart(4, "0")}</strong>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. CUSTOMER INFO (LEFT SECTION REMOVED, CLEAN FULL-WIDTH) */}
        {/* ========================================================= */}
        <div className="border-b-2 border-black py-2.5 text-[10.5px] space-y-1">
          <div className="flex flex-wrap items-center justify-between">
            <div>
              <span className="text-stone-600">Customer Name:</span>{" "}
              <strong className="font-bold">{customerName}</strong>
            </div>
            <div>
              <span className="text-stone-600">Mobile No:</span>{" "}
              <span className="font-medium">{customerPhone}</span>
            </div>
          </div>

          <div>
            <span className="text-stone-600">Billing & Shipping Address:</span>{" "}
            <span>{customerAddress || "Store Counter Sale / Walk-in Customer"}</span>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[10px] text-stone-700 pt-0.5">
            <div>
              <span className="text-stone-600">Place of Supply:</span> Gujarat (State Code: 24)
            </div>
            <div>
              <span className="text-stone-600">Payment Mode:</span>{" "}
              <strong className="font-bold uppercase text-black">{paymentMethod}</strong>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. DESCRIPTION OF GOODS TABLE                             */}
        {/* ========================================================= */}
        <div className="pt-2">
          <div className="font-bold uppercase text-[10px] tracking-wider mb-1">
            Description of Goods:
          </div>

          <table className="w-full text-left border-collapse border-b-2 border-black text-[10.5px]">
            <thead>
              <tr className="border-y border-black font-bold uppercase text-[10px]">
                <th className="py-1 px-1 w-6">#</th>
                <th className="py-1 px-1">Item Description</th>
                <th className="py-1 px-1 text-center w-16">HSN</th>
                <th className="py-1 px-1 text-center w-10">Qty</th>
                <th className="py-1 px-1 text-right w-16">Rate (₹)</th>
                <th className="py-1 px-1 text-right w-14">Disc (₹)</th>
                <th className="py-1 px-1 text-right w-16">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const unitPrice = Number(item.unit_price || item.price) || 0;
                const quantity = Number(item.quantity) || 1;
                const subtotal = Number(item.subtotal || unitPrice * quantity);
                const hsn = getHSNCode(item.product_name || item.name);
                const variantDesc = item.color_size || item.selectedColorSize || "";

                return (
                  <tr key={idx} className="border-b border-stone-300">
                    <td className="py-1 px-1 align-top">{idx + 1}</td>
                    <td className="py-1 px-1 align-top">
                      <div className="font-bold">{item.product_name || item.name}</div>
                      {variantDesc && (
                        <div className="text-[9.5px] text-stone-600">
                          Variant: {variantDesc}
                        </div>
                      )}
                    </td>
                    <td className="py-1 px-1 text-center align-top">{hsn}</td>
                    <td className="py-1 px-1 text-center align-top font-bold">{quantity}</td>
                    <td className="py-1 px-1 text-right align-top">{unitPrice.toFixed(2)}</td>
                    <td className="py-1 px-1 text-right align-top">0.00</td>
                    <td className="py-1 px-1 text-right align-top font-bold">{subtotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ========================================================= */}
        {/* IN SEQUENCE: SHOPPINGS -> GST TAX -> NET PAYMENT          */}
        {/* ========================================================= */}
        <div className="mt-2 space-y-2">
          {/* A. SHOPPINGS / SUBTOTAL & CHARGES */}
          <div className="border-b border-black pb-2 text-[10.5px]">
            <div className="flex justify-between items-center text-[10px] text-stone-600 mb-1">
              <span>Shopping Summary:</span>
              <span>Total Items: <strong>{items.length}</strong> | Total Units: <strong>{totalQty}</strong></span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-700">Gross Items Subtotal:</span>
                <span className="font-mono">₹ {grossAmount.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-stone-800">
                  <span className="text-stone-700">Promotional Discount:</span>
                  <span className="font-mono">- ₹ {discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-stone-700">Delivery / Shipping Charges:</span>
                <span className="font-bold">FREE (₹ 0.00)</span>
              </div>
            </div>
          </div>

          {/* B. GST TAX BREAKDOWN IN SEQUENCE */}
          <div className="border-b border-black pb-2 text-[10.5px]">
            <div className="font-bold uppercase text-[10px] text-stone-700 mb-1">
              GST Tax Breakdown (5% Inclusive):
            </div>

            <table className="w-full text-[9.5px] border border-black mb-1.5">
              <thead>
                <tr className="bg-stone-100 border-b border-black font-bold">
                  <th className="p-1 text-left">Tax Category</th>
                  <th className="p-1 text-right">Taxable Value (₹)</th>
                  <th className="p-1 text-center">Rate</th>
                  <th className="p-1 text-right">Tax Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-stone-300">
                  <td className="p-1">CGST (Central GST)</td>
                  <td className="p-1 text-right">{taxableAmount.toFixed(2)}</td>
                  <td className="p-1 text-center">2.5%</td>
                  <td className="p-1 text-right">{cgst.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-1">SGST (State GST)</td>
                  <td className="p-1 text-right">{taxableAmount.toFixed(2)}</td>
                  <td className="p-1 text-center">2.5%</td>
                  <td className="p-1 text-right">{sgst.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between text-[10px] text-stone-700">
              <span>Total Taxable Base: <strong>₹ {taxableAmount.toFixed(2)}</strong></span>
              <span>Total Tax: <strong>₹ {totalGst.toFixed(2)}</strong></span>
            </div>
          </div>

          {/* C. NET PAYMENT IN SEQUENCE */}
          <div className="border-b-2 border-black pb-2 space-y-1.5 text-[10.5px]">
            <div className="flex justify-between items-center border-2 border-black p-2 font-bold bg-stone-50">
              <span className="text-xs uppercase tracking-wider">NET AMOUNT PAYABLE:</span>
              <span className="font-mono text-base font-black">₹ {totalAmount.toFixed(2)}</span>
            </div>

            <div className="text-[10px]">
              <span className="font-bold uppercase text-stone-700">Amount in Words:</span>{" "}
              <span className="italic font-medium">{numberToWordsINR(totalAmount)}</span>
            </div>

            <div className="flex flex-wrap justify-between items-center text-[10px] pt-0.5 border-t border-stone-300">
              <div>
                <span>Payment Status: </span>
                <strong className="font-bold text-black uppercase">PAID / VERIFIED</strong>
              </div>
              <div>
                <span>Txn Reference: </span>
                <strong className="font-mono">TXN-TC-{rawOrderId.padStart(6, "0")}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. BARCODE (COMPACT / REDUCED WIDTH) & RETAIL FOOTER      */}
        {/* ========================================================= */}
        <div className="pt-2 space-y-2 text-[9.5px] text-stone-700">
          {/* Reduced Width Compact Barcode */}
          <div className="flex flex-col items-center justify-center py-1">
            <div className="font-mono text-sm tracking-tight inline-block select-none scale-y-110 w-36 text-center overflow-hidden whitespace-nowrap text-black font-bold">
              |||| | || |||| | ||| || |||
            </div>
            <div className="font-mono text-[8.5px] tracking-wider text-black mt-0.5">
              *TC{rawOrderId.padStart(5, "0")}*
            </div>
          </div>

          {/* Standard retail exchange & return policy */}
          <div className="border-t border-dotted border-black pt-1.5 leading-snug">
            <p className="font-bold uppercase text-[9px] text-black">
              Standard Store Terms & Exchange Policy:
            </p>
            <ol className="list-decimal pl-3 space-y-0.5 text-[8.5px]">
              <li>Apparel exchange permitted within 14 calendar days from date of purchase with original invoice and attached price tags intact.</li>
              <li>Discounted/Sale items, innerwear, and tailored garments are strictly not eligible for return/refund.</li>
              <li>No cash refunds. Store credit note or replacement voucher will be issued.</li>
              <li>Disputes are subject to Surat / Ahmedabad jurisdiction.</li>
            </ol>
          </div>

          <div className="text-center pt-1.5 font-bold uppercase text-[10px] text-black border-t border-black">
            *** Thank You for Shopping with THREAD & CO. Visit Again! ***
          </div>
        </div>
      </div>
    </div>
  );
}

export default RetailInvoice;
