import React, { useState } from "react";
import mammoth from "mammoth";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function WordToPdf() {
  const [file, setFile] = useState(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [convertedPdf, setConvertedPdf] = useState(null);
  const [message, setMessage] = useState("");

  async function handleFile(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const extension = selectedFile.name
      .split(".")
      .pop()
      .toLowerCase();

    if (extension !== "docx") {
      setMessage("Please select a Word .docx file.");
      return;
    }

    setFile(selectedFile);
    setHtmlContent("");
    setConvertedPdf(null);
    setMessage("");
    setLoading(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();

      const result = await mammoth.convertToHtml(
        {
          arrayBuffer,
        },
        {
          includeDefaultStyleMap: true,
        }
      );

      setHtmlContent(result.value);

      if (result.messages?.length) {
        console.log("Word conversion messages:", result.messages);
      }

      setMessage("Word file loaded successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Unable to read this Word file.");
      setFile(null);
    } finally {
      setLoading(false);
    }
  }

  async function convertToPdf() {
    if (!file || !htmlContent) {
      setMessage("Please select a Word file first.");
      return;
    }

    setLoading(true);
    setMessage("");
    setConvertedPdf(null);

    try {
      const previewElement = document.getElementById(
        "word-pdf-preview"
      );

      if (!previewElement) {
        throw new Error("Preview area not found.");
      }

      const canvas = await html2canvas(previewElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      const imageHeight =
        (canvas.height * usableWidth) / canvas.width;

      let heightLeft = imageHeight;
      let position = margin;

      pdf.addImage(
        imgData,
        "JPEG",
        margin,
        position,
        usableWidth,
        imageHeight
      );

      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = margin - (imageHeight - heightLeft);

        pdf.addPage();

        pdf.addImage(
          imgData,
          "JPEG",
          margin,
          position,
          usableWidth,
          imageHeight
        );

        heightLeft -= pageHeight - margin * 2;
      }

      const originalName = file.name.replace(/\.[^/.]+$/, "");

      const pdfBlob = pdf.output("blob");
      const downloadUrl = URL.createObjectURL(pdfBlob);

      setConvertedPdf({
        url: downloadUrl,
        filename: `ShortcutHub-${originalName}.pdf`,
      });

      setMessage("Word successfully converted to PDF.");
    } catch (error) {
      console.error(error);
      setMessage(
        "PDF conversion failed. Please try another Word file."
      );
    } finally {
      setLoading(false);
    }
  }

  function clearFile() {
    if (convertedPdf?.url) {
      URL.revokeObjectURL(convertedPdf.url);
    }

    setFile(null);
    setHtmlContent("");
    setConvertedPdf(null);
    setMessage("");
  }

  return (
    <section
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "25px 24px 50px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.94)",
            borderRadius: "22px",
            padding: "30px",
            boxShadow: "0 18px 50px rgba(15,23,42,0.12)",
            border: "1px solid rgba(148,163,184,0.25)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "52px",
                marginBottom: "10px",
              }}
            >
              📝
            </div>

            <h1
              style={{
                margin: "0 0 8px",
                fontSize: "30px",
                color: "#111827",
              }}
            >
              Word to PDF
            </h1>

            <p
              style={{
                margin: "0 0 25px",
                color: "#64748b",
              }}
            >
              Convert a Word document into a PDF file.
            </p>
          </div>

          {!file && (
            <label
              style={{
                display: "block",
                border: "2px dashed #94a3b8",
                borderRadius: "18px",
                padding: "45px 25px",
                textAlign: "center",
                cursor: "pointer",
                background: "#f8fafc",
              }}
            >
              <div
                style={{
                  fontSize: "38px",
                  marginBottom: "10px",
                }}
              >
                📁
              </div>

              <strong
                style={{
                  display: "block",
                  fontSize: "18px",
                  color: "#111827",
                  marginBottom: "7px",
                }}
              >
                Select Word File
              </strong>

              <span
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Supports .docx files
              </span>

              <input
                type="file"
                accept=".docx"
                onChange={handleFile}
                style={{ display: "none" }}
              />
            </label>
          )}

          {loading && !htmlContent && (
            <div
              style={{
                textAlign: "center",
                padding: "25px",
                color: "#475569",
              }}
            >
              Reading Word document...
            </div>
          )}

          {file && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "15px",
                  padding: "15px",
                  borderRadius: "14px",
                  background: "#f1f5f9",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <strong
                    style={{
                      display: "block",
                      color: "#111827",
                      wordBreak: "break-word",
                    }}
                  >
                    📝 {file.name}
                  </strong>

                  <small style={{ color: "#64748b" }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </small>
                </div>

                <button
                  onClick={clearFile}
                  style={{
                    border: "none",
                    background: "#fee2e2",
                    color: "#b91c1c",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "700",
                  }}
                >
                  Remove
                </button>
              </div>

              {htmlContent && (
                <div style={{ marginBottom: "22px" }}>
                  <div
                    style={{
                      marginBottom: "10px",
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    Preview
                  </div>

                  <div
                    style={{
                      overflow: "auto",
                      maxHeight: "600px",
                      padding: "20px",
                      background: "#e5e7eb",
                      borderRadius: "14px",
                    }}
                  >
                    <div
                      id="word-pdf-preview"
                      style={{
                        width: "794px",
                        minHeight: "1123px",
                        boxSizing: "border-box",
                        padding: "55px",
                        background: "#ffffff",
                        color: "#111827",
                        fontFamily:
                          "Arial, Helvetica, sans-serif",
                        fontSize: "14px",
                        lineHeight: "1.5",
                        margin: "0 auto",
                        boxShadow:
                          "0 5px 20px rgba(0,0,0,0.12)",
                      }}
                    >
                      <style>
                        {`
                          #word-pdf-preview h1 {
                            font-size: 28px;
                            margin: 0 0 18px;
                          }

                          #word-pdf-preview h2 {
                            font-size: 23px;
                            margin: 20px 0 12px;
                          }

                          #word-pdf-preview h3 {
                            font-size: 19px;
                            margin: 18px 0 10px;
                          }

                          #word-pdf-preview p {
                            margin: 0 0 12px;
                          }

                          #word-pdf-preview ul,
                          #word-pdf-preview ol {
                            margin: 10px 0 15px 25px;
                          }

                          #word-pdf-preview table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 15px 0;
                          }

                          #word-pdf-preview th,
                          #word-pdf-preview td {
                            border: 1px solid #cbd5e1;
                            padding: 7px;
                            text-align: left;
                          }

                          #word-pdf-preview th {
                            background: #f1f5f9;
                          }

                          #word-pdf-preview img {
                            max-width: 100%;
                            height: auto;
                          }

                          #word-pdf-preview blockquote {
                            border-left: 4px solid #94a3b8;
                            margin: 15px 0;
                            padding-left: 15px;
                            color: #475569;
                          }
                        `}
                      </style>

                      <div
                        dangerouslySetInnerHTML={{
                          __html: htmlContent,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={convertToPdf}
                disabled={loading || !htmlContent}
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: "12px",
                  padding: "15px",
                  background:
                    loading || !htmlContent
                      ? "#94a3b8"
                      : "#111827",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "800",
                  cursor:
                    loading || !htmlContent
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {loading
                  ? "Creating PDF..."
                  : "Convert Word to PDF →"}
              </button>

              {convertedPdf && (
                <a
                  href={convertedPdf.url}
                  download={convertedPdf.filename}
                  style={{
                    display: "block",
                    width: "100%",
                    boxSizing: "border-box",
                    marginTop: "12px",
                    borderRadius: "12px",
                    padding: "15px",
                    background: "#16a34a",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "800",
                    textAlign: "center",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  Download Converted File ↓
                </a>
              )}
            </div>
          )}

          {message && (
            <div
              style={{
                marginTop: "18px",
                padding: "12px 15px",
                borderRadius: "10px",
                background: message.includes("successfully")
                  ? "#dcfce7"
                  : "#fee2e2",
                color: message.includes("successfully")
                  ? "#166534"
                  : "#991b1b",
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}