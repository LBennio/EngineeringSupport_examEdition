"use client";

import styles from "./EmptyState.module.css";

export default function EmptyState({
  title = "No data",
  description = "Nothing to show yet.",
  actionLabel = "",
  onAction = null
}) {
  return (
    <div className={styles.card}>
      <div className={styles.title}>{title}</div>
      <div className={styles.description}>{description}</div>

      {actionLabel && typeof onAction === "function" ? (
        <button className={styles.actionButton} onClick={onAction} type="button">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
