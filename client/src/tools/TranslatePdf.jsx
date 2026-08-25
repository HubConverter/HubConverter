```jsx
import React, { useState } from "react";
import { jsPDF } from "jspdf";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

const LANGUAGES = [
  { code: "auto", name: "Auto Detect" },
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "bn", name: "Bengali" },
  { code: "gu", name: "Gujarati" },
  { code: "mr", name: "Marathi" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "pa", name: "Punjabi" },
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

function splitText(text, maxLength = 450) {
  const clean = text.replace(/\s+/g, " ").trim();

  if (!clean) {
    return [];
  }

  const words = clean.split(" ");
  const chunks = [];
  let current = "";

  for (const word of words) {
    const test = (current + " " + word).trim();

    if (test.length <= maxLength) {
      current = test;
    } else {
      if (current) {
        chunks.push(current);
      }

      if (word.length > maxLength) {
        for (let i = 0; i < word.length; i += maxLength) {
          chunks.push(word.slice(i, i + maxLength));
        }

        current = "";
      } else {
        current = word;
      }
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

async function translateText(
  text,
  sourceLanguage,
  targetLanguage
) {
  if (!text || !text.trim()) {
    return "";
  }

  if (
    sourceLanguage === targetLanguage &&
    sourceLanguage !== "auto"
  ) {
    return text;
  }

  const chunks = splitText(text, 450);
  const translatedChunks = [];

  for (const chunk of chunks) {
    const source =
      sourceLanguage === "auto"
        ? "autodetect"
        : sourceLanguage;

    const langPair =
      source + "|" + targetLanguage;

    const url =
      "https://api.mymemory.translated.net/get?q=" +
      encodeURIComponent(chunk) +
      "&langpair=" +
      encodeURIComponent(langPair);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        "Translation service returned " +
          response.status
      );
    }

    const data = await response.json();

    if (
      !data ||
      !data.responseData ||
      typeof data.responseData.translatedText !==
        "string"
    ) {
      throw new Error(
        "Translation service returned an invalid response."
      );
    }

    translatedChunks.push(
      data.responseData.translatedText
    );

    await new Promise((resolve) =>
      setTimeout(resolve, 150)
    );
  }

  return translatedChunks.join(" ");
}

async function extractPdfPages(file) {
  const arrayBuffer = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
  }).promise;

  const pages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    const items = textContent.items || [];

    const text = items
      .map((item) => {
        if (typeof item.str === "string") {
          return item.str;
        }

        return "";
      })
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    pages.push({
      pageNumber: i,
      text,
    });
  }

  return pages;
}

function addWrappedText(
  pdf,
  text,
  x,
  y,
  maxWidth,
  lineHeight
) {
  const lines = pdf.splitTextToSize(
    text || "",
    maxWidth
  );

  let currentY = y;

  for (const line of lines) {
    if (currentY > 275) {
      pdf.addPage();
      currentY = 20;
    }

    pdf.text(line, x, currentY);
    currentY += lineHeight;
  }

  return currentY;
}

function TranslatePdf() {
  const [file, setFile] = useState(null);

  const [sourceLanguage, setSourceLanguage] =
    useState("auto");

  const [targetLanguage, setTargetLanguage] =
    useState("hi");

  const [pages, setPages] = useState([]);
  const [translatedPages, setTranslatedPages] =
    useState([]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [isExtracting, setIsExtracting] =
    useState(false);

  const [isTranslating, setIsTranslating] =
    useState(false);

  const [progress, setProgress] = useState(0);

  const handleFileChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    setError("");
    setMessage("");
    setPages([]);
    setTranslatedPages([]);
    setProgress(0);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      setError("Please select a PDF file.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setMessage(
      "Selected: " + selectedFile.name
    );
  };

  const extractText = async () => {
    if (!file) {
      setError(
        "Please select a PDF file first."
      );
      return;
    }

    setError("");
    setMessage("Reading PDF...");
    setIsExtracting(true);
    setProgress(0);

    try {
      const extractedPages =
        await extractPdfPages(file);

      setPages(extractedPages);

      const readablePages =
        extractedPages.filter(
          (page) =>
            page.text &&
            page.text.trim()
        );

      if (readablePages.length === 0) {
        setError(
          "No readable text was found on this PDF. This tool currently works with text-based PDFs, not scanned/image-only PDFs."
        );

        setMessage("");
        return;
      }

      setMessage(
        "PDF ready. Found readable text on " +
          readablePages.length +
          " of " +
          extractedPages.length +
          " page(s)."
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Could not read this PDF. Please try another PDF file."
      );

      setMessage("");
    } finally {
      setIsExtracting(false);
    }
  };

  const translatePdf = async () => {
    if (!file) {
      setError(
        "Please select a PDF file first."
      );
      return;
    }

    setError("");
    setMessage("");
    setTranslatedPages([]);
    setProgress(0);
    setIsTranslating(true);

    try {
      let workingPages = pages;

      if (workingPages.length === 0) {
        setMessage("Reading PDF...");

        workingPages =
          await extractPdfPages(file);

        setPages(workingPages);
      }

      const readablePages =
        workingPages.filter(
          (page) =>
            page.text &&
            page.text.trim()
        );

      if (readablePages.length === 0) {
        throw new Error(
          "No readable text was found on this page/document. Scanned PDFs are not supported yet."
        );
      }

      const results = [];

      for (
        let i = 0;
        i < workingPages.length;
        i++
      ) {
        const page = workingPages[i];

        setMessage(
          "Translating page " +
            (i + 1) +
            " of " +
            workingPages.length +
            "..."
        );

        setProgress(
          Math.round(
            ((i + 1) /
              workingPages.length) *
              100
          )
        );

        if (
          !page.text ||
          !page.text.trim()
        ) {
          results.push("");
          continue;
        }

        const translated =
          await translateText(
            page.text,
            sourceLanguage,
            targetLanguage
          );

        results.push(translated);
      }

      setTranslatedPages(results);

      setMessage(
        "Translation completed. Creating your PDF..."
      );

      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
      });

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(11);

      for (
        let i = 0;
        i < results.length;
        i++
      ) {
        if (i > 0) {
          pdf.addPage();
        }

        const translatedText =
          results[i];

        pdf.setFontSize(10);

        pdf.text(
          "Translated Page " +
            (i + 1),
          15,
          15
        );

        pdf.setFontSize(11);

        if (!translatedText) {
          pdf.setTextColor(100);

          pdf.text(
            "No readable text found on this page.",
            15,
            30
          );

          pdf.setTextColor(0);

          continue;
        }

        addWrappedText(
          pdf,
          translatedText,
          15,
          28,
          180,
          6
        );
      }

      const originalName =
        file.name.replace(
          /\.pdf$/i,
          ""
        );

      const targetName =
        LANGUAGES.find(
          (language) =>
            language.code ===
            targetLanguage
        )?.name ||
        targetLanguage;

      const safeTargetName =
        targetName
          .replace(
            /[^a-zA-Z0-9-_ ]/g,
            ""
          )
          .replace(
            /\s+/g,
            "-"
          );

      const outputName =
        originalName +
        "-Translated-" +
        safeTargetName +
        ".pdf";

      pdf.save(outputName);

      setMessage(
        "Translation completed successfully. Your translated PDF has been downloaded."
      );

      setProgress(100);
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Translation failed. Please try again."
      );

      setMessage("");
    } finally {
      setIsTranslating(false);
    }
  };

  const resetTool = () => {
    setFile(null);
    setPages([]);
    setTranslatedPages([]);
    setMessage("");
    setError("");
    setProgress(0);
  };

  const readablePageCount =
    pages.filter(
      (page) =>
        page.text &&
        page.text.trim()
    ).length;

  const selectedTargetLanguage =
    LANGUAGES.find(
      (language) =>
        language.code === targetLanguage
    )?.name || targetLanguage;

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "30px 20px 60px",
      }}
    >
      <div
        style={{
          background:
            "rgba(255,255,255,0.96)",
          borderRadius: "20px",
          padding: "30px",
          boxShadow:
            "0 12px 35px rgba(0,0,0,0.10)",
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
              fontSize: "48px",
              marginBottom: "10px",
            }}
          >
            🌐
          </div>

          <h1
            style={{
              margin: "0 0 8px",
              fontSize: "30px",
              fontWeight: "800",
              color: "#111827",
            }}
          >
            Translate PDF
          </h1>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "15px",
            }}
          >
            Translate text-based PDF
            documents into another language.
          </p>
        </div>

        <div
          style={{
            border:
              "2px dashed #cbd5e1",
            borderRadius: "16px",
            padding: "30px",
            textAlign: "center",
            background: "#f8fafc",
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              fontSize: "40px",
              marginBottom: "10px",
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
            Select your PDF
          </h3>

          <p
            style={{
              color: "#6b7280",
              margin: "0 0 18px",
              fontSize: "14px",
            }}
          >
            Text-based PDFs are supported.
            Scanned PDFs are not supported
            yet.
          </p>

          <label
            style={{
              display: "inline-block",
              background: "#2563eb",
              color: "#fff",
              padding: "12px 22px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "700",
            }}
          >
            Choose PDF

            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={
                handleFileChange
              }
              style={{
                display: "none",
              }}
            />
          </label>

          {file && (
            <div
              style={{
                marginTop: "18px",
                fontWeight: "600",
                color: "#374151",
                wordBreak:
                  "break-word",
              }}
            >
              📎 {file.name}
            </div>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
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
                marginBottom: "8px",
              }}
            >
              Source Language
            </label>

            <select
              value={sourceLanguage}
              onChange={(e) =>
                setSourceLanguage(
                  e.target.value
                )
              }
              disabled={
                isTranslating
              }
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border:
                  "1px solid #d1d5db",
                background: "#fff",
                fontSize: "15px",
              }}
            >
              {LANGUAGES.map(
                (language) => (
                  <option
                    key={
                      language.code
                    }
                    value={
                      language.code
                    }
                  >
                    {language.name}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontWeight: "700",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Translate To
            </label>

            <select
              value={targetLanguage}
              onChange={(e) =>
                setTargetLanguage(
                  e.target.value
                )
              }
              disabled={
                isTranslating
              }
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border:
                  "1px solid #d1d5db",
                background: "#fff",
                fontSize: "15px",
              }}
            >
              {LANGUAGES.filter(
                (language) =>
                  language.code !==
                  "auto"
              ).map(
                (language) => (
                  <option
                    key={
                      language.code
                    }
                    value={
                      language.code
                    }
                  >
                    {language.name}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent:
              "center",
            marginBottom: "20px",
          }}
        >
          <button
            onClick={extractText}
            disabled={
              !file ||
              isExtracting ||
              isTranslating
            }
            style={{
              border: "none",
              background:
                !file ||
                isExtracting ||
                isTranslating
                  ? "#cbd5e1"
                  : "#475569",
              color: "#fff",
              padding:
                "12px 22px",
              borderRadius: "10px",
              fontWeight: "700",
              cursor:
                !file ||
                isExtracting ||
                isTranslating
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {isExtracting
              ? "Reading PDF..."
              : "Read PDF"}
          </button>

          <button
            onClick={translatePdf}
            disabled={
              !file ||
              isTranslating
            }
            style={{
              border: "none",
              background:
                !file ||
                isTranslating
                  ? "#93c5fd"
                  : "#2563eb",
              color: "#fff",
              padding:
                "12px 26px",
              borderRadius: "10px",
              fontWeight: "800",
              cursor:
                !file ||
                isTranslating
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {isTranslating
              ? "Translating " +
                progress +
                "%"
              : "Translate PDF"}
          </button>

          <button
            onClick={resetTool}
            disabled={
              isTranslating
            }
            style={{
              border:
                "1px solid #d1d5db",
              background: "#fff",
              color: "#374151",
              padding:
                "12px 22px",
              borderRadius: "10px",
              fontWeight: "700",
              cursor:
                isTranslating
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Clear
          </button>
        </div>

        {isTranslating && (
          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                height: "10px",
                width: "100%",
                background:
                  "#e5e7eb",
                borderRadius:
                  "999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width:
                    progress + "%",
                  background:
                    "#2563eb",
                  transition:
                    "width 0.3s ease",
                }}
              />
            </div>

            <div
              style={{
                textAlign:
                  "center",
                marginTop: "8px",
                color:
                  "#475569",
                fontSize:
                  "14px",
                fontWeight:
                  "600",
              }}
            >
              {progress}% completed
            </div>
          </div>
        )}

        {message && (
          <div
            style={{
              background:
                "#eff6ff",
              color:
                "#1d4ed8",
              border:
                "1px solid #bfdbfe",
              borderRadius:
                "10px",
              padding:
                "13px 15px",
              marginBottom:
                "15px",
              fontWeight:
                "600",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              background:
                "#fef2f2",
              color:
                "#b91c1c",
              border:
                "1px solid #fecaca",
              borderRadius:
                "10px",
              padding:
                "13px 15px",
              marginBottom:
                "15px",
              fontWeight:
                "600",
              lineHeight:
                "1.5",
            }}
          >
            {error}
          </div>
        )}

        {pages.length > 0 && (
          <div
            style={{
              marginTop: "22px",
              padding: "18px",
              borderRadius:
                "14px",
              background:
                "#f8fafc",
              border:
                "1px solid #e2e8f0",
            }}
          >
            <h3
              style={{
                margin:
                  "0 0 10px",
                color:
                  "#1f2937",
              }}
            >
              PDF Information
            </h3>

            <div
              style={{
                color:
                  "#475569",
                fontSize:
                  "14px",
                lineHeight:
                  "1.7",
              }}
            >
              <div>
                Total pages:{" "}
                <strong>
                  {pages.length}
                </strong>
              </div>

              <div>
                Readable pages:{" "}
                <strong>
                  {readablePageCount}
                </strong>
              </div>

              <div>
                Target language:{" "}
                <strong>
                  {
                    selectedTargetLanguage
                  }
                </strong>
              </div>
            </div>
          </div>
        )}

        {translatedPages.length >
          0 &&
          !isTranslating && (
            <div
              style={{
                marginTop: "20px",
                padding: "18px",
                borderRadius:
                  "14px",
                background:
                  "#f0fdf4",
                border:
                  "1px solid #bbf7d0",
                color:
                  "#166534",
                fontWeight:
                  "700",
                textAlign:
                  "center",
              }}
            >
              ✅ Translation
              completed
              successfully.
              <br />
              Your translated
              PDF has been
              downloaded.
            </div>
          )}
      </div>
    </div>
  );
}
export default TranslatePdf;
```
