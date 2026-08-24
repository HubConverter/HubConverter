import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";

export default function ExtractPdf() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      setMessage("");
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setMessage("Please select a PDF file.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setMessage("");
    setPages("");
  }

  async function handleExtractPdf() {
    if (!file) {
      setMessage("Please select a PDF file first.");
      return;
    }

    if (!pages.trim()) {
      setMessage("Please enter the page numbers you want to extract.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const inputBytes = await file.arrayBuffer();

      const sourcePdf = await PDFDocument.load(inputBytes);
      const totalPages = sourcePdf.getPageCount();

      // Examples:
      // 1,3,5
      // 1-3
      // 1,3-5
      const pageNumbers = [];

      const parts = pages
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
            pageNumbers.push(page);
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

          pageNumbers.push(page);
        }
      }

      // Remove duplicate pages while keeping entered order.
      const uniquePages = [...new Set(pageNumbers)];

      if (!uniquePages.length) {
        throw new Error("No valid pages selected.");
      }

      const newPdf = await PDFDocument.create();

      const copiedPages = await newPdf.copyPages(
        sourcePdf,
        uniquePages.map((page) => page - 1)
      );

      copiedPages.forEach((page) => {
        newPdf.addPage(page);
      });

      const outputBytes = await newPdf.save();

      const blob = new Blob([outputBytes], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "ShortcutHub-Extract-Pdf.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      setMessage(
        `Done! ${uniquePages.length} page${
          uniquePages.length === 1 ? "" : "s"
        } extracted successfully.`
      );
    } catch (error) {
      console.error(error);
      setMessage(
        error.message || "Unable to extract the PDF."
      );
    } finally {
      setLoading(false);
    }
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
          ✂️
        </div>

        <h1 style={{ marginBottom: "10px" }}>
          Extract Pdf
        </h1>

        <p style={{ marginBottom: "28px" }}>
          Extract selected pages from a PDF and create a new PDF.
        </p>

        <div
          style={{
            border: "2px dashed rgba(120,120,120,0.35)",
            borderRadius: "16px",
            padding: "30px 20px",
            marginBottom: "22px",
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
          <div style={{ marginBottom: "22px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "700",
                marginBottom: "8px",
              }}
            >
              Pages to extract
            </label>

            <input
              type="text"
              value={pages}
              onChange={(event) => setPages(event.target.value)}
              placeholder="Example: 1,3,5 or 1-3 or 1,3-5"
              style={{
                width: "100%",
                maxWidth: "500px",
                padding: "13px 15px",
                borderRadius: "10px",
                border: "1px solid rgba(120,120,120,0.35)",
                fontSize: "15px",
                boxSizing: "border-box",
              }}
            />

            <div
              style={{
                fontSize: "13px",
                opacity: 0.7,
                marginTop: "8px",
              }}
            >
              You can enter individual pages or ranges.
            </div>
          </div>
        )}

        <button
          className="primary"
          onClick={handleExtractPdf}
          disabled={!file || loading}
          style={{
            minWidth: "180px",
            opacity: !file || loading ? 0.6 : 1,
          }}
        >
          {loading ? "Extracting..." : "✂️ Extract Pdf"}
        </button>

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
{downloadUrl && (
  <a
    href={downloadUrl}
    download="ShortcutHub-Extracted-PDF.pdf"
    style={{
      display: "inline-block",
      marginTop: "18px",
      padding: "14px 28px",
      borderRadius: "10px",
      background: "linear-gradient(90deg, #ff5b35, #a936e8)",
      color: "#fff",
      fontSize: "18px",
      fontWeight: "700",
      textDecoration: "none",
      cursor: "pointer",
      boxShadow: "0 8px 20px rgba(80, 50, 180, 0.25)",
    }}
  >
    ⬇️ Download Extracted PDF
  </a>
)}
      </div>
    </section>
  );
}
