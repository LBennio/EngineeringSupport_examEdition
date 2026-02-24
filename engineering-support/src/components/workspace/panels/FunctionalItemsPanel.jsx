"use client";

import { useMemo, useState } from "react";
import RichTextEditor from "@/components/editors/RichTextEditor";
import styles from "./PanelCommon.module.css";
import elements from "./PanelElements.module.css";
import { computeNextIncrementalCode, generateClientId } from "@/lib/documentationUtils";

function buildNewFunctionalItem(existingItems) {
  return {
    id: generateClientId("if"),
    code: computeNextIncrementalCode("IF", existingItems, "code"),
    title: "",
    asIsHtml: "", // COME
    iWantHtml: "", // DEVO POTER
    soThatHtml: "" // PER
  };
}

export default function FunctionalItemsPanel({
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
  const functionalItemsList = Array.isArray(nodeState.items) ? nodeState.items : [];

  const [selectedItemId, setSelectedItemId] = useState(null);
  const selectedItem = useMemo(() => {
    return functionalItemsList.find((it) => String(it.id) === String(selectedItemId)) || null;
  }, [functionalItemsList, selectedItemId]);

  const [draftItemState, setDraftItemState] = useState(null);

  function handleSelectItem(itemToSelect) {
    setSelectedItemId(itemToSelect.id);
    setDraftItemState({ ...itemToSelect });
  }

  function handleAddNewItem() {
    const newItem = buildNewFunctionalItem(functionalItemsList);
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
          Item funzionali (IF-N) con “COME / DEVO POTER / PER”.
        </div>
      </div>

      <div className={elements.split}>
        <div className={elements.card}>
          <div className={styles.block}>
            <button className={styles.primaryButton} type="button" onClick={handleAddNewItem}>
              Add new functional item
            </button>
          </div>

          <div className={styles.label}>Functional items</div>
          {functionalItemsList.length === 0 ? (
            <div className={styles.muted}>Nessun item funzionale inserito.</div>
          ) : (
            <div className={elements.list}>
              {functionalItemsList.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectItem(item)}
                  className={`${elements.listButton} ${
                    String(item.id) === String(selectedItemId) ? elements.listButtonActive : ""
                  }`}
                >
                  {item.code} — {item.title || "Untitled"}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={elements.card}>
          {!isEditorVisible ? (
            <div className={styles.muted}>Seleziona un item per modificarlo oppure creane uno nuovo.</div>
          ) : (
            <div className={elements.fieldGrid}>
              <div className={styles.label}>Codice (solo lettura)</div>
              <input className={elements.input} value={draftItemState.code} disabled />

              <div className={styles.label}>Titolo</div>
              <input
                className={elements.input}
                value={draftItemState.title}
                onChange={(e) => handleDraftFieldChange("title", e.target.value)}
                placeholder="Titolo item funzionale"
              />

              <div className={styles.label}>COME</div>
              <RichTextEditor
                valueHtml={draftItemState.asIsHtml}
                onChangeHtml={(html) => handleDraftFieldChange("asIsHtml", html)}
              />

              <div className={styles.label}>DEVO POTER</div>
              <RichTextEditor
                valueHtml={draftItemState.iWantHtml}
                onChangeHtml={(html) => handleDraftFieldChange("iWantHtml", html)}
              />

              <div className={styles.label}>PER</div>
              <RichTextEditor
                valueHtml={draftItemState.soThatHtml}
                onChangeHtml={(html) => handleDraftFieldChange("soThatHtml", html)}
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
