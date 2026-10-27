const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export async function apiRequest(path, options = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type");
  const data = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null
        ? data.message
        : data;

    throw new Error(message || `Request failed: ${response.status}`);
  }

  return data;
}

export async function fetchProducts(params = {}) {
  const query = new URLSearchParams();
  if (params.category && params.category !== "All") query.append("category", params.category);
  if (params.brand && params.brand !== "All") query.append("brand", params.brand);
  if (params.search) query.append("search", params.search);

  const qs = query.toString();
  return apiRequest(`/products${qs ? `?${qs}` : ""}`);
}

export async function fetchCategories() {
  return apiRequest("/categories");
}

export async function fetchBrands() {
  return apiRequest("/brands");
}

export async function createProduct(productData) {
  return apiRequest("/products", {
    method: "POST",
    body: JSON.stringify(productData),
  });
}

export async function updateProductVariant(variantId, variantData) {
  return apiRequest(`/products/variants/${variantId}`, {
    method: "PUT",
    body: JSON.stringify(variantData),
  });
}

export async function updateProduct(productId, productData) {
  return apiRequest(`/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });
}

export async function fetchHealth() {
  return apiRequest("/health");
}

