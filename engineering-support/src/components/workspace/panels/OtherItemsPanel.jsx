"use client";

import { useMemo, useState } from "react";
import RichTextEditor from "@/components/editors/RichTextEditor";
import styles from "./PanelCommon.module.css";
import elements from "./PanelElements.module.css";
import { generateClientId } from "@/lib/documentationUtils";

function buildNewOtherItem() {
  return {
    id: generateClientId("other-item"),
    name: "",
    abbreviation: "",
    descriptionHtml: ""
  };
}

export default function OtherItemsPanel({
  nodeId,
  nodeTitle,
  documentData,
  addItemToNodeList,
  updateItemInNodeList,
  deleteItemFromNodeList,
  onSave,
  onNext
}) {
  const fallbackNodeState = { items: [] };
  const nodeState = documentData.nodes?.[nodeId] || fallbackNodeState;
  const itemsList = Array.isArray(nodeState.items) ? nodeState.items : [];

  const [selectedItemId, setSelectedItemId] = useState(null);
  const [draftItemState, setDraftItemState] = useState(null);

  const selectedItem = useMemo(() => {
    return itemsList.find((it) => String(it.id) === String(selectedItemId)) || null;
  }, [itemsList, selectedItemId]);

  function handleSelectItem(itemToSelect) {
    setSelectedItemId(itemToSelect.id);
    setDraftItemState({ ...itemToSelect });
  }

  function handleCreateItem() {
    const newItem = buildNewOtherItem();
    addItemToNodeList(nodeId, "items", newItem, fallbackNodeState);
    handleSelectItem(newItem);
  }

  function handleDeleteSelectedItem() {
    if (!selectedItemId) return;
    deleteItemFromNodeList(nodeId, "items", selectedItemId, fallbackNodeState);
    setSelectedItemId(null);
    setDraftItemState(null);
  }

  function handleDraftFieldChange(fieldName, fieldValue) {
    setDraftItemState((prev) => ({ ...(prev || {}), [fieldName]: fieldValue }));
  }

  function applyDraftChanges() {
    if (!draftItemState || !selectedItemId) return;

    const payloadToCommit = {
      ...draftItemState,
      name: String(draftItemState.name || "").trim(),
      abbreviation: String(draftItemState.abbreviation || "").trim()
    };

    updateItemInNodeList(nodeId, "items", selectedItemId, payloadToCommit, fallbackNodeState);
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

  const isEditorVisible = Boolean(draftItemState);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>{nodeTitle}</h2>
        <div className={styles.panelSubtitle}>
          Altri item: nome, abbreviazione, descrizione (rich text).
        </div>
      </div>

      <div className={elements.split}>
        <div className={elements.card}>
          <button className={styles.primaryButton} type="button" onClick={handleCreateItem}>
            Create item
          </button>

          <div className={styles.label} style={{ marginTop: 10 }}>
            Items list
          </div>

          {itemsList.length === 0 ? (
            <div className={styles.muted}>Nessun item inserito.</div>
          ) : (
            <div className={elements.list}>
              {itemsList.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => handleSelectItem(it)}
                  className={`${elements.listButton} ${
                    String(it.id) === String(selectedItemId) ? elements.listButtonActive : ""
                  }`}
                >
                  {it.abbreviation || "N/A"} — {it.name || "Untitled"}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={elements.card}>
          {!isEditorVisible ? (
            <div className={styles.muted}>Seleziona un item per modificarlo.</div>
          ) : (
            <div className={elements.fieldGrid}>
              <div className={styles.label}>Nome item</div>
              <input
                className={elements.input}
                value={draftItemState.name}
                onChange={(e) => handleDraftFieldChange("name", e.target.value)}
                placeholder="Nome item"
              />

              <div className={styles.label}>Abbreviazione</div>
              <input
                className={elements.input}
                value={draftItemState.abbreviation}
                onChange={(e) => handleDraftFieldChange("abbreviation", e.target.value)}
                placeholder="Abbreviazione"
              />

              <div className={styles.label}>Descrizione</div>
              <RichTextEditor
                valueHtml={draftItemState.descriptionHtml}
                onChangeHtml={(html) => handleDraftFieldChange("descriptionHtml", html)}
              />

              <div className={elements.smallRow}>
                <button className={styles.secondaryButton} type="button" onClick={applyDraftChanges}>
                  Apply changes
                </button>

                <button className={styles.dangerButton} type="button" onClick={handleDeleteSelectedItem}>
                  Delete item
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
