import { useEffect, useState } from "react";
import { fetchProductById, fetchProducts, submitProductReview, deleteProductReview } from "../services/api";
import ProductCard from "./ProductCard.jsx";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";
import { getProductDiscount } from "../utils/discount.js";

function ProductDetail({
  productId,
  currentUser,
  cartCount = 0,
  onNavigateBack,
  onNavigateHome,
  onNavigateCategory,
  onNavigateBrand,
  onSelectProduct,
  onAddToCart,
  onNavigateToAuth,
  onNavigateToOrders,
  onLogout,
}) {
  const isEmployee = currentUser?.role === "employee";
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [productId, product?.image]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [addSuccessNotice, setAddSuccessNotice] = useState(false);

  // Review Form & Moderation States
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewName, setReviewName] = useState(currentUser?.name || "");
  const [reviewComments, setReviewComments] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [reviewDeleteNotice, setReviewDeleteNotice] = useState(null);

  useEffect(() => {
    if (currentUser?.name && !reviewName) {
      setReviewName(currentUser.name);
    }
  }, [currentUser, reviewName]);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });

    fetchProductById(productId)
      .then((data) => {
        setProduct(data);
        if (data?.variants?.length > 0) {
          setSelectedVariantId(data.variants[0].variant_id);
        }
        setError(null);

        // Fetch related products for comparison by category or brand
        if (data?.category || data?.brand) {
          setLoadingRelated(true);
          const filter = data.category ? { category: data.category } : { brand: data.brand };
          fetchProducts(filter)
            .then((list) => {
              if (Array.isArray(list)) {
                // Filter out current product and keep up to 4-8 items
                const others = list.filter((p) => String(p.id) !== String(data.id));
                setRelatedProducts(others);
              }
            })
            .catch((err) => console.warn("Failed to load related products:", err))
            .finally(() => setLoadingRelated(false));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [productId]);

  function handleAddToCartClick() {
    if (!currentUser) {
      if (onNavigateToAuth) {
        onNavigateToAuth();
      } else {
        window.location.hash = "#auth";
      }
      return;
    }
    if (!product || isOutOfStock) return;
    const currentVariant = variants.find((v) => v.variant_id === selectedVariantId) || variants[0];
    const priceToUse = currentVariant?.selling_price || product.price || 0;

    if (onAddToCart) {
      onAddToCart(
        {
          ...product,
          price: priceToUse,
          selectedVariant: currentVariant || null,
          selectedColorSize: currentVariant?.color_size || null,
        },
        quantity
      );
      setAddSuccessNotice(true);
      setTimeout(() => setAddSuccessNotice(false), 2500);
    }
  }

  function handleBuyNowClick() {
    if (!currentUser) {
      if (onNavigateToAuth) {
        onNavigateToAuth();
      } else {
        window.location.hash = "#auth";
      }
      return;
    }
    handleAddToCartClick();
    window.location.hash = "#payment";
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!product || !reviewComments.trim()) return;

    setSubmittingReview(true);
    setReviewSubmitError(null);

    try {
      const res = await submitProductReview(product.id, {
        rating: reviewRating,
        comments: reviewComments.trim(),
        customer_name: reviewName.trim() || currentUser?.name || "Customer",
        cust_id: currentUser?.cust_id || currentUser?.id || null,
      });

      if (res?.product) {
        setProduct(res.product);
      } else {
        const newRev = {
          review_id: Date.now(),
          customer_name: reviewName.trim() || currentUser?.name || "Customer",
          rating: reviewRating,
          comments: reviewComments.trim(),
          review_date: new Date().toISOString().split("T")[0],
        };
        setProduct((prev) => ({
          ...prev,
          rating: (
            (Number(prev.rating || 5) * ((prev.reviews?.length) || 1) + reviewRating) /
            (((prev.reviews?.length) || 1) + 1)
          ).toFixed(1),
          review_count: ((prev.review_count) || 0) + 1,
          reviews: [newRev, ...(prev.reviews || [])],
        }));
      }

      setReviewComments("");
      setReviewSubmitSuccess(true);
      setTimeout(() => setReviewSubmitSuccess(false), 5000);
    } catch (err) {
      console.error("Failed to submit review:", err);
      setReviewSubmitError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  }

  async function handleDeleteReview(reviewId) {
    if (!reviewId || !product) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this customer review? This staff action cannot be undone."
    );
    if (!confirmDelete) return;

    setDeletingReviewId(reviewId);
    try {
      const res = await deleteProductReview(product.id, reviewId);
      if (res?.product) {
        setProduct(res.product);
      } else {
        setProduct((prev) => {
          const updatedReviews = (prev.reviews || []).filter(
            (r) => Number(r.review_id) !== Number(reviewId)
          );
          const totalRating = updatedReviews.reduce(
            (sum, r) => sum + Number(r.rating || 5),
            0
          );
          const newAvg =
            updatedReviews.length > 0
              ? (totalRating / updatedReviews.length).toFixed(1)
              : "5.0";
          return {
            ...prev,
            reviews: updatedReviews,
            review_count: updatedReviews.length,
            rating: newAvg,
          };
        });
      }
      setReviewDeleteNotice("Review removed successfully (Staff Action).");
      setTimeout(() => setReviewDeleteNotice(null), 4000);
    } catch (err) {
      console.error("Failed to remove review:", err);
      alert("Failed to remove review: " + (err.message || "Unknown error"));
    } finally {
      setDeletingReviewId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
          <p className="text-stone-600 font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Error Loading Product</h2>
          <p className="text-stone-600 mb-6">{error}</p>
          <button
            onClick={onNavigateBack}
            className="bg-stone-900 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-amber-700 transition cursor-pointer"
          >
            ← Back to Store
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-stone-400 text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Product Not Found</h2>
          <p className="text-stone-600 mb-6">The product you are looking for does not exist or has been removed.</p>
          <button
            onClick={onNavigateBack}
            className="bg-stone-900 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-amber-700 transition cursor-pointer"
          >
            ← Back to Store
          </button>
        </div>
      </div>
    );
  }

  const variants = product.variants || [];
  const selectedVariant = variants.find((v) => v.variant_id === selectedVariantId) || variants[0];
  const displayPrice = selectedVariant?.selling_price || product.price || 0;
  const isOutOfStock = product.total_stock !== undefined && product.total_stock <= 0;
  const { discountPercent, originalPrice, savings } = getProductDiscount(product, displayPrice);

  const reviewsList = Array.isArray(product.reviews) ? product.reviews : [];
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviewsList.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
    ratingCounts[star] = (ratingCounts[star] || 0) + 1;
  });
  const averageRating = product.rating ? Number(product.rating).toFixed(1) : "5.0";
  const totalReviewsCount = reviewsList.length || product.review_count || 0;

  const renderReviewsBlock = () => (
    <div className="space-y-6">
      {/* Header & Write Review Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <span>Customer Reviews & Ratings</span>
              <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-bold">
                {totalReviewsCount} {totalReviewsCount === 1 ? "Review" : "Reviews"}
              </span>
            </h3>
            {isEmployee && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/90 border border-amber-300 px-2.5 py-0.5 text-xs font-bold text-amber-900 shadow-2xs">
                <span>👔</span> Staff Review Moderation
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Real feedback from verified ThreadCraft customers
          </p>
        </div>

        <button
          type="button"
          onClick={() => setReviewFormOpen((prev) => !prev)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-xs sm:text-sm font-bold transition shadow-xs active:scale-95 cursor-pointer"
        >
          <span>✍️</span>
          <span>{reviewFormOpen ? "Close Form" : "Write a Review"}</span>
        </button>
      </div>

      {/* Staff Review Removal Notice Banner */}
      {reviewDeleteNotice && (
        <div className="rounded-xl bg-amber-50 border border-amber-300 p-4 flex items-center gap-3 text-amber-900 animate-fade-in shadow-xs">
          <span className="text-xl">🗑️</span>
          <div>
            <p className="text-sm font-bold">{reviewDeleteNotice}</p>
            <p className="text-xs text-amber-700">The product review was removed from the database.</p>
          </div>
        </div>
      )}

      {/* Success Alert Banner */}
      {reviewSubmitSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-4 flex items-center gap-3 text-emerald-800 animate-fade-in">
          <span className="text-xl">✓</span>
          <div>
            <p className="text-sm font-bold">Review submitted successfully!</p>
            <p className="text-xs text-emerald-700">Thank you for sharing your experience. Your feedback is now published.</p>
          </div>
        </div>
      )}

      {/* Error Alert Banner */}
      {reviewSubmitError && (
        <div className="rounded-xl bg-red-50 border border-red-300 p-4 text-xs font-semibold text-red-800">
          {reviewSubmitError}
        </div>
      )}

      {/* Collapsible Write a Review Form */}
      {reviewFormOpen && (
        <form
          onSubmit={handleReviewSubmit}
          className="rounded-2xl bg-amber-50/40 border-2 border-amber-500/40 p-5 sm:p-6 shadow-sm space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-stone-900">
              Write Your Review for <span className="text-amber-800">{product.name}</span>
            </h4>
            <button
              type="button"
              onClick={() => setReviewFormOpen(false)}
              className="text-stone-400 hover:text-stone-600 text-xs font-bold cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          {/* Interactive 5-Star Rating Picker */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Overall Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  onMouseEnter={() => setReviewHoverRating(star)}
                  onMouseLeave={() => setReviewHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  title={`${star} star${star > 1 ? "s" : ""}`}
                >
                  <svg
                    className={`h-7 w-7 transition-colors ${
                      (reviewHoverRating || reviewRating) >= star
                        ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                        : "fill-stone-200 text-stone-300"
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-amber-800">
                {reviewRating === 5
                  ? "5.0 - Excellent"
                  : reviewRating === 4
                  ? "4.0 - Very Good"
                  : reviewRating === 3
                  ? "3.0 - Average"
                  : reviewRating === 2
                  ? "2.0 - Fair"
                  : "1.0 - Poor"}
              </span>
            </div>
          </div>

          {/* Customer Name Input */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Your Name <span className="text-stone-400 font-normal">(displayed with your review)</span>
            </label>
            <input
              type="text"
              value={reviewName}
              onChange={(e) => setReviewName(e.target.value)}
              placeholder="e.g. Rahul Mehta"
              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-900 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 transition"
            />
          </div>

          {/* Comments / Review Textarea */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Review Comments <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={reviewComments}
              onChange={(e) => setReviewComments(e.target.value)}
              placeholder="Share your thoughts on the fit, fabric quality, comfort, and wear experience..."
              className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 transition"
            />
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setReviewFormOpen(false)}
              className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReview || !reviewComments.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:bg-stone-300 text-white px-5 py-2 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              {submittingReview ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Review</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Rating Breakdown Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-stone-50 rounded-2xl p-5 sm:p-6 border border-stone-200">
        {/* Left Column: Big Rating Number */}
        <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-stone-200 pb-4 md:pb-0 md:pr-6 text-center">
          <span className="text-5xl font-black text-stone-900 tracking-tight">
            {averageRating}
          </span>
          <div className="flex items-center gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`h-5 w-5 ${
                  Math.round(Number(averageRating)) >= star
                    ? "fill-amber-400 text-amber-400"
                    : "fill-stone-200 text-stone-300"
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-xs text-stone-500 font-medium">
            Based on {totalReviewsCount} {totalReviewsCount === 1 ? "customer review" : "customer reviews"}
          </p>
        </div>

        {/* Right Column: Star Breakdown Bars */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingCounts[star] || 0;
            const pct = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-stone-700 shrink-0">
                  {star} Star
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-stone-200 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-16 text-right font-medium text-stone-500 shrink-0">
                  {pct}% ({count})
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer Reviews List */}
      <div className="space-y-3 pt-2">
        {reviewsList.length > 0 ? (
          reviewsList.map((rev, idx) => {
            const custInitials = (rev.customer_name || "Customer")
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <div
                key={rev.review_id || idx}
                className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs transition hover:border-amber-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs shrink-0 border border-amber-200">
                      {custInitials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-stone-900">
                          {rev.customer_name || "Verified Customer"}
                        </h5>
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          ✓ Verified Buyer
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400">
                        {rev.review_date ? new Date(rev.review_date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        }) : "Recent"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg
                          key={s}
                          className={`h-4 w-4 ${
                            Number(rev.rating) >= s
                              ? "fill-amber-400 text-amber-400"
                              : "fill-stone-200 text-stone-300"
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    {/* Employee Only: Remove / Delete Review Option */}
                    {isEmployee && (
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(rev.review_id)}
                        disabled={deletingReviewId === rev.review_id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 px-2.5 py-1 text-xs font-bold text-red-700 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs"
                        title="Staff Employee Action: Remove customer review"
                      >
                        {deletingReviewId === rev.review_id ? (
                          <>
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-700 border-t-transparent" />
                            <span>Removing...</span>
                          </>
                        ) : (
                          <>
                            <svg className="h-3.5 w-3.5 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Remove Review</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <p className="mt-3 text-sm text-stone-700 leading-relaxed pl-13">
                  {rev.comments}
                </p>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50/60 p-8 text-center">
            <span className="text-3xl mb-2">⭐</span>
            <h5 className="text-sm font-bold text-stone-900">No reviews yet for this product</h5>
            <p className="text-xs text-stone-500 max-w-sm mt-1">
              Be the first customer to share your experience with this item!
            </p>
            <button
              type="button"
              onClick={() => setReviewFormOpen(true)}
              className="mt-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Write the First Review
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Top Main Navigation */}
      <Navbar
        cartCount={cartCount}
        currentUser={currentUser}
        onNavigateToAuth={onNavigateToAuth}
        onLogout={onLogout}
        onNavigateToOrders={onNavigateToOrders}
        onNavigateToStore={onNavigateHome || onNavigateBack}
      />

      {/* Breadcrumb Navigation with interactive links */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-2 text-sm text-stone-500 flex-wrap">
            {/* Dedicated Previous Page Back Button */}
            <button
              type="button"
              onClick={onNavigateBack}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs sm:text-sm font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 hover:text-stone-900 transition shadow-2xs active:scale-95 cursor-pointer mr-1"
              title="Go back to previous page"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span>Back</span>
            </button>

            {/* Direct Home Store Link */}
            <button
              type="button"
              onClick={onNavigateHome || onNavigateBack}
              className="hover:text-amber-700 font-medium transition cursor-pointer flex items-center gap-1"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <span>Home</span>
            </button>
            <span className="text-stone-300">/</span>

            {product.category && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateCategory) {
                      onNavigateCategory(product.category);
                    } else {
                      window.location.hash = `#category=${encodeURIComponent(product.category)}`;
                    }
                  }}
                  className="font-medium text-stone-600 hover:text-amber-700 hover:underline transition cursor-pointer"
                  title={`View all products in ${product.category}`}
                >
                  {product.category}
                </button>
                <span className="text-stone-300">/</span>
              </>
            )}

            {product.brand && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateBrand) {
                      onNavigateBrand(product.brand);
                    } else {
                      window.location.hash = `#brand=${encodeURIComponent(product.brand)}`;
                    }
                  }}
                  className="font-medium text-stone-600 hover:text-amber-700 hover:underline transition cursor-pointer"
                  title={`View all products by ${product.brand}`}
                >
                  {product.brand}
                </button>
                <span className="text-stone-300">/</span>
              </>
            )}

            <span className="text-stone-900 font-semibold truncate max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left: Product Image */}
            <div className="relative bg-stone-100 flex items-center justify-center p-6 lg:p-12 min-h-[400px] lg:min-h-[550px]">
              {!imgError && product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  decoding="async"
                  onError={() => setImgError(true)}
                  className="max-h-[480px] w-full object-contain rounded-xl transition duration-300 hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-stone-400">
                  <svg className="h-32 w-32" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <span className="mt-4 text-lg font-medium">ThreadCraft</span>
                </div>
              )}

              {/* Badges on Image */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {product.brand && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateBrand) onNavigateBrand(product.brand);
                      else window.location.hash = `#brand=${encodeURIComponent(product.brand)}`;
                    }}
                    className="rounded-full bg-stone-900/80 px-3 py-1.5 text-xs font-bold tracking-wider text-white uppercase backdrop-blur-sm hover:bg-stone-900 transition cursor-pointer"
                  >
                    {product.brand}
                  </button>
                )}
                {discountPercent > 0 && (
                  <span className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-black tracking-wide text-white shadow-md backdrop-blur-sm">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Right: Product Details */}
            <div className="p-6 lg:p-10 flex flex-col justify-between">
              <div>
                {/* Category Pill Link */}
                {product.category && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateCategory) onNavigateCategory(product.category);
                      else window.location.hash = `#category=${encodeURIComponent(product.category)}`;
                    }}
                    className="inline-block bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-bold px-3 py-1 rounded-full mb-3 w-fit border border-amber-200 transition cursor-pointer"
                  >
                    📁 {product.category}
                  </button>
                )}

                {/* Product Name */}
                <h1 className="text-2xl lg:text-3xl font-extrabold text-stone-900 leading-tight mb-3">
                  {product.name}
                </h1>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1 bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-sm font-bold shadow-xs">
                    <span>{product.rating ? Number(product.rating).toFixed(1) : "5.0"}</span>
                    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("description");
                      setTimeout(() => {
                        const el = document.getElementById("product-reviews-section");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }, 50);
                    }}
                    className="text-sm text-stone-600 hover:text-amber-800 font-semibold underline decoration-dotted transition cursor-pointer"
                  >
                    {totalReviewsCount > 0 ? `${totalReviewsCount} Verified Customer Reviews` : "No reviews yet"} • Write a Review
                  </button>
                </div>

                {/* Price Section */}
                <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 mb-5 border border-stone-200">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                      ₹{Number(displayPrice).toLocaleString("en-IN")}
                    </span>
                    {discountPercent > 0 && originalPrice > displayPrice && (
                      <>
                        <span className="text-lg text-stone-400 line-through font-medium">
                          ₹{Number(originalPrice).toLocaleString("en-IN")}
                        </span>
                        <span className="text-sm font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-lg">
                          {discountPercent}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  {discountPercent > 0 && savings > 0 && (
                    <p className="text-xs font-bold text-emerald-700 mt-1.5 flex items-center gap-1.5">
                      <span>🎉</span>
                      <span>You save ₹{savings.toLocaleString("en-IN")} ({discountPercent}% discount)</span>
                    </p>
                  )}
                  <p className="text-xs text-stone-500 mt-1 font-medium">Inclusive of all GST & taxes</p>
                </div>

                {/* Stock Status */}
                <div className="mb-5">
                  {isOutOfStock ? (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="font-bold text-sm">Currently Out of Stock</span>
                    </div>
                  ) : product.total_stock <= 10 ? (
                    <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="font-bold text-sm">Hurry! Only {product.total_stock} left in stock</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-bold text-sm">In Stock ({product.total_stock} units available)</span>
                    </div>
                  )}
                </div>

                {/* Variant Selector */}
                {variants.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-stone-500 mb-2 uppercase tracking-wider">
                      Select Type / Size
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v) => (
                        <button
                          key={v.variant_id}
                          type="button"
                          onClick={() => setSelectedVariantId(v.variant_id)}
                          className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all border-2 cursor-pointer ${
                            selectedVariantId === v.variant_id
                              ? "bg-amber-700 text-white border-amber-700 shadow-md scale-102"
                              : "border-stone-200 bg-stone-50 text-stone-700 hover:border-amber-600 hover:text-amber-800"
                          }`}
                        >
                          <span className="block font-bold">{v.color_size}</span>
                          <span className="block text-xs mt-0.5 opacity-90">
                            ₹{Number(v.selling_price).toLocaleString("en-IN")}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                {!isOutOfStock && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-stone-500 mb-2 uppercase tracking-wider">Quantity</h3>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="h-10 w-10 rounded-xl border-2 border-stone-200 flex items-center justify-center text-lg font-bold text-stone-600 hover:border-amber-600 hover:text-amber-700 transition cursor-pointer"
                      >
                        −
                      </button>
                      <span className="text-lg font-bold text-stone-900 w-10 text-center">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(product.total_stock || 10, q + 1))}
                        className="h-10 w-10 rounded-xl border-2 border-stone-200 flex items-center justify-center text-lg font-bold text-stone-600 hover:border-amber-600 hover:text-amber-700 transition cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons & Success Toast */}
              <div className="pt-4 border-t border-stone-100">
                {addSuccessNotice && (
                  <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-bold flex items-center gap-2">
                    <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Added {quantity} × {product.name} to cart!
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={handleAddToCartClick}
                    className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all shadow-sm cursor-pointer ${
                      isOutOfStock
                        ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                        : "bg-amber-600 text-white hover:bg-amber-700 hover:shadow-md active:scale-[0.98]"
                    }`}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </button>

                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={handleBuyNowClick}
                    className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all shadow-sm cursor-pointer ${
                      isOutOfStock
                        ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                        : "bg-stone-900 text-white hover:bg-stone-800 hover:shadow-md active:scale-[0.98]"
                    }`}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                    Buy Now
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-stone-500">
                  <button
                    type="button"
                    onClick={onNavigateBack}
                    className="hover:text-amber-700 transition font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    ← Back to Previous Page
                  </button>
                  <span>100% Genuine & Brand Authentic</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs: Description, Reviews, Product Details, Delivery */}
        <div id="product-tabs-section" className="mt-8 bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-stone-200 overflow-x-auto">
            {[
              { id: "description", label: "Description" },
              { id: "reviews", label: `Reviews (${totalReviewsCount})` },
              { id: "specifications", label: "Product Details" },
              { id: "delivery", label: "Delivery & Returns" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[130px] py-4 px-3 text-xs sm:text-sm font-bold uppercase tracking-wide transition cursor-pointer text-center ${
                  activeTab === tab.id
                    ? "text-amber-700 border-b-2 border-amber-700 bg-amber-50/50"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 lg:p-8">
            {/* Description Tab (includes Product Overview + Reviews option) */}
            {activeTab === "description" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-2">
                    About This Product
                  </h3>
                  <p className="text-stone-700 leading-relaxed text-base">
                    {product.description || "No description available for this product."}
                  </p>
                </div>

                {/* Reviews Option embedded directly inside Description */}
                <div id="product-reviews-section" className="pt-6 border-t border-stone-200">
                  {renderReviewsBlock()}
                </div>
              </div>
            )}

            {/* Dedicated Reviews Tab */}
            {activeTab === "reviews" && (
              <div id="product-reviews-section">
                {renderReviewsBlock()}
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="space-y-0">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-stone-100">
                      <td className="py-3 pr-4 font-semibold text-stone-500 w-44">Product Name</td>
                      <td className="py-3 text-stone-900 font-medium">{product.name}</td>
                    </tr>
                    <tr className="border-b border-stone-100">
                      <td className="py-3 pr-4 font-semibold text-stone-500">Brand</td>
                      <td className="py-3 text-stone-900 font-medium">
                        <button
                          type="button"
                          onClick={() => {
                            if (onNavigateBrand) onNavigateBrand(product.brand);
                            else window.location.hash = `#brand=${encodeURIComponent(product.brand)}`;
                          }}
                          className="text-amber-800 hover:underline font-bold cursor-pointer"
                        >
                          {product.brand || "N/A"}
                        </button>
                      </td>
                    </tr>
                    <tr className="border-b border-stone-100">
                      <td className="py-3 pr-4 font-semibold text-stone-500">Category</td>
                      <td className="py-3 text-stone-900 font-medium">
                        <button
                          type="button"
                          onClick={() => {
                            if (onNavigateCategory) onNavigateCategory(product.category);
                            else window.location.hash = `#category=${encodeURIComponent(product.category)}`;
                          }}
                          className="text-amber-800 hover:underline font-bold cursor-pointer"
                        >
                          {product.category || "N/A"}
                        </button>
                      </td>
                    </tr>
                    <tr className="border-b border-stone-100">
                      <td className="py-3 pr-4 font-semibold text-stone-500">Base Price</td>
                      <td className="py-3 text-stone-900 font-medium">₹{Number(product.price).toLocaleString("en-IN")}</td>
                    </tr>
                    {variants.length > 0 && (
                      <tr className="border-b border-stone-100">
                        <td className="py-3 pr-4 font-semibold text-stone-500">Available Types & Sizes</td>
                        <td className="py-3 text-stone-900">
                          <div className="flex flex-wrap gap-2">
                            {variants.map((v) => (
                              <span
                                key={v.variant_id}
                                className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg text-xs font-semibold border border-stone-200"
                              >
                                {v.color_size} — ₹{Number(v.selling_price).toLocaleString("en-IN")}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                    <tr className="border-b border-stone-100">
                      <td className="py-3 pr-4 font-semibold text-stone-500">Stock Availability</td>
                      <td className="py-3 text-stone-900 font-medium">
                        {isOutOfStock ? (
                          <span className="text-red-600 font-bold">Out of Stock</span>
                        ) : (
                          <span className="text-emerald-700 font-bold">{product.total_stock} units available</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 font-semibold text-stone-500">Rating</td>
                      <td className="py-3 text-stone-900 font-medium">
                        {product.rating ? `${Number(product.rating).toFixed(1)} ★` : "No rating"} 
                        {product.review_count > 0 && ` (${product.review_count} reviews)`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "delivery" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-2xl">🚚</span>
                  <div>
                    <h4 className="font-bold text-stone-900">Free Express Delivery</h4>
                    <p className="text-sm text-stone-600 mt-0.5">Free delivery across all branches on orders above ₹499. Expected delivery in 3-5 business days.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-2xl">🔄</span>
                  <div>
                    <h4 className="font-bold text-stone-900">7-Day Easy Returns</h4>
                    <p className="text-sm text-stone-600 mt-0.5">Easy returns and exchanges within 7 days of receiving the item. No questions asked.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h4 className="font-bold text-stone-900">100% Quality Checked</h4>
                    <p className="text-sm text-stone-600 mt-0.5">All products are verified from our central database inventory before shipment.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-2xl">💳</span>
                  <div>
                    <h4 className="font-bold text-stone-900">Safe & Secure Payment</h4>
                    <p className="text-sm text-stone-600 mt-0.5">Pay with UPI, Credit/Debit cards, Net Banking, or Cash on Delivery.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar / Related Products for Comparison (Amazon-style) */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-stone-900">
                Compare with Similar Products
              </h2>
              <p className="text-sm text-stone-600 mt-1">
                More choices from <span className="font-bold text-amber-900">{product.category || product.brand}</span>
              </p>
            </div>
            {product.category && (
              <button
                type="button"
                onClick={() => {
                  if (onNavigateCategory) onNavigateCategory(product.category);
                  else window.location.hash = `#category=${encodeURIComponent(product.category)}`;
                }}
                className="text-sm font-bold text-amber-800 hover:text-amber-950 hover:underline cursor-pointer"
              >
                View all {product.category} →
              </button>
            )}
          </div>

          {loadingRelated ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="animate-pulse bg-white p-4 rounded-2xl border border-stone-200">
                  <div className="aspect-4/5 bg-stone-200 rounded-xl" />
                  <div className="mt-4 h-4 w-1/2 bg-stone-200 rounded" />
                  <div className="mt-2 h-6 w-3/4 bg-stone-200 rounded" />
                </div>
              ))}
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 8).map((relProduct) => (
                <ProductCard
                  key={relProduct.id}
                  product={relProduct}
                  onAddToCart={onAddToCart}
                  isEmployee={false}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center">
              <p className="text-stone-500 font-medium">No other products found in this category yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Cart Pill removed — cart is accessible via Navbar */}

      <Footer />
    </div>
  );
}

export default ProductDetail;
