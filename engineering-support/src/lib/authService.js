import { apiRequest } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function buildServiceError(errorObject, fallbackMessage) {
  const message =
    (errorObject?.message && String(errorObject.message).trim() !== "")
      ? String(errorObject.message).trim()
      : fallbackMessage;

  const serviceError = new Error(message);

  serviceError.status = typeof errorObject?.status === "number" ? errorObject.status : 0;
  serviceError.type = typeof errorObject?.type === "string" ? errorObject.type : "unknown";

  return serviceError;
}

export async function performUserRegistration(registrationPayload) {
  const { ok, data, error } = await apiRequest(ENDPOINTS.AUTH.REGISTER, {
    method: "POST",
    body: JSON.stringify(registrationPayload)
  });

  if (!ok) {
    throw buildServiceError(error, "Registrazione fallita.");
  }

  return data;
}

export async function performEmailPasswordLogin(loginCredentials) {
  const { ok, data, error } = await apiRequest(ENDPOINTS.AUTH.LOGIN, {
    method: "POST",
    body: JSON.stringify(loginCredentials)
  });

  if (!ok) {
    throw buildServiceError(error, "Login fallito.");
  }

  return data;
}

export async function fetchAuthenticatedUserProfile() {
  const { ok, data, error } = await apiRequest(ENDPOINTS.AUTH.ME, {
    method: "GET"
  });

  if (!ok) {
    // Qui è fondamentale preservare status: 401/403 => sessione non valida
    throw buildServiceError(error, "Impossibile verificare la sessione.");
  }

  return data;
}


export async function performLogoutRequest() {
  const { ok, data, error } = await apiRequest(ENDPOINTS.AUTH.LOGOUT, {
    method: "POST"
  });

  if (!ok) {
    throw buildServiceError(error, "Logout fallito.");
  }

  return data;
}


export function startOAuthLoginRedirect(providerName) {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL non configurato: impossibile avviare OAuth.");
  }

  const oauthStartUrl = `${API_BASE_URL}${ENDPOINTS.AUTH.OAUTH_START}?provider=${encodeURIComponent(
    providerName
  )}`;

  window.location.href = oauthStartUrl;
}
