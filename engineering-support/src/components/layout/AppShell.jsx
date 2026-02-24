"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import ContactAdminButton from "@/components/support/ContactAdminButton";
import styles from "./AppShell.module.css";


export default function AppShell({ children }) {
  const { authenticatedUserProfile } = useAuth();

  const adminEmailAddressForSupport = useMemo(() => {
    const emailFromProfile = authenticatedUserProfile?.teamAdminEmailAddress;
    if (emailFromProfile) return emailFromProfile;

    const fallbackSupportEmail = "admin@engineeringsupport.local";
    return fallbackSupportEmail;
  }, [authenticatedUserProfile]);

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.mainArea}>
        <TopBar />
        <div className={styles.contentArea}>{children}</div>
      </div>

      <ContactAdminButton adminEmailAddress={adminEmailAddressForSupport} />
    </div>
  );
}
