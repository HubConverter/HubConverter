import React, { useEffect, useRef, useState } from "react";

const extensionByFormat = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export default function ImageRotator() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef("");

  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("");
  const [angle, setAngle] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [format, setFormat] = useState("image/png");
  const [quality, setQuality] = useState(0.92);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    const radians = (Number(angle) || 0) * (Math.PI / 180);

    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));

    canvas.width = Math.ceil(width * cos + height * sin);
    canvas.height = Math.ceil(width * sin + height * cos);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (format === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(radians);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    ctx.drawImage(image, -width / 2, -height / 2, width, height);
    ctx.restore();
  }, [image, angle, flipX, flipY, format]);

  function handleFiles(fileList) {
    const file = fileList?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    const url = URL.createObjectURL(file);
    const nextImage = new Image();

    nextImage.onload = () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      objectUrlRef.current = url;

      setImage(nextImage);
      setFileName(file.name);
      setAngle(0);
      setFlipX(false);
      setFlipY(false);
      setError("");
    };

    nextImage.onerror = () => {
      URL.revokeObjectURL(url);
      setError("Could not load this image. Try another file.");
    };

    nextImage.src = url;
  }

  function resetTool() {
    setImage(null);
    setFileName("");
    setAngle(0);
    setFlipX(false);
    setFlipY(false);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function downloadImage() {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ext = extensionByFormat[format] || "png";
    const cleanName = fileName.replace(/\.[^/.]+$/, "") || "image";
    const outputName = `${cleanName}-rotated.${ext}`;

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Could not export the image.");
          return;
        }

        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = outputName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(downloadUrl);
      },
      format,
      format === "image/png" ? undefined : quality
    );
  }

  return (
    <section className="toolPage image-rotator-page">
      <div className="toolBox image-rotator-box">
        <small>IMAGE TOOL</small>
        <h1>Image Rotator</h1>
        <p>Rotate JPG, PNG, WEBP and other images directly in your browser.</p>

        {!image && (
          <label
            className={`uploadBox rotator-upload ${dragging ? "rotator-dragging" : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              handleFiles(event.dataTransfer.files);
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(event) => {
                handleFiles(event.target.files);
                event.target.value = "";
              }}
            />

            <div className="uploadIcon">🔃</div>
            <strong>Choose image or drop it here</strong>
            <span>Supports JPG, PNG, WEBP and more</span>
          </label>
        )}

        {error && <div className="rotator-error">{error}</div>}

        {image && (
          <>
            <div className="rotator-file-name">
              <b>{fileName}</b>
              <small>
                {image.naturalWidth} × {image.naturalHeight}px
              </small>
            </div>

            <div className="rotator-preview">
              <canvas ref={canvasRef} className="rotator-canvas" />
            </div>

            <div className="rotator-controls">
              <div className="rotator-actions">
                <button type="button" className="rotator-secondary" onClick={() => setAngle((v) => v - 90)}>
                  ↶ Left 90°
                </button>

                <button type="button" className="rotator-secondary" onClick={() => setAngle((v) => v + 90)}>
                  ↷ Right 90°
                </button>

                <button type="button" className="rotator-secondary" onClick={() => setFlipX((v) => !v)}>
                  Flip X
                </button>

                <button type="button" className="rotator-secondary" onClick={() => setFlipY((v) => !v)}>
                  Flip Y
                </button>

                <button type="button" className="rotator-secondary" onClick={() => setAngle(0)}>
                  Reset Angle
                </button>
              </div>

              <label className="rotator-angle-row">
                <span>Custom angle</span>

                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={angle}
                  onChange={(event) => setAngle(Number(event.target.value))}
                />

                <input
                  className="rotator-angle-input"
                  type="number"
                  value={angle}
                  onChange={(event) => setAngle(Number(event.target.value))}
                />

                <span>°</span>
              </label>

              <div className="rotator-format-row">
                <label>
                  Output format
                  <select value={format} onChange={(event) => setFormat(event.target.value)}>
                    <option value="image/png">PNG</option>
                    <option value="image/jpeg">JPG</option>
                    <option value="image/webp">WEBP</option>
                  </select>
                </label>

                {format !== "image/png" && (
                  <label>
                    Quality {Math.round(quality * 100)}%
                    <input
                      type="range"
                      min="0.5"
                      max="1"
                      step="0.01"
                      value={quality}
                      onChange={(event) => setQuality(Number(event.target.value))}
                    />
                  </label>
                )}
              </div>

              <div className="rotator-bottom-actions">
                <button type="button" className="downloadButton" onClick={downloadImage}>
                  Download Rotated Image
                </button>

                <button type="button" className="rotator-secondary" onClick={resetTool}>
                  Choose Another Image
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
