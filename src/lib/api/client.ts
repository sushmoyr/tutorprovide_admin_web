import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { env } from "@/lib/env";

const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const response = await axios.post(
          `${env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
          null,
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        );

        const tokenResult = response.data.data;
        localStorage.setItem("accessToken", tokenResult.accessToken);
        localStorage.setItem("refreshToken", tokenResult.refreshToken);
        localStorage.setItem("user", JSON.stringify(tokenResult.user));
        document.cookie = `accessToken=${tokenResult.accessToken};path=/;max-age=86400`;

        originalRequest.headers.Authorization = `Bearer ${tokenResult.accessToken}`;
        refreshSubscribers.forEach((cb) => cb(tokenResult.accessToken));
        refreshSubscribers = [];

        return apiClient(originalRequest);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        document.cookie = "accessToken=;path=/;max-age=0";
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const api = {
  get: <T = unknown>(url: string, params?: Record<string, unknown>) =>
    apiClient.get<T>(url, { params }),
  post: <T = unknown>(url: string, data?: unknown) =>
    apiClient.post<T>(url, data),
  put: <T = unknown>(url: string, data?: unknown) =>
    apiClient.put<T>(url, data),
  patch: <T = unknown>(url: string, data?: unknown) =>
    apiClient.patch<T>(url, data),
  delete: <T = unknown>(url: string) => apiClient.delete<T>(url),
};
