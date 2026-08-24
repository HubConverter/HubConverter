import React, { useState } from "react";
import { PDFDocument, rgb, degrees } from "pdf-lib";

export default function WatermarkPdf() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("ShortcutHub");
  const [opacity, setOpacity] = useState(0.25);
  const [fontSize, setFontSize] = useState(48);
  const [position, setPosition] = useState("center");
  const [rotation, setRotation] = useState(45);
  const [pages, setPages] = useState("all");
  const [customPages, setCustomPages] = useState("");
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      setMessage("");
      setDownloadUrl("");
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setFile(null);
      setMessage("Please select a PDF file.");
      setDownloadUrl("");
      return;
    }

    setFile(selectedFile);
    setMessage("");
    setDownloadUrl("");
  }

  function getPagesToWatermark(totalPages) {
    if (pages === "all") {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    if (!customPages.trim()) {
      throw new Error("Please enter the page numbers.");
    }

    const pageNumbers = [];

    const parts = customPages
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    for (const part of parts) {
      if (part.includes("-")) {
        const range = part
          .split("-")
          .map((value) => value.trim());

        if (range.length !== 2) {
          throw new Error(`Invalid page range: ${part}`);
        }

        const start = Number(range[0]);
        const end = Number(range[1]);

        if (
          !Number.isInteger(start) ||
          !Number.isInteger(end) ||
          start < 1 ||
          end < 1 ||
          start > totalPages ||
          end > totalPages ||
          start > end
        ) {
          throw new Error(`Invalid page range: ${part}`);
        }

        for (let page = start; page <= end; page++) {
          pageNumbers.push(page - 1);
        }
      } else {
        const page = Number(part);

        if (
          !Number.isInteger(page) ||
          page < 1 ||
          page > totalPages
        ) {
          throw new Error(
            `Page ${part} does not exist. This PDF has ${totalPages} pages.`
          );
        }

        pageNumbers.push(page - 1);
      }
    }

    return [...new Set(pageNumbers)];
  }

  function getWatermarkPosition(page, watermarkWidth, watermarkHeight) {
    const { width, height } = page.getSize();

    switch (position) {
      case "top-left":
        return {
          x: 40,
          y: height - watermarkHeight - 40,
        };

      case "top-center":
        return {
          x: (width - watermarkWidth) / 2,
          y: height - watermarkHeight - 40,
        };

      case "top-right":
        return {
          x: width - watermarkWidth - 40,
          y: height - watermarkHeight - 40,
        };

      case "middle-left":
        return {
          x: 40,
          y: (height - watermarkHeight) / 2,
        };

      case "center":
        return {
          x: (width - watermarkWidth) / 2,
          y: (height - watermarkHeight) / 2,
        };

      case "middle-right":
        return {
          x: width - watermarkWidth - 40,
          y: (height - watermarkHeight) / 2,
        };

      case "bottom-left":
        return {
          x: 40,
          y: 40,
        };

      case "bottom-center":
        return {
          x: (width - watermarkWidth) / 2,
          y: 40,
        };

      case "bottom-right":
        return {
          x: width - watermarkWidth - 40,
          y: 40,
        };

      default:
        return {
          x: (width - watermarkWidth) / 2,
          y: (height - watermarkHeight) / 2,
        };
    }
  }

  async function handleWatermarkPdf() {
    if (!file) {
      setMessage("Please select a PDF file first.");
      return;
    }

    if (!text.trim()) {
      setMessage("Please enter watermark text.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setDownloadUrl("");

      const inputBytes = await file.arrayBuffer();

      const pdfDoc = await PDFDocument.load(inputBytes);

      const totalPages = pdfDoc.getPageCount();

      const pagesToWatermark =
        getPagesToWatermark(totalPages);

      if (!pagesToWatermark.length) {
        throw new Error("No valid pages selected.");
      }

      const watermarkText = text.trim();

      for (const pageIndex of pagesToWatermark) {
        const page = pdfDoc.getPage(pageIndex);

        const { width, height } = page.getSize();

        const estimatedTextWidth =
          watermarkText.length * fontSize * 0.55;

        const watermarkHeight = fontSize;

        let x;
        let y;

        if (position === "center") {
          x = (width - estimatedTextWidth) / 2;
          y = (height - watermarkHeight) / 2;
        } else {
          const pos = getWatermarkPosition(
            page,
            estimatedTextWidth,
            watermarkHeight
          );

          x = pos.x;
          y = pos.y;
        }

        page.drawText(watermarkText, {
          x,
          y,
          size: Number(fontSize),
          color: rgb(0.45, 0.45, 0.45),
          opacity: Number(opacity),
          rotate: degrees(Number(rotation)),
        });
      }

      const outputBytes = await pdfDoc.save();

      const blob = new Blob([outputBytes], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);

      setMessage(
        `Done! Watermark added to ${pagesToWatermark.length} page${
          pagesToWatermark.length === 1 ? "" : "s"
        }.`
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error.message || "Unable to add watermark to the PDF."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      style={{
        maxWidth: "1000px",
        margin: "30px auto",
        padding: "0 24px 50px",
      }}
    >
      <div
        className="shortcut"
        style={{
          padding: "35px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "52px",
            marginBottom: "10px",
          }}
        >
          💧
        </div>

        <h1 style={{ marginBottom: "10px" }}>
          Watermark PDF
        </h1>

        <p style={{ marginBottom: "28px" }}>
          Add a text watermark to your PDF files.
        </p>

        {/* Upload */}
        <div
          style={{
            border: "2px dashed rgba(120,120,120,0.35)",
            borderRadius: "16px",
            padding: "30px 20px",
            marginBottom: "24px",
          }}
        >
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleFileChange}
          />

          {file && (
            <div style={{ marginTop: "15px" }}>
              <strong>{file.name}</strong>

              <div
                style={{
                  fontSize: "13px",
                  opacity: 0.7,
                  marginTop: "5px",
                }}
              >
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          )}
        </div>

        {file && (
          <div
            style={{
              maxWidth: "650px",
              margin: "0 auto",
              textAlign: "left",
            }}
          >
            {/* Watermark text */}
            <label
              style={{
                display: "block",
                fontWeight: "700",
                marginBottom: "8px",
              }}
            >
              Watermark Text
            </label>

            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter watermark text"
              style={{
                width: "100%",
                padding: "13px 15px",
                borderRadius: "10px",
                border: "1px solid rgba(120,120,120,0.35)",
                fontSize: "15px",
                boxSizing: "border-box",
                marginBottom: "20px",
              }}
            />

            {/* Font size */}
            <label
              style={{
                display: "block",
                fontWeight: "700",
                marginBottom: "8px",
              }}
            >
              Font Size
            </label>

            <input
              type="number"
              min="10"
              max="150"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              style={{
                width: "100%",
                padding: "13px 15px",
                borderRadius: "10px",
                border: "1px solid rgba(120,120,120,0.35)",
                fontSize: "15px",
                boxSizing: "border-box",
                marginBottom: "20px",
              }}
            />

            {/* Opacity */}
            <label
              style={{
                display: "block",
                fontWeight: "700",
                marginBottom: "8px",
              }}
            >
              Opacity: {Math.round(opacity * 100)}%
            </label>

            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) =>
                setOpacity(Number(e.target.value))
              }
              style={{
                width: "100%",
                marginBottom: "20px",
              }}
            />

            {/* Rotation */}
            <label
              style={{
                display: "block",
                fontWeight: "700",
                marginBottom: "8px",
              }}
            >
              Rotation: {rotation}°
            </label>

            <input
              type="range"
              min="-180"
              max="180"
              step="5"
              value={rotation}
              onChange={(e) =>
                setRotation(Number(e.target.value))
              }
              style={{
                width: "100%",
                marginBottom: "20px",
              }}
            />

            {/* Position */}
            <label
              style={{
                display: "block",
                fontWeight: "700",
                marginBottom: "10px",
              }}
            >
              Position
            </label>

            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              style={{
                width: "100%",
                padding: "13px 15px",
                borderRadius: "10px",
                border: "1px solid rgba(120,120,120,0.35)",
                fontSize: "15px",
                boxSizing: "border-box",
                marginBottom: "20px",
              }}
            >
              <option value="top-left">Top Left</option>
              <option value="top-center">Top Center</option>
              <option value="top-right">Top Right</option>

              <option value="middle-left">Middle Left</option>
              <option value="center">Center</option>
              <option value="middle-right">Middle Right</option>

              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-center">Bottom Center</option>
              <option value="bottom-right">Bottom Right</option>
            </select>

            {/* Pages */}
            <label
              style={{
                display: "block",
                fontWeight: "700",
                marginBottom: "10px",
              }}
            >
              Pages
            </label>

            <div style={{ marginBottom: "10px" }}>
              <label style={{ marginRight: "20px" }}>
                <input
                  type="radio"
                  name="watermark-pages"
                  value="all"
                  checked={pages === "all"}
                  onChange={() => setPages("all")}
                />{" "}
                All Pages
              </label>

              <label>
                <input
                  type="radio"
                  name="watermark-pages"
                  value="custom"
                  checked={pages === "custom"}
                  onChange={() => setPages("custom")}
                />{" "}
                Custom Pages
              </label>
            </div>

            {pages === "custom" && (
              <input
                type="text"
                value={customPages}
                onChange={(e) =>
                  setCustomPages(e.target.value)
                }
                placeholder="Example: 1,3,5-8"
                style={{
                  width: "100%",
                  padding: "13px 15px",
                  borderRadius: "10px",
                  border: "1px solid rgba(120,120,120,0.35)",
                  fontSize: "15px",
                  boxSizing: "border-box",
                  marginBottom: "20px",
                }}
              />
            )}
          </div>
        )}

        {/* Process button */}
        <button
          className="primary"
          onClick={handleWatermarkPdf}
          disabled={!file || loading}
          style={{
            minWidth: "230px",
            marginTop: "20px",
            opacity: !file || loading ? 0.6 : 1,
          }}
        >
          {loading
            ? "Adding Watermark..."
            : "💧 Add Watermark"}
        </button>

        {/* Message */}
        {message && (
          <div
            style={{
              marginTop: "20px",
              padding: "13px 16px",
              borderRadius: "10px",
              background: "rgba(100,100,100,0.08)",
            }}
          >
            {message}
          </div>
        )}

        {/* Download button ONLY after successful processing */}
        {downloadUrl && (
          <div style={{ marginTop: "20px" }}>
            <a
              href={downloadUrl}
              download="ShortcutHub-Watermarked-PDF.pdf"
              style={{
                display: "inline-block",
                padding: "14px 28px",
                borderRadius: "10px",
                background:
                  "linear-gradient(90deg, #ff5b35, #a936e8)",
                color: "#fff",
                fontSize: "18px",
                fontWeight: "700",
                textDecoration: "none",
                cursor: "pointer",
                boxShadow:
                  "0 8px 20px rgba(80, 50, 180, 0.25)",
              }}
            >
              ⬇️ Download Watermarked PDF
            </a>
          </div>
        )}
      </div>
    </section>
  );
}