import React, { useState } from "react";
import { jsPDF } from "jspdf";

export default function JpgToPdf() {
  const [files, setFiles] = useState([]);
  const [converting, setConverting] = useState(false);
 const [imageSize, setImageSize] = useState("medium");
const [showSizes, setShowSizes] = useState(false);

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

         {!showSizes && (
<button
className="convertButton"
onClick={() => setShowSizes(true)}
disabled={files.length === 0}

>

```
Convert to PDF
```

  </button>
)}

{showSizes && (

  <div className="sizeSelector">
    <strong>Choose Image Size</strong>

```
<div className="sizeOptions">

  <button
    type="button"
    className={
      imageSize === "small"
        ? "sizeOption active"
        : "sizeOption"
    }
    onClick={() => setImageSize("small")}
  >
    <span className="sizeIcon">S</span>
    <span>
      <b>Small</b>
      <small>720 × 1080</small>
    </span>
  </button>

  <button
    type="button"
    className={
      imageSize === "medium"
        ? "sizeOption active"
        : "sizeOption"
    }
    onClick={() => setImageSize("medium")}
  >
    <span className="sizeIcon">M</span>
    <span>
      <b>Medium</b>
      <small>1080 × 2080</small>
    </span>
  </button>

  <button
    type="button"
    className={
      imageSize === "large"
        ? "sizeOption active"
        : "sizeOption"
    }
    onClick={() => setImageSize("large")}
  >
    <span className="sizeIcon">L</span>
    <span>
      <b>Large</b>
      <small>1440 × 2560</small>
    </span>
  </button>

</div>

<button
  className="convertButton"
  onClick={convertToPdf}
  disabled={converting || files.length === 0}
>
  {converting ? "Creating PDF..." : "Create PDF"}
</button>
```

  </div>
)}


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
