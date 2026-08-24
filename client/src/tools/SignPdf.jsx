import React, { useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

const MAX_PREVIEW_WIDTH = 760;

function SignPdf() {
  const fileInputRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const signatureCanvasRef = useRef(null);
  const previewWrapRef = useRef(null);

  const [pdfFile, setPdfFile] = useState(null);
  const [pdfBytes, setPdfBytes] = useState(null);
  const [pdfDocument, setPdfDocument] = useState(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);

  const [signatureMode, setSignatureMode] = useState("draw");
  const [typedName, setTypedName] = useState("");

  const [signatureColor, setSignatureColor] = useState("#111827");
  const [signatureSize, setSignatureSize] = useState(24);

  const [signatureImage, setSignatureImage] = useState(null);

  const [signatureX, setSignatureX] = useState(40);
  const [signatureY, setSignatureY] = useState(40);
  const [signatureWidth, setSignatureWidth] = useState(190);
  const [signatureHeight, setSignatureHeight] = useState(70);

  const [dragging, setDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [pageInfo, setPageInfo] = useState({
    pdfWidth: 595,
    pdfHeight: 842,
    scale: 1,
  });

  const drawStateRef = useRef({
    drawing: false,
    lastX: 0,
    lastY: 0,
  });

  function clearMessages() {
    setMessage("");
    setError("");
  }

  function getCanvasPoint(event, canvas) {
    const rect = canvas.getBoundingClientRect();

    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function setupSignatureCanvas() {
    const canvas = signatureCanvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = signatureColor;
  }

  useEffect(() => {
    setupSignatureCanvas();
  }, [signatureColor]);

  function startDrawing(event) {
    if (signatureMode !== "draw") return;

    event.preventDefault();

    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const point = getCanvasPoint(event, canvas);

    drawStateRef.current = {
      drawing: true,
      lastX: point.x,
      lastY: point.y,
    };
  }

  function draw(event) {
    if (signatureMode !== "draw") return;
    if (!drawStateRef.current.drawing) return;

    event.preventDefault();

    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const point = getCanvasPoint(event, canvas);

    ctx.strokeStyle = signatureColor;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(
      drawStateRef.current.lastX,
      drawStateRef.current.lastY
    );
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    drawStateRef.current.lastX = point.x;
    drawStateRef.current.lastY = point.y;
  }

  function stopDrawing() {
    drawStateRef.current.drawing = false;
  }

  function clearSignatureCanvas() {
    const canvas = signatureCanvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    setSignatureImage(null);
  }

  function createTypedSignature() {
    const text = typedName.trim();

    if (!text) {
      setError("Enter your name first.");
      return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = 900;
    canvas.height = 260;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = signatureColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const fontSize = Math.max(60, Math.min(120, signatureSize * 4));

    ctx.font = `italic ${fontSize}px "Brush Script MT", "Segoe Script", cursive`;

    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    setSignatureImage(canvas.toDataURL("image/png"));
    clearMessages();
  }

  function useDrawnSignature() {
    const canvas = signatureCanvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    let hasDrawing = false;

    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] > 0) {
        hasDrawing = true;
        break;
      }
    }

    if (!hasDrawing) {
      setError("Draw your signature first.");
      return;
    }

    setSignatureImage(canvas.toDataURL("image/png"));
    clearMessages();
  }

  async function loadPdf(file) {
    clearMessages();

    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please select a PDF file.");
      return;
    }

    try {
      setLoading(true);

      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      const loadingTask = pdfjsLib.getDocument({
        data: bytes.slice(),
      });

      const document = await loadingTask.promise;

      setPdfFile(file);
      setPdfBytes(bytes);
      setPdfDocument(document);
      setPageCount(document.numPages);
      setPageNumber(1);

      setSignatureImage(null);

      setMessage(
        `${document.numPages} page${
          document.numPages === 1 ? "" : "s"
        } loaded successfully.`
      );
    } catch (err) {
      console.error(err);
      setError(
        "Unable to open this PDF. Please try another PDF file."
      );
    } finally {
      setLoading(false);
    }
  }

  async function renderPage(document, number) {
    if (!document || !previewCanvasRef.current) return;

    const page = await document.getPage(number);

    const unscaledViewport = page.getViewport({
      scale: 1,
    });

    const scale = Math.min(
      MAX_PREVIEW_WIDTH / unscaledViewport.width,
      1.5
    );

    const viewport = page.getViewport({
      scale,
    });

    const canvas = previewCanvasRef.current;

    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    setPageInfo({
      pdfWidth: unscaledViewport.width,
      pdfHeight: unscaledViewport.height,
      scale,
    });

    setSignatureX(
      Math.min(
        signatureX,
        Math.max(0, viewport.width - signatureWidth)
      )
    );

    setSignatureY(
      Math.min(
        signatureY,
        Math.max(0, viewport.height - signatureHeight)
      )
    );
  }

  useEffect(() => {
    if (!pdfDocument) return;

    renderPage(pdfDocument, pageNumber).catch((err) => {
      console.error(err);
      setError("Unable to preview this PDF page.");
    });
  }, [pdfDocument, pageNumber]);

  function previousPage() {
    setPageNumber((current) => Math.max(1, current - 1));
  }

  function nextPage() {
    setPageNumber((current) =>
      Math.min(pageCount, current + 1)
    );
  }

  function startDragging(event) {
    event.preventDefault();

    const wrap = previewWrapRef.current;

    if (!wrap) return;

    const rect = wrap.getBoundingClientRect();

    dragOffsetRef.current = {
      x:
        event.clientX -
        rect.left -
        signatureX,
      y:
        event.clientY -
        rect.top -
        signatureY,
    };

    setDragging(true);
  }

  useEffect(() => {
    function move(event) {
      if (!dragging) return;

      const wrap = previewWrapRef.current;

      if (!wrap) return;

      const rect = wrap.getBoundingClientRect();

      let nextX =
        event.clientX -
        rect.left -
        dragOffsetRef.current.x;

      let nextY =
        event.clientY -
        rect.top -
        dragOffsetRef.current.y;

      const maxX = Math.max(
        0,
        rect.width - signatureWidth
      );

      const maxY = Math.max(
        0,
        rect.height - signatureHeight
      );

      nextX = Math.max(0, Math.min(maxX, nextX));
      nextY = Math.max(0, Math.min(maxY, nextY));

      setSignatureX(nextX);
      setSignatureY(nextY);
    }

    function stop() {
      setDragging(false);
    }

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
  }, [
    dragging,
    signatureWidth,
    signatureHeight,
  ]);

  function resetSignaturePosition() {
    setSignatureX(40);
    setSignatureY(40);
    setSignatureWidth(190);
    setSignatureHeight(70);
  }

  function resizeSignature(event) {
    const nextWidth = Number(event.target.value);

    setSignatureWidth(nextWidth);

    const ratio = 70 / 190;

    setSignatureHeight(
      Math.max(40, Math.round(nextWidth * ratio))
    );
  }

  async function signPdf() {
    clearMessages();

    if (!pdfBytes) {
      setError("Please upload a PDF first.");
      return;
    }

    if (!signatureImage) {
      setError(
        "Please create your signature first."
      );
      return;
    }

    try {
      setLoading(true);

      const pdfDoc = await PDFDocument.load(pdfBytes);

      const pages = pdfDoc.getPages();

      if (!pages[pageNumber - 1]) {
        throw new Error("Selected page not found.");
      }

      const page = pages[pageNumber - 1];

      const { width: pdfPageWidth, height: pdfPageHeight } =
        page.getSize();

      const imageBytes = await fetch(signatureImage).then(
        (response) => response.arrayBuffer()
      );

      const signature = await pdfDoc.embedPng(imageBytes);

      const displayedWidth =
        pageInfo.pdfWidth * pageInfo.scale;

      const displayedHeight =
        pageInfo.pdfHeight * pageInfo.scale;

      const scaleX =
        pdfPageWidth / displayedWidth;

      const scaleY =
        pdfPageHeight / displayedHeight;

      const pdfX = signatureX * scaleX;

      const pdfWidth = signatureWidth * scaleX;

      const pdfHeight = signatureHeight * scaleY;

      const pdfY =
        pdfPageHeight -
        (signatureY * scaleY) -
        pdfHeight;

      page.drawImage(signature, {
        x: pdfX,
        y: pdfY,
        width: pdfWidth,
        height: pdfHeight,
      });

      const finalBytes = await pdfDoc.save();

      const blob = new Blob([finalBytes], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      const originalName =
        pdfFile?.name?.replace(/\.pdf$/i, "") ||
        "document";

      link.href = url;
      link.download = `${originalName}-signed.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      setMessage(
        "PDF signed successfully. Your signed PDF has been downloaded."
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to sign this PDF. The file may be encrypted or unsupported."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetTool() {
    setPdfFile(null);
    setPdfBytes(null);
    setPdfDocument(null);
    setPageNumber(1);
    setPageCount(0);
    setSignatureImage(null);
    setTypedName("");
    setMessage("");
    setError("");
    resetSignaturePosition();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    clearSignatureCanvas();
  }

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "10px 24px 60px",
      }}
    >
      <div
        style={{
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontWeight: "800",
            letterSpacing: "1px",
            opacity: 0.65,
          }}
        >
          SHORTCUTHUB PDF TOOLS
        </div>

        <h1
          style={{
            margin: "6px 0 8px",
            fontSize: "32px",
          }}
        >
          ✍️ Sign PDF
        </h1>

        <p
          style={{
            margin: 0,
            opacity: 0.72,
          }}
        >
          Add a drawn or typed signature to your PDF and
          download the signed document.
        </p>
      </div>

      {!pdfFile && (
        <div
          className="uploadBox"
          style={{
            padding: "40px",
            textAlign: "center",
            borderRadius: "18px",
            border: "2px dashed rgba(99,102,241,.35)",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              marginBottom: "12px",
            }}
          >
            📄
          </div>

          <h2 style={{ margin: "0 0 8px" }}>
            Upload your PDF
          </h2>

          <p
            style={{
              opacity: 0.7,
              marginBottom: "20px",
            }}
          >
            Your PDF stays in your browser while you sign it.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) =>
              loadPdf(event.target.files?.[0])
            }
            style={{ display: "none" }}
          />

          <button
            className="primary"
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "12px 22px",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontWeight: "800",
            }}
          >
            Choose PDF
          </button>
        </div>
      )}

      {pdfFile && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "20px",
              padding: "14px 16px",
              borderRadius: "14px",
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.12)",
            }}
          >
            <div>
              <b>{pdfFile.name}</b>

              <div
                style={{
                  fontSize: "13px",
                  opacity: 0.65,
                  marginTop: "3px",
                }}
              >
                {pageCount} page
                {pageCount === 1 ? "" : "s"}
              </div>
            </div>

            <button
              onClick={resetTool}
              style={{
                padding: "9px 14px",
                borderRadius: "9px",
                border: "1px solid rgba(255,255,255,.18)",
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
                fontWeight: "700",
              }}
            >
              Choose another PDF
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(280px, 360px) minmax(0, 1fr)",
              gap: "24px",
              alignItems: "start",
            }}
          >
            <div
              style={{
                padding: "20px",
                borderRadius: "18px",
                background: "rgba(255,255,255,.055)",
                border: "1px solid rgba(255,255,255,.12)",
              }}
            >
              <h3 style={{ marginTop: 0 }}>
                1. Create signature
              </h3>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "15px",
                }}
              >
                <button
                  onClick={() => {
                    setSignatureMode("draw");
                    setSignatureImage(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "9px",
                    borderRadius: "9px",
                    border:
                      signatureMode === "draw"
                        ? "2px solid #6366f1"
                        : "1px solid rgba(255,255,255,.18)",
                    background:
                      signatureMode === "draw"
                        ? "rgba(99,102,241,.18)"
                        : "transparent",
                    color: "inherit",
                    cursor: "pointer",
                    fontWeight: "700",
                  }}
                >
                  ✍️ Draw
                </button>

                <button
                  onClick={() => {
                    setSignatureMode("type");
                    setSignatureImage(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "9px",
                    borderRadius: "9px",
                    border:
                      signatureMode === "type"
                        ? "2px solid #6366f1"
                        : "1px solid rgba(255,255,255,.18)",
                    background:
                      signatureMode === "type"
                        ? "rgba(99,102,241,.18)"
                        : "transparent",
                    color: "inherit",
                    cursor: "pointer",
                    fontWeight: "700",
                  }}
                >
                  T Type
                </button>
              </div>

              {signatureMode === "draw" ? (
                <>
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: "12px",
                      padding: "8px",
                      marginBottom: "12px",
                    }}
                  >
                    <canvas
                      ref={signatureCanvasRef}
                      width={600}
                      height={220}
                      style={{
                        width: "100%",
                        height: "170px",
                        display: "block",
                        touchAction: "none",
                        cursor: "crosshair",
                      }}
                      onPointerDown={startDrawing}
                      onPointerMove={draw}
                      onPointerUp={stopDrawing}
                      onPointerLeave={stopDrawing}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    <button
                      onClick={clearSignatureCanvas}
                      style={{
                        flex: 1,
                        padding: "9px",
                        borderRadius: "9px",
                        border:
                          "1px solid rgba(255,255,255,.18)",
                        background: "transparent",
                        color: "inherit",
                        cursor: "pointer",
                      }}
                    >
                      Clear
                    </button>

                    <button
                      className="primary"
                      onClick={useDrawnSignature}
                      style={{
                        flex: 1,
                        padding: "9px",
                        borderRadius: "9px",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "800",
                      }}
                    >
                      Use Signature
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    value={typedName}
                    onChange={(event) =>
                      setTypedName(event.target.value)
                    }
                    placeholder="Type your name"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "12px",
                      borderRadius: "9px",
                      border:
                        "1px solid rgba(255,255,255,.18)",
                      background: "rgba(0,0,0,.15)",
                      color: "inherit",
                      outline: "none",
                      marginBottom: "12px",
                    }}
                  />

                  <button
                    className="primary"
                    onClick={createTypedSignature}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "9px",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "800",
                    }}
                  >
                    Create Signature
                  </button>
                </>
              )}

              <div style={{ marginTop: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontWeight: "700",
                    marginBottom: "8px",
                  }}
                >
                  Signature color
                </label>

                <input
                  type="color"
                  value={signatureColor}
                  onChange={(event) =>
                    setSignatureColor(event.target.value)
                  }
                  style={{
                    width: "100%",
                    height: "42px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                />
              </div>

              {signatureMode === "type" && (
                <div style={{ marginTop: "18px" }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "700",
                      marginBottom: "8px",
                    }}
                  >
                    Text size
                  </label>

                  <input
                    type="range"
                    min="16"
                    max="42"
                    value={signatureSize}
                    onChange={(event) =>
                      setSignatureSize(
                        Number(event.target.value)
                      )
                    }
                    style={{ width: "100%" }}
                  />
                </div>
              )}

              <hr
                style={{
                  margin: "24px 0",
                  border: 0,
                  borderTop:
                    "1px solid rgba(255,255,255,.12)",
                }}
              />

              <h3>2. Position signature</h3>

              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "700",
                }}
              >
                Size
              </label>

              <input
                type="range"
                min="100"
                max="350"
                value={signatureWidth}
                onChange={resizeSignature}
                style={{
                  width: "100%",
                }}
              />

              <div
                style={{
                  fontSize: "13px",
                  opacity: 0.65,
                  marginTop: "5px",
                }}
              >
                Drag the signature on the PDF preview.
              </div>

              <button
                onClick={resetSignaturePosition}
                style={{
                  width: "100%",
                  marginTop: "14px",
                  padding: "9px",
                  borderRadius: "9px",
                  border:
                    "1px solid rgba(255,255,255,.18)",
                  background: "transparent",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                Reset Position
              </button>

              <hr
                style={{
                  margin: "24px 0",
                  border: 0,
                  borderTop:
                    "1px solid rgba(255,255,255,.12)",
                }}
              />

              <h3>3. Apply</h3>

              <button
                className="primary"
                onClick={signPdf}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: loading
                    ? "wait"
                    : "pointer",
                  fontWeight: "900",
                  fontSize: "15px",
                  opacity: loading ? 0.65 : 1,
                }}
              >
                {loading
                  ? "Processing..."
                  : "✍️ Sign & Download PDF"}
              </button>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                }}
              >
                <h3 style={{ margin: 0 }}>
                  PDF Preview
                </h3>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <button
                    onClick={previousPage}
                    disabled={pageNumber <= 1}
                    style={{
                      padding: "7px 11px",
                      borderRadius: "8px",
                      border:
                        "1px solid rgba(255,255,255,.18)",
                      background: "transparent",
                      color: "inherit",
                      cursor:
                        pageNumber <= 1
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        pageNumber <= 1 ? 0.4 : 1,
                    }}
                  >
                    ←
                  </button>

                  <span
                    style={{
                      fontWeight: "800",
                      minWidth: "80px",
                      textAlign: "center",
                    }}
                  >
                    Page {pageNumber} / {pageCount}
                  </span>

                  <button
                    onClick={nextPage}
                    disabled={pageNumber >= pageCount}
                    style={{
                      padding: "7px 11px",
                      borderRadius: "8px",
                      border:
                        "1px solid rgba(255,255,255,.18)",
                      background: "transparent",
                      color: "inherit",
                      cursor:
                        pageNumber >= pageCount
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        pageNumber >= pageCount
                          ? 0.4
                          : 1,
                    }}
                  >
                    →
                  </button>
                </div>
              </div>

              <div
                ref={previewWrapRef}
                style={{
                  position: "relative",
                  display: "inline-block",
                  maxWidth: "100%",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow:
                    "0 18px 50px rgba(0,0,0,.30)",
                  background: "#fff",
                }}
              >
                <canvas
                  ref={previewCanvasRef}
                  style={{
                    display: "block",
                    maxWidth: "100%",
                    height: "auto",
                  }}
                />

                {signatureImage && (
                  <div
                    onPointerDown={startDragging}
                    style={{
                      position: "absolute",
                      left: signatureX,
                      top: signatureY,
                      width: signatureWidth,
                      height: signatureHeight,
                      cursor: dragging
                        ? "grabbing"
                        : "grab",
                      userSelect: "none",
                      touchAction: "none",
                      border:
                        "2px dashed rgba(99,102,241,.85)",
                      background:
                        "rgba(255,255,255,.04)",
                      boxSizing: "border-box",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={signatureImage}
                      alt="Signature preview"
                      draggable={false}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                )}
              </div>

              {!signatureImage && (
                <div
                  style={{
                    marginTop: "14px",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background:
                      "rgba(245,158,11,.10)",
                    border:
                      "1px solid rgba(245,158,11,.25)",
                    fontSize: "14px",
                  }}
                >
                  Create your signature on the left.
                  It will appear here so you can drag it
                  to the correct position.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {message && (
        <div
          style={{
            marginTop: "20px",
            padding: "13px 15px",
            borderRadius: "10px",
            background: "rgba(34,197,94,.10)",
            border:
              "1px solid rgba(34,197,94,.25)",
          }}
        >
          ✅ {message}
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "13px 15px",
            borderRadius: "10px",
            background: "rgba(239,68,68,.10)",
            border:
              "1px solid rgba(239,68,68,.25)",
          }}
        >
          ❌ {error}
        </div>
      )}

      {loading && (
        <div
          style={{
            marginTop: "15px",
            textAlign: "center",
            opacity: 0.7,
          }}
        >
          Processing PDF...
        </div>
      )}
    </div>
  );
}

export default SignPdf;