"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  createProjectForAuthenticatedUser,
  deleteProjectById,
  fetchProjectsForAuthenticatedUser,
  updateProjectById
} from "@/lib/projectsService";
import {
  canCreateAnotherPersonalProject,
  getMaxProjectsAllowedForPlan
} from "@/lib/accessPolicy";
import { normalizeErrorToMessage } from "@/lib/normalizeError";


export function useProjects() {
  const { authenticatedUserProfile, isAuthenticated } = useAuth();

  const [projectsVisibleToUser, setProjectsVisibleToUser] = useState([]);
  const [isProjectsStateLoading, setIsProjectsStateLoading] = useState(false);
  const [projectsErrorMessage, setProjectsErrorMessage] = useState("");

  const authenticatedUserRole = authenticatedUserProfile?.role || "guest";
  const authenticatedUserPlan = authenticatedUserProfile?.plan || "base";

  const canCreateNewProject = useMemo(() => {
    if (!isAuthenticated) return false;

    const currentProjectsCount = projectsVisibleToUser.length;
    return canCreateAnotherPersonalProject(authenticatedUserProfile, currentProjectsCount);
  }, [isAuthenticated, authenticatedUserProfile, projectsVisibleToUser.length]);

  const loadProjectsVisibleToAuthenticatedUser = useCallback(async () => {
    if (!isAuthenticated) {
      setProjectsVisibleToUser([]);
      setProjectsErrorMessage("");
      return;
    }

    setIsProjectsStateLoading(true);
    setProjectsErrorMessage("");

    try {
      const projectsFromServer = await fetchProjectsForAuthenticatedUser();
      setProjectsVisibleToUser(projectsFromServer);
    } catch (projectsLoadError) {
      const errorMessage = normalizeErrorToMessage(projectsLoadError, "Impossibile caricare i progetti.");
      setProjectsErrorMessage(errorMessage);
    } finally {
      setIsProjectsStateLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadProjectsVisibleToAuthenticatedUser();
  }, [loadProjectsVisibleToAuthenticatedUser]);

  const createNewProject = useCallback(
    async (projectDraft) => {
      setProjectsErrorMessage("");

      if (!canCreateNewProject) {
        const maxAllowedProjects = getMaxProjectsAllowedForPlan(authenticatedUserProfile);
        const maxAllowedProjectsLabel =
          maxAllowedProjects === Infinity ? "Unlimited" : String(maxAllowedProjects);

        const errorMessage = `Limite piano raggiunto: massimo ${maxAllowedProjectsLabel} progetti.`;
        setProjectsErrorMessage(errorMessage);
        return { ok: false, errorMessage };
      }

      try {
        const createdProject = await createProjectForAuthenticatedUser(projectDraft);
        setProjectsVisibleToUser((previousProjects) => [createdProject, ...previousProjects]);
        return { ok: true, errorMessage: "" };
      } catch (createError) {
        const errorMessage = normalizeErrorToMessage(createError, "Creazione progetto fallita.");
        setProjectsErrorMessage(errorMessage);
        return { ok: false, errorMessage };
      }
    },
    [canCreateNewProject, authenticatedUserProfile]
  );


  const updateExistingProject = useCallback(async (projectId, projectUpdatePayload) => {
    setProjectsErrorMessage("");

    try {
      const updatedProject = await updateProjectById(projectId, projectUpdatePayload);

      setProjectsVisibleToUser((previousProjects) =>
        previousProjects.map((projectItem) =>
          String(projectItem.id) === String(projectId) ? updatedProject : projectItem
        )
      );

      return { ok: true, errorMessage: "" };
    } catch (updateError) {
      const errorMessage = normalizeErrorToMessage(updateError, "Aggiornamento progetto fallito.");
      setProjectsErrorMessage(errorMessage);
      return { ok: false, errorMessage };
    }
  }, []);

  const deleteExistingProject = useCallback(async (projectId) => {
    setProjectsErrorMessage("");

    try {
      await deleteProjectById(projectId);

      setProjectsVisibleToUser((previousProjects) =>
        previousProjects.filter((projectItem) => String(projectItem.id) !== String(projectId))
      );

      return { ok: true, errorMessage: "" };
    } catch (deleteError) {
      const errorMessage = normalizeErrorToMessage(deleteError, "Eliminazione progetto fallita.");
      setProjectsErrorMessage(errorMessage);
      return { ok: false, errorMessage };
    }
  }, []);

  return {
    projectsVisibleToUser,
    isProjectsStateLoading,
    projectsErrorMessage,
    authenticatedUserRole,
    authenticatedUserPlan,
    canCreateNewProject,
    loadProjectsVisibleToAuthenticatedUser,
    createNewProject,
    updateExistingProject,
    deleteExistingProject
  };
}
