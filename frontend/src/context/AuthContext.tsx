"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchApi, UserProfile } from "@/lib/api";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (fullName: string, email: string, pass: string, role?: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage on mount
    const savedToken = localStorage.getItem("noworry_auth_token");
    const savedUserStr = localStorage.getItem("noworry_auth_user");

    if (savedToken && savedUserStr) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUserStr));
      } catch (e) {
        localStorage.removeItem("noworry_auth_token");
        localStorage.removeItem("noworry_auth_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await fetchApi<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password: pass }),
    });

    const accessToken = res.access_token;
    const userData: UserProfile = res.user;

    setToken(accessToken);
    setUser(userData);

    localStorage.setItem("noworry_auth_token", accessToken);
    localStorage.setItem("noworry_auth_user", JSON.stringify(userData));
  };

  const signup = async (fullName: string, email: string, pass: string, role: string = "OPERATOR") => {
    const res = await fetchApi<any>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        full_name: fullName,
        email: email,
        password: pass,
        role: role
      }),
    });

    if (res.access_token) {
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem("noworry_auth_token", res.access_token);
      localStorage.setItem("noworry_auth_user", JSON.stringify(res.user));
    }
  };

  const forgotPassword = async (email: string) => {
    await fetchApi<any>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("noworry_auth_token");
    localStorage.removeItem("noworry_auth_user");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
