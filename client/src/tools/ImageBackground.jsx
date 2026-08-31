import React, { useEffect, useMemo, useRef, useState } from "react";

/*
===========================================================
 HUBCONVERTER - IMAGE BACKGROUND
===========================================================

FLOW

1. First screen:
   - Select Image
   - Drag & Drop
   - Paste image / URL

2. After image upload:
   - Original image
   - Background is removed automatically
   - Small left sidebar
   - Background / Color
   - None option
   - Background images
   - Download

3. Multiple images:
   - First image can be selected
   - Add More Images button appears only after upload

===========================================================
*/

const MAX_FILE_SIZE = 5 * 1024 * 1024;

/* =========================================================
   BACKGROUNDS
========================================================= */

const BACKGROUNDS = [
  {
    name: "None",
    url: null,
    none: true,
  },
  {
    name: "Beach",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Ocean",
    url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Forest",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Green Nature",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Mountains",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Lake",
    url: "https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Sunset",
    url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Tropical",
    url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "City",
    url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Road",
    url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Garden",
    url: "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Hotel",
    url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Desert",
    url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Flowers",
    url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Snow",
    url: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Architecture",
    url: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Office",
    url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85",
  },
];

/* =========================================================
   COLORS
========================================================= */

const COLORS = [
  {
    name: "None",
    value: "transparent",
    none: true,
  },
  {
    name: "Rainbow",
    value: "rainbow",
    rainbow: true,
  },
  {
    name: "White",
    value: "#ffffff",
  },
  {
    name: "Red",
    value: "#ff3b30",
  },
  {
    name: "Pink",
    value: "#ec1760",
  },
  {
    name: "Purple",
    value: "#9c27b0",
  },
  {
    name: "Violet",
    value: "#673ab7",
  },
  {
    name: "Blue",
    value: "#4169e1",
  },
  {
    name: "Sky Blue",
    value: "#2196f3",
  },
  {
    name: "Cyan",
    value: "#00acc1",
  },
  {
    name: "Teal",
    value: "#009688",
  },
  {
    name: "Green",
    value: "#4caf50",
  },
  {
    name: "Light Green",
    value: "#8bc34a",
  },
  {
    name: "Lime",
    value: "#cddc39",
  },
  {
    name: "Yellow",
    value: "#ffd21c",
  },
  {
    name: "Orange",
    value: "#ff7a18",
  },
  {
    name: "Brown",
    value: "#795548",
  },
  {
    name: "Gray",
    value: "#777777",
  },
  {
    name: "Dark Gray",
    value: "#333333",
  },
  {
    name: "Black",
    value: "#000000",
  },
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

    image.onerror = () => {
      reject(new Error("Image could not be loaded."));
    };

    image.src = src;
  });
}

/* =========================================================
   COMPONENT
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

  const [selectedBackground, setSelectedBackground] =
    useState(BACKGROUNDS[0]);

  const [selectedColor, setSelectedColor] =
    useState("transparent");

  const [zoom, setZoom] = useState(100);

  const [dragActive, setDragActive] = useState(false);

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

    setSelectedBackground(BACKGROUNDS[0]);
    setSelectedColor("transparent");
    setMode("background");
    setZoom(100);
    setError("");

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [currentFile]);

  /* =======================================================
     AUTO REMOVE BACKGROUND
  ======================================================= */

  useEffect(() => {
    if (!currentFile) return;

    let cancelled = false;

    async function autoRemove() {
      try {
        setProcessing(true);
        setError("");

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

        if (cancelled) return;

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

        if (!cancelled) {
          setError(
            "Background removal could not be completed. You can still select another image."
          );
        }
      } finally {
        if (!cancelled) {
          setProcessing(false);
        }
      }
    }

    autoRemove();

    return () => {
      cancelled = true;
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

    const incoming = Array.from(fileList || []);

    if (!incoming.length) return;

    const validFiles = [];

    for (const file of incoming) {
      if (!file.type.startsWith("image/")) {
        setError(`${file.name} is not an image file.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(
          `${file.name} is larger than 5 MB. Maximum allowed size is 5 MB.`
        );
        continue;
      }

      validFiles.push(file);
    }

    if (!validFiles.length) return;

    setFiles((current) => {
      const wasEmpty = current.length === 0;

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
     FILE INPUT
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

    setDragActive(true);

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
  }

  /* =======================================================
     DRAG LEAVE
  ======================================================= */

  function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);
  }

  /* =======================================================
     DROP
  ======================================================= */

  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    addFiles(event.dataTransfer.files);
  }

  /* =======================================================
     REMOVE FILE
  ======================================================= */

  function removeFile(index) {
    setFiles((current) => {
      const next = current.filter(
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
      } else if (index === selectedIndex) {
        setSelectedIndex((value) =>
          Math.min(value, next.length - 1)
        );
      }

      return next;
    });
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

    let width =
      foreground.naturalWidth ||
      foreground.width;

    let height =
      foreground.naturalHeight ||
      foreground.height;

    const maxDimension = 2400;

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

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error(
        "Canvas is not supported."
      );
    }

    /* =====================================================
       COLOR BACKGROUND
    ===================================================== */

    if (
      mode === "color" &&
      selectedColor !== "transparent"
    ) {
      if (selectedColor === "rainbow") {
        const gradient =
          ctx.createLinearGradient(
            0,
            0,
            width,
            height
          );

        gradient.addColorStop(
          0,
          "#ff0000"
        );

        gradient.addColorStop(
          0.2,
          "#ff00a8"
        );

        gradient.addColorStop(
          0.4,
          "#8a2be2"
        );

        gradient.addColorStop(
          0.6,
          "#008cff"
        );

        gradient.addColorStop(
          0.8,
          "#00e676"
        );

        gradient.addColorStop(
          1,
          "#ffff00"
        );

        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = selectedColor;
      }

      ctx.fillRect(
        0,
        0,
        width,
        height
      );
    }

    /* =====================================================
       IMAGE BACKGROUND

       IMPORTANT:
       Background is fitted to the EXACT SAME
       WIDTH/HEIGHT as the original image.
    ===================================================== */

    if (
      mode === "background" &&
      selectedBackground &&
      selectedBackground.url
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

    /* =====================================================
       FOREGROUND

       ORIGINAL IMAGE SIZE
    ===================================================== */

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
        "Please wait for background removal to finish."
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
        document.createElement("a");

      const baseName =
        currentFile?.name
          ?.replace(/\.[^/.]+$/, "")
          .replace(
            /[^a-z0-9-_]/gi,
            "-"
          ) ||
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
      transform:
        `scale(${zoom / 100})`,
      transformOrigin:
        "center center",
    }),
    [zoom]
  );

  /* =======================================================
     BACKGROUND PREVIEW
  ======================================================= */

  const finalPreviewStyle =
    useMemo(() => {
      if (
        mode === "color" &&
        selectedColor !== "transparent"
      ) {
        if (
          selectedColor === "rainbow"
        ) {
          return {
            background:
              "linear-gradient(135deg,#ff0000,#ff00a8,#7b2cff,#0099ff,#00e676,#ffff00)",
          };
        }

        return {
          backgroundColor:
            selectedColor,
        };
      }

      if (
        mode === "background" &&
        selectedBackground?.url
      ) {
        return {
          backgroundImage:
            `url("${selectedBackground.url}")`,
          backgroundPosition:
            "center",
          backgroundSize:
            "cover",
          backgroundRepeat:
            "no-repeat",
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

        * {
          box-sizing: border-box;
        }

        /* =====================================================
           GLOBAL PAGE
        ===================================================== */

        .ibg-page {
          width: 100%;
          min-height: 100vh;
          margin: 0;
          padding: 12px 18px 22px;
          background:
            linear-gradient(
              135deg,
              #f8fafc 0%,
              #eef2f7 100%
            );
          color: #172033;
        }

        /* =====================================================
           FIRST UPLOAD SCREEN
        ===================================================== */

        .ibg-upload-screen {
          width: 100%;
          min-height: calc(100vh - 34px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 15px;
        }

        .ibg-upload-hero {
          width: min(760px, 92vw);
          min-height: min(610px, 86vh);
          border-radius: 30px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 35px 25px;
          box-shadow:
            0 20px 70px rgba(15, 23, 42, 0.10);
          position: relative;
          overflow: hidden;
        }

        .ibg-upload-hero.drag-active {
          outline:
            4px solid rgba(
              37,
              99,
              235,
              0.22
            );
          background: #f8fbff;
        }

        /* =====================================================
           COLORFUL CAMERA GRAPHIC
        ===================================================== */

        .ibg-camera-art {
          width: min(380px, 62vw);
          height: 235px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }

        .ibg-camera-ring {
          width: 215px;
          height: 215px;
          border-radius: 50%;
          position: relative;
          background:
            conic-gradient(
              from 20deg,
              #00c6ff,
              #0072ff,
              #7b2cff,
              #ff00b8,
              #ff4b2b,
              #ffd400,
              #00e676,
              #00c6ff
            );
          box-shadow:
            0 18px 45px
            rgba(91, 75, 255, 0.22);
          transform: rotate(-8deg);
        }

        .ibg-camera-ring::before {
          content: "";
          position: absolute;
          inset: 42px;
          background: #ffffff;
          border-radius: 50%;
          box-shadow:
            inset 0 0 0 2px
            rgba(255,255,255,0.8);
        }

        .ibg-camera-ring::after {
          content: "";
          position: absolute;
          width: 92px;
          height: 92px;
          left: 61px;
          top: 61px;
          border-radius: 50%;
          border:
            16px solid #25355b;
          background:
            radial-gradient(
              circle,
              #ffffff 0 18%,
              transparent 19%
            );
        }

        .ibg-camera-piece {
          position: absolute;
          width: 125px;
          height: 70px;
          background:
            linear-gradient(
              135deg,
              #1e293b,
              #334155
            );
          border-radius: 12px;
          top: 13px;
          left: 128px;
          transform:
            rotate(28deg);
          box-shadow:
            0 10px 22px
            rgba(15,23,42,0.18);
        }

        .ibg-camera-piece::after {
          content: "";
          position: absolute;
          width: 46px;
          height: 22px;
          background: #64748b;
          border-radius: 6px;
          left: 42px;
          top: 15px;
        }

        .ibg-art-dots {
          position: absolute;
          width: 75px;
          height: 75px;
          right: 4px;
          top: 40px;
          background-image:
            radial-gradient(
              #94a3b8 2px,
              transparent 2px
            );
          background-size: 14px 14px;
          opacity: 0.35;
        }

        /* =====================================================
           SELECT BUTTON
        ===================================================== */

        .ibg-main-select {
          border: none;
          cursor: pointer;
          color: white;
          font-size: clamp(
            20px,
            3vw,
            29px
          );
          font-weight: 800;
          letter-spacing: 0.2px;
          padding:
            18px 58px;
          min-width: 340px;
          border-radius: 60px;
          background:
            linear-gradient(
              90deg,
              #00b8ff,
              #1677ff,
              #9c19e8
            );
          box-shadow:
            0 13px 30px
            rgba(45, 108, 255, 0.25);
          transition:
            transform .18s ease,
            box-shadow .18s ease;
        }

        .ibg-main-select:hover {
          transform:
            translateY(-2px)
            scale(1.015);
          box-shadow:
            0 18px 35px
            rgba(45,108,255,0.30);
        }

        .ibg-drop-title {
          margin-top: 35px;
          font-size:
            clamp(
              22px,
              3vw,
              32px
            );
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }

        .ibg-paste-link {
          margin-top: 12px;
          font-size: 17px;
          color: #64748b;
          text-decoration:
            underline;
          cursor: pointer;
        }

        .ibg-upload-help {
          margin-top: 18px;
          color: #94a3b8;
          font-size: 12px;
        }

        /* =====================================================
           EDITOR HEADER
        ===================================================== */

        .ibg-editor {
          width: 100%;
          max-width: 1380px;
          margin: 0 auto;
        }

        .ibg-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .ibg-header-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          background:
            rgba(
              37,
              99,
              235,
              0.10
            );
        }

        .ibg-eyebrow {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.2px;
          color: #0ea5e9;
        }

        .ibg-header h1 {
          margin: 1px 0 0;
          font-size: 24px;
          line-height: 1.1;
        }

        .ibg-header p {
          margin: 3px 0 0;
          font-size: 11px;
          color: #64748b;
        }

        /* =====================================================
           EDITOR LAYOUT
        ===================================================== */

        .ibg-layout {
          display: grid;
          grid-template-columns:
            230px
            minmax(0, 1fr);
          gap: 14px;
          align-items: start;
        }

        /* =====================================================
           LEFT SIDEBAR
        ===================================================== */

        .ibg-sidebar {
          height: calc(100vh - 90px);
          max-height: 760px;
          min-height: 560px;
          overflow-y: auto;
          padding-right: 2px;
        }

        .ibg-sidebar::-webkit-scrollbar {
          width: 5px;
        }

        .ibg-sidebar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .ibg-sidebar-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 10px;
          margin-bottom: 10px;
          box-shadow:
            0 7px 24px
            rgba(15,23,42,0.07);
          border:
            1px solid
            rgba(15,23,42,0.06);
        }

        .ibg-sidebar-title {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 9px;
        }

        .ibg-step-number {
          width: 23px;
          height: 23px;
          border-radius: 50%;
          background: #172033;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 800;
        }

        /* =====================================================
           ADD MORE
        ===================================================== */

        .ibg-add-more-main {
          width: 100%;
          min-height: 54px;
          border-radius: 11px;
          border:
            1.5px dashed
            #0ea5e9;
          background:
            rgba(
              14,
              165,
              233,
              0.035
            );
          color: #172033;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .ibg-add-more-main:hover {
          background:
            rgba(
              14,
              165,
              233,
              0.08
            );
        }

        .ibg-format {
          margin-top: 6px;
          text-align: center;
          font-size: 9px;
          color: #64748b;
        }

        /* =====================================================
           THUMBNAILS
        ===================================================== */

        .ibg-small-thumbs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 9px;
        }

        .ibg-small-thumb {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          border: 2px solid transparent;
          cursor: pointer;
          background: #f1f5f9;
        }

        .ibg-small-thumb.selected {
          border-color: #0ea5e9;
        }

        .ibg-small-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ibg-small-thumb button {
          position: absolute;
          right: 1px;
          top: 1px;
          width: 15px;
          height: 15px;
          border: none;
          border-radius: 50%;
          background: rgba(0,0,0,.72);
          color: white;
          cursor: pointer;
          font-size: 11px;
          line-height: 14px;
          padding: 0;
        }

        /* =====================================================
           BACKGROUND / COLOR TABS
        ===================================================== */

        .ibg-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5px;
          margin-bottom: 8px;
        }

        .ibg-tab {
          border: none;
          background: #eef2f7;
          color: #475569;
          padding: 8px 4px;
          border-radius: 9px;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
        }

        .ibg-tab.active {
          background: #172033;
          color: white;
        }

        /* =====================================================
           BACKGROUND GRID
        ===================================================== */

        .ibg-background-grid {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 5px;
          max-height: 360px;
          overflow-y: auto;
          padding-right: 2px;
        }

        .ibg-background-grid::-webkit-scrollbar {
          width: 5px;
        }

        .ibg-background-grid::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 10px;
        }

        .ibg-background-item {
          min-width: 0;
          padding: 2px;
          border:
            2px solid
            transparent;
          border-radius: 8px;
          background: #f8fafc;
          cursor: pointer;
          overflow: hidden;
        }

        .ibg-background-item:hover {
          transform:
            translateY(-1px);
        }

        .ibg-background-item.selected {
          border-color: #1677ff;
        }

        .ibg-background-item img {
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          display: block;
          border-radius: 6px;
        }

        .ibg-background-item span {
          display: block;
          font-size: 7px;
          font-weight: 700;
          margin-top: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* NONE BACKGROUND */
        .ibg-none-background {
          aspect-ratio: 1 / 1;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid #e2e8f0;
          font-size: 22px;
          color: #475569;
        }

        /* =====================================================
           COLOR GRID
        ===================================================== */

        .ibg-color-grid {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 5px;
          max-height: 360px;
          overflow-y: auto;
        }

        .ibg-color-grid::-webkit-scrollbar {
          width: 5px;
        }

        .ibg-color-grid::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 10px;
        }

        .ibg-color-item {
          border:
            2px solid
            transparent;
          background: transparent;
          padding: 2px;
          border-radius: 8px;
          cursor: pointer;
        }

        .ibg-color-item.selected {
          border-color: #1677ff;
          background:
            rgba(
              37,
              99,
              235,
              0.06
            );
        }

        .ibg-color-box {
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 8px;
          border:
            1px solid
            rgba(0,0,0,.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: #475569;
        }

        .ibg-color-item small {
          display: block;
          margin-top: 2px;
          font-size: 7px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* =====================================================
           PROCESSING
        ===================================================== */

        .ibg-processing {
          padding: 8px;
          border-radius: 9px;
          background:
            rgba(
              14,
              165,
              233,
              0.08
            );
          color: #0369a1;
          font-size: 9px;
          text-align: center;
          font-weight: 700;
          margin-bottom: 8px;
        }

        /* =====================================================
           DOWNLOAD
        ===================================================== */

        .ibg-download {
          width: 100%;
          border: none;
          border-radius: 10px;
          padding: 11px;
          background:
            linear-gradient(
              90deg,
              #1677ff,
              #7c3aed
            );
          color: white;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .ibg-download:disabled {
          opacity: .4;
          cursor: not-allowed;
        }

        /* =====================================================
           WORKSPACE
        ===================================================== */

        .ibg-workspace {
          min-width: 0;
        }

        .ibg-main-card {
          background: white;
          border-radius: 18px;
          padding: 13px;
          box-shadow:
            0 10px 30px
            rgba(15,23,42,.07);
          border:
            1px solid
            rgba(15,23,42,.06);
        }

        .ibg-file-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .ibg-file-heading strong {
          display: block;
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ibg-file-heading span {
          font-size: 9px;
          color: #64748b;
          flex-shrink: 0;
        }

        /* =====================================================
           IMAGE CANVAS

           IMPORTANT:
           This is compact and uses the image ratio.
        ===================================================== */

        .ibg-canvas-area {
          width: 100%;
          height: calc(100vh - 170px);
          min-height: 420px;
          max-height: 650px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          overflow: hidden;
          background: #eef2f7;
          padding: 18px;
        }

        .ibg-image-frame {
          position: relative;
          max-width: 100%;
          max-height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 10px;
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
          background-size: 20px 20px;
          background-position:
            0 0,
            0 10px,
            10px -10px,
            -10px 0;
        }

        .ibg-image-frame img {
          display: block;
          max-width: 100%;
          max-height: calc(100vh - 220px);
          width: auto;
          height: auto;
          object-fit: contain;
        }

        /* =====================================================
           ORIGINAL IMAGE
        ===================================================== */

        .ibg-original {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 8px;
        }

        /* =====================================================
           PLACEHOLDER
        ===================================================== */

        .ibg-placeholder {
          min-height: 300px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #64748b;
          text-align: center;
        }

        .ibg-placeholder-icon {
          font-size: 38px;
          margin-bottom: 8px;
        }

        .ibg-placeholder strong {
          font-size: 14px;
        }

        .ibg-placeholder small {
          margin-top: 5px;
          font-size: 10px;
        }

        /* =====================================================
           ZOOM
        ===================================================== */

        .ibg-toolbar {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 4px;
          margin-top: 7px;
        }

        .ibg-toolbar button {
          width: 27px;
          height: 27px;
          border: 1px solid #e2e8f0;
          border-radius: 7px;
          background: white;
          cursor: pointer;
          font-weight: 800;
        }

        .ibg-toolbar span {
          min-width: 42px;
          text-align: center;
          font-size: 9px;
          font-weight: 800;
        }

        /* =====================================================
           ERROR
        ===================================================== */

        .ibg-error {
          margin-top: 8px;
          padding: 8px 10px;
          border-radius: 8px;
          background:
            rgba(
              239,
              68,
              68,
              0.08
            );
          color: #b91c1c;
          font-size: 9px;
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 850px) {

          .ibg-page {
            padding: 8px;
          }

          .ibg-layout {
            grid-template-columns: 190px minmax(0, 1fr);
            gap: 9px;
          }

          .ibg-sidebar {
            height: calc(100vh - 75px);
            min-height: 500px;
          }

          .ibg-canvas-area {
            height: calc(100vh - 145px);
            min-height: 400px;
          }

          .ibg-background-grid,
          .ibg-color-grid {
            grid-template-columns:
              repeat(3, 1fr);
          }

        }

        @media (max-width: 650px) {

          .ibg-upload-hero {
            min-height: 75vh;
            border-radius: 22px;
          }

          .ibg-main-select {
            min-width: 0;
            width: 90%;
            padding:
              15px 25px;
          }

          .ibg-camera-art {
            transform: scale(.82);
            margin-top: -10px;
            margin-bottom: -5px;
          }

          .ibg-layout {
            display: flex;
            flex-direction: column;
          }

          .ibg-sidebar {
            width: 100%;
            height: auto;
            min-height: 0;
            max-height: none;
            overflow: visible;
          }

          .ibg-workspace {
            width: 100%;
          }

          .ibg-canvas-area {
            height: 60vh;
            min-height: 330px;
          }

          .ibg-background-grid,
          .ibg-color-grid {
            max-height: 230px;
          }

        }

      `}</style>

      {/* =====================================================
          FIRST SCREEN
      ===================================================== */}

      {!currentFile && (
        <div
          className="ibg-upload-screen"
        >
          <div
            className={
              dragActive
                ? "ibg-upload-hero drag-active"
                : "ibg-upload-hero"
            }
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() =>
              inputRef.current?.click()
            }
          >

            {/* COLORFUL CAMERA */}
            <div className="ibg-camera-art">

              <div className="ibg-art-dots" />

              <div className="ibg-camera-piece" />

              <div className="ibg-camera-ring" />

            </div>

            {/* SELECT IMAGE */}

            <button
              type="button"
              className="ibg-main-select"
              onClick={(event) => {
                event.stopPropagation();
                inputRef.current?.click();
              }}
            >
              SELECT IMAGE
            </button>

            {/* DROP */}

            <div className="ibg-drop-title">
              OR DROP A FILE,
            </div>

            {/* PASTE */}

            <div
              className="ibg-paste-link"
              onClick={(event) => {
                event.stopPropagation();

                const value =
                  window.prompt(
                    "Paste image URL"
                  );

                if (!value) return;

                if (
                  value.startsWith("http")
                ) {
                  setError(
                    "Image URL support requires the image server to allow CORS. Please use Select Image or Drag & Drop if the URL does not load."
                  );
                }
              }}
            >
              paste image or URL
            </div>

            <div className="ibg-upload-help">
              JPG, PNG, WEBP · Maximum 5 MB
            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          EDITOR
      ===================================================== */}

      {currentFile && (
        <section className="ibg-page">

          <div className="ibg-editor">

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
                  Remove background and add a new background to your image
                </p>

              </div>

            </header>

            <div className="ibg-layout">

              {/* =================================================
                  LEFT SIDEBAR
              ================================================= */}

              <aside className="ibg-sidebar">

                {/* ADD MORE */}

                <div className="ibg-sidebar-card">

                  <button
                    type="button"
                    className="ibg-add-more-main"
                    onClick={() =>
                      inputRef.current?.click()
                    }
                  >
                    + Add More Images
                  </button>

                  <div className="ibg-format">
                    JPG · PNG · WEBP · Max 5 MB
                  </div>

                  {files.length > 0 && (
                    <div className="ibg-small-thumbs">

                      {files.map(
                        (file, index) => (
                          <Thumbnail
                            key={
                              `${file.name}-${index}`
                            }
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

                    </div>
                  )}

                </div>

                {/* HIDDEN INPUT */}

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  hidden
                  onChange={handleInput}
                />

                {/* BACKGROUND */}

                <div className="ibg-sidebar-card">

                  <div className="ibg-sidebar-title">

                    <span className="ibg-step-number">
                      1
                    </span>

                    Background
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
                        setMode(
                          "background"
                        )
                      }
                    >
                      🖼 Background
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

                  {/* BACKGROUND IMAGES */}

                  {mode === "background" && (
                    <div className="ibg-background-grid">

                      {BACKGROUNDS.map(
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

                            {background.none ? (
                              <div className="ibg-none-background">
                                ⊘
                              </div>
                            ) : (
                              <img
                                src={
                                  background.url
                                }
                                alt={
                                  background.name
                                }
                                loading="lazy"
                              />
                            )}

                            <span>
                              {background.name}
                            </span>

                          </button>

                        )
                      )}

                    </div>
                  )}

                  {/* COLORS */}

                  {mode === "color" && (
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
                                BACKGROUNDS[0]
                              );

                            }}
                          >

                            <div
                              className="ibg-color-box"
                              style={
                                color.rainbow
                                  ? {
                                      background:
                                        "conic-gradient(#ff0000,#ff00a8,#7b2cff,#0099ff,#00e676,#ffff00,#ff0000)",
                                    }
                                  : color.none
                                  ? {
                                      background:
                                        "#ffffff",
                                    }
                                  : {
                                      background:
                                        color.value,
                                    }
                              }
                            >

                              {color.none &&
                                "⊘"}

                            </div>

                            <small>
                              {color.name}
                            </small>

                          </button>

                        )
                      )}

                    </div>
                  )}

                </div>

                {/* PROCESSING */}

                {processing && (
                  <div className="ibg-processing">
                    ⏳ Removing background automatically...
                  </div>
                )}

                {/* DOWNLOAD */}

                <div className="ibg-sidebar-card">

                  <div className="ibg-sidebar-title">

                    <span className="ibg-step-number">
                      2
                    </span>

                    Download
                  </div>

                  <button
                    type="button"
                    className="ibg-download"
                    disabled={
                      !removedUrl ||
                      processing
                    }
                    onClick={
                      downloadImage
                    }
                  >
                    ⬇ Download Image
                  </button>

                </div>

              </aside>

              {/* =================================================
                  WORKSPACE
              ================================================= */}

              <main className="ibg-workspace">

                <div className="ibg-main-card">

                  {/* FILE NAME */}

                  <div className="ibg-file-heading">

                    <strong>
                      {currentFile.name}
                    </strong>

                    <span>
                      {selectedIndex + 1}
                      {" / "}
                      {files.length}
                    </span>

                  </div>

                  {/* IMAGE */}

                  <div className="ibg-canvas-area">

                    <div
                      className="ibg-image-frame"
                      style={
                        removedUrl
                          ? finalPreviewStyle
                          : {}
                      }
                    >

                      {removedUrl ? (

                        <img
                          src={
                            removedUrl
                          }
                          alt="Final image"
                          style={
                            previewStyle
                          }
                        />

                      ) : (

                        <img
                          src={
                            originalUrl
                          }
                          alt="Original"
                          className="ibg-original"
                        />

                      )}

                    </div>

                  </div>

                  {/* ZOOM */}

                  <div className="ibg-toolbar">

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

                  {/* FILE SIZE */}

                  <div
                    style={{
                      marginTop: "5px",
                      textAlign: "center",
                      fontSize: "9px",
                      color: "#64748b",
                    }}
                  >
                    {formatSize(
                      currentFile.size
                    )}
                    {" · "}
                    {removedUrl
                      ? "Background removed"
                      : processing
                      ? "Processing..."
                      : "Processing image"}
                  </div>

                  {/* ERROR */}

                  {error && (
                    <div className="ibg-error">
                      ⚠ {error}
                    </div>
                  )}

                </div>

              </main>

            </div>

          </div>

        </section>
      )}

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
          ? "ibg-small-thumb selected"
          : "ibg-small-thumb"
      }
      onClick={onClick}
      title={file.name}
    >

      {url && (
        <img
          src={url}
          alt={file.name}
        />
      )}

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
        aria-label={
          `Remove ${file.name}`
        }
      >
        ×
      </button>

    </div>
  );
}

export default ImageBackground;
