"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const {
    registerNewUserAccount,
    authErrorMessage,
    isAuthStateLoading
  } = useAuth();

  const [registrationFormState, setRegistrationFormState] = useState({
    username: "",
    email: "",
    password: ""
  });

  const [isRegistrationSubmitting, setIsRegistrationSubmitting] = useState(false);

  function handleRegistrationFieldChange(fieldName, fieldValue) {
    setRegistrationFormState((previousFormState) => ({
      ...previousFormState,
      [fieldName]: fieldValue
    }));
  }

  async function handleRegistrationSubmit(event) {
    event.preventDefault();
    setIsRegistrationSubmitting(true);

    const registrationPayload = {
      username: registrationFormState.username.trim(),
      email: registrationFormState.email.trim(),
      password: registrationFormState.password
    };

    const registrationResult = await registerNewUserAccount(registrationPayload);

    setIsRegistrationSubmitting(false);

    if (registrationResult.ok) {
      router.push("/app-area/my-project");
    }
  }

  const shouldDisableRegistrationSubmit =
    isAuthStateLoading ||
    isRegistrationSubmitting ||
    registrationFormState.username.trim() === "" ||
    registrationFormState.email.trim() === "" ||
    registrationFormState.password === "";

  return (
    <section>
      <h1>Register</h1>

      <form onSubmit={handleRegistrationSubmit} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
        <label>
          Username
          <input
            value={registrationFormState.username}
            onChange={(e) => handleRegistrationFieldChange("username", e.target.value)}
            type="text"
            placeholder="username"
          />
        </label>

        <label>
          Email
          <input
            value={registrationFormState.email}
            onChange={(e) => handleRegistrationFieldChange("email", e.target.value)}
            type="email"
            placeholder="name@mail.com"
          />
        </label>

        <label>
          Password
          <input
            value={registrationFormState.password}
            onChange={(e) => handleRegistrationFieldChange("password", e.target.value)}
            type="password"
            placeholder="••••••••"
          />
        </label>

        {authErrorMessage ? (
          <p style={{ color: "tomato" }}>
            <strong>{authErrorMessage}</strong>
          </p>
        ) : null}

        <button disabled={shouldDisableRegistrationSubmit} type="submit">
          {isRegistrationSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </section>
  );
}
