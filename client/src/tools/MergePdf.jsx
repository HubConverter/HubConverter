import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";

export default function MergePdf() {
  const [files, setFiles] = useState([]);
  const [merging, setMerging] = useState(false);
  const [message, setMessage] = useState("");

  function addFiles(event) {
    const selected = Array.from(event.target.files || [])
      .filter((file) => file.type === "application/pdf");

    if (!selected.length) {
      setMessage("Please select PDF files.");
      return;
    }

    setFiles((current) => [...current, ...selected]);
    setMessage("");
    event.target.value = "";
  }

  function removeFile(index) {
    setFiles((current) =>
      current.filter((_, i) => i !== index)
    );
  }

  function moveUp(index) {
    if (index === 0) return;

    setFiles((current) => {
      const next = [...current];
      [next[index - 1], next[index]] = [
        next[index],
        next[index - 1],
      ];
      return next;
    });
  }

  function moveDown(index) {
    if (index === files.length - 1) return;

    setFiles((current) => {
      const next = [...current];
      [next[index], next[index + 1]] = [
        next[index + 1],
        next[index],
      ];
      return next;
    });
  }

  async function mergePdfs() {
    if (files.length < 2) {
      setMessage("Please select at least 2 PDF files.");
      return;
    }

    try {
      setMerging(true);
      setMessage("Merging your PDF files...");

      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const bytes = await file.arrayBuffer();

        const pdf = await PDFDocument.load(bytes);

        const pages = await mergedPdf.copyPages(
          pdf,
          pdf.getPageIndices()
        );

        pages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }

      const mergedBytes = await mergedPdf.save();

      const blob = new Blob(
        [mergedBytes],
        { type: "application/pdf" }
      );

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "ShortcutHub-Merged-PDF.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      setMessage(
        "PDF merged successfully. Your download has started."
      );
    } catch (error) {
      console.error(error);
      setMessage(
        "Could not merge the PDF files. Please check that the files are valid PDFs."
      );
    } finally {
      setMerging(false);
    }
  }

  return (
    <section
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "10px 24px 60px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            fontSize: "52px",
            marginBottom: "10px",
          }}
        >
          📑 ➕ 📑
        </div>

        <h1
          style={{
            margin: "0 0 10px",
            fontSize: "34px",
          }}
        >
          Merge PDF
        </h1>

        <p
          style={{
            margin: 0,
            opacity: 0.75,
            fontSize: "17px",
          }}
        >
          Combine multiple PDF files into one document.
        </p>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.96)",
          border: "2px dashed #6366f1",
          borderRadius: "22px",
          padding: "45px 25px",
          textAlign: "center",
          color: "#172554",
        }}
      >
        <div
          style={{
            fontSize: "55px",
            marginBottom: "12px",
          }}
        >
          📄
        </div>

        <h2 style={{ margin: "0 0 8px" }}>
          Add your PDF files
        </h2>

        <p
          style={{
            margin: "0 0 22px",
            color: "#64748b",
          }}
        >
          Select two or more PDF files to merge.
        </p>

        <label
          className="primary"
          style={{
            display: "inline-block",
            cursor: "pointer",
            padding: "13px 24px",
            borderRadius: "10px",
          }}
        >
          ＋ Choose PDF Files

          <input
            type="file"
            accept="application/pdf,.pdf"
            multiple
            onChange={addFiles}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {files.length > 0 && (
        <div
          style={{
            marginTop: "25px",
            background: "rgba(255,255,255,0.96)",
            borderRadius: "18px",
            padding: "25px",
            color: "#172554",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>
                Selected PDFs
              </h3>

              <small>
                {files.length} file
                {files.length === 1 ? "" : "s"}
              </small>
            </div>

            <button
              onClick={() => setFiles([])}
              style={{
                border: "none",
                background: "#fee2e2",
                color: "#991b1b",
                padding: "9px 14px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Clear All
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gap: "10px",
            }}
          >
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  background: "#f8fafc",
                }}
              >
                <span
                  style={{
                    fontWeight: "800",
                    minWidth: "30px",
                  }}
                >
                  {index + 1}.
                </span>

                <span
                  style={{
                    fontSize: "25px",
                  }}
                >
                  📄
                </span>

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <b
                    style={{
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {file.name}
                  </b>

                  <small>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </small>
                </div>

                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  title="Move up"
                  style={{
                    border: "none",
                    background: "#e2e8f0",
                    borderRadius: "7px",
                    padding: "7px 10px",
                    cursor:
                      index === 0
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  ↑
                </button>

                <button
                  onClick={() => moveDown(index)}
                  disabled={index === files.length - 1}
                  title="Move down"
                  style={{
                    border: "none",
                    background: "#e2e8f0",
                    borderRadius: "7px",
                    padding: "7px 10px",
                    cursor:
                      index === files.length - 1
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  ↓
                </button>

                <button
                  onClick={() => removeFile(index)}
                  title="Remove"
                  style={{
                    border: "none",
                    background: "#fee2e2",
                    color: "#991b1b",
                    borderRadius: "7px",
                    padding: "7px 10px",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "25px",
            }}
          >
            <button
              className="primary"
              onClick={mergePdfs}
              disabled={merging || files.length < 2}
              style={{
                minWidth: "220px",
                opacity:
                  merging || files.length < 2
                    ? 0.55
                    : 1,
              }}
            >
              {merging
                ? "Merging..."
                : "📑 Merge PDF Files"}
            </button>
          </div>

          {files.length < 2 && (
            <p
              style={{
                textAlign: "center",
                color: "#64748b",
                marginTop: "15px",
              }}
            >
              Add at least 2 PDF files to merge.
            </p>
          )}
        </div>
      )}

      {message && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.92)",
            textAlign: "center",
            color: "#172554",
            fontWeight: "600",
          }}
        >
          {message}
        </div>
      )}
    </section>
  );
}