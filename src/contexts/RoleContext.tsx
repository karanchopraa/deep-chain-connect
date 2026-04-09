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
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>("admin");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <RoleContext.Provider value={{ role, setRole, isAuthenticated, setIsAuthenticated }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
};
