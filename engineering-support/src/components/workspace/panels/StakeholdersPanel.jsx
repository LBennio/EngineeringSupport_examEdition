"use client";

import { useMemo, useState } from "react";
import RichTextEditor from "@/components/editors/RichTextEditor";
import styles from "./PanelCommon.module.css";

function buildNewStakeholderItem() {
  return {
    id: `stakeholder-${Date.now()}`,
    name: "",
    notesHtml: ""
  };
}

export default function StakeholdersPanel({
  nodeId,
  nodeTitle,
  documentData,
  updateNodeField,
  addItemToNodeList,
  updateItemInNodeList,
  deleteItemFromNodeList,
  onSave,
  onNext
}) {
  const nodeState = documentData.nodes?.[nodeId] || { descriptionHtml: "", stakeholders: [] };
  const stakeholdersList = Array.isArray(nodeState.stakeholders) ? nodeState.stakeholders : [];

  const [selectedStakeholderId, setSelectedStakeholderId] = useState(null);

  const selectedStakeholder = useMemo(() => {
    return stakeholdersList.find((s) => String(s.id) === String(selectedStakeholderId)) || null;
  }, [stakeholdersList, selectedStakeholderId]);

  function handleDescriptionChange(newHtml) {
    updateNodeField(nodeId, "descriptionHtml", newHtml, { descriptionHtml: "", stakeholders: [] });
  }

  function handleAddStakeholderClick() {
    const newStakeholder = buildNewStakeholderItem();
    addItemToNodeList(nodeId, "stakeholders", newStakeholder, { descriptionHtml: "", stakeholders: [] });
    setSelectedStakeholderId(newStakeholder.id);
  }

  function handleUpdateStakeholderField(fieldName, fieldValue) {
    if (!selectedStakeholder) return;

    const updatedStakeholder = {
      ...selectedStakeholder,
      [fieldName]: fieldValue
    };

    updateItemInNodeList(nodeId, "stakeholders", selectedStakeholder.id, updatedStakeholder, {
      descriptionHtml: "",
      stakeholders: []
    });
  }

  function handleDeleteStakeholder(stakeholderId) {
    deleteItemFromNodeList(nodeId, "stakeholders", stakeholderId, { descriptionHtml: "", stakeholders: [] });
    if (String(stakeholderId) === String(selectedStakeholderId)) setSelectedStakeholderId(null);
  }

  function handleSaveClick() {
    const result = onSave();
    if (!result.ok) window.alert(result.errorMessage);
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>{nodeTitle}</h2>
        <div className={styles.panelSubtitle}>Descrizione + elenco stakeholder con CRUD.</div>
      </div>

      <div className={styles.block}>
        <div className={styles.label}>Descrizione</div>
        <RichTextEditor valueHtml={nodeState.descriptionHtml || ""} onChangeHtml={handleDescriptionChange} />
      </div>

      <div className={styles.block}>
        <button className={styles.primaryButton} type="button" onClick={handleAddStakeholderClick}>
          Add stakeholder
        </button>

        <div className={styles.label}>Stakeholders list</div>
        {stakeholdersList.length === 0 ? (
          <div className={styles.muted}>Nessuno stakeholder inserito.</div>
        ) : (
          <div style={{ display: "grid", gap: "8px" }}>
            {stakeholdersList.map((s) => (
              <div
                key={s.id}
                style={{
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "14px",
                  padding: "10px",
                  background: "rgba(0,0,0,0.18)",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px"
                }}
              >
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => setSelectedStakeholderId(s.id)}
                >
                  {s.name || "Unnamed stakeholder"}
                </button>

                <button
                  type="button"
                  className={styles.dangerButton}
                  onClick={() => handleDeleteStakeholder(s.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedStakeholder ? (
        <div className={styles.block}>
          <div className={styles.label}>Selected stakeholder</div>

          <div style={{ display: "grid", gap: "10px" }}>
            <input
              value={selectedStakeholder.name}
              onChange={(e) => handleUpdateStakeholderField("name", e.target.value)}
              placeholder="Stakeholder name"
              style={{
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(0,0,0,0.25)",
                borderRadius: "12px",
                padding: "10px",
                color: "inherit"
              }}
            />

            <RichTextEditor
              valueHtml={selectedStakeholder.notesHtml || ""}
              onChangeHtml={(html) => handleUpdateStakeholderField("notesHtml", html)}
            />
          </div>
        </div>
      ) : null}

      <div className={styles.actionsRow}>
        <button className={styles.primaryButton} type="button" onClick={handleSaveClick}>
          Save
        </button>
        <button className={styles.primaryButton} type="button" onClick={onNext}>
          Next section
        </button>
      </div>
    </div>
  );
}
