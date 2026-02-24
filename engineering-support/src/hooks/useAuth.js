"use client";

import { useContext } from "react";
import { AuthContext } from "@/components/auth/AuthProvider";

export function useAuth() {
  const authContextValue = useContext(AuthContext);

  if (!authContextValue) {
    throw new Error(
      "useAuth: AuthContext non disponibile. Verifica che il componente sia renderizzato dentro <AuthProvider>."
    );
  }

  return authContextValue;
}
