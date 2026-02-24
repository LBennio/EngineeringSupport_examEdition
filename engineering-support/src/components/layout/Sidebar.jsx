"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const router = useRouter();
  const { authenticatedUserProfile, logoutFromCurrentSession } = useAuth();

  const authenticatedUserRole = authenticatedUserProfile?.role || "guest";

  const sidebarLinks = useMemo(() => {
    const links = [
      { href: "/app-area", label: "Dashboard" },
      { href: "/app-area/projects", label: "My Projects" },
      { href: "/app-area/account", label: "My Account" }
    ];

    if (authenticatedUserRole === "admin") {
      links.push({ href: "/app-area/team", label: "Team" });
      links.push({ href: "/app-area/team-projects", label: "Team Projects" });
    }

    return links;
  }, [authenticatedUserRole]);

  async function handleLogoutClick() {
    await logoutFromCurrentSession();
    router.push("/");
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandTitle}>EngineerSupport</div>
        <div className={styles.brandSubtitle}>Private area</div>
      </div>

      <nav className={styles.nav}>
        {sidebarLinks.map((linkItem) => (
          <Link key={linkItem.href} className={styles.navLink} href={linkItem.href}>
            {linkItem.label}
          </Link>
        ))}
      </nav>

      <div className={styles.footer}>
        <button className={styles.logoutButton} onClick={handleLogoutClick} type="button">
          Log out
        </button>
      </div>
    </aside>
  );
}
