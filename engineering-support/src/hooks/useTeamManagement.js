"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addMemberToTeamByEmailOrUsername,
  createTeamForAuthenticatedAdmin,
  fetchTeamDetailsForAuthenticatedAdmin,
  fetchTeamMembersList,
  removeMemberFromTeamByUserId
} from "@/lib/teamService";
import { normalizeErrorToMessage } from "@/lib/normalizeError";


export function useTeamManagement() {
  const [teamDetails, setTeamDetails] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  const [isTeamDataLoading, setIsTeamDataLoading] = useState(false);
  const [teamManagementErrorMessage, setTeamManagementErrorMessage] = useState("");

  const hasTeamAlready = useMemo(() => Boolean(teamDetails?.id), [teamDetails]);

  const loadTeamData = useCallback(async () => {
    setIsTeamDataLoading(true);
    setTeamManagementErrorMessage("");

    try {
      const teamDetailsFromServer = await fetchTeamDetailsForAuthenticatedAdmin();
      setTeamDetails(teamDetailsFromServer);

      const membersFromServer = await fetchTeamMembersList();
      setTeamMembers(membersFromServer);
    } catch (loadError) {
      const errorMessage = normalizeErrorToMessage(loadError, "Impossibile caricare i dati del team.");
      setTeamManagementErrorMessage(errorMessage);
    } finally {
      setIsTeamDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);


  const createTeam = useCallback(async (teamName) => {
    setTeamManagementErrorMessage("");

    try {
      const teamCreationPayload = { teamName: teamName.trim() };
      const createdTeamDetails = await createTeamForAuthenticatedAdmin(teamCreationPayload);

      setTeamDetails(createdTeamDetails);

      const membersFromServer = await fetchTeamMembersList();
      setTeamMembers(membersFromServer);

      return { ok: true, errorMessage: "" };
    } catch (createError) {
      const errorMessage = normalizeErrorToMessage(createError, "Creazione team fallita.");
      setTeamManagementErrorMessage(errorMessage);
      return { ok: false, errorMessage };
    }
  }, []);

  const inviteMemberToTeam = useCallback(async (emailOrUsername) => {
    setTeamManagementErrorMessage("");

    try {
      const memberIdentifierPayload = { emailOrUsername: emailOrUsername.trim() };
      await addMemberToTeamByEmailOrUsername(memberIdentifierPayload);

      const membersFromServer = await fetchTeamMembersList();
      setTeamMembers(membersFromServer);

      return { ok: true, errorMessage: "" };
    } catch (inviteError) {
      const errorMessage = normalizeErrorToMessage(inviteError, "Invito membro fallito.");
      setTeamManagementErrorMessage(errorMessage);
      return { ok: false, errorMessage };
    }
  }, []);


  const removeMemberFromTeam = useCallback(async (memberUserId) => {
    setTeamManagementErrorMessage("");

    try {
      await removeMemberFromTeamByUserId(memberUserId);

      setTeamMembers((previousMembers) =>
        previousMembers.filter((member) => member.id !== memberUserId)
      );

      return { ok: true, errorMessage: "" };
    } catch (removeError) {
      const errorMessage = normalizeErrorToMessage(removeError, "Rimozione membro fallita.");
      setTeamManagementErrorMessage(errorMessage);
      return { ok: false, errorMessage };
    }
  }, []);

  return {
    teamDetails,
    teamMembers,
    hasTeamAlready,
    isTeamDataLoading,
    teamManagementErrorMessage,
    loadTeamData,
    createTeam,
    inviteMemberToTeam,
    removeMemberFromTeam
  };
}
