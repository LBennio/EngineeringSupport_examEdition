
"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AuthGuard({
  children,
  allowedRoles = null,
  redirectPath = "/login"
}) {
  const router = useRouter();
  const currentPathname = usePathname();

  const {
    isAuthenticated,
    isAuthStateLoading,
    authenticatedUserProfile
  } = useAuth();

  const authenticatedUserRole = authenticatedUserProfile?.role || "guest";

  const isRoleAllowed = useMemo(() => {
    if (!allowedRoles) return true;
    return allowedRoles.includes(authenticatedUserRole);
  }, [allowedRoles, authenticatedUserRole]);

  useEffect(() => {
    const shouldRedirectToLogin =
      !isAuthStateLoading && !isAuthenticated;

    if (shouldRedirectToLogin) {
      const redirectUrl = `${redirectPath}?redirectTo=${encodeURIComponent(
        currentPathname
      )}`;
      router.replace(redirectUrl);
    }
  }, [isAuthStateLoading, isAuthenticated, router, redirectPath, currentPathname]);

  if (isAuthStateLoading) {
    return <p>Loading protected area...</p>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isRoleAllowed) {
    return (
      <section>
        <h1>Access denied</h1>
        <p>Il tuo ruolo non è autorizzato ad accedere a questa sezione.</p>
      </section>
    );
  }

  return children;
}
