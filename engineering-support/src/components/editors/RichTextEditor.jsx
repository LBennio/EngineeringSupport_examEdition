"use client";

import { useEffect, useMemo, useRef } from "react";
import styles from "./RichTextEditor.module.css";

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Scrivi qui...",
  ariaLabel = "rich text editor"
}) {
  const editorRef = useRef(null);

  const safeValue = useMemo(() => String(value || ""), [value]);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    const currentHtml = el.innerHTML || "";
    if (currentHtml !== safeValue) {
      el.innerHTML = safeValue;
    }
  }, [safeValue]);

  function emitChange() {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML || "";
    if (typeof onChange === "function") onChange(html);
  }

  function applyCommand(commandName) {
    editorRef.current?.focus();
    document.execCommand(commandName, false, undefined);
    emitChange();
  }

  function handleInput() {
    emitChange();
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <button type="button" className={styles.toolButton} onClick={() => applyCommand("bold")}>
          Bold
        </button>
        <button
          type="button"
          className={styles.toolButton}
          onClick={() => applyCommand("underline")}
        >
          Underline
        </button>
        <button
          type="button"
          className={styles.toolButton}
          onClick={() => applyCommand("insertOrderedList")}
        >
          OL
        </button>
        <button
          type="button"
          className={styles.toolButton}
          onClick={() => applyCommand("insertUnorderedList")}
        >
          UL
        </button>
      </div>

      <div
        ref={editorRef}
        className={styles.editor}
        contentEditable
        suppressContentEditableWarning
        aria-label={ariaLabel}
        data-placeholder={placeholder}
        onInput={handleInput}
      />
    </div>
  );
}
