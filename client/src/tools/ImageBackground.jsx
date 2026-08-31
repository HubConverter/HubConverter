import React, { useEffect, useMemo, useRef, useState } from "react";
import { removeBackground } from "@imgly/background-removal";

const BACKGROUNDS = [
  {
    id: "nature-forest",
    name: "Forest",
    type: "image",
    value:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "mountains",
    name: "Mountains",
    type: "image",
    value:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "lake",
    name: "Lake",
    type: "image",
    value:
      "https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "beach",
    name: "Beach",
    type: "image",
    value:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "tropical",
    name: "Tropical",
    type: "image",
    value:
      "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "green-leaves",
    name: "Leaves",
    type: "image",
    value:
      "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "flower",
    name: "Flowers",
    type: "image",
    value:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "waterfall",
    name: "Waterfall",
    type: "image",
    value:
      "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "desert",
    name: "Desert",
    type: "image",
    value:
      "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "snow",
    name: "Snow",
    type: "image",
    value:
      "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "city",
    name: "City",
    type: "image",
    value:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "office",
    name: "Office",
    type: "image",
    value:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "desk",
    name: "Desk",
    type: "image",
    value:
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "wood",
    name: "Wood",
    type: "image",
    value:
      "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "coffee",
    name: "Coffee",
    type: "image",
    value:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "pink",
    name: "Pink",
    type: "gradient",
    value: "linear-gradient(135deg,#ff9a9e,#fad0c4)",
  },
  {
    id: "blue",
    name: "Blue",
    type: "gradient",
    value: "linear-gradient(135deg,#4facfe,#00f2fe)",
  },
  {
    id: "purple",
    name: "Purple",
    type: "gradient",
    value: "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  },
  {
    id: "sunset",
    name: "Sunset",
    type: "gradient",
    value: "linear-gradient(135deg,#ff9966,#ff5e62)",
  },
  {
    id: "green",
    name: "Green",
    type: "gradient",
    value: "linear-gradient(135deg,#56ab2f,#a8e063)",
  },
  {
    id: "cream",
    name: "Cream",
    type: "gradient",
    value: "linear-gradient(135deg,#fdfbfb,#ebedee)",
  },
  {
    id: "dark",
    name: "Dark",
    type: "gradient",
    value: "linear-gradient(135deg,#232526,#414345)",
  },
  {
    id: "sky",
    name: "Sky",
    type: "image",
    value:
      "https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "clouds",
    name: "Clouds",
    type: "image",
    value:
      "https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=1200&q=85",
  },
];

function ImageBackground() {
  const inputRef = useRef(null);
  const canvasRef = useRef(null);

  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [removedUrl, setRemovedUrl] = useState("");
  const [selectedBackground, setSelectedBackground] = useState(null);

  const [isRemoving, setIsRemoving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState("");

  const [step, setStep] = useState(1);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (removedUrl) URL.revokeObjectURL(removedUrl);
    };
  }, [originalUrl, removedUrl]);

  const selectedBg = useMemo(
    () =>
      BACKGROUNDS.find((item) => item.id === selectedBackground) || null,
    [selectedBackground]
  );

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    setError("");

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a JPG, PNG or WEBP image.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Maximum image size is 5 MB.");
      return;
    }

    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (removedUrl) URL.revokeObjectURL(removedUrl);

    const url = URL.createObjectURL(selectedFile);

    setFile(selectedFile);
    setOriginalUrl(url);
    setRemovedUrl("");
    setSelectedBackground(null);
    setStep(2);
  };

  const handleInputChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      handleFile(selectedFile);
    }

    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleRemoveBackground = async () => {
    if (!file || isRemoving) return;

    try {
      setError("");
      setIsRemoving(true);

      const resultBlob = await removeBackground(file);

      const resultUrl = URL.createObjectURL(resultBlob);

      if (removedUrl) {
        URL.revokeObjectURL(removedUrl);
      }

      setRemovedUrl(resultUrl);
      setSelectedBackground(null);
      setStep(3);
    } catch (err) {
      console.error(err);
      setError(
        "Background removal failed. Please try again with another image."
      );
    } finally {
      setIsRemoving(false);
    }
  };

  const handleBackgroundSelect = (background) => {
    if (!removedUrl) return;

    setSelectedBackground(background.id);
    setStep(4);
  };

  const loadImage = (src, crossOrigin = false) => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      if (crossOrigin) {
        img.crossOrigin = "anonymous";
      }

      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image could not be loaded."));

      img.src = src;
    });
  };

  const downloadFinalImage = async () => {
    if (!removedUrl || !selectedBg || isDownloading) return;

    try {
      setError("");
      setIsDownloading(true);

      const subjectImage = await loadImage(removedUrl);

      const canvas = canvasRef.current || document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const width = subjectImage.naturalWidth || subjectImage.width;
      const height = subjectImage.naturalHeight || subjectImage.height;

      canvas.width = width;
      canvas.height = height;

      /*
       * Draw selected background.
       */
      if (selectedBg.type === "gradient") {
        const gradientMatch = selectedBg.value.match(
          /linear-gradient\(135deg,\s*([^,]+),\s*([^)]+)\)/
        );

        if (gradientMatch) {
          const color1 = gradientMatch[1].trim();
          const color2 = gradientMatch[2].trim();

          const gradient = ctx.createLinearGradient(
            0,
            0,
            width,
            height
          );

          gradient.addColorStop(0, color1);
          gradient.addColorStop(1, color2);

          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
        } else {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
        }
      } else {
        const backgroundImage = await loadImage(
          selectedBg.value,
          true
        );

        const bgRatio =
          backgroundImage.naturalWidth / backgroundImage.naturalHeight;

        const canvasRatio = width / height;

        let drawWidth;
        let drawHeight;
        let drawX;
        let drawY;

        if (bgRatio > canvasRatio) {
          drawHeight = height;
          drawWidth = height * bgRatio;
          drawX = (width - drawWidth) / 2;
          drawY = 0;
        } else {
          drawWidth = width;
          drawHeight = width / bgRatio;
          drawX = 0;
          drawY = (height - drawHeight) / 2;
        }

        ctx.drawImage(
          backgroundImage,
          drawX,
          drawY,
          drawWidth,
          drawHeight
        );
      }

      /*
       * Draw removed subject on top.
       */
      ctx.drawImage(subjectImage, 0, 0, width, height);

      const finalImage = canvas.toDataURL("image/png", 1);

      const link = document.createElement("a");

      const originalName =
        file?.name?.replace(/\.[^/.]+$/, "") || "image";

      link.download = `${originalName}-background-removed.png`;
      link.href = finalImage;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);

      /*
       * If a remote background blocks canvas export,
       * tell the user rather than producing a broken file.
       */
      setError(
        "This background could not be downloaded. Please select another background."
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const resetTool = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (removedUrl) URL.revokeObjectURL(removedUrl);

    setFile(null);
    setOriginalUrl("");
    setRemovedUrl("");
    setSelectedBackground(null);
    setError("");
    setStep(1);
  };

  return (
    <div className="ib-tool">
      <style>{`
        .ib-tool {
          min-height: calc(100vh - 80px);
          width: 100%;
          padding: 24px;
          box-sizing: border-box;
          background:
            radial-gradient(circle at 15% 20%, rgba(0, 210, 255, .08), transparent 35%),
            radial-gradient(circle at 85% 70%, rgba(0, 255, 200, .06), transparent 35%),
            #06121f;
          color: #fff;
        }

        .ib-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .ib-header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 800;
        }

        .ib-header p {
          margin: 7px 0 0;
          color: #aebdce;
          font-size: 14px;
        }

        .ib-layout {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 360px;
          gap: 18px;
          align-items: stretch;
        }

        .ib-main {
          min-height: 650px;
          border-radius: 22px;
          background: #eef2f7;
          overflow: hidden;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 28px;
          box-sizing: border-box;
        }

        .ib-upload {
          width: min(700px, 100%);
          min-height: 420px;
          border: 2px dashed #2c76ff;
          border-radius: 22px;
          background: #f7f9fc;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          cursor: pointer;
          transition: .2s;
          box-sizing: border-box;
          padding: 30px;
        }

        .ib-upload:hover {
          background: #edf4ff;
          transform: translateY(-2px);
        }

        .ib-upload-icon {
          font-size: 62px;
          margin-bottom: 12px;
        }

        .ib-upload-title {
          color: #17243a;
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .ib-upload-sub {
          color: #637086;
          font-size: 17px;
          margin-bottom: 18px;
        }

        .ib-upload-info {
          color: #8b98aa;
          font-size: 13px;
          margin-top: 15px;
        }

        .ib-select-btn,
        .ib-remove-btn,
        .ib-download-btn {
          border: 0;
          border-radius: 12px;
          padding: 14px 28px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          color: #fff;
          transition: .2s;
        }

        .ib-select-btn {
          background: linear-gradient(135deg, #1677f0, #2764e8);
        }

        .ib-select-btn:hover,
        .ib-remove-btn:hover,
        .ib-download-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.08);
        }

        .ib-image-area {
          width: 100%;
          height: 100%;
          min-height: 590px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          border-radius: 16px;
          overflow: hidden;
        }

        .ib-image-area.original {
          background: #ffffff;
        }

        .ib-original-image {
          max-width: 100%;
          max-height: 590px;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
        }

        .ib-result-background {
          position: absolute;
          inset: 0;
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
        }

        .ib-result-subject {
          position: relative;
          z-index: 2;
          max-width: 100%;
          max-height: 590px;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
        }

        .ib-side {
          background: #f7f9fc;
          border-radius: 22px;
          color: #152238;
          padding: 20px;
          box-sizing: border-box;
          max-height: 650px;
          overflow-y: auto;
        }

        .ib-side-title {
          font-size: 19px;
          font-weight: 800;
          margin-bottom: 5px;
        }

        .ib-side-desc {
          color: #708096;
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .ib-step {
          margin-bottom: 18px;
        }

        .ib-step-number {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #122039;
          color: #fff;
          font-size: 14px;
          font-weight: 800;
          margin-right: 9px;
        }

        .ib-step-label {
          font-size: 16px;
          font-weight: 800;
          vertical-align: middle;
        }

        .ib-remove-btn {
          width: 100%;
          margin-top: 12px;
          background: linear-gradient(135deg, #12b957, #0b9f49);
        }

        .ib-remove-btn:disabled {
          opacity: .65;
          cursor: wait;
          transform: none;
        }

        .ib-background-section {
          margin-top: 22px;
          border-top: 1px solid #dce2e9;
          padding-top: 18px;
        }

        .ib-background-title {
          font-size: 17px;
          font-weight: 800;
          margin-bottom: 5px;
        }

        .ib-background-desc {
          font-size: 12px;
          color: #758399;
          margin-bottom: 13px;
        }

        .ib-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 9px;
        }

        .ib-bg-card {
          height: 84px;
          border-radius: 13px;
          overflow: hidden;
          cursor: pointer;
          border: 3px solid transparent;
          box-sizing: border-box;
          position: relative;
          background: #e5eaf0;
          transition: .18s;
        }

        .ib-bg-card:hover {
          transform: scale(1.03);
        }

        .ib-bg-card.selected {
          border-color: #147cff;
          box-shadow: 0 0 0 2px rgba(20,124,255,.15);
        }

        .ib-bg-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .ib-bg-name {
          position: absolute;
          left: 5px;
          right: 5px;
          bottom: 4px;
          padding: 3px 4px;
          border-radius: 6px;
          background: rgba(0,0,0,.52);
          color: white;
          font-size: 10px;
          text-align: center;
          font-weight: 700;
        }

        .ib-download-area {
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid #dce2e9;
        }

        .ib-download-btn {
          width: 100%;
          background: linear-gradient(135deg, #09c6f9, #1167ee);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
        }

        .ib-reset-btn {
          width: 100%;
          margin-top: 10px;
          border: 1px solid #ccd5df;
          background: #fff;
          color: #34445a;
          border-radius: 10px;
          padding: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .ib-error {
          margin-top: 12px;
          background: #ffe9e9;
          color: #b42318;
          border: 1px solid #ffcaca;
          border-radius: 10px;
          padding: 10px;
          font-size: 12px;
        }

        .ib-loading {
          position: absolute;
          inset: 0;
          z-index: 10;
          background: rgba(255,255,255,.86);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: #17243a;
          text-align: center;
        }

        .ib-spinner {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 5px solid #dce7f5;
          border-top-color: #1677f0;
          animation: ib-spin 1s linear infinite;
          margin-bottom: 14px;
        }

        @keyframes ib-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .ib-success {
          margin-top: 12px;
          padding: 10px;
          background: #e7f9ee;
          border: 1px solid #b8ebcb;
          color: #087a35;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
        }

        @media (max-width: 900px) {
          .ib-layout {
            grid-template-columns: 1fr;
          }

          .ib-main {
            min-height: 520px;
          }

          .ib-image-area {
            min-height: 470px;
          }

          .ib-side {
            max-height: none;
          }
        }

        @media (max-width: 600px) {
          .ib-tool {
            padding: 12px;
          }

          .ib-header h1 {
            font-size: 22px;
          }

          .ib-main {
            padding: 12px;
            min-height: 430px;
          }

          .ib-image-area {
            min-height: 400px;
          }

          .ib-upload {
            min-height: 370px;
          }

          .ib-upload-title {
            font-size: 22px;
          }

          .ib-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .ib-bg-card {
            height: 70px;
          }
        }
      `}</style>

      <div className="ib-header">
        <h1>Image Background</h1>
        <p>Remove background and add a new background to your image</p>
      </div>

      <div className="ib-layout">
        {/* MAIN IMAGE AREA */}
        <div className="ib-main">
          {step === 1 && (
            <div
              className="ib-upload"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="ib-upload-icon">🖼️</div>

              <div className="ib-upload-title">
                Upload Image
              </div>

              <div className="ib-upload-sub">
                or drag & drop a file here
              </div>

              <button
                type="button"
                className="ib-select-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                ↑ Select Image
              </button>

              <div className="ib-upload-info">
                JPG, PNG, WEBP • Maximum 5 MB
              </div>
            </div>
          )}

          {step >= 2 && !removedUrl && originalUrl && (
            <div className="ib-image-area original">
              <img
                src={originalUrl}
                alt="Original"
                className="ib-original-image"
              />

              {isRemoving && (
                <div className="ib-loading">
                  <div className="ib-spinner" />
                  <strong>Removing background...</strong>
                  <span style={{ marginTop: 6, color: "#718096" }}>
                    Please wait
                  </span>
                </div>
              )}
            </div>
          )}

          {removedUrl && (
            <div className="ib-image-area">
              {selectedBg ? (
                <div
                  className="ib-result-background"
                  style={
                    selectedBg.type === "image"
                      ? {
                          backgroundImage: `url("${selectedBg.value}")`,
                        }
                      : {
                          background: selectedBg.value,
                        }
                  }
                />
              ) : (
                <div
                  className="ib-result-background"
                  style={{
                    backgroundImage: `
                      linear-gradient(45deg, #e9edf2 25%, transparent 25%),
                      linear-gradient(-45deg, #e9edf2 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #e9edf2 75%),
                      linear-gradient(-45deg, transparent 75%, #e9edf2 75%)
                    `,
                    backgroundSize: "28px 28px",
                    backgroundPosition:
                      "0 0, 0 14px, 14px -14px, -14px 0px",
                    backgroundColor: "#fff",
                  }}
                />
              )}

              <img
                src={removedUrl}
                alt="Background removed"
                className="ib-result-subject"
              />
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="ib-side">
          {/* STEP 1 */}
          <div className="ib-step">
            <span className="ib-step-number">1</span>
            <span className="ib-step-label">
              Upload Image
            </span>

            {file && (
              <div className="ib-success">
                ✓ Image selected
              </div>
            )}
          </div>

          {/* STEP 2 */}
          {step >= 2 && !removedUrl && (
            <div className="ib-step">
              <span className="ib-step-number">2</span>
              <span className="ib-step-label">
                Remove Background
              </span>

              <div
                style={{
                  color: "#718096",
                  fontSize: 13,
                  lineHeight: 1.5,
                  marginTop: 10,
                }}
              >
                Remove the original background automatically.
              </div>

              <button
                type="button"
                className="ib-remove-btn"
                onClick={handleRemoveBackground}
                disabled={isRemoving}
              >
                {isRemoving
                  ? "Removing..."
                  : "✨ Remove Background"}
              </button>
            </div>
          )}

          {/* BACKGROUNDS */}
          {removedUrl && (
            <>
              <div className="ib-background-section">
                <div className="ib-background-title">
                  3. Choose Background
                </div>

                <div className="ib-background-desc">
                  Select a background for your image.
                </div>

                <div className="ib-grid">
                  {BACKGROUNDS.map((background) => (
                    <button
                      key={background.id}
                      type="button"
                      className={`ib-bg-card ${
                        selectedBackground === background.id
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleBackgroundSelect(background)
                      }
                      title={background.name}
                    >
                      {background.type === "image" ? (
                        <img
                          src={background.value}
                          alt={background.name}
                          className="ib-bg-image"
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background: background.value,
                          }}
                        />
                      )}

                      <span className="ib-bg-name">
                        {background.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* DOWNLOAD ONLY AFTER BACKGROUND SELECTED */}
              {selectedBg && (
                <div className="ib-download-area">
                  <div
                    style={{
                      fontSize: 13,
                      color: "#64748b",
                      marginBottom: 10,
                      textAlign: "center",
                    }}
                  >
                    Background selected:{" "}
                    <strong>{selectedBg.name}</strong>
                  </div>

                  <button
                    type="button"
                    className="ib-download-btn"
                    onClick={downloadFinalImage}
                    disabled={isDownloading}
                  >
                    <span style={{ fontSize: 20 }}>⬇</span>

                    {isDownloading
                      ? "Preparing..."
                      : "Download Image"}
                  </button>

                  <button
                    type="button"
                    className="ib-reset-btn"
                    onClick={resetTool}
                  >
                    Start Again
                  </button>
                </div>
              )}
            </>
          )}

          {error && <div className="ib-error">{error}</div>}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={handleInputChange}
      />
    </div>
  );
}

export default ImageBackground;
