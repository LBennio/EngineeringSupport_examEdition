"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./Navbar.module.css";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const router = useRouter();

  const {
    authenticatedUserProfile,
    isAuthenticated,
    isAuthStateLoading,
    logoutFromCurrentSession
  } = useAuth();

  async function handleLogoutClick() {
    const logoutResult = await logoutFromCurrentSession();

    if (logoutResult.ok) {
      router.push("/");
    }
  }

  if (isAuthStateLoading) {
    return (
      <header className={styles.header}>
        <div className={styles.brand}>EngineerSupport</div>
        <div className={styles.right}>Loading...</div>
      </header>
    );
  }

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link className={styles.brand} href="/">
          EngineerSupport
        </Link>

        {!isAuthenticated ? (
          <>
            <div className={styles.links}>
              <Link href="/#product">Product</Link>
              <Link href="/#solutions">Solutions</Link>
              <Link href="/#templates">Templates</Link>
              <Link href="/#pricing">Pricing</Link>
              <Link href="/#help">Help</Link>
              <Link href="/public-page">Public Page</Link>
            </div>

            <div className={styles.actions}>
              <Link className={styles.cta} href="/register">Sign up</Link>
              <Link className={styles.ctaOutline} href="/login">Login</Link>
            </div>
          </>
        ) : (
          <>
            <div className={styles.links}>
              <Link href="/app-area/my-project">My Project</Link>
              <Link href="/app-area/my-account">My Account</Link>
              <Link href="/private-page">Private Page</Link>
            </div>

            <div className={styles.actions}>
              <button className={styles.ctaOutline} onClick={handleLogoutClick}>
                Log out
              </button>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
