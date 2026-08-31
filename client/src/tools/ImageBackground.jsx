import React, { useEffect, useMemo, useRef, useState } from "react";

/*
  IMAGE BACKGROUND

  Flow:
  1. Upload / Drag & Drop
  2. Remove Background
  3. Choose Background or Color
  4. Preview
  5. Download Image

  Maximum input size: 5 MB per image.
*/

const MAX_FILE_SIZE = 5 * 1024 * 1024;

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
    name: "Sky",
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

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;

    image.src = src;
  });
}

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

  /*
    When a new image is selected, display it.
  */
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

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [currentFile]);

  /*
    Add files.
  */
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
          `${file.name} is larger than 5 MB. Maximum allowed size is 5 MB per image.`
        );
        continue;
      }

      validFiles.push(file);
    }

    if (!validFiles.length) return;

    setFiles((current) => {
      const updated = [...current, ...validFiles];

      /*
        First uploaded image becomes selected image.
      */
      if (current.length === 0) {
        setSelectedIndex(0);
      }

      return updated;
    });
  }

  function handleInput(event) {
    addFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    addFiles(event.dataTransfer.files);
  }

  function removeFile(index) {
    setFiles((current) => {
      const next = current.filter((_, i) => i !== index);

      if (!next.length) {
        setSelectedIndex(0);
      } else if (index <= selectedIndex) {
        setSelectedIndex(Math.max(0, selectedIndex - 1));
      }

      return next;
    });
  }

  /*
    Remove background.

    This loads the browser background-removal package only when needed.
    Install it with:

      npm install @imgly/background-removal
  */
  async function removeBackground() {
    if (!currentFile) {
      setError("Please upload an image first.");
      return;
    }

    try {
      setProcessing(true);
      setError("");

      const module = await import("@imgly/background-removal");

      const removeBg =
        module.removeBackground ||
        module.default?.removeBackground ||
        module.default;

      if (typeof removeBg !== "function") {
        throw new Error("Background removal engine could not be loaded.");
      }

      const result = await removeBg(currentFile, {
        output: {
          format: "image/png",
        },
      });

      const blob = result instanceof Blob ? result : new Blob([result]);

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

  /*
    Create final composite image.
  */
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

    let width = foreground.naturalWidth || foreground.width;
    let height = foreground.naturalHeight || foreground.height;

    if (width > maxDimension || height > maxDimension) {
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
      Color background.
    */
    if (mode === "color" && selectedColor !== "transparent") {
      ctx.fillStyle = selectedColor;
      ctx.fillRect(0, 0, width, height);
    }

    /*
      Image background.
    */
    if (mode === "background" && selectedBackground) {
      const bg = await loadImage(selectedBackground.url);

      const scale = Math.max(
        width / bg.naturalWidth,
        height / bg.naturalHeight
      );

      const bgWidth = bg.naturalWidth * scale;
      const bgHeight = bg.naturalHeight * scale;

      const bgX = (width - bgWidth) / 2;
      const bgY = (height - bgHeight) / 2;

      ctx.drawImage(bg, bgX, bgY, bgWidth, bgHeight);
    }

    /*
      Draw foreground.
    */
    ctx.drawImage(foreground, 0, 0, width, height);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Could not create image."));
            return;
          }

          resolve(blob);
        },
        "image/png",
        0.95
      );
    });
  }

  async function downloadImage() {
    try {
      setError("");

      if (!removedUrl) {
        setError("Please remove the background before downloading.");
        return;
      }

      const blob = await createFinalImage();

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      const baseName =
        currentFile?.name
          ?.replace(/\.[^/.]+$/, "")
          .replace(/[^a-z0-9-_]/gi, "-") || "image";

      link.href = url;
      link.download = `${baseName}-background.png`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error(err);
      setError("Could not download the image.");
    }
  }

  const previewStyle = useMemo(() => {
    const style = {
      transform: `scale(${zoom / 100})`,
      transformOrigin: "center",
    };

    return style;
  }, [zoom]);

  return (
    <section className="ibg-page">
      <div className="ibg-header">
        <div className="ibg-header-icon">🖼️</div>

        <div>
          <div className="ibg-eyebrow">IMAGE TOOL</div>

          <h1>Image Background</h1>

          <p>
            Remove background and add new background to your images
          </p>
        </div>
      </div>

      <div className="ibg-layout">

        {/* =====================================================
            LEFT SIDE
        ===================================================== */}

        <aside className="ibg-sidebar">

          {/* STEP 1 */}
          <div className="ibg-step">
            <div className="ibg-step-title">
              <span className="ibg-number">1</span>
              <strong>Upload Image</strong>
            </div>

            <div
              className="ibg-upload"
              onDragOver={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  inputRef.current?.click();
                }
              }}
            >
              <div className="ibg-upload-icon">☁️</div>

              <h3>Drag & drop your files here</h3>

              <p>or click to browse</p>

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

          {/* STEP 2 */}
          <div className="ibg-step">
            <div className="ibg-step-title">
              <span className="ibg-number">2</span>
              <strong>Remove Background</strong>
            </div>

            <p className="ibg-step-text">
              Remove the original background from your selected image.
            </p>

            <button
              type="button"
              className="ibg-green-button"
              disabled={!currentFile || processing}
              onClick={removeBackground}
            >
              {processing
                ? "Removing Background..."
                : "✨ Remove Background"}
            </button>
          </div>

          {/* STEP 3 */}
          <div className="ibg-step ibg-background-step">
            <div className="ibg-step-title">
              <span className="ibg-number">3</span>
              <strong>Choose Background</strong>
            </div>

            <div className="ibg-tabs">
              <button
                type="button"
                className={
                  mode === "background"
                    ? "ibg-tab active"
                    : "ibg-tab"
                }
                onClick={() => setMode("background")}
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
                onClick={() => setMode("color")}
              >
                🎨 Color
              </button>
            </div>

            {mode === "background" && (
              <div className="ibg-background-grid">
                {BACKGROUNDS.map((background) => (
                  <button
                    type="button"
                    key={background.name}
                    className={
                      selectedBackground?.name === background.name
                        ? "ibg-background-item selected"
                        : "ibg-background-item"
                    }
                    onClick={() => {
                      setSelectedBackground(background);
                      setSelectedColor("transparent");
                    }}
                  >
                    <img
                      src={background.url}
                      alt={background.name}
                      loading="lazy"
                    />

                    <span>{background.name}</span>
                  </button>
                ))}
              </div>
            )}

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
                      setSelectedColor(color.value);
                      setSelectedBackground(null);
                    }}
                    title={color.name}
                  >
                    <span
                      className="ibg-color-circle"
                      style={{
                        background:
                          color.value === "transparent"
                            ? "white"
                            : color.value,
                      }}
                    >
                      {color.value === "transparent" && "⊘"}
                    </span>

                    <small>{color.name}</small>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* STEP 4 */}
          <div className="ibg-step">
            <div className="ibg-step-title">
              <span className="ibg-number">4</span>
              <strong>Final Preview</strong>
            </div>

            <p className="ibg-step-text">
              Preview your image with the selected background.
            </p>
          </div>

          {/* STEP 5 */}
          <div className="ibg-step">
            <div className="ibg-step-title">
              <span className="ibg-number">5</span>
              <strong>Download Image</strong>
            </div>

            <p className="ibg-step-text">
              Download your finished image.
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

        {/* =====================================================
            RIGHT SIDE
        ===================================================== */}

        <main className="ibg-workspace">

          {!currentFile ? (
            <div className="ibg-empty-workspace">
              <div className="ibg-empty-icon">🖼️</div>

              <h2>Upload an image to get started</h2>

              <p>
                Drag and drop an image on the left or click
                <strong> Select Image</strong>.
              </p>

              <span>Maximum 5 MB per image</span>
            </div>
          ) : (
            <>
              {/* ORIGINAL */}
              <div className="ibg-preview-card">
                <div className="ibg-card-heading">
                  <h2>Original Image</h2>

                  <span>
                    {selectedIndex + 1} / {files.length}
                  </span>
                </div>

                <div className="ibg-original-preview">
                  <img
                    src={originalUrl}
                    alt="Original"
                  />
                </div>
              </div>

              {/* REMOVED */}
              <div className="ibg-preview-card">
                <div className="ibg-card-heading">
                  <h2>Background Removed</h2>

                  {!removedUrl && (
                    <span>Not processed</span>
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
                      <span>✨</span>
                      <strong>Remove the background</strong>
                      <small>
                        Click "Remove Background" on the left.
                      </small>
                    </div>
                  )}
                </div>
              </div>

              {/* FINAL */}
              <div className="ibg-preview-card">
                <div className="ibg-card-heading">
                  <h2>Final Preview</h2>

                  <div className="ibg-zoom">
                    <button
                      type="button"
                      onClick={() =>
                        setZoom((value) =>
                          Math.max(50, value - 10)
                        )
                      }
                    >
                      −
                    </button>

                    <span>{zoom}%</span>

                    <button
                      type="button"
                      onClick={() =>
                        setZoom((value) =>
                          Math.min(150, value + 10)
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <div
                  className="ibg-final-preview"
                  style={{
                    background:
                      mode === "color" &&
                      selectedColor !== "transparent"
                        ? selectedColor
                        : mode === "background" &&
                          selectedBackground
                        ? `url("${selectedBackground.url}") center / cover`
                        : undefined,
                  }}
                >
                  {removedUrl ? (
                    <img
                      src={removedUrl}
                      alt="Final"
                      style={previewStyle}
                    />
                  ) : (
                    <div className="ibg-placeholder">
                      <span>🖼️</span>
                      <strong>Your final image will appear here</strong>
                      <small>
                        Remove the background and choose a background.
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
                <h2>Your Images ({files.length})</h2>
              </div>

              <div className="ibg-thumbnail-row">

                {files.map((file, index) => {
                  const url = URL.createObjectURL(file);

                  return (
                    <div
                      key={`${file.name}-${index}`}
                      className={
                        index === selectedIndex
                          ? "ibg-thumbnail selected"
                          : "ibg-thumbnail"
                      }
                      onClick={() => setSelectedIndex(index)}
                    >
                      <img src={url} alt={file.name} />

                      <button
                        type="button"
                        className="ibg-remove-thumbnail"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeFile(index);
                        }}
                        aria-label={`Remove ${file.name}`}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}

                {/* ONLY ONE ADD BUTTON */}
                <button
                  type="button"
                  className="ibg-add-more"
                  onClick={() => inputRef.current?.click()}
                >
                  <span>+</span>
                  <small>Add More</small>
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
              <span>📄 {currentFile.name}</span>
              <span>{formatSize(currentFile.size)}</span>
            </div>
          )}

          {/* DOWNLOAD */}
          {removedUrl && (
            <button
              type="button"
              className="ibg-bottom-download"
              onClick={downloadImage}
            >
              ⬇ Download Image
            </button>
          )}
        </main>
      </div>
    </section>
  );
}

export default ImageBackground;