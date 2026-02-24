"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getMaxProjectsAllowedForPlan } from "@/lib/accessPolicy";
import styles from "./MyAccountPanel.module.css";

export default function MyAccountPanel() {
  const router = useRouter();

  const {
    authenticatedUserProfile,
    isAuthStateLoading,
    authErrorMessage,
    refreshAuthenticatedUser,
    logoutFromCurrentSession,
    devAuthBypassEnabled
  } = useAuth();

  const usernameLabel = authenticatedUserProfile?.username || "User";
  const emailLabel = authenticatedUserProfile?.email || "unknown@email";
  const roleLabel = authenticatedUserProfile?.role || "base";
  const planLabel = authenticatedUserProfile?.plan || "base";


  const maxProjectsAllowedLabel = useMemo(() => {
    const maxAllowedProjects = getMaxProjectsAllowedForPlan(authenticatedUserProfile);
    return maxAllowedProjects === Infinity ? "unlimited" : String(maxAllowedProjects);
  }, [authenticatedUserProfile]);


  const permissionsSummary = useMemo(() => {
    const permissions = [];

    permissions.push(`Max personal projects: ${maxProjectsAllowedLabel}`);

    if (roleLabel === "admin") {
      permissions.push("Can manage team members (invite/remove)");
      permissions.push("Can view and manage team projects");
      permissions.push("Can add admin comments on users' projects");
    } else {
      permissions.push("No team administration permissions");
    }

    permissions.push("Can export documentation as PDF");
    permissions.push("Can view Public Page users list");

    return permissions;
  }, [roleLabel, maxProjectsAllowedLabel]);

  async function handleRefreshSessionClick() {
    await refreshAuthenticatedUser();
  }

  async function handleLogoutClick() {
    await logoutFromCurrentSession();
    router.push("/");
  }

  return (
    <section className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>My account</h1>
        <p className={styles.subtitle}>
          Stato dell’account: identità, ruolo, piano e limiti operativi.
        </p>
      </header>

      {authErrorMessage ? (
        <div className={styles.alertError}>
          <strong>{authErrorMessage}</strong>
        </div>
      ) : null}

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Profile</h2>

          {isAuthStateLoading ? (
            <p className={styles.muted}>Loading profile...</p>
          ) : (
            <div className={styles.profileGrid}>
              <div><strong>Username:</strong> {usernameLabel}</div>
              <div><strong>Email:</strong> {emailLabel}</div>
              <div><strong>Role:</strong> {roleLabel}</div>
              <div><strong>Plan:</strong> {planLabel}</div>
            </div>
          )}

          {devAuthBypassEnabled ? (
            <div className={styles.devBadge}>
              DEV AUTH BYPASS ENABLED
            </div>
          ) : null}
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Permissions & limits</h2>
          <ul className={styles.list}>
            {permissionsSummary.map((permissionLine) => (
              <li key={permissionLine}>{permissionLine}</li>
            ))}
          </ul>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Session actions</h2>

          <div className={styles.actionsRow}>
            <button
              className={styles.secondaryButton}
              onClick={handleRefreshSessionClick}
              type="button"
              disabled={isAuthStateLoading}
            >
              Refresh session
            </button>

            <button
              className={styles.dangerButton}
              onClick={handleLogoutClick}
              type="button"
              disabled={isAuthStateLoading}
            >
              Log out
            </button>
          </div>

          <p className={styles.hint}>
            Nota: per il periodo di demo della web app, le attività verranno monitorate da un team di esperti, cosi da rendere unica l'esperienza con il prodotto definitivo.
          </p>
        </div>
      </div>
    </section>
  );
}
