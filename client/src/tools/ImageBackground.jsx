import React, { useEffect, useMemo, useRef, useState } from "react";

/*
===========================================================
 HUBCONVERTER - IMAGE BACKGROUND TOOL
===========================================================

Workflow:

  1. Upload / Drag & Drop
  2. Remove Background
  3. Choose Background / Color
  4. Preview
  5. Download

Features:
- JPG / PNG / WEBP
- Multiple images
- Drag & drop
- Background removal
- Background image selection
- Solid color selection
- Final preview
- Zoom
- PNG download
- Mobile responsive
===========================================================
*/

const MAX_FILE_SIZE = 5 * 1024 * 1024;

/* =========================================================
   BACKGROUNDS
   All backgrounds are intentionally shown together.
========================================================= */

const BACKGROUNDS = [
  {
    name: "Beach",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Ocean",
    url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Garden",
    url: "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Forest",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Cars",
    url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Hotel",
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "City",
    url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Mountains",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Sunset",
    url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Lake",
    url: "https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Road",
    url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=85",
  },
];

/* =========================================================
   COLORS
========================================================= */

const COLORS = [
  { name: "None", value: "transparent" },
  { name: "White", value: "#ffffff" },
  { name: "Black", value: "#000000" },
  { name: "Red", value: "#ff3b30" },
  { name: "Pink", value: "#ec1760" },
  { name: "Purple", value: "#9c27b0" },
  { name: "Violet", value: "#673ab7" },
  { name: "Blue", value: "#4169e1" },
  { name: "Sky Blue", value: "#16a9e8" },
  { name: "Green", value: "#12a66a" },
  { name: "Yellow", value: "#ffd21c" },
  { name: "Orange", value: "#ff7a18" },
  { name: "Gray", value: "#777777" },
  { name: "Dark Gray", value: "#333333" },
  { name: "Brown", value: "#795548" },
];

/* =========================================================
   HELPERS
========================================================= */

function formatSize(bytes) {
  if (!bytes) return "0 B";

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be loaded."));

    image.src = src;
  });
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

function ImageBackground() {
  const inputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [originalUrl, setOriginalUrl] = useState("");
  const [removedUrl, setRemovedUrl] = useState("");

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const [mode, setMode] = useState("background");
  const [selectedBackground, setSelectedBackground] = useState(null);
  const [selectedColor, setSelectedColor] = useState("transparent");

  const [zoom, setZoom] = useState(100);

  const currentFile = files[selectedIndex] || null;

  /* =======================================================
     CURRENT IMAGE
  ======================================================= */

  useEffect(() => {
    if (!currentFile) {
      setOriginalUrl("");
      setRemovedUrl("");
      return;
    }

    const url = URL.createObjectURL(currentFile);

    setOriginalUrl(url);
    setRemovedUrl("");
    setSelectedBackground(null);
    setSelectedColor("transparent");
    setMode("background");
    setZoom(100);
    setError("");

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [currentFile]);

  /* =======================================================
     CLEANUP REMOVED IMAGE URL
  ======================================================= */

  useEffect(() => {
    return () => {
      if (removedUrl) {
        URL.revokeObjectURL(removedUrl);
      }
    };
  }, [removedUrl]);

  /* =======================================================
     ADD FILES
  ======================================================= */

  function addFiles(fileList) {
    setError("");

    const incoming = Array.from(fileList || []);

    if (!incoming.length) {
      return;
    }

    const validFiles = [];

    for (const file of incoming) {
      if (!file.type.startsWith("image/")) {
        setError(`${file.name} is not an image file.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(
          `${file.name} is larger than 5 MB. Maximum allowed size is 5 MB per image.`
        );
        continue;
      }

      validFiles.push(file);
    }

    if (!validFiles.length) {
      return;
    }

    setFiles((current) => {
      const wasEmpty = current.length === 0;

      const updated = [...current, ...validFiles];

      if (wasEmpty) {
        setSelectedIndex(0);
      }

      return updated;
    });
  }

  /* =======================================================
     INPUT
  ======================================================= */

  function handleInput(event) {
    addFiles(event.target.files);

    event.target.value = "";
  }

  /* =======================================================
     DRAG & DROP
  ======================================================= */

  function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    addFiles(event.dataTransfer.files);
  }

  /* =======================================================
     REMOVE FILE FROM LIST
  ======================================================= */

  function removeFile(index) {
    setFiles((current) => {
      const next = current.filter((_, i) => i !== index);

      if (!next.length) {
        setSelectedIndex(0);
        return next;
      }

      if (index < selectedIndex) {
        setSelectedIndex((value) => Math.max(0, value - 1));
      } else if (index === selectedIndex) {
        setSelectedIndex((value) =>
          Math.min(value, next.length - 1)
        );
      }

      return next;
    });
  }

  /* =======================================================
     REMOVE BACKGROUND
  ======================================================= */

  async function removeBackground() {
    if (!currentFile) {
      setError("Please upload an image first.");
      return;
    }

    try {
      setProcessing(true);
      setError("");

      /*
       * Package is loaded only when required.
       *
       * Install:
       * npm install @imgly/background-removal
       */

      const module = await import("@imgly/background-removal");

      const removeBg =
        module.removeBackground ||
        module.default?.removeBackground ||
        module.default;

      if (typeof removeBg !== "function") {
        throw new Error(
          "Background removal engine could not be loaded."
        );
      }

      const result = await removeBg(currentFile, {
        output: {
          format: "image/png",
        },
      });

      const blob =
        result instanceof Blob
          ? result
          : new Blob([result], {
              type: "image/png",
            });

      const url = URL.createObjectURL(blob);

      setRemovedUrl((oldUrl) => {
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl);
        }

        return url;
      });
    } catch (err) {
      console.error(err);

      setError(
        "Background removal could not be completed. Please try another image."
      );
    } finally {
      setProcessing(false);
    }
  }

  /* =======================================================
     CREATE FINAL IMAGE
  ======================================================= */

  async function createFinalImage() {
    if (!currentFile) {
      throw new Error("No image selected.");
    }

    const source = removedUrl || originalUrl;

    if (!source) {
      throw new Error("Please upload an image.");
    }

    const foreground = await loadImage(source);

    const canvas = document.createElement("canvas");

    const maxDimension = 1800;

    let width =
      foreground.naturalWidth || foreground.width;

    let height =
      foreground.naturalHeight || foreground.height;

    if (
      width > maxDimension ||
      height > maxDimension
    ) {
      const ratio = Math.min(
        maxDimension / width,
        maxDimension / height
      );

      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas is not supported.");
    }

    /*
     * COLOR BACKGROUND
     */

    if (
      mode === "color" &&
      selectedColor !== "transparent"
    ) {
      ctx.fillStyle = selectedColor;

      ctx.fillRect(
        0,
        0,
        width,
        height
      );
    }

    /*
     * IMAGE BACKGROUND
     */

    if (
      mode === "background" &&
      selectedBackground
    ) {
      const bg = await loadImage(
        selectedBackground.url
      );

      const scale = Math.max(
        width / bg.naturalWidth,
        height / bg.naturalHeight
      );

      const bgWidth =
        bg.naturalWidth * scale;

      const bgHeight =
        bg.naturalHeight * scale;

      const bgX =
        (width - bgWidth) / 2;

      const bgY =
        (height - bgHeight) / 2;

      ctx.drawImage(
        bg,
        bgX,
        bgY,
        bgWidth,
        bgHeight
      );
    }

    /*
     * FOREGROUND
     */

    ctx.drawImage(
      foreground,
      0,
      0,
      width,
      height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "Could not create image."
              )
            );

            return;
          }

          resolve(blob);
        },
        "image/png",
        0.95
      );
    });
  }

  /* =======================================================
     DOWNLOAD
  ======================================================= */

  async function downloadImage() {
    if (!removedUrl) {
      setError(
        "Please remove the background before downloading."
      );

      return;
    }

    try {
      setError("");

      const blob = await createFinalImage();

      const url = URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      const baseName =
        currentFile?.name
          ?.replace(/\.[^/.]+$/, "")
          .replace(/[^a-z0-9-_]/gi, "-") ||
        "image";

      link.href = url;

      link.download =
        `${baseName}-background.png`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (err) {
      console.error(err);

      setError(
        "Could not download the image."
      );
    }
  }

  /* =======================================================
     PREVIEW STYLE
  ======================================================= */

  const previewStyle = useMemo(
    () => ({
      transform: `scale(${zoom / 100})`,
      transformOrigin: "center",
    }),
    [zoom]
  );

  /* =======================================================
     FINAL PREVIEW STYLE
  ======================================================= */

  const finalPreviewStyle = useMemo(() => {
    if (
      mode === "color" &&
      selectedColor !== "transparent"
    ) {
      return {
        backgroundColor: selectedColor,
      };
    }

    if (
      mode === "background" &&
      selectedBackground
    ) {
      return {
        backgroundImage: `url("${selectedBackground.url}")`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      };
    }

    return {};
  }, [
    mode,
    selectedColor,
    selectedBackground,
  ]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <style>{`

        /* ==================================================
           IMAGE BACKGROUND PAGE
        ================================================== */

        .ibg-page {
          width: 100%;
          max-width: 1450px;
          margin: 0 auto;
          padding: 28px 22px 60px;
          box-sizing: border-box;
        }

        .ibg-page * {
          box-sizing: border-box;
        }

        /* ==================================================
           HEADER
        ================================================== */

        .ibg-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 26px;
        }

        .ibg-header-icon {
          width: 58px;
          height: 58px;
          flex: 0 0 58px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.18);
        }

        .ibg-eyebrow {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
          opacity: 0.65;
          margin-bottom: 4px;
        }

        .ibg-header h1 {
          margin: 0;
          font-size: clamp(25px, 3vw, 36px);
          line-height: 1.15;
        }

        .ibg-header p {
          margin: 7px 0 0;
          opacity: 0.68;
          font-size: 14px;
        }

        /* ==================================================
           MAIN LAYOUT
        ================================================== */

        .ibg-layout {
          display: grid;
          grid-template-columns: 340px minmax(0, 1fr);
          gap: 22px;
          align-items: start;
        }

        /* ==================================================
           LEFT SIDEBAR
        ================================================== */

        .ibg-sidebar {
          position: sticky;
          top: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ibg-step {
          position: relative;
          background: rgba(255, 255, 255, 0.86);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.04);
        }

        .ibg-step-title {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .ibg-step-title strong {
          font-size: 14px;
        }

        .ibg-number {
          width: 30px;
          height: 30px;
          flex: 0 0 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #111827;
          color: white;
          font-size: 12px;
          font-weight: 800;
        }

        .ibg-step-text {
          margin: 0 0 12px;
          font-size: 12px;
          line-height: 1.55;
          opacity: 0.65;
        }

        /* ==================================================
           UPLOAD
        ================================================== */

        .ibg-upload {
          min-height: 190px;
          border: 2px dashed rgba(59, 130, 246, 0.4);
          border-radius: 13px;
          padding: 18px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
          background: rgba(59, 130, 246, 0.035);
          transition: 0.2s ease;
        }

        .ibg-upload:hover {
          border-color: rgba(59, 130, 246, 0.75);
          background: rgba(59, 130, 246, 0.07);
          transform: translateY(-1px);
        }

        .ibg-upload-icon {
          font-size: 31px;
          margin-bottom: 6px;
        }

        .ibg-upload h3 {
          font-size: 13px;
          margin: 2px 0 3px;
        }

        .ibg-upload p {
          margin: 0 0 10px;
          font-size: 11px;
          opacity: 0.6;
        }

        .ibg-upload small {
          margin-top: 9px;
          font-size: 10px;
          line-height: 1.5;
          opacity: 0.55;
        }

        /* ==================================================
           BUTTONS
        ================================================== */

        .ibg-blue-button,
        .ibg-green-button,
        .ibg-download-button,
        .ibg-bottom-download {
          border: none;
          cursor: pointer;
          font-weight: 800;
          border-radius: 10px;
          transition: 0.18s ease;
        }

        .ibg-blue-button {
          padding: 10px 15px;
          background: #2563eb;
          color: white;
          font-size: 12px;
        }

        .ibg-blue-button:hover {
          transform: translateY(-1px);
          filter: brightness(1.06);
        }

        .ibg-green-button {
          width: 100%;
          padding: 12px 14px;
          background: #16a34a;
          color: white;
          font-size: 12px;
        }

        .ibg-green-button:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.06);
        }

        .ibg-green-button:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }

        .ibg-download-button {
          width: 100%;
          padding: 12px 14px;
          background: #111827;
          color: white;
          font-size: 12px;
        }

        .ibg-download-button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .ibg-download-button:disabled {
          cursor: not-allowed;
          opacity: 0.4;
        }

        /* ==================================================
           BACKGROUND TABS
        ================================================== */

        .ibg-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
          margin-bottom: 12px;
        }

        .ibg-tab {
          border: 1px solid rgba(0, 0, 0, 0.1);
          background: rgba(0, 0, 0, 0.025);
          border-radius: 9px;
          padding: 9px 6px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 800;
          transition: 0.18s ease;
        }

        .ibg-tab.active {
          background: #111827;
          color: white;
          border-color: #111827;
        }

        /* ==================================================
           BACKGROUND GRID
        ================================================== */

        .ibg-background-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 7px;
          max-height: 330px;
          overflow-y: auto;
          padding-right: 2px;
        }

        .ibg-background-item {
          border: 2px solid transparent;
          background: transparent;
          padding: 3px;
          border-radius: 9px;
          cursor: pointer;
          overflow: hidden;
          transition: 0.18s ease;
        }

        .ibg-background-item:hover {
          transform: translateY(-1px);
        }

        .ibg-background-item.selected {
          border-color: #2563eb;
          background: rgba(37, 99, 235, 0.08);
        }

        .ibg-background-item img {
          display: block;
          width: 100%;
          aspect-ratio: 1.35;
          object-fit: cover;
          border-radius: 6px;
        }

        .ibg-background-item span {
          display: block;
          font-size: 9px;
          font-weight: 700;
          margin-top: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ==================================================
           COLOR GRID
        ================================================== */

        .ibg-color-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          max-height: 300px;
          overflow-y: auto;
        }

        .ibg-color-item {
          border: 2px solid transparent;
          background: transparent;
          padding: 3px;
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
        }

        .ibg-color-item.selected {
          border-color: #2563eb;
          background: rgba(37, 99, 235, 0.08);
        }

        .ibg-color-circle {
          width: 30px;
          height: 30px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.15);
          font-size: 13px;
          font-weight: 800;
        }

        .ibg-color-item small {
          display: block;
          margin-top: 4px;
          font-size: 8px;
          opacity: 0.65;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ==================================================
           WORKSPACE
        ================================================== */

        .ibg-workspace {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ibg-empty-workspace {
          min-height: 620px;
          border-radius: 18px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.75);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px;
        }

        .ibg-empty-icon {
          width: 78px;
          height: 78px;
          border-radius: 22px;
          background: rgba(59, 130, 246, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          margin-bottom: 18px;
        }

        .ibg-empty-workspace h2 {
          margin: 0 0 8px;
          font-size: 22px;
        }

        .ibg-empty-workspace p {
          margin: 0;
          max-width: 450px;
          line-height: 1.6;
          font-size: 13px;
          opacity: 0.65;
        }

        .ibg-empty-workspace span {
          margin-top: 12px;
          font-size: 11px;
          opacity: 0.45;
        }

        /* ==================================================
           PREVIEW CARD
        ================================================== */

        .ibg-preview-card,
        .ibg-images-card {
          border: 1px solid rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.85);
          border-radius: 17px;
          padding: 16px;
          overflow: hidden;
        }

        .ibg-card-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }

        .ibg-card-heading h2 {
          margin: 0;
          font-size: 14px;
        }

        .ibg-card-heading > span {
          font-size: 10px;
          opacity: 0.55;
        }

        /* ==================================================
           ORIGINAL PREVIEW
        ================================================== */

        .ibg-original-preview {
          min-height: 300px;
          max-height: 570px;
          border-radius: 13px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 15px;
        }

        .ibg-original-preview img {
          max-width: 100%;
          max-height: 530px;
          object-fit: contain;
          border-radius: 8px;
        }

        /* ==================================================
           TRANSPARENT PREVIEW
        ================================================== */

        .ibg-transparent-preview {
          min-height: 300px;
          max-height: 570px;
          border-radius: 13px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 15px;

          background-color: #f8fafc;

          background-image:
            linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
            linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
            linear-gradient(-45deg, transparent 75%, #e5e7eb 75%);

          background-size: 24px 24px;
          background-position:
            0 0,
            0 12px,
            12px -12px,
            -12px 0;
        }

        .ibg-transparent-preview img {
          max-width: 100%;
          max-height: 530px;
          object-fit: contain;
        }

        /* ==================================================
           FINAL PREVIEW
        ================================================== */

        .ibg-final-preview {
          position: relative;
          min-height: 430px;
          max-height: 650px;
          border-radius: 13px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;

          background-color: #f8fafc;

          background-image:
            linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
            linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
            linear-gradient(-45deg, transparent 75%, #e5e7eb 75%);

          background-size: 24px 24px;
          background-position:
            0 0,
            0 12px,
            12px -12px,
            -12px 0;
        }

        .ibg-final-preview img {
          max-width: 100%;
          max-height: 600px;
          object-fit: contain;
        }

        /* ==================================================
           PLACEHOLDER
        ================================================== */

        .ibg-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 30px;
        }

        .ibg-placeholder span {
          font-size: 38px;
          margin-bottom: 10px;
        }

        .ibg-placeholder strong {
          font-size: 15px;
        }

        .ibg-placeholder small {
          margin-top: 5px;
          font-size: 11px;
          opacity: 0.55;
        }

        /* ==================================================
           ZOOM
        ================================================== */

        .ibg-zoom {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .ibg-zoom button {
          width: 28px;
          height: 28px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          background: white;
          border-radius: 7px;
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
        }

        .ibg-zoom span {
          min-width: 42px;
          text-align: center;
          font-size: 10px;
          font-weight: 800;
        }

        /* ==================================================
           THUMBNAILS
        ================================================== */

        .ibg-thumbnail-row {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 3px;
        }

        .ibg-thumbnail {
          position: relative;
          flex: 0 0 76px;
          height: 76px;
          border: 2px solid transparent;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          background: #f1f5f9;
        }

        .ibg-thumbnail.selected {
          border-color: #2563eb;
        }

        .ibg-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .ibg-remove-thumbnail {
          position: absolute;
          right: 3px;
          top: 3px;
          width: 20px;
          height: 20px;
          border: none;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          cursor: pointer;
          font-size: 15px;
          line-height: 18px;
          padding: 0;
        }

        .ibg-add-more {
          flex: 0 0 76px;
          height: 76px;
          border: 2px dashed rgba(0, 0, 0, 0.15);
          border-radius: 10px;
          background: transparent;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
        }

        .ibg-add-more:hover {
          border-color: #2563eb;
          color: #2563eb;
        }

        .ibg-add-more span {
          font-size: 24px;
          line-height: 1;
        }

        .ibg-add-more small {
          font-size: 9px;
          font-weight: 700;
        }

        /* ==================================================
           ERROR
        ================================================== */

        .ibg-error {
          padding: 12px 14px;
          border-radius: 10px;
          background: rgba(239, 68, 68, 0.09);
          border: 1px solid rgba(239, 68, 68, 0.18);
          color: #b91c1c;
          font-size: 12px;
          line-height: 1.5;
        }

        /* ==================================================
           FILE INFO
        ================================================== */

        .ibg-file-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 13px;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.035);
          font-size: 11px;
        }

        .ibg-file-info span:first-child {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ibg-file-info span:last-child {
          flex-shrink: 0;
          opacity: 0.55;
        }

        /* ==================================================
           BOTTOM DOWNLOAD
        ================================================== */

        .ibg-bottom-download {
          width: 100%;
          padding: 15px;
          background: #2563eb;
          color: white;
          font-size: 14px;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.18);
        }

        .ibg-bottom-download:hover {
          transform: translateY(-1px);
          filter: brightness(1.05);
        }

        /* ==================================================
           DARK MODE SUPPORT
        ================================================== */

        @media (prefers-color-scheme: dark) {

          .ibg-step,
          .ibg-preview-card,
          .ibg-images-card,
          .ibg-empty-workspace {
            background: rgba(25, 25, 30, 0.88);
            border-color: rgba(255, 255, 255, 0.09);
          }

          .ibg-tab {
            background: rgba(255, 255, 255, 0.04);
            border-color: rgba(255, 255, 255, 0.1);
            color: inherit;
          }

          .ibg-tab.active {
            background: #ffffff;
            color: #111827;
          }

          .ibg-zoom button {
            background: rgba(255, 255, 255, 0.08);
            color: inherit;
            border-color: rgba(255, 255, 255, 0.12);
          }

          .ibg-file-info {
            background: rgba(255, 255, 255, 0.05);
          }

          .ibg-original-preview {
            background: rgba(255, 255, 255, 0.05);
          }
        }

        /* ==================================================
           TABLET
        ================================================== */

        @media (max-width: 1050px) {

          .ibg-layout {
            grid-template-columns: 290px minmax(0, 1fr);
          }

          .ibg-background-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .ibg-final-preview {
            min-height: 380px;
          }
        }

        /* ==================================================
           MOBILE
        ================================================== */

        @media (max-width: 760px) {

          .ibg-page {
            padding: 18px 12px 40px;
          }

          .ibg-header {
            align-items: flex-start;
            margin-bottom: 18px;
          }

          .ibg-header-icon {
            width: 48px;
            height: 48px;
            flex-basis: 48px;
            border-radius: 13px;
            font-size: 25px;
          }

          .ibg-header h1 {
            font-size: 24px;
          }

          .ibg-header p {
            font-size: 12px;
          }

          .ibg-layout {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }

          .ibg-sidebar {
            position: static;
            width: 100%;
          }

          .ibg-step {
            padding: 13px;
            border-radius: 13px;
          }

          .ibg-step-title {
            margin-bottom: 9px;
          }

          .ibg-number {
            width: 27px;
            height: 27px;
            flex-basis: 27px;
            font-size: 11px;
          }

          .ibg-background-grid {
            grid-template-columns: repeat(3, 1fr);
            max-height: none;
          }

          .ibg-color-grid {
            grid-template-columns: repeat(5, 1fr);
            max-height: none;
          }

          .ibg-workspace {
            width: 100%;
          }

          .ibg-empty-workspace {
            min-height: 330px;
            padding: 22px;
          }

          .ibg-original-preview,
          .ibg-transparent-preview {
            min-height: 250px;
          }

          .ibg-final-preview {
            min-height: 330px;
            max-height: none;
          }

          .ibg-preview-card,
          .ibg-images-card {
            padding: 12px;
            border-radius: 13px;
          }

          .ibg-card-heading h2 {
            font-size: 13px;
          }

          .ibg-bottom-download {
            position: sticky;
            bottom: 10px;
            z-index: 10;
          }
        }

        /* ==================================================
           SMALL MOBILE
        ================================================== */

        @media (max-width: 430px) {

          .ibg-page {
            padding-left: 9px;
            padding-right: 9px;
          }

          .ibg-header-icon {
            width: 43px;
            height: 43px;
            flex-basis: 43px;
            font-size: 22px;
          }

          .ibg-header h1 {
            font-size: 21px;
          }

          .ibg-header p {
            font-size: 11px;
          }

          .ibg-background-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 5px;
          }

          .ibg-color-grid {
            grid-template-columns: repeat(5, 1fr);
            gap: 5px;
          }

          .ibg-color-circle {
            width: 27px;
            height: 27px;
          }

          .ibg-final-preview {
            min-height: 280px;
            padding: 12px;
          }

          .ibg-original-preview,
          .ibg-transparent-preview {
            min-height: 220px;
          }

          .ibg-upload {
            min-height: 165px;
          }
        }

      `}</style>

      <section className="ibg-page">

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="ibg-header">

          <div className="ibg-header-icon">
            🖼️
          </div>

          <div>
            <div className="ibg-eyebrow">
              HUBCONVERTER · IMAGE TOOL
            </div>

            <h1>
              Image Background
            </h1>

            <p>
              Remove background and add a new background
              to your image
            </p>
          </div>

        </header>

        {/* ==================================================
            MAIN
        ================================================== */}

        <div className="ibg-layout">

          {/* =================================================
              LEFT WORKFLOW
          ================================================= */}

          <aside className="ibg-sidebar">

            {/* ===============================================
                STEP 1
            =============================================== */}

            <div className="ibg-step">

              <div className="ibg-step-title">
                <span className="ibg-number">
                  1
                </span>

                <strong>
                  Upload Image
                </strong>
              </div>

              <div
                className="ibg-upload"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() =>
                  inputRef.current?.click()
                }
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();

                    inputRef.current?.click();
                  }
                }}
              >

                <div className="ibg-upload-icon">
                  ☁️
                </div>

                <h3>
                  Drag & drop your files here
                </h3>

                <p>
                  or click to browse
                </p>

                <button
                  type="button"
                  className="ibg-blue-button"
                  onClick={(event) => {
                    event.stopPropagation();

                    inputRef.current?.click();
                  }}
                >
                  ⬆ Select Image
                </button>

                <small>
                  JPG, PNG, WEBP
                  <br />
                  Maximum 5 MB per image
                </small>

              </div>

              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                hidden
                onChange={handleInput}
              />

            </div>

            {/* ===============================================
                STEP 2
            =============================================== */}

            <div className="ibg-step">

              <div className="ibg-step-title">

                <span className="ibg-number">
                  2
                </span>

                <strong>
                  Remove Background
                </strong>

              </div>

              <p className="ibg-step-text">
                Remove the original background
                from your selected image.
              </p>

              <button
                type="button"
                className="ibg-green-button"
                disabled={
                  !currentFile ||
                  processing
                }
                onClick={removeBackground}
              >
                {processing
                  ? "⏳ Removing Background..."
                  : "✨ Remove Background"}
              </button>

            </div>

            {/* ===============================================
                STEP 3
            =============================================== */}

            <div className="ibg-step">

              <div className="ibg-step-title">

                <span className="ibg-number">
                  3
                </span>

                <strong>
                  Background
                </strong>

              </div>

              <div className="ibg-tabs">

                <button
                  type="button"
                  className={
                    mode === "background"
                      ? "ibg-tab active"
                      : "ibg-tab"
                  }
                  onClick={() =>
                    setMode("background")
                  }
                >
                  🖼️ Background
                </button>

                <button
                  type="button"
                  className={
                    mode === "color"
                      ? "ibg-tab active"
                      : "ibg-tab"
                  }
                  onClick={() =>
                    setMode("color")
                  }
                >
                  🎨 Color
                </button>

              </div>

              {/* =============================================
                  ALL BACKGROUNDS
              ============================================= */}

              {mode === "background" && (

                <div className="ibg-background-grid">

                  {BACKGROUNDS.map(
                    (background) => (

                      <button
                        type="button"
                        key={background.name}
                        className={
                          selectedBackground?.name ===
                          background.name
                            ? "ibg-background-item selected"
                            : "ibg-background-item"
                        }
                        onClick={() => {
                          setSelectedBackground(
                            background
                          );

                          setSelectedColor(
                            "transparent"
                          );
                        }}
                      >

                        <img
                          src={background.url}
                          alt={background.name}
                          loading="lazy"
                        />

                        <span>
                          {background.name}
                        </span>

                      </button>

                    )
                  )}

                </div>

              )}

              {/* =============================================
                  COLORS
              ============================================= */}

              {mode === "color" && (

                <div className="ibg-color-grid">

                  {COLORS.map((color) => (

                    <button
                      type="button"
                      key={color.name}
                      className={
                        selectedColor === color.value
                          ? "ibg-color-item selected"
                          : "ibg-color-item"
                      }
                      onClick={() => {

                        setSelectedColor(
                          color.value
                        );

                        setSelectedBackground(
                          null
                        );

                      }}
                      title={color.name}
                    >

                      <span
                        className="ibg-color-circle"
                        style={{
                          background:
                            color.value ===
                            "transparent"
                              ? "white"
                              : color.value,
                        }}
                      >
                        {color.value ===
                          "transparent" && "⊘"}
                      </span>

                      <small>
                        {color.name}
                      </small>

                    </button>

                  ))}

                </div>

              )}

            </div>

            {/* ===============================================
                STEP 4
            =============================================== */}

            <div className="ibg-step">

              <div className="ibg-step-title">

                <span className="ibg-number">
                  4
                </span>

                <strong>
                  Preview
                </strong>

              </div>

              <p className="ibg-step-text">
                Check your final image with
                the selected background.
              </p>

            </div>

            {/* ===============================================
                STEP 5
            =============================================== */}

            <div className="ibg-step">

              <div className="ibg-step-title">

                <span className="ibg-number">
                  5
                </span>

                <strong>
                  Download
                </strong>

              </div>

              <p className="ibg-step-text">
                Download your finished image
                as a PNG file.
              </p>

              <button
                type="button"
                className="ibg-download-button"
                disabled={!removedUrl}
                onClick={downloadImage}
              >
                ⬇ Download Image
              </button>

            </div>

          </aside>

          {/* =================================================
              RIGHT WORKSPACE
          ================================================= */}

          <main className="ibg-workspace">

            {/* ===============================================
                NO IMAGE
            =============================================== */}

            {!currentFile ? (

              <div className="ibg-empty-workspace">

                <div className="ibg-empty-icon">
                  🖼️
                </div>

                <h2>
                  Upload an image to get started
                </h2>

                <p>
                  Drag and drop an image on the
                  left side or click
                  <strong> Select Image</strong>.
                </p>

                <span>
                  JPG, PNG or WEBP · Maximum 5 MB
                </span>

              </div>

            ) : (

              <>

                {/* =========================================
                    ORIGINAL
                ========================================= */}

                <div className="ibg-preview-card">

                  <div className="ibg-card-heading">

                    <h2>
                      Original Image
                    </h2>

                    <span>
                      {selectedIndex + 1} /{" "}
                      {files.length}
                    </span>

                  </div>

                  <div className="ibg-original-preview">

                    <img
                      src={originalUrl}
                      alt="Original"
                    />

                  </div>

                </div>

                {/* =========================================
                    REMOVED BACKGROUND
                ========================================= */}

                <div className="ibg-preview-card">

                  <div className="ibg-card-heading">

                    <h2>
                      Background Removed
                    </h2>

                    {!removedUrl && (
                      <span>
                        Not processed
                      </span>
                    )}

                    {removedUrl && (
                      <span>
                        Ready
                      </span>
                    )}

                  </div>

                  <div className="ibg-transparent-preview">

                    {removedUrl ? (

                      <img
                        src={removedUrl}
                        alt="Background removed"
                        style={previewStyle}
                      />

                    ) : (

                      <div className="ibg-placeholder">

                        <span>
                          ✨
                        </span>

                        <strong>
                          Remove the background
                        </strong>

                        <small>
                          Click "Remove Background"
                          on the left.
                        </small>

                      </div>

                    )}

                  </div>

                </div>

                {/* =========================================
                    FINAL PREVIEW
                ========================================= */}

                <div className="ibg-preview-card">

                  <div className="ibg-card-heading">

                    <h2>
                      Final Preview
                    </h2>

                    <div className="ibg-zoom">

                      <button
                        type="button"
                        onClick={() =>
                          setZoom((value) =>
                            Math.max(
                              50,
                              value - 10
                            )
                          )
                        }
                      >
                        −
                      </button>

                      <span>
                        {zoom}%
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setZoom((value) =>
                            Math.min(
                              150,
                              value + 10
                            )
                          )
                        }
                      >
                        +
                      </button>

                    </div>

                  </div>

                  <div
                    className="ibg-final-preview"
                    style={
                      removedUrl
                        ? finalPreviewStyle
                        : {}
                    }
                  >

                    {removedUrl ? (

                      <img
                        src={removedUrl}
                        alt="Final preview"
                        style={previewStyle}
                      />

                    ) : (

                      <div className="ibg-placeholder">

                        <span>
                          🖼️
                        </span>

                        <strong>
                          Your final image will
                          appear here
                        </strong>

                        <small>
                          Remove the background
                          and choose a background.
                        </small>

                      </div>

                    )}

                  </div>

                </div>

              </>

            )}

            {/* =================================================
                YOUR IMAGES
            ================================================= */}

            {files.length > 0 && (

              <div className="ibg-images-card">

                <div className="ibg-card-heading">

                  <h2>
                    Your Images ({files.length})
                  </h2>

                </div>

                <div className="ibg-thumbnail-row">

                  {files.map(
                    (file, index) => {

                      const thumbnailUrl =
                        URL.createObjectURL(file);

                      return (
                        <Thumbnail
                          key={`${file.name}-${index}`}
                          file={file}
                          url={thumbnailUrl}
                          selected={
                            index === selectedIndex
                          }
                          onClick={() =>
                            setSelectedIndex(index)
                          }
                          onRemove={() =>
                            removeFile(index)
                          }
                        />
                      );
                    }
                  )}

                  {/* =========================================
                      ONLY ONE ADD MORE BUTTON
                  ========================================= */}

                  <button
                    type="button"
                    className="ibg-add-more"
                    onClick={() =>
                      inputRef.current?.click()
                    }
                  >
                    <span>
                      +
                    </span>

                    <small>
                      Add More
                    </small>
                  </button>

                </div>

              </div>

            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

              <div className="ibg-error">
                ⚠ {error}
              </div>

            )}

            {/* =================================================
                FILE INFORMATION
            ================================================= */}

            {currentFile && (

              <div className="ibg-file-info">

                <span>
                  📄 {currentFile.name}
                </span>

                <span>
                  {formatSize(
                    currentFile.size
                  )}
                </span>

              </div>

            )}

            {/* =================================================
                BOTTOM DOWNLOAD
            ================================================= */}

            {removedUrl && (

              <button
                type="button"
                className="ibg-bottom-download"
                onClick={downloadImage}
              >
                ⬇ Download Final Image
              </button>

            )}

          </main>

        </div>

      </section>
    </>
  );
}

/* ===========================================================
   THUMBNAIL COMPONENT

   This avoids creating a new object URL every render without
   cleanup.
=========================================================== */

function Thumbnail({
  file,
  url,
  selected,
  onClick,
  onRemove,
}) {
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [url]);

  return (
    <div
      className={
        selected
          ? "ibg-thumbnail selected"
          : "ibg-thumbnail"
      }
      onClick={onClick}
    >

      <img
        src={url}
        alt={file.name}
      />

      <button
        type="button"
        className="ibg-remove-thumbnail"
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
        aria-label={`Remove ${file.name}`}
        title="Remove image"
      >
        ×
      </button>

    </div>
  );
}

export default ImageBackground;
