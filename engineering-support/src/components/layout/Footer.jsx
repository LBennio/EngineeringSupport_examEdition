import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>Engineering Support</div>
        <div className={styles.meta}>
            <span> · </span>
            <a href="https://www.uniba.it/it/ricerca/dipartimenti/informatica">Progetto commissionato dal Dipartimento di Informatica UniBa</a>
            <span> · </span>
            <a href="https://eur-lex.europa.eu/legal-content/IT/TXT/PDF/?uri=CELEX:32016R0679">Privacy</a>
            <span> · </span>
            <a href="https://www.mixingclass.com/">Sponsor</a>
            <span> · </span>
        </div>
      </div>
    </footer>
  );
}
