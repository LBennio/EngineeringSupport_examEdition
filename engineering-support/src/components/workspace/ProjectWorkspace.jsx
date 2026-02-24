"use client";

import { useMemo } from "react";
import { useProjectDocumentation } from "@/hooks/useProjectDocumentation";
import DocumentationOutline from "@/components/workspace/DocumentationOutline";
import DocumentationPanelHost from "@/components/workspace/DocumentationPanelHost";
import styles from "./ProjectWorkspace.module.css";

export default function ProjectWorkspace({ projectId }) {
  const docController = useProjectDocumentation(projectId);

  function handleSaveClick() {
    const saveResult = docController.saveDocumentationToStorage();
    if (!saveResult.ok) {
      window.alert(saveResult.errorMessage);
      return;
    }
    window.alert("Salvataggio completato.");
  }

  const rightHeaderTitle = useMemo(() => {
    return `Project workspace • Project ID: ${String(projectId || "")}`;
  }, [projectId]);

  return (
    <div className={styles.workspace}>
      <aside className={styles.leftColumn}>
        <div className={styles.outlineHeader}>
          <div className={styles.outlineTitle}>Documentation</div>
          <div className={styles.outlineSubtitle}>Scaletta completa (cliccabile)</div>
        </div>
<DocumentationOutline
  outlineTree={docController.outlineTree}
  selectedNodeId={docController.selectedNodeId}
  adminCommentsByNodeId={docController.documentData?.adminCommentsByNodeId || {}}
  onSelectNode={docController.selectNode}
/>

      </aside>

      <main className={styles.rightColumn}>
        <div className={styles.rightHeader}>
          <div>
            <div className={styles.rightTitle}>{rightHeaderTitle}</div>
            <div className={styles.rightSubtitle}>
              Compilazione guidata con salvataggio e navigazione sequenziale.
            </div>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.secondaryButton} onClick={handleSaveClick} type="button">
              Save (global)
            </button>

            <button className={styles.primaryButton} onClick={docController.goToNextNode} type="button">
              Next section
            </button>
          </div>
        </div>

        {docController.documentErrorMessage ? (
          <div className={styles.errorBox}>
            <strong>{docController.documentErrorMessage}</strong>
          </div>
        ) : null}

          {docController.isDocumentLoading ? (
            <div className={styles.loadingBox}>Loading documentation workspace...</div>
          ) : null}

          <DocumentationPanelHost docController={docController} />
      </main>
    </div>
  );
}
