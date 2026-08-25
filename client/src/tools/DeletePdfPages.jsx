import React, { useEffect, useState } from "react";
import { PDFDocument } from "pdf-lib";

export default function DeletePdfPages() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  // Clean up temporary PDF URL when component is removed
  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  // Select PDF
  const handleFileChange = async (event) => {
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

    try {
      setLoading(true);
      setMessage("");
      setSelectedPages([]);

      // Remove previous download
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
        setDownloadUrl("");
      }

      const arrayBuffer = await selectedFile.arrayBuffer();

      const pdf = await PDFDocument.load(arrayBuffer);

      const totalPages = pdf.getPageCount();

      if (totalPages < 2) {
        setFile(selectedFile);
        setPageCount(totalPages);
        setMessage(
          "This PDF has only one page. You need at least 2 pages to delete a page."
        );
        return;
      }

      setFile(selectedFile);
      setPageCount(totalPages);
    } catch (error) {
      console.error("PDF reading error:", error);

      setFile(null);
      setPageCount(0);
      setSelectedPages([]);
      setMessage(
        "Unable to read this PDF. Please make sure it is a valid PDF file."
      );
    } finally {
      setLoading(false);
    }
  };

  // Select / unselect individual page
  const togglePage = (pageNumber) => {
    setSelectedPages((currentPages) => {
      if (currentPages.includes(pageNumber)) {
        return currentPages.filter((page) => page !== pageNumber);
      }

      return [...currentPages, pageNumber].sort((a, b) => a - b);
    });

    // Remove old generated PDF if user changes selection
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl("");
      setMessage("");
    }
  };

  // Select all pages except the last page
  const selectAllDeletablePages = () => {
    if (pageCount <= 1) {
      return;
    }

    const pages = Array.from(
      { length: pageCount - 1 },
      (_, index) => index + 1
    );

    setSelectedPages(pages);

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl("");
      setMessage("");
    }
  };

  // Clear selected pages
  const clearSelection = () => {
    setSelectedPages([]);

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl("");
      setMessage("");
    }
  };

  // Delete selected pages
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
      setMessage(
        "You cannot delete all pages. Please keep at least one page."
      );
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      // Remove previous generated PDF
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
        setDownloadUrl("");
      }

      const arrayBuffer = await file.arrayBuffer();

      const sourcePdf = await PDFDocument.load(arrayBuffer);

      const outputPdf = await PDFDocument.create();

      // Convert page numbers from 1-based to 0-based
      const pagesToDelete = new Set(
        selectedPages.map((pageNumber) => pageNumber - 1)
      );

      // Find pages that should remain
      const pagesToKeep = [];

      for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
        if (!pagesToDelete.has(pageIndex)) {
          pagesToKeep.push(pageIndex);
        }
      }

      // Copy remaining pages
      const copiedPages = await outputPdf.copyPages(
        sourcePdf,
        pagesToKeep
      );

      // Add copied pages to new PDF
      copiedPages.forEach((page) => {
        outputPdf.addPage(page);
      });

      // Create final PDF
      const pdfBytes = await outputPdf.save();

      const blob = new Blob([pdfBytes], {
        type: "application/pdf",
      });

      // Create download URL
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);

      // IMPORTANT:
      // Show success first.
      // Do NOT download automatically.
      setMessage(
        `${selectedPages.length} page${
          selectedPages.length === 1 ? "" : "s"
        } deleted successfully. Your new PDF is ready to download.`
      );

      // Clear page selection
      setSelectedPages([]);
    } catch (error) {
      console.error("Delete PDF pages error:", error);

      setDownloadUrl("");
      setMessage(
        "Something went wrong while deleting the pages. Please try another PDF."
      );
    } finally {
      setLoading(false);
    }
  };

  // Download generated PDF
  const downloadPdf = () => {
    if (!downloadUrl) {
      return;
    }

    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = "ShortcutHub-Delete-PDF-Pages.pdf";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset everything
  const resetTool = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }

    setFile(null);
    setPageCount(0);
    setSelectedPages([]);
    setMessage("");
    setDownloadUrl("");
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1000px",
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
          boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Header */}
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

        {/* PDF Upload */}
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
            <div
              style={{
                fontSize: "42px",
                marginBottom: "15px",
              }}
            >
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
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "600",
              }}
            >
              {loading ? "Reading PDF..." : "Choose PDF"}

              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                disabled={loading}
                style={{
                  display: "none",
                }}
              />
            </label>
          </div>
        )}

        {/* Selected PDF */}
        {file && (
          <>
            {/* File information */}
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

            {/* Only show page selection when PDF has enough pages */}
            {pageCount > 1 && (
              <>
                {/* Selection controls */}
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
                    <strong
                      style={{
                        color: "#111827",
                      }}
                    >
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

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      onClick={selectAllDeletablePages}
                      disabled={loading}
                      style={{
                        border: "1px solid #d1d5db",
                        background: "#ffffff",
                        padding: "8px 13px",
                        borderRadius: "8px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Select All
                    </button>

                    <button
                      type="button"
                      onClick={clearSelection}
                      disabled={loading}
                      style={{
                        border: "1px solid #d1d5db",
                        background: "#ffffff",
                        padding: "8px 13px",
                        borderRadius: "8px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Pages */}
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
                  {Array.from(
                    { length: pageCount },
                    (_, index) => {
                      const pageNumber = index + 1;

                      const selected =
                        selectedPages.includes(pageNumber);

                      return (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() =>
                            togglePage(pageNumber)
                          }
                          disabled={loading}
                          style={{
                            minHeight: "130px",
                            border: selected
                              ? "3px solid #dc2626"
                              : "1px solid #d1d5db",
                            borderRadius: "12px",
                            background: selected
                              ? "#fef2f2"
                              : "#ffffff",
                            cursor: loading
                              ? "not-allowed"
                              : "pointer",
                            position: "relative",
                            transition: "0.2s",
                          }}
                        >
                          {/* Selected check */}
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
                            {selected
                              ? "Selected"
                              : "Click to select"}
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Delete button */}
                {!downloadUrl && (
                  <div
                    style={{
                      marginTop: "24px",
                      paddingTop: "20px",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    <button
                      type="button"
                      onClick={deletePages}
                      disabled={
                        loading ||
                        selectedPages.length === 0 ||
                        selectedPages.length >= pageCount
                      }
                      style={{
                        width: "100%",
                        border: "none",
                        background:
                          loading ||
                          selectedPages.length === 0 ||
                          selectedPages.length >= pageCount
                            ? "#9ca3af"
                            : "#dc2626",
                        color: "#ffffff",
                        padding: "14px 20px",
                        borderRadius: "11px",
                        cursor:
                          loading ||
                          selectedPages.length === 0 ||
                          selectedPages.length >= pageCount
                            ? "not-allowed"
                            : "pointer",
                        fontSize: "16px",
                        fontWeight: "700",
                      }}
                    >
                      {loading
                        ? "Deleting Pages..."
                        : `Delete ${
                            selectedPages.length
                          } Page${
                            selectedPages.length === 1
                              ? ""
                              : "s"
                          }`}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Success message */}
            {message && (
              <div
                style={{
                  marginTop: "18px",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  background: message.includes(
                    "successfully"
                  )
                    ? "#ecfdf5"
                    : "#fef2f2",
                  color: message.includes(
                    "successfully"
                  )
                    ? "#047857"
                    : "#b91c1c",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {message}
              </div>
            )}

            {/* DOWNLOAD SECTION */}
            {downloadUrl && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "22px",
                  borderRadius: "14px",
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "30px",
                    marginBottom: "8px",
                  }}
                >
                  ✅
                </div>

                <h3
                  style={{
                    margin: "0 0 8px",
                    color: "#047857",
                    fontSize: "20px",
                  }}
                >
                  Pages deleted successfully
                </h3>

                <p
                  style={{
                    margin: "0 0 18px",
                    color: "#065f46",
                    fontSize: "14px",
                  }}
                >
                  Your new PDF is ready.
                </p>

                {/* Separate download button */}
                <button
                  type="button"
                  onClick={downloadPdf}
                  style={{
                    border: "none",
                    background: "#059669",
                    color: "#ffffff",
                    padding: "13px 28px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "700",
                  }}
                >
                  ⬇️ Download PDF
                </button>
              </div>
            )}
          </>
        )}

        {/* Loading message */}
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
