import UsersList from "@/components/users/UsersList";
import { fetchRegisteredUsersList } from "@/lib/usersService";
import styles from "./page.module.css";

export default async function PublicPage() {
  try {
    const registeredUsers = await fetchRegisteredUsersList();

    return (
      <section className={styles.page}>
        <h1>Public Page</h1>
        <p className={styles.subtitle}>Elenco degli utenti registrati nel database:</p>

        <div className={styles.card}>
          <UsersList registeredUsers={registeredUsers} />
        </div>
      </section>
    );
  } catch (usersListLoadError) {
    return (
      <section className={styles.page}>
        <h1>Public Page</h1>
        <p className={styles.subtitle}>
          Impossibile caricare la lista utenti: <strong>{usersListLoadError.message}</strong>
        </p>
      </section>
    );
  }
}
