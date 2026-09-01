import React, { useEffect, useRef, useState } from "react";

/** A self-contained image-background uploader.  It intentionally reports the
 * selected file to the parent as well, so it can be connected to an API later. */
export default function ImageBackground({ onImageSelect }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const [background, setBackground] = useState("transparent");
  const [message, setMessage] = useState("");

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  function selectFile(nextFile) {
    if (!nextFile) return;
    if (!nextFile.type.startsWith("image/")) {
      setMessage("Please choose a JPG, PNG, WEBP, or GIF image.");
      return;
    }
    if (nextFile.size > 10 * 1024 * 1024) {
      setMessage("Please choose an image smaller than 10 MB.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
    setMessage("");
    onImageSelect?.(nextFile);
  }

  function onDrop(event) {
    event.preventDefault();
    setDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  }

  return (
    <section className="image-background-tool" aria-labelledby="background-title">
      <div className="tool-heading">
        <p className="tool-eyebrow">IMAGE TOOL</p>
        <h1 id="background-title">Image Background</h1>
        <p>Upload an image, preview it, and choose a replacement background.</p>
      </div>

      <div
        className={`image-dropzone ${dragging ? "is-dragging" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => { if (event.currentTarget === event.target) setDragging(false); }}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => event.key === "Enter" && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          className="visually-hidden"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) => { selectFile(event.target.files?.[0]); event.target.value = ""; }}
        />
        <span className="image-dropzone-icon" aria-hidden="true">⇧</span>
        <strong>{dragging ? "Drop image here" : "Drag & drop an image"}</strong>
        <span>or click to browse · JPG, PNG, WEBP, GIF · max 10 MB</span>
      </div>

      {message && <p className="tool-message" role="alert">{message}</p>}

      {file && (
        <div className="image-editor">
          <div className="selected-file" title={file.name}>Selected: {file.name}</div>
          <label className="background-control">
            Background
            <select value={background} onChange={(event) => setBackground(event.target.value)}>
              <option value="transparent">Transparent</option>
              <option value="#ffffff">White</option>
              <option value="#111827">Dark</option>
              <option value="#2563eb">Blue</option>
              <option value="#16a34a">Green</option>
            </select>
          </label>
          <div className="image-preview" style={{ background }}>
            <img src={previewUrl} alt={`Preview of ${file.name}`} />
          </div>
          <p className="tool-note">The image is ready for background processing. Connect this component to your background-removal API to export a processed file.</p>
        </div>
      )}
    </section>
  );
}
