"use client";

import styles from "./ErrorBanner.module.css";

export default function ErrorBanner({ title = "Error", message, onRetry = null }) {
  if (!message) return null;

  return (
    <div className={styles.banner} role="alert">
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        <div className={styles.message}>{message}</div>
      </div>

      {typeof onRetry === "function" ? (
        <button className={styles.retryButton} onClick={onRetry} type="button">
          Retry
        </button>
      ) : null}
    </div>
  );
}
