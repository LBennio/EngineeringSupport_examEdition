"use client";

import { useMemo, useState } from "react";
import PngImageField from "@/components/editors/PngImageField";
import styles from "./PanelCommon.module.css";
import elements from "./PanelElements.module.css";
import { generateClientId } from "@/lib/documentationUtils";

function buildNewDiagram(nodeMeta) {
  const diagramKind = String(nodeMeta?.diagramKind || "Diagram");
  return {
    id: generateClientId("diagram"),
    title: `${diagramKind} title`,
    pngDataUrl: ""
  };
}

export default function DiagramsListPanel({
  nodeId,
  nodeTitle,
  nodeMeta,
  documentData,
  addItemToNodeList,
  updateItemInNodeList,
  deleteItemFromNodeList,
  onSave,
  onNext
}) {
  const fallbackNodeState = { diagrams: [] };
  const nodeState = documentData.nodes?.[nodeId] || fallbackNodeState;
  const diagramsList = Array.isArray(nodeState.diagrams) ? nodeState.diagrams : [];

  const [selectedDiagramId, setSelectedDiagramId] = useState(null);
  const [draftDiagramState, setDraftDiagramState] = useState(null);

  const selectedDiagram = useMemo(() => {
    return diagramsList.find((d) => String(d.id) === String(selectedDiagramId)) || null;
  }, [diagramsList, selectedDiagramId]);

  function handleSelectDiagram(diagramToSelect) {
    setSelectedDiagramId(diagramToSelect.id);
    setDraftDiagramState({ ...diagramToSelect });
  }

  function handleAddNewDiagram() {
    const newDiagram = buildNewDiagram(nodeMeta);
    addItemToNodeList(nodeId, "diagrams", newDiagram, fallbackNodeState);
    handleSelectDiagram(newDiagram);
  }

  function handleDeleteSelectedDiagram() {
    if (!selectedDiagramId) return;
    deleteItemFromNodeList(nodeId, "diagrams", selectedDiagramId, fallbackNodeState);
    setSelectedDiagramId(null);
    setDraftDiagramState(null);
  }

  function handleDraftFieldChange(fieldName, fieldValue) {
    setDraftDiagramState((prev) => ({ ...(prev || {}), [fieldName]: fieldValue }));
  }

  function applyDraftChanges() {
    if (!draftDiagramState || !selectedDiagramId) return;

    const payloadToCommit = {
      ...draftDiagramState,
      title: String(draftDiagramState.title || "").trim()
    };

    updateItemInNodeList(nodeId, "diagrams", selectedDiagramId, payloadToCommit, fallbackNodeState);
  }

  function handleSaveClick() {
    applyDraftChanges();
    const saveResult = onSave();
    if (!saveResult.ok) window.alert(saveResult.errorMessage);
  }

  function handleNextClick() {
    applyDraftChanges();
    onNext();
  }

  const isEditorVisible = Boolean(draftDiagramState);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>{nodeTitle}</h2>
        <div className={styles.panelSubtitle}>
          Gestione diagrammi PNG: aggiunta, modifica, eliminazione.
        </div>
      </div>

      <div className={elements.split}>
        <div className={elements.card}>
          <button className={styles.primaryButton} type="button" onClick={handleAddNewDiagram}>
            Add new diagram
          </button>

          <div className={styles.label} style={{ marginTop: 10 }}>
            Diagrams list
          </div>

          {diagramsList.length === 0 ? (
            <div className={styles.muted}>Nessun diagramma inserito.</div>
          ) : (
            <div className={elements.list}>
              {diagramsList.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleSelectDiagram(d)}
                  className={`${elements.listButton} ${
                    String(d.id) === String(selectedDiagramId) ? elements.listButtonActive : ""
                  }`}
                >
                  {d.title || "Untitled diagram"}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={elements.card}>
          {!isEditorVisible ? (
            <div className={styles.muted}>Seleziona un diagramma per modificarlo.</div>
          ) : (
            <div className={elements.fieldGrid}>
              <div className={styles.label}>Titolo</div>
              <input
                className={elements.input}
                value={draftDiagramState.title}
                onChange={(e) => handleDraftFieldChange("title", e.target.value)}
                placeholder="Titolo diagramma"
              />

              <div className={styles.label}>Upload PNG</div>
              <PngImageField
                valueDataUrl={draftDiagramState.pngDataUrl}
                onChangeDataUrl={(dataUrl) => handleDraftFieldChange("pngDataUrl", dataUrl)}
              />

              <div className={elements.smallRow}>
                <button className={styles.secondaryButton} type="button" onClick={applyDraftChanges}>
                  Apply changes
                </button>

                <button className={styles.dangerButton} type="button" onClick={handleDeleteSelectedDiagram}>
                  Delete diagram
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.actionsRow}>
        <button className={styles.primaryButton} type="button" onClick={handleSaveClick}>
          Save
        </button>
        <button className={styles.primaryButton} type="button" onClick={handleNextClick}>
          Next section
        </button>
      </div>
    </div>
  );
}
