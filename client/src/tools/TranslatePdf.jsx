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

  const translateText = async (
    text,
    fromLanguage,
    toLanguage
  ) => {
    if (!text || !text.trim()) {
      return "";
    }

    const cleanText = text.trim();

    const actualSourceLanguage =
      fromLanguage === "auto"
        ? "en"
        : fromLanguage;

    const url =
      "https://api.mymemory.translated.net/get?q=" +
      encodeURIComponent(cleanText) +
      "&langpair=" +
      encodeURIComponent(actualSourceLanguage) +
      "%7C" +
      encodeURIComponent(toLanguage);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        "Translation service unavailable."
      );
    }

    const data = await response.json();

    if (
      !data ||
      !data.responseData ||
      typeof data.responseData.translatedText !==
        "string"
    ) {
      throw new Error("Translation failed.");
    }

    const translatedText =
      data.responseData.translatedText.trim();

    if (!translatedText) {
      throw new Error("Translation returned empty text.");
    }

    return translatedText;
  };

  const splitIntoChunks = (
    text,
    maxLength = 450
  ) => {
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
    const arrayBuffer =
      await selectedFile.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
    }).promise;

    const pages = [];

    for (
      let pageNumber = 1;
      pageNumber <= pdf.numPages;
      pageNumber++
    ) {
      const page = await pdf.getPage(
        pageNumber
      );

      const textContent =
        await page.getTextContent();

      const pageText = textContent.items
        .map((item) => item.str || "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      pages.push(pageText);
    }

    return pages;
  };

  const drawWrappedText = (
    page,
    text,
    font,
    fontSize,
    margin,
    maxWidth,
    startY
  ) => {
    const lineHeight = fontSize + 6;

    let y = startY;

    const words = text.split(/\s+/);

    let line = "";

    for (const word of words) {
      const testLine =
        line.length === 0
          ? word
          : line + " " + word;

      const testWidth =
        font.widthOfTextAtSize(
          testLine,
          fontSize
        );

      if (testWidth > maxWidth) {
        if (line) {
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

          y -= lineHeight;
        }

        line = word;
      } else {
        line = testLine;
      }
    }

    if (line) {
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

      y -= lineHeight;
    }

    return y;
  };

  const createTranslatedPdf = async (
    translatedPages
  ) => {
    const translatedPdf =
      await PDFDocument.create();

    const font =
      await translatedPdf.embedFont(
        StandardFonts.Helvetica
      );

    const pageWidth = 595.28;
    const pageHeight = 841.89;

    const margin = 45;

    const fontSize = 12;

    const lineHeight = 18;

    const maxWidth =
      pageWidth - margin * 2;

    for (
      let pageIndex = 0;
      pageIndex < translatedPages.length;
      pageIndex++
    ) {
      const pageText =
        translatedPages[pageIndex];

      let page =
        translatedPdf.addPage([
          pageWidth,
          pageHeight,
        ]);

      let y =
        pageHeight - margin;

      if (
        !pageText ||
        !pageText.trim()
      ) {
        page.drawText(
          "No readable text was found on this page.",
          {
            x: margin,
            y,
            size: fontSize,
            font,
            color: rgb(
              0.35,
              0.35,
              0.35
            ),
          }
        );

        continue;
      }

      const paragraphs = pageText
        .split(/\n+/)
        .map((paragraph) =>
          paragraph.trim()
        )
        .filter(Boolean);

      for (const paragraph of paragraphs) {
        const words =
          paragraph.split(/\s+/);

        let line = "";

        for (const word of words) {
          const testLine =
            line.length === 0
              ? word
              : line + " " + word;

          const testWidth =
            font.widthOfTextAtSize(
              testLine,
              fontSize
            );

          if (
            testWidth > maxWidth
          ) {
            if (line) {
              if (
                y <
                margin + lineHeight
              ) {
                page =
                  translatedPdf.addPage(
                    [
                      pageWidth,
                      pageHeight,
                    ]
                  );

                y =
                  pageHeight -
                  margin;
              }

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

              y -= lineHeight;
            }

            line = word;
          } else {
            line = testLine;
          }
        }

        if (line) {
          if (
            y <
            margin + lineHeight
          ) {
            page =
              translatedPdf.addPage([
                pageWidth,
                pageHeight,
              ]);

            y =
              pageHeight -
              margin;
          }

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

          y -= lineHeight;
        }

        y -= 8;

        if (y < margin) {
          page =
            translatedPdf.addPage([
              pageWidth,
              pageHeight,
            ]);

          y =
            pageHeight - margin;
        }
      }
    }

    return translatedPdf.save();
  };

  const translatePdf = async () => {
    if (!file) {
      setMessage(
        "Please select a PDF first."
      );
      return;
    }

    if (targetLanguage === "auto") {
      setMessage(
        "Please select a target language."
      );
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      if (downloadUrl) {
        URL.revokeObjectURL(
          downloadUrl
        );

        setDownloadUrl("");
      }

      setMessage(
        "Reading PDF text..."
      );

      const pages =
        await extractPdfText(file);

      const hasText = pages.some(
        (pageText) =>
          pageText &&
          pageText.trim()
      );

      if (!hasText) {
        setMessage(
          "No selectable text was found in this PDF. Scanned PDFs require OCR and are not supported yet."
        );

        return;
      }

      const translatedPages = [];

      for (
        let i = 0;
        i < pages.length;
        i++
      ) {
        const pageText = pages[i];

        if (
          !pageText ||
          !pageText.trim()
        ) {
          translatedPages.push("");

          continue;
        }

        setMessage(
          "Translating page " +
            (i + 1) +
            " of " +
            pages.length +
            "..."
        );

        const translated =
          await translateLongText(
            pageText,
            sourceLanguage,
            targetLanguage
          );

        translatedPages.push(
          translated
        );
      }

      setMessage(
        "Creating translated PDF..."
      );

      const pdfBytes =
        await createTranslatedPdf(
          translatedPages
        );

      const blob = new Blob(
        [pdfBytes],
        {
          type: "application/pdf",
        }
      );

      const url =
        URL.createObjectURL(blob);

      setDownloadUrl(url);

      setMessage(
        "PDF translated successfully. Your translated PDF is ready to download."
      );
    } catch (error) {
      console.error(
        "Translate PDF error:",
        error
      );

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

    const link =
      document.createElement("a");

    link.href = downloadUrl;

    link.download =
      "ShortcutHub-Translated-PDF.pdf";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  const resetTool = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(
        downloadUrl
      );
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
          border:
            "1px solid #e5e7eb",
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
