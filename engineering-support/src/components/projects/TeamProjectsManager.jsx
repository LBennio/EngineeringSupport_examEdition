"use client";

import { useMemo, useState } from "react";
import { useTeamProjects } from "@/hooks/useTeamProjects";
import LoadingState from "@/components/common/LoadingState";
import ErrorBanner from "@/components/common/ErrorBanner";
import EmptyState from "@/components/common/EmptyState";
import DownloadPdfButton from "@/components/projects/DownloadPdfButton";
import ProjectComments from "@/components/projects/ProjectComments";
import styles from "./TeamProjectsManager.module.css";

export default function TeamProjectsManager() {
  const {
    teamProjectsVisibleToAdmin,
    isTeamProjectsLoading,
    teamProjectsErrorMessage,
    updateSelectedTeamProject,
    deleteSelectedTeamProject,
    reloadTeamProjects
  } = useTeamProjects();

  const [selectedTeamProjectId, setSelectedTeamProjectId] = useState(null);

  const selectedTeamProject = useMemo(() => {
    return (
      teamProjectsVisibleToAdmin.find(
        (projectItem) => String(projectItem.id) === String(selectedTeamProjectId)
      ) || null
    );
  }, [teamProjectsVisibleToAdmin, selectedTeamProjectId]);

  const [teamProjectDraftState, setTeamProjectDraftState] = useState({
    name: "",
    description: ""
  });

  const isEditMode = Boolean(selectedTeamProject);


  function handleSelectTeamProject(projectToSelect) {
    if (isTeamProjectsLoading) return;

    setSelectedTeamProjectId(projectToSelect.id);
    setTeamProjectDraftState({
      name: projectToSelect.name || "",
      description: projectToSelect.description || ""
    });
  }

  function handleResetTeamProjectEditor() {
    setSelectedTeamProjectId(null);
    setTeamProjectDraftState({ name: "", description: "" });
  }

  
  function handleTeamProjectDraftChange(fieldName, fieldValue) {
    setTeamProjectDraftState((previousDraft) => ({
      ...previousDraft,
      [fieldName]: fieldValue
    }));
  }


  async function handleSaveTeamProjectChanges() {
    if (!selectedTeamProjectId) return;

    const updatePayload = {
      name: teamProjectDraftState.name.trim(),
      description: teamProjectDraftState.description.trim()
    };

    if (updatePayload.name === "") return;

    const updateResult = await updateSelectedTeamProject(selectedTeamProjectId, updatePayload);
    if (updateResult.ok) handleResetTeamProjectEditor();
  }

  async function handleDeleteTeamProject() {
    if (!selectedTeamProjectId) return;

    const deleteResult = await deleteSelectedTeamProject(selectedTeamProjectId);
    if (deleteResult.ok) handleResetTeamProjectEditor();
  }

  const shouldDisableSaveButton = !isEditMode || teamProjectDraftState.name.trim() === "";
  const shouldDisableEditorActions = isTeamProjectsLoading;

  const isTeamProjectsListEmpty =
    !isTeamProjectsLoading && teamProjectsVisibleToAdmin.length === 0;

  return (
    <section className={styles.wrapper}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Team projects</h2>
          <button
            className={styles.secondaryButton}
            onClick={reloadTeamProjects}
            type="button"
            disabled={isTeamProjectsLoading}
          >
            Refresh
          </button>
        </div>

        <ErrorBanner
          title="Team projects error"
          message={teamProjectsErrorMessage}
          onRetry={reloadTeamProjects}
        />

        {isTeamProjectsLoading ? (
          <LoadingState
            title="Loading team projects..."
            description="Retrieving projects visible to admin."
          />
        ) : null}

        {isTeamProjectsListEmpty ? (
          <EmptyState
            title="No team projects"
            description="When team members create projects, they will appear here."
          />
        ) : null}

        {teamProjectsVisibleToAdmin.length > 0 ? (
          <ul className={styles.projectList}>
            {teamProjectsVisibleToAdmin.map((projectItem) => (
              <li key={projectItem.id}>
                <button
                  className={styles.projectButton}
                  onClick={() => handleSelectTeamProject(projectItem)}
                  type="button"
                  disabled={isTeamProjectsLoading}
                >
                  <strong>{projectItem.name}</strong>
                  <div className={styles.meta}>
                    Owner: {projectItem.ownerUsername} • {projectItem.ownerEmail}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className={styles.panel}>
        <h2 className={styles.panelTitle}>Project editor (admin)</h2>

        {!isEditMode ? (
          <p className={styles.muted}>
            Seleziona un progetto dalla lista per modificarlo o eliminarlo.
          </p>
        ) : null}

        {isEditMode ? (
          <>
            <div className={styles.ownerCard}>
              <div>
                <strong>Owner username:</strong> {selectedTeamProject.ownerUsername}
              </div>
              <div>
                <strong>Owner email:</strong> {selectedTeamProject.ownerEmail}
              </div>
              <div>
                <strong>Owner userId:</strong> {selectedTeamProject.ownerUserId}
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <div className={styles.label}>Project name</div>
                <input
                  className={styles.input}
                  value={teamProjectDraftState.name}
                  onChange={(e) => handleTeamProjectDraftChange("name", e.target.value)}
                  disabled={shouldDisableEditorActions}
                />
              </div>

              <div className={styles.field}>
                <div className={styles.label}>Description</div>
                <textarea
                  className={styles.textarea}
                  value={teamProjectDraftState.description}
                  onChange={(e) => handleTeamProjectDraftChange("description", e.target.value)}
                  rows={5}
                  disabled={shouldDisableEditorActions}
                />
              </div>

              <div className={styles.buttonRow}>
                <button
                  className={styles.primaryButton}
                  disabled={shouldDisableSaveButton || shouldDisableEditorActions}
                  onClick={handleSaveTeamProjectChanges}
                  type="button"
                >
                  Save changes
                </button>

                <button
                  className={styles.dangerButton}
                  disabled={shouldDisableEditorActions}
                  onClick={handleDeleteTeamProject}
                  type="button"
                >
                  Delete project
                </button>

                <button
                  className={styles.secondaryButton}
                  disabled={shouldDisableEditorActions}
                  onClick={handleResetTeamProjectEditor}
                  type="button"
                >
                  Close editor
                </button>
              </div>

              <DownloadPdfButton
                projectId={selectedTeamProjectId}
                projectName={teamProjectDraftState.name || "team-project"}
              />
              <ProjectComments projectId={selectedTeamProjectId} />
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
