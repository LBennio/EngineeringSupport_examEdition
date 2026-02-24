"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { startOAuthLoginRedirect } from "@/lib/authService";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    loginWithEmailAndPassword,
    authErrorMessage,
    isAuthStateLoading
  } = useAuth();

  const [loginFormState, setLoginFormState] = useState({ email: "", password: "" });
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  function handleLoginFieldChange(fieldName, fieldValue) {
    setLoginFormState((previousFormState) => ({
      ...previousFormState,
      [fieldName]: fieldValue
    }));
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setIsLoginSubmitting(true);

    const loginCredentials = {
      email: loginFormState.email.trim(),
      password: loginFormState.password
    };

    const loginResult = await loginWithEmailAndPassword(loginCredentials);
    setIsLoginSubmitting(false);

    if (loginResult.ok) {
      const redirectTo = searchParams.get("redirectTo") || "/app-area/my-project";
      router.push(redirectTo);
    }
  }

  function handleOAuthLoginClick() {
    startOAuthLoginRedirect("google");
  }

  const shouldDisableLoginSubmit =
    isAuthStateLoading ||
    isLoginSubmitting ||
    loginFormState.email.trim() === "" ||
    loginFormState.password === "";

  return (
    <section className={styles.page}>
      <h1>Login</h1>

      <form className={styles.formCard} onSubmit={handleLoginSubmit}>
        <div className={styles.field}>
          <div className={styles.label}>Email</div>
          <input
            className={styles.input}
            value={loginFormState.email}
            onChange={(e) => handleLoginFieldChange("email", e.target.value)}
            type="email"
            placeholder="name@mail.com"
          />
          <div className={styles.hint}>Inserisci l’email registrata.</div>
        </div>

        <div className={styles.field}>
          <div className={styles.label}>Password</div>
          <input
            className={styles.input}
            value={loginFormState.password}
            onChange={(e) => handleLoginFieldChange("password", e.target.value)}
            type="password"
            placeholder="••••••••"
          />
        </div>

        {authErrorMessage ? (
          <div className={styles.errorBox}>
            <strong>{authErrorMessage}</strong>
          </div>
        ) : null}

        <div className={styles.actions}>
          <button className={styles.primaryButton} disabled={shouldDisableLoginSubmit} type="submit">
            {isLoginSubmitting ? "Signing in..." : "Login"}
          </button>

          <button className={styles.secondaryButton} type="button" onClick={handleOAuthLoginClick}>
            Login with Google
          </button>
        </div>
      </form>
    </section>
  );
}
