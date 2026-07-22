import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { AuthTokens, AuthUser, LoginResponse } from "@/types/api";
import { authApi } from "@/api/services";

const ACCESS_TOKEN_KEY = "carta_access_token";
const REFRESH_TOKEN_KEY = "carta_refresh_token";
const USER_KEY = "carta_user";

interface AuthState {
  hydrated: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  tokens: AuthTokens | null;
  selectedChildId: number | null;
  hydrate: () => Promise<void>;
  signIn: (payload: { username: string; password: string }) => Promise<LoginResponse>;
  signOut: () => Promise<void>;
  setTokens: (tokens: AuthTokens | null) => Promise<void>;
  setUser: (user: AuthUser | null) => Promise<void>;
  setSelectedChildId: (childId: number | null) => void;
}

async function persistTokens(tokens: AuthTokens | null) {
  if (!tokens) {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    return;
  }

  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

async function persistUser(user: AuthUser | null) {
  if (!user) {
    await SecureStore.deleteItemAsync(USER_KEY);
    return;
  }

  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export const useAuthStore = create<AuthState>((set, get) => ({
  hydrated: false,
  isAuthenticated: false,
  user: null,
  tokens: null,
  selectedChildId: null,
  hydrate: async () => {
    const [accessToken, refreshToken, userRaw] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.getItemAsync(USER_KEY)
    ]);

    const user = userRaw ? (JSON.parse(userRaw) as AuthUser) : null;
    const tokens = accessToken && refreshToken ? { accessToken, refreshToken } : null;

    set({
      hydrated: true,
      isAuthenticated: !!tokens && !!user,
      user,
      tokens
    });

    if (tokens && user) {
      try {
        const me = await authApi.getMe();
        set({
          user: me,
          isAuthenticated: true
        });
        await persistUser(me);
      } catch {
        await get().signOut();
      }
    }
  },
  signIn: async ({ username, password }) => {
    const response = await authApi.login({ username, password });
    await persistTokens(response.tokens);
    await persistUser(response.user);
    set({
      isAuthenticated: true,
      user: response.user,
      tokens: response.tokens,
      selectedChildId: null
    });
    return response;
  },
  signOut: async () => {
    try {
      if (get().isAuthenticated) {
        await authApi.logout();
      }
    } catch {
      // Clear local auth even if the server is unavailable.
    }

    await persistTokens(null);
    await persistUser(null);
    set({
      hydrated: true,
      isAuthenticated: false,
      user: null,
      tokens: null,
      selectedChildId: null
    });
  },
  setTokens: async (tokens) => {
    await persistTokens(tokens);
    set({
      tokens,
      isAuthenticated: !!tokens && !!get().user
    });
  },
  setUser: async (user) => {
    await persistUser(user);
    set({
      user,
      isAuthenticated: !!user && !!get().tokens
    });
  },
  setSelectedChildId: (selectedChildId) => set({ selectedChildId })
}));
