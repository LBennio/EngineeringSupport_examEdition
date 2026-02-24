"use client";

import { useMemo, useState } from "react";
import RichTextEditor from "@/components/editors/RichTextEditor";
import PngImageField from "@/components/editors/PngImageField";
import styles from "./PanelCommon.module.css";
import elements from "./PanelElements.module.css";
import { computeNextIncrementalCode, generateClientId } from "@/lib/documentationUtils";

function buildNewImageItem(itemPrefix, existingItems) {
  const prefix = String(itemPrefix || "UI").toUpperCase();

  return {
    id: generateClientId("image-item"),
    code: computeNextIncrementalCode(prefix, existingItems, "code"),
    title: "",
    shortDescriptionHtml: "",
    pngDataUrl: ""
  };
}

export default function ListItemsWithImagePanel({
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
  const fallbackNodeState = { items: [] };
  const nodeState = documentData.nodes?.[nodeId] || fallbackNodeState;
  const itemsList = Array.isArray(nodeState.items) ? nodeState.items : [];

  const itemPrefix = nodeMeta?.itemPrefix || "UI";

  const [selectedItemId, setSelectedItemId] = useState(null);
  const [draftItemState, setDraftItemState] = useState(null);

  const selectedItem = useMemo(() => {
    return itemsList.find((it) => String(it.id) === String(selectedItemId)) || null;
  }, [itemsList, selectedItemId]);

  function handleSelectItem(itemToSelect) {
    setSelectedItemId(itemToSelect.id);
    setDraftItemState({ ...itemToSelect });
  }

  function handleAddNewItem() {
    const newItem = buildNewImageItem(itemPrefix, itemsList);
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
      title: String(draftItemState.title || "").trim()
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
          Item {String(itemPrefix).toUpperCase()}-N con descrizione breve e upload PNG.
        </div>
      </div>

      <div className={elements.split}>
        <div className={elements.card}>
          <button className={styles.primaryButton} type="button" onClick={handleAddNewItem}>
            Add new item
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
                  {it.code} — {it.title || "Untitled"}
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
              <div className={styles.label}>Codice (solo lettura)</div>
              <input className={elements.input} value={draftItemState.code} disabled />

              <div className={styles.label}>Titolo</div>
              <input
                className={elements.input}
                value={draftItemState.title}
                onChange={(e) => handleDraftFieldChange("title", e.target.value)}
                placeholder="Titolo item interfaccia"
              />

              <div className={styles.label}>Descrizione breve</div>
              <RichTextEditor
                valueHtml={draftItemState.shortDescriptionHtml}
                onChangeHtml={(html) => handleDraftFieldChange("shortDescriptionHtml", html)}
              />

              <div className={styles.label}>Upload PNG</div>
              <PngImageField
                valueDataUrl={draftItemState.pngDataUrl}
                onChangeDataUrl={(dataUrl) => handleDraftFieldChange("pngDataUrl", dataUrl)}
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
