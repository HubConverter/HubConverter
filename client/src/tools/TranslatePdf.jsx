import React, { useState } from "react";
import { jsPDF } from "jspdf";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

const LANGUAGES = [
  { code: "auto", name: "Auto Detect" }, { code: "en", name: "English" },
  { code: "hi", name: "Hindi" }, { code: "bn", name: "Bengali" },
  { code: "gu", name: "Gujarati" }, { code: "mr", name: "Marathi" },
  { code: "ta", name: "Tamil" }, { code: "te", name: "Telugu" },
  { code: "kn", name: "Kannada" }, { code: "ml", name: "Malayalam" },
  { code: "pa", name: "Punjabi" }, { code: "ur", name: "Urdu" },
  { code: "fr", name: "French" }, { code: "de", name: "German" },
  { code: "es", name: "Spanish" }, { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" }, { code: "ru", name: "Russian" },
  { code: "ar", name: "Arabic" }, { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" }, { code: "zh-CN", name: "Chinese" },
];

function splitText(text, maxLength = 450) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const words = clean.split(" ");
  const chunks = [];
  let current = "";
  for (const word of words) {
    const test = (current + " " + word).trim();
    if (test.length <= maxLength) { current = test; } 
    else {
      if (current) chunks.push(current);
      if (word.length > maxLength) {
        for (let i = 0; i < word.length; i += maxLength) { chunks.push(word.slice(i, i + maxLength)); }
        current = "";
      } else { current = word; }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function translateText(text, sourceLanguage, targetLanguage) {
  if (!text || !text.trim()) return "";
  if (sourceLanguage === targetLanguage && sourceLanguage !== "auto") return text;
  const chunks = splitText(text, 450);
  const translatedChunks = [];
  for (const chunk of chunks) {
    const source = sourceLanguage === "auto" ? "autodetect" : sourceLanguage;
    const url = "https://translated.net" + encodeURIComponent(chunk) + "&langpair=" + encodeURIComponent(source + "|" + targetLanguage);
    const response = await fetch(url);
    if (!response.ok) throw new Error("Translation service returned " + response.status);
    const data = await response.json();
    if (!data || !data.responseData || typeof data.responseData.translatedText !== "string") {
      throw new Error("Translation service returned an invalid response.");
    }
    translatedChunks.push(data.responseData.translatedText);
    await new Promise((r) => setTimeout(r, 150));
  }
  return translatedChunks.join(" ");
}

async function extractPdfPages(file) {
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = (textContent.items || []).map((item) => typeof item.str === "string" ? item.str : "").join(" ").replace(/\s+/g, " ").trim();
    pages.push({ pageNumber: i, text });
  }
  return pages;
}

function addWrappedText(pdf, text, x, y, maxWidth, lineHeight) {
  const lines = pdf.splitTextToSize(text || "", maxWidth);
  let currentY = y;
  for (const line of lines) {
    if (currentY > 275) { pdf.addPage(); currentY = 20; }
    pdf.text(line, x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

export default function TranslatePdf() {
  const [file, setFile] = useState(null);
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState("hi");
  const [pages, setPages] = useState([]);
  const [translatedPages, setTranslatedPages] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    setError(""); setMessage(""); setPages([]); setTranslatedPages([]); setProgress(0);
    if (!selected) { setFile(null); return; }
    if (selected.type !== "application/pdf" && !selected.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file."); setFile(null); return;
    }
    setFile(selected); setMessage("Selected: " + selected.name);
  };

  const extractText = async () => {
    if (!file) { setError("Please select a PDF file first."); return; }
    setError(""); setMessage("Reading PDF..."); setIsExtracting(true); setProgress(0);
    try {
      const extractedPages = await extractPdfPages(file);
      setPages(extractedPages);
      const readablePages = extractedPages.filter((p) => p.text && p.text.trim());
      if (readablePages.length === 0) {
        setError("No readable text found on this PDF."); setMessage(""); return;
      }
      setMessage("PDF ready. Found readable text on " + readablePages.length + " of " + extractedPages.length + " page(s).");
    } catch (err) {
      setError(err?.message || "Could not read this PDF."); setMessage("");
    } finally { setIsExtracting(false); }
  };

  const translatePdf = async () => {
    if (!file) { setError("Please select a PDF file first."); return; }
    setError(""); setMessage(""); setTranslatedPages([]); setProgress(0); setIsTranslating(true);
    try {
      let workingPages = pages;
      if (workingPages.length === 0) {
        setMessage("Reading PDF...");
        workingPages = await extractPdfPages(file);
        setPages(workingPages);
      }
      const readablePages = workingPages.filter((p) => p.text && p.text.trim());
      if (readablePages.length === 0) throw new Error("No readable text found.");
      const results = [];
      for (let i = 0; i < workingPages.length; i++) {
        const page = workingPages[i];
        setMessage("Translating page " + (i + 1) + " of " + workingPages.length + "...");
        setProgress(Math.round(((i + 1) / workingPages.length) * 100));
        if (!page.text || !page.text.trim()) { results.push(""); continue; }
        results.push(await translateText(page.text, sourceLanguage, targetLanguage));
      }
      setTranslatedPages(results);
      setMessage("Translation completed. Creating your PDF...");
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      pdf.setFont("helvetica", "normal");
      for (let i = 0; i < results.length; i++) {
        if (i > 0) pdf.addPage();
        pdf.setFontSize(10); pdf.text("Translated Page " + (i + 1), 15, 15); pdf.setFontSize(11);
        if (!results[i]) {
          pdf.setTextColor(100); pdf.text("No readable text found on this page.", 15, 30); pdf.setTextColor(0); continue;
        }
        addWrappedText(pdf, results[i], 15, 28, 180, 6);
      }
      const targetName = LANGUAGES.find((l) => l.code === targetLanguage)?.name || targetLanguage;
      const safeTarget = targetName.replace(/[^a-zA-Z0-9-_ ]/g, "").replace(/\s+/g, "-");
      pdf.save(`${file.name.replace(/\.pdf$/i, "")}-Translated-${safeTarget}.pdf`);
      setMessage("Translation completed successfully."); setProgress(100);
    } catch (err) {
      setError(err?.message || "Translation failed."); setMessage("");
    } finally { setIsTranslating(false); }
  };

  const resetTool = () => {
    setFile(null); setPages([]); setTranslatedPages([]); setMessage(""); setError(""); setProgress(0);
  };

  const selectStyle = { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #d1d5db", background: "#fff", fontSize: "15px" };
  const labelStyle = { display: "block", fontWeight: "700", color: "#374151", marginBottom: "8px" };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "30px 20px 60px" }}>
      <div style={{ background: "rgba(255,255,255,0.96)", borderRadius: "20px", padding: "30px", boxShadow: "0 12px 35px rgba(0,0,0,0.10)" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>🌐</div>
          <h1 style={{ margin: "0 0 8px", fontSize: "30px", fontWeight: "800" }}>Translate PDF</h1>
          <p style={{ margin: 0, color: "#6b7280" }}>Translate text-based PDF documents into another language.</p>
        </div>

        <div style={{ border: "2px dashed #cbd5e1", borderRadius: "16px", padding: "30px", textAlign: "center", background: "#f8fafc", marginBottom: "22px" }}>
          <div style={{ fontSize: "40px", marginBottom: "10px" }}>📄</div>
          <h3 style={{ margin: "0 0 8px" }}>Select your PDF</h3>
          <p style={{ color: "#6b7280", margin: "0 0 18px" }}>Text-based PDFs are supported.</p>
          <label style={{ display: "inline-block", background: "#2563eb", color: "#fff", padding: "12px 22px", borderRadius: "10px", cursor: "pointer", fontWeight: "700" }}>
            Choose PDF
            <input type="file" accept="application/pdf,.pdf" onChange={handleFileChange} style={{ display: "none" }} />
          </label>
          {file && <div style={{ marginTop: "18px", fontWeight: "600" }}>📎 {file.name}</div>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px", marginBottom: "22px" }}>
          <div>
            <label style={labelStyle}>Source Language</label>
            <select value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value)} disabled={isTranslating} style={selectStyle}>
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Translate To</label>
<select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)} disabled={isTranslating} style={selectStyle}>{LANGUAGES.filter((l) => l.code !== "auto").map((l) => {l.name})}<div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", marginBottom: "20px" }}><button onClick={extractText} disabled={!file || isExtracting || isTranslating} style={{ padding: "12px 22px", borderRadius: "10px", fontWeight: "700", background: (!file || isExtracting || isTranslating) ? "#cbd5e1" : "#475569", color: "#fff", border: "none" }}>{isExtracting ? "Reading..." : "Read PDF"}<button onClick={translatePdf} disabled={!file || isTranslating} style={{ padding: "12px 26px", borderRadius: "10px", fontWeight: "800", background: (!file || isTranslating) ? "#93c5fd" : "#2563eb", color: "#fff", border: "none" }}>{isTranslating ? "Translating " + progress + "%" : "Translate PDF"}<button onClick={resetTool} disabled={isTranslating} style={{ padding: "12px 22px", borderRadius: "10px", fontWeight: "700", background: "#fff", color: "#374151", border: "1px solid #d1d5db", cursor: isTranslating ? "not-allowed" : "pointer" }}>Clear{isTranslating && (<div style={{ marginBottom: "20px", textAlign: "center" }}><div style={{ height: "10px", width: "100%", background: "#e5e7eb", borderRadius: "999px", overflow: "hidden" }}><div style={{ height: "100%", width: progress + "%", background: "#2563eb" }} /><div style={{ marginTop: "8px", fontWeight: "600" }}>{progress}% completed)}{message && <div style={{ background: "#eff6ff", color: "#1d4ed8", padding: "13px 15px", borderRadius: "10px", marginBottom: "15px" }}>{message}}{error && <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "13px 15px", borderRadius: "10px", marginBottom: "15px" }}>{error}});}
