"use client";

import { useMemo, useState } from "react";
import RichTextEditor from "@/components/editors/RichTextEditor";
import styles from "./PanelCommon.module.css";
import elements from "./PanelElements.module.css";
import { generateClientId } from "@/lib/documentationUtils";

function buildEmptySprintRow() {
  return {
    id: generateClientId("sprint-row"),
    itemCode: "",
    sprintNumber: "",
    notesHtml: ""
  };
}

export default function SprintBacklogPanel({
  nodeId,
  nodeTitle,
  documentData,
  updateNodeField,
  onSave,
  onNext
}) {
  const fallbackNodeState = { descriptionHtml: "", rows: [buildEmptySprintRow()] };
  const nodeState = documentData.nodes?.[nodeId] || fallbackNodeState;

  const rows = Array.isArray(nodeState.rows) && nodeState.rows.length > 0 ? nodeState.rows : [buildEmptySprintRow()];

  function handleDescriptionChange(newHtml) {
    updateNodeField(nodeId, "descriptionHtml", newHtml, fallbackNodeState);
  }

  function handleAddRow() {
    updateNodeField(nodeId, "rows", [...rows, buildEmptySprintRow()], fallbackNodeState);
  }
  function handleDeleteRow(rowId) {
    const updatedRows = rows.filter((r) => String(r.id) !== String(rowId));
    updateNodeField(nodeId, "rows", updatedRows.length > 0 ? updatedRows : [buildEmptySprintRow()], fallbackNodeState);
  }
  function handleUpdateRowField(rowId, fieldName, fieldValue) {
    const updatedRows = rows.map((r) => (String(r.id) === String(rowId) ? { ...r, [fieldName]: fieldValue } : r));
    updateNodeField(nodeId, "rows", updatedRows, fallbackNodeState);
  }

  function handleSaveClick() {
    const saveResult = onSave();
    if (!saveResult.ok) window.alert(saveResult.errorMessage);
  }

  function handleNextClick() {
    onNext();
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>{nodeTitle}</h2>
        <div className={styles.panelSubtitle}>
          Descrizione + tabella Sprint Backlog (codice item, sprint, note).
        </div>
      </div>

      <div className={styles.block}>
        <div className={styles.label}>Descrizione</div>
        <RichTextEditor valueHtml={nodeState.descriptionHtml || ""} onChangeHtml={handleDescriptionChange} />
      </div>

      <div className={styles.block}>
        <div className={elements.smallRow}>
          <div className={styles.label}>Tabella Sprint Backlog</div>
          <button className={styles.secondaryButton} type="button" onClick={handleAddRow}>
            Add row
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
                  Codice item
                </th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
                  Numero sprint
                </th>
                <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
                  Note
                </th>
                <th style={{ padding: 8, borderBottom: "1px solid rgba(255,255,255,0.10)" }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td style={{ padding: 8, verticalAlign: "top" }}>
                    <input
                      className={elements.input}
                      value={row.itemCode}
                      onChange={(e) => handleUpdateRowField(row.id, "itemCode", e.target.value)}
                      placeholder="es. IF-1"
                    />
                  </td>
                  <td style={{ padding: 8, verticalAlign: "top" }}>
                    <input
                      className={elements.input}
                      value={row.sprintNumber}
                      onChange={(e) => handleUpdateRowField(row.id, "sprintNumber", e.target.value)}
                      placeholder="es. 1"
                    />
                  </td>
                  <td style={{ padding: 8, verticalAlign: "top", minWidth: 280 }}>
                    <RichTextEditor
                      valueHtml={row.notesHtml || ""}
                      onChangeHtml={(html) => handleUpdateRowField(row.id, "notesHtml", html)}
                    />
                  </td>
                  <td style={{ padding: 8, verticalAlign: "top" }}>
                    <button className={styles.dangerButton} type="button" onClick={() => handleDeleteRow(row.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
