import React, { useEffect, useRef, useState } from "react";

const TARGETS = [
  { value: 20, label: "Less than 20 KB" },
  { value: 50, label: "Less than 50 KB" },
  { value: 100, label: "Less than 100 KB" },
  { value: 200, label: "Less than 200 KB" },
  { value: 500, label: "Less than 500 KB" },
];

const MAX_INPUT_SIZE = 50 * 1024 * 1024;

function formatBytes(bytes) {
  if (!bytes) return "0 KB";

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image."));
    };

    image.src = url;
  });
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not create compressed image."));
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });
}

async function compressToTarget(image, targetBytes) {
  let width = image.naturalWidth || image.width;
  let height = image.naturalHeight || image.height;

  const originalWidth = width;
  const originalHeight = height;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Your browser does not support image compression.");
  }

  /*
   * First try the original dimensions.
   * Then reduce dimensions if the target is very small.
   */
  let bestBlob = null;
  let bestWidth = width;
  let bestHeight = height;

  for (let dimensionPass = 0; dimensionPass < 12; dimensionPass++) {
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /*
     * White background prevents transparent PNG images
     * from becoming black when converted to JPEG.
     */
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      0,
      0,
      canvas.width,
      canvas.height
    );

    /*
     * Binary search JPEG quality.
     * This gives much better target-size control than
     * simply using Low / Medium / High.
     */
    let low = 0.05;
    let high = 0.95;
    let passBest = null;

    for (let qualityPass = 0; qualityPass < 9; qualityPass++) {
      const quality = (low + high) / 2;

      const blob = await canvasToBlob(canvas, quality);

      if (blob.size <= targetBytes) {
        passBest = blob;
        bestBlob = blob;
        bestWidth = canvas.width;
        bestHeight = canvas.height;

        low = quality;
      } else {
        high = quality;
      }
    }

    /*
     * If the image is already below target,
     * use the result and stop.
     */
    if (bestBlob && bestBlob.size <= targetBytes) {
      break;
    }

    /*
     * If we still cannot reach the target,
     * reduce dimensions by 15% and try again.
     */
    width *= 0.85;
    height *= 0.85;

    if (width < 120 || height < 120) {
      width = Math.max(120, width);
      height = Math.max(120, height);
    }

    /*
     * Safety stop for extremely small targets.
     */
    if (
      Math.round(width) <= 120 &&
      Math.round(height) <= 120
    ) {
      break;
    }
  }

  if (!bestBlob) {
    /*
     * Last attempt with very small dimensions and quality.
     */
    width = Math.max(100, Math.round(originalWidth * 0.25));
    height = Math.max(100, Math.round(originalHeight * 0.25));

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.drawImage(image, 0, 0, width, height);

    bestBlob = await canvasToBlob(canvas, 0.1);
    bestWidth = width;
    bestHeight = height;
  }

  return {
    blob: bestBlob,
    width: bestWidth,
    height: bestHeight,
  };
}

export default function ImageCompressor() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [target, setTarget] = useState(100);
  const [compressedBlob, setCompressedBlob] = useState(null);
  const [compressedUrl, setCompressedUrl] = useState("");
  const [compressedSize, setCompressedSize] = useState(0);
  const [dimensions, setDimensions] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [compressing, setCompressing] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      if (compressedUrl) {
        URL.revokeObjectURL(compressedUrl);
      }
    };
  }, [previewUrl, compressedUrl]);

  function resetResult() {
    if (compressedUrl) {
      URL.revokeObjectURL(compressedUrl);
    }

    setCompressedBlob(null);
    setCompressedUrl("");
    setCompressedSize(0);
    setDimensions(null);
    setStatus("");
    setError("");
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    resetResult();

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a JPG, JPEG, PNG or WebP image.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_INPUT_SIZE) {
      setError("The selected image is too large. Maximum input size is 50 MB.");
      event.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(selectedFile);

    setFile(selectedFile);
    setPreviewUrl(url);
    setError("");
    setStatus("Image ready to compress.");
  }

  async function compressImage() {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    setCompressing(true);
    setError("");
    setStatus("Compressing image...");

    try {
      const image = await loadImage(file);

      const targetBytes = target * 1024;

      const result = await compressToTarget(
        image,
        targetBytes
      );

      if (!result.blob) {
        throw new Error("Compression failed.");
      }

      if (compressedUrl) {
        URL.revokeObjectURL(compressedUrl);
      }

      const url = URL.createObjectURL(result.blob);

      setCompressedBlob(result.blob);
      setCompressedUrl(url);
      setCompressedSize(result.blob.size);

      setDimensions({
        width: result.width,
        height: result.height,
      });

      if (result.blob.size <= targetBytes) {
        setStatus(
          `Done! Image compressed below ${target} KB.`
        );
      } else {
        setStatus(
          "Compression completed, but this image could not reach the selected target."
        );
      }
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Could not compress this image."
      );
      setStatus("");
    } finally {
      setCompressing(false);
    }
  }

  function downloadImage() {
    if (!compressedBlob) return;

    const originalName =
      file?.name
        ?.replace(/\.[^/.]+$/, "")
        .replace(/[^\w-]+/g, "-") ||
      "image";

    const a = document.createElement("a");

    a.href = compressedUrl;
    a.download = `${originalName}-compressed.jpg`;

    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function chooseAnother() {
    resetResult();
    setFile(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl("");
    setError("");
    setStatus("");

    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  }

  const reduction =
    file && compressedSize
      ? Math.max(
          0,
          ((file.size - compressedSize) / file.size) * 100
        )
      : 0;

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "var(--card, #fff)",
          border: "1px solid rgba(0,0,0,.10)",
          borderRadius: "20px",
          padding: "28px",
          boxShadow: "0 10px 30px rgba(0,0,0,.06)",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <small>IMAGE TOOL</small>

          <h1
            style={{
              margin: "6px 0 8px",
            }}
          >
            Image Compressor
          </h1>

          <p
            style={{
              margin: 0,
              opacity: 0.72,
            }}
          >
            Compress your image to a specific file size.
          </p>
        </div>

        {!file ? (
          <label
            style={{
              display: "block",
              border: "2px dashed rgba(0,0,0,.18)",
              borderRadius: "18px",
              padding: "45px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: "#fafcff",
            }}
          >
            <div
              style={{
                fontSize: "52px",
                marginBottom: "12px",
              }}
            >
              🗜️
            </div>

            <strong
              style={{
                display: "block",
                fontSize: "18px",
              }}
            >
              Choose an image
            </strong>

            <span
              style={{
                display: "block",
                marginTop: "8px",
                opacity: 0.65,
              }}
            >
              JPG, JPEG, PNG or WebP
            </span>

            <span
              style={{
                display: "block",
                marginTop: "8px",
                fontSize: "13px",
                opacity: 0.6,
              }}
            >
              Maximum input size: 50 MB
            </span>

            <input
              ref={inputRef}
              hidden
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
            />
          </label>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(0, 1fr) minmax(0, 1fr)",
                gap: "20px",
                alignItems: "start",
              }}
            >
              <div>
                <div
                  style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    background: "#f3f5f8",
                    border:
                      "1px solid rgba(0,0,0,.08)",
                  }}
                >
                  <img
                    src={previewUrl}
                    alt="Original preview"
                    style={{
                      display: "block",
                      width: "100%",
                      maxHeight: "320px",
                      objectFit: "contain",
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: "12px",
                    fontSize: "14px",
                  }}
                >
                  <strong>Original image</strong>

                  <div
                    style={{
                      opacity: 0.7,
                      marginTop: "4px",
                    }}
                  >
                    {formatBytes(file.size)}
                  </div>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: 700,
                    marginBottom: "10px",
                  }}
                >
                  Target file size
                </label>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(2, minmax(0, 1fr))",
                    gap: "10px",
                  }}
                >
                  {TARGETS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setTarget(item.value);
                        setCompressedBlob(null);
                        if (compressedUrl) {
                          URL.revokeObjectURL(
                            compressedUrl
                          );
                        }
                        setCompressedUrl("");
                        setCompressedSize(0);
                        setDimensions(null);
                        setStatus("");
                      }}
                      style={{
                        padding: "12px 10px",
                        borderRadius: "10px",
                        border:
                          target === item.value
                            ? "2px solid #0b3154"
                            : "1px solid rgba(0,0,0,.15)",
                        background:
                          target === item.value
                            ? "rgba(11,49,84,.08)"
                            : "#fff",
                        cursor: "pointer",
                        fontWeight:
                          target === item.value
                            ? 700
                            : 500,
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="primary"
                  disabled={compressing}
                  onClick={compressImage}
                  style={{
                    width: "100%",
                    marginTop: "18px",
                  }}
                >
                  {compressing
                    ? "Compressing..."
                    : `Compress to Less than ${target} KB`}
                </button>

                <button
                  type="button"
                  onClick={chooseAnother}
                  disabled={compressing}
                  style={{
                    width: "100%",
                    marginTop: "10px",
                    padding: "11px 16px",
                    borderRadius: "10px",
                    border:
                      "1px solid rgba(0,0,0,.15)",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  Choose Another Image
                </button>
              </div>
            </div>

            {compressedBlob && (
              <div
                style={{
                  marginTop: "24px",
                  padding: "20px",
                  borderRadius: "16px",
                  background: "#f7f9fc",
                  border:
                    "1px solid rgba(0,0,0,.08)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 16px",
                  }}
                >
                  Compression Result
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(3, 1fr)",
                    gap: "12px",
                  }}
                >
                  <div>
                    <small>Original</small>
                    <strong
                      style={{
                        display: "block",
                        marginTop: "4px",
                      }}
                    >
                      {formatBytes(file.size)}
                    </strong>
                  </div>

                  <div>
                    <small>Compressed</small>
                    <strong
                      style={{
                        display: "block",
                        marginTop: "4px",
                      }}
                    >
                      {formatBytes(compressedSize)}
                    </strong>
                  </div>

                  <div>
                    <small>Reduced</small>
                    <strong
                      style={{
                        display: "block",
                        marginTop: "4px",
                      }}
                    >
                      {reduction.toFixed(1)}%
                    </strong>
                  </div>
                </div>

                {dimensions && (
                  <p
                    style={{
                      margin:
                        "14px 0 0",
                      fontSize: "13px",
                      opacity: 0.7,
                    }}
                  >
                    Output dimensions:{" "}
                    {dimensions.width} ×{" "}
                    {dimensions.height}px
                  </p>
                )}

                <button
                  type="button"
                  className="primary"
                  onClick={downloadImage}
                  style={{
                    width: "100%",
                    marginTop: "18px",
                  }}
                >
                  Download Compressed Image
                </button>
              </div>
            )}
          </>
        )}

        {status && (
          <p
            style={{
              marginTop: "18px",
              marginBottom: 0,
              fontWeight: 600,
            }}
          >
            {status}
          </p>
        )}

        {error && (
          <p
            style={{
              marginTop: "18px",
              marginBottom: 0,
              color: "#b42318",
              fontWeight: 600,
            }}
          >
            {error}
          </p>
        )}
      </div>

      <style>{`
        @media (max-width: 700px) {
          .image-compressor-mobile-stack {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}