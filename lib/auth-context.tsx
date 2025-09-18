"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    const savedAuth = localStorage.getItem("chatel-auth");
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setIsAuthenticated(true);
      setUser(authData.user);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulation d'une authentification simple
    // Dans un vrai projet, ceci ferait appel à une API
    if (email === "admin@chatel.fr" && password === "chatel2024") {
      const userData = { name: "Administrateur Châtel", email };
      setIsAuthenticated(true);
      setUser(userData);
      localStorage.setItem("chatel-auth", JSON.stringify({ user: userData }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("chatel-auth");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
