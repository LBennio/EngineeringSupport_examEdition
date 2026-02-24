import { apiRequest } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import { buildServiceError } from "@/lib/serviceError";


export async function fetchTeamDetailsForAuthenticatedAdmin() {
  const apiResult = await apiRequest(ENDPOINTS.TEAM.GET_MY_TEAM, { method: "GET" });

  if (!apiResult.ok) {
    throw buildServiceError(apiResult.error, "Impossibile caricare i dettagli del team.");
  }

  return apiResult.data;
}

export async function createTeamForAuthenticatedAdmin(teamCreationPayload) {
  const apiResult = await apiRequest(ENDPOINTS.TEAM.CREATE_TEAM, {
    method: "POST",
    body: JSON.stringify(teamCreationPayload)
  });

  if (!apiResult.ok) {
    throw buildServiceError(apiResult.error, "Creazione team fallita.");
  }

  return apiResult.data;
}

export async function fetchTeamMembersList() {
  const apiResult = await apiRequest(ENDPOINTS.TEAM.LIST_MEMBERS, { method: "GET" });

  if (!apiResult.ok) {
    throw buildServiceError(apiResult.error, "Impossibile caricare la lista membri del team.");
  }

  return apiResult.data;
}

export async function addMemberToTeamByEmailOrUsername(memberIdentifierPayload) {
  const apiResult = await apiRequest(ENDPOINTS.TEAM.ADD_MEMBER, {
    method: "POST",
    body: JSON.stringify(memberIdentifierPayload)
  });

  if (!apiResult.ok) {
    throw buildServiceError(apiResult.error, "Invito membro fallito.");
  }

  return apiResult.data;
}

export async function removeMemberFromTeamByUserId(memberUserId) {
  const apiResult = await apiRequest(ENDPOINTS.TEAM.REMOVE_MEMBER(memberUserId), {
    method: "DELETE"
  });

  if (!apiResult.ok) {
    throw buildServiceError(apiResult.error, "Rimozione membro fallita.");
  }

  return apiResult.data;
}
