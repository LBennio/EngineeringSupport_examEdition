"use client";

import { useMemo, useState } from "react";
import RichTextEditor from "@/components/editors/RichTextEditor";
import styles from "./PanelCommon.module.css";
import elements from "./PanelElements.module.css";
import { computeNextIncrementalCode, generateClientId } from "@/lib/documentationUtils";

const USE_CASE_FIELDS = [
  { key: "idHtml", label: "ID" },
  { key: "briefDescriptionHtml", label: "Breve descrizione" },
  { key: "primaryActorsHtml", label: "Attori primari" },
  { key: "secondaryActorsHtml", label: "Attori secondari" },
  { key: "preconditionsHtml", label: "Precondizioni" },
  { key: "mainSequenceHtml", label: "Sequenza principale" },
  { key: "postConditionsHtml", label: "Post-condizioni" },
  { key: "alternativeSequencesHtml", label: "Sequenze alternative" }
];

function buildNewUseCase(existingUseCases) {
  return {
    id: generateClientId("usecase"),
    code: computeNextIncrementalCode("CU", existingUseCases, "code"),
    title: "",
    fields: USE_CASE_FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: "" }), {})
  };
}

export default function UseCaseSpecsPanel({
  nodeId,
  nodeTitle,
  documentData,
  addItemToNodeList,
  updateItemInNodeList,
  deleteItemFromNodeList,
  onSave,
  onNext
}) {
  const fallbackNodeState = { useCases: [] };
  const nodeState = documentData.nodes?.[nodeId] || fallbackNodeState;
  const useCasesList = Array.isArray(nodeState.useCases) ? nodeState.useCases : [];

  const [selectedUseCaseId, setSelectedUseCaseId] = useState(null);
  const [draftUseCaseState, setDraftUseCaseState] = useState(null);

  const selectedUseCase = useMemo(() => {
    return useCasesList.find((cu) => String(cu.id) === String(selectedUseCaseId)) || null;
  }, [useCasesList, selectedUseCaseId]);

  function handleSelectUseCase(useCaseToSelect) {
    setSelectedUseCaseId(useCaseToSelect.id);
    setDraftUseCaseState({ ...useCaseToSelect, fields: { ...(useCaseToSelect.fields || {}) } });
  }

  function handleAddNewUseCase() {
    const newUseCase = buildNewUseCase(useCasesList);
    addItemToNodeList(nodeId, "useCases", newUseCase, fallbackNodeState);
    handleSelectUseCase(newUseCase);
  }

  function handleDeleteSelectedUseCase() {
    if (!selectedUseCaseId) return;
    deleteItemFromNodeList(nodeId, "useCases", selectedUseCaseId, fallbackNodeState);
    setSelectedUseCaseId(null);
    setDraftUseCaseState(null);
  }

  function handleDraftFieldChange(fieldName, fieldValue) {
    setDraftUseCaseState((prev) => ({ ...(prev || {}), [fieldName]: fieldValue }));
  }

  function handleDraftTableFieldChange(fieldKey, fieldHtml) {
    setDraftUseCaseState((prev) => ({
      ...(prev || {}),
      fields: { ...((prev && prev.fields) || {}), [fieldKey]: fieldHtml }
    }));
  }

  function applyDraftChanges() {
    if (!draftUseCaseState || !selectedUseCaseId) return;

    const payloadToCommit = {
      ...draftUseCaseState,
      title: String(draftUseCaseState.title || "").trim(),
      fields: { ...(draftUseCaseState.fields || {}) }
    };

    updateItemInNodeList(nodeId, "useCases", selectedUseCaseId, payloadToCommit, fallbackNodeState);
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

  const isEditorVisible = Boolean(draftUseCaseState);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>{nodeTitle}</h2>
        <div className={styles.panelSubtitle}>
          Specifiche casi d’uso: CU-N, titolo, tabella a campi fissi compilabili.
        </div>
      </div>

      <div className={elements.split}>
        <div className={elements.card}>
          <button className={styles.primaryButton} type="button" onClick={handleAddNewUseCase}>
            Add new use case
          </button>

          <div className={styles.label} style={{ marginTop: 10 }}>
            Use cases list
          </div>

          {useCasesList.length === 0 ? (
            <div className={styles.muted}>Nessun caso d’uso inserito.</div>
          ) : (
            <div className={elements.list}>
              {useCasesList.map((cu) => (
                <button
                  key={cu.id}
                  type="button"
                  onClick={() => handleSelectUseCase(cu)}
                  className={`${elements.listButton} ${
                    String(cu.id) === String(selectedUseCaseId) ? elements.listButtonActive : ""
                  }`}
                >
                  {cu.code} — {cu.title || "Untitled"}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={elements.card}>
          {!isEditorVisible ? (
            <div className={styles.muted}>Seleziona un caso d’uso per modificarlo.</div>
          ) : (
            <div className={elements.fieldGrid}>
              <div className={styles.label}>Codice (solo lettura)</div>
              <input className={elements.input} value={draftUseCaseState.code} disabled />

              <div className={styles.label}>Titolo</div>
              <input
                className={elements.input}
                value={draftUseCaseState.title}
                onChange={(e) => handleDraftFieldChange("title", e.target.value)}
                placeholder="Titolo caso d’uso"
              />

              <div className={styles.label}>Tabella specifiche</div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {USE_CASE_FIELDS.map((fieldDef) => (
                      <tr key={fieldDef.key}>
                        <td
                          style={{
                            width: 220,
                            padding: 8,
                            borderBottom: "1px solid rgba(255,255,255,0.10)",
                            fontWeight: 900,
                            opacity: 0.9,
                            verticalAlign: "top"
                          }}
                        >
                          {fieldDef.label}
                        </td>
                        <td style={{ padding: 8, borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
                          <RichTextEditor
                            valueHtml={draftUseCaseState.fields?.[fieldDef.key] || ""}
                            onChangeHtml={(html) => handleDraftTableFieldChange(fieldDef.key, html)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={elements.smallRow}>
                <button className={styles.secondaryButton} type="button" onClick={applyDraftChanges}>
                  Apply changes
                </button>

                <button className={styles.dangerButton} type="button" onClick={handleDeleteSelectedUseCase}>
                  Delete use case
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
