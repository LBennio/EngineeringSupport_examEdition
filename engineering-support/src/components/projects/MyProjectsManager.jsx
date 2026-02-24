"use client";

import { useMemo, useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import DownloadPdfButton from "@/components/projects/DownloadPdfButton";
import ProjectComments from "@/components/projects/ProjectComments";
import styles from "./MyProjectsManager.module.css";

export default function MyProjectsManager() {
  const {
    projectsVisibleToUser,
    isProjectsStateLoading,
    projectsErrorMessage,
    canCreateNewProject,
    authenticatedUserPlan,
    loadProjectsVisibleToAuthenticatedUser,
    createNewProject,
    updateExistingProject,
    deleteExistingProject
  } = useProjects();

  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const selectedProject = useMemo(() => {
    return (
      projectsVisibleToUser.find(
        (projectItem) => String(projectItem.id) === String(selectedProjectId)
      ) || null
    );
  }, [projectsVisibleToUser, selectedProjectId]);

  const isEditMode = Boolean(selectedProject);

  const [projectDraftState, setProjectDraftState] = useState({
    name: "",
    description: ""
  });

  function handleSelectProject(projectToSelect) {
    setSelectedProjectId(projectToSelect.id);
    setProjectDraftState({
      name: projectToSelect.name || "",
      description: projectToSelect.description || ""
    });
  }

  function resetEditorToCreateMode() {
    setSelectedProjectId(null);
    setProjectDraftState({ name: "", description: "" });
  }

  function handleDraftChange(fieldName, fieldValue) {
    setProjectDraftState((previousDraftState) => ({
      ...previousDraftState,
      [fieldName]: fieldValue
    }));
  }

  async function handleCreateProject() {
    const createPayload = {
      name: projectDraftState.name.trim(),
      description: projectDraftState.description.trim()
    };

    if (createPayload.name === "") return;

    const createResult = await createNewProject(createPayload);
    if (createResult.ok) {
      setProjectDraftState({ name: "", description: "" });
    }
  }

  async function handleSaveProjectChanges() {
    if (!selectedProjectId) return;

    const updatePayload = {
      name: projectDraftState.name.trim(),
      description: projectDraftState.description.trim()
    };

    if (updatePayload.name === "") return;

    const updateResult = await updateExistingProject(selectedProjectId, updatePayload);
    if (updateResult.ok) {
      resetEditorToCreateMode();
    }
  }

  async function handleDeleteProject() {
    if (!selectedProjectId) return;

    const userConfirmedDeletion = window.confirm(
      "Confermi eliminazione del progetto? Questa azione è irreversibile."
    );
    if (!userConfirmedDeletion) return;

    const deleteResult = await deleteExistingProject(selectedProjectId);
    if (deleteResult.ok) {
      resetEditorToCreateMode();
    }
  }

  const shouldDisableCreateButton =
    !canCreateNewProject || projectDraftState.name.trim() === "" || isProjectsStateLoading;

  const shouldDisableSaveButton =
    !isEditMode || projectDraftState.name.trim() === "" || isProjectsStateLoading;

  return (
    <section className={styles.wrapper}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>My projects</h2>
            <div className={styles.panelSubtitle}>
              Piano attuale: <strong>{authenticatedUserPlan}</strong>
            </div>
          </div>

          <button
            className={styles.secondaryButton}
            onClick={loadProjectsVisibleToAuthenticatedUser}
            type="button"
          >
            Refresh
          </button>
        </div>

        {isProjectsStateLoading ? (
          <p className={styles.muted}>Loading projects...</p>
        ) : null}

        {projectsErrorMessage ? (
          <div className={styles.alertError}>
            <strong>{projectsErrorMessage}</strong>
          </div>
        ) : null}

        {projectsVisibleToUser.length === 0 && !isProjectsStateLoading ? (
          <p className={styles.muted}>Nessun progetto trovato. Creane uno a destra.</p>
        ) : null}

        <ul className={styles.projectList}>
          {projectsVisibleToUser.map((projectItem) => {
            const isProjectSelected = String(projectItem.id) === String(selectedProjectId);

            return (
              <li key={projectItem.id}>
                <button
                  className={`${styles.projectButton} ${isProjectSelected ? styles.projectButtonActive : ""}`}
                  onClick={() => handleSelectProject(projectItem)}
                  type="button"
                >
                  <strong>{projectItem.name}</strong>
                  <div className={styles.meta}>
                    ID: {projectItem.id}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>
            {isEditMode ? "Project editor" : "Create a new project"}
          </h2>

          {isEditMode ? (
            <button className={styles.secondaryButton} onClick={resetEditorToCreateMode} type="button">
              Close editor
            </button>
          ) : null}
        </div>

        {!canCreateNewProject && !isEditMode ? (
          <div className={styles.alertWarning}>
            <strong>Limite del piano raggiunto.</strong>
            <div className={styles.smallText}>
              Con il piano base puoi creare massimo 1 progetto. Passa a premium per crearne di più.
            </div>
          </div>
        ) : null}

        <div className={styles.formGrid}>
          <div className={styles.field}>
            <div className={styles.label}>Project name</div>
            <input
              className={styles.input}
              value={projectDraftState.name}
              onChange={(e) => handleDraftChange("name", e.target.value)}
              placeholder="e.g. Engineering Support - Demo"
            />
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Description</div>
            <textarea
              className={styles.textarea}
              value={projectDraftState.description}
              onChange={(e) => handleDraftChange("description", e.target.value)}
              rows={6}
              placeholder="Descrizione breve: obiettivo, ambito, note..."
            />
          </div>

          <div className={styles.buttonRow}>
            {!isEditMode ? (
              <button
                className={styles.primaryButton}
                disabled={shouldDisableCreateButton}
                onClick={handleCreateProject}
                type="button"
              >
                Create project
              </button>
            ) : (
              <>
                <button
                  className={styles.primaryButton}
                  disabled={shouldDisableSaveButton}
                  onClick={handleSaveProjectChanges}
                  type="button"
                >
                  Save changes
                </button>

                <button
                  className={styles.dangerButton}
                  onClick={handleDeleteProject}
                  type="button"
                >
                  Delete project
                </button>
              </>
            )}
          </div>

          {isEditMode ? (
            <div className={styles.integrationsBlock}>
              <div className={styles.integrationsTitle}>Exports & collaboration</div>

              <DownloadPdfButton
                projectId={selectedProjectId}
                projectName={projectDraftState.name || "project"}
              />

              <ProjectComments projectId={selectedProjectId} />
            </div>
          ) : (
            <div className={styles.muted}>
              Seleziona un progetto dalla lista per vedere <strong>PDF export</strong> e <strong>commenti</strong>.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
