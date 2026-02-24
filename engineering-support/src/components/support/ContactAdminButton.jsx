"use client";

import styles from "./ContactAdminButton.module.css";
export default function ContactAdminButton({ adminEmailAddress }) {
  const mailtoHref = `mailto:${adminEmailAddress}?subject=${encodeURIComponent(
    "Engineering Support - Richiesta supporto"
  )}`;

  return (
    <a className={styles.floatingButton} href={mailtoHref}>
      Contact admin
    </a>
  );
}
