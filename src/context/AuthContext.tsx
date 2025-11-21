import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";

export type AuthProviderType = "credentials" | "google";

export interface AuthUser {
  email: string;
  provider: AuthProviderType;
}

type CredentialsLoginPayload = {
  type: "credentials";
  email: string;
  password: string;
};

type GoogleLoginPayload = {
  type: "google";
  email?: string;
};

export type LoginPayload = CredentialsLoginPayload | GoogleLoginPayload;

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AUTH_STORAGE_KEY = "raimond.auth.session";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw) as AuthUser;

    if (data?.email && (data.provider === "credentials" || data.provider === "google")) {
      return data;
    }
  } catch (error) {
    console.warn("Failed to read auth session", error);
  }

  return null;
}

function persistUser(user: AuthUser | null) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (user) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (error) {
    console.warn("Failed to persist auth session", error);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadStoredUser());

  const login = useCallback(async (payload: LoginPayload) => {
    if (payload.type === "credentials") {
      const normalizedEmail = payload.email.trim().toLowerCase();
      const mockUser: AuthUser = {
        email: normalizedEmail,
        provider: "credentials"
      };
      setUser(mockUser);
      persistUser(mockUser);
      return;
    }

    const email = payload.email?.trim().toLowerCase() ?? "trader@gmail.com";
    const mockGoogleUser: AuthUser = {
      email,
      provider: "google"
    };
    setUser(mockGoogleUser);
    persistUser(mockGoogleUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    persistUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout
    }),
    [login, logout, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}


