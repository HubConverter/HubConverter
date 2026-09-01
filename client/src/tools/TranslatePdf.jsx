import React, { useState } from "react";
import { jsPDF } from "jspdf";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

/* =========================================================
   LANGUAGES
========================================================= */

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

/* =========================================================
   CONSTANTS
========================================================= */

const MAX_CHUNK_LENGTH = 400;

/*
  Longer waits are intentional.

  MyMemory can return HTTP 429 when too many requests
  are sent within a short period.
*/
const RETRY_DELAYS = [
  5000,
  10000,
  20000,
  40000,
  60000,
];

/* =========================================================
   SLEEP
========================================================= */

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/* =========================================================
   SPLIT TEXT
========================================================= */

function splitText(text, maxLength = MAX_CHUNK_LENGTH) {
  const clean = String(text || "")
    .replace(/\s+/g, " ")
    .trim();

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
      continue;
    }

    if (current) {
      chunks.push(current);
    }

    /*
      If one word itself is longer than the limit,
      split it safely.
    */
    if (word.length > maxLength) {
      for (
        let i = 0;
        i < word.length;
        i += maxLength
      ) {
        chunks.push(
          word.slice(i, i + maxLength)
        );
      }

      current = "";
    } else {
      current = word;
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

/* =========================================================
   TRANSLATE ONE CHUNK
========================================================= */

async function translateChunk(
  chunk,
  sourceLanguage,
  targetLanguage
) {
  if (!chunk || !chunk.trim()) {
    return "";
  }

  if (
    sourceLanguage !== "auto" &&
    sourceLanguage === targetLanguage
  ) {
    return chunk;
  }

  const source =
    sourceLanguage === "auto"
      ? "autodetect"
      : sourceLanguage;

  const langPair =
    source + "|" + targetLanguage;

  let lastError = null;

  for (
    let attempt = 0;
    attempt < RETRY_DELAYS.length;
    attempt++
  ) {
    try {
      const url =
        "https://api.mymemory.translated.net/get" +
        "?q=" +
        encodeURIComponent(chunk) +
        "&langpair=" +
        encodeURIComponent(langPair);

      const response = await fetch(url);

      /*
        HTTP 429 = Too Many Requests
      */
      if (response.status === 429) {
        lastError = new Error(
          "Translation service is temporarily busy."
        );

        if (
          attempt <
          RETRY_DELAYS.length - 1
        ) {
          await sleep(
            RETRY_DELAYS[attempt]
          );

          continue;
        }

        throw new Error(
          "Translation service is temporarily busy. Please wait a few minutes and try again."
        );
      }

      if (!response.ok) {
        throw new Error(
          "Translation service returned HTTP " +
            response.status +
            "."
        );
      }

      const data =
        await response.json();

      if (
        !data ||
        !data.responseData ||
        typeof data.responseData
          .translatedText !== "string"
      ) {
        throw new Error(
          "Translation service returned an invalid response."
        );
      }

      const translated =
        data.responseData.translatedText.trim();

      if (!translated) {
        throw new Error(
          "Translation service returned empty text."
        );
      }

      return translated;
    } catch (error) {
      lastError = error;

      const message = String(
        error?.message || ""
      ).toLowerCase();

      /*
        Retry network errors and rate-limit errors.
      */
      const shouldRetry =
        message.includes("busy") ||
        message.includes("429") ||
        message.includes("failed to fetch") ||
        message.includes("network") ||
        message.includes("timeout");

      if (
        !shouldRetry ||
        attempt >=
          RETRY_DELAYS.length - 1
      ) {
        throw error;
      }

      await sleep(
        RETRY_DELAYS[attempt]
      );
    }
  }

  throw (
    lastError ||
    new Error(
      "Translation failed."
    )
  );
}

/* =========================================================
   TRANSLATE COMPLETE TEXT
========================================================= */

async function translateText(
  text,
  sourceLanguage,
  targetLanguage,
  onChunkProgress
) {
  if (!text || !text.trim()) {
    return "";
  }

  if (
    sourceLanguage !== "auto" &&
    sourceLanguage === targetLanguage
  ) {
    return text;
  }

  const chunks = splitText(
    text,
    MAX_CHUNK_LENGTH
  );

  const translatedChunks = [];

  for (
    let i = 0;
    i < chunks.length;
    i++
  ) {
    const translated =
      await translateChunk(
        chunks[i],
        sourceLanguage,
        targetLanguage
      );

    translatedChunks.push(
      translated
    );

    if (onChunkProgress) {
      onChunkProgress(
        i + 1,
        chunks.length
      );
    }

    /*
      Important:
      Give MyMemory some breathing room
      between requests.
    */
    if (i < chunks.length - 1) {
      await sleep(2500);
    }
  }

  return translatedChunks.join(" ");
}

/* =========================================================
   EXTRACT PDF TEXT
========================================================= */

async function extractPdfPages(file) {
  const arrayBuffer =
    await file.arrayBuffer();

  const pdf =
    await pdfjsLib
      .getDocument({
        data: new Uint8Array(
          arrayBuffer
        ),
      })
      .promise;

  const pages = [];

  for (
    let pageNumber = 1;
    pageNumber <= pdf.numPages;
    pageNumber++
  ) {
    const page =
      await pdf.getPage(
        pageNumber
      );

    const textContent =
      await page.getTextContent();

    const items =
      textContent.items || [];

    const text = items
      .map((item) => {
        if (
          typeof item.str ===
          "string"
        ) {
          return item.str;
        }

        return "";
      })
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    pages.push({
      pageNumber,
      text,
    });
  }

  return pages;
}

/* =========================================================
   LOAD HINDI FONT
========================================================= */

async function loadHindiFont(pdf) {
  const fontUrl =
    "/fonts/NotoSansDevanagari-Regular.ttf";

  const response =
    await fetch(fontUrl);

  if (!response.ok) {
    throw new Error(
      "Hindi font could not be loaded. Make sure this file exists: client/public/fonts/NotoSansDevanagari-Regular.ttf"
    );
  }

  const arrayBuffer =
    await response.arrayBuffer();

  const bytes =
    new Uint8Array(arrayBuffer);

  let binary = "";

  const chunkSize = 0x8000;

  for (
    let i = 0;
    i < bytes.length;
    i += chunkSize
  ) {
    const chunk =
      bytes.subarray(
        i,
        Math.min(
          i + chunkSize,
          bytes.length
        )
      );

    binary += String.fromCharCode(
      ...chunk
    );
  }

  const base64 =
    btoa(binary);

  pdf.addFileToVFS(
    "NotoSansDevanagari-Regular.ttf",
    base64
  );

  pdf.addFont(
    "NotoSansDevanagari-Regular.ttf",
    "NotoDevanagari",
    "normal"
  );
}

/* =========================================================
   WRAPPED PDF TEXT
========================================================= */

function addWrappedText(
  pdf,
  text,
  x,
  y,
  maxWidth,
  lineHeight,
  fontName
) {
  const lines =
    pdf.splitTextToSize(
      text || "",
      maxWidth
    );

  let currentY = y;

  for (const line of lines) {
    if (currentY > 275) {
      pdf.addPage();

      if (fontName) {
        pdf.setFont(
          fontName,
          "normal"
        );
      }

      pdf.setFontSize(11);

      currentY = 20;
    }

    pdf.text(
      line,
      x,
      currentY
    );

    currentY += lineHeight;
  }

  return currentY;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function TranslatePdf() {
  const [file, setFile] =
    useState(null);

  const [
    sourceLanguage,
    setSourceLanguage,
  ] = useState("auto");

  const [
    targetLanguage,
    setTargetLanguage,
  ] = useState("hi");

  const [pages, setPages] =
    useState([]);

  const [
    translatedPages,
    setTranslatedPages,
  ] = useState([]);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [
    isExtracting,
    setIsExtracting,
  ] = useState(false);

  const [
    isTranslating,
    setIsTranslating,
  ] = useState(false);

  const [progress, setProgress] =
    useState(0);

  const [
    translatedPdfBlob,
    setTranslatedPdfBlob,
  ] = useState(null);

  const [
    translatedPdfName,
    setTranslatedPdfName,
  ] = useState("");

  /* =======================================================
     FILE CHANGE
  ======================================================= */

  const handleFileChange = (eventOrFile) => {
    const selectedFile = eventOrFile instanceof File
      ? eventOrFile
      : eventOrFile.target.files?.[0];

    setError("");
    setMessage("");
    setPages([]);
    setTranslatedPages([]);
    setProgress(0);
    setTranslatedPdfBlob(null);
    setTranslatedPdfName("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const isPdf =
      selectedFile.type ===
        "application/pdf" ||
      selectedFile.name
        .toLowerCase()
        .endsWith(".pdf");

    if (!isPdf) {
      setError(
        "Please select a PDF file."
      );

      setFile(null);
      return;
    }

    setFile(selectedFile);

    setMessage(
      "Selected: " +
        selectedFile.name
    );
  };

  /* =======================================================
     READ PDF
  ======================================================= */

  const extractText = async () => {
    if (!file) {
      setError(
        "Please select a PDF file first."
      );

      return;
    }

    setError("");
    setMessage(
      "Reading PDF..."
    );

    setIsExtracting(true);
    setProgress(0);

    try {
      const extractedPages =
        await extractPdfPages(
          file
        );

      setPages(
        extractedPages
      );

      const readablePages =
        extractedPages.filter(
          (page) =>
            page.text &&
            page.text.trim()
        );

      if (
        readablePages.length ===
        0
      ) {
        throw new Error(
          "No readable text was found on this PDF. This tool currently supports text-based PDFs, not scanned/image-only PDFs."
        );
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
          "Could not read this PDF."
      );

      setMessage("");
    } finally {
      setIsExtracting(false);
    }
  };

  /* =======================================================
     TRANSLATE PDF
  ======================================================= */

  const translatePdf = async () => {
    if (!file) {
      setError(
        "Please select a PDF file first."
      );

      return;
    }

    if (sourceLanguage === targetLanguage) {
      setError(
        "Source and target languages cannot be the same."
      );

      return;
    }

    setError("");
    setMessage("");
    setTranslatedPages([]);
    setTranslatedPdfBlob(null);
    setTranslatedPdfName("");
    setProgress(0);
    setIsTranslating(true);

    try {
      let workingPages =
        pages;

      /*
        Read PDF automatically if
        Read PDF was not clicked.
      */
      if (
        workingPages.length ===
        0
      ) {
        setMessage(
          "Reading PDF..."
        );

        workingPages =
          await extractPdfPages(
            file
          );

        setPages(
          workingPages
        );
      }

      const readablePages =
        workingPages.filter(
          (page) =>
            page.text &&
            page.text.trim()
        );

      if (
        readablePages.length ===
        0
      ) {
        throw new Error(
          "No readable text was found on this PDF. Scanned PDFs are not supported yet."
        );
      }

      const results = [];

      /*
        Translate page by page.
      */
      for (
        let i = 0;
        i < workingPages.length;
        i++
      ) {
        const page =
          workingPages[i];

        setMessage(
          "Translating page " +
            (i + 1) +
            " of " +
            workingPages.length +
            "..."
        );

        if (
          !page.text ||
          !page.text.trim()
        ) {
          results.push("");

          setProgress(
            Math.round(
              ((i + 1) /
                workingPages.length) *
                100
            )
          );

          continue;
        }

        const translated =
          await translateText(
            page.text,
            sourceLanguage,
            targetLanguage,
            (chunkNumber, totalChunks) => {
              /*
                Page-level progress.
              */
              const pageStart =
                (i /
                  workingPages.length) *
                100;

              const pageSize =
                100 /
                workingPages.length;

              const chunkProgress =
                chunkNumber /
                totalChunks;

              const totalProgress =
                pageStart +
                pageSize *
                  chunkProgress;

              setProgress(
                Math.min(
                  99,
                  Math.round(
                    totalProgress
                  )
                )
              );
            }
          );

        results.push(
          translated
        );

        setProgress(
          Math.round(
            ((i + 1) /
              workingPages.length) *
              100
          )
        );
      }

      setTranslatedPages(
        results
      );

      setMessage(
        "Translation completed. Creating your PDF..."
      );

      /* ===================================================
         CREATE PDF
      =================================================== */

      const pdf =
        new jsPDF({
          orientation: "p",
          unit: "mm",
          format: "a4",
        });

      /*
        Hindi needs Unicode font.

        For other languages, jsPDF's normal font
        is used. Hindi specifically uses Noto Devanagari.
      */
      let pdfFont =
        "helvetica";

      if (
        targetLanguage === "hi"
      ) {
        await loadHindiFont(
          pdf
        );

        pdfFont =
          "NotoDevanagari";
      }

      pdf.setFont(
        pdfFont,
        "normal"
      );

      pdf.setTextColor(0, 0, 0);

      for (
        let i = 0;
        i < results.length;
        i++
      ) {
        if (i > 0) {
          pdf.addPage();

          pdf.setFont(
            pdfFont,
            "normal"
          );
        }

        pdf.setFontSize(10);

        pdf.text(
          "Translated Page " +
            (i + 1),
          15,
          15
        );

        pdf.setFontSize(11);

        const translatedText =
          results[i];

        if (
          !translatedText
        ) {
          pdf.setTextColor(
            100,
            100,
            100
          );

          pdf.text(
            "No readable text found on this page.",
            15,
            30
          );

          pdf.setTextColor(
            0,
            0,
            0
          );

          continue;
        }

        addWrappedText(
          pdf,
          translatedText,
          15,
          28,
          180,
          6,
          pdfFont
        );
      }

      /* ===================================================
         FILE NAME
      =================================================== */

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

      /* ===================================================
         SAVE BLOB
      =================================================== */

      const pdfBlob =
        pdf.output("blob");

      setTranslatedPdfBlob(
        pdfBlob
      );

      setTranslatedPdfName(
        outputName
      );

      /*
        Automatically download once.
      */
      pdf.save(
        outputName
      );

      setProgress(100);

      setMessage(
        "Translation completed successfully. Your translated PDF has been downloaded."
      );
    } catch (err) {
      console.error(
        "Translate PDF error:",
        err
      );

      setError(
        err?.message ||
          "Translation failed. Please try again later."
      );

      setMessage("");
    } finally {
      setIsTranslating(
        false
      );
    }
  };

  /* =======================================================
     DOWNLOAD AGAIN
  ======================================================= */

  const downloadTranslatedPdf =
    () => {
      if (
        !translatedPdfBlob
      ) {
        return;
      }

      const url =
        URL.createObjectURL(
          translatedPdfBlob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        translatedPdfName ||
        "Translated-PDF.pdf";

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      setTimeout(() => {
        URL.revokeObjectURL(
          url
        );
      }, 1000);
    };

  /* =======================================================
     RESET
  ======================================================= */

  const resetTool = () => {
    setFile(null);
    setPages([]);
    setTranslatedPages([]);
    setMessage("");
    setError("");
    setProgress(0);
    setTranslatedPdfBlob(null);
    setTranslatedPdfName("");
    setSourceLanguage("auto");
    setTargetLanguage("hi");
  };

  /* =======================================================
     INFORMATION
  ======================================================= */

  const readablePageCount =
    pages.filter(
      (page) =>
        page.text &&
        page.text.trim()
    ).length;

  const selectedTargetLanguage =
    LANGUAGES.find(
      (language) =>
        language.code ===
        targetLanguage
    )?.name ||
    targetLanguage;

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="tool-page"
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding:
          "30px 20px 60px",
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
        {/* HEADER */}

        <div className="upload-box"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            handleFileChange(event.dataTransfer.files?.[0]);
          }}
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
              margin:
                "0 0 8px",
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
            documents into another
            language.
          </p>
        </div>

        {/* PDF SELECTOR */}

        <div
          style={{
            border:
              "2px dashed #cbd5e1",
            borderRadius: "16px",
            padding: "30px",
            textAlign: "center",
            background:
              "#f8fafc",
            marginBottom:
              "22px",
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
              margin:
                "0 0 8px",
              color: "#1f2937",
            }}
          >
            Select your PDF
          </h3>

          <p
            style={{
              color: "#6b7280",
              margin:
                "0 0 18px",
              fontSize: "14px",
            }}
          >
            Text-based PDFs are
            supported. Scanned PDFs
            are not supported yet.
          </p>

          <label
            style={{
              display:
                "inline-block",
              background:
                "#2563eb",
              color: "#fff",
              padding:
                "12px 22px",
              borderRadius:
                "10px",
              cursor:
                "pointer",
              fontWeight:
                "700",
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
            <div className="selected-file"
              style={{
                marginTop:
                  "18px",
                fontWeight:
                  "600",
                color:
                  "#374151",
                wordBreak:
                  "break-word",
              }}
            >
              📎{" "}
              {file.name}
            </div>
          )}
        </div>

        {/* LANGUAGE SELECTORS */}

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginBottom:
              "22px",
          }}
        >
          {/* SOURCE */}

          <div>
            <label
              style={{
                display:
                  "block",
                fontWeight:
                  "700",
                color:
                  "#374151",
                marginBottom:
                  "8px",
              }}
            >
              Source Language
            </label>

            <select
              value={
                sourceLanguage
              }
              onChange={(e) =>
                setSourceLanguage(
                  e.target.value
                )
              }
              disabled={
                isTranslating
              }
              style={{
                width:
                  "100%",
                padding:
                  "12px",
                borderRadius:
                  "10px",
                border:
                  "1px solid #d1d5db",
                background:
                  "#fff",
                fontSize:
                  "15px",
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
                    {
                      language.name
                    }
                  </option>
                )
              )}
            </select>
          </div>

          {/* TARGET */}

          <div>
            <label
              style={{
                display:
                  "block",
                fontWeight:
                  "700",
                color:
                  "#374151",
                marginBottom:
                  "8px",
              }}
            >
              Translate To
            </label>

            <select
              value={
                targetLanguage
              }
              onChange={(e) =>
                setTargetLanguage(
                  e.target.value
                )
              }
              disabled={
                isTranslating
              }
              style={{
                width:
                  "100%",
                padding:
                  "12px",
                borderRadius:
                  "10px",
                border:
                  "1px solid #d1d5db",
                background:
                  "#fff",
                fontSize:
                  "15px",
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
                    {
                      language.name
                    }
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* BUTTONS */}

        <div
          style={{
            display:
              "flex",
            flexWrap:
              "wrap",
            gap: "12px",
            justifyContent:
              "center",
            marginBottom:
              "20px",
          }}
        >
          <button
            onClick={
              extractText
            }
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
              borderRadius:
                "10px",
              fontWeight:
                "700",
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
            onClick={
              translatePdf
            }
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
              borderRadius:
                "10px",
              fontWeight:
                "800",
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
            onClick={
              resetTool
            }
            disabled={
              isTranslating
            }
            style={{
              border:
                "1px solid #d1d5db",
              background:
                "#fff",
              color:
                "#374151",
              padding:
                "12px 22px",
              borderRadius:
                "10px",
              fontWeight:
                "700",
              cursor:
                isTranslating
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Clear
          </button>
        </div>

        {/* PROGRESS */}

        {isTranslating && (
          <div
            style={{
              marginBottom:
                "20px",
            }}
          >
            <div
              style={{
                height:
                  "10px",
                width:
                  "100%",
                background:
                  "#e5e7eb",
                borderRadius:
                  "999px",
                overflow:
                  "hidden",
              }}
            >
              <div
                style={{
                  height:
                    "100%",
                  width:
                    progress +
                    "%",
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
                marginTop:
                  "8px",
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

        {/* MESSAGE */}

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

        {/* ERROR */}

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

        {/* DOWNLOAD */}

        {translatedPdfBlob &&
          !isTranslating && (
            <div
              style={{
                marginTop:
                  "20px",
                padding:
                  "22px",
                borderRadius:
                  "14px",
                background:
                  "#ecfdf5",
                border:
                  "1px solid #a7f3d0",
                textAlign:
                  "center",
              }}
            >
              <div
                style={{
                  fontSize:
                    "32px",
                  marginBottom:
                    "8px",
                }}
              >
                ✅
              </div>

              <div
                style={{
                  color:
                    "#166534",
                  fontSize:
                    "18px",
                  fontWeight:
                    "800",
                  marginBottom:
                    "8px",
                }}
              >
                Translation completed
              </div>

              <div
                style={{
                  color:
                    "#166534",
                  fontSize:
                    "14px",
                  marginBottom:
                    "15px",
                  wordBreak:
                    "break-word",
                }}
              >
                {
                  translatedPdfName
                }
              </div>

              <button
                onClick={
                  downloadTranslatedPdf
                }
                style={{
                  border:
                    "none",
                  background:
                    "#16a34a",
                  color:
                    "#fff",
                  padding:
                    "13px 26px",
                  borderRadius:
                    "10px",
                  fontWeight:
                    "800",
                  fontSize:
                    "15px",
                  cursor:
                    "pointer",
                  boxShadow:
                    "0 5px 15px rgba(22,163,74,0.25)",
                }}
              >
                ⬇️ Download Translated PDF
              </button>
            </div>
          )}

        {/* PDF INFORMATION */}

        {pages.length > 0 && (
          <div
            style={{
              marginTop:
                "22px",
              padding:
                "18px",
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
                  {
                    pages.length
                  }
                </strong>
              </div>

              <div>
                Readable pages:{" "}
                <strong>
                  {
                    readablePageCount
                  }
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
      </div>
    </div>
  );
}
