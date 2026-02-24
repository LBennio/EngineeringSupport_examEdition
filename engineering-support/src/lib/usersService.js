import { apiRequest } from "@/lib/api";

import { ENDPOINTS } from "@/lib/endpoints";

export async function fetchRegisteredUsersList() {
  const { ok, data, error } = await apiRequest(ENDPOINTS.USERS.LIST, {
    method: "GET"
  });

  if (!ok) {
    throw new Error(error.message);
  }

  return data;
}
