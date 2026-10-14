const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
export const API_BASE_URL = RAW_BASE_URL.replace(/\/$/, "");

export const getImageUrl = (path) => {
  if (!path) return null;

  if (typeof path === "object") {
    path = path.url || path.path || path.src || "";
  }

  if (typeof path !== "string" || !path) return null;

  if (/^(https?:\/\/|blob:|data:)/i.test(path)) {
    return path;
  }

  let clean = path.replace(/\\/g, "/").replace(/^\//, "");

  if (
    !clean.startsWith("assets/") &&
    /^(users|messages|general)\//.test(clean)
  ) {
    clean = `assets/${clean}`;
  }

  return API_BASE_URL
    ? `${API_BASE_URL}/${clean}?ngrok-skip-browser-warning=true`
    : `/${clean}`;
};

// Storage Keys
const TOKEN_KEY = "mysteryme_token";
const REFRESH_TOKEN_KEY = "mysteryme_refresh_token";
const USER_KEY = "mysteryme_user";

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const getStoredRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setAuthSession = ({ access_token, refresh_token, user }) => {
  if (access_token) localStorage.setItem(TOKEN_KEY, access_token);
  if (refresh_token) localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export async function apiRequest(endpoint, {
  method = "GET",
  body = null,
  token = null,
  isFormData = false,
  headers = {}
} = {}) {
  const url = endpoint.startsWith("http") 
    ? endpoint 
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const requestHeaders = {
  ...headers,
  "ngrok-skip-browser-warning": "true",
};

  const authToken = token || getStoredToken();
  if (authToken) {
    // Backend expects raw token string without "Bearer " prefix
    const cleanToken = authToken.startsWith("Bearer ") 
      ? authToken.replace(/^Bearer\s+/, "") 
      : authToken;
    requestHeaders["Authorization"] = cleanToken;
  }

  if (!isFormData && body && typeof body === "object") {
    requestHeaders["Content-Type"] = "application/json";
  }

  const config = {
    method,
    headers: requestHeaders
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (err) {
    throw new Error(`Network error: ${err.message}. Please check if backend server is running.`);
  }

  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    // Normalize backend error response
    let errorMessage = "Request failed";
    if (data?.error_message) {
      errorMessage = data.error_message;
    } else if (data?.message) {
      errorMessage = data.message;
    } else if (response.status === 404) {
      errorMessage = "Resource not found (404)";
    } else if (response.status === 403) {
      errorMessage = "Access forbidden (403)";
    } else if (response.status === 401) {
      errorMessage = "Session expired or unauthorized (401)";
    } else if (response.status === 429) {
      errorMessage = "Too many requests. Please wait a moment.";
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    error.issues = data?.issues || [];
    throw error;
  }

  return data;
}
