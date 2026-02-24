"use client";

import { useAuth } from "@/hooks/useAuth";
import styles from "./TopBar.module.css";

export default function TopBar() {
  const { authenticatedUserProfile } = useAuth();

  const usernameLabel = authenticatedUserProfile?.username || "User";
  const roleLabel = authenticatedUserProfile?.role || "base";
  const planLabel = authenticatedUserProfile?.plan || "base";

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <div className={styles.title}>Workspace</div>
        <div className={styles.subtitle}>Manage projects and documentation</div>
      </div>

      <div className={styles.right}>
        <div className={styles.userBlock}>
          <div className={styles.userName}>{usernameLabel}</div>
          <div className={styles.badges}>
            <span className={styles.badge}>Role: {roleLabel}</span>
            <span className={styles.badge}>Plan: {planLabel}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
