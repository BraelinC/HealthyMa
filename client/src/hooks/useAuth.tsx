import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Fetch user data when token is available
  const { data: userData, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      if (!token) return null;
      
      const response = await fetch("/api/auth/user", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      
      const data = await response.json();
      return data.user;
    },
    enabled: !!token,
    retry: false,
  });

  // Update user when userData changes
  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  const login = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem("auth_token", newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
  };

  const value = {
    user,
    token,
    isLoading: isLoading && !!token,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}