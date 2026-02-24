import { apiRequest } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { buildServiceError } from "@/lib/serviceError";
export async function fetchTeamProjectsVisibleToAdmin() {
  const apiResult = await apiRequest(ENDPOINTS.TEAM_PROJECTS.LIST, { method: "GET" });

  if (!apiResult.ok) {
    throw buildServiceError(apiResult.error, "Impossibile caricare i progetti del team.");
  }

  return apiResult.data;
}

export async function updateTeamProjectById(projectId, projectUpdatePayload) {
  const apiResult = await apiRequest(ENDPOINTS.TEAM_PROJECTS.UPDATE_DELETE(projectId), {
    method: "PUT",
    body: JSON.stringify(projectUpdatePayload)
  });

  if (!apiResult.ok) {
    throw buildServiceError(apiResult.error, "Aggiornamento progetto team fallito.");
  }

  return apiResult.data;
}

export async function deleteTeamProjectById(projectId) {
  const apiResult = await apiRequest(ENDPOINTS.TEAM_PROJECTS.UPDATE_DELETE(projectId), {
    method: "DELETE"
  });

  if (!apiResult.ok) {
    throw buildServiceError(apiResult.error, "Eliminazione progetto team fallita.");
  }

  return apiResult.data;
}
