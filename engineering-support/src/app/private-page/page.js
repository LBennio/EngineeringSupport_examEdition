"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import styles from "./page.module.css";
import {
  requestEmailChange,
  requestPasswordChange,
  requestPlanChange
} from "@/lib/accountService";

function validateEmailFormat(email) {
  const normalizedEmail = String(email || "").trim();
  const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return basicEmailRegex.test(normalizedEmail);
}

function formatDateTimeItalian(isoDateString) {
  if (!isoDateString) return "N/D";
  const parsedDate = new Date(isoDateString);
  if (Number.isNaN(parsedDate.getTime())) return "N/D";
  return parsedDate.toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" });
}

export default function PrivatePage() {
  const { isAuthenticated, isAuthStateLoading, authenticatedUserProfile } = useAuth();


  const [localUserProfileSnapshot, setLocalUserProfileSnapshot] = useState(null);

  const effectiveUserProfile = localUserProfileSnapshot || authenticatedUserProfile || null;

  const currentUsername = effectiveUserProfile?.username || "unknown_user";
  const currentUserRole = effectiveUserProfile?.role || "guest";
  const currentPlan = effectiveUserProfile?.plan || "none";
  const currentEmail = effectiveUserProfile?.email || "N/D";
  const accountCreationDateLabel = formatDateTimeItalian(effectiveUserProfile?.createdAt);

  const supportEmailAddress = "softengineering@gmail.com";

  const [selectedPlanDraft, setSelectedPlanDraft] = useState(currentPlan === "premium" ? "premium" : "base");

  const [newEmailDraft, setNewEmailDraft] = useState("");
  const [confirmNewEmailDraft, setConfirmNewEmailDraft] = useState("");

  const [currentPasswordDraft, setCurrentPasswordDraft] = useState("");
  const [newPasswordDraft, setNewPasswordDraft] = useState("");
  const [confirmNewPasswordDraft, setConfirmNewPasswordDraft] = useState("");

  const [isSavingAccountChanges, setIsSavingAccountChanges] = useState(false);
  const [accountActionMessage, setAccountActionMessage] = useState("");
  const [accountActionErrorMessage, setAccountActionErrorMessage] = useState("");

  function resetMessages() {
    setAccountActionMessage("");
    setAccountActionErrorMessage("");
  }


  function applyLocalProfilePatch(patch) {
    setLocalUserProfileSnapshot((previousSnapshot) => {
      const baseProfile = previousSnapshot || authenticatedUserProfile || {};
      return { ...baseProfile, ...patch };
    });
  }


  async function handlePlanUpdate() {
    resetMessages();

    if (!selectedPlanDraft) return;

    if (String(selectedPlanDraft) === String(currentPlan)) {
      setAccountActionMessage("Nessuna modifica: il piano selezionato coincide con quello attivo.");
      return;
    }

    setIsSavingAccountChanges(true);

    try {
      const planChangePayload = { newPlan: selectedPlanDraft };
      await requestPlanChange(planChangePayload);

      applyLocalProfilePatch({ plan: selectedPlanDraft });

      setAccountActionMessage(`Piano aggiornato: ora sei su "${selectedPlanDraft}".`);
    } catch (planError) {
      setAccountActionErrorMessage(planError.message || "Cambio piano non riuscito.");
    } finally {
      setIsSavingAccountChanges(false);
    }
  }


  async function handleEmailUpdate() {
    resetMessages();

    const normalizedNewEmail = String(newEmailDraft || "").trim();
    const normalizedConfirmEmail = String(confirmNewEmailDraft || "").trim();

    if (!normalizedNewEmail || !normalizedConfirmEmail) {
      setAccountActionErrorMessage("Compila entrambi i campi email (nuova + conferma).");
      return;
    }

    if (normalizedNewEmail !== normalizedConfirmEmail) {
      setAccountActionErrorMessage("Le due email non coincidono.");
      return;
    }

    if (!validateEmailFormat(normalizedNewEmail)) {
      setAccountActionErrorMessage("Formato email non valido.");
      return;
    }

    if (normalizedNewEmail === String(currentEmail)) {
      setAccountActionMessage("Nessuna modifica: la nuova email coincide con quella attuale.");
      return;
    }

    setIsSavingAccountChanges(true);

    try {
      const emailChangePayload = { newEmail: normalizedNewEmail };
      await requestEmailChange(emailChangePayload);

      applyLocalProfilePatch({ email: normalizedNewEmail });

      setAccountActionMessage("Email aggiornata con successo.");
      setNewEmailDraft("");
      setConfirmNewEmailDraft("");
    } catch (emailError) {
      setAccountActionErrorMessage(emailError.message || "Cambio email non riuscito.");
    } finally {
      setIsSavingAccountChanges(false);
    }
  }


  async function handlePasswordUpdate() {
    resetMessages();

    const normalizedCurrentPassword = String(currentPasswordDraft || "");
    const normalizedNewPassword = String(newPasswordDraft || "");
    const normalizedConfirmPassword = String(confirmNewPasswordDraft || "");

    if (!normalizedCurrentPassword || !normalizedNewPassword || !normalizedConfirmPassword) {
      setAccountActionErrorMessage("Compila tutti i campi password (attuale, nuova, conferma).");
      return;
    }

    if (normalizedNewPassword.length < 8) {
      setAccountActionErrorMessage("La nuova password deve avere almeno 8 caratteri.");
      return;
    }

    if (normalizedNewPassword !== normalizedConfirmPassword) {
      setAccountActionErrorMessage("La nuova password e la conferma non coincidono.");
      return;
    }

    if (normalizedCurrentPassword === normalizedNewPassword) {
      setAccountActionErrorMessage("La nuova password deve essere diversa da quella attuale.");
      return;
    }

    setIsSavingAccountChanges(true);

    try {
      const passwordChangePayload = {
        currentPassword: normalizedCurrentPassword,
        newPassword: normalizedNewPassword
      };

      await requestPasswordChange(passwordChangePayload);

      setAccountActionMessage("Password aggiornata con successo.");
      setCurrentPasswordDraft("");
      setNewPasswordDraft("");
      setConfirmNewPasswordDraft("");
    } catch (passwordError) {
      setAccountActionErrorMessage(passwordError.message || "Cambio password non riuscito.");
    } finally {
      setIsSavingAccountChanges(false);
    }
  }

  const accountSummaryLabel = useMemo(() => {
    return `${currentUsername} • role: ${currentUserRole} • plan: ${currentPlan}`;
  }, [currentUsername, currentUserRole, currentPlan]);

  const supportMailtoHref = useMemo(() => {
    const subject = encodeURIComponent("EngineeringSupport - Support request");
    const body = encodeURIComponent(
      `Ciao,\n\nho bisogno di supporto.\n\nUtente: ${currentUsername}\nEmail: ${currentEmail}\nRole: ${currentUserRole}\nPlan: ${currentPlan}\n\nDescrizione problema:\n- `
    );
    return `mailto:${supportEmailAddress}?subject=${subject}&body=${body}`;
  }, [supportEmailAddress, currentUsername, currentEmail, currentUserRole, currentPlan]);

  if (isAuthStateLoading) {
    return (
      <main className={styles.container}>
        <h1 className={styles.title}>My Account</h1>
        <p className={styles.muted}>Verifica sessione in corso...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className={styles.container}>
        <h1 className={styles.title}>My Account</h1>
        <p className={styles.muted}>Accesso riservato: devi effettuare il login.</p>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>My Account</h1>
          <p className={styles.subtitle}>
            Gestione profilo, abbonamento e sicurezza accesso.
          </p>
        </div>

        <div className={styles.badges}>
          <span className={styles.badge}>{accountSummaryLabel}</span>
        </div>
      </header>

      {accountActionErrorMessage ? (
        <div className={styles.alertError}>
          <strong>{accountActionErrorMessage}</strong>
        </div>
      ) : null}

      {accountActionMessage ? (
        <div className={styles.alertSuccess}>
          <strong>{accountActionMessage}</strong>
        </div>
      ) : null}

      <section className={styles.grid}>
        <article className={styles.card}>
          <h2 className={styles.cardTitle}>Account details</h2>

          <div className={styles.keyValueGrid}>
            <div className={styles.keyValueRow}>
              <div className={styles.key}>Username</div>
              <div className={styles.value}>{currentUsername}</div>
            </div>

            <div className={styles.keyValueRow}>
              <div className={styles.key}>Email</div>
              <div className={styles.value}>{currentEmail}</div>
            </div>

            <div className={styles.keyValueRow}>
              <div className={styles.key}>Role</div>
              <div className={styles.value}>{currentUserRole}</div>
            </div>

            <div className={styles.keyValueRow}>
              <div className={styles.key}>Account created</div>
              <div className={styles.value}>{accountCreationDateLabel}</div>
            </div>
          </div>
        </article>

        <article className={styles.card}>
          <h2 className={styles.cardTitle}>Subscription</h2>
          <p className={styles.cardText}>
            Piano attivo: <strong>{currentPlan}</strong>
          </p>

          <div className={styles.field}>
            <div className={styles.label}>Change plan</div>
            <select
              className={styles.select}
              value={selectedPlanDraft}
              onChange={(e) => setSelectedPlanDraft(e.target.value)}
              disabled={isSavingAccountChanges}
            >
              <option value="base">base</option>
              <option value="premium">premium</option>
            </select>

            <div className={styles.hint}>
              Base: 1 progetto personale. Premium: più progetti. Admin: governance team + premium.
            </div>
          </div>

          <button
            className={styles.primaryButton}
            type="button"
            onClick={handlePlanUpdate}
            disabled={isSavingAccountChanges}
          >
            {isSavingAccountChanges ? "Updating..." : "Update plan"}
          </button>
        </article>

        <article className={styles.card}>
          <h2 className={styles.cardTitle}>Change login email</h2>

          <div className={styles.field}>
            <div className={styles.label}>New email</div>
            <input
              className={styles.input}
              value={newEmailDraft}
              onChange={(e) => setNewEmailDraft(e.target.value)}
              placeholder="name@example.com"
              disabled={isSavingAccountChanges}
            />
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Confirm new email</div>
            <input
              className={styles.input}
              value={confirmNewEmailDraft}
              onChange={(e) => setConfirmNewEmailDraft(e.target.value)}
              placeholder="name@example.com"
              disabled={isSavingAccountChanges}
            />
          </div>

          <button
            className={styles.primaryButton}
            type="button"
            onClick={handleEmailUpdate}
            disabled={isSavingAccountChanges}
          >
            {isSavingAccountChanges ? "Updating..." : "Update email"}
          </button>

          <div className={styles.hint}>
            Nota: lato backend servirà verifica univocità email + eventuale conferma via email.
          </div>
        </article>

        <article className={styles.card}>
          <h2 className={styles.cardTitle}>Change password</h2>

          <div className={styles.field}>
            <div className={styles.label}>Current password</div>
            <input
              className={styles.input}
              type="password"
              value={currentPasswordDraft}
              onChange={(e) => setCurrentPasswordDraft(e.target.value)}
              placeholder="••••••••"
              disabled={isSavingAccountChanges}
            />
          </div>

          <div className={styles.field}>
            <div className={styles.label}>New password</div>
            <input
              className={styles.input}
              type="password"
              value={newPasswordDraft}
              onChange={(e) => setNewPasswordDraft(e.target.value)}
              placeholder="min 8 characters"
              disabled={isSavingAccountChanges}
            />
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Confirm new password</div>
            <input
              className={styles.input}
              type="password"
              value={confirmNewPasswordDraft}
              onChange={(e) => setConfirmNewPasswordDraft(e.target.value)}
              placeholder="repeat new password"
              disabled={isSavingAccountChanges}
            />
          </div>

          <button
            className={styles.primaryButton}
            type="button"
            onClick={handlePasswordUpdate}
            disabled={isSavingAccountChanges}
          >
            {isSavingAccountChanges ? "Updating..." : "Update password"}
          </button>

          <div className={styles.hint}>
            Nota: lato backend serve hashing (bcrypt/argon2) e policy sicurezza (rate limit, strength).
          </div>
        </article>

        <article className={styles.card}>
          <h2 className={styles.cardTitle}>Customer support</h2>
          <p className={styles.cardText}>
            Per assistenza, apri una richiesta via email. Il messaggio includerà automaticamente i tuoi dati account.
          </p>

          <a className={styles.secondaryLink} href={supportMailtoHref}>
            Contact support ({supportEmailAddress})
          </a>
        </article>
      </section>
    </main>
  );
}
