import { API_URL } from "@/config";
import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "supplier" | "processor" | "logistics" | "buyer" | "financier";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Captain Fresh Node",
  supplier: "Independent Supplier",
  processor: "Processing Hub",
  logistics: "Logistics Partner",
  buyer: "Institutional Buyer",
  financier: "Financier / Bank",
};

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>(
    (localStorage.getItem("userRole") as UserRole) || "admin"
  );
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("accessToken")
  );

  const logout = async () => {
    try {
      const token = localStorage.getItem("refreshToken");
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: token }),
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userRole");
      setIsAuthenticated(false);
      window.location.href = "/login";
    }
  };

  return (
    <RoleContext.Provider value={{ role, setRole, isAuthenticated, setIsAuthenticated, logout }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
};
