import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/auth-store";
import { ApiErrorShape } from "@/types/api";

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!baseURL) {
  throw new Error("EXPO_PUBLIC_API_BASE_URL is missing. Set it in mobile/.env.");
}

interface RetriableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL,
  timeout: 15000
});

const refreshClient = axios.create({
  baseURL,
  timeout: 15000
});

let refreshPromise: Promise<string | null> | null = null;

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().tokens?.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorShape>) => {
    const request = error.config as RetriableRequest | undefined;
    const refreshToken = useAuthStore.getState().tokens?.refreshToken;

    if (!request || request._retry || error.response?.status !== 401 || !refreshToken) {
      return Promise.reject(error);
    }

    request._retry = true;

    if (!refreshPromise) {
      refreshPromise = refreshClient
        .post("/auth/refresh-token", { refreshToken })
        .then(async (response) => {
          const accessToken = String(response.data?.data?.accessToken ?? "");
          if (!accessToken) {
            throw new Error("Missing refreshed access token");
          }

          const currentTokens = useAuthStore.getState().tokens;
          if (currentTokens) {
            await useAuthStore.getState().setTokens({
              accessToken,
              refreshToken: currentTokens.refreshToken
            });
          }
          return accessToken;
        })
        .catch(async () => {
          await useAuthStore.getState().signOut();
          return null;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const nextToken = await refreshPromise;
    if (!nextToken) {
      return Promise.reject(error);
    }

    request.headers.Authorization = `Bearer ${nextToken}`;
    return apiClient(request);
  }
);

export function getApiMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorShape>(error)) {
    const details = error.response?.data?.errors?.map((item) => item.message).filter(Boolean);
    if (details?.length) {
      return details.join(" | ");
    }
    return error.response?.data?.message || fallback;
  }

  return fallback;
}
