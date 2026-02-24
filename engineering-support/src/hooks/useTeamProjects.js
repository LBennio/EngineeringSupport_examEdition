"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteTeamProjectById,
  fetchTeamProjectsVisibleToAdmin,
  updateTeamProjectById
} from "@/lib/teamProjectsService";
import { normalizeErrorToMessage } from "@/lib/normalizeError";

export function useTeamProjects() {
  const [teamProjectsVisibleToAdmin, setTeamProjectsVisibleToAdmin] = useState([]);
  const [isTeamProjectsLoading, setIsTeamProjectsLoading] = useState(false);
  const [teamProjectsErrorMessage, setTeamProjectsErrorMessage] = useState("");

  const reloadTeamProjects = useCallback(async () => {
    setIsTeamProjectsLoading(true);
    setTeamProjectsErrorMessage("");

    try {
      const teamProjectsFromServer = await fetchTeamProjectsVisibleToAdmin();
      setTeamProjectsVisibleToAdmin(teamProjectsFromServer);
    } catch (loadError) {
      const errorMessage = normalizeErrorToMessage(
        loadError,
        "Impossibile caricare i progetti del team."
      );
      setTeamProjectsErrorMessage(errorMessage);
    } finally {
      setIsTeamProjectsLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadTeamProjects();
  }, [reloadTeamProjects]);

  const updateSelectedTeamProject = useCallback(async (projectId, projectUpdatePayload) => {
    setTeamProjectsErrorMessage("");

    try {
      const updatedProject = await updateTeamProjectById(projectId, projectUpdatePayload);

      setTeamProjectsVisibleToAdmin((previousProjects) =>
        previousProjects.map((projectItem) =>
          String(projectItem.id) === String(projectId) ? updatedProject : projectItem
        )
      );

      return { ok: true, errorMessage: "" };
    } catch (updateError) {
      const errorMessage = normalizeErrorToMessage(
        updateError,
        "Aggiornamento progetto team fallito."
      );
      setTeamProjectsErrorMessage(errorMessage);
      return { ok: false, errorMessage };
    }
  }, []);


  const deleteSelectedTeamProject = useCallback(async (projectId) => {
    setTeamProjectsErrorMessage("");

    try {
      await deleteTeamProjectById(projectId);

      setTeamProjectsVisibleToAdmin((previousProjects) =>
        previousProjects.filter((projectItem) => String(projectItem.id) !== String(projectId))
      );

      return { ok: true, errorMessage: "" };
    } catch (deleteError) {
      const errorMessage = normalizeErrorToMessage(
        deleteError,
        "Eliminazione progetto team fallita."
      );
      setTeamProjectsErrorMessage(errorMessage);
      return { ok: false, errorMessage };
    }
  }, []);

  return {
    teamProjectsVisibleToAdmin,
    isTeamProjectsLoading,
    teamProjectsErrorMessage,
    reloadTeamProjects,
    updateSelectedTeamProject,
    deleteSelectedTeamProject
  };
}
