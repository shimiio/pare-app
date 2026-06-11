import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Request interceptor to add JWT token to headers
apiClient.interceptors.request.use(
  function (config) {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// Queue
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle 401 errors and token refresh
apiClient.interceptors.response.use(
  // Pass through successful responses
  function (response) {
    return response;
  },
  // Handle errors
  async function (error) {
    const originalRequest = error.config;

    // Check if the error is a 401 and we haven't already tried to refresh
    // Do not attempt refresh for login/register requests.
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/register")
    ) {
      // If we're already refreshing, queue the request
      if (isRefreshing) {
        return (
          new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            // Once the token is refreshed, retry the original request
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            // If the refresh fails, reject the original request
            .catch((err) => Promise.reject(err))
        );
      }

      // Mark the original request as having been retried
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const response = await apiClient.post("/auth/refresh");
        const newToken = response.data.jwtToken;

        // Update the token in the auth store
        useAuthStore.getState().setToken(newToken);

        // Process the queue with the new token
        processQueue(null, newToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear auth and redirect to main page
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();
        window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        // Reset the refreshing flag
        isRefreshing = false;
      }
    }

    // For all other errors, reject the promise
    return Promise.reject(error);
  },
);
