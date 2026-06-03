// contexts/auth-context.tsx
"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import * as api from "@/components/api/auth";
import type { User } from "@/types/user";
import { UserRole } from "@/enum/UserRole";
import { useRouter } from 'next/navigation'   // Import useRouter from next/navigation  

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null; 
  register: (data: any) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  loginWithGoogle: (idToken?: string) => Promise<any>;
  loginWithGoogleCode: (code: string, redirectUri: string) => Promise<any>;
  logout: () => void;
  loading: boolean;
}

const mapRole = (r: number | string): UserRole => {
  if (r === 2 || r === 'shop') return UserRole.Shop;
  if (r === 3 || r === 'intermediary') return UserRole.Intermediary;
  return UserRole.User;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const register = async (data: any) => { //may need to adjust to suitable jwt from backend
    setLoading(true);
    try {
      const res = await api.register(data);
      if (res.success && res.data) {
        const userData: User = {
          userId: res.data.userId,
          fullName: res.data.fullName,
          email: res.data.email,
          role: mapRole(res.data.role),
          phoneNumber: res.data.phoneNumber,
          dateOfBirth: res.data.dateOfBirth,
          address: res.data.address,
          profilePictureUrl: res.data.profilePictureUrl,
          createdAt: res.data.createdAt,
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.success && res.data && res.data.token && res.data.user) {
        const backendUser = res.data.user;
        const userData: User = {
          userId: backendUser.userId,
          fullName: backendUser.fullName,
          email: backendUser.email,
          role: mapRole(backendUser.role),
          phoneNumber: backendUser.phoneNumber,
          dateOfBirth: backendUser.dateOfBirth,
          address: backendUser.address,
          profilePictureUrl: backendUser.profilePictureUrl,
          createdAt: backendUser.createdAt,
        };
        const tokenData = res.data.token;
        setUser(userData);
        setToken(tokenData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", tokenData);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const persistGoogleSession = (res: any) => {
    if (res.success && res.data && res.data.token && res.data.user) {
      const backendUser = res.data.user;
      const userData: User = {
        userId: backendUser.userId,
        fullName: backendUser.fullName,
        email: backendUser.email,
        role: mapRole(backendUser.role),
        phoneNumber: backendUser.phoneNumber,
        dateOfBirth: backendUser.dateOfBirth,
        address: backendUser.address,
        profilePictureUrl: backendUser.profilePictureUrl,
        createdAt: backendUser.createdAt,
      };
      const tokenData = res.data.token;
      setUser(userData);
      setToken(tokenData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", tokenData);
    }
  };

  const loginWithGoogle = async (idToken?: string) => {
    if (!idToken) {
      throw new Error("Thiếu mã xác thực Google");
    }

    setLoading(true);
    try {
      const res = await api.googleLogin(idToken);
      persistGoogleSession(res);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogleCode = async (code: string, redirectUri: string) => {
    setLoading(true);
    try {
      const res = await api.googleCodeLogin(code, redirectUri);
      persistGoogleSession(res);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        register,
        login,
        loginWithGoogle,
        loginWithGoogleCode,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
