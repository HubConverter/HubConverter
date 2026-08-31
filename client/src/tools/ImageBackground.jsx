import React, { useEffect, useMemo, useRef, useState } from "react";
import { removeBackground as removeBgFromImage } from "@imgly/background-removal";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const BACKGROUNDS = [
  { id: "none", name: "None", type: "none" },
  { id: "beach", name: "Beach", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85" },
  { id: "ocean", name: "Ocean", url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85" },
  { id: "sunset", name: "Sunset", url: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=85" },
  { id: "forest", name: "Forest", url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=85" },
  { id: "green-nature", name: "Green Nature", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=85" },
  { id: "mountains", name: "Mountains", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=85" },
  { id: "lake", name: "Lake", url: "https://images.unsplash.com/photo-1439853949127-fa647821eba0?auto=format&fit=crop&w=900&q=85" },
  { id: "waterfall", name: "Waterfall", url: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=900&q=85" },
  { id: "desert", name: "Desert", url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=900&q=85" },
  { id: "desert-sunset", name: "Desert Sunset", url: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=900&q=85" },
  { id: "city", name: "City", url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=85" },
  { id: "city-night", name: "City Night", url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=85" },
  { id: "office", name: "Office", url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85" },
  { id: "modern-office", name: "Modern Office", url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=85" },
  { id: "home", name: "Home", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85" },
  { id: "wood", name: "Wood", url: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=85" },
  { id: "flowers", name: "Flowers", url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=85" },
  { id: "pink-flowers", name: "Pink Flowers", url: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=85" },
  { id: "sky", name: "Sky", url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85" },
  { id: "clouds", name: "Clouds", url: "https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=900&q=85" },
  { id: "snow", name: "Snow", url: "https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=900&q=85" },
  { id: "river", name: "River", url: "https://images.unsplash.com/photo-1437482078695-73f5ca6c96e2?auto=format&fit=crop&w=900&q=85" },
  { id: "road", name: "Road", url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85" },
  { id: "architecture", name: "Architecture", url: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=900&q=85" },
  { id: "coffee", name: "Cafe", url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85" },
  { id: "marble", name: "Marble", url: "https://images.unsplash.com/photo-1604079628040-94301bb21b91?auto=format&fit=crop&w=900&q=85" },
  { id: "gold", name: "Golden", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85" },
];

const COLORS = [
  { id: "none", name: "None", value: "transparent", type: "none" },
  { id: "white", name: "White", value: "#ffffff" },
  { id: "black", name: "Black", value: "#111111" },
  { id: "red", name: "Red", value: "#ff3b30" },
  { id: "orange", name: "Orange", value: "#ff7a18" },
  { id: "peach", name: "Peach", value: "#ffad8a" },
  { id: "yellow", name: "Yellow", value: "#ffd21f" },
  { id: "lime", name: "Lime", value: "#cce329" },
  { id: "green", name: "Green", value: "#35ae50" },
  { id: "mint", name: "Mint", value: "#2fd6a1" },
  { id: "teal", name: "Teal", value: "#079b8e" },
  { id: "cyan", name: "Cyan", value: "#12b5c7" },
  { id: "sky", name: "Sky Blue", value: "#08a8e8" },
  { id: "blue", name: "Blue", value: "#4255bd" },
  { id: "light-blue", name: "Light Blue", value: "#2397e9" },
  { id: "purple", name: "Purple", value: "#6a3dbb" },
  { id: "violet", name: "Violet", value: "#7b35c8" },
  { id: "magenta", name: "Magenta", value: "#a528b6" },
  { id: "pink", name: "Pink", value: "#ed1764" },
  { id: "rose", name: "Rose", value: "#ef476f" },
  { id: "brown", name: "Brown", value: "#875437" },
  { id: "beige", name: "Beige", value: "#ded3bd" },
  { id: "gray", name: "Gray", value: "#8b929b" },
  { id: "light-gray", name: "Light Gray", value: "#e4e7eb" },
  { id: "navy", name: "Navy", value: "#172b4d" },
];

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    if (/^https?:\/\//i.test(src)) image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be loaded."));
    image.src = src;
  });
}

async function trimTransparentPixels(blob) {
  const sourceUrl = URL.createObjectURL(blob);
  try {
    const image = await loadImage(sourceUrl);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(image, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        if (data[(y * canvas.width + x) * 4 + 3] > 8) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    if (maxX < 0 || maxY < 0) {
      return { url: sourceUrl, width: canvas.width, height: canvas.height };
    }

    const padding = Math.round(Math.min(canvas.width, canvas.height) * 0.015);
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(canvas.width - 1, maxX + padding);
    maxY = Math.min(canvas.height - 1, maxY + padding);

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const cropped = document.createElement("canvas");
    cropped.width = width;
    cropped.height = height;
    cropped.getContext("2d").drawImage(image, minX, minY, width, height, 0, 0, width, height);

    const croppedBlob = await new Promise((resolve) => cropped.toBlob(resolve, "image/png"));
    if (!croppedBlob) return { url: sourceUrl, width: canvas.width, height: canvas.height };

    URL.revokeObjectURL(sourceUrl);
    return { url: URL.createObjectURL(croppedBlob), width, height };
  } catch (error) {
    return { url: sourceUrl, width: 1, height: 1 };
  }
}

function fitCover(ctx, image, width, height) {
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const targetRatio = width / height;
  let drawWidth;
  let drawHeight;
  let drawX;
  let drawY;

  if (imageRatio > targetRatio) {
    drawHeight = height;
    drawWidth = height * imageRatio;
    drawX = (width - drawWidth) / 2;
    drawY = 0;
  } else {
    drawWidth = width;
    drawHeight = width / imageRatio;
    drawX = 0;
    drawY = (height - drawHeight) / 2;
  }

  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageBackground() {
  const inputRef = useRef(null);
  const canvasRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mode, setMode] = useState("background");
  const [selectedBackground, setSelectedBackground] = useState("none");
  const [selectedColor, setSelectedColor] = useState("none");
  const [selectionMade, setSelectionMade] = useState(false);
  const [search, setSearch] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const activeFile = files[activeIndex] || null;

  const filteredBackgrounds = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? BACKGROUNDS.filter((item) => item.name.toLowerCase().includes(q)) : BACKGROUNDS;
  }, [search]);

  const filteredColors = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? COLORS.filter((item) => item.name.toLowerCase().includes(q)) : COLORS;
  }, [search]);

  const processFile = async (file, id) => {
    setFiles((prev) => prev.map((item) => item.id === id ? { ...item, status: "processing" } : item));
    try {
      const result = await removeBgFromImage(file);
      const trimmed = await trimTransparentPixels(result);
      setFiles((prev) => prev.map((item) => item.id === id ? {
        ...item,
        removedUrl: trimmed.url,
        subjectWidth: trimmed.width,
        subjectHeight: trimmed.height,
        status: "done",
      } : item));
    } catch (err) {
      console.error(err);
      setFiles((prev) => prev.map((item) => item.id === id ? {
        ...item,
        status: "error",
        error: "Background removal failed. Please try another image.",
      } : item));
    }
  };

  const handleFiles = async (fileList) => {
    const incoming = Array.from(fileList || []);
    const valid = incoming.filter((file) => {
      const typeOk = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
      return typeOk && file.size <= MAX_FILE_SIZE;
    });

    if (!valid.length) {
      setError("Please select JPG, PNG or WEBP images up to 5 MB.");
      return;
    }

    setError("");
    const startIndex = files.length;
    const newItems = valid.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      originalUrl: URL.createObjectURL(file),
      removedUrl: "",
      subjectWidth: 0,
      subjectHeight: 0,
      status: "waiting",
      error: "",
    }));

    setFiles((prev) => [...prev, ...newItems]);
    setActiveIndex(startIndex);
    setSelectedBackground("none");
    setSelectedColor("none");
    setSelectionMade(false);

    for (const item of newItems) {
      setProcessing(true);
      await processFile(item.file, item.id);
    }
    setProcessing(false);
  };

  const handleInput = (event) => {
    handleFiles(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  };

  const handleUrlUpload = async () => {
    const url = window.prompt("Paste an image URL:");
    if (!url) return;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Unable to download image.");
      const blob = await response.blob();
      if (!blob.type.startsWith("image/")) throw new Error("URL is not an image.");
      if (blob.size > MAX_FILE_SIZE) throw new Error("Image must be 5 MB or smaller.");
      const extension = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
      const file = new File([blob], `image-from-url.${extension}`, { type: blob.type });
      await handleFiles([file]);
    } catch (err) {
      console.error(err);
      setError("Could not load that image URL. Please use a direct image URL.");
    }
  };

  const handlePaste = (event) => {
    const image = Array.from(event.clipboardData?.files || []).find((file) => file.type.startsWith("image/"));
    if (image) handleFiles([image]);
  };

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  });

  const removeFile = (index) => {
    setFiles((prev) => {
      const item = prev[index];
      if (item?.originalUrl) URL.revokeObjectURL(item.originalUrl);
      if (item?.removedUrl) URL.revokeObjectURL(item.removedUrl);
      return prev.filter((_, i) => i !== index);
    });
    setActiveIndex((prev) => Math.max(0, index < prev ? prev - 1 : index === prev ? prev - 1 : prev));
  };

  const chooseBackground = (id) => {
    setSelectedBackground(id);
    setSelectedColor("none");
    setSelectionMade(true);
  };

  const chooseColor = (id) => {
    setSelectedColor(id);
    setSelectedBackground("none");
    setSelectionMade(true);
  };

  const chooseNone = () => {
    setSelectedBackground("none");
    setSelectedColor("none");
    setSelectionMade(true);
  };

  const drawFinalCanvas = async () => {
    if (!activeFile?.removedUrl) throw new Error("Image is not ready.");

    const subject = await loadImage(activeFile.removedUrl);
    let width = activeFile.subjectWidth || subject.naturalWidth;
    let height = activeFile.subjectHeight || subject.naturalHeight;

    const maxSize = 2400;
    const scale = Math.min(1, maxSize / width, maxSize / height);
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (selectedColor !== "none") {
      const color = COLORS.find((item) => item.id === selectedColor);
      if (color) {
        ctx.fillStyle = color.value;
        ctx.fillRect(0, 0, width, height);
      }
    } else if (selectedBackground !== "none") {
      const bg = BACKGROUNDS.find((item) => item.id === selectedBackground);
      if (bg?.url) {
        const image = await loadImage(bg.url);
        fitCover(ctx, image, width, height);
      }
    }

    ctx.drawImage(subject, 0, 0, width, height);
    return canvas;
  };

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      if (!canvasRef.current || !activeFile?.removedUrl) return;
      try {
        const result = await drawFinalCanvas();
        if (cancelled) return;
        const target = canvasRef.current;
        target.width = result.width;
        target.height = result.height;
        target.getContext("2d").drawImage(result, 0, 0);
      } catch (err) {
        console.error(err);
      }
    };
    render();
    return () => { cancelled = true; };
  }, [activeFile?.removedUrl, activeFile?.subjectWidth, activeFile?.subjectHeight, selectedBackground, selectedColor]);

  const downloadImage = async () => {
    try {
      if (!activeFile?.removedUrl) return;
      const canvas = await drawFinalCanvas();
      canvas.toBlob((blob) => {
        if (!blob) {
          setError("Could not create the download.");
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const name = activeFile.file.name.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9-_ ]/gi, "").trim() || "image";
        link.href = url;
        link.download = `HubConverter-${name}-background.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, "image/png");
    } catch (err) {
      console.error(err);
      setError("Download failed. Please try again.");
    }
  };

  const previewRatio = activeFile?.subjectWidth && activeFile?.subjectHeight
    ? activeFile.subjectWidth / activeFile.subjectHeight
    : 1;

  if (!activeFile) {
    return (
      <section className="ibg-root ibg-start-root">
        <style>{styles}</style>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={handleInput}
        />
        <div
          className="ibg-start-card"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <button type="button" className="ibg-start-select" onClick={() => inputRef.current?.click()}>
            Select Image
          </button>
          <div className="ibg-start-drop">or drop a file,</div>
          <button type="button" className="ibg-start-paste" onClick={handleUrlUpload}>
            paste image or URL
          </button>
          {error && <div className="ibg-start-error">{error}</div>}
        </div>
      </section>
    );
  }

  return (
    <section className="ibg-root">
      <style>{styles}</style>

      <div className="ibg-shell">
        <header className="ibg-header">
          <div className="ibg-eyebrow">HUBCONVERTER · IMAGE TOOL</div>
          <h1>Image Background</h1>
          <p>Remove background and add a new background to your image</p>
        </header>

        <div className="ibg-editor">
          <aside className="ibg-sidebar">
            <div className="ibg-upload-top">
              <button type="button" className="ibg-add-images" onClick={() => inputRef.current?.click()}>
                + Add More Images
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                hidden
                onChange={handleInput}
              />
              <small>JPG · PNG · WEBP · Max 5 MB</small>
            </div>

            <div className="ibg-thumbnails">
              {files.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={`ibg-thumb ${index === activeIndex ? "active" : ""}`}
                  onClick={() => {
                    setActiveIndex(index);
                    setSelectedBackground("none");
                    setSelectedColor("none");
                    setSelectionMade(false);
                  }}
                  title={item.file.name}
                >
                  <img src={item.originalUrl} alt="" />
                  {item.status === "processing" && <span className="ibg-thumb-loading">•••</span>}
                  <span
                    className="ibg-thumb-remove"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeFile(index);
                    }}
                  >×</span>
                </button>
              ))}
            </div>

            <div className={`ibg-status ${processing ? "processing" : activeFile.status === "error" ? "error" : ""}`}>
              {processing ? "✨ Removing background automatically..." : activeFile.status === "done" ? "✓ Background removed" : activeFile.status === "error" ? "Background removal failed" : "Preparing image..."}
            </div>

            <div className="ibg-tabs">
              <button type="button" className={mode === "background" ? "active" : ""} onClick={() => { setMode("background"); setSearch(""); }}>
                🖼 Background
              </button>
              <button type="button" className={mode === "color" ? "active" : ""} onClick={() => { setMode("color"); setSearch(""); }}>
                🎨 Color
              </button>
            </div>

            <input
              className="ibg-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={mode === "background" ? "Search backgrounds..." : "Search colors..."}
            />

            <div className="ibg-grid-scroll">
              <div className="ibg-grid">
                {(mode === "background" ? filteredBackgrounds : filteredColors).map((item) => {
                  const selected = mode === "background" ? selectedBackground === item.id : selectedColor === item.id;
                  const none = item.type === "none";
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`ibg-tile ${selected ? "selected" : ""} ${none ? "ibg-none" : ""}`}
                      onClick={() => none ? chooseNone() : mode === "background" ? chooseBackground(item.id) : chooseColor(item.id)}
                      title={item.name}
                    >
                      {none ? <span className="ibg-none-icon">⊘</span> : mode === "background" ? <img src={item.url} alt={item.name} loading="lazy" /> : <span className="ibg-color" style={{ background: item.value }} />}
                      {mode === "background" && !none && <span className="ibg-label">{item.name}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <main className="ibg-main">
            <div className="ibg-filebar">
              <div className="ibg-fileinfo">
                <strong>{activeFile.file.name}</strong>
                <span>{formatSize(activeFile.file.size)}</span>
              </div>
              <span>{activeIndex + 1} / {files.length}</span>
            </div>

            <div className="ibg-preview-wrap">
              {activeFile.removedUrl ? (
                <div className="ibg-preview-frame" style={{ aspectRatio: previewRatio }}>
                  <canvas ref={canvasRef} />
                </div>
              ) : (
                <div className="ibg-processing">✨<strong>Removing background...</strong><span>Please wait a moment.</span></div>
              )}
            </div>

            {activeFile.removedUrl && selectionMade && (
              <div className="ibg-download-row">
                <button type="button" className="ibg-download" onClick={downloadImage}>⬇ Download Image</button>
              </div>
            )}
            {error && <div className="ibg-error">{error}</div>}
          </main>
        </div>
      </div>
    </section>
  );
}

const styles = `
  .ibg-root, .ibg-root * { box-sizing: border-box; }
  .ibg-root {
    width: 100%;
    min-height: 100vh;
    padding: 16px;
    background: #f4f6f8;
    color: #223247;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .ibg-start-root { display: flex; align-items: flex-start; justify-content: center; padding-top: 22px; background: #f7f8fa; }
  .ibg-start-card {
    width: min(540px, 100%);
    min-height: 400px;
    border-radius: 28px;
    background: #fff;
    box-shadow: 0 12px 40px rgba(25, 43, 61, .10);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 50px 25px;
  }
  .ibg-start-upload {
    border: 0;
    border-radius: 999px;
    background: #1976e8;
    color: #fff;
    font-size: 29px;
    font-weight: 700;
    padding: 16px 48px;
    cursor: pointer;
  }
  .ibg-start-drop { margin-top: 42px; color: #52677b; font-size: 24px; font-weight: 600; }
  .ibg-start-paste { border: 0; background: transparent; color: #60758a; text-decoration: underline; margin-top: 10px; font-size: 15px; cursor: pointer; }
  .ibg-start-error { margin-top: 18px; color: #d64545; font-size: 13px; }

  .ibg-shell { width: min(1120px, 100%); margin: 0 auto; }
  .ibg-header { text-align: center; margin: 2px 0 12px; }
  .ibg-eyebrow { color: #00a7d9; font-size: 11px; font-weight: 800; letter-spacing: 1.6px; }
  .ibg-header h1 { margin: 3px 0 2px; font-size: 24px; font-weight: 800; }
  .ibg-header p { margin: 0; color: #708196; font-size: 12px; }
  .ibg-editor { display: grid; grid-template-columns: 258px minmax(0, 1fr); gap: 12px; align-items: stretch; }

  .ibg-sidebar {
    height: min(650px, calc(100vh - 88px));
    min-height: 500px;
    overflow: hidden;
    background: #fff;
    border: 1px solid #dce3e9;
    border-radius: 16px;
    box-shadow: 0 8px 28px rgba(22, 40, 58, .08);
    display: flex;
    flex-direction: column;
  }
  .ibg-upload-top { padding: 10px; border-bottom: 1px solid #e7ebef; text-align: center; }
  .ibg-add-images { width: 100%; height: 39px; border: 1px dashed #00aeda; border-radius: 10px; background: #f5fbfd; color: #147394; font-size: 13px; font-weight: 800; cursor: pointer; }
  .ibg-upload-top small { display: block; margin-top: 5px; color: #8393a3; font-size: 10px; }
  .ibg-thumbnails { display: flex; gap: 6px; overflow-x: auto; padding: 8px 10px; min-height: 66px; border-bottom: 1px solid #e7ebef; }
  .ibg-thumb { position: relative; flex: 0 0 50px; width: 50px; height: 50px; padding: 0; border: 1px solid #d7e0e7; border-radius: 8px; overflow: hidden; background: #f2f5f7; cursor: pointer; }
  .ibg-thumb.active { border: 2px solid #1689ff; }
  .ibg-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .ibg-thumb-remove { position: absolute; top: 2px; right: 2px; width: 16px; height: 16px; border-radius: 50%; background: rgba(0,0,0,.72); color: #fff; font-size: 12px; line-height: 15px; }
  .ibg-thumb-loading { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,.72); color: #1689ff; font-weight: 900; }
  .ibg-status { margin: 7px 10px; min-height: 28px; border-radius: 9px; background: #edf9f3; color: #15935c; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; text-align: center; padding: 4px; }
  .ibg-status.processing { background: #fff8e5; color: #9c7410; }
  .ibg-status.error { background: #fff0f0; color: #d94c4c; }
  .ibg-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; padding: 0 10px 7px; }
  .ibg-tabs button { height: 38px; border: 1px solid #e1e7ec; border-radius: 9px; background: #f4f7f9; color: #637285; font-size: 12px; font-weight: 800; cursor: pointer; }
  .ibg-tabs button.active { background: #eaf8ff; border-color: #17b5e5; color: #087fa8; }
  .ibg-search { width: calc(100% - 20px); height: 34px; margin: 0 10px 7px; border: 1px solid #dfe6eb; border-radius: 9px; outline: none; padding: 0 10px; color: #30465b; font-size: 11px; }
  .ibg-search:focus { border-color: #1aaee0; }
  .ibg-grid-scroll { flex: 1; min-height: 0; overflow-y: auto; padding: 0 8px 10px 10px; }
  .ibg-grid-scroll::-webkit-scrollbar { width: 5px; }
  .ibg-grid-scroll::-webkit-scrollbar-thumb { background: #aebbc6; border-radius: 10px; }
  .ibg-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
  .ibg-tile { position: relative; width: 100%; aspect-ratio: 1 / .86; padding: 0; border: 1px solid #e0e5ea; border-radius: 10px; overflow: hidden; background: #f6f8fa; cursor: pointer; }
  .ibg-tile.selected { border: 2px solid #087dff; box-shadow: 0 0 0 1px rgba(8,125,255,.10); }
  .ibg-tile img, .ibg-color { display: block; width: 100%; height: 100%; object-fit: cover; }
  .ibg-label { position: absolute; left: 0; right: 0; bottom: 0; padding: 3px 2px; background: linear-gradient(transparent, rgba(0,0,0,.78)); color: #fff; font-size: 8px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ibg-none { background: linear-gradient(45deg,#eef1f4 25%,transparent 25%),linear-gradient(-45deg,#eef1f4 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eef1f4 75%),linear-gradient(-45deg,transparent 75%,#eef1f4 75%); background-size: 14px 14px; background-position: 0 0,0 7px,7px -7px,-7px 0; }
  .ibg-none-icon { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 25px; color: #4c4c4c; }

  .ibg-main { height: min(650px, calc(100vh - 88px)); min-height: 500px; background: #fff; border: 1px solid #dce3e9; border-radius: 16px; box-shadow: 0 8px 28px rgba(22,40,58,.08); padding: 10px; display: flex; flex-direction: column; min-width: 0; }
  .ibg-filebar { min-height: 38px; display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 0 3px 7px; color: #7d8b99; font-size: 10px; }
  .ibg-fileinfo { min-width: 0; }
  .ibg-fileinfo strong { display: block; color: #1e3043; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ibg-fileinfo span { display: block; margin-top: 1px; }
  .ibg-preview-wrap { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 12px; background: linear-gradient(45deg,#f0f2f4 25%,transparent 25%),linear-gradient(-45deg,#f0f2f4 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#f0f2f4 75%),linear-gradient(-45deg,transparent 75%,#f0f2f4 75%); background-size: 26px 26px; background-position: 0 0,0 13px,13px -13px,-13px 0; }
  .ibg-preview-frame { width: min(88%, 700px); max-width: 88%; max-height: 88%; display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 12px; box-shadow: 0 10px 28px rgba(24,42,60,.14); }
  .ibg-preview-frame canvas { width: 100%; height: 100%; display: block; object-fit: contain; }
  .ibg-processing { display: flex; flex-direction: column; align-items: center; gap: 7px; color: #8191a0; font-size: 27px; }
  .ibg-processing strong { color: #506275; font-size: 15px; }
  .ibg-processing span { font-size: 11px; }
  .ibg-download-row { display: flex; justify-content: center; padding-top: 9px; }
  .ibg-download { min-width: 190px; height: 40px; border: 0; border-radius: 10px; background: linear-gradient(135deg,#087eff,#0dd6ca); color: #fff; font-size: 13px; font-weight: 800; cursor: pointer; }
  .ibg-error { margin-top: 6px; text-align: center; color: #d94c4c; font-size: 11px; }

  @media (max-width: 850px) {
    .ibg-editor { grid-template-columns: 230px minmax(0,1fr); }
    .ibg-sidebar, .ibg-main { height: min(600px, calc(100vh - 75px)); min-height: 440px; }
  }
  @media (max-width: 680px) {
    .ibg-root { padding: 8px; }
    .ibg-editor { grid-template-columns: 1fr; }
    .ibg-sidebar { height: 315px; min-height: 315px; }
    .ibg-main { height: 500px; min-height: 500px; }
    .ibg-start-card { min-height: 390px; }
    .ibg-start-upload { font-size: 25px; }
    .ibg-start-drop { font-size: 21px; }
  }
`;
