
import { apiRequest } from "@/lib/api";

const ACCOUNT_ENDPOINTS = {
  UPDATE_PLAN: "/account/plan",
  UPDATE_EMAIL: "/account/email",
  UPDATE_PASSWORD: "/account/password"
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


function isBackendConfigured() {
  return Boolean(API_BASE_URL && String(API_BASE_URL).trim() !== "");
}


export async function requestPlanChange(planChangePayload) {
  if (!isBackendConfigured()) {
    return { ok: true, data: { offline: true } };
  }

  const { ok, data, error } = await apiRequest(ACCOUNT_ENDPOINTS.UPDATE_PLAN, {
    method: "PUT",
    body: JSON.stringify(planChangePayload)
  });

  if (!ok) throw new Error(error.message);
  return { ok: true, data };
}

export async function requestEmailChange(emailChangePayload) {
  if (!isBackendConfigured()) {
    return { ok: true, data: { offline: true } };
  }

  const { ok, data, error } = await apiRequest(ACCOUNT_ENDPOINTS.UPDATE_EMAIL, {
    method: "PUT",
    body: JSON.stringify(emailChangePayload)
  });

  if (!ok) throw new Error(error.message);
  return { ok: true, data };
}


export async function requestPasswordChange(passwordChangePayload) {
  if (!isBackendConfigured()) {
    return { ok: true, data: { offline: true } };
  }

  const { ok, data, error } = await apiRequest(ACCOUNT_ENDPOINTS.UPDATE_PASSWORD, {
    method: "PUT",
    body: JSON.stringify(passwordChangePayload)
  });

  if (!ok) throw new Error(error.message);
  return { ok: true, data };
}
