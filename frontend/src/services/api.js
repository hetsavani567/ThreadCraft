const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const TOKEN_KEY = "threadcraft_access_token";
const REFRESH_TOKEN_KEY = "threadcraft_refresh_token";
const SESSION_KEY = "threadcraft_session_id";

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getSessionId() {
  return localStorage.getItem(SESSION_KEY);
}

export function saveAuthTokens({ accessToken, refreshToken, sessionId }) {
  if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (sessionId) localStorage.setItem(SESSION_KEY, sessionId);
}

export function clearAuthTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
}

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export async function apiRequest(path, options = {}, isRetry = false) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const token = getAccessToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...options,
    credentials: "include",
    headers,
  });

  // Handle Token Expiry & Auto-Refresh
  if (response.status === 401 && !isRetry && !path.includes("/auth/login") && !path.includes("/auth/refresh")) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ refreshToken }),
          });
          const refreshData = await refreshRes.json();
          if (refreshRes.ok && refreshData.accessToken) {
            saveAuthTokens({
              accessToken: refreshData.accessToken,
              refreshToken: refreshData.refreshToken,
            });
            onRefreshed(refreshData.accessToken);
          } else {
            clearAuthTokens();
          }
        } catch {
          clearAuthTokens();
        } finally {
          isRefreshing = false;
        }
      }

      // Wait for refresh to complete and retry original request
      return new Promise((resolve) => {
        refreshSubscribers.push((newToken) => {
          if (newToken) {
            resolve(apiRequest(path, options, true));
          } else {
            resolve(response.json());
          }
        });
      });
    }
  }

  const contentType = response.headers.get("content-type");
  const data = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null
        ? data.message
        : data;

    const error = new Error(message || `Request failed: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
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

export async function fetchProductById(productId) {
  return apiRequest(`/products/${productId}`);
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

export const updateProduct = async (productId, productData) => {
  return apiRequest(`/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });
};

export async function submitProductReview(productId, reviewData) {
  return apiRequest(`/products/${productId}/reviews`, {
    method: "POST",
    body: JSON.stringify(reviewData),
  });
}

export async function fetchHealth() {
  return apiRequest("/health");
}

export async function fetchOrders(params = {}) {
  const query = new URLSearchParams();
  if (params.cust_id) query.append("cust_id", params.cust_id);
  if (params.email) query.append("email", params.email);
  if (params.status && params.status !== "All") query.append("status", params.status);

  const qs = query.toString();
  return apiRequest(`/orders${qs ? `?${qs}` : ""}`);
}

export async function fetchOrderById(orderId) {
  return apiRequest(`/orders/${orderId}`);
}

export async function createOrder(orderData) {
  return apiRequest("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
}

export async function updateOrderStatus(orderId, status) {
  return apiRequest(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function fetchCustomerByEmail(email) {
  if (!email) return null;
  const qs = new URLSearchParams({ email }).toString();
  return apiRequest(`/customers?${qs}`);
}

export async function syncCustomer(customerData) {
  return apiRequest("/customers", {
    method: "POST",
    body: JSON.stringify(customerData),
  });
}

// ----------------- Authentication & Session APIs ----------------- //

export async function loginUser(credentials) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  if (data.accessToken) {
    saveAuthTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      sessionId: data.sessionId,
    });
  }
  return data;
}

export async function registerUser(userData) {
  const data = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
  if (data.accessToken) {
    saveAuthTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      sessionId: data.sessionId,
    });
  }
  return data;
}

export async function continueWithGoogle(payload) {
  const data = await apiRequest("/auth/google", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (data.accessToken) {
    saveAuthTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      sessionId: data.sessionId,
    });
  }
  return data;
}

export async function fetchGoogleAuthUrl() {
  const data = await apiRequest("/auth/google/url");
  return data.url;
}

export async function logoutUser() {
  const sessionId = getSessionId();
  const refreshToken = getRefreshToken();
  try {
    await apiRequest("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ sessionId, refreshToken }),
    });
  } catch (err) {
    console.warn("Logout request completed with notice:", err);
  } finally {
    clearAuthTokens();
  }
}

export async function logoutAllDevices() {
  try {
    await apiRequest("/auth/logout-all", {
      method: "POST",
    });
  } finally {
    clearAuthTokens();
  }
}

export async function fetchCurrentUser() {
  return apiRequest("/auth/me");
}

export async function fetchUserSessions() {
  return apiRequest("/auth/sessions");
}

export async function revokeUserSession(sessionId) {
  return apiRequest(`/auth/sessions/${sessionId}`, {
    method: "DELETE",
  });
}


