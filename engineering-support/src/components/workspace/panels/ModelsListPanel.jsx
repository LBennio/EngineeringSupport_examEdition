"use client";

import { useMemo, useState } from "react";
import RichTextEditor from "@/components/editors/RichTextEditor";
import PngImageField from "@/components/editors/PngImageField";
import styles from "./PanelCommon.module.css";
import elements from "./PanelElements.module.css";
import { generateClientId } from "@/lib/documentationUtils";

function buildNewModelEntry(nodeMeta) {
  const diagramKind = nodeMeta?.diagramKind ? String(nodeMeta.diagramKind) : null;

  return {
    id: generateClientId("model"),
    title: diagramKind ? `${diagramKind} title` : "",
    shortDescriptionHtml: diagramKind ? "" : "",
    pngDataUrl: ""
  };
}

export default function ModelsListPanel({
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
  const fallbackNodeState = { entries: [] };
  const nodeState = documentData.nodes?.[nodeId] || fallbackNodeState;
  const entriesList = Array.isArray(nodeState.entries) ? nodeState.entries : [];

  const isDiagramMode = Boolean(nodeMeta?.diagramKind);

  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [draftEntryState, setDraftEntryState] = useState(null);

  const selectedEntry = useMemo(() => {
    return entriesList.find((e) => String(e.id) === String(selectedEntryId)) || null;
  }, [entriesList, selectedEntryId]);

  function handleSelectEntry(entryToSelect) {
    setSelectedEntryId(entryToSelect.id);
    setDraftEntryState({ ...entryToSelect });
  }

  function handleAddNewEntry() {
    const newEntry = buildNewModelEntry(nodeMeta);
    addItemToNodeList(nodeId, "entries", newEntry, fallbackNodeState);
    handleSelectEntry(newEntry);
  }

  function handleDeleteSelectedEntry() {
    if (!selectedEntryId) return;
    deleteItemFromNodeList(nodeId, "entries", selectedEntryId, fallbackNodeState);
    setSelectedEntryId(null);
    setDraftEntryState(null);
  }

  function handleDraftFieldChange(fieldName, fieldValue) {
    setDraftEntryState((prev) => ({ ...(prev || {}), [fieldName]: fieldValue }));
  }

  function applyDraftChanges() {
    if (!draftEntryState || !selectedEntryId) return;

    const payloadToCommit = {
      ...draftEntryState,
      title: String(draftEntryState.title || "").trim()
    };

    updateItemInNodeList(nodeId, "entries", selectedEntryId, payloadToCommit, fallbackNodeState);
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

  const isEditorVisible = Boolean(draftEntryState);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>{nodeTitle}</h2>
        <div className={styles.panelSubtitle}>
          {isDiagramMode
            ? "Modalità diagrammi: titolo + PNG."
            : "Modalità modelli DB: descrizione breve + PNG."}
        </div>
      </div>

      <div className={elements.split}>
        <div className={elements.card}>
          <button className={styles.primaryButton} type="button" onClick={handleAddNewEntry}>
            Add new
          </button>

          <div className={styles.label} style={{ marginTop: 10 }}>
            List
          </div>

          {entriesList.length === 0 ? (
            <div className={styles.muted}>Nessuna voce inserita.</div>
          ) : (
            <div className={elements.list}>
              {entriesList.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => handleSelectEntry(e)}
                  className={`${elements.listButton} ${
                    String(e.id) === String(selectedEntryId) ? elements.listButtonActive : ""
                  }`}
                >
                  {isDiagramMode ? (e.title || "Untitled diagram") : (e.title || "Model entry")}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={elements.card}>
          {!isEditorVisible ? (
            <div className={styles.muted}>Seleziona una voce per modificarla.</div>
          ) : (
            <div className={elements.fieldGrid}>
              {isDiagramMode ? (
                <>
                  <div className={styles.label}>Titolo</div>
                  <input
                    className={elements.input}
                    value={draftEntryState.title}
                    onChange={(e) => handleDraftFieldChange("title", e.target.value)}
                    placeholder="Titolo diagramma"
                  />
                </>
              ) : (
                <>
                  <div className={styles.label}>Descrizione breve</div>
                  <RichTextEditor
                    valueHtml={draftEntryState.shortDescriptionHtml || ""}
                    onChangeHtml={(html) => handleDraftFieldChange("shortDescriptionHtml", html)}
                  />
                </>
              )}

              <div className={styles.label}>Upload PNG</div>
              <PngImageField
                valueDataUrl={draftEntryState.pngDataUrl}
                onChangeDataUrl={(dataUrl) => handleDraftFieldChange("pngDataUrl", dataUrl)}
              />

              <div className={elements.smallRow}>
                <button className={styles.secondaryButton} type="button" onClick={applyDraftChanges}>
                  Apply changes
                </button>

                <button className={styles.dangerButton} type="button" onClick={handleDeleteSelectedEntry}>
                  Delete
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
