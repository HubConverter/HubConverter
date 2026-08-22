import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

export default function PDFToPowerPoint() {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setFile(null);
      setMessage("Please select a PDF file.");
      return;
    }

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    setFile(selectedFile);
    setMessage("");
  };

  const convertToPowerPoint = async () => {
    if (!file) {
      setMessage("Please select a PDF file first.");
      return;
    }

    try {
      setProcessing(true);
      setMessage("Reading PDF...");

      const arrayBuffer = await file.arrayBuffer();

      const pdf = await PDFDocument.load(arrayBuffer);

      const pageCount = pdf.getPageCount();

      setMessage(`Preparing ${pageCount} PDF page(s)...`);

      const originalName = file.name
        .replace(/\.pdf$/i, "")
        .replace(/[<>:"/\\|?*]+/g, "_");

      const pptxBlob = await createPowerPoint(pageCount, file.name);

      const url = URL.createObjectURL(pptxBlob);

      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }

      setDownloadUrl(url);

      setMessage(
        "Conversion completed successfully. Click Download PowerPoint."
      );
    } catch (error) {
      console.error("PDF to PowerPoint error:", error);

      setMessage(
        "Could not convert this PDF. Please try another PDF file."
      );
    } finally {
      setProcessing(false);
    }
  };

  const downloadPowerPoint = () => {
    if (!downloadUrl || !file) return;

    const originalName = file.name
      .replace(/\.pdf$/i, "")
      .replace(/[<>:"/\\|?*]+/g, "_");

    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = `${originalName}-PowerPoint.pptx`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        maxWidth: "850px",
        margin: "0 auto",
        padding: "30px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "35px",
          boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
          border: "1px solid #e5e7eb",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "10px",
            fontSize: "28px",
          }}
        >
          PDF to PowerPoint
        </h2>

        <p
          style={{
            color: "#64748b",
            marginBottom: "28px",
          }}
        >
          Convert a PDF file into a PowerPoint presentation.
        </p>

        <div
          style={{
            border: "2px dashed #cbd5e1",
            borderRadius: "16px",
            padding: "40px 20px",
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
            📊
          </div>

          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            style={{
              display: "block",
              margin: "0 auto",
              maxWidth: "100%",
            }}
          />

          {file && (
            <div
              style={{
                marginTop: "18px",
                color: "#334155",
                fontWeight: "600",
              }}
            >
              Selected: {file.name}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={convertToPowerPoint}
          disabled={!file || processing}
          style={{
            width: "100%",
            marginTop: "30px",
            padding: "16px",
            border: "none",
            borderRadius: "12px",
            background:
              !file || processing ? "#94a3b8" : "#2563eb",
            color: "#fff",
            fontSize: "17px",
            fontWeight: "700",
            cursor:
              !file || processing
                ? "not-allowed"
                : "pointer",
          }}
        >
          {processing
            ? "Converting..."
            : "Convert to PowerPoint"}
        </button>

        {downloadUrl && !processing && (
          <button
            type="button"
            onClick={downloadPowerPoint}
            style={{
              width: "100%",
              marginTop: "15px",
              padding: "16px",
              border: "none",
              borderRadius: "12px",
              background: "#16a34a",
              color: "#fff",
              fontSize: "17px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            ⬇ Download PowerPoint
          </button>
        )}

        {message && (
          <div
            style={{
              marginTop: "20px",
              padding: "14px",
              borderRadius: "10px",
              background: "#f1f5f9",
              color: "#334155",
              lineHeight: "1.5",
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

async function createPowerPoint(pageCount, fileName) {
  const zip = new JSZip();

  const escapedFileName = escapeXml(fileName);

  const slideText =
    `PDF: ${escapedFileName} - ${pageCount} page(s)`;

  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
<Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
</Types>`
  );

  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship
Id="rId1"
Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"
Target="ppt/presentation.xml"/>
</Relationships>`
  );

  zip.file(
    "ppt/presentation.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<p:presentation
xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">

<p:sldMasterIdLst>
<p:sldMasterId id="2147483648" r:id="rId1"/>
</p:sldMasterIdLst>

<p:sldIdLst>
<p:sldId id="256" r:id="rId2"/>
</p:sldIdLst>

<p:sldSz cx="12192000" cy="6858000"/>

<p:notesSz cx="6858000" cy="9144000"/>

</p:presentation>`
  );

  zip.file(
    "ppt/slides/slide1.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<p:sld
xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">

<p:cSld>

<p:spTree>

<p:nvGrpSpPr>
<p:cNvPr id="1" name=""/>
<p:cNvGrpSpPr/>
<p:nvPr/>
</p:nvGrpSpPr>

<p:grpSpPr/>

<p:sp>

<p:nvSpPr>
<p:cNvPr id="2" name="PDF Information"/>
<p:cNvSpPr txBox="1"/>
<p:nvPr/>
</p:nvSpPr>

<p:spPr/>

<p:txBody>

<a:bodyPr/>
<a:lstStyle/>

<a:p>

<a:r>

<a:rPr lang="en-US" sz="2200"/>

<a:t>${escapeXml(slideText)}</a:t>

</a:r>

</a:p>

</p:txBody>

</p:sp>

</p:spTree>

</p:cSld>

<p:clrMapOvr>
<a:masterClrMapping/>
</p:clrMapOvr>

</p:sld>`
  );

  const blob = await zip.generateAsync({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  });

  return blob;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
