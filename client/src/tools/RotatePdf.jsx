import React, { useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";

export default function RotatePdf() {
  const [file, setFile] = useState(null);
  const [rotation, setRotation] = useState(90);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setFile(null);
      setMessage("Please select a PDF file.");
      return;
    }

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    setFile(selectedFile);
    setMessage("");
  };

  const rotatePdf = async () => {
    if (!file) {
      setMessage("Please select a PDF file first.");
      return;
    }

    try {
      setProcessing(true);
      setMessage("Reading PDF...");

      const arrayBuffer = await file.arrayBuffer();

      const pdfDoc = await PDFDocument.load(arrayBuffer);

      const pages = pdfDoc.getPages();

      setMessage(`Rotating ${pages.length} page(s)...`);

      pages.forEach((page) => {
        const currentRotation = page.getRotation().angle;

        page.setRotation(
          degrees(currentRotation + rotation)
        );
      });

      setMessage("Creating rotated PDF...");

      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }

      setDownloadUrl(url);

      setMessage(
        "PDF rotated successfully. Click Download Rotated PDF."
      );
    } catch (error) {
      console.error("Rotate PDF error:", error);

      setMessage(
        "Could not rotate this PDF. Please try another PDF file."
      );
    } finally {
      setProcessing(false);
    }
  };

  const downloadPdf = () => {
    if (!downloadUrl || !file) return;

    const originalName = file.name
      .replace(/\.pdf$/i, "")
      .replace(/[<>:"/\\|?*]+/g, "_");

    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = `${originalName}-Rotated.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          Rotate PDF
        </h2>

        <p
          style={{
            color: "#64748b",
            marginBottom: "28px",
          }}
        >
          Rotate all pages of your PDF and download the rotated file.
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
            🔄
          </div>

          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
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
              }}
            >
              Selected: {file.name}
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: "25px",
          }}
        >
          <label
            style={{
              display: "block",
              marginBottom: "10px",
              fontWeight: "700",
              color: "#334155",
            }}
          >
            Rotation
          </label>

          <select
            value={rotation}
            onChange={(event) =>
              setRotation(Number(event.target.value))
            }
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              fontSize: "16px",
              background: "#fff",
            }}
          >
            <option value={90}>Rotate 90° clockwise</option>
            <option value={180}>Rotate 180°</option>
            <option value={270}>Rotate 270° clockwise</option>
          </select>
        </div>

        <button
          type="button"
          onClick={rotatePdf}
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
          {processing ? "Rotating..." : "Rotate PDF"}
        </button>

        {downloadUrl && !processing && (
          <button
            type="button"
            onClick={downloadPdf}
            style={{
              width: "100%",
              marginTop: "15px",
              padding: "16px",
              border: "none",
              borderRadius: "12px",
              background: "#16a34a",
              color: "#fff",
              fontSize: "17px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            ⬇ Download Rotated PDF
          </button>
        )}

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
