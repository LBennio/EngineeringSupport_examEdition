"use client";

import { useMemo, useState } from "react";
import RichTextEditor from "@/components/editors/RichTextEditor";
import styles from "./PanelCommon.module.css";
import elements from "./PanelElements.module.css";
import { computeNextIncrementalCode, generateClientId } from "@/lib/documentationUtils";

function buildNewBulletsItem(itemPrefix, existingItems) {
  const prefix = String(itemPrefix || "ITEM").toUpperCase();

  return {
    id: generateClientId("bullets-item"),
    code: computeNextIncrementalCode(prefix, existingItems, "code"),
    title: "",
    shortDescriptionHtml: "",
    bullets: [] 
  };
}

function buildNewBullet() {
  return { id: generateClientId("bullet"), text: "" };
}

export default function ListItemsWithBulletsPanel({
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

  const itemPrefix = nodeMeta?.itemPrefix || "ITEM";

  const [selectedItemId, setSelectedItemId] = useState(null);
  const selectedItem = useMemo(() => {
    return itemsList.find((it) => String(it.id) === String(selectedItemId)) || null;
  }, [itemsList, selectedItemId]);

  const [draftItemState, setDraftItemState] = useState(null);

  function handleSelectItem(itemToSelect) {
    setSelectedItemId(itemToSelect.id);
    setDraftItemState({ ...itemToSelect });
  }

  function handleAddNewItem() {
    const newItem = buildNewBulletsItem(itemPrefix, itemsList);
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

  function handleAddBullet() {
    if (!draftItemState) return;

    const previousBullets = Array.isArray(draftItemState.bullets) ? draftItemState.bullets : [];
    setDraftItemState({
      ...draftItemState,
      bullets: [...previousBullets, buildNewBullet()]
    });
  }

  function handleUpdateBullet(bulletId, bulletText) {
    if (!draftItemState) return;

    const previousBullets = Array.isArray(draftItemState.bullets) ? draftItemState.bullets : [];
    const updatedBullets = previousBullets.map((b) =>
      String(b.id) === String(bulletId) ? { ...b, text: bulletText } : b
    );

    setDraftItemState({ ...draftItemState, bullets: updatedBullets });
  }

  function handleDeleteBullet(bulletId) {
    if (!draftItemState) return;

    const previousBullets = Array.isArray(draftItemState.bullets) ? draftItemState.bullets : [];
    const updatedBullets = previousBullets.filter((b) => String(b.id) !== String(bulletId));

    setDraftItemState({ ...draftItemState, bullets: updatedBullets });
  }

  function applyDraftChanges() {
    if (!draftItemState || !selectedItemId) return;

    const payloadToCommit = {
      ...draftItemState,
      title: String(draftItemState.title || "").trim(),
      bullets: Array.isArray(draftItemState.bullets)
        ? draftItemState.bullets.map((b) => ({ ...b, text: String(b.text || "") }))
        : []
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
          Item {String(itemPrefix).toUpperCase()}-N con descrizione breve e lista non ordinata.
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
                placeholder="Titolo item"
              />

              <div className={styles.label}>Descrizione breve</div>
              <RichTextEditor
                valueHtml={draftItemState.shortDescriptionHtml}
                onChangeHtml={(html) => handleDraftFieldChange("shortDescriptionHtml", html)}
              />

              <div className={styles.label}>Lista non ordinata (bullets)</div>
              <button className={styles.secondaryButton} type="button" onClick={handleAddBullet}>
                Add bullet
              </button>

              {Array.isArray(draftItemState.bullets) && draftItemState.bullets.length > 0 ? (
                <div className={elements.list}>
                  {draftItemState.bullets.map((b) => (
                    <div key={b.id} className={elements.smallRow}>
                      <input
                        className={elements.input}
                        value={b.text}
                        onChange={(e) => handleUpdateBullet(b.id, e.target.value)}
                        placeholder="Bullet text"
                      />
                      <button className={styles.dangerButton} type="button" onClick={() => handleDeleteBullet(b.id)}>
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.muted}>Nessun bullet inserito.</div>
              )}

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
