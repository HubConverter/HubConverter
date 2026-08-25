import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";

export default function DeletePdf() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setMessage("Please select a PDF file.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setSelectedPages([]);

      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);

      setFile(selectedFile);
      setPageCount(pdf.getPageCount());
    } catch (error) {
      console.error(error);
      setFile(null);
      setPageCount(0);
      setMessage("Unable to read this PDF.");
    } finally {
      setLoading(false);
    }
  };

  const togglePage = (pageNumber) => {
    setSelectedPages((current) => {
      if (current.includes(pageNumber)) {
        return current.filter((page) => page !== pageNumber);
      }

      return [...current, pageNumber].sort((a, b) => a - b);
    });
  };

  const selectAllPages = () => {
    setSelectedPages(
      Array.from({ length: pageCount }, (_, index) => index + 1)
    );
  };

  const clearSelection = () => {
    setSelectedPages([]);
  };

  const deletePages = async () => {
  if (!file) {
    setMessage("Please select a PDF first.");
    return;
  }

  if (selectedPages.length === 0) {
    setMessage("Please select at least one page to delete.");
    return;
  }

  if (selectedPages.length >= pageCount) {
    setMessage("You cannot delete all pages. Keep at least one page.");
    return;
  }

  try {
    setLoading(true);
    setMessage("");
    setDownloadUrl("");

    const arrayBuffer = await file.arrayBuffer();

    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const outputPdf = await PDFDocument.create();

    const pagesToDelete = new Set(
      selectedPages.map((pageNumber) => pageNumber - 1)
    );

    const pagesToKeep = [];

    for (let i = 0; i < pageCount; i++) {
      if (!pagesToDelete.has(i)) {
        pagesToKeep.push(i);
      }
    }

    const copiedPages = await outputPdf.copyPages(
      sourcePdf,
      pagesToKeep
    );

    copiedPages.forEach((page) => {
      outputPdf.addPage(page);
    });

    const pdfBytes = await outputPdf.save();

    const blob = new Blob([pdfBytes], {
      type: "application/pdf",
    });

    const url = URL.createObjectURL(blob);

    setDownloadUrl(url);

    setMessage(
      `${selectedPages.length} page${
        selectedPages.length > 1 ? "s" : ""
      } deleted successfully.`
    );

    setSelectedPages([]);
  } catch (error) {
    console.error(error);
    setMessage("Something went wrong while deleting the pages.");
    setDownloadUrl("");
  } finally {
    setLoading(false);
  }
};
};

const downloadPdf = () => {
  if (!downloadUrl) return;

  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = "ShortcutHub-Delete-PDF-Pages.pdf";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const resetTool = () => {
  const resetTool = () => {
    setFile(null);
    setPageCount(0);
    setSelectedPages([]);
    setMessage("");
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "30px",
          boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
          border: "1px solid #e5e7eb",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "18px",
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 15px",
              fontSize: "34px",
            }}
          >
            🗑️
          </div>

          <h2
            style={{
              margin: "0 0 8px",
              fontSize: "28px",
              color: "#111827",
            }}
          >
            Delete PDF Pages
          </h2>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "15px",
            }}
          >
            Select the pages you want to remove from your PDF.
          </p>
        </div>

        {!file && (
          <div
            style={{
              border: "2px dashed #cbd5e1",
              borderRadius: "18px",
              padding: "50px 20px",
              textAlign: "center",
              background: "#f8fafc",
            }}
          >
            <div style={{ fontSize: "42px", marginBottom: "15px" }}>
              📄
            </div>

            <h3
              style={{
                margin: "0 0 8px",
                color: "#1f2937",
              }}
            >
              Select a PDF file
            </h3>

            <p
              style={{
                color: "#6b7280",
                marginBottom: "20px",
              }}
            >
              Choose the PDF from which you want to delete pages.
            </p>

            <label
              style={{
                display: "inline-block",
                background: "#2563eb",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Choose PDF
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
          </div>
        )}

        {file && (
          <>
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "14px",
                padding: "16px",
                marginBottom: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: "700",
                    color: "#111827",
                    wordBreak: "break-word",
                  }}
                >
                  📄 {file.name}
                </div>

                <div
                  style={{
                    color: "#6b7280",
                    fontSize: "14px",
                    marginTop: "5px",
                  }}
                >
                  {pageCount} page{pageCount !== 1 ? "s" : ""}
                </div>
              </div>

              <button
                type="button"
                onClick={resetTool}
                style={{
                  border: "1px solid #d1d5db",
                  background: "#ffffff",
                  color: "#374151",
                  padding: "9px 15px",
                  borderRadius: "9px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Change PDF
              </button>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "18px",
              }}
            >
              <div>
                <strong style={{ color: "#111827" }}>
                  Select pages to delete
                </strong>

                <div
                  style={{
                    color: "#6b7280",
                    fontSize: "14px",
                    marginTop: "4px",
                  }}
                >
                  {selectedPages.length} selected
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={selectAllPages}
                  style={{
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    padding: "8px 13px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={clearSelection}
                  style={{
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    padding: "8px 13px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(120px, 1fr))",
                gap: "14px",
                maxHeight: "500px",
                overflowY: "auto",
                padding: "5px",
              }}
            >
              {Array.from({ length: pageCount }, (_, index) => {
                const pageNumber = index + 1;
                const selected = selectedPages.includes(pageNumber);

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => togglePage(pageNumber)}
                    style={{
                      minHeight: "130px",
                      border: selected
                        ? "3px solid #dc2626"
                        : "1px solid #d1d5db",
                      borderRadius: "12px",
                      background: selected
                        ? "#fef2f2"
                        : "#ffffff",
                      cursor: "pointer",
                      position: "relative",
                      transition: "0.2s",
                    }}
                  >
                    {selected && (
                      <div
                        style={{
                          position: "absolute",
                          top: "7px",
                          right: "7px",
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: "#dc2626",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: "700",
                        }}
                      >
                        ✓
                      </div>
                    )}

                    <div
                      style={{
                        fontSize: "42px",
                        marginBottom: "8px",
                      }}
                    >
                      📄
                    </div>

                    <div
                      style={{
                        fontWeight: "700",
                        color: selected
                          ? "#b91c1c"
                          : "#374151",
                      }}
                    >
                      Page {pageNumber}
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#9ca3af",
                        marginTop: "4px",
                      }}
                    >
                      {selected ? "Selected" : "Click to select"}
                    </div>
                  </button>
                );
              })}
            </div>

            <div
              style={{
                marginTop: "24px",
                paddingTop: "20px",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              {!downloadUrl && (
  <button
    type="button"
    onClick={deletePages}
    disabled={loading || selectedPages.length === 0}
    style={{
      width: "100%",
      border: "none",
      background:
        loading || selectedPages.length === 0
          ? "#9ca3af"
          : "#dc2626",
      color: "#ffffff",
      padding: "14px 20px",
      borderRadius: "11px",
      cursor:
        loading || selectedPages.length === 0
          ? "not-allowed"
          : "pointer",
      fontSize: "16px",
      fontWeight: "700",
    }}
  >
    {loading
      ? "Deleting Pages..."
      : `Delete ${selectedPages.length} Page${
          selectedPages.length === 1 ? "" : "s"
        }`}
  </button>
)}
{downloadUrl && (
  <button
    type="button"
    onClick={downloadPdf}
    style={{
      width: "100%",
      border: "none",
      background: "#16a34a",
      color: "#ffffff",
      padding: "14px 20px",
      borderRadius: "11px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "700",
      marginTop: "12px",
    }}
  >
    Download PDF
  </button>
)}
            </div>
          </>
        )}

        {message && (
          <div
            style={{
              marginTop: "18px",
              padding: "13px 15px",
              borderRadius: "10px",
              background: message.includes("successfully")
                ? "#ecfdf5"
                : "#fef2f2",
              color: message.includes("successfully")
                ? "#047857"
                : "#b91c1c",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            {message}
          </div>
        )}

        {loading && !file && (
          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
              color: "#6b7280",
            }}
          >
            Reading PDF...
          </div>
        )}
      </div>
    </div>
  );
}
