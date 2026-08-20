import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function PDFToJpg() {
  const [file, setFile] = useState(null);
  const [pdfInfo, setPdfInfo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setMessage("Please select a PDF file.");
      return;
    }

    setFile(selectedFile);
    setConvertedFiles([]);
    setPreviewUrl("");
    setMessage("");

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
      }).promise;

      setPdfInfo({
        pages: pdf.numPages,
        name: selectedFile.name,
      });

      // Render first page as preview
      const page = await pdf.getPage(1);

      const viewport = page.getViewport({
        scale: 1.2,
      });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      setPreviewUrl(canvas.toDataURL("image/jpeg", 0.9));
    } catch (error) {
      console.error(error);
      setMessage("Unable to read this PDF file.");
      setFile(null);
      setPdfInfo(null);
    }
  };

  const convertPdfToJpg = async () => {
    if (!file) {
      setMessage("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    setMessage("");
    setConvertedFiles([]);

    try {
      const arrayBuffer = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
      }).promise;

      const results = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);

        const viewport = page.getViewport({
          scale: 2,
        });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        const blob = await new Promise((resolve) => {
          canvas.toBlob(
            (result) => resolve(result),
            "image/jpeg",
            0.92
          );
        });

        results.push({
          name: `ShortcutHub-PDF-to-JPG-page-${pageNumber}.jpg`,
          blob,
          url: URL.createObjectURL(blob),
        });
      }

      setConvertedFiles(results);
      setMessage(
        `${results.length} JPG ${
          results.length === 1 ? "file" : "files"
        } converted successfully.`
      );
    } catch (error) {
      console.error(error);
      setMessage("PDF conversion failed. Please try another PDF.");
    } finally {
      setLoading(false);
    }
  };

  const downloadSingleFile = (convertedFile) => {
    const link = document.createElement("a");

    link.href = convertedFile.url;
    link.download = convertedFile.name;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllFiles = async () => {
    if (!convertedFiles.length) return;

    if (convertedFiles.length === 1) {
      downloadSingleFile(convertedFiles[0]);
      return;
    }

    const zip = new JSZip();

    convertedFiles.forEach((item) => {
      zip.file(item.name, item.blob);
    });

    const zipBlob = await zip.generateAsync({
      type: "blob",
    });

    const url = URL.createObjectURL(zipBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "ShortcutHub-PDF-to-JPG.zip";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <section
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "30px 24px 50px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              fontSize: "48px",
              marginBottom: "10px",
            }}
          >
            📄
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              fontWeight: "800",
            }}
          >
            PDF to JPG
          </h1>

          <p
            style={{
              marginTop: "10px",
              color: "#64748b",
              fontSize: "16px",
            }}
          >
            Convert every page of a PDF into high-quality JPG images.
          </p>
        </div>

        <div
          style={{
            border: "2px dashed #cbd5e1",
            borderRadius: "18px",
            padding: "35px 20px",
            textAlign: "center",
            background: "#f8fafc",
          }}
        >
          <input
            id="pdf-to-jpg-file"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <label
            htmlFor="pdf-to-jpg-file"
            style={{
              display: "inline-block",
              padding: "14px 26px",
              borderRadius: "12px",
              background: "#111827",
              color: "#ffffff",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Select PDF File
          </label>

          {file && (
            <div
              style={{
                marginTop: "18px",
                color: "#334155",
                fontWeight: "600",
              }}
            >
              {file.name}
            </div>
          )}

          {pdfInfo && (
            <div
              style={{
                marginTop: "8px",
                color: "#64748b",
              }}
            >
              {pdfInfo.pages}{" "}
              {pdfInfo.pages === 1 ? "page" : "pages"}
            </div>
          )}
        </div>

        {previewUrl && (
          <div style={{ marginTop: "30px" }}>
            <h2
              style={{
                fontSize: "20px",
                marginBottom: "14px",
              }}
            >
              Preview
            </h2>

            <div
              style={{
                padding: "15px",
                background: "#f1f5f9",
                borderRadius: "16px",
                textAlign: "center",
              }}
            >
              <img
                src={previewUrl}
                alt="PDF preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "500px",
                  borderRadius: "10px",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                }}
              />
            </div>
          </div>
        )}

        {file && (
          <button
            type="button"
            onClick={convertPdfToJpg}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "28px",
              padding: "18px",
              border: "none",
              borderRadius: "14px",
              background: "#111827",
              color: "#ffffff",
              fontSize: "18px",
              fontWeight: "800",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "Converting PDF to JPG..."
              : "Convert PDF to JPG →"}
          </button>
        )}

        {message && (
          <div
            style={{
              marginTop: "20px",
              padding: "14px",
              borderRadius: "12px",
              background: "#f1f5f9",
              textAlign: "center",
              fontWeight: "600",
              color: "#334155",
            }}
          >
            {message}
          </div>
        )}

        {convertedFiles.length > 0 && (
          <div
            style={{
              marginTop: "25px",
              padding: "24px",
              borderRadius: "16px",
              background: "#f8fafc",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                fontSize: "21px",
              }}
            >
              Converted JPG Files
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {convertedFiles.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => downloadSingleFile(item)}
                  style={{
                    padding: "13px 16px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    cursor: "pointer",
                    fontWeight: "700",
                    textAlign: "left",
                  }}
                >
                  ⬇️ {item.name}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={downloadAllFiles}
              style={{
                width: "100%",
                marginTop: "18px",
                padding: "16px",
                border: "none",
                borderRadius: "12px",
                background: "#111827",
                color: "#ffffff",
                fontSize: "17px",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              Download Converted File
            </button>
          </div>
        )}
      </div>
    </section>
  );
}