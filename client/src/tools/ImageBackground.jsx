import React, { useEffect, useMemo, useRef, useState } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

/* =========================================================
   HUBCONVERTER - IMAGE BACKGROUND REMOVER
   =========================================================
   FLOW

   1. Open tool
   2. Upload image
   3. Remove background
   4. Choose background
   5. Preview
   6. Download
   ========================================================= */

/* =========================================================
   BACKGROUNDS
   All backgrounds are shown together.
   ========================================================= */

const BACKGROUNDS = [
  {
    name: "Beach",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Tropical Beach",
    url: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Ocean",
    url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Palm Beach",
    url: "https://images.unsplash.com/photo-1505881502353-a1986add3762?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Mountain",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Snow Mountain",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Green Mountain",
    url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Forest",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Deep Forest",
    url: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Pine Forest",
    url: "https://images.unsplash.com/photo-1473445361085-b9a07f55608b?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Green Nature",
    url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Garden",
    url: "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Flowers",
    url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Flower Field",
    url: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Sunset",
    url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Sunrise",
    url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Lake",
    url: "https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Waterfall",
    url: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Desert",
    url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Golden Desert",
    url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "City",
    url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Night City",
    url: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "New York Style",
    url: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "City Street",
    url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Modern Office",
    url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Office Desk",
    url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Modern Room",
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Luxury Room",
    url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Living Room",
    url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Studio",
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "White Studio",
    url: "https://images.unsplash.com/photo-1497366811362-6870744d04b2?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Road",
    url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Highway",
    url: "https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Country Road",
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Cloudy Sky",
    url: "https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Blue Sky",
    url: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Pink Sky",
    url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Lake Mountains",
    url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Architecture",
    url: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Luxury Hotel",
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Cafe",
    url: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=85",
  },
];

/* =========================================================
   COLORS
   ========================================================= */

const COLORS = [
  { name: "White", value: "#ffffff" },
  { name: "Black", value: "#000000" },
  { name: "Light Gray", value: "#e5e7eb" },
  { name: "Gray", value: "#6b7280" },
  { name: "Dark Gray", value: "#374151" },
  { name: "Red", value: "#ef4444" },
  { name: "Pink", value: "#ec4899" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Sky Blue", value: "#38bdf8" },
  { name: "Green", value: "#22c55e" },
  { name: "Dark Green", value: "#15803d" },
  { name: "Yellow", value: "#facc15" },
  { name: "Orange", value: "#f97316" },
  { name: "Brown", value: "#92400e" },
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

    /*
     * Important for remote Unsplash backgrounds.
     */
    image.crossOrigin = "anonymous";

    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("Image could not be loaded."));

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

  const [selectedBackground, setSelectedBackground] =
    useState(null);

  const [selectedColor, setSelectedColor] =
    useState("transparent");

  const [backgroundMode, setBackgroundMode] =
    useState("image");

  const [zoom, setZoom] = useState(100);

  const [backgroundSearch, setBackgroundSearch] =
    useState("");

  const currentFile =
    files[selectedIndex] || null;

  /* =======================================================
     CURRENT IMAGE
     ======================================================= */

  useEffect(() => {
    if (!currentFile) {
      setOriginalUrl("");
      setRemovedUrl("");
      return;
    }

    const url =
      URL.createObjectURL(currentFile);

    setOriginalUrl(url);
    setRemovedUrl("");
    setSelectedBackground(null);
    setSelectedColor("transparent");
    setBackgroundMode("image");
    setZoom(100);
    setError("");

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [currentFile]);

  /* =======================================================
     CLEANUP REMOVED IMAGE
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

    const incoming =
      Array.from(fileList || []);

    if (!incoming.length) {
      return;
    }

    const validFiles = [];

    for (const file of incoming) {
      if (!file.type.startsWith("image/")) {
        setError(
          `${file.name} is not an image file.`
        );
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
      const wasEmpty =
        current.length === 0;

      const updated = [
        ...current,
        ...validFiles,
      ];

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
     DRAG OVER
     ======================================================= */

  function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect =
        "copy";
    }
  }

  /* =======================================================
     DROP
     ======================================================= */

  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    addFiles(
      event.dataTransfer.files
    );
  }

  /* =======================================================
     REMOVE FILE
     ======================================================= */

  function removeFile(index) {
    setFiles((current) => {
      const next =
        current.filter(
          (_, i) => i !== index
        );

      if (!next.length) {
        setSelectedIndex(0);
        return next;
      }

      if (index < selectedIndex) {
        setSelectedIndex((value) =>
          Math.max(0, value - 1)
        );
      } else if (
        index === selectedIndex
      ) {
        setSelectedIndex((value) =>
          Math.min(
            value,
            next.length - 1
          )
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
      setError(
        "Please upload an image first."
      );
      return;
    }

    try {
      setProcessing(true);
      setError("");

      const module =
        await import(
          "@imgly/background-removal"
        );

      const removeBg =
        module.removeBackground ||
        module.default?.removeBackground ||
        module.default;

      if (
        typeof removeBg !== "function"
      ) {
        throw new Error(
          "Background removal engine could not be loaded."
        );
      }

      const result =
        await removeBg(
          currentFile,
          {
            output: {
              format: "image/png",
            },
          }
        );

      const blob =
        result instanceof Blob
          ? result
          : new Blob(
              [result],
              {
                type: "image/png",
              }
            );

      const url =
        URL.createObjectURL(blob);

      setRemovedUrl((oldUrl) => {
        if (oldUrl) {
          URL.revokeObjectURL(
            oldUrl
          );
        }

        return url;
      });

      /*
       * Automatically move the user
       * to background selection.
       */
      setBackgroundMode("image");
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
     FILTER BACKGROUNDS
     ======================================================= */

  const filteredBackgrounds =
    useMemo(() => {
      const search =
        backgroundSearch
          .trim()
          .toLowerCase();

      if (!search) {
        return BACKGROUNDS;
      }

      return BACKGROUNDS.filter(
        (background) =>
          background.name
            .toLowerCase()
            .includes(search)
      );
    }, [backgroundSearch]);

  /* =======================================================
     CREATE FINAL IMAGE
     ======================================================= */

  async function createFinalImage() {
    if (!currentFile) {
      throw new Error(
        "No image selected."
      );
    }

    if (!removedUrl) {
      throw new Error(
        "Please remove the background first."
      );
    }

    const foreground =
      await loadImage(
        removedUrl
      );

    const canvas =
      document.createElement(
        "canvas"
      );

    const maxDimension = 1800;

    let width =
      foreground.naturalWidth ||
      foreground.width;

    let height =
      foreground.naturalHeight ||
      foreground.height;

    if (
      width > maxDimension ||
      height > maxDimension
    ) {
      const ratio =
        Math.min(
          maxDimension / width,
          maxDimension / height
        );

      width =
        Math.round(
          width * ratio
        );

      height =
        Math.round(
          height * ratio
        );
    }

    canvas.width = width;
    canvas.height = height;

    const ctx =
      canvas.getContext("2d");

    if (!ctx) {
      throw new Error(
        "Canvas is not supported."
      );
    }

    /*
     * SOLID COLOR
     */

    if (
      backgroundMode ===
        "color" &&
      selectedColor !==
        "transparent"
    ) {
      ctx.fillStyle =
        selectedColor;

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
      backgroundMode ===
        "image" &&
      selectedBackground
    ) {
      const bg =
        await loadImage(
          selectedBackground.url
        );

      const scale =
        Math.max(
          width /
            bg.naturalWidth,
          height /
            bg.naturalHeight
        );

      const bgWidth =
        bg.naturalWidth *
        scale;

      const bgHeight =
        bg.naturalHeight *
        scale;

      const bgX =
        (width -
          bgWidth) /
        2;

      const bgY =
        (height -
          bgHeight) /
        2;

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

    return new Promise(
      (resolve, reject) => {
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
      }
    );
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

      const blob =
        await createFinalImage();

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement(
          "a"
        );

      const baseName =
        currentFile?.name
          ?.replace(
            /\.[^/.]+$/,
            ""
          )
          .replace(
            /[^a-z0-9-_]/gi,
            "-"
          ) ||
        "image";

      link.href = url;

      link.download =
        `${baseName}-background.png`;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      setTimeout(() => {
        URL.revokeObjectURL(
          url
        );
      }, 1500);
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

  const previewStyle =
    useMemo(
      () => ({
        transform:
          `scale(${zoom / 100})`,
        transformOrigin:
          "center",
      }),
      [zoom]
    );

  /* =======================================================
     FINAL PREVIEW STYLE
     ======================================================= */

  const finalPreviewStyle =
    useMemo(() => {
      if (
        backgroundMode ===
          "color" &&
        selectedColor !==
          "transparent"
      ) {
        return {
          backgroundColor:
            selectedColor,
        };
      }

      if (
        backgroundMode ===
          "image" &&
        selectedBackground
      ) {
        return {
          backgroundImage:
            `url("${selectedBackground.url}")`,
          backgroundPosition:
            "center",
          backgroundSize:
            "cover",
        };
      }

      return {};
    }, [
      backgroundMode,
      selectedColor,
      selectedBackground,
    ]);

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <>
      <style>{`

        * {
          box-sizing: border-box;
        }

        .ibg-page {
          width: 100%;
          max-width: 1450px;
          margin: 0 auto;
          padding: 24px 20px 60px;
          color: #111827;
        }

        /* ==================================================
           FIRST SCREEN - UPLOAD ONLY
           ================================================== */

        .ibg-upload-only {
          min-height: 72vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px 15px;
        }

        .ibg-upload-only-card {
          width: min(760px, 100%);
          min-height: 470px;
          background: rgba(255,255,255,0.96);
          border-radius: 24px;
          padding: 45px 35px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          box-shadow:
            0 25px 70px rgba(15,23,42,0.12);
          border: 1px solid rgba(0,0,0,0.06);
        }

        .ibg-upload-only-icon {
          width: 90px;
          height: 90px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 46px;
          margin-bottom: 25px;
          background: #eef4ff;
        }

        .ibg-upload-only-card h1 {
          margin: 0;
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 800;
        }

        .ibg-upload-only-card p {
          margin: 12px 0 30px;
          font-size: 15px;
          opacity: 0.65;
        }

        .ibg-big-upload {
          border: none;
          background: #2563eb;
          color: white;
          font-size: 22px;
          font-weight: 800;
          border-radius: 50px;
          padding: 17px 48px;
          cursor: pointer;
          transition: 0.2s ease;
          box-shadow:
            0 12px 30px rgba(37,99,235,0.25);
        }

        .ibg-big-upload:hover {
          transform: translateY(-2px);
          filter: brightness(1.05);
        }

        .ibg-drop-text {
          margin-top: 28px !important;
          margin-bottom: 4px !important;
          font-size: 20px !important;
          font-weight: 700;
          opacity: 0.7 !important;
        }

        .ibg-upload-small {
          font-size: 13px;
          opacity: 0.55;
        }

        .ibg-error-only {
          width: min(700px, 100%);
          margin: 0 auto 15px;
          padding: 13px 16px;
          border-radius: 10px;
          background: rgba(239,68,68,0.09);
          border: 1px solid rgba(239,68,68,0.2);
          color: #b91c1c;
          font-size: 13px;
          text-align: center;
        }

        /* ==================================================
           HEADER
           ================================================== */

        .ibg-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 22px;
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
          background: rgba(37,99,235,0.1);
        }

        .ibg-eyebrow {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #2563eb;
          margin-bottom: 4px;
        }

        .ibg-header h1 {
          margin: 0;
          font-size: clamp(25px,3vw,36px);
          line-height: 1.15;
        }

        .ibg-header p {
          margin: 6px 0 0;
          font-size: 14px;
          opacity: 0.65;
        }

        /* ==================================================
           MAIN LAYOUT
           ================================================== */

        .ibg-layout {
          display: grid;
          grid-template-columns: 350px minmax(0,1fr);
          gap: 22px;
          align-items: start;
        }

        /* ==================================================
           SIDEBAR
           ================================================== */

        .ibg-sidebar {
          position: sticky;
          top: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ibg-step {
          position: relative;
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 17px;
          padding: 16px;
          box-shadow:
            0 5px 20px rgba(0,0,0,0.04);
        }

        .ibg-step.locked {
          opacity: 0.52;
        }

        .ibg-step.active {
          border-color: rgba(37,99,235,0.35);
          box-shadow:
            0 8px 28px rgba(37,99,235,0.08);
        }

        .ibg-step-title {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .ibg-number {
          width: 31px;
          height: 31px;
          flex: 0 0 31px;
          border-radius: 50%;
          background: #111827;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
        }

        .ibg-step.done .ibg-number {
          background: #16a34a;
        }

        .ibg-step-title strong {
          font-size: 14px;
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
          min-height: 185px;
          border: 2px dashed rgba(37,99,235,0.4);
          border-radius: 13px;
          padding: 18px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
          background: rgba(37,99,235,0.035);
          transition: 0.2s ease;
        }

        .ibg-upload:hover {
          border-color: #2563eb;
          background: rgba(37,99,235,0.07);
        }

        .ibg-upload-icon {
          font-size: 31px;
          margin-bottom: 5px;
        }

        .ibg-upload h3 {
          font-size: 13px;
          margin: 3px 0;
        }

        .ibg-upload p {
          margin: 0 0 10px;
          font-size: 11px;
          opacity: 0.6;
        }

        .ibg-upload small {
          margin-top: 9px;
          font-size: 10px;
          opacity: 0.5;
        }

        /* ==================================================
           BUTTONS
           ================================================== */

        .ibg-blue-button,
        .ibg-green-button,
        .ibg-download-button {
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

        .ibg-green-button {
          width: 100%;
          padding: 13px 14px;
          background: #16a34a;
          color: white;
          font-size: 12px;
        }

        .ibg-green-button:hover:not(:disabled),
        .ibg-blue-button:hover,
        .ibg-download-button:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.05);
        }

        .ibg-green-button:disabled,
        .ibg-download-button:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }

        /* ==================================================
           BACKGROUND
           ================================================== */

        .ibg-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
          margin-bottom: 10px;
        }

        .ibg-tab {
          border: 1px solid rgba(0,0,0,0.1);
          background: rgba(0,0,0,0.025);
          border-radius: 9px;
          padding: 9px 6px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 800;
        }

        .ibg-tab.active {
          background: #111827;
          color: white;
        }

        .ibg-search {
          width: 100%;
          height: 40px;
          border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.12);
          padding: 0 15px;
          outline: none;
          font-size: 12px;
          margin-bottom: 10px;
        }

        .ibg-search:focus {
          border-color: #2563eb;
        }

        .ibg-background-count {
          font-size: 10px;
          opacity: 0.5;
          margin: 0 0 7px;
        }

        .ibg-background-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 7px;
          max-height: 390px;
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
          background: rgba(37,99,235,0.08);
        }

        .ibg-background-item img {
          width: 100%;
          aspect-ratio: 1.25;
          object-fit: cover;
          display: block;
          border-radius: 6px;
        }

        .ibg-background-item span {
          display: block;
          font-size: 8px;
          font-weight: 700;
          margin-top: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ==================================================
           COLORS
           ================================================== */

        .ibg-color-grid {
          display: grid;
          grid-template-columns: repeat(5,1fr);
          gap: 7px;
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
          background: rgba(37,99,235,0.08);
        }

        .ibg-color-circle {
          width: 30px;
          height: 30px;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.15);
        }

        .ibg-color-item small {
          display: block;
          font-size: 8px;
          margin-top: 3px;
          opacity: 0.6;
        }

        /* ==================================================
           WORKSPACE
           ================================================== */

        .ibg-workspace {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .ibg-preview-card,
        .ibg-images-card {
          border: 1px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.9);
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
           ORIGINAL
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
           TRANSPARENT
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
            linear-gradient(
              45deg,
              #e5e7eb 25%,
              transparent 25%
            ),
            linear-gradient(
              -45deg,
              #e5e7eb 25%,
              transparent 25%
            ),
            linear-gradient(
              45deg,
              transparent 75%,
              #e5e7eb 75%
            ),
            linear-gradient(
              -45deg,
              transparent 75%,
              #e5e7eb 75%
            );

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
            linear-gradient(
              45deg,
              #e5e7eb 25%,
              transparent 25%
            ),
            linear-gradient(
              -45deg,
              #e5e7eb 25%,
              transparent 25%
            ),
            linear-gradient(
              45deg,
              transparent 75%,
              #e5e7eb 75%
            ),
            linear-gradient(
              -45deg,
              transparent 75%,
              #e5e7eb 75%
            );

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
          font-size: 40px;
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
          border: 1px solid rgba(0,0,0,0.1);
          background: white;
          border-radius: 7px;
          cursor: pointer;
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
          background: rgba(0,0,0,0.7);
          color: white;
          cursor: pointer;
          font-size: 15px;
        }

        .ibg-add-more {
          flex: 0 0 76px;
          height: 76px;
          border: 2px dashed rgba(0,0,0,0.15);
          border-radius: 10px;
          background: transparent;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .ibg-add-more span {
          font-size: 24px;
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
          background: rgba(239,68,68,0.09);
          border: 1px solid rgba(239,68,68,0.18);
          color: #b91c1c;
          font-size: 12px;
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
          background: rgba(0,0,0,0.035);
          font-size: 11px;
        }

        .ibg-file-info span:first-child {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ==================================================
           DOWNLOAD
           ================================================== */

        .ibg-download-button {
          width: 100%;
          padding: 13px 14px;
          background: #111827;
          color: white;
          font-size: 12px;
        }

        .ibg-download-main {
          width: 100%;
          border: none;
          cursor: pointer;
          padding: 16px;
          border-radius: 12px;
          background: #2563eb;
          color: white;
          font-size: 15px;
          font-weight: 800;
          box-shadow:
            0 10px 25px rgba(37,99,235,0.2);
        }

        .ibg-download-main:hover {
          transform: translateY(-1px);
          filter: brightness(1.05);
        }

        /* ==================================================
           MOBILE
           ================================================== */

        @media (max-width: 900px) {
          .ibg-layout {
            grid-template-columns: 300px minmax(0,1fr);
          }
        }

        @media (max-width: 760px) {
          .ibg-page {
            padding: 15px 10px 40px;
          }

          .ibg-upload-only {
            min-height: 78vh;
            padding: 15px 5px;
          }

          .ibg-upload-only-card {
            min-height: 420px;
            padding: 35px 20px;
          }

          .ibg-big-upload {
            font-size: 18px;
            padding: 15px 35px;
          }

          .ibg-layout {
            display: flex;
            flex-direction: column;
          }

          .ibg-sidebar {
            position: static;
            width: 100%;
          }

          .ibg-workspace {
            width: 100%;
          }

          .ibg-background-grid {
            grid-template-columns:
              repeat(3,1fr);
            max-height: none;
          }

          .ibg-original-preview,
          .ibg-transparent-preview {
            min-height: 250px;
          }

          .ibg-final-preview {
            min-height: 330px;
          }
        }

        @media (max-width: 430px) {
          .ibg-header-icon {
            width: 45px;
            height: 45px;
            flex-basis: 45px;
            font-size: 23px;
          }

          .ibg-header h1 {
            font-size: 22px;
          }

          .ibg-background-grid {
            gap: 5px;
          }

          .ibg-upload-only-card h1 {
            font-size: 27px;
          }
        }

      `}</style>

      <section className="ibg-page">

        {/* ==================================================
            FIRST SCREEN
            ONLY UPLOAD IS SHOWN
        ================================================== */}

        {!currentFile ? (
          <>
            <div className="ibg-upload-only">

              <div
                className="ibg-upload-only-card"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >

                <div className="ibg-upload-only-icon">
                  🖼️
                </div>

                <h1>
                  Upload Image
                </h1>

                <p>
                  Remove and replace your
                  image background easily
                </p>

                <button
                  type="button"
                  className="ibg-big-upload"
                  onClick={() =>
                    inputRef.current?.click()
                  }
                >
                  Upload Image
                </button>

                <p className="ibg-drop-text">
                  or drop a file
                </p>

                <span className="ibg-upload-small">
                  JPG, PNG or WEBP · Maximum 5 MB
                </span>

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  hidden
                  onChange={handleInput}
                />

              </div>

            </div>

            {error && (
              <div className="ibg-error-only">
                ⚠ {error}
              </div>
            )}
          </>
        ) : (

          /* ==================================================
             EDITOR AFTER UPLOAD
             ================================================== */

          <>

            {/* HEADER */}

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
                  Remove background and add
                  a new background to your image
                </p>

              </div>

            </header>

            <div className="ibg-layout">

              {/* =================================================
                  LEFT WORKFLOW
                  ================================================= */}

              <aside className="ibg-sidebar">

                {/* STEP 1 */}

                <div className="ibg-step done">

                  <div className="ibg-step-title">

                    <span className="ibg-number">
                      ✓
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
                  >

                    <div className="ibg-upload-icon">
                      🖼️
                    </div>

                    <h3>
                      Add another image
                    </h3>

                    <p>
                      Drag & drop or click
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
                      JPG, PNG, WEBP · Max 5 MB
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

                {/* STEP 2 */}

                <div
                  className={
                    removedUrl
                      ? "ibg-step done"
                      : "ibg-step active"
                  }
                >

                  <div className="ibg-step-title">

                    <span className="ibg-number">
                      {removedUrl ? "✓" : "2"}
                    </span>

                    <strong>
                      Remove Background
                    </strong>

                  </div>

                  <p className="ibg-step-text">
                    Remove the original background
                    from your image automatically.
                  </p>

                  <button
                    type="button"
                    className="ibg-green-button"
                    disabled={processing}
                    onClick={removeBackground}
                  >
                    {processing
                      ? "⏳ Removing Background..."
                      : removedUrl
                      ? "✓ Background Removed"
                      : "✨ Remove Background"}
                  </button>

                </div>

                {/* STEP 3 */}

                <div
                  className={
                    !removedUrl
                      ? "ibg-step locked"
                      : selectedBackground ||
                        selectedColor !== "transparent"
                      ? "ibg-step done"
                      : "ibg-step active"
                  }
                >

                  <div className="ibg-step-title">

                    <span className="ibg-number">
                      {selectedBackground ||
                      selectedColor !==
                        "transparent"
                        ? "✓"
                        : "3"}
                    </span>

                    <strong>
                      Background
                    </strong>

                  </div>

                  {!removedUrl ? (
                    <p className="ibg-step-text">
                      Remove the background first
                      to unlock background selection.
                    </p>
                  ) : (
                    <>

                      <div className="ibg-tabs">

                        <button
                          type="button"
                          className={
                            backgroundMode ===
                            "image"
                              ? "ibg-tab active"
                              : "ibg-tab"
                          }
                          onClick={() => {
                            setBackgroundMode(
                              "image"
                            );
                            setSelectedColor(
                              "transparent"
                            );
                          }}
                        >
                          🖼️ Background
                        </button>

                        <button
                          type="button"
                          className={
                            backgroundMode ===
                            "color"
                              ? "ibg-tab active"
                              : "ibg-tab"
                          }
                          onClick={() => {
                            setBackgroundMode(
                              "color"
                            );
                            setSelectedBackground(
                              null
                            );
                          }}
                        >
                          🎨 Color
                        </button>

                      </div>

                      {backgroundMode ===
                        "image" && (
                        <>

                          <input
                            className="ibg-search"
                            type="text"
                            placeholder="Search backgrounds..."
                            value={
                              backgroundSearch
                            }
                            onChange={(event) =>
                              setBackgroundSearch(
                                event.target.value
                              )
                            }
                          />

                          <p className="ibg-background-count">
                            {filteredBackgrounds.length} backgrounds available
                          </p>

                          <div className="ibg-background-grid">

                            {filteredBackgrounds.map(
                              (background) => (
                                <button
                                  type="button"
                                  key={
                                    background.name
                                  }
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
                                    src={
                                      background.url
                                    }
                                    alt={
                                      background.name
                                    }
                                    loading="lazy"
                                  />

                                  <span>
                                    {
                                      background.name
                                    }
                                  </span>

                                </button>
                              )
                            )}

                          </div>

                        </>
                      )}

                      {backgroundMode ===
                        "color" && (
                        <div className="ibg-color-grid">

                          {COLORS.map(
                            (color) => (
                              <button
                                type="button"
                                key={
                                  color.name
                                }
                                className={
                                  selectedColor ===
                                  color.value
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
                              >

                                <span
                                  className="ibg-color-circle"
                                  style={{
                                    background:
                                      color.value,
                                  }}
                                />

                                <small>
                                  {color.name}
                                </small>

                              </button>
                            )
                          )}

                        </div>
                      )}

                    </>
                  )}

                </div>

                {/* STEP 4 */}

                <div
                  className={
                    !removedUrl ||
                    (!selectedBackground &&
                      selectedColor ===
                        "transparent")
                      ? "ibg-step locked"
                      : "ibg-step done"
                  }
                >

                  <div className="ibg-step-title">

                    <span className="ibg-number">
                      {removedUrl &&
                      (selectedBackground ||
                        selectedColor !==
                          "transparent")
                        ? "✓"
                        : "4"}
                    </span>

                    <strong>
                      Preview
                    </strong>

                  </div>

                  <p className="ibg-step-text">
                    Preview your final image
                    with the selected background.
                  </p>

                </div>

                {/* STEP 5 */}

                <div
                  className={
                    !removedUrl ||
                    (!selectedBackground &&
                      selectedColor ===
                        "transparent")
                      ? "ibg-step locked"
                      : "ibg-step active"
                  }
                >

                  <div className="ibg-step-title">

                    <span className="ibg-number">
                      5
                    </span>

                    <strong>
                      Download
                    </strong>

                  </div>

                  <p className="ibg-step-text">
                    Your finished image is ready.
                  </p>

                  <button
                    type="button"
                    className="ibg-download-button"
                    disabled={
                      !removedUrl ||
                      (!selectedBackground &&
                        selectedColor ===
                          "transparent")
                    }
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

                {/* ORIGINAL IMAGE */}

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

                {/* REMOVED IMAGE */}

                <div className="ibg-preview-card">

                  <div className="ibg-card-heading">

                    <h2>
                      Background Removed
                    </h2>

                    <span>
                      {removedUrl
                        ? "✓ Ready"
                        : "Waiting"}
                    </span>

                  </div>

                  <div className="ibg-transparent-preview">

                    {removedUrl ? (
                      <img
                        src={removedUrl}
                        alt="Background removed"
                        style={
                          previewStyle
                        }
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

                {/* FINAL PREVIEW */}

                <div className="ibg-preview-card">

                  <div className="ibg-card-heading">

                    <h2>
                      Final Preview
                    </h2>

                    <div className="ibg-zoom">

                      <button
                        type="button"
                        onClick={() =>
                          setZoom(
                            (value) =>
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
                          setZoom(
                            (value) =>
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
                        style={
                          previewStyle
                        }
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

                {/* YOUR IMAGES */}

                {files.length > 0 && (
                  <div className="ibg-images-card">

                    <div className="ibg-card-heading">

                      <h2>
                        Your Images ({files.length})
                      </h2>

                    </div>

                    <div className="ibg-thumbnail-row">

                      {files.map(
                        (file, index) => (
                          <Thumbnail
                            key={`${file.name}-${index}`}
                            file={file}
                            selected={
                              index ===
                              selectedIndex
                            }
                            onClick={() =>
                              setSelectedIndex(
                                index
                              )
                            }
                            onRemove={() =>
                              removeFile(
                                index
                              )
                            }
                          />
                        )
                      )}

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

                {/* ERROR */}

                {error && (
                  <div className="ibg-error">
                    ⚠ {error}
                  </div>
                )}

                {/* FILE INFO */}

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

                {/* FINAL DOWNLOAD */}

                {removedUrl &&
                  (selectedBackground ||
                    selectedColor !==
                      "transparent") && (
                    <button
                      type="button"
                      className="ibg-download-main"
                      onClick={
                        downloadImage
                      }
                    >
                      ⬇ Download Final Image
                    </button>
                  )}

              </main>

            </div>

          </>
        )}

      </section>
    </>
  );
}

/* =========================================================
   THUMBNAIL
   ========================================================= */

function Thumbnail({
  file,
  selected,
  onClick,
  onRemove,
}) {
  const [url, setUrl] =
    useState("");

  useEffect(() => {
    const objectUrl =
      URL.createObjectURL(file);

    setUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(
        objectUrl
      );
    };
  }, [file]);

  return (
    <div
      className={
        selected
          ? "ibg-thumbnail selected"
          : "ibg-thumbnail"
      }
      onClick={onClick}
    >

      {url && (
        <img
          src={url}
          alt={file.name}
        />
      )}

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
