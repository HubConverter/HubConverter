```jsx
import React, { useEffect, useRef, useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

export default function EditPdf() {
  const canvasRef = useRef(null);

  const [file, setFile] = useState(null);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [editMode, setEditMode] = useState("text");
  const [text, setText] = useState("");
  const [textX, setTextX] = useState(100);
  const [textY, setTextY] = useState(100);
  const [fontSize, setFontSize] = useState(18);

  const [drawColor, setDrawColor] = useState("#dc2626");
  const [drawSize, setDrawSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);

  const [downloadUrl, setDownloadUrl] = useState("");

  const [pageEdits, setPageEdits] = useState({});

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

  const loadPdf = async (selectedFile) => {
    try {
      setLoading(true);
      setMessage("");

      const arrayBuffer = await selectedFile.arrayBuffer();

      const loadedPdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
      }).promise;

      setPdfDocument(loadedPdf);
      setTotalPages(loadedPdf.numPages);
      setPageNumber(1);
      setPageEdits({});
      setFile(selectedFile);
    } catch (error) {
      console.error(error);
      setMessage("Unable to open this PDF.");
      setFile(null);
      setPdfDocument(null);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

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

    await loadPdf(selectedFile);
  };

  const renderPage = async () => {
    if (!pdfDocument || !canvasRef.current) return;

    try {
      const page = await pdfDocument.getPage(pageNumber);

      const viewport = page.getViewport({
        scale: 1.5,
      });

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      context.clearRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      const edits = pageEdits[pageNumber];

      if (edits && edits.length > 0) {
        edits.forEach((edit) => {
          if (edit.type === "text") {
            context.font =
              "bold " + edit.fontSize + "px Arial";

            context.fillStyle = "#111827";

            context.fillText(
              edit.text,
              edit.x,
              edit.y
            );
          }

          if (edit.type === "draw") {
            if (!edit.points || edit.points.length < 2) {
              return;
            }

            context.beginPath();

            context.strokeStyle = edit.color;
            context.lineWidth = edit.size;
            context.lineCap = "round";
            context.lineJoin = "round";

            context.moveTo(
              edit.points[0].x,
              edit.points[0].y
            );

            for (let i = 1; i < edit.points.length; i++) {
              context.lineTo(
                edit.points[i].x,
                edit.points[i].y
              );
            }

            context.stroke();
            context.closePath();
          }
        });
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to display this PDF page.");
    }
  };

  useEffect(() => {
    renderPage();
  }, [pdfDocument, pageNumber, pageEdits]);

  const previousPage = () => {
    if (pageNumber > 1) {
      setPageNumber((current) => current - 1);
    }
  };

  const nextPage = () => {
    if (pageNumber < totalPages) {
      setPageNumber((current) => current + 1);
    }
  };

  const getMousePosition = (event) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return {
        x: 0,
        y: 0,
      };
    }

    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (event) => {
    if (editMode !== "draw") return;

    const position = getMousePosition(event);

    setIsDrawing(true);

    const newEdit = {
      type: "draw",
      color: drawColor,
      size: drawSize,
      points: [position],
    };

    setPageEdits((previous) => ({
      ...previous,
      [pageNumber]: [
        ...(previous[pageNumber] || []),
        newEdit,
      ],
    }));
  };

  const draw = (event) => {
    if (!isDrawing || editMode !== "draw") return;

    const position = getMousePosition(event);

    setPageEdits((previous) => {
      const currentEdits = [
        ...(previous[pageNumber] || []),
      ];

      if (currentEdits.length === 0) {
        return previous;
      }

      const lastEdit =
        currentEdits[currentEdits.length - 1];

      if (lastEdit.type !== "draw") {
        return previous;
      }

      lastEdit.points = [
        ...lastEdit.points,
        position,
      ];

      return {
        ...previous,
        [pageNumber]: currentEdits,
      };
    });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const addTextToCanvas = () => {
    if (!text.trim()) {
      setMessage("Enter some text first.");
      return;
    }

    const newEdit = {
      type: "text",
      text: text,
      x: textX,
      y: textY,
      fontSize: fontSize,
    };

    setPageEdits((previous) => ({
      ...previous,
      [pageNumber]: [
        ...(previous[pageNumber] || []),
        newEdit,
      ],
    }));

    setMessage("Text added to the page.");
  };

  const clearCanvasEdits = () => {
    setPageEdits((previous) => {
      const updated = {
        ...previous,
      };

      delete updated[pageNumber];

      return updated;
    });

    setMessage("Added edits cleared from the current page.");
  };

  const hexToRgb = (hex) => {
    const cleanHex = hex.replace("#", "");

    const r =
      parseInt(cleanHex.substring(0, 2), 16) / 255;

    const g =
      parseInt(cleanHex.substring(2, 4), 16) / 255;

    const b =
      parseInt(cleanHex.substring(4, 6), 16) / 255;

    return rgb(r, g, b);
  };

  const savePdf = async () => {
    if (!file) {
      setMessage("Please select a PDF first.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const originalBytes = await file.arrayBuffer();

      const sourcePdf = await PDFDocument.load(
        originalBytes
      );

      const font = await sourcePdf.embedFont(
        StandardFonts.Helvetica
      );

      const pages = sourcePdf.getPages();

      Object.keys(pageEdits).forEach((pageKey) => {
        const pageIndex = Number(pageKey) - 1;

        const currentPage = pages[pageIndex];

        if (!currentPage) return;

        const pageWidth = currentPage.getWidth();
        const pageHeight = currentPage.getHeight();

        const canvas = canvasRef.current;

        const canvasWidth = canvas
          ? canvas.width
          : pageWidth * 1.5;

        const canvasHeight = canvas
          ? canvas.height
          : pageHeight * 1.5;

        const scaleX = pageWidth / canvasWidth;
        const scaleY = pageHeight / canvasHeight;

        const edits = pageEdits[pageKey];

        edits.forEach((edit) => {
          if (edit.type === "text") {
            currentPage.drawText(edit.text, {
              x: edit.x * scaleX,
              y:
                pageHeight -
                edit.y * scaleY -
                edit.fontSize * scaleY,
              size: edit.fontSize * scaleX,
              font: font,
              color: rgb(
                0.067,
                0.09,
                0.14
              ),
            });
          }

          if (
            edit.type === "draw" &&
            edit.points &&
            edit.points.length > 1
          ) {
            for (
              let i = 1;
              i < edit.points.length;
              i++
            ) {
              const previousPoint =
                edit.points[i - 1];

              const currentPoint =
                edit.points[i];

              currentPage.drawLine({
                start: {
                  x: previousPoint.x * scaleX,
                  y:
                    pageHeight -
                    previousPoint.y * scaleY,
                },
                end: {
                  x: currentPoint.x * scaleX,
                  y:
                    pageHeight -
                    currentPoint.y * scaleY,
                },
                thickness:
                  edit.size * scaleX,
                color: hexToRgb(edit.color),
              });
            }
          }
        });
      });

      const pdfBytes = await sourcePdf.save();

      const blob = new Blob([pdfBytes], {
        type: "application/pdf",
      });

      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }

      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);

      setMessage(
        "PDF edited successfully. Your edited PDF is ready to download."
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "Something went wrong while saving the edited PDF."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = () => {
    if (!downloadUrl) return;

    const link = document.createElement("a");

    link.href = downloadUrl;

    link.download =
      "ShortcutHub-Edited-PDF.pdf";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  const resetTool = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }

    setFile(null);
    setPdfDocument(null);
    setPageNumber(1);
    setTotalPages(0);
    setMessage("");
    setText("");
    setPageEdits({});
    setDownloadUrl("");
    setEditMode("text");
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
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "18px",
              background: "#dbeafe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 15px",
              fontSize: "34px",
            }}
          >
            ✏️
          </div>

          <h2
            style={{
              margin: "0 0 8px",
              fontSize: "28px",
              color: "#111827",
            }}
          >
            Edit PDF
          </h2>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "15px",
            }}
          >
            Add text and drawings to your PDF.
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
            <div
              style={{
                fontSize: "45px",
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
              Choose the PDF you want to edit.
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
                style={{
                  display: "none",
                }}
              />
            </label>
          </div>
        )}

        {file && pdfDocument && (
          <>
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "14px",
                padding: "15px",
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
                  Page {pageNumber} of {totalPages}
                </div>
              </div>

              <button
                type="button"
                onClick={resetTool}
                style={{
                  border: "1px solid #d1d5db",
                  background: "#ffffff",
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
                display: "grid",
                gridTemplateColumns:
                  "minmax(220px, 280px) 1fr",
                gap: "20px",
                alignItems: "start",
              }}
            >
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "14px",
                  padding: "18px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 15px",
                    color: "#111827",
                  }}
                >
                  Editing Tools
                </h3>

                <button
                  type="button"
                  onClick={() => setEditMode("text")}
                  style={{
                    width: "100%",
                    padding: "11px",
                    marginBottom: "10px",
                    borderRadius: "9px",
                    border:
                      editMode === "text"
                        ? "2px solid #2563eb"
                        : "1px solid #d1d5db",
                    background:
                      editMode === "text"
                        ? "#eff6ff"
                        : "#ffffff",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  ✏️ Add Text
                </button>

                <button
                  type="button"
                  onClick={() => setEditMode("draw")}
                  style={{
                    width: "100%",
                    padding: "11px",
                    marginBottom: "18px",
                    borderRadius: "9px",
                    border:
                      editMode === "draw"
                        ? "2px solid #2563eb"
                        : "1px solid #d1d5db",
                    background:
                      editMode === "draw"
                        ? "#eff6ff"
                        : "#ffffff",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  🖊️ Draw
                </button>

                {editMode === "text" && (
                  <>
                    <label
                      style={{
                        display: "block",
                        fontWeight: "600",
                        marginBottom: "6px",
                      }}
                    >
                      Text
                    </label>

                    <textarea
                      value={text}
                      onChange={(event) =>
                        setText(event.target.value)
                      }
                      placeholder="Enter text..."
                      rows={4}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        resize: "vertical",
                        marginBottom: "12px",
                      }}
                    />

                    <label
                      style={{
                        display: "block",
                        fontWeight: "600",
                        marginBottom: "6px",
                      }}
                    >
                      Font Size
                    </label>

                    <input
                      type="number"
                      min="8"
                      max="100"
                      value={fontSize}
                      onChange={(event) =>
                        setFontSize(
                          Number(event.target.value)
                        )
                      }
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "9px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        marginBottom: "12px",
                      }}
                    />

                    <label
                      style={{
                        display: "block",
                        fontWeight: "600",
                        marginBottom: "6px",
                      }}
                    >
                      X Position
                    </label>

                    <input
                      type="number"
                      value={textX}
                      onChange={(event) =>
                        setTextX(
                          Number(event.target.value)
                        )
                      }
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "9px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        marginBottom: "12px",
                      }}
                    />

                    <label
                      style={{
                        display: "block",
                        fontWeight: "600",
                        marginBottom: "6px",
                      }}
                    >
                      Y Position
                    </label>

                    <input
                      type="number"
                      value={textY}
                      onChange={(event) =>
                        setTextY(
                          Number(event.target.value)
                        )
                      }
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "9px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        marginBottom: "12px",
                      }}
                    />

                    <button
                      type="button"
                      onClick={addTextToCanvas}
                      style={{
                        width: "100%",
                        border: "none",
                        background: "#2563eb",
                        color: "#ffffff",
                        padding: "11px",
                        borderRadius: "9px",
                        cursor: "pointer",
                        fontWeight: "700",
                      }}
                    >
                      Add Text
                    </button>
                  </>
                )}

                {editMode === "draw" && (
                  <>
                    <label
                      style={{
                        display: "block",
                        fontWeight: "600",
                        marginBottom: "6px",
                      }}
                    >
                      Pen Color
                    </label>

                    <input
                      type="color"
                      value={drawColor}
                      onChange={(event) =>
                        setDrawColor(event.target.value)
                      }
                      style={{
                        width: "100%",
                        height: "42px",
                        marginBottom: "12px",
                      }}
                    />

                    <label
                      style={{
                        display: "block",
                        fontWeight: "600",
                        marginBottom: "6px",
                      }}
                    >
                      Pen Size
                    </label>

                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={drawSize}
                      onChange={(event) =>
                        setDrawSize(
                          Number(event.target.value)
                        )
                      }
                      style={{
                        width: "100%",
                        marginBottom: "15px",
                      }}
                    />

                    <p
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        margin: 0,
                      }}
                    >
                      Click and drag on the PDF to draw.
                    </p>
                  </>
                )}

                <button
                  type="button"
                  onClick={clearCanvasEdits}
                  style={{
                    width: "100%",
                    marginTop: "18px",
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    color: "#374151",
                    padding: "10px",
                    borderRadius: "9px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Clear Current Page Edits
                </button>
              </div>

              <div>
                <div
                  style={{
                    background: "#e5e7eb",
                    borderRadius: "14px",
                    padding: "20px",
                    overflow: "auto",
                    textAlign: "center",
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      background: "#ffffff",
                      boxShadow:
                        "0 5px 20px rgba(0,0,0,0.12)",
                      cursor:
                        editMode === "draw"
                          ? "crosshair"
                          : "default",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "12px",
                    marginTop: "15px",
                  }}
                >
                  <button
                    type="button"
                    onClick={previousPage}
                    disabled={pageNumber === 1}
                    style={{
                      border: "1px solid #d1d5db",
                      background: "#ffffff",
                      padding: "9px 16px",
                      borderRadius: "8px",
                      cursor:
                        pageNumber === 1
                          ? "not-allowed"
                          : "pointer",
                      fontWeight: "600",
                    }}
                  >
                    ← Previous
                  </button>

                  <strong
                    style={{
                      color: "#374151",
                    }}
                  >
                    {pageNumber} / {totalPages}
                  </strong>

                  <button
                    type="button"
                    onClick={nextPage}
                    disabled={
                      pageNumber === totalPages
                    }
                    style={{
                      border: "1px solid #d1d5db",
                      background: "#ffffff",
                      padding: "9px 16px",
                      borderRadius: "8px",
                      cursor:
                        pageNumber === totalPages
                          ? "not-allowed"
                          : "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Next →
                  </button>
                </div>
              </div>
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
                  onClick={savePdf}
                  disabled={loading}
                  style={{
                    width: "100%",
                    border: "none",
                    background: loading
                      ? "#9ca3af"
                      : "#16a34a",
                    color: "#ffffff",
                    padding: "14px 20px",
                    borderRadius: "11px",
                    cursor: loading
                      ? "not-allowed"
                      : "pointer",
                    fontSize: "16px",
                    fontWeight: "700",
                  }}
                >
                  {loading
                    ? "Saving PDF..."
                    : "Save Edited PDF"}
                </button>
              )}

              {downloadUrl && (
                <div
                  style={{
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    borderRadius: "14px",
                    padding: "20px",
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
                    }}
                  >
                    PDF edited successfully
                  </h3>

                  <p
                    style={{
                      margin: "0 0 16px",
                      color: "#065f46",
                    }}
                  >
                    Your edited PDF is ready.
                  </p>

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
            </div>
          </>
        )}

        {message && !downloadUrl && (
          <div
            style={{
              marginTop: "18px",
              padding: "13px 15px",
              borderRadius: "10px",
              background: "#fef2f2",
              color: "#b91c1c",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
```
