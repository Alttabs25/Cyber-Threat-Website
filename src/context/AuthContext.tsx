import React, { createContext, useContext, useEffect, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import {
  assertSupabaseConfigured,
  isSupabaseConfigured,
  supabase,
} from "../lib/supabase";

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  resetProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const baseUser = (authUser: SupabaseUser): User => ({
  id: authUser.id,
  name:
    authUser.user_metadata?.name || authUser.email?.split("@")[0] || "Customer",
  email: authUser.email || "",
  profileImage:
    authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture,
});

const loadUserProfile = async (authUser: SupabaseUser): Promise<User> => {
  const fallback = baseUser(authUser);
  const { data, error } = await supabase
    .from("profiles")
    .select("name, email, phone, address, profile_image")
    .eq("id", authUser.id)
    .maybeSingle();

  if (error) {
    console.error("Unable to load Supabase profile:", error.message);
    return fallback;
  }

  return data
    ? {
        id: authUser.id,
        name: data.name || fallback.name,
        email: data.email || fallback.email,
        phone: data.phone || undefined,
        address: data.address || undefined,
        profileImage: data.profile_image || fallback.profileImage,
      }
    : fallback;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let sessionVersion = 0;

    const applyAuthUser = async (authUser: SupabaseUser | null) => {
      const version = ++sessionVersion;
      if (!authUser) {
        if (active) setUser(null);
        return;
      }

      const profile = await loadUserProfile(authUser);
      if (active && version === sessionVersion) setUser(profile);
    };

    if (!isSupabaseConfigured) {
      setAuthError(
        "Supabase is not configured. Add your project URL and publishable/anon key to .env."
      );
      setUser(null);
      setIsAuthReady(true);
      return;
    }

    const initializeAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) setAuthError(error.message);
      await applyAuthUser(data.session?.user ?? null);
      if (active) setIsAuthReady(true);
    };

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer database work until the auth callback has returned.
      window.setTimeout(() => void applyAuthUser(session?.user ?? null), 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      assertSupabaseConfigured();
      setAuthError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error || !data.user) throw error || new Error("Login failed");
      setUser(await loadUserProfile(data.user));
      return true;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Login failed");
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      assertSupabaseConfigured();
      setAuthError(null);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { name: name.trim() } },
      });
      if (error || !data.user) throw error || new Error("Signup failed");

      if (data.session) setUser(await loadUserProfile(data.user));
      return true;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Signup failed");
      return false;
    }
  };

  const loginWithGoogle = async () => {
    try {
      assertSupabaseConfigured();
      setAuthError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
      return true;
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Google login failed"
      );
      return false;
    }
  };

  const logout = async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signOut();
    if (error) setAuthError(error.message);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    assertSupabaseConfigured();
    setAuthError(null);

    const nextEmail = updates.email?.trim().toLowerCase() || user.email;
    if (nextEmail !== user.email) {
      const { error } = await supabase.auth.updateUser({ email: nextEmail });
      if (error) throw error;
    }

    const nextUser = { ...user, ...updates, email: nextEmail };
    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        name: nextUser.name,
        email: nextUser.email,
        phone: nextUser.phone || null,
        address: nextUser.address || null,
        profile_image: nextUser.profileImage || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    if (error) {
      setAuthError(error.message);
      throw error;
    }
    setUser(nextUser);
  };

  const resetProfile = async () => {
    await logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAuthReady,
        authError,
        login,
        signup,
        logout,
        loginWithGoogle,
        updateProfile,
        resetProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
