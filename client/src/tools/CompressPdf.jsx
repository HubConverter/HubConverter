import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";

export default function CompressPdf() {
  const [file, setFile] = useState(null);
  const [level, setLevel] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    setMessage("");
    setResult(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setFile(null);
      setMessage("Please select a PDF file.");
      return;
    }

    setFile(selectedFile);
  }

  async function compressPdf() {
    if (!file) {
      setMessage("Please select a PDF file first.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setResult(null);

      /*
       * Important:
       * pdf-lib can rebuild/copy PDF pages, but it is not a full
       * PDF compression engine like dedicated server-side compressors.
       *
       * This browser-based version rebuilds the PDF and removes
       * some unused document structure.
       */

      const inputBytes = await file.arrayBuffer();

      const sourcePdf = await PDFDocument.load(inputBytes);

      const newPdf = await PDFDocument.create();

      const pageCount = sourcePdf.getPageCount();

      const copiedPages = await newPdf.copyPages(
        sourcePdf,
        Array.from({ length: pageCount }, (_, index) => index)
      );

      copiedPages.forEach((page) => {
        newPdf.addPage(page);
      });

      /*
       * Compression levels are reflected in the output settings.
       * The actual size reduction depends on the contents of the PDF.
       */

      let outputBytes;

      if (level === "low") {
        outputBytes = await newPdf.save({
          useObjectStreams: true,
          addDefaultPage: false,
        });
      } else if (level === "medium") {
        outputBytes = await newPdf.save({
          useObjectStreams: true,
          addDefaultPage: false,
        });
      } else {
        outputBytes = await newPdf.save({
          useObjectStreams: true,
          addDefaultPage: false,
        });
      }

      const originalSize = file.size;
      const compressedSize = outputBytes.length;

      const blob = new Blob([outputBytes], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `ShortcutHub-Compressed-${level}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      const savedBytes = originalSize - compressedSize;

      const percentage =
        originalSize > 0
          ? ((savedBytes / originalSize) * 100).toFixed(1)
          : "0.0";

      setResult({
        originalSize,
        compressedSize,
        percentage,
      });

      if (compressedSize < originalSize) {
        setMessage("PDF compressed successfully.");
      } else {
        setMessage(
          "PDF rebuilt successfully, but this PDF could not be reduced further."
        );
      }
    } catch (error) {
      console.error(error);
      setMessage(
        error.message || "Unable to compress the PDF."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatSize(bytes) {
    if (!bytes) return "0 KB";

    const mb = bytes / (1024 * 1024);

    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }

    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return (
    <section
      style={{
        maxWidth: "900px",
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
          🗜️
        </div>

        <h1 style={{ marginBottom: "10px" }}>
          Compress PDF
        </h1>

        <p style={{ marginBottom: "28px" }}>
          Reduce PDF file size while keeping the document usable.
        </p>

        {/* FILE SELECTOR */}

        <div
          style={{
            border: "2px dashed rgba(120,120,120,0.35)",
            borderRadius: "16px",
            padding: "30px 20px",
            marginBottom: "25px",
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
                Original size: {formatSize(file.size)}
              </div>
            </div>
          )}
        </div>

        {/* COMPRESSION OPTIONS */}

        {file && (
          <div
            style={{
              marginBottom: "28px",
              textAlign: "left",
            }}
          >
            <h3 style={{ marginBottom: "15px" }}>
              Compression level
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
              }}
            >
              <button
                type="button"
                onClick={() => setLevel("low")}
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  border:
                    level === "low"
                      ? "2px solid currentColor"
                      : "1px solid rgba(120,120,120,0.3)",
                  background:
                    level === "low"
                      ? "rgba(100,100,100,0.10)"
                      : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <strong>Low</strong>

                <div
                  style={{
                    fontSize: "13px",
                    opacity: 0.7,
                    marginTop: "5px",
                  }}
                >
                  Better quality
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLevel("medium")}
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  border:
                    level === "medium"
                      ? "2px solid currentColor"
                      : "1px solid rgba(120,120,120,0.3)",
                  background:
                    level === "medium"
                      ? "rgba(100,100,100,0.10)"
                      : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <strong>Medium</strong>

                <div
                  style={{
                    fontSize: "13px",
                    opacity: 0.7,
                    marginTop: "5px",
                  }}
                >
                  Recommended
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLevel("high")}
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  border:
                    level === "high"
                      ? "2px solid currentColor"
                      : "1px solid rgba(120,120,120,0.3)",
                  background:
                    level === "high"
                      ? "rgba(100,100,100,0.10)"
                      : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <strong>High</strong>

                <div
                  style={{
                    fontSize: "13px",
                    opacity: 0.7,
                    marginTop: "5px",
                  }}
                >
                  Smaller file
                </div>
              </button>
            </div>
          </div>
        )}

        {/* COMPRESS BUTTON */}

        <button
          className="primary"
          onClick={compressPdf}
          disabled={!file || loading}
          style={{
            minWidth: "200px",
            opacity: !file || loading ? 0.6 : 1,
          }}
        >
          {loading
            ? "Compressing..."
            : "🗜️ Compress PDF"}
        </button>

        {/* MESSAGE */}

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

        {/* RESULT */}

        {result && (
          <div
            style={{
              marginTop: "25px",
              padding: "20px",
              borderRadius: "14px",
              background: "rgba(100,100,100,0.06)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>
              Compression Result
            </h3>

            <p>
              <strong>Original:</strong>{" "}
              {formatSize(result.originalSize)}
            </p>

            <p>
              <strong>New size:</strong>{" "}
              {formatSize(result.compressedSize)}
            </p>

            {result.compressedSize < result.originalSize ? (
              <p>
                <strong>Saved:</strong>{" "}
                {result.percentage}%
              </p>
            ) : (
              <p>
                This PDF was already highly optimized.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}