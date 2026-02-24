"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchAuthenticatedUserProfile,
  performEmailPasswordLogin,
  performLogoutRequest,
  performUserRegistration
} from "@/lib/authService";
import { normalizeErrorToMessage } from "@/lib/normalizeError";
import { getDevUserProfile, isDevAuthBypassEnabled } from "@/lib/devAuth";
import { normalizeUserProfile } from "@/lib/normalizeUserProfile";


export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [authenticatedUserProfile, setAuthenticatedUserProfile] = useState(null);
  const [isAuthStateLoading, setIsAuthStateLoading] = useState(true);
  const [authErrorMessage, setAuthErrorMessage] = useState("");

  const devAuthBypassEnabled = isDevAuthBypassEnabled();

  const refreshAuthenticatedUser = useCallback(async () => {
    setIsAuthStateLoading(true);
    setAuthErrorMessage("");

    if (devAuthBypassEnabled) {
      const devUserProfile = getDevUserProfile();
      setAuthenticatedUserProfile(devUserProfile);
      setIsAuthStateLoading(false);
      return;
    }

    try {
      const userProfileFromServer = await fetchAuthenticatedUserProfile();
      setAuthenticatedUserProfile(normalizeUserProfile(userProfileFromServer));
    } catch (profileLoadError) {
      const statusCode = profileLoadError?.status;

      if (statusCode === 401 || statusCode === 403) {
        setAuthenticatedUserProfile(null);
      } else {
        setAuthenticatedUserProfile(null);
        const errorMessage = normalizeErrorToMessage(
          profileLoadError,
          "Impossibile verificare la sessione (backend non raggiungibile o errore server)."
        );
        setAuthErrorMessage(errorMessage);
      }
    } finally {
      setIsAuthStateLoading(false);
    }
  }, [devAuthBypassEnabled]);

  useEffect(() => {
    refreshAuthenticatedUser();
  }, [refreshAuthenticatedUser]);

  const loginWithEmailAndPassword = useCallback(
    async (loginCredentials) => {
      setAuthErrorMessage("");

      if (devAuthBypassEnabled) {
        const devUserProfile = getDevUserProfile();
        setAuthenticatedUserProfile(devUserProfile);
        return { ok: true, errorMessage: "" };
      }

      try {
        const userProfileFromLogin = await performEmailPasswordLogin(loginCredentials);
        setAuthenticatedUserProfile(normalizeUserProfile(userProfileFromLogin));
        return { ok: true, errorMessage: "" };
      } catch (loginError) {
        setAuthenticatedUserProfile(null);
        const errorMessage = normalizeErrorToMessage(loginError, "Login fallito.");
        setAuthErrorMessage(errorMessage);
        return { ok: false, errorMessage };
      }
    },
    [devAuthBypassEnabled]
  );


  const registerNewUserAccount = useCallback(
    async (registrationPayload) => {
      setAuthErrorMessage("");

      if (devAuthBypassEnabled) {
        const devUserProfile = getDevUserProfile();
        setAuthenticatedUserProfile(devUserProfile);
        return { ok: true, errorMessage: "" };
      }

      try {
        const userProfileFromRegistration = await performUserRegistration(registrationPayload);
        setAuthenticatedUserProfile(normalizeUserProfile(userProfileFromRegistration));
        return { ok: true, errorMessage: "" };
      } catch (registrationError) {
        setAuthenticatedUserProfile(null);
        const errorMessage = normalizeErrorToMessage(registrationError, "Registrazione fallita.");
        setAuthErrorMessage(errorMessage);
        return { ok: false, errorMessage };
      }
    },
    [devAuthBypassEnabled]
  );


  const logoutFromCurrentSession = useCallback(async () => {
    setAuthErrorMessage("");

    if (devAuthBypassEnabled) {
      return { ok: true, errorMessage: "" };
    }

    try {
      await performLogoutRequest();
      setAuthenticatedUserProfile(null);
      return { ok: true, errorMessage: "" };
    } catch (logoutError) {
      setAuthenticatedUserProfile(null);
      const errorMessage = normalizeErrorToMessage(logoutError, "Logout fallito.");
      setAuthErrorMessage(errorMessage);
      return { ok: false, errorMessage };
    }
  }, [devAuthBypassEnabled]);

  const authContextValue = useMemo(
    () => ({
      authenticatedUserProfile,
      isAuthenticated: Boolean(authenticatedUserProfile),
      isAuthStateLoading,
      authErrorMessage,
      refreshAuthenticatedUser,
      loginWithEmailAndPassword,
      registerNewUserAccount,
      logoutFromCurrentSession,

      devAuthBypassEnabled
    }),
    [
      authenticatedUserProfile,
      isAuthStateLoading,
      authErrorMessage,
      refreshAuthenticatedUser,
      loginWithEmailAndPassword,
      registerNewUserAccount,
      logoutFromCurrentSession,
      devAuthBypassEnabled
    ]
  );

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
}
