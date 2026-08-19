```jsx
import React, { useState } from "react";
import { jsPDF } from "jspdf";

export default function JpgToPdf() {
  const [files, setFiles] = useState([]);
  const [converting, setConverting] = useState(false);
  const [imageSize, setImageSize] = useState("medium");

  const handleFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    const images = selectedFiles.filter((file) =>
      ["image/jpeg", "image/png", "image/jpg"].includes(file.type)
    );

    setFiles(images);
  };

  const convertToPdf = async () => {
    if (!files.length) {
      alert("Please select at least one JPG or PNG image.");
      return;
    }

    setConverting(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const imageUrl = URL.createObjectURL(file);
        const img = new Image();

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });

        const pageWidth = 210;
        const pageHeight = 297;

        /*
          Image size options:

          Small  = 60% of available page area
          Medium = 80% of available page area
          Large  = 100% of available page area
        */
        const sizeScale = {
          small: 0.6,
          medium: 0.8,
          large: 1
        };

        const margin = 10;

        const maxWidth =
          (pageWidth - margin * 2) * sizeScale[imageSize];

        const maxHeight =
          (pageHeight - margin * 2) * sizeScale[imageSize];

        let width = img.width;
        let height = img.height;

        const ratio = Math.min(
          maxWidth / width,
          maxHeight / height
        );

        width *= ratio;
        height *= ratio;

        const x = (pageWidth - width) / 2;
        const y = (pageHeight - height) / 2;

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(
          img,
          file.type === "image/png" ? "PNG" : "JPEG",
          x,
          y,
          width,
          height
        );

        URL.revokeObjectURL(imageUrl);
      }

  pdf.save("ShortcutHub-JPG-to-PDF-" + imageSize + ".pdf");
    } catch (error) {
      console.error(error);
      alert("Something went wrong while creating the PDF.");
    }

    setConverting(false);
  };

  return (
    <section className="toolPage">
      <div className="toolBox">

        <div className="toolIcon">🖼️</div>

        <small>SHORTCUTHUB TOOL</small>

        <h1>JPG to PDF</h1>

        <p>
          Convert your JPG or PNG images into a professional PDF.
        </p>

        <label className="uploadBox">
          <input
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={handleFiles}
          />

          <div className="uploadIcon">📁</div>

          <strong>
          {files.length > 0
  ? files.length + " image" + (files.length > 1 ? "s" : "") + " selected"
  : "Choose JPG or PNG images"}
          </strong>

          <span>
            Click here to select your images
          </span>
        </label>

        {files.length > 0 && (
          <div className="fileList">
            {files.map((file, index) => (
              <div className="fileItem" key={index}>
                <span>🖼️</span>
                <span>{file.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* IMAGE SIZE */}
        <div className="sizeSelector">
          <strong>Image Size</strong>

          <div className="sizeOptions">

            <button
              type="button"
              className={imageSize === "small" ? "sizeOption active" : "sizeOption"}
              onClick={() => setImageSize("small")}
            >
              <span className="sizeIcon">S</span>
              <span>
                <b>Small</b>
                <small>60% size</small>
              </span>
            </button>

            <button
              type="button"
              className={imageSize === "medium" ? "sizeOption active" : "sizeOption"}
              onClick={() => setImageSize("medium")}
            >
              <span className="sizeIcon">M</span>
              <span>
                <b>Medium</b>
                <small>80% size</small>
              </span>
            </button>

            <button
              type="button"
              className={imageSize === "large" ? "sizeOption active" : "sizeOption"}
              onClick={() => setImageSize("large")}
            >
              <span className="sizeIcon">L</span>
              <span>
                <b>Large</b>
                <small>100% size</small>
              </span>
            </button>

          </div>
        </div>

        <button
          className="convertButton"
          onClick={convertToPdf}
          disabled={converting || files.length === 0}
        >
          {converting ? "Creating PDF..." : "Convert to PDF"}
        </button>

        <div className="toolNote">
          🔒 Your images are processed directly in your browser.
        </div>

      </div>
    </section>
  );
}
```
