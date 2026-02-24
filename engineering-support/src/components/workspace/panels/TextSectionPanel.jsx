"use client";

import { useEffect, useMemo, useState } from "react";
import RichTextEditor from "@/components/editors/RichTextEditor";
import common from "./PanelCommon.module.css";

export default function TextSectionPanel({ docController, nodeId, title, subtitle }) {
  if (!docController || !nodeId) {
    return (
      <div className={common.panel}>
        <div className={common.errorBox}>
          <strong>Pannello non disponibile: docController/nodeId mancanti.</strong>
        </div>
      </div>
    );
  }

  const storedHtml = useMemo(() => {
    return String(docController.documentData?.nodes?.[nodeId]?.descriptionHtml || "");
  }, [docController.documentData, nodeId]);

  const [draftHtml, setDraftHtml] = useState(storedHtml);

  useEffect(() => {
    setDraftHtml(storedHtml);
  }, [nodeId, storedHtml]);

  function handleChange(nextHtml) {
    setDraftHtml(nextHtml);

    docController.updateNodeField(
      nodeId,
      "descriptionHtml",
      nextHtml,
      { descriptionHtml: "" } 
    );
  }

  function handleClear() {
    handleChange("");
  }

  function handleSave() {
    const result = docController.saveDocumentationToStorage();
    if (!result.ok) {
      window.alert(result.errorMessage);
      return;
    }
    window.alert("Descrizione salvata.");
  }

  function handleNext() {
    docController.goToNextNode();
  }

  return (
    <div className={common.panel}>
      <div className={common.panelHeader}>
        <div>
          <div className={common.panelTitle}>{title || "Sezione testuale"}</div>
          {subtitle ? <div className={common.panelSubtitle}>{subtitle}</div> : null}
        </div>
      </div>

      <div className={common.field}>
        <div className={common.label}>Descrizione</div>

        <RichTextEditor
          value={draftHtml}
          onChange={handleChange}
          placeholder="Scrivi qui..."
          ariaLabel={`Text section ${String(nodeId)}`}
        />
      </div>

      <div className={common.buttonRow}>
        <button type="button" className={common.secondaryButton} onClick={handleClear}>
          Clear content
        </button>

        <button type="button" className={common.primaryButton} onClick={handleSave}>
          Save
        </button>

        <button type="button" className={common.secondaryButton} onClick={handleNext}>
          Next section
        </button>
      </div>
    </div>
  );
}
