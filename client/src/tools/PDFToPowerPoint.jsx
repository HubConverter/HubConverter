import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pptxgen from "pptxgenjs";

// PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function PDFToPowerPoint() {
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
      setDownloadUrl(null);
      setDownloadName("");
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

    // Remove previous download
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }

    setFile(selectedFile);
    setMessage("");
    setDownloadUrl(null);
    setDownloadName("");
  };

  const convertToPowerPoint = async () => {
    if (!file) {
      setMessage("Please select a PDF file first.");
      return;
    }

    try {
      setProcessing(true);
      setMessage("Reading PDF...");

      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(null);
        setDownloadName("");
      }

      const arrayBuffer = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
      }).promise;

      const pptx = new pptxgen();

      pptx.layout = "LAYOUT_WIDE";
      pptx.author = "ShortcutHub";
      pptx.subject = "PDF to PowerPoint";
      pptx.title = file.name;
      pptx.company = "ShortcutHub";
      pptx.lang = "en-US";

      for (
        let pageNumber = 1;
        pageNumber <= pdf.numPages;
        pageNumber++
      ) {
        setMessage(
          `Converting page ${pageNumber} of ${pdf.numPages}...`
        );

        const page = await pdf.getPage(pageNumber);

        // Render PDF page as an image.
        // This preserves the visual appearance of the PDF.
        const viewport = page.getViewport({
          scale: 1.5,
        });

        const canvas = window.document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const imageData = canvas.toDataURL("image/png");

        const slide = pptx.addSlide();

        slide.background = {
          color: "FFFFFF",
        };

        // Fit the PDF page inside the PowerPoint slide.
        const slideWidth = 13.333;
        const slideHeight = 7.5;

        const imageRatio =
          canvas.width / canvas.height;

        const slideRatio =
          slideWidth / slideHeight;

        let imageWidth;
        let imageHeight;
        let imageX;
        let imageY;

        if (imageRatio > slideRatio) {
          imageWidth = slideWidth;
          imageHeight = slideWidth / imageRatio;
          imageX = 0;
          imageY = (slideHeight - imageHeight) / 2;
        } else {
          imageHeight = slideHeight;
          imageWidth = slideHeight * imageRatio;
          imageX = (slideWidth - imageWidth) / 2;
          imageY = 0;
        }

        slide.addImage({
          data: imageData,
          x: imageX,
          y: imageY,
          w: imageWidth,
          h: imageHeight,
        });
      }

      setMessage("Creating PowerPoint file...");

      const blob = await pptx.write({
        outputType: "blob",
      });

      const url = URL.createObjectURL(blob);

      const originalName = file.name
        .replace(/\.pdf$/i, "")
        .replace(/[<>:"/\\|?*]+/g, "_");

      const finalFileName = `${originalName}-PowerPoint.pptx`;

      setDownloadUrl(url);
      setDownloadName(finalFileName);

      setMessage(
        "PDF successfully converted. Your PowerPoint file is ready to download."
      );
    } catch (error) {
      console.error("PDF to PowerPoint error:", error);

      setMessage(
        "Could not convert this PDF. Please try another PDF file."
      );
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
          PDF to PowerPoint
        </h2>

        <p
          style={{
            color: "#64748b",
            marginBottom: "28px",
          }}
        >
          Convert PDF pages into a PowerPoint presentation.
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
            📊
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
          onClick={convertToPowerPoint}
          disabled={!file || processing}
          style={{
            width: "100%",
            marginTop: "30px",
            padding: "16px",
            border: "none",
            borderRadius: "12px",
            background:
              !file || processing
                ? "#94a3b8"
                : "#2563eb",
            color: "#fff",
            fontSize: "17px",
            fontWeight: "700",
            cursor:
              !file || processing
                ? "not-allowed"
                : "pointer",
          }}
        >
          {processing
            ? "Converting..."
            : "Convert to PowerPoint"}
        </button>

        {downloadUrl && (
          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              borderRadius: "14px",
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                marginBottom: "8px",
              }}
            >
              ✅
            </div>

            <div
              style={{
                fontWeight: "700",
                color: "#166534",
                marginBottom: "12px",
              }}
            >
              PowerPoint file is ready!
            </div>

            <a
              href={downloadUrl}
              download={downloadName}
              style={{
                display: "inline-block",
                padding: "13px 24px",
                background: "#16a34a",
                color: "#fff",
                borderRadius: "10px",
                textDecoration: "none",
                fontWeight: "700",
                fontSize: "16px",
              }}
            >
              ⬇️ Download PowerPoint File
            </a>
          </div>
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