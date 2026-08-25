```jsx
import React, { useEffect, useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

export default function TranslatePdf() {
  const [file, setFile] = useState(null);
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState("hi");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.mjs",
      import.meta.url
    ).toString();
  }, []);

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const languages = [
    { code: "auto", name: "Auto Detect" },
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "bn", name: "Bengali" },
    { code: "gu", name: "Gujarati" },
    { code: "mr", name: "Marathi" },
    { code: "pa", name: "Punjabi" },
    { code: "ta", name: "Tamil" },
    { code: "te", name: "Telugu" },
    { code: "kn", name: "Kannada" },
    { code: "ml", name: "Malayalam" },
    { code: "ur", name: "Urdu" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "es", name: "Spanish" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "ar", name: "Arabic" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "zh-CN", name: "Chinese" },
  ];

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setMessage("Please select a PDF file.");
      return;
    }

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl("");
    }

    setFile(selectedFile);
    setMessage("");
  };

  const translateText = async (text, fromLanguage, toLanguage) => {
    if (!text || !text.trim()) {
      return "";
    }

    const cleanText = text.trim();

    const url =
      "https://api.mymemory.translated.net/get?q=" +
      encodeURIComponent(cleanText) +
      "&langpair=" +
      encodeURIComponent(
        fromLanguage === "auto"
          ? "en"
          : fromLanguage
      ) +
      "%7C" +
      encodeURIComponent(toLanguage);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Translation service unavailable.");
    }

    const data = await response.json();

    if (
      !data ||
      !data.responseData ||
      typeof data.responseData.translatedText !== "string"
    ) {
      throw new Error("Translation failed.");
    }

    return data.responseData.translatedText;
  };

  const splitIntoChunks = (text, maxLength = 450) => {
    const words = text.split(/\s+/);
    const chunks = [];

    let current = "";

    words.forEach((word) => {
      const next =
        current.length === 0
          ? word
          : current + " " + word;

      if (next.length > maxLength) {
        if (current) {
          chunks.push(current);
        }

        current = word;
      } else {
        current = next;
      }
    });

    if (current) {
      chunks.push(current);
    }

    return chunks;
  };

  const translateLongText = async (
    text,
    fromLanguage,
    toLanguage
  ) => {
    const chunks = splitIntoChunks(text);

    const translatedChunks = [];

    for (const chunk of chunks) {
      const translated = await translateText(
        chunk,
        fromLanguage,
        toLanguage
      );

      translatedChunks.push(translated);
    }

    return translatedChunks.join(" ");
  };

  const extractPdfText = async (selectedFile) => {
    const arrayBuffer = await selectedFile.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
    }).promise;

    const pages = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);

      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map((item) => item.str || "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      pages.push(pageText);
    }

    return {
      pdf,
      pages,
    };
  };

  const createTranslatedPdf = async (
    translatedPages
  ) => {
    const translatedPdf = await PDFDocument.create();

    const font = await translatedPdf.embedFont(
      StandardFonts.Helvetica
    );

    translatedPages.forEach((pageText) => {
      const page = translatedPdf.addPage([
        595.28,
        841.89,
      ]);

      const pageWidth = page.getWidth();
      const pageHeight = page.getHeight();

      const margin = 45;
      const maxWidth = pageWidth - margin * 2;

      const fontSize = 12;
      const lineHeight = 18;

      let y = pageHeight - margin;

      const paragraphs = pageText
        .split(/\n+/)
        .filter((paragraph) => paragraph.trim());

      if (paragraphs.length === 0) {
        page.drawText(
          "No readable text was found on this page.",
          {
            x: margin,
            y,
            size: fontSize,
            font,
            color: rgb(0.35, 0.35, 0.35),
          }
        );

        return;
      }

      paragraphs.forEach((paragraph) => {
        const words = paragraph.split(/\s+/);

        let line = "";

        words.forEach((word) => {
          const testLine =
            line.length === 0
              ? word
              : line + " " + word;

          const testWidth = font.widthOfTextAtSize(
            testLine,
            fontSize
          );

          if (testWidth > maxWidth) {
            if (line) {
              if (y < margin + lineHeight) {
                const newPage = translatedPdf.addPage([
                  595.28,
                  841.89,
                ]);

                y =
                  newPage.getHeight() -
                  margin;

                newPage.drawText(line, {
                  x: margin,
                  y,
                  size: fontSize,
                  font,
                  color: rgb(
                    0.067,
                    0.09,
                    0.14
                  ),
                });
              } else {
                page.drawText(line, {
                  x: margin,
                  y,
                  size: fontSize,
                  font,
                  color: rgb(
                    0.067,
                    0.09,
                    0.14
                  ),
                });
              }

              y -= lineHeight;
            }

            line = word;
          } else {
            line = testLine;
          }
        });

        if (line) {
          if (y < margin + lineHeight) {
            const newPage = translatedPdf.addPage([
              595.28,
              841.89,
            ]);

            y =
              newPage.getHeight() -
              margin;

            newPage.drawText(line, {
              x: margin,
              y,
              size: fontSize,
              font,
              color: rgb(
                0.067,
                0.09,
                0.14
              ),
            });
          } else {
            page.drawText(line, {
              x: margin,
              y,
              size: fontSize,
              font,
              color: rgb(
                0.067,
                0.09,
                0.14
              ),
            });
          }

          y -= lineHeight;
        }

        y -= 8;
      });
    });

    return await translatedPdf.save();
  };

  const translatePdf = async () => {
    if (!file) {
      setMessage("Please select a PDF first.");
      return;
    }

    if (targetLanguage === "auto") {
      setMessage("Please select a target language.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setDownloadUrl("");

      const { pages } = await extractPdfText(file);

      const hasText = pages.some(
        (pageText) => pageText && pageText.trim()
      );

      if (!hasText) {
        setMessage(
          "No selectable text was found in this PDF. Scanned PDFs require OCR and are not supported yet."
        );
        return;
      }

      const translatedPages = [];

      for (let i = 0; i < pages.length; i++) {
        const pageText = pages[i];

        if (!pageText.trim()) {
          translatedPages.push("");
          continue;
        }

        setMessage(
          `Translating page ${i + 1} of ${pages.length}...`
        );

        const translated = await translateLongText(
          pageText,
          sourceLanguage,
          targetLanguage
        );

        translatedPages.push(translated);
      }

      setMessage("Creating translated PDF...");

      const pdfBytes = await createTranslatedPdf(
        translatedPages
      );

      const blob = new Blob([pdfBytes], {
        type: "application/pdf",
      });

      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }

      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);

      setMessage(
        "PDF translated successfully. Your translated PDF is ready to download."
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "Translation failed. Please try again with a text-based PDF."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = () => {
    if (!downloadUrl) {
      return;
    }

    const link = document.createElement("a");

    link.href = downloadUrl;

    link.download =
      "ShortcutHub-Translated-PDF.pdf";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  const resetTool = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }

    setFile(null);
    setSourceLanguage("auto");
    setTargetLanguage("hi");
    setLoading(false);
    setMessage("");
    setDownloadUrl("");
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "30px",
          boxShadow:
            "0 10px 35px rgba(0,0,0,0.08)",
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "18px",
              background: "#ede9fe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 15px",
              fontSize: "34px",
            }}
          >
            🌐
          </div>

          <h2
            style={{
              margin: "0 0 8px",
              fontSize: "28px",
              color: "#111827",
            }}
          >
            Translate PDF
          </h2>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "15px",
            }}
          >
            Translate text-based PDF files into another language.
          </p>
        </div>

        {!file && (
          <div
            style={{
              border: "2px dashed #cbd5e1",
              borderRadius: "18px",
              padding: "50px 20px",
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

            <h3
              style={{
                margin: "0 0 8px",
                color: "#1f2937",
              }}
            >
              Select a PDF file
            </h3>

            <p
              style={{
                color: "#6b7280",
                marginBottom: "20px",
              }}
            >
              Choose the PDF you want to translate.
            </p>

            <label
              style={{
                display: "inline-block",
                background: "#2563eb",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Choose PDF

              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                style={{
                  display: "none",
                }}
              />
            </label>
          </div>
        )}

        {file && (
          <>
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "14px",
                padding: "16px",
                marginBottom: "22px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: "700",
                    color: "#111827",
                    wordBreak: "break-word",
                  }}
                >
                  📄 {file.name}
                </div>

                <div
                  style={{
                    color: "#6b7280",
                    fontSize: "14px",
                    marginTop: "5px",
                  }}
                >
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>

              <button
                type="button"
                onClick={resetTool}
                style={{
                  border: "1px solid #d1d5db",
                  background: "#ffffff",
                  padding: "9px 15px",
                  borderRadius: "9px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Change PDF
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "18px",
                marginBottom: "22px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "700",
                    color: "#374151",
                    marginBottom: "7px",
                  }}
                >
                  Source Language
                </label>

                <select
                  value={sourceLanguage}
                  onChange={(event) =>
                    setSourceLanguage(
                      event.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "9px",
                    border:
                      "1px solid #d1d5db",
                    background: "#ffffff",
                    fontSize: "15px",
                    boxSizing: "border-box",
                  }}
                >
                  {languages.map((language) => (
                    <option
                      key={language.code}
                      value={language.code}
                    >
                      {language.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "700",
                    color: "#374151",
                    marginBottom: "7px",
                  }}
                >
                  Target Language
                </label>

                <select
                  value={targetLanguage}
                  onChange={(event) =>
                    setTargetLanguage(
                      event.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "9px",
                    border:
                      "1px solid #d1d5db",
                    background: "#ffffff",
                    fontSize: "15px",
                    boxSizing: "border-box",
                  }}
                >
                  {languages
                    .filter(
                      (language) =>
                        language.code !== "auto"
                    )
                    .map((language) => (
                      <option
                        key={language.code}
                        value={language.code}
                      >
                        {language.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "12px",
                padding: "14px 16px",
                marginBottom: "20px",
                color: "#1e40af",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              <strong>Note:</strong> This version works with
              selectable text in PDFs. Scanned/image-only PDFs
              require OCR and are not supported yet.
            </div>

            {!downloadUrl && (
              <button
                type="button"
                onClick={translatePdf}
                disabled={loading}
                style={{
                  width: "100%",
                  border: "none",
                  background: loading
                    ? "#9ca3af"
                    : "#7c3aed",
                  color: "#ffffff",
                  padding: "14px 20px",
                  borderRadius: "11px",
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                  fontSize: "16px",
                  fontWeight: "700",
                }}
              >
                {loading
                  ? "Translating PDF..."
                  : "🌐 Translate PDF"}
              </button>
            )}

            {downloadUrl && (
              <div
                style={{
                  background: "#ecfdf5",
                  border:
                    "1px solid #a7f3d0",
                  borderRadius: "14px",
                  padding: "22px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "30px",
                    marginBottom: "8px",
                  }}
                >
                  ✅
                </div>

                <h3
                  style={{
                    margin: "0 0 8px",
                    color: "#047857",
                  }}
                >
                  PDF translated successfully
                </h3>

                <p
                  style={{
                    margin: "0 0 16px",
                    color: "#065f46",
                  }}
                >
                  Your translated PDF is ready.
                </p>

                <button
                  type="button"
                  onClick={downloadPdf}
                  style={{
                    border: "none",
                    background: "#059669",
                    color: "#ffffff",
                    padding: "13px 28px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "700",
                  }}
                >
                  ⬇️ Download Translated PDF
                </button>

                <button
                  type="button"
                  onClick={resetTool}
                  style={{
                    display: "block",
                    margin:
                      "12px auto 0",
                    border:
                      "1px solid #d1d5db",
                    background: "#ffffff",
                    color: "#374151",
                    padding: "10px 20px",
                    borderRadius: "9px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Translate Another PDF
                </button>
              </div>
            )}

            {message && (
              <div
                style={{
                  marginTop: "18px",
                  padding: "13px 15px",
                  borderRadius: "10px",
                  background:
                    message.includes(
                      "successfully"
                    )
                      ? "#ecfdf5"
                      : "#fef2f2",
                  color:
                    message.includes(
                      "successfully"
                    )
                      ? "#047857"
                      : "#b91c1c",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {message}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```