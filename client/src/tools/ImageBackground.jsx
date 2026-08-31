import React, { useEffect, useMemo, useRef, useState } from "react";
import { removeBackground } from "@imgly/background-removal";

/* =========================================================
   IMAGE BACKGROUND TOOL
   ========================================================= */

const BACKGROUNDS = [
  // Nature
  {
    id: "forest",
    name: "Forest",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "mountains",
    name: "Mountains",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "lake-mountains",
    name: "Mountain Lake",
    url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "waterfall",
    name: "Waterfall",
    url: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "green-nature",
    name: "Green Nature",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "tropical",
    name: "Tropical",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85",
  },

  // Beaches
  {
    id: "beach",
    name: "Beach",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "ocean",
    name: "Ocean",
    url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "blue-water",
    name: "Blue Water",
    url: "https://images.unsplash.com/photo-1505881502353-a1986add3762?auto=format&fit=crop&w=900&q=85",
  },

  // Sky / Sunset
  {
    id: "sunset",
    name: "Sunset",
    url: "https://images.unsplash.com/photo-1472120435266-53107fd0c44a?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "sunrise",
    name: "Sunrise",
    url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "clouds",
    name: "Clouds",
    url: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "night-sky",
    name: "Night Sky",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "stars",
    name: "Stars",
    url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=85",
  },

  // City
  {
    id: "city",
    name: "City",
    url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "city-night",
    name: "City Night",
    url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "downtown",
    name: "Downtown",
    url: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?auto=format&fit=crop&w=900&q=85",
  },

  // Office / Interior
  {
    id: "office",
    name: "Office",
    url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "modern-office",
    name: "Modern Office",
    url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "interior",
    name: "Interior",
    url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "living-room",
    name: "Living Room",
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85",
  },

  // Wood / Marble / Studio
  {
    id: "wood",
    name: "Wood",
    url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "dark-wood",
    name: "Dark Wood",
    url: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "marble",
    name: "Marble",
    url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "white-studio",
    name: "White Studio",
    url: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "concrete",
    name: "Concrete",
    url: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=85",
  },

  // Flowers
  {
    id: "flowers",
    name: "Flowers",
    url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "pink-flowers",
    name: "Pink Flowers",
    url: "https://images.unsplash.com/photo-1492447166138-50c3889fccb1?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "garden",
    name: "Garden",
    url: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=900&q=85",
  },

  // Abstract / Colorful
  {
    id: "gradient",
    name: "Gradient",
    url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "purple",
    name: "Purple",
    url: "https://images.unsplash.com/photo-1557682260-96773eb01377?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "blue",
    name: "Blue",
    url: "https://images.unsplash.com/photo-1557682257-2f9c37a3a5f0?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "pink",
    name: "Pink",
    url: "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?auto=format&fit=crop&w=900&q=85",
  },

  // Travel
  {
    id: "desert",
    name: "Desert",
    url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "road",
    name: "Road",
    url: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "autumn",
    name: "Autumn",
    url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85",
  },
];

/* =========================================================
   COLORS
   ========================================================= */

const COLORS = [
  "#ffffff",
  "#f5f5f5",
  "#eeeeee",
  "#dfe6e9",
  "#b2bec3",
  "#636e72",

  "#000000",
  "#111827",
  "#1e293b",
  "#334155",
  "#475569",

  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",

  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",

  "#ec4899",
  "#f43f5e",

  "#fecaca",
  "#fed7aa",
  "#fef08a",
  "#d9f99d",
  "#bbf7d0",
  "#a5f3fc",
  "#bfdbfe",
  "#ddd6fe",
  "#fbcfe8",
];

/* =========================================================
   COMPONENT
   ========================================================= */

export default function ImageBackground() {
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const [originalFile, setOriginalFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState("");

  const [removedUrl, setRemovedUrl] = useState("");
  const [selectedBackground, setSelectedBackground] = useState(null);

  const [activeTab, setActiveTab] = useState("image");

  const [isRemoving, setIsRemoving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  /* ---------------------------------------------------------
     PRELOAD BACKGROUNDS
     --------------------------------------------------------- */

  useEffect(() => {
    BACKGROUNDS.forEach((background) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = background.url;
    });
  }, []);

  /* ---------------------------------------------------------
     CLEANUP URLS
     --------------------------------------------------------- */

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (removedUrl) URL.revokeObjectURL(removedUrl);
    };
  }, [originalUrl, removedUrl]);

  /* ---------------------------------------------------------
     HANDLE FILE
     --------------------------------------------------------- */

  const handleFile = async (file) => {
    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a JPG, PNG or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Maximum image size is 5 MB.");
      return;
    }

    if (originalUrl) {
      URL.revokeObjectURL(originalUrl);
    }

    if (removedUrl) {
      URL.revokeObjectURL(removedUrl);
    }

    const url = URL.createObjectURL(file);

    setOriginalFile(file);
    setOriginalUrl(url);
    setRemovedUrl("");
    setSelectedBackground(null);
  };

  /* ---------------------------------------------------------
     INPUT
     --------------------------------------------------------- */

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFile(file);
    }

    event.target.value = "";
  };

  /* ---------------------------------------------------------
     DRAG & DROP
     --------------------------------------------------------- */

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  /* ---------------------------------------------------------
     REMOVE BACKGROUND
     --------------------------------------------------------- */

  const handleRemoveBackground = async () => {
    if (!originalFile) return;

    try {
      setError("");
      setIsRemoving(true);

      const result = await removeBackground(originalFile, {
        output: {
          format: "image/png",
        },
      });

      const resultUrl = URL.createObjectURL(result);

      setRemovedUrl(resultUrl);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to remove the background. Please try another image."
      );
    } finally {
      setIsRemoving(false);
    }
  };

  /* ---------------------------------------------------------
     SELECT BACKGROUND
     --------------------------------------------------------- */

  const chooseImageBackground = (background) => {
    if (!removedUrl) return;

    setSelectedBackground({
      type: "image",
      value: background.url,
      name: background.name,
    });
  };

  const chooseColor = (color) => {
    if (!removedUrl) return;

    setSelectedBackground({
      type: "color",
      value: color,
      name: "Color",
    });
  };

  /* ---------------------------------------------------------
     PREVIEW BACKGROUND STYLE
     --------------------------------------------------------- */

  const previewStyle = useMemo(() => {
    if (!selectedBackground) {
      return {};
    }

    if (selectedBackground.type === "color") {
      return {
        background: selectedBackground.value,
      };
    }

    return {
      backgroundImage: `url("${selectedBackground.value}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }, [selectedBackground]);

  /* ---------------------------------------------------------
     DOWNLOAD
     --------------------------------------------------------- */

  const downloadImage = async () => {
    if (!removedUrl || !selectedBackground) return;

    try {
      setIsDownloading(true);
      setError("");

      const canvas = canvasRef.current;

      const subject = new Image();
      subject.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        subject.onload = resolve;
        subject.onerror = reject;
        subject.src = removedUrl;
      });

      const width = subject.naturalWidth || subject.width;
      const height = subject.naturalHeight || subject.height;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      if (selectedBackground.type === "color") {
        ctx.fillStyle = selectedBackground.value;
        ctx.fillRect(0, 0, width, height);
      } else {
        const background = new Image();
        background.crossOrigin = "anonymous";

        await new Promise((resolve, reject) => {
          background.onload = resolve;
          background.onerror = reject;
          background.src = selectedBackground.value;
        });

        /* Cover background */

        const scale = Math.max(
          width / background.naturalWidth,
          height / background.naturalHeight
        );

        const bgWidth = background.naturalWidth * scale;
        const bgHeight = background.naturalHeight * scale;

        const bgX = (width - bgWidth) / 2;
        const bgY = (height - bgHeight) / 2;

        ctx.drawImage(
          background,
          bgX,
          bgY,
          bgWidth,
          bgHeight
        );
      }

      /* Draw removed subject */

      ctx.drawImage(subject, 0, 0, width, height);

      const finalUrl = canvas.toDataURL("image/png", 1);

      const link = document.createElement("a");

      link.href = finalUrl;
      link.download = "HubConverter-Background-Removed.png";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      setError(
        "Download failed. Please try another background."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  /* ---------------------------------------------------------
     START OVER
     --------------------------------------------------------- */

  const startOver = () => {
    if (originalUrl) {
      URL.revokeObjectURL(originalUrl);
    }

    if (removedUrl) {
      URL.revokeObjectURL(removedUrl);
    }

    setOriginalFile(null);
    setOriginalUrl("");
    setRemovedUrl("");
    setSelectedBackground(null);
    setError("");
    setActiveTab("image");
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="hub-image-bg-tool">

      <style>{`
        * {
          box-sizing: border-box;
        }

        .hub-image-bg-tool {
          width: 100%;
          min-height: calc(100vh - 80px);
          padding: 22px;
          display: flex;
          gap: 20px;
          background:
            radial-gradient(
              circle at top left,
              rgba(0, 210, 255, 0.12),
              transparent 35%
            ),
            linear-gradient(
              135deg,
              #061522,
              #07111f 55%,
              #031019
            );
          color: #fff;
        }

        /* ============================================
           LEFT SIDEBAR
           ============================================ */

        .hub-bg-sidebar {
          width: 285px;
          min-width: 285px;
          height: calc(100vh - 124px);
          max-height: 850px;
          border: 1px solid rgba(0, 220, 255, 0.32);
          border-radius: 18px;
          background: rgba(7, 20, 34, 0.96);
          box-shadow:
            0 15px 50px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255,255,255,0.04);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* ============================================
           TABS
           ============================================ */

        .hub-bg-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          padding: 10px;
          gap: 7px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .hub-bg-tab {
          height: 48px;
          border: 0;
          border-radius: 11px;
          background: transparent;
          color: #aebccc;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .hub-bg-tab:hover {
          background: rgba(255,255,255,0.06);
          color: #fff;
        }

        .hub-bg-tab.active {
          background: #fff;
          color: #087cf2;
          box-shadow: 0 5px 18px rgba(0,0,0,0.18);
        }

        /* ============================================
           SIDEBAR TITLE
           ============================================ */

        .hub-bg-sidebar-title {
          padding: 12px 14px 8px;
          font-size: 12px;
          color: #8fa5ba;
        }

        /* ============================================
           GALLERY
           ============================================ */

        .hub-bg-gallery {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 8px 12px 12px;
          scrollbar-width: thin;
          scrollbar-color: #4e657a transparent;
        }

        .hub-bg-gallery::-webkit-scrollbar {
          width: 7px;
        }

        .hub-bg-gallery::-webkit-scrollbar-track {
          background: transparent;
        }

        .hub-bg-gallery::-webkit-scrollbar-thumb {
          background: #42576b;
          border-radius: 20px;
        }

        .hub-bg-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .hub-bg-thumb {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          border: 2px solid transparent;
          padding: 0;
          border-radius: 11px;
          overflow: hidden;
          cursor: pointer;
          background: #152333;
          transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .hub-bg-thumb:hover {
          transform: translateY(-2px);
          border-color: #16d9ff;
          box-shadow: 0 5px 18px rgba(0, 210, 255, 0.2);
        }

        .hub-bg-thumb.selected {
          border-color: #00eaff;
          box-shadow:
            0 0 0 2px rgba(0,234,255,0.2),
            0 5px 20px rgba(0,234,255,0.3);
        }

        .hub-bg-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .hub-bg-color {
          width: 100%;
          height: 100%;
          border-radius: 9px;
        }

        /* ============================================
           COLOR GRID
           ============================================ */

        .hub-color-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 9px;
        }

        .hub-color-thumb {
          aspect-ratio: 1 / 1;
          border-radius: 11px;
          border: 2px solid rgba(255,255,255,0.1);
          cursor: pointer;
          transition: 0.18s ease;
          box-shadow:
            inset 0 0 0 1px rgba(0,0,0,0.08);
        }

        .hub-color-thumb:hover {
          transform: scale(1.04);
          border-color: #00eaff;
        }

        .hub-color-thumb.selected {
          border-color: #00eaff;
          box-shadow:
            0 0 0 2px rgba(0,234,255,0.25),
            0 5px 20px rgba(0,234,255,0.2);
        }

        /* ============================================
           SIDEBAR ACTIONS
           ============================================ */

        .hub-bg-actions {
          padding: 10px 12px 12px;
          border-top: 1px solid rgba(255,255,255,0.08);
          background: rgba(4, 13, 23, 0.85);
        }

        .hub-bg-download {
          width: 100%;
          min-height: 45px;
          border: 0;
          border-radius: 10px;
          background:
            linear-gradient(
              90deg,
              #00c6ff,
              #3478f6,
              #00e0b5
            );
          color: #fff;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 7px 20px rgba(0, 174, 255, 0.2);
          transition: 0.2s ease;
        }

        .hub-bg-download:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(0, 174, 255, 0.32);
        }

        .hub-bg-download:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .hub-bg-reset {
          width: 100%;
          margin-top: 7px;
          min-height: 40px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.14);
          background: transparent;
          color: #c5d1dd;
          font-weight: 700;
          cursor: pointer;
        }

        .hub-bg-reset:hover {
          background: rgba(255,255,255,0.06);
          color: #fff;
        }

        /* ============================================
           RIGHT PREVIEW
           ============================================ */

        .hub-bg-main {
          flex: 1;
          min-width: 0;
          height: calc(100vh - 124px);
          max-height: 850px;
          display: flex;
          align-items: stretch;
          justify-content: center;
        }

        .hub-bg-preview {
          width: 100%;
          height: 100%;
          min-height: 480px;
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          background:
            linear-gradient(
              135deg,
              #f3f6f9,
              #dfe7ee
            );
          border: 1px solid rgba(255,255,255,0.15);
          box-shadow:
            0 20px 55px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ============================================
           EMPTY UPLOAD
           ============================================ */

        .hub-upload-box {
          width: min(620px, 85%);
          min-height: 380px;
          border: 2px dashed #74a8ff;
          border-radius: 18px;
          background: rgba(255,255,255,0.65);
          color: #40556b;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .hub-upload-box:hover,
        .hub-upload-box.drag {
          border-color: #1677ff;
          background: rgba(255,255,255,0.85);
          transform: scale(1.01);
        }

        .hub-upload-icon {
          font-size: 54px;
          margin-bottom: 18px;
        }

        .hub-upload-title {
          font-size: 27px;
          font-weight: 800;
          color: #23384e;
        }

        .hub-upload-subtitle {
          margin-top: 10px;
          font-size: 16px;
          color: #63798e;
        }

        .hub-select-btn {
          margin-top: 24px;
          padding: 13px 28px;
          border: 0;
          border-radius: 10px;
          background: #1769e8;
          color: white;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
        }

        .hub-upload-info {
          margin-top: 15px;
          font-size: 12px;
          color: #8093a6;
        }

        /* ============================================
           IMAGE PREVIEW
           ============================================ */

        .hub-subject-preview {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 35px;
          overflow: hidden;
        }

        .hub-subject-preview.checker {
          background-color: #fff;
          background-image:
            linear-gradient(45deg, #eef1f4 25%, transparent 25%),
            linear-gradient(-45deg, #eef1f4 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #eef1f4 75%),
            linear-gradient(-45deg, transparent 75%, #eef1f4 75%);
          background-size: 30px 30px;
          background-position:
            0 0,
            0 15px,
            15px -15px,
            -15px 0;
        }

        .hub-subject-preview img {
          max-width: 90%;
          max-height: 90%;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
        }

        .hub-original-preview {
          max-width: 90%;
          max-height: 90%;
          object-fit: contain;
          border-radius: 8px;
        }

        /* ============================================
           REMOVE BUTTON
           ============================================ */

        .hub-remove-panel {
          position: absolute;
          left: 22px;
          bottom: 22px;
          padding: 12px;
          border-radius: 13px;
          background: rgba(4, 15, 27, 0.92);
          border: 1px solid rgba(0,220,255,0.28);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .hub-remove-btn {
          min-width: 205px;
          min-height: 44px;
          padding: 0 18px;
          border: 0;
          border-radius: 9px;
          background: #14a94b;
          color: #fff;
          font-weight: 800;
          cursor: pointer;
        }

        .hub-remove-btn:hover:not(:disabled) {
          background: #12bd51;
        }

        .hub-remove-btn:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        /* ============================================
           STATUS
           ============================================ */

        .hub-status {
          position: absolute;
          top: 18px;
          left: 50%;
          transform: translateX(-50%);
          padding: 10px 17px;
          border-radius: 20px;
          background: rgba(4, 15, 27, 0.88);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          z-index: 5;
          white-space: nowrap;
        }

        .hub-error {
          position: absolute;
          left: 50%;
          bottom: 18px;
          transform: translateX(-50%);
          max-width: 90%;
          padding: 10px 15px;
          border-radius: 9px;
          background: #9f1239;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          z-index: 10;
        }

        /* ============================================
           HIDDEN CANVAS
           ============================================ */

        .hub-hidden-canvas {
          display: none;
        }

        /* ============================================
           MOBILE
           ============================================ */

        @media (max-width: 900px) {
          .hub-image-bg-tool {
            flex-direction: column;
            padding: 12px;
            min-height: auto;
          }

          .hub-bg-sidebar {
            width: 100%;
            min-width: 0;
            height: 280px;
            max-height: 280px;
            order: 2;
          }

          .hub-bg-main {
            width: 100%;
            height: 65vh;
            min-height: 430px;
            order: 1;
          }

          .hub-bg-preview {
            min-height: 430px;
          }

          .hub-bg-grid {
            grid-template-columns: repeat(5, 1fr);
          }

          .hub-color-grid {
            grid-template-columns: repeat(7, 1fr);
          }
        }

        @media (max-width: 600px) {
          .hub-bg-main {
            height: 55vh;
            min-height: 350px;
          }

          .hub-bg-preview {
            min-height: 350px;
            border-radius: 14px;
          }

          .hub-bg-sidebar {
            height: 270px;
            max-height: 270px;
          }

          .hub-bg-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .hub-color-grid {
            grid-template-columns: repeat(6, 1fr);
          }

          .hub-upload-box {
            min-height: 280px;
          }

          .hub-upload-title {
            font-size: 21px;
          }

          .hub-upload-icon {
            font-size: 42px;
          }

          .hub-subject-preview {
            padding: 15px;
          }

          .hub-remove-panel {
            left: 12px;
            right: 12px;
            bottom: 12px;
          }

          .hub-remove-btn {
            width: 100%;
          }
        }
      `}</style>

      {/* =====================================================
          LEFT SIDEBAR
      ===================================================== */}

      <aside className="hub-bg-sidebar">

        {/* TABS */}

        <div className="hub-bg-tabs">

          <button
            type="button"
            className={`hub-bg-tab ${
              activeTab === "image" ? "active" : ""
            }`}
            onClick={() => setActiveTab("image")}
            disabled={!removedUrl}
          >
            🖼️ Image Background
          </button>

          <button
            type="button"
            className={`hub-bg-tab ${
              activeTab === "color" ? "active" : ""
            }`}
            onClick={() => setActiveTab("color")}
            disabled={!removedUrl}
          >
            🎨 Color
          </button>

        </div>

        {!removedUrl && (
          <div className="hub-bg-sidebar-title">
            Remove the background first
          </div>
        )}

        {/* GALLERY */}

        <div className="hub-bg-gallery">

          {activeTab === "image" && (
            <div className="hub-bg-grid">

              {BACKGROUNDS.map((background) => (
                <button
                  key={background.id}
                  type="button"
                  title={background.name}
                  className={`hub-bg-thumb ${
                    selectedBackground?.value === background.url
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    chooseImageBackground(background)
                  }
                  disabled={!removedUrl}
                >
                  <img
                    src={background.url}
                    alt={background.name}
                    loading="lazy"
                  />
                </button>
              ))}

            </div>
          )}

          {activeTab === "color" && (
            <div className="hub-color-grid">

              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  title={color}
                  className={`hub-color-thumb ${
                    selectedBackground?.value === color
                      ? "selected"
                      : ""
                  }`}
                  style={{
                    background: color,
                  }}
                  onClick={() => chooseColor(color)}
                  disabled={!removedUrl}
                />
              ))}

            </div>
          )}

        </div>

        {/* ACTIONS */}

        <div className="hub-bg-actions">

          <button
            type="button"
            className="hub-bg-download"
            onClick={downloadImage}
            disabled={!selectedBackground || isDownloading}
          >
            {isDownloading
              ? "Preparing Image..."
              : "⬇ Download Image"}
          </button>

          <button
            type="button"
            className="hub-bg-reset"
            onClick={startOver}
          >
            ↻ Start Over
          </button>

        </div>

      </aside>

      {/* =====================================================
          RIGHT MAIN AREA
      ===================================================== */}

      <main className="hub-bg-main">

        <div
          className="hub-bg-preview"
          style={
            selectedBackground
              ? previewStyle
              : undefined
          }
        >

          {/* ===============================================
              NO IMAGE
          =============================================== */}

          {!originalUrl && (
            <div
              className={`hub-upload-box ${
                dragActive ? "drag" : ""
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() =>
                fileInputRef.current?.click()
              }
            >

              <div className="hub-upload-icon">
                🖼️
              </div>

              <div className="hub-upload-title">
                Upload Image
              </div>

              <div className="hub-upload-subtitle">
                or drop a file
              </div>

              <button
                type="button"
                className="hub-select-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Upload Image
              </button>

              <div className="hub-upload-info">
                JPG, PNG, WEBP · Maximum 5 MB
              </div>

            </div>
          )}

          {/* ===============================================
              ORIGINAL IMAGE
          =============================================== */}

          {originalUrl && !removedUrl && (
            <>
              <div className="hub-subject-preview checker">

                <img
                  src={originalUrl}
                  alt="Original"
                  className="hub-original-preview"
                />

              </div>

              <div className="hub-remove-panel">

                <button
                  type="button"
                  className="hub-remove-btn"
                  onClick={handleRemoveBackground}
                  disabled={isRemoving}
                >
                  {isRemoving
                    ? "✨ Removing Background..."
                    : "✨ Remove Background"}
                </button>

              </div>
            </>
          )}

          {/* ===============================================
              REMOVED BACKGROUND / FINAL PREVIEW
          =============================================== */}

          {removedUrl && (
            <div
              className="hub-subject-preview"
              style={
                selectedBackground
                  ? {}
                  : {
                      backgroundColor: "#f4f7fa",
                      backgroundImage:
                        "linear-gradient(45deg,#e8edf1 25%,transparent 25%),linear-gradient(-45deg,#e8edf1 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e8edf1 75%),linear-gradient(-45deg,transparent 75%,#e8edf1 75%)",
                      backgroundSize: "28px 28px",
                      backgroundPosition:
                        "0 0,0 14px,14px -14px,-14px 0",
                    }
              }
            >

              <img
                src={removedUrl}
                alt="Background removed"
              />

              {!selectedBackground && (
                <div className="hub-status">
                  Select a background from the left
                </div>
              )}

            </div>
          )}

          {/* STATUS */}

          {isRemoving && (
            <div className="hub-status">
              ✨ Removing background... Please wait
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="hub-error">
              {error}
            </div>
          )}

        </div>

      </main>

      {/* HIDDEN INPUT */}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        style={{ display: "none" }}
      />

      {/* HIDDEN CANVAS */}

      <canvas
        ref={canvasRef}
        className="hub-hidden-canvas"
      />

    </div>
  );
}
