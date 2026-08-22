import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Document, Packer, Paragraph, TextRun } from "docx";

// PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function PdfToWord() {
 const [file, setFile] = useState(null);
const [processing, setProcessing] = useState(false);
const [message, setMessage] = useState("");
const [downloadUrl, setDownloadUrl] = useState(null);
const [downloadName, setDownloadName] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      setMessage("");
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
    setMessage("");
  };

  const convertToWord = async () => {
    if (!file) {
      setMessage("Please select a PDF file first.");
      return;
    }

    try {
      setProcessing(true);
      setMessage("Reading PDF...");

      const arrayBuffer = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
      }).promise;

      const paragraphs = [];

      for (
        let pageNumber = 1;
        pageNumber <= pdf.numPages;
        pageNumber++
      ) {
        setMessage(
          `Reading page ${pageNumber} of ${pdf.numPages}...`
        );

        const page = await pdf.getPage(pageNumber);

        const textContent = await page.getTextContent();

        let currentLine = "";
        let previousY = null;

        for (const item of textContent.items) {
          if (!item.str) continue;

          const text = item.str.trim();

          if (!text) continue;

          const currentY =
            item.transform && item.transform.length >= 6
              ? item.transform[5]
              : null;

          // Detect a new line
          if (
            previousY !== null &&
            currentY !== null &&
            Math.abs(currentY - previousY) > 5
          ) {
            if (currentLine.trim()) {
              paragraphs.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: currentLine.trim(),
                      size: 22,
                    }),
                  ],
                  spacing: {
                    after: 120,
                  },
                })
              );
            }

            currentLine = text;
          } else {
            if (currentLine) {
              currentLine += " ";
            }

            currentLine += text;
          }

          if (currentY !== null) {
            previousY = currentY;
          }
        }

        // Add remaining text from page
        if (currentLine.trim()) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: currentLine.trim(),
                  size: 22,
                }),
              ],
              spacing: {
                after: 120,
              },
            })
          );
        }

        // Page break between PDF pages
        if (pageNumber < pdf.numPages) {
          paragraphs.push(
            new Paragraph({
              pageBreakBefore: true,
              children: [],
            })
          );
        }
      }

      if (paragraphs.length === 0) {
        setMessage(
          "No selectable text was found. This PDF may contain scanned images."
        );
        return;
      }

      setMessage("Creating Word document...");

      // IMPORTANT:
      // Do NOT call this variable "document"
      // because browser document is needed below.
      const wordDocument = new Document({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      });

      const blob = await Packer.toBlob(wordDocument);
const url = URL.createObjectURL(blob);

const originalName = file.name
  .replace(/\.pdf$/i, "")
  .replace(/[<>:"/\\|?*]+/g, "_");

const finalFileName = `${originalName}-Word.docx`;

setDownloadUrl(url);
setDownloadName(finalFileName);

setMessage(
  "PDF successfully converted. Your Word file is ready to download."
);
    } catch (error) {
      console.error("PDF to Word error:", error);

      let errorMessage =
        "Could not convert this PDF. Please try another PDF file.";

      if (error?.message) {
        console.error("Detailed error:", error.message);
      }

      setMessage(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "850px",
        margin: "0 auto",
        padding: "30px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "35px",
          boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
          border: "1px solid #e5e7eb",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "10px",
            fontSize: "28px",
          }}
        >
          PDF to Word
        </h2>

        <p
          style={{
            color: "#64748b",
            marginBottom: "28px",
          }}
        >
          Convert a PDF into an editable Microsoft Word document.
        </p>

        <div
          style={{
            border: "2px dashed #cbd5e1",
            borderRadius: "16px",
            padding: "40px 20px",
            textAlign: "center",
            background: "#f8fafc",
          }}
        >
          <div
            style={{
              fontSize: "45px",
              marginBottom: "15px",
            }}
          >
            📄
          </div>

          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            disabled={processing}
            style={{
              display: "block",
              margin: "0 auto",
              maxWidth: "100%",
            }}
          />

          {file && (
            <div
              style={{
                marginTop: "18px",
                color: "#334155",
                fontWeight: "600",
                wordBreak: "break-word",
              }}
            >
              Selected: {file.name}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={convertToWord}
          disabled={!file || processing}
          style={{
            width: "100%",
            marginTop: "30px",
            padding: "16px",
            border: "none",
            borderRadius: "12px",
            background:
              !file || processing ? "#94a3b8" : "#2563eb",
            color: "#fff",
            fontSize: "17px",
            fontWeight: "700",
            cursor:
              !file || processing
                ? "not-allowed"
                : "pointer",
          }}
        >
          {processing ? "Converting..." : "Convert to Word"}
        </button>

        {message && (
          <div
            style={{
              marginTop: "20px",
              padding: "14px",
              borderRadius: "10px",
              background: "#f1f5f9",
              color: "#334155",
              lineHeight: "1.5",
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
