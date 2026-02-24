"use client";

import { useMemo, useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import DownloadPdfButton from "@/components/projects/DownloadPdfButton";
import ProjectComments from "@/components/projects/ProjectComments";
import styles from "./ProjectEditor.module.css";
import { useRouter } from "next/navigation";

export default function ProjectEditor() {
  const router = useRouter();

  const {
    projectsVisibleToUser,
    isProjectsStateLoading,
    projectsErrorMessage,
    canCreateNewProject,
    createNewProject,
    updateExistingProject,
    deleteExistingProject
  } = useProjects();

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectDraftState, setProjectDraftState] = useState({ name: "", description: "" });

  const selectedProject = useMemo(() => {
    return (
      projectsVisibleToUser.find(
        (projectItem) => String(projectItem.id) === String(selectedProjectId)
      ) || null
    );
  }, [projectsVisibleToUser, selectedProjectId]);

  const isEditMode = Boolean(selectedProject);


  const selectedProjectIdAsString = useMemo(() => {
    return selectedProjectId ? String(selectedProjectId) : "";
  }, [selectedProjectId]);


  function handleProjectDraftChange(fieldName, fieldValue) {
    setProjectDraftState((previousDraft) => ({ ...previousDraft, [fieldName]: fieldValue }));
  }

  function handleSelectProject(projectToSelect) {
    setSelectedProjectId(projectToSelect.id);
    setProjectDraftState({
      name: projectToSelect.name || "",
      description: projectToSelect.description || ""
    });
  }

  function handleResetEditor() {
    setSelectedProjectId(null);
    setProjectDraftState({ name: "", description: "" });
  }

  async function handleSaveProject() {
    const projectPayload = {
      name: projectDraftState.name.trim(),
      description: projectDraftState.description.trim()
    };

    if (projectPayload.name === "") return;

    if (!isEditMode) {
      const createResult = await createNewProject(projectPayload);
      if (createResult.ok) handleResetEditor();
      return;
    }

    const updateResult = await updateExistingProject(selectedProjectId, projectPayload);
    if (updateResult.ok) handleResetEditor();
  }


  async function handleDeleteSelectedProject() {
    if (!selectedProjectId) return;
    const deleteResult = await deleteExistingProject(selectedProjectId);
    if (deleteResult.ok) handleResetEditor();
  }

function handleOpenDocumentation() {
  if (!selectedProjectIdAsString) return;
  router.push(`/app-area/projects/${selectedProjectIdAsString}/workspace`);
}

  const shouldDisableSaveButton =
    projectDraftState.name.trim() === "" || (!isEditMode && !canCreateNewProject);

  const isOpenDocumentationDisabled = !isEditMode || selectedProjectIdAsString === "";

  return (
    <section className={styles.wrapper}>
      <div className={styles.panel}>
        <h2 className={styles.panelTitle}>Your projects</h2>

        {isProjectsStateLoading ? <p>Loading projects...</p> : null}

        <ul className={styles.projectList}>
          {projectsVisibleToUser.map((projectItem) => (
            <li key={projectItem.id}>
              <button
                type="button"
                className={styles.projectButton}
                onClick={() => handleSelectProject(projectItem)}
              >
                <strong>{projectItem.name}</strong>
                <div className={styles.meta}>
                  {projectItem.updatedAt ? `Updated: ${projectItem.updatedAt}` : ""}
                </div>
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className={styles.secondaryButton}
          onClick={handleResetEditor}
          style={{ marginTop: 12 }}
        >
          Create new project
        </button>
      </div>

      <div className={styles.panel}>
        <h2 className={styles.panelTitle}>{isEditMode ? "Edit project" : "Create project"}</h2>

        {!canCreateNewProject && !isEditMode ? (
          <div className={styles.alertWarning}>
            Piano Base: limite massimo di progetti raggiunto.
          </div>
        ) : null}

        {projectsErrorMessage ? (
          <div className={styles.alertError}>
            <strong>{projectsErrorMessage}</strong>
          </div>
        ) : null}

        <div className={styles.formGrid}>
          <div className={styles.field}>
            <div className={styles.label}>Project name</div>
            <input
              className={styles.input}
              value={projectDraftState.name}
              onChange={(e) => handleProjectDraftChange("name", e.target.value)}
              placeholder="e.g. Engineering Support v1"
            />
          </div>

          <div className={styles.field}>
            <div className={styles.label}>Description</div>
            <textarea
              className={styles.textarea}
              value={projectDraftState.description}
              onChange={(e) => handleProjectDraftChange("description", e.target.value)}
              placeholder="What is this project about?"
              rows={5}
            />
          </div>

          <div className={styles.buttonRow}>
            <button
              type="button"
              className={styles.primaryButton}
              disabled={shouldDisableSaveButton}
              onClick={handleSaveProject}
            >
              {isEditMode ? "Save changes" : "Create project"}
            </button>

            {isEditMode ? (
              <button
                type="button"
                className={styles.dangerButton}
                onClick={handleDeleteSelectedProject}
              >
                Delete project
              </button>
            ) : null}

            {isEditMode ? (
              <button
                type="button"
                className={styles.secondaryButton}
                disabled={isOpenDocumentationDisabled}
                onClick={handleOpenDocumentation}
              >
                Open documentation
              </button>
            ) : null}
          </div>

          {isEditMode ? (
            <>
              <DownloadPdfButton
                projectId={selectedProjectId}
                projectName={projectDraftState.name || "project"}
              />
              <ProjectComments projectId={selectedProjectId} />
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
