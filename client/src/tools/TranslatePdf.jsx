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
      "https://translated.net" +
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

export default function TranslatePdf() {
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
    const selectedFile = event.target.files?.[0];

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

      const originalName = file.name.replace(/\.pdf$/i, "");

      const matchedLang = LANGUAGES.find(
        (language) => language.code === targetLanguage
      );
      
      const targetName = matchedLang ? matchedLang.name : targetLanguage;

      const safeTargetName = targetName
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .replace(/\s+/g, "-");

      const outputName = `${originalName}-Translated-${safeTargetName}.pdf`;

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
