"use client";

import styles from "./LoadingState.module.css";

export default function LoadingState({ title = "Loading...", description = "" }) {
  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <div className={styles.spinner} />
      <div className={styles.text}>
        <div className={styles.title}>{title}</div>
        {description ? <div className={styles.description}>{description}</div> : null}
      </div>
    </div>
  );
}
