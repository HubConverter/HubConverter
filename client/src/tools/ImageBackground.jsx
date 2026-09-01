import React, { useEffect, useRef, useState } from "react";
import { removeBackground } from "@imgly/background-removal";

const photo = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=420&q=80`;
const backgrounds = [
  ["Nature", "1500530855697-b586d89ba3ee"], ["Ocean", "1507525428034-b723cf961d3e"], ["Sea", "1473116763249-2faaef81ccda"], ["Sky", "1499346030926-9a72daac6c63"], ["Hotel", "1566073771259-6a8506099945"], ["Sunshine", "1500534314209-a25ddb2bd429"], ["Sunset", "1500534314209-a25ddb2bd429"], ["Mountain", "1501785888041-af3ef285b470"], ["Forest", "1441974231531-c6227db76b6e"], ["Flower", "1497250681960-ef046c08a56e"],
  ["Trees", "1473448912268-2022ce9509d8"], ["Beach", "1507525428034-b723cf961d3e"], ["City", "1444723121867-7a241cacace9"], ["Desert", "1509316785289-025f5b846b35"], ["Waterfall", "1433086966358-54859d0ed716"], ["Garden", "1416879595882-3373a0480b5b"], ["Snow", "1517299321609-52687d1bc55a"], ["Lake", "1470770841072-f978cf4d019e"], ["Road", "1470770841072-f978cf4d019e"], ["Tropical", "1507525428034-b723cf961d3e"],
  ["Cafe", "1501339847302-ac426a4a7cbb"], ["Office", "1497366754035-f200968a6e72"], ["Library", "1507842217343-583bb7270b66"], ["Bedroom", "1616486338812-3dadae4b4ace"], ["Kitchen", "1556912167-f556f1f39fdf"], ["Studio", "1519608487953-e999c86e7455"], ["Abstract", "1557682250-33bd709cbe85"], ["Bokeh", "1519608487953-e999c86e7455"], ["Marble", "1528459105426-b9548367069b"], ["Paper", "1517841905240-472988babdf9"],
  ["Neon", "1519608487953-e999c86e7455"], ["Stars", "1462331940025-496dfbfc7564"], ["Clouds", "1499346030926-9a72daac6c63"], ["Rain", "1519692933481-e162a57d6721"], ["Autumn", "1500534623283-312aade485b7"], ["Spring", "1497250681960-ef046c08a56e"], ["Summer", "1507525428034-b723cf961d3e"], ["Winter", "1517299321609-52687d1bc55a"], ["Wood", "1505693416388-ac5ce068fe85"], ["Gradient", "1557682250-33bd709cbe85"],
];
const colors = [
  "#ffffff", // White
  "#000000", // Black
  "#f5f5f5", // Light Gray
  "#808080", // Gray
  "#d3d3d3", // Light Gray
  "#c0c0c0", // Silver
  "#800000", // Maroon
  "#ff0000", // Red
  "#800080", // Purple
  "#ff00ff", // Magenta
  "#008000", // Green
  "#00ff00", // Lime
  "#808000", // Olive
  "#ffff00", // Yellow
  "#000080", // Navy
  "#0000ff", // Blue
  "#008080", // Teal
  "#00ffff", // Cyan
  "#ffa500", // Orange
  "#ffc0cb", // Pink
  "#a52a2a", // Brown
  "#f5deb3", // Wheat
  "#f0e68c", // Khaki
  "#4b0082", // Indigo
  "#ee82ee", // Violet
  "#dc143c", // Crimson
  "#40e0d0", // Turquoise
  "#50c878", // Emerald
  "#98fb98", // Pale Green
  "#add8e6", // Light Blue
];

export default function ImageBackground() {
  const inputRef = useRef(null); const [file, setFile] = useState(null); const [sourceUrl, setSourceUrl] = useState(""); const [cutoutUrl, setCutoutUrl] = useState(""); const [selectedBackground, setSelectedBackground] = useState(""); const [selectedColor, setSelectedColor] = useState("#ffffff"); const [tab, setTab] = useState("background"); const [search, setSearch] = useState(""); const [processing, setProcessing] = useState(false); const [dragging, setDragging] = useState(false); const [message, setMessage] = useState("");
  useEffect(() => () => { if (sourceUrl) URL.revokeObjectURL(sourceUrl); if (cutoutUrl && cutoutUrl !== sourceUrl) URL.revokeObjectURL(cutoutUrl); }, [sourceUrl, cutoutUrl]);
  function cropTransparentCanvas(blob) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob); const image = new Image();
      image.onload = () => {
        try {
          const canvas = document.createElement("canvas"); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
          const context = canvas.getContext("2d", { willReadFrequently: true }); context.drawImage(image, 0, 0); const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
          let left = canvas.width, top = canvas.height, right = -1, bottom = -1;
          for (let y = 0; y < canvas.height; y += 1) for (let x = 0; x < canvas.width; x += 1) if (pixels[(y * canvas.width + x) * 4 + 3] > 12) { left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y); }
          if (right < 0) { URL.revokeObjectURL(url); resolve(blob); return; }
          const padding = Math.round(Math.max(right - left, bottom - top) * 0.06); left = Math.max(0, left - padding); top = Math.max(0, top - padding); right = Math.min(canvas.width - 1, right + padding); bottom = Math.min(canvas.height - 1, bottom + padding);
          const cropped = document.createElement("canvas"); cropped.width = right - left + 1; cropped.height = bottom - top + 1; cropped.getContext("2d").drawImage(canvas, left, top, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height);
          cropped.toBlob((result) => { URL.revokeObjectURL(url); resolve(result || blob); }, "image/png");
        } catch { URL.revokeObjectURL(url); resolve(blob); }
      };
      image.onerror = () => { URL.revokeObjectURL(url); resolve(blob); }; image.src = url;
    });
  }
  async function removeImageBackground(selectedFile) { setProcessing(true); setMessage("Removing background…"); try { const removedBlob = await removeBackground(selectedFile); const croppedBlob = await cropTransparentCanvas(removedBlob); setCutoutUrl(URL.createObjectURL(croppedBlob)); setMessage("Background removed. Choose a photo or colour."); } catch (error) { console.error(error); setCutoutUrl(URL.createObjectURL(selectedFile)); setMessage("Could not remove the background. Please try another image."); } finally { setProcessing(false); } }
  function chooseFile(nextFile) { if (!nextFile) return; if (!nextFile.type.startsWith("image/")) { setMessage("Please choose an image file."); return; } if (nextFile.size > 10 * 1024 * 1024) { setMessage("Please choose an image below 10 MB."); return; } if (sourceUrl) URL.revokeObjectURL(sourceUrl); if (cutoutUrl && cutoutUrl !== sourceUrl) URL.revokeObjectURL(cutoutUrl); const url = URL.createObjectURL(nextFile); setFile(nextFile); setSourceUrl(url); setCutoutUrl(""); setSelectedBackground(""); setSelectedColor("#ffffff"); removeImageBackground(nextFile); }
  function download() { if (!cutoutUrl) return; const link = document.createElement("a"); link.href = cutoutUrl; link.download = `${file?.name?.replace(/\.[^.]+$/, "") || "image"}-background.png`; link.click(); }
  const shown = backgrounds.filter(([name]) => name.toLowerCase().includes(search.toLowerCase()));
  if (!file) return <section className="background-upload-page"><div className={`background-upload-card ${dragging ? "background-upload-dragging" : ""}`} onClick={() => inputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); chooseFile(e.dataTransfer.files?.[0]); }}><input ref={inputRef} className="background-file-input" type="file" accept="image/*" onChange={(e) => { chooseFile(e.target.files?.[0]); e.target.value = ""; }} /><div className="upload-cloud-icon">☁︎</div><strong>{dragging ? "Drop your image here" : "Select Image"}</strong><span>or drag and drop a file</span><small>JPG, PNG, WEBP · Max 10 MB</small></div></section>;
  return <section className="background-editor-page"><aside className="photo-sidebar"><div className="photo-tabs"><button className={tab === "photo" ? "active" : ""} onClick={() => setTab("photo")}>photo</button><button className={tab === "color" ? "active" : ""} onClick={() => setTab("color")}>Colour</button></div>{tab === "photo" ? <><input className="photo-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search photo" /><div className="background-grid">{shown.map(([name, id], index) => <button key={`${name}-${index}`} title={name} className={selectedBackground === background(id) ? "selected" : ""} onClick={() => setSelectedBackground(background(id))}><img src={background(id)} alt={name} /></button>)}</div></> : <div className="colour-grid">{colors.map((color) => <button key={color} aria-label={color} className={selectedColor === color ? "selected" : ""} onClick={() => { setSelectedColor(color); setSelectedBackground(""); }} style={{ background: color }} />)}</div>}</aside><main className="background-canvas"><div className="canvas-title"><div><strong>Image Background</strong><span>{processing ? "Processing…" : message}</span></div><button className="background-download" onClick={download} disabled={processing}>Download</button></div><div className="image-stage" style={{ backgroundColor: selectedColor, backgroundImage: selectedBackground ? `url(${selectedBackground})` : "none" }}><img src={cutoutUrl || sourceUrl} alt="Edited preview" /></div></main></section>;
}
