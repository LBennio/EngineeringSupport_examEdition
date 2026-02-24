"use client";

import styles from "./PngImageField.module.css";

export default function PngImageField({ valueDataUrl, onChangeDataUrl }) {
  async function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const isPngFile = selectedFile.type === "image/png";
    if (!isPngFile) {
      window.alert("Solo PNG consentiti.");
      return;
    }

    const dataUrl = await readFileAsDataUrl(selectedFile);
    onChangeDataUrl(dataUrl);
  }

  function handleRemoveImage() {
    onChangeDataUrl("");
  }

  return (
    <div className={styles.wrapper}>
      <input type="file" accept="image/png" onChange={handleFileChange} />
      {valueDataUrl ? (
        <div className={styles.previewBlock}>
          <img className={styles.previewImage} src={valueDataUrl} alt="Uploaded PNG preview" />
          <button className={styles.dangerButton} type="button" onClick={handleRemoveImage}>
            Remove image
          </button>
        </div>
      ) : (
        <div className={styles.muted}>Nessuna immagine caricata.</div>
      )}
    </div>
  );
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("FileReader error"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}
