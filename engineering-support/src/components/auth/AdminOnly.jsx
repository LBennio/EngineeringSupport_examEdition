
"use client";

import { useAuth } from "@/hooks/useAuth";
import styles from "./AdminOnly.module.css";

export default function AdminOnly({ children }) {
  const { authenticatedUserProfile, isAuthStateLoading } = useAuth();

  const authenticatedUserRole = authenticatedUserProfile?.role || "guest";
  const isAdminRole = authenticatedUserRole === "admin";

  if (isAuthStateLoading) {
    return <div className={styles.box}>Loading permissions...</div>;
  }

  if (!isAdminRole) {
    return (
      <div className={styles.box}>
        <h2 className={styles.title}>Access denied</h2>
        <p className={styles.text}>
          Questa sezione è riservata agli utenti con ruolo <strong>admin</strong>, se sei tu l'admin, per favore contatta l'assistenza clienti, il contatto lo trovi nell'<a href="/private-page"> <em>area privata</em></a>.
        </p>
      </div>
    );
  }

  return children;
}
