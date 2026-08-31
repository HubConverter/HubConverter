import React, { useEffect, useMemo, useRef, useState } from "react";
import { removeBackground } from "@imgly/background-removal";

/*
  HubConverter - Image Background Tool

  Workflow:
  1. Upload one or more images
  2. Background is removed automatically
  3. Select Background or Color from LEFT sidebar
  4. None is available at the top of both tabs
  5. Download the finished PNG
*/

// ============================================================
// BACKGROUND IMAGES
// ============================================================

const BACKGROUNDS = [
  {
    id: "none",
    name: "None",
    type: "none",
  },

  {
    id: "beach",
    name: "Beach",
    type: "image",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "ocean",
    name: "Ocean",
    type: "image",
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "forest",
    name: "Forest",
    type: "image",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "mountains",
    name: "Mountains",
    type: "image",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "lake",
    name: "Lake",
    type: "image",
    url: "https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "waterfall",
    name: "Waterfall",
    type: "image",
    url: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "green-nature",
    name: "Green Nature",
    type: "image",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "desert",
    name: "Desert",
    type: "image",
    url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "desert-sunset",
    name: "Desert Sunset",
    type: "image",
    url: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "city",
    name: "City",
    type: "image",
    url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "city-night",
    name: "City Night",
    type: "image",
    url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "office",
    name: "Office",
    type: "image",
    url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "modern-office",
    name: "Modern Office",
    type: "image",
    url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "home",
    name: "Home",
    type: "image",
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "wood",
    name: "Wood",
    type: "image",
    url: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "flowers",
    name: "Flowers",
    type: "image",
    url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "pink-flowers",
    name: "Pink Flowers",
    type: "image",
    url: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "sky",
    name: "Sky",
    type: "image",
    url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "clouds",
    name: "Clouds",
    type: "image",
    url: "https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "snow",
    name: "Snow",
    type: "image",
    url: "https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "river",
    name: "River",
    type: "image",
    url: "https://images.unsplash.com/photo-1437482078695-73f5ca6c96e2?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "road",
    name: "Road",
    type: "image",
    url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85",
  },
];

// ============================================================
// COLORS
// ============================================================

const COLORS = [
  {
    id: "none",
    name: "None",
    value: "transparent",
    type: "none",
  },

  { id: "white", name: "White", value: "#ffffff" },
  { id: "black", name: "Black", value: "#111111" },
  { id: "red", name: "Red", value: "#ff3b30" },
  { id: "pink", name: "Pink", value: "#ed1764" },
  { id: "magenta", name: "Magenta", value: "#a528b6" },
  { id: "purple", name: "Purple", value: "#6a3dbb" },
  { id: "violet", name: "Violet", value: "#7b35c8" },
  { id: "blue", name: "Blue", value: "#4255bd" },
  { id: "light-blue", name: "Light Blue", value: "#2397e9" },
  { id: "sky", name: "Sky Blue", value: "#08a8e8" },
  { id: "cyan", name: "Cyan", value: "#12b5c7" },
  { id: "teal", name: "Teal", value: "#079b8e" },
  { id: "green", name: "Green", value: "#35ae50" },
  { id: "lime", name: "Lime", value: "#8cc442" },
  { id: "yellow-green", name: "Yellow Green", value: "#cce329" },
  { id: "yellow", name: "Yellow", value: "#ffd21f" },
  { id: "orange", name: "Orange", value: "#ff8c18" },
  { id: "peach", name: "Peach", value: "#ffad8a" },
  { id: "brown", name: "Brown", value: "#875437" },
  { id: "beige", name: "Beige", value: "#ded3bd" },
  { id: "gray", name: "Gray", value: "#8b929b" },
  { id: "light-gray", name: "Light Gray", value: "#e4e7eb" },
  { id: "navy", name: "Navy", value: "#172b4d" },
];

// ============================================================
// HELPER: LOAD IMAGE
// ============================================================

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);

    img.onerror = () => {
      reject(new Error("Unable to load image."));
    };

    img.src = src;
  });
}

// ============================================================
// HELPER: CROP TRANSPARENT AREA
// ============================================================

async function trimTransparentPixels(blob) {
  const url = URL.createObjectURL(blob);

  try {
    const img = await loadImage(url);

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    const ctx = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const data = imageData.data;

    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const alpha = data[(y * canvas.width + x) * 4 + 3];

        if (alpha > 8) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX === -1 || maxY === -1) {
      return {
        url,
        width: canvas.width,
        height: canvas.height,
      };
    }

    const padding = Math.round(
      Math.min(canvas.width, canvas.height) * 0.015
    );

    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(canvas.width - 1, maxX + padding);
    maxY = Math.min(canvas.height - 1, maxY + padding);

    const cropWidth = maxX - minX + 1;
    const cropHeight = maxY - minY + 1;

    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;

    const croppedCtx = croppedCanvas.getContext("2d");

    croppedCtx.drawImage(
      canvas,
      minX,
      minY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    const croppedBlob = await new Promise((resolve) => {
      croppedCanvas.toBlob(resolve, "image/png");
    });

    if (!croppedBlob) {
      return {
        url,
        width: canvas.width,
        height: canvas.height,
      };
    }

    URL.revokeObjectURL(url);

    return {
      url: URL.createObjectURL(croppedBlob),
      width: cropWidth,
      height: cropHeight,
    };
  } catch (error) {
    return {
      url,
      width: 1,
      height: 1,
    };
  }
}

// ============================================================
// COMPONENT
// ============================================================

export default function ImageBackground() {
  const inputRef = useRef(null);
  const canvasRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const [tab, setTab] = useState("background");

  const [selectedBackground, setSelectedBackground] =
    useState("none");

  const [selectedColor, setSelectedColor] =
    useState("none");

  const [processing, setProcessing] = useState(false);

  const [error, setError] = useState("");

  const [downloadReady, setDownloadReady] = useState(false);

  const [sidebarSearch, setSidebarSearch] = useState("");

  // ----------------------------------------------------------
  // ACTIVE IMAGE
  // ----------------------------------------------------------

  const activeFile = files[activeIndex] || null;

  // ----------------------------------------------------------
  // FILTER BACKGROUNDS
  // ----------------------------------------------------------

  const filteredBackgrounds = useMemo(() => {
    const query = sidebarSearch.trim().toLowerCase();

    if (!query) {
      return BACKGROUNDS;
    }

    return BACKGROUNDS.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [sidebarSearch]);

  // ----------------------------------------------------------
  // FILTER COLORS
  // ----------------------------------------------------------

  const filteredColors = useMemo(() => {
    const query = sidebarSearch.trim().toLowerCase();

    if (!query) {
      return COLORS;
    }

    return COLORS.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [sidebarSearch]);

  // ----------------------------------------------------------
  // UPLOAD FILES
  // ----------------------------------------------------------

  const handleFiles = async (fileList) => {
    const incoming = Array.from(fileList || []);

    const valid = incoming.filter((file) => {
      const allowed =
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/webp";

      const sizeOk = file.size <= 5 * 1024 * 1024;

      return allowed && sizeOk;
    });

    if (!valid.length) {
      setError(
        "Please select JPG, PNG or WEBP images up to 5 MB."
      );
      return;
    }

    setError("");

    const startIndex = files.length;

    const newItems = valid.map((file) => ({
      id:
        `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      originalUrl: URL.createObjectURL(file),
      removedUrl: null,
      width: 0,
      height: 0,
      status: "waiting",
      error: "",
    }));

    setFiles((prev) => [...prev, ...newItems]);

    setActiveIndex(startIndex);

    setDownloadReady(false);

    // Automatically remove backgrounds.
    for (let i = 0; i < newItems.length; i++) {
      const item = newItems[i];

      setProcessing(true);

      setFiles((prev) =>
        prev.map((x) =>
          x.id === item.id
            ? {
                ...x,
                status: "processing",
              }
            : x
        )
      );

      try {
        const sourceImage = await loadImage(
          item.originalUrl
        );

        const result = await removeBackground(item.file);

        const trimmed = await trimTransparentPixels(
          result
        );

        setFiles((prev) =>
          prev.map((x) =>
            x.id === item.id
              ? {
                  ...x,
                  removedUrl: trimmed.url,
                  width:
                    sourceImage.naturalWidth ||
                    sourceImage.width,
                  height:
                    sourceImage.naturalHeight ||
                    sourceImage.height,
                  subjectWidth: trimmed.width,
                  subjectHeight: trimmed.height,
                  status: "done",
                }
              : x
          )
        );
      } catch (err) {
        console.error(err);

        setFiles((prev) =>
          prev.map((x) =>
            x.id === item.id
              ? {
                  ...x,
                  status: "error",
                  error:
                    "Background removal failed. Please try another image.",
                }
              : x
          )
        );
      }
    }

    setProcessing(false);
  };

  // ----------------------------------------------------------
  // FILE INPUT
  // ----------------------------------------------------------

  const handleInputChange = (event) => {
    handleFiles(event.target.files);

    event.target.value = "";
  };

  // ----------------------------------------------------------
  // DRAG DROP
  // ----------------------------------------------------------

  const handleDrop = (event) => {
    event.preventDefault();

    handleFiles(event.dataTransfer.files);
  };

  // ----------------------------------------------------------
  // REMOVE ONE UPLOADED FILE
  // ----------------------------------------------------------

  const removeUploadedFile = (index) => {
    setFiles((prev) => {
      const target = prev[index];

      if (target?.originalUrl) {
        URL.revokeObjectURL(target.originalUrl);
      }

      if (target?.removedUrl) {
        URL.revokeObjectURL(target.removedUrl);
      }

      const next = prev.filter((_, i) => i !== index);

      return next;
    });

    setActiveIndex((prev) => {
      if (index < prev) return prev - 1;

      if (index === prev) {
        return Math.max(0, prev - 1);
      }

      return prev;
    });

    setDownloadReady(false);
  };

  // ----------------------------------------------------------
  // BACKGROUND SELECT
  // ----------------------------------------------------------

  const chooseBackground = (id) => {
    setSelectedBackground(id);
    setSelectedColor("none");
    setDownloadReady(true);
  };

  // ----------------------------------------------------------
  // COLOR SELECT
  // ----------------------------------------------------------

  const chooseColor = (id) => {
    setSelectedColor(id);
    setSelectedBackground("none");
    setDownloadReady(true);
  };

  // ----------------------------------------------------------
  // RESET
  // ----------------------------------------------------------

  const chooseNone = () => {
    setSelectedBackground("none");
    setSelectedColor("none");
    setDownloadReady(true);
  };

  // ----------------------------------------------------------
  // DRAW FINAL IMAGE
  // ----------------------------------------------------------

  const drawFinalCanvas = async () => {
    if (!activeFile?.removedUrl) {
      throw new Error("Image is not ready.");
    }

    const subject = await loadImage(
      activeFile.removedUrl
    );

    /*
      IMPORTANT:
      Canvas dimensions are based on the ORIGINAL uploaded image.

      The background does NOT decide the canvas size.
    */

    const sourceWidth =
      activeFile.width ||
      activeFile.subjectWidth ||
      subject.naturalWidth;

    const sourceHeight =
      activeFile.height ||
      activeFile.subjectHeight ||
      subject.naturalHeight;

    const maxExportSize = 2400;

    let canvasWidth = sourceWidth;
    let canvasHeight = sourceHeight;

    if (
      canvasWidth > maxExportSize ||
      canvasHeight > maxExportSize
    ) {
      const scale = Math.min(
        maxExportSize / canvasWidth,
        maxExportSize / canvasHeight
      );

      canvasWidth = Math.round(canvasWidth * scale);
      canvasHeight = Math.round(canvasHeight * scale);
    }

    const canvas = document.createElement("canvas");

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(
      0,
      0,
      canvasWidth,
      canvasHeight
    );

    // --------------------------------------------------------
    // BACKGROUND COLOR
    // --------------------------------------------------------

    if (selectedColor !== "none") {
      const color = COLORS.find(
        (item) => item.id === selectedColor
      );

      if (color) {
        ctx.fillStyle = color.value;

        ctx.fillRect(
          0,
          0,
          canvasWidth,
          canvasHeight
        );
      }
    }

    // --------------------------------------------------------
    // BACKGROUND IMAGE
    // --------------------------------------------------------

    if (selectedBackground !== "none") {
      const background = BACKGROUNDS.find(
        (item) => item.id === selectedBackground
      );

      if (background?.url) {
        const bg = await loadImage(background.url);

        const bgRatio =
          bg.naturalWidth / bg.naturalHeight;

        const canvasRatio =
          canvasWidth / canvasHeight;

        let drawWidth;
        let drawHeight;
        let drawX;
        let drawY;

        if (bgRatio > canvasRatio) {
          drawHeight = canvasHeight;
          drawWidth =
            canvasHeight * bgRatio;

          drawX =
            (canvasWidth - drawWidth) / 2;

          drawY = 0;
        } else {
          drawWidth = canvasWidth;
          drawHeight =
            canvasWidth / bgRatio;

          drawX = 0;

          drawY =
            (canvasHeight - drawHeight) / 2;
        }

        ctx.drawImage(
          bg,
          drawX,
          drawY,
          drawWidth,
          drawHeight
        );
      }
    }

    // --------------------------------------------------------
    // SUBJECT
    // --------------------------------------------------------

    /*
      The removed subject is fitted INSIDE the original
      image dimensions.

      It does not get resized according to the background.
    */

    const subjectRatio =
      subject.naturalWidth /
      subject.naturalHeight;

    const canvasRatio =
      canvasWidth / canvasHeight;

    let subjectWidth;
    let subjectHeight;

    if (subjectRatio > canvasRatio) {
      subjectWidth = canvasWidth * 0.94;
      subjectHeight =
        subjectWidth / subjectRatio;
    } else {
      subjectHeight = canvasHeight * 0.94;
      subjectWidth =
        subjectHeight * subjectRatio;
    }

    const subjectX =
      (canvasWidth - subjectWidth) / 2;

    const subjectY =
      (canvasHeight - subjectHeight) / 2;

    ctx.drawImage(
      subject,
      subjectX,
      subjectY,
      subjectWidth,
      subjectHeight
    );

    return canvas;
  };

  // ----------------------------------------------------------
  // DOWNLOAD
  // ----------------------------------------------------------

  const handleDownload = async () => {
    if (!activeFile?.removedUrl) {
      return;
    }

    try {
      setError("");

      const canvas =
        await drawFinalCanvas();

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError(
              "Could not create the download."
            );
            return;
          }

          const url =
            URL.createObjectURL(blob);

          const link =
            document.createElement("a");

          const cleanName =
            activeFile.file.name
              .replace(/\.[^/.]+$/, "")
              .replace(/[^a-z0-9-_ ]/gi, "")
              .trim() || "image";

          link.href = url;

          link.download =
            `HubConverter-${cleanName}-background.png`;

          document.body.appendChild(link);

          link.click();

          link.remove();

          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 1000);
        },
        "image/png"
      );
    } catch (err) {
      console.error(err);

      setError(
        "Download failed. Please try again."
      );
    }
  };

  // ----------------------------------------------------------
  // DRAW PREVIEW
  // ----------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const drawPreview = async () => {
      if (!canvasRef.current) return;

      if (!activeFile?.removedUrl) {
        const canvas =
          canvasRef.current;

        const ctx =
          canvas.getContext("2d");

        canvas.width = 900;
        canvas.height = 650;

        ctx.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        return;
      }

      try {
        const canvas =
          await drawFinalCanvas();

        if (cancelled) return;

        const target =
          canvasRef.current;

        target.width = canvas.width;
        target.height = canvas.height;

        const ctx =
          target.getContext("2d");

        ctx.clearRect(
          0,
          0,
          target.width,
          target.height
        );

        ctx.drawImage(
          canvas,
          0,
          0
        );
      } catch (err) {
        console.error(err);
      }
    };

    drawPreview();

    return () => {
      cancelled = true;
    };
  }, [
    activeFile?.removedUrl,
    activeFile?.width,
    activeFile?.height,
    selectedBackground,
    selectedColor,
  ]);

  // ----------------------------------------------------------
  // PREVIEW ASPECT RATIO
  // ----------------------------------------------------------

  const previewRatio = useMemo(() => {
    if (
      activeFile?.width &&
      activeFile?.height
    ) {
      return (
        activeFile.width /
        activeFile.height
      );
    }

    return 4 / 3;
  }, [
    activeFile?.width,
    activeFile?.height,
  ]);

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="hc-image-bg-root">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .hc-image-bg-root {
          width: 100%;
          min-height: 100vh;
          padding: 18px;
          background:
            radial-gradient(
              circle at top left,
              rgba(0, 200, 255, 0.12),
              transparent 32%
            ),
            linear-gradient(
              135deg,
              #061522 0%,
              #071a29 48%,
              #06111d 100%
            );
          color: #ffffff;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .hc-image-bg-wrapper {
          width: min(1180px, 100%);
          margin: 0 auto;
        }

        .hc-image-bg-title {
          text-align: center;
          margin-bottom: 14px;
        }

        .hc-image-bg-title h1 {
          margin: 0;
          font-size: 25px;
          font-weight: 800;
          letter-spacing: -0.4px;
        }

        .hc-image-bg-title p {
          margin: 5px 0 0;
          color: #8fb0c7;
          font-size: 13px;
        }

        .hc-image-bg-editor {
          display: grid;
          grid-template-columns: 265px minmax(0, 1fr);
          gap: 14px;
          align-items: start;
        }

        /* ====================================================
           LEFT SIDEBAR
        ==================================================== */

        .hc-image-bg-sidebar {
          height: 620px;
          min-height: 0;
          overflow: hidden;

          background: rgba(7, 25, 39, 0.96);

          border: 1px solid rgba(
            0,
            207,
            255,
            0.38
          );

          border-radius: 18px;

          box-shadow:
            0 18px 45px rgba(0, 0, 0, 0.28);

          display: flex;
          flex-direction: column;
        }

        .hc-upload-box {
          padding: 12px;
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.08);
        }

        .hc-add-images {
          width: 100%;
          height: 46px;

          border-radius: 13px;

          border: 1px dashed #00d8ff;

          background: rgba(
            0,
            174,
            255,
            0.08
          );

          color: #ffffff;

          font-size: 14px;
          font-weight: 800;

          cursor: pointer;

          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        .hc-add-images:hover {
          background: rgba(
            0,
            174,
            255,
            0.18
          );

          transform: translateY(-1px);
        }

        .hc-upload-info {
          margin-top: 6px;
          text-align: center;
          color: #7da3bd;
          font-size: 11px;
        }

        /* ====================================================
           UPLOADED THUMBNAILS
        ==================================================== */

        .hc-uploaded-list {
          display: flex;
          gap: 7px;

          padding: 10px 12px;

          overflow-x: auto;

          border-bottom: 1px solid
            rgba(255, 255, 255, 0.08);
        }

        .hc-uploaded-list::-webkit-scrollbar {
          height: 4px;
        }

        .hc-uploaded-list::-webkit-scrollbar-thumb {
          background: #168db3;
          border-radius: 10px;
        }

        .hc-upload-thumb {
          position: relative;

          flex: 0 0 52px;
          width: 52px;
          height: 52px;

          border-radius: 9px;

          overflow: hidden;

          border: 1px solid
            rgba(255, 255, 255, 0.18);

          background: #102333;

          cursor: pointer;
        }

        .hc-upload-thumb.active {
          border: 2px solid #00d9ff;

          box-shadow:
            0 0 0 2px
            rgba(0, 217, 255, 0.14);
        }

        .hc-upload-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .hc-thumb-loading {
          position: absolute;
          inset: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          background: rgba(4, 17, 27, 0.68);

          font-size: 11px;
        }

        .hc-thumb-x {
          position: absolute;
          top: 2px;
          right: 2px;

          width: 17px;
          height: 17px;

          border: 0;
          border-radius: 50%;

          background: rgba(0, 0, 0, 0.78);
          color: white;

          font-size: 11px;
          line-height: 17px;

          cursor: pointer;

          padding: 0;
        }

        /* ====================================================
           STATUS
        ==================================================== */

        .hc-status {
          margin: 8px 12px;

          min-height: 31px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background: rgba(
            0,
            203,
            140,
            0.11
          );

          color: #4dffc5;

          font-size: 12px;
          font-weight: 700;

          text-align: center;
        }

        .hc-status.processing {
          background: rgba(
            255,
            190,
            0,
            0.1
          );

          color: #ffd56a;
        }

        .hc-status.error {
          background: rgba(
            255,
            60,
            60,
            0.1
          );

          color: #ff8c8c;
        }

        /* ====================================================
           TABS
        ==================================================== */

        .hc-sidebar-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;

          gap: 6px;

          padding: 0 12px 9px;
        }

        .hc-tab {
          height: 42px;

          border: 1px solid
            rgba(255, 255, 255, 0.08);

          border-radius: 11px;

          background: #11283a;

          color: #b6cad8;

          font-size: 13px;
          font-weight: 800;

          cursor: pointer;
        }

        .hc-tab.active {
          background: linear-gradient(
            135deg,
            #0cccf8,
            #16d9c1
          );

          color: #ffffff;

          border-color: transparent;
        }

        /* ====================================================
           SEARCH
        ==================================================== */

        .hc-search {
          margin: 0 12px 8px;

          width: calc(100% - 24px);

          height: 35px;

          border-radius: 10px;

          border: 1px solid
            rgba(255, 255, 255, 0.1);

          background: #0b2031;

          color: white;

          padding: 0 11px;

          outline: none;

          font-size: 12px;
        }

        .hc-search::placeholder {
          color: #7893a7;
        }

        .hc-search:focus {
          border-color: #00cfff;
        }

        /* ====================================================
           TILE AREA
        ==================================================== */

        .hc-tile-scroll {
          flex: 1;
          min-height: 0;

          overflow-y: auto;

          padding: 0 11px 12px;
        }

        .hc-tile-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .hc-tile-scroll::-webkit-scrollbar-track {
          background: #081a29;
          border-radius: 10px;
        }

        .hc-tile-scroll::-webkit-scrollbar-thumb {
          background: #168fac;
          border-radius: 10px;
        }

        .hc-tiles {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 7px;
        }

        .hc-tile {
          position: relative;

          width: 100%;
          aspect-ratio: 1 / 0.84;

          min-height: 58px;

          border-radius: 11px;

          overflow: hidden;

          border: 1px solid
            rgba(255, 255, 255, 0.12);

          background: #13293a;

          cursor: pointer;

          padding: 0;

          transition:
            transform 0.15s ease,
            border-color 0.15s ease;
        }

        .hc-tile:hover {
          transform: scale(1.025);
          border-color: #00d9ff;
        }

        .hc-tile.selected {
          border: 2px solid #078eff;

          box-shadow:
            0 0 0 1px
            rgba(0, 142, 255, 0.15);
        }

        .hc-tile img {
          display: block;

          width: 100%;
          height: 100%;

          object-fit: cover;
        }

        .hc-tile-label {
          position: absolute;

          left: 0;
          right: 0;
          bottom: 0;

          padding: 3px 2px;

          background: linear-gradient(
            transparent,
            rgba(0, 0, 0, 0.78)
          );

          color: white;

          font-size: 8px;
          font-weight: 700;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ====================================================
           NONE TILE
        ==================================================== */

        .hc-none-tile {
          background:
            linear-gradient(
              45deg,
              #eeeeee 25%,
              transparent 25%
            ),
            linear-gradient(
              -45deg,
              #eeeeee 25%,
              transparent 25%
            ),
            linear-gradient(
              45deg,
              transparent 75%,
              #eeeeee 75%
            ),
            linear-gradient(
              -45deg,
              transparent 75%,
              #eeeeee 75%
            );

          background-size: 14px 14px;

          background-position:
            0 0,
            0 7px,
            7px -7px,
            -7px 0;
        }

        .hc-none-symbol {
          position: absolute;

          inset: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 25px;

          color: #4e4e4e;

          text-shadow:
            0 1px 1px
            rgba(255, 255, 255, 0.8);
        }

        /* ====================================================
           COLOR TILE
        ==================================================== */

        .hc-color-tile {
          border-radius: 11px;
        }

        .hc-color-value {
          position: absolute;
          inset: 0;
        }

        .hc-color-tile .hc-tile-label {
          display: none;
        }

        /* ====================================================
           RIGHT PREVIEW
        ==================================================== */

        .hc-preview-area {
          min-width: 0;

          height: 620px;

          background: rgba(
            7,
            25,
            39,
            0.96
          );

          border: 1px solid rgba(
            0,
            207,
            255,
            0.38
          );

          border-radius: 18px;

          padding: 14px;

          display: flex;
          flex-direction: column;

          box-shadow:
            0 18px 45px rgba(0, 0, 0, 0.28);
        }

        .hc-preview-header {
          display: flex;

          justify-content: space-between;
          align-items: center;

          margin-bottom: 10px;

          min-height: 38px;
        }

        .hc-preview-name {
          min-width: 0;
        }

        .hc-preview-name strong {
          display: block;

          font-size: 14px;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hc-preview-name span {
          display: block;

          margin-top: 2px;

          color: #7ea1b9;

          font-size: 11px;
        }

        .hc-preview-count {
          color: #7ea1b9;

          font-size: 11px;

          flex: 0 0 auto;

          margin-left: 10px;
        }

        .hc-preview-stage {
          flex: 1;
          min-height: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          overflow: hidden;

          border-radius: 14px;

          background:
            linear-gradient(
              45deg,
              #edf0f2 25%,
              transparent 25%
            ),
            linear-gradient(
              -45deg,
              #edf0f2 25%,
              transparent 25%
            ),
            linear-gradient(
              45deg,
              transparent 75%,
              #edf0f2 75%
            ),
            linear-gradient(
              -45deg,
              transparent 75%,
              #edf0f2 75%
            );

          background-size: 28px 28px;

          background-position:
            0 0,
            0 14px,
            14px -14px,
            -14px 0;
        }

        .hc-preview-frame {
          width: min(
            100%,
            680px
          );

          height: min(
            100%,
            510px
          );

          max-width: 100%;
          max-height: 100%;

          aspect-ratio: var(
            --hc-preview-ratio
          );

          display: flex;
          align-items: center;
          justify-content: center;

          overflow: hidden;

          border-radius: 12px;

          box-shadow:
            0 14px 38px
            rgba(0, 0, 0, 0.24);

          background: transparent;
        }

        .hc-preview-canvas {
          display: block;

          width: 100%;
          height: 100%;

          object-fit: contain;

          border-radius: 12px;
        }

        .hc-empty-preview {
          text-align: center;

          color: #7797ac;

          padding: 30px;
        }

        .hc-empty-icon {
          width: 60px;
          height: 60px;

          margin: 0 auto 12px;

          border-radius: 15px;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #123049;

          font-size: 28px;
        }

        .hc-empty-preview strong {
          display: block;

          color: #c4d5e1;

          font-size: 16px;
        }

        .hc-empty-preview p {
          margin: 6px 0 0;

          font-size: 12px;
        }

        /* ====================================================
           DOWNLOAD
        ==================================================== */

        .hc-download-row {
          display: flex;

          justify-content: center;

          padding-top: 10px;
        }

        .hc-download-button {
          min-width: 210px;

          height: 43px;

          border: 0;

          border-radius: 12px;

          background: linear-gradient(
            135deg,
            #087eff,
            #0dd6ca
          );

          color: white;

          font-size: 14px;
          font-weight: 800;

          cursor: pointer;

          box-shadow:
            0 8px 20px
            rgba(0, 145, 255, 0.22);

          transition:
            transform 0.15s ease,
            opacity 0.15s ease;
        }

        .hc-download-button:hover {
          transform: translateY(-1px);
        }

        .hc-download-button:disabled {
          opacity: 0.45;

          cursor: not-allowed;

          transform: none;
        }

        /* ====================================================
           ERROR
        ==================================================== */

        .hc-error {
          margin-top: 8px;

          text-align: center;

          color: #ff9b9b;

          font-size: 12px;
        }

        /* ====================================================
           MOBILE
        ==================================================== */

        @media (max-width: 850px) {
          .hc-image-bg-root {
            padding: 10px;
          }

          .hc-image-bg-editor {
            grid-template-columns: 220px minmax(0, 1fr);
          }

          .hc-image-bg-sidebar,
          .hc-preview-area {
            height: 560px;
          }

          .hc-tiles {
            gap: 5px;
          }
        }

        @media (max-width: 700px) {
          .hc-image-bg-title h1 {
            font-size: 20px;
          }

          .hc-image-bg-editor {
            grid-template-columns: 1fr;
          }

          .hc-image-bg-sidebar {
            height: 310px;
            order: 1;
          }

          .hc-preview-area {
            height: 500px;
            order: 2;
          }

          .hc-uploaded-list {
            max-height: 72px;
          }

          .hc-preview-stage {
            min-height: 350px;
          }
        }

        @media (max-width: 420px) {
          .hc-image-bg-root {
            padding: 7px;
          }

          .hc-image-bg-sidebar {
            height: 290px;
          }

          .hc-preview-area {
            height: 430px;
            padding: 9px;
          }

          .hc-tiles {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }

          .hc-download-button {
            width: 100%;
          }
        }
      `}</style>

      <div className="hc-image-bg-wrapper">
        {/* ======================================================
            TITLE
        ====================================================== */}

        <div className="hc-image-bg-title">
          <h1>Image Background</h1>

          <p>
            Remove and replace image backgrounds
            easily
          </p>
        </div>

        {/* ======================================================
            EDITOR
        ====================================================== */}

        <div className="hc-image-bg-editor">
          {/* ====================================================
              LEFT SIDEBAR
          ==================================================== */}

          <aside className="hc-image-bg-sidebar">
            {/* Upload */}
            <div className="hc-upload-box">
              <button
                type="button"
                className="hc-add-images"
                onClick={() =>
                  inputRef.current?.click()
                }
              >
                + Add More Images
              </button>

              <input
                ref={inputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                multiple
                onChange={handleInputChange}
                style={{ display: "none" }}
              />

              <div className="hc-upload-info">
                JPG · PNG · WEBP · Max 5 MB
              </div>
            </div>

            {/* Uploaded images */}
            {files.length > 0 && (
              <div className="hc-uploaded-list">
                {files.map((item, index) => (
                  <button
                    type="button"
                    key={item.id}
                    className={
                      "hc-upload-thumb " +
                      (index === activeIndex
                        ? "active"
                        : "")
                    }
                    onClick={() => {
                      setActiveIndex(index);
                      setDownloadReady(false);
                    }}
                    title={item.file.name}
                  >
                    <img
                      src={item.originalUrl}
                      alt=""
                    />

                    {item.status ===
                      "processing" && (
                      <span className="hc-thumb-loading">
                        ✨
                      </span>
                    )}

                    <span
                      role="button"
                      tabIndex={0}
                      className="hc-thumb-x"
                      onClick={(event) => {
                        event.stopPropagation();

                        removeUploadedFile(
                          index
                        );
                      }}
                      onKeyDown={(event) => {
                        if (
                          event.key ===
                          "Enter"
                        ) {
                          event.stopPropagation();

                          removeUploadedFile(
                            index
                          );
                        }
                      }}
                    >
                      ×
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Status */}
            {files.length > 0 && (
              <div
                className={
                  "hc-status " +
                  (processing
                    ? "processing"
                    : "")
                }
              >
                {processing
                  ? "✨ Removing background automatically..."
                  : activeFile?.status ===
                    "done"
                  ? "✓ Background removed"
                  : activeFile?.status ===
                    "error"
                  ? "Background removal failed"
                  : "Preparing image..."}
              </div>
            )}

            {/* Tabs */}
            <div className="hc-sidebar-tabs">
              <button
                type="button"
                className={
                  "hc-tab " +
                  (tab === "background"
                    ? "active"
                    : "")
                }
                onClick={() => {
                  setTab("background");
                  setSidebarSearch("");
                }}
              >
                🖼 Background
              </button>

              <button
                type="button"
                className={
                  "hc-tab " +
                  (tab === "color"
                    ? "active"
                    : "")
                }
                onClick={() => {
                  setTab("color");
                  setSidebarSearch("");
                }}
              >
                🎨 Color
              </button>
            </div>

            {/* Search */}
            <input
              className="hc-search"
              value={sidebarSearch}
              onChange={(event) =>
                setSidebarSearch(
                  event.target.value
                )
              }
              placeholder={
                tab === "background"
                  ? "Search backgrounds..."
                  : "Search colors..."
              }
            />

            {/* ==================================================
                TILES
            ================================================== */}

            <div className="hc-tile-scroll">
              {tab === "background" ? (
                <div className="hc-tiles">
                  {filteredBackgrounds.map(
                    (item) => {
                      const selected =
                        selectedBackground ===
                        item.id;

                      if (
                        item.type ===
                        "none"
                      ) {
                        return (
                          <button
                            type="button"
                            key={item.id}
                            className={
                              "hc-tile hc-none-tile " +
                              (selected
                                ? "selected"
                                : "")
                            }
                            onClick={() =>
                              chooseNone()
                            }
                            title="No background"
                          >
                            <span className="hc-none-symbol">
                              ⊘
                            </span>

                            <span className="hc-tile-label">
                              None
                            </span>
                          </button>
                        );
                      }

                      return (
                        <button
                          type="button"
                          key={item.id}
                          className={
                            "hc-tile " +
                            (selected
                              ? "selected"
                              : "")
                          }
                          onClick={() =>
                            chooseBackground(
                              item.id
                            )
                          }
                          title={item.name}
                        >
                          <img
                            src={item.url}
                            alt=""
                            loading="lazy"
                          />

                          <span className="hc-tile-label">
                            {item.name}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="hc-tiles">
                  {filteredColors.map(
                    (item) => {
                      const selected =
                        selectedColor ===
                        item.id;

                      if (
                        item.type ===
                        "none"
                      ) {
                        return (
                          <button
                            type="button"
                            key={item.id}
                            className={
                              "hc-tile hc-none-tile " +
                              (selected
                                ? "selected"
                                : "")
                            }
                            onClick={() =>
                              chooseNone()
                            }
                            title="No color"
                          >
                            <span className="hc-none-symbol">
                              ⊘
                            </span>

                            <span className="hc-tile-label">
                              None
                            </span>
                          </button>
                        );
                      }

                      return (
                        <button
                          type="button"
                          key={item.id}
                          className={
                            "hc-tile hc-color-tile " +
                            (selected
                              ? "selected"
                              : "")
                          }
                          onClick={() =>
                            chooseColor(
                              item.id
                            )
                          }
                          title={item.name}
                        >
                          <span
                            className="hc-color-value"
                            style={{
                              background:
                                item.value,
                            }}
                          />
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* ====================================================
              RIGHT PREVIEW
          ==================================================== */}

          <main className="hc-preview-area">
            {activeFile ? (
              <>
                <div className="hc-preview-header">
                  <div className="hc-preview-name">
                    <strong>
                      {activeFile.file.name}
                    </strong>

                    <span>
                      {(
                        activeFile.file.size /
                        1024
                      ).toFixed(1)}{" "}
                      KB
                    </span>
                  </div>

                  <div className="hc-preview-count">
                    {activeIndex + 1} /{" "}
                    {files.length}
                  </div>
                </div>

                <div className="hc-preview-stage">
                  {activeFile.removedUrl ? (
                    <div
                      className="hc-preview-frame"
                      style={{
                        "--hc-preview-ratio":
                          previewRatio,
                      }}
                    >
                      <canvas
                        ref={canvasRef}
                        className="hc-preview-canvas"
                      />
                    </div>
                  ) : (
                    <div className="hc-empty-preview">
                      <div className="hc-empty-icon">
                        ✨
                      </div>

                      <strong>
                        {processing
                          ? "Removing background..."
                          : "Preparing image..."}
                      </strong>

                      <p>
                        Please wait a moment.
                      </p>
                    </div>
                  )}
                </div>

                {/* Download appears after selection */}
                {downloadReady &&
                  activeFile.removedUrl && (
                    <div className="hc-download-row">
                      <button
                        type="button"
                        className="hc-download-button"
                        onClick={
                          handleDownload
                        }
                      >
                        ⬇ Download Image
                      </button>
                    </div>
                  )}

                {error && (
                  <div className="hc-error">
                    {error}
                  </div>
                )}
              </>
            ) : (
              <div className="hc-empty-preview">
                <div className="hc-empty-icon">
                  🖼️
                </div>

                <strong>
                  Upload an image to get started
                </strong>

                <p>
                  Add one or more images using
                  the button on the left.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
