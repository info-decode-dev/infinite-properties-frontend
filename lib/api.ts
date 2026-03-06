import axios, { AxiosInstance } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// List of public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/api/properties/public",
  "/api/collections/collections/public",
  "/api/collections/reels/public",
  "/api/about-us/public",
  "/api/testimonials/public",
];

// Routes that are public only for POST requests (like creating enquiries)
// GET requests to these routes still require authentication
const POST_ONLY_PUBLIC_ROUTES = [
  "/api/enquiries",
];

// Helper function to check if a URL is a public route
const isPublicRoute = (url: string, method?: string): boolean => {
  if (!url) return false;
  
  // Remove query parameters and hash for matching
  const urlPath = url.split('?')[0].split('#')[0];
  
  // Check if it's a fully public route (exact match or starts with the route)
  if (PUBLIC_ROUTES.some((route) => urlPath === route || urlPath.startsWith(route + '/'))) {
    return true;
  }
  
  // Check if it's a POST-only public route
  if (method?.toUpperCase() === "POST" && POST_ONLY_PUBLIC_ROUTES.some((route) => urlPath === route || urlPath.startsWith(route + '/'))) {
    return true;
  }
  
  return false;
};

// Add request interceptor to include auth token (only for non-public routes)
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // Only add token for non-public routes
      // Check both URL and method to determine if route is public
      if (!isPublicRoute(config.url || "", config.method)) {
        const token = localStorage.getItem("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      
      // Only redirect to login for non-public routes
      // Public routes should fail gracefully without redirecting
      // Note: We can't check method here, but GET requests to /api/enquiries should redirect
      if (!isPublicRoute(url, error.config?.method)) {
        // Unauthorized - clear token and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("admin_authenticated");
          // Only redirect if not already on login page
          if (!window.location.pathname.includes("/admin/login")) {
            window.location.href = "/admin/login";
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

