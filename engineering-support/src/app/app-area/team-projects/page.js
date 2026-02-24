import AuthGuard from "@/components/auth/AuthGuard";
import TeamProjectsManager from "@/components/projects/TeamProjectsManager";
import styles from "./page.module.css";

export default function TeamProjectsPage() {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <section className={styles.page}>
        <h1 className={styles.title}>Team Projects</h1>
        <TeamProjectsManager />
      </section>
    </AuthGuard>
  );
}
