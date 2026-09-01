import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import JpgToPdf from "./tools/JpgToPdf.jsx";
import ExcelToPdf from "./tools/ExcelToPdf.jsx";
import WordToPdf from "./tools/WordToPdf.jsx";
import PDFToJpg from "./tools/PDFToJpg.jsx";
import PdfToExcel from "./tools/PdfToExcel.jsx";
import MergePdf from "./tools/MergePdf.jsx";
import ExtractPdf from "./tools/ExtractPdf.jsx";
import CompressPdf from "./tools/CompressPdf.jsx";
import PdfToWord from "./tools/PdfToWord.jsx";
import PDFToPowerPoint from "./tools/PDFToPowerPoint.jsx";
import RotatePdf from "./tools/RotatePdf.jsx";
import WatermarkPdf from "./tools/WatermarkPdf.jsx";
import ProtectPdf from "./tools/ProtectPdf.jsx";
import UnlockPdf from "./tools/UnlockPdf.jsx";
import SignPdf from "./tools/SignPdf.jsx";
import DeletePdfPages from "./tools/DeletePdfPages.jsx";
import EditPdf from "./tools/EditPdf.jsx";
import TranslatePdf from "./tools/TranslatePdf.jsx";
import ImageCompressor from "./tools/ImageCompressor.jsx";
import ImageBackground from "./tools/ImageBackground.jsx";

const tools = [
  ["jpg-to-pdf", "JPG to PDF", "🖼️", "Convert images into one PDF", "pdf", JpgToPdf],
  ["pdf-to-excel", "PDF to Excel", "📊", "Convert PDF tables to an Excel file", "pdf", PdfToExcel],
  ["scan-pdf-to-excel", "Scan PDF to Excel", "🔎", "Extract scanned tables to Excel", "pdf", PdfToExcel],
  ["excel-to-pdf", "Excel to PDF", "📊", "Convert spreadsheets to PDF", "pdf", ExcelToPdf],
  ["word-to-pdf", "Word to PDF", "📝", "Convert documents to PDF", "pdf", WordToPdf],
  ["pdf-to-jpg", "PDF to JPG", "📄", "Export PDF pages as images", "pdf", PDFToJpg],
  ["merge-pdf", "Merge PDF", "📑", "Combine several PDF files", "pdf", MergePdf],
  ["extract-pdf", "Extract PDF", "✂️", "Save selected PDF pages", "pdf", ExtractPdf],
  ["compress-pdf", "Compress PDF", "🗜️", "Reduce PDF file size", "pdf", CompressPdf],
  ["pdf-to-word", "PDF to Word", "📄", "Convert PDFs to Word", "pdf", PdfToWord],
  ["pdf-to-powerpoint", "PDF to PowerPoint", "📊", "Convert PDF slides", "pdf", PDFToPowerPoint],
  ["rotate-pdf", "Rotate PDF", "🔄", "Rotate PDF pages", "pdf", RotatePdf],
  ["watermark-pdf", "Watermark PDF", "💧", "Add a watermark", "pdf", WatermarkPdf],
  ["protect-pdf", "Protect PDF", "🔐", "Add a password", "pdf", ProtectPdf],
  ["unlock-pdf", "Unlock PDF", "🔓", "Remove PDF protection", "pdf", UnlockPdf],
  ["sign-pdf", "Sign PDF", "✍️", "Add your signature", "pdf", SignPdf],
  ["delete-pdf-pages", "Delete PDF Pages", "🗑️", "Remove unwanted pages", "pdf", DeletePdfPages],
  ["edit-pdf", "Edit PDF", "✏️", "Edit text, pages, and annotations", "pdf", EditPdf],
  ["translate-pdf", "Translate PDF", "🌐", "Translate PDF content", "pdf", TranslatePdf],
  ["image-compressor", "Image Compressor", "🖼️", "Make images smaller", "image", ImageCompressor],
  ["image-background", "Image Background", "🪄", "Remove or replace image backgrounds", "image", ImageBackground],
].map(([id, title, icon, description, category, Component]) => ({ id, title, icon, description, category, Component }));

const themes = ["neon", "ocean", "sunset", "sunshine", "light"];

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("hc_theme") || "sunshine");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [activeTool, setActiveTool] = useState(null);

  useEffect(() => {
    document.body.className = `theme-${theme}`;
    document.body.dataset.theme = theme;
    localStorage.setItem("hc_theme", theme);
  }, [theme]);

  const visibleTools = useMemo(() => tools.filter((tool) => {
    const matchesCategory = category === "all" || tool.category === category;
    const value = `${tool.title} ${tool.description}`.toLowerCase();
    return matchesCategory && value.includes(query.toLowerCase().trim());
  }), [category, query]);

  if (activeTool) {
    const Component = activeTool.Component;
    return <div className="converter-app">
      <header className="converter-header"><button className="back-button" onClick={() => setActiveTool(null)}>← All tools</button><strong>Hub Converter</strong></header>
      <main className="tool-workspace"><Component /></main>
    </div>;
  }

  return <div className="converter-app">
    <header className="converter-header">
      <button className="brand-button" onClick={() => { setCategory("all"); setQuery(""); }}>Hub Converter</button>
      <nav aria-label="Tool categories">
        <button className={category === "all" ? "active" : ""} onClick={() => setCategory("all")}>All tools</button>
        <button className={category === "pdf" ? "active" : ""} onClick={() => setCategory("pdf")}>PDF tools</button>
        <button className={category === "image" ? "active" : ""} onClick={() => setCategory("image")}>Image tools</button>
      </nav>
      <label className="theme-select">Theme <select value={theme} onChange={(e) => setTheme(e.target.value)}>{themes.map((value) => <option key={value}>{value}</option>)}</select></label>
    </header>
    <main className="converter-home">
      <section className="converter-intro"><p>FILE CONVERTER</p><h1>Convert files simply</h1><span>Choose a tool, upload your file, then download the result.</span></section>
      <input className="tool-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search converter tools…" aria-label="Search converter tools" />
      <section className="converter-grid" aria-label="Converter tools">
        {visibleTools.map((tool) => <button className="converter-card" key={tool.id} onClick={() => setActiveTool(tool)}>
          <span className="converter-icon">{tool.icon}</span><strong>{tool.title}</strong><small>{tool.description}</small><em>Open tool →</em>
        </button>)}
      </section>
    </main>
  </div>;
}

createRoot(document.getElementById("root")).render(<App />);
