import styles from "./UsersList.module.css";

export default function UsersList({ registeredUsers }) { 
  if (!registeredUsers || registeredUsers.length === 0) { 
    return <p>Nessun utente registrato.</p>;
  }

  return ( 
    <ul className={styles.list}>
      {registeredUsers.map((registeredUser) => (
        <li className={styles.item} key={registeredUser.id}>
          <strong>{registeredUser.username}</strong>
          <span className={styles.meta}>({registeredUser.role})</span>
        </li>
      ))}
    </ul>
  );
}
