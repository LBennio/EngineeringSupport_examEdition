"use client";

import styles from "./FloatingAdminMail.module.css";
import { useAuth } from "@/hooks/useAuth";

export default function FloatingAdminMail() {
  const { isAuthenticated, authenticatedUserProfile } = useAuth();

  const teamAdminEmailAddress = authenticatedUserProfile?.teamAdminEmailAddress;

  if (!isAuthenticated) return null;
  if (!teamAdminEmailAddress) return null;

  const mailSubject = encodeURIComponent("Engineering Support - Richiesta supporto");
  const mailBody = encodeURIComponent(
    `Ciao Admin,\n\nho bisogno di supporto su:\n\n- Utente: ${authenticatedUserProfile?.username}\n- Dettagli:\n\nGrazie.`
  );

  const mailtoUrl = `mailto:${teamAdminEmailAddress}?subject=${mailSubject}&body=${mailBody}`;

  return (
    <a className={styles.floatingButton} href={mailtoUrl} aria-label="Contatta admin via email">
      Contact admin
    </a>
  );
}
