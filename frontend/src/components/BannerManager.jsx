import { useState } from "react";
import { BANNER_SLIDES } from "../data/bannerSlides.js";

const SAMPLE_PRESETS = [
  {
    name: "Classic Suits",
    url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=85",
    title: "Executive Tailoring",
    subtitle: "Premium Italian wool suits and formal blazers",
    tag: "Formal Wear",
  },
  {
    name: "Summer Casuals",
    url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=85",
    title: "Summer Everyday",
    subtitle: "Breathable linen shirts and relaxed cotton chinos",
    tag: "Summer 2026",
  },
  {
    name: "Streetwear",
    url: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1200&q=85",
    title: "Urban Streetwear",
    subtitle: "Heavyweight hoodies, oversized tees and cargo joggers",
    tag: "Trending Now",
  },
  {
    name: "Denim & Jackets",
    url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1200&q=85",
    title: "Heritage Denim",
    subtitle: "Reinforced selvedge denim and timeless trucker jackets",
    tag: "New Arrivals",
  },
];

function BannerManager({ slides = [], onUpdateSlides }) {
  const [editingId, setEditingId] = useState(null);
  const [formState, setFormState] = useState({
    url: "",
    title: "",
    subtitle: "",
    tag: "Trending Now",
  });
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isEditing = editingId !== null;

  function handleStartEdit(slide) {
    setEditingId(slide.id);
    setFormState({
      url: slide.url || "",
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      tag: slide.tag || "",
    });
    setFormError("");
    setSuccessMsg("");
  }

  function handleCancelEdit() {
    setEditingId(null);
    setFormState({ url: "", title: "", subtitle: "", tag: "Trending Now" });
    setFormError("");
  }

  function handleApplyPreset(preset) {
    setFormState({
      url: preset.url,
      title: preset.title,
      subtitle: preset.subtitle,
      tag: preset.tag,
    });
    setFormError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    const trimmedUrl = (formState.url || "").trim();
    const trimmedTitle = (formState.title || "").trim();
    const trimmedSubtitle = (formState.subtitle || "").trim();
    const trimmedTag = (formState.tag || "").trim();

    if (!trimmedUrl) {
      setFormError("Please enter a valid photo URL.");
      return;
    }

    try {
      const parsed = new URL(trimmedUrl);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        setFormError("Photo URL must start with http:// or https://");
        return;
      }
    } catch (_) {
      setFormError("Please provide a valid web URL (e.g. https://images.unsplash.com/...)");
      return;
    }

    if (!trimmedTitle) {
      setFormError("Please enter a title for this banner frame.");
      return;
    }

    if (isEditing) {
      // Update existing frame photo and text
      const updated = slides.map((s) =>
        s.id === editingId
          ? {
              ...s,
              url: trimmedUrl,
              title: trimmedTitle,
              subtitle: trimmedSubtitle,
              tag: trimmedTag,
            }
          : s
      );
      if (onUpdateSlides) onUpdateSlides(updated);
      setSuccessMsg(`✅ Banner frame "${trimmedTitle}" updated successfully!`);
      handleCancelEdit();
    } else {
      // Insert new photo frame
      const newFrame = {
        id: Date.now(),
        url: trimmedUrl,
        title: trimmedTitle,
        subtitle: trimmedSubtitle,
        tag: trimmedTag || "Featured",
      };
      const updated = [...slides, newFrame];
      if (onUpdateSlides) onUpdateSlides(updated);
      setSuccessMsg(`🎉 New banner frame "${trimmedTitle}" inserted into the showcase!`);
      setFormState({ url: "", title: "", subtitle: "", tag: "Trending Now" });
    }
  }

  function handleDelete(id, title) {
    if (slides.length <= 1) {
      setFormError("Cannot delete: at least 1 banner frame must remain in the showcase.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete banner frame "${title || "Photo"}"?`)) {
      return;
    }

    const updated = slides.filter((s) => s.id !== id);
    if (onUpdateSlides) onUpdateSlides(updated);

    if (editingId === id) {
      handleCancelEdit();
    }

    setSuccessMsg(`🗑️ Banner frame "${title}" was removed.`);
  }

  function handleResetDefaults() {
    if (window.confirm("Reset all banner frames to original boutique presets?")) {
      if (onUpdateSlides) onUpdateSlides(BANNER_SLIDES);
      handleCancelEdit();
      setSuccessMsg("🔄 Banner frames reset to original defaults.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <span>🖼️ Storefront Banner Frames Manager</span>
            <span className="rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-xs font-semibold">
              {slides.length} {slides.length === 1 ? "Frame" : "Frames"} Active
            </span>
          </h4>
          <p className="text-xs text-stone-500 mt-0.5">
            Insert new photo frames, update photos & text, or delete frames from the home page automatic slider.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetDefaults}
          className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50 transition cursor-pointer self-start sm:self-auto"
          title="Restore the initial 4 default banner photos"
        >
          🔄 Reset to Defaults
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <span>{successMsg}</span>
          <button
            type="button"
            onClick={() => setSuccessMsg("")}
            className="text-stone-400 hover:text-stone-700 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {formError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-800 flex items-center justify-between">
          <span>⚠️ {formError}</span>
          <button
            type="button"
            onClick={() => setFormError("")}
            className="text-stone-400 hover:text-stone-700 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Form on Left, Frames List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ================= FORM: INSERT OR UPDATE ================= */}
        <div className="lg:col-span-5 bg-stone-50 border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-stone-200 pb-2">
              <h5 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                {isEditing ? (
                  <>
                    <span className="text-amber-600">✏️</span>
                    <span>Update Photo & Text</span>
                  </>
                ) : (
                  <>
                    <span className="text-emerald-600">➕</span>
                    <span>Insert New Photo Frame</span>
                  </>
                )}
              </h5>

              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs text-stone-500 hover:text-stone-900 underline cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {/* Quick Presets */}
            {!isEditing && (
              <div className="mb-4">
                <span className="text-[11px] font-semibold text-stone-500 block mb-1.5">
                  Quick Sample Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="rounded-md border border-stone-300 bg-white px-2 py-1 text-[11px] font-medium text-stone-700 hover:border-amber-600 hover:text-amber-800 transition cursor-pointer"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Photo URL */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Photo Web URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formState.url}
                  onChange={(e) => setFormState({ ...formState, url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  required
                />
              </div>

              {/* Live Thumbnail Preview */}
              {formState.url && (
                <div className="relative aspect-16/9 w-full overflow-hidden rounded-xl border border-stone-300 bg-stone-100 shadow-inner">
                  <img
                    src={formState.url}
                    alt="Frame preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-stone-950/70 p-2 backdrop-blur-sm text-white">
                    <p className="text-xs font-bold leading-tight">{formState.title || "Frame Title"}</p>
                    <p className="text-[10px] text-stone-300 line-clamp-1">{formState.subtitle || "Frame Subtitle"}</p>
                  </div>
                  {formState.tag && (
                    <span className="absolute top-2 left-2 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-bold text-stone-950 uppercase">
                      {formState.tag}
                    </span>
                  )}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  placeholder="e.g. Summer Essentials, Boutique Suits"
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  required
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Subtitle / Description
                </label>
                <input
                  type="text"
                  value={formState.subtitle}
                  onChange={(e) => setFormState({ ...formState, subtitle: e.target.value })}
                  placeholder="e.g. Handcrafted tailoring for everyday comfort"
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>

              {/* Badge Tag */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Badge Tag
                </label>
                <input
                  type="text"
                  value={formState.tag}
                  onChange={(e) => setFormState({ ...formState, tag: e.target.value })}
                  placeholder="e.g. Trending Now, New Arrivals, 20% Off"
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className={`flex-1 rounded-xl py-2.5 text-xs font-bold text-white shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    isEditing
                      ? "bg-amber-700 hover:bg-amber-600"
                      : "bg-stone-900 hover:bg-stone-800"
                  }`}
                >
                  <span>{isEditing ? "💾 Save Changes" : "➕ Insert New Frame"}</span>
                </button>

                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* ================= LIST OF CURRENT FRAMES ================= */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Active Showcase Frames ({slides.length})
            </span>
            <span className="text-[11px] text-stone-500">
              Auto-rotates every 4.0s
            </span>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {slides.map((slide, index) => {
              const isCurrentlyEditing = editingId === slide.id;
              return (
                <div
                  key={slide.id || index}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition ${
                    isCurrentlyEditing
                      ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/50"
                      : "border-stone-200 bg-white hover:border-stone-300 shadow-xs"
                  }`}
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100 border border-stone-200 shadow-inner">
                      <img
                        src={slide.url}
                        alt={slide.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=300&q=80";
                        }}
                      />
                      <span className="absolute bottom-1 right-1 rounded bg-stone-900/80 px-1 py-0.2 text-[9px] font-bold text-white">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h6 className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                          {slide.title || "Untitled Frame"}
                        </h6>
                        {slide.tag && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-900">
                            {slide.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                        {slide.subtitle || "No subtitle provided"}
                      </p>
                      <p className="text-[10px] text-stone-400 font-mono truncate max-w-xs mt-0.5">
                        {slide.url}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions (Update & Delete) */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(slide)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                        isCurrentlyEditing
                          ? "bg-amber-600 text-white"
                          : "border border-stone-300 bg-stone-50 text-stone-700 hover:border-amber-600 hover:text-amber-800 hover:bg-white"
                      }`}
                      title="Edit photo URL, title, subtitle & tag"
                    >
                      <span>✏️</span>
                      <span>Update</span>
                    </button>

                    <button
                      type="button"
                      disabled={slides.length <= 1}
                      onClick={() => handleDelete(slide.id, slide.title)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition flex items-center gap-1 ${
                        slides.length <= 1
                          ? "opacity-40 cursor-not-allowed bg-stone-100 text-stone-400 border border-stone-200"
                          : "border border-red-200 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white cursor-pointer"
                      }`}
                      title={slides.length <= 1 ? "At least 1 frame is required" : "Delete this frame"}
                    >
                      <span>🗑️</span>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BannerManager;
