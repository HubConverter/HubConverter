import React, { useEffect, useRef, useState } from "react";

/*
===========================================================
 HUBCONVERTER - IMAGE BACKGROUND TOOL
===========================================================

FLOW

1. Upload image / Drag & Drop
2. Background removes automatically
3. Select Background OR Color from LEFT sidebar
4. Download button appears
5. Download final PNG

DESIGN

- Compact screen
- Approximately 50% smaller than previous large layout
- Background / Color sidebar on LEFT
- No separate preview sections
- No Remove Background button
- Multiple images can be added
===========================================================
*/

const MAX_FILE_SIZE = 5 * 1024 * 1024;

/* =========================================================
   BACKGROUNDS
   More backgrounds added
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
    name: "Tropical",
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
    name: "Snow Mountain",
    url: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1000&q=85",
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
    name: "Sunrise",
    url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Flowers",
    url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Pink Flowers",
    url: "https://images.unsplash.com/photo-1495231916356-a86217efff12?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Green Leaves",
    url: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Grass",
    url: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "City",
    url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "New York",
    url: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Modern City",
    url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Road",
    url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Desert",
    url: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Room",
    url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Modern Room",
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Office",
    url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Luxury",
    url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Wood",
    url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Coffee",
    url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Flowers Garden",
    url: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Palm Trees",
    url: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Waterfall",
    url: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Autumn",
    url: "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Night",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=85",
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
  { name: "Hot Pink", value: "#ff1493" },
  { name: "Rose", value: "#e91e63" },
  { name: "Purple", value: "#9c27b0" },
  { name: "Violet", value: "#673ab7" },
  { name: "Deep Purple", value: "#512da8" },
  { name: "Blue", value: "#4169e1" },
  { name: "Royal Blue", value: "#2962ff" },
  { name: "Sky Blue", value: "#2196f3" },
  { name: "Light Blue", value: "#03a9f4" },
  { name: "Cyan", value: "#00bcd4" },
  { name: "Teal", value: "#009688" },
  { name: "Green", value: "#12a66a" },
  { name: "Bright Green", value: "#20c55a" },
  { name: "Lime", value: "#cddc39" },
  { name: "Yellow", value: "#ffd21c" },
  { name: "Gold", value: "#ffc107" },
  { name: "Orange", value: "#ff7a18" },
  { name: "Deep Orange", value: "#ff5722" },
  { name: "Brown", value: "#795548" },
  { name: "Beige", value: "#d8c3a5" },
  { name: "Gray", value: "#777777" },
  { name: "Light Gray", value: "#d6d6d6" },
  { name: "Dark Gray", value: "#333333" },
];

/* =========================================================
   HELPERS
========================================================= */

function formatSize(bytes) {
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

    image.crossOrigin = "anonymous";

    image.onload = () => resolve(image);
    image.onerror = reject;
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
    useState(null);

  const [selectedColor, setSelectedColor] =
    useState("transparent");

  const currentFile =
    files[selectedIndex] || null;

  /* =======================================================
     CURRENT FILE
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

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [currentFile]);

  /* =======================================================
     AUTOMATIC BACKGROUND REMOVAL
     
     IMPORTANT:
     There is NO remove background button.
     It starts automatically after upload.
  ======================================================= */

  useEffect(() => {
    if (!currentFile) {
      return;
    }

    let cancelled = false;
    let createdUrl = "";

    async function autoRemoveBackground() {
      try {
        setProcessing(true);
        setError("");

        const module =
          await import("@imgly/background-removal");

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

        if (cancelled) {
          return;
        }

        const blob =
          result instanceof Blob
            ? result
            : new Blob([result], {
                type: "image/png",
              });

        createdUrl = URL.createObjectURL(blob);

        setRemovedUrl((oldUrl) => {
          if (oldUrl) {
            URL.revokeObjectURL(oldUrl);
          }

          return createdUrl;
        });
      } catch (err) {
        console.error(
          "Automatic background removal failed:",
          err
        );

        if (!cancelled) {
          setError(
            "Background removal could not be completed. Please try another image."
          );
        }
      } finally {
        if (!cancelled) {
          setProcessing(false);
        }
      }
    }

    autoRemoveBackground();

    return () => {
      cancelled = true;
    };
  }, [currentFile]);

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
      const updated = [
        ...current,
        ...validFiles,
      ];

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
      } else if (index < selectedIndex) {
        setSelectedIndex(
          Math.max(
            0,
            selectedIndex - 1
          )
        );
      } else if (
        selectedIndex >= next.length
      ) {
        setSelectedIndex(
          next.length - 1
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
      throw new Error(
        "No image selected."
      );
    }

    const source =
      removedUrl || originalUrl;

    if (!source) {
      throw new Error(
        "Please upload an image."
      );
    }

    const foreground =
      await loadImage(source);

    const canvas =
      document.createElement("canvas");

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
        Math.round(width * ratio);

      height =
        Math.round(height * ratio);
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

    /* =====================================================
       COLOR BACKGROUND
    ===================================================== */

    if (
      mode === "color" &&
      selectedColor !== "transparent"
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

    /* =====================================================
       IMAGE BACKGROUND
    ===================================================== */

    if (
      mode === "background" &&
      selectedBackground
    ) {
      const bg =
        await loadImage(
          selectedBackground.url
        );

      const scale =
        Math.max(
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
    try {
      setError("");

      if (!removedUrl) {
        setError(
          "Please wait for background removal to finish."
        );

        return;
      }

      if (
        mode === "background" &&
        !selectedBackground
      ) {
        setError(
          "Please select a background first."
        );

        return;
      }

      if (
        mode === "color" &&
        selectedColor === "transparent"
      ) {
        setError(
          "Please select a color first."
        );

        return;
      }

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
          ) || "image";

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
      console.error(
        "Download failed:",
        err
      );

      setError(
        "Could not create the final image. Please try again."
      );
    }
  }

  /* =======================================================
     BACKGROUND SELECT
  ======================================================= */

  function selectBackground(
    background
  ) {
    setSelectedBackground(
      background
    );

    setSelectedColor(
      "transparent"
    );

    setMode("background");

    setError("");
  }

  /* =======================================================
     COLOR SELECT
  ======================================================= */

  function selectColor(color) {
    setSelectedColor(
      color.value
    );

    setSelectedBackground(
      null
    );

    setMode("color");

    setError("");
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      className="hubconverter-image-background"
      style={{
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        background:
          "linear-gradient(135deg,#06121f 0%,#081b2b 45%,#03111d 100%)",
        padding: "24px 20px",
        color: "#fff",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        style={{
          width: "100%",
          maxWidth: "1050px",
          margin: "0 auto 18px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: "800",
            letterSpacing: "2px",
            color: "#16d9ff",
            marginBottom: "4px",
          }}
        >
          HUBCONVERTER IMAGE TOOL
        </div>

        <h1
          style={{
            margin: 0,
            fontSize:
              "clamp(22px,3vw,32px)",
            fontWeight: "800",
          }}
        >
          Image Background
        </h1>

        <p
          style={{
            margin:
              "5px 0 0",
            color:
              "#9db2c7",
            fontSize: "13px",
          }}
        >
          Remove background and add
          a new background to your image
        </p>
      </div>

      {/* ===================================================
          MAIN COMPACT WORK AREA

          This is intentionally much smaller.
      =================================================== */}

      <div
        style={{
          width: "100%",
          maxWidth: "1050px",
          height:
            "calc(100vh - 150px)",
          minHeight: "560px",
          maxHeight: "760px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns:
            "260px minmax(0,1fr)",
          gap: "14px",
          boxSizing: "border-box",
        }}
      >
        {/* =================================================
            LEFT SIDEBAR
        ================================================= */}

        <aside
          style={{
            background:
              "rgba(10,27,45,.96)",
            border:
              "1px solid rgba(0,221,255,.35)",
            borderRadius:
              "16px",
            padding: "12px",
            display: "flex",
            flexDirection:
              "column",
            minHeight: 0,
            boxSizing: "border-box",
            boxShadow:
              "0 10px 30px rgba(0,0,0,.25)",
          }}
        >
          {/* UPLOAD / ADD MORE */}

          <div
            style={{
              marginBottom:
                "10px",
            }}
          >
            <button
              type="button"
              onClick={() =>
                inputRef.current?.click()
              }
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDrop={handleDrop}
              style={{
                width: "100%",
                border:
                  "1px dashed #22cfff",
                borderRadius:
                  "10px",
                padding:
                  "11px 8px",
                background:
                  "rgba(22,207,255,.08)",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "13px",
              }}
            >
              {files.length
                ? "＋ Add More Images"
                : "⬆ Upload Image"}
            </button>

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              hidden
              onChange={handleInput}
            />

            <div
              style={{
                marginTop:
                  "5px",
                textAlign:
                  "center",
                fontSize:
                  "10px",
                color:
                  "#718ba4",
              }}
            >
              JPG · PNG · WEBP · Max 5 MB
            </div>
          </div>

          {/* IMAGE LIST */}

          {files.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "6px",
                overflowX:
                  "auto",
                paddingBottom:
                  "7px",
                marginBottom:
                  "7px",
              }}
            >
              {files.map(
                (file, index) => {
                  const tempUrl =
                    URL.createObjectURL(
                      file
                    );

                  return (
                    <div
                      key={`${file.name}-${index}`}
                      onClick={() =>
                        setSelectedIndex(
                          index
                        )
                      }
                      style={{
                        flex:
                          "0 0 48px",
                        width:
                          "48px",
                        height:
                          "48px",
                        borderRadius:
                          "8px",
                        overflow:
                          "hidden",
                        position:
                          "relative",
                        cursor:
                          "pointer",
                        border:
                          index ===
                          selectedIndex
                            ? "2px solid #16d9ff"
                            : "1px solid rgba(255,255,255,.2)",
                      }}
                    >
                      <img
                        src={tempUrl}
                        alt={file.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit:
                            "cover",
                          display:
                            "block",
                        }}
                      />

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();

                          URL.revokeObjectURL(
                            tempUrl
                          );

                          removeFile(
                            index
                          );
                        }}
                        style={{
                          position:
                            "absolute",
                          top: "1px",
                          right: "1px",
                          width:
                            "17px",
                          height:
                            "17px",
                          padding: 0,
                          border: 0,
                          borderRadius:
                            "50%",
                          background:
                            "rgba(0,0,0,.7)",
                          color:
                            "#fff",
                          fontSize:
                            "12px",
                          lineHeight:
                            "17px",
                          cursor:
                            "pointer",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          )}

          {/* PROCESSING STATUS */}

          {processing && (
            <div
              style={{
                padding:
                  "9px",
                marginBottom:
                  "8px",
                borderRadius:
                  "9px",
                background:
                  "rgba(34,197,94,.12)",
                border:
                  "1px solid rgba(34,197,94,.3)",
                color:
                  "#7df5a2",
                fontSize:
                  "11px",
                textAlign:
                  "center",
              }}
            >
              ✨ Removing background...
            </div>
          )}

          {removedUrl &&
            !processing && (
              <div
                style={{
                  padding:
                    "7px",
                  marginBottom:
                    "8px",
                  borderRadius:
                    "9px",
                  background:
                    "rgba(34,197,94,.10)",
                  color:
                    "#65e58e",
                  fontSize:
                    "11px",
                  textAlign:
                    "center",
                }}
              >
                ✓ Background removed
              </div>
            )}

          {/* TABS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "5px",
              marginBottom:
                "8px",
            }}
          >
            <button
              type="button"
              onClick={() =>
                setMode(
                  "background"
                )
              }
              style={{
                border: "0",
                borderRadius:
                  "8px",
                padding:
                  "9px 4px",
                cursor:
                  "pointer",
                fontWeight:
                  "700",
                fontSize:
                  "11px",
                color:
                  mode ===
                  "background"
                    ? "#fff"
                    : "#9db2c7",
                background:
                  mode ===
                  "background"
                    ? "linear-gradient(135deg,#09cfff,#18e0bb)"
                    : "rgba(255,255,255,.06)",
              }}
            >
              🖼 Background
            </button>

            <button
              type="button"
              onClick={() =>
                setMode("color")
              }
              style={{
                border: "0",
                borderRadius:
                  "8px",
                padding:
                  "9px 4px",
                cursor:
                  "pointer",
                fontWeight:
                  "700",
                fontSize:
                  "11px",
                color:
                  mode === "color"
                    ? "#fff"
                    : "#9db2c7",
                background:
                  mode === "color"
                    ? "linear-gradient(135deg,#09cfff,#18e0bb)"
                    : "rgba(255,255,255,.06)",
              }}
            >
              🎨 Color
            </button>
          </div>

          {/* =================================================
              BACKGROUND GRID
          ================================================= */}

          {mode ===
            "background" && (
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY:
                  "auto",
                overflowX:
                  "hidden",
                paddingRight:
                  "3px",
              }}
            >
              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0,1fr))",
                  gap: "6px",
                }}
              >
                {BACKGROUNDS.map(
                  (
                    background
                  ) => {
                    const selected =
                      selectedBackground?.name ===
                      background.name;

                    return (
                      <button
                        type="button"
                        key={
                          background.name
                        }
                        onClick={() =>
                          selectBackground(
                            background
                          )
                        }
                        title={
                          background.name
                        }
                        style={{
                          border:
                            selected
                              ? "2px solid #16d9ff"
                              : "1px solid rgba(255,255,255,.12)",
                          padding:
                            "2px",
                          borderRadius:
                            "9px",
                          background:
                            selected
                              ? "rgba(22,217,255,.15)"
                              : "rgba(255,255,255,.04)",
                          cursor:
                            "pointer",
                          overflow:
                            "hidden",
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
                          style={{
                            width:
                              "100%",
                            height:
                              "58px",
                            objectFit:
                              "cover",
                            borderRadius:
                              "6px",
                            display:
                              "block",
                          }}
                        />

                        <div
                          style={{
                            fontSize:
                              "8px",
                            color:
                              "#c7d7e7",
                            padding:
                              "3px 1px 2px",
                            whiteSpace:
                              "nowrap",
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                          }}
                        >
                          {
                            background.name
                          }
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* =================================================
              COLOR GRID
          ================================================= */}

          {mode ===
            "color" && (
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY:
                  "auto",
                paddingRight:
                  "3px",
              }}
            >
              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(4, minmax(0,1fr))",
                  gap: "6px",
                }}
              >
                {COLORS.map(
                  (color) => {
                    const selected =
                      selectedColor ===
                      color.value;

                    return (
                      <button
                        type="button"
                        key={
                          color.name
                        }
                        onClick={() =>
                          selectColor(
                            color
                          )
                        }
                        title={
                          color.name
                        }
                        style={{
                          border:
                            selected
                              ? "2px solid #16d9ff"
                              : "1px solid rgba(255,255,255,.12)",
                          borderRadius:
                            "8px",
                          padding:
                            "3px",
                          background:
                            "rgba(255,255,255,.04)",
                          cursor:
                            "pointer",
                        }}
                      >
                        <span
                          style={{
                            display:
                              "block",
                            width:
                              "100%",
                            aspectRatio:
                              "1",
                            borderRadius:
                              "6px",
                            background:
                              color.value ===
                              "transparent"
                                ? "linear-gradient(45deg,#ddd 25%,#fff 25%,#fff 50%,#ddd 50%,#ddd 75%,#fff 75%)"
                                : color.value,
                            backgroundSize:
                              "10px 10px",
                            boxShadow:
                              "inset 0 0 0 1px rgba(0,0,0,.12)",
                          }}
                        />

                        <div
                          style={{
                            fontSize:
                              "7px",
                            color:
                              "#b8c9d9",
                            paddingTop:
                              "3px",
                            whiteSpace:
                              "nowrap",
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                          }}
                        >
                          {
                            color.name
                          }
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </aside>

        {/* =================================================
            RIGHT MAIN IMAGE AREA

            Only ONE image area.
            No long preview sections.
        ================================================= */}

        <main
          style={{
            minWidth: 0,
            minHeight: 0,
            background:
              "rgba(8,22,37,.94)",
            border:
              "1px solid rgba(0,221,255,.25)",
            borderRadius:
              "16px",
            padding:
              "14px",
            display:
              "flex",
            flexDirection:
              "column",
            boxSizing:
              "border-box",
          }}
        >
          {!currentFile ? (
            /* ===============================================
               INITIAL UPLOAD SCREEN
            =============================================== */

            <div
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDrop={handleDrop}
              onClick={() =>
                inputRef.current?.click()
              }
              style={{
                flex: 1,
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                cursor:
                  "pointer",
                border:
                  "1px dashed rgba(22,217,255,.5)",
                borderRadius:
                  "12px",
                background:
                  "rgba(255,255,255,.025)",
              }}
            >
              <div
                style={{
                  textAlign:
                    "center",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "42px",
                    marginBottom:
                      "12px",
                  }}
                >
                  🖼️
                </div>

                <h2
                  style={{
                    margin:
                      "0 0 7px",
                    fontSize:
                      "22px",
                  }}
                >
                  Upload Image
                </h2>

                <p
                  style={{
                    margin:
                      "0",
                    color:
                      "#8ea6bd",
                    fontSize:
                      "13px",
                  }}
                >
                  Drag & drop your
                  image here
                </p>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();

                    inputRef.current?.click();
                  }}
                  style={{
                    marginTop:
                      "18px",
                    border: 0,
                    borderRadius:
                      "10px",
                    padding:
                      "11px 28px",
                    background:
                      "linear-gradient(135deg,#087df0,#14d8bd)",
                    color:
                      "#fff",
                    fontWeight:
                      "800",
                    cursor:
                      "pointer",
                    fontSize:
                      "14px",
                  }}
                >
                  Upload Image
                </button>
              </div>
            </div>
          ) : (
            /* ===============================================
               IMAGE DISPLAY

               ONLY ONE IMAGE AREA
            =============================================== */

            <>
              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  marginBottom:
                    "8px",
                }}
              >
                <div>
                  <strong
                    style={{
                      fontSize:
                        "13px",
                    }}
                  >
                    {currentFile.name}
                  </strong>

                  <div
                    style={{
                      fontSize:
                        "10px",
                      color:
                        "#7890a6",
                      marginTop:
                        "2px",
                    }}
                  >
                    {formatSize(
                      currentFile.size
                    )}
                  </div>
                </div>

                <span
                  style={{
                    fontSize:
                      "10px",
                    color:
                      "#718ba4",
                  }}
                >
                  {selectedIndex +
                    1}{" "}
                  /{" "}
                  {files.length}
                </span>
              </div>

              {/* IMAGE CANVAS */}

              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  borderRadius:
                    "12px",
                  overflow:
                    "hidden",
                  background:
                    selectedBackground
                      ? `url("${selectedBackground.url}") center / cover`
                      : selectedColor !==
                        "transparent"
                      ? selectedColor
                      : "#f4f6f8",
                  position:
                    "relative",
                }}
              >
                {/* Removed foreground */}

                {removedUrl ? (
                  <img
                    src={
                      removedUrl
                    }
                    alt="Background removed"
                    style={{
                      maxWidth:
                        "58%",
                      maxHeight:
                        "58%",
                      width:
                        "auto",
                      height:
                        "auto",
                      objectFit:
                        "contain",
                      display:
                        "block",
                      filter:
                        "drop-shadow(0 12px 18px rgba(0,0,0,.25))",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      textAlign:
                        "center",
                      color:
                        "#657b90",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "34px",
                        marginBottom:
                          "8px",
                      }}
                    >
                      ✨
                    </div>

                    <strong>
                      {processing
                        ? "Removing background..."
                        : "Processing image..."}
                    </strong>
                  </div>
                )}

                {/* PROCESSING OVERLAY */}

                {processing && (
                  <div
                    style={{
                      position:
                        "absolute",
                      inset: 0,
                      display:
                        "flex",
                      alignItems:
                        "flex-end",
                      justifyContent:
                        "center",
                      padding:
                        "18px",
                      pointerEvents:
                        "none",
                    }}
                  >
                    <div
                      style={{
                        background:
                          "rgba(3,15,27,.85)",
                        padding:
                          "8px 15px",
                        borderRadius:
                          "20px",
                        fontSize:
                          "11px",
                        color:
                          "#73e9ff",
                      }}
                    >
                      ✨ Removing
                      background...
                    </div>
                  </div>
                )}
              </div>

              {/* DOWNLOAD BUTTON */}

              {removedUrl &&
                !processing &&
                (selectedBackground ||
                  (mode ===
                    "color" &&
                    selectedColor !==
                      "transparent")) && (
                  <button
                    type="button"
                    onClick={
                      downloadImage
                    }
                    style={{
                      width:
                        "100%",
                      marginTop:
                        "10px",
                      border: 0,
                      borderRadius:
                        "10px",
                      padding:
                        "11px",
                      background:
                        "linear-gradient(135deg,#08cfff,#15d7b5)",
                      color:
                        "#fff",
                      fontWeight:
                        "800",
                      fontSize:
                        "13px",
                      cursor:
                        "pointer",
                      boxShadow:
                        "0 5px 18px rgba(0,210,255,.2)",
                    }}
                  >
                    ⬇ Download Image
                  </button>
                )}

              {/* SELECT BACKGROUND MESSAGE */}

              {removedUrl &&
                !selectedBackground &&
                (selectedColor ===
                  "transparent" ||
                  mode ===
                    "background") && (
                  <div
                    style={{
                      marginTop:
                        "9px",
                      textAlign:
                        "center",
                      color:
                        "#8098ad",
                      fontSize:
                        "11px",
                    }}
                  >
                    ← Select a
                    background or
                    color from the
                    left sidebar
                  </div>
                )}
            </>
          )}
        </main>
      </div>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div
          style={{
            width: "100%",
            maxWidth: "1050px",
            margin:
              "10px auto 0",
            padding:
              "9px 12px",
            boxSizing:
              "border-box",
            borderRadius:
              "9px",
            background:
              "rgba(239,68,68,.12)",
            border:
              "1px solid rgba(239,68,68,.3)",
            color:
              "#ff9c9c",
            fontSize:
              "11px",
            textAlign:
              "center",
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* ===================================================
          MOBILE RESPONSIVE CSS
      =================================================== */}

      <style>{`
        .hubconverter-image-background * {
          box-sizing: border-box;
        }

        .hubconverter-image-background
        button {
          transition:
            transform .15s ease,
            opacity .15s ease,
            border-color .15s ease;
        }

        .hubconverter-image-background
        button:hover {
          transform: translateY(-1px);
        }

        .hubconverter-image-background
        aside::-webkit-scrollbar,
        .hubconverter-image-background
        main::-webkit-scrollbar {
          width: 6px;
        }

        .hubconverter-image-background
        aside::-webkit-scrollbar-thumb,
        .hubconverter-image-background
        main::-webkit-scrollbar-thumb {
          background: rgba(22,217,255,.35);
          border-radius: 20px;
        }

        @media (max-width: 800px) {
          .hubconverter-image-background {
            padding: 12px !important;
          }

          .hubconverter-image-background > div:nth-of-type(2) {
            grid-template-columns: 190px minmax(0,1fr) !important;
            gap: 9px !important;
            height: calc(100vh - 120px) !important;
            min-height: 500px !important;
          }
        }

        @media (max-width: 600px) {
          .hubconverter-image-background > div:nth-of-type(2) {
            grid-template-columns: 1fr !important;
            grid-template-rows: 220px minmax(0,1fr) !important;
            height: calc(100vh - 110px) !important;
            min-height: 0 !important;
          }

          .hubconverter-image-background
          aside {
            min-height: 0 !important;
          }

          .hubconverter-image-background
          main {
            min-height: 0 !important;
          }
        }
      `}</style>
    </section>
  );
}

export default ImageBackground;
