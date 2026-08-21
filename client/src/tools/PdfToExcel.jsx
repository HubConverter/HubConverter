import React, { useState } from "react";
import * as XLSX from "xlsx";
import * as pdfjsLib from "pdfjs-dist";

// PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function PdfToExcel() {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [converting, setConverting] = useState(false);

  const handleFile = (selectedFile) => {
    setError("");
    setRows([]);
    setProgress(0);
    setStatus("");

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please select a PDF file only.");
      return;
    }

    setFile(selectedFile);
  };

  const handleInputChange = (e) => {
    handleFile(e.target.files?.[0]);
  };

  const extractPdfData = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setError("");
    setRows([]);
    setConverting(true);
    setProgress(5);
    setStatus("Reading PDF...");

    try {
      const arrayBuffer = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
      }).promise;

      const allRows = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        setStatus(`Extracting page ${pageNumber} of ${pdf.numPages}...`);

        const page = await pdf.getPage(pageNumber);

        const textContent = await page.getTextContent();

        /*
         * PDF text items contain x/y positions.
         * We use their positions to reconstruct rows.
         */
        const items = textContent.items
          .filter((item) => item.str && item.str.trim())
          .map((item) => ({
            text: item.str.trim(),
            x: item.transform[4],
            y: item.transform[5],
            width: item.width || 0,
          }));

        if (!items.length) {
          continue;
        }

        // Group text items having approximately the same Y position.
        const groupedRows = [];

        items.forEach((item) => {
          let existingRow = groupedRows.find(
            (row) => Math.abs(row.y - item.y) < 5
          );

          if (!existingRow) {
            existingRow = {
              y: item.y,
              items: [],
            };

            groupedRows.push(existingRow);
          }

          existingRow.items.push(item);
        });

        // Sort rows from top to bottom.
        groupedRows.sort((a, b) => b.y - a.y);

        groupedRows.forEach((row) => {
          row.items.sort((a, b) => a.x - b.x);

          const values = row.items.map((item) => item.text);

          if (values.length > 0) {
            allRows.push(values);
          }
        });

        setProgress(
          Math.round((pageNumber / pdf.numPages) * 80)
        );
      }

      if (!allRows.length) {
        throw new Error(
          "No selectable text was found. Scanned/image PDFs are not supported."
        );
      }

      /*
       * Make all rows the same number of columns.
       */
      const maxColumns = Math.max(
        ...allRows.map((row) => row.length)
      );

      const normalizedRows = allRows.map((row) => {
        const newRow = [...row];

        while (newRow.length < maxColumns) {
          newRow.push("");
        }

        return newRow;
      });

      setRows(normalizedRows);
      setProgress(100);
      setStatus(
        `Done! ${normalizedRows.length} rows extracted.`
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to convert this PDF. Please try another text-based PDF."
      );

      setStatus("");
    } finally {
      setConverting(false);
    }
  };

  const downloadExcel = () => {
    if (!rows.length) {
      setError("There is no extracted data to download.");
      return;
    }

    try {
      const worksheet = XLSX.utils.aoa_to_sheet(rows);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "PDF Data"
      );

      // Automatically set column widths.
      const columnCount = Math.max(
        ...rows.map((row) => row.length)
      );

      worksheet["!cols"] = Array.from(
        { length: columnCount },
        (_, columnIndex) => {
          const longest = Math.max(
            ...rows.map((row) =>
              String(row[columnIndex] || "").length
            )
          );

          return {
            wch: Math.min(Math.max(longest + 2, 10), 40),
          };
        }
      );

      XLSX.writeFile(
        workbook,
        `ShortcutHub-PDF-to-Excel.xlsx`
      );
    } catch (err) {
      console.error(err);
      setError("Could not create the Excel file.");
    }
  };

  const clearFile = () => {
    setFile(null);
    setRows([]);
    setStatus("");
    setError("");
    setProgress(0);
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
      {/* Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "25px",
        }}
      >
        <div
          style={{
            fontSize: "42px",
            marginBottom: "8px",
          }}
        >
          📄 → 📊
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "30px",
            color: "#172554",
          }}
        >
          PDF to Excel
        </h1>

        <p
          style={{
            color: "#64748b",
            marginTop: "8px",
          }}
        >
          Convert text-based PDF tables into an editable Excel file.
        </p>
      </div>

      {/* Upload area */}
      {!file && (
        <label
          style={{
            display: "block",
            border: "2px dashed #6366f1",
            borderRadius: "18px",
            padding: "55px 25px",
            textAlign: "center",
            cursor: "pointer",
            background: "#f8faff",
          }}
        >
          <div
            style={{
              fontSize: "50px",
              marginBottom: "15px",
            }}
          >
            📄
          </div>

          <h3
            style={{
              margin: "0 0 8px",
              color: "#1e293b",
            }}
          >
            Drop your PDF here
          </h3>

          <p
            style={{
              margin: "0 0 20px",
              color: "#64748b",
            }}
          >
            or click to choose a PDF file
          </p>

          <span
            style={{
              display: "inline-block",
              padding: "12px 25px",
              borderRadius: "10px",
              background: "#4f46e5",
              color: "white",
              fontWeight: 600,
            }}
          >
            Choose PDF File
          </span>

          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleInputChange}
            style={{ display: "none" }}
          />
        </label>
      )}

      {/* Selected file */}
      {file && (
        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: "15px",
            padding: "18px",
            background: "white",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "15px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "10px",
                  background: "#fee2e2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "25px",
                }}
              >
                📄
              </div>

              <div>
                <strong>{file.name}</strong>

                <div
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    marginTop: "4px",
                  }}
                >
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>

            <button
              onClick={clearFile}
              disabled={converting}
              style={{
                border: "none",
                background: "#f1f5f9",
                borderRadius: "8px",
                padding: "8px 12px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Warning */}
      <div
        style={{
          marginTop: "18px",
          padding: "15px 18px",
          borderRadius: "12px",
          background: "#fff7ed",
          border: "1px solid #fed7aa",
          color: "#9a3412",
          fontSize: "14px",
        }}
      >
        ⚠️ <strong>Important:</strong> This tool supports
        normal text/table PDFs only. Scanned or image-only PDFs
        are not supported because OCR is not included.
      </div>

      {/* Convert button */}
      {file && !rows.length && (
        <button
          onClick={extractPdfData}
          disabled={converting}
          style={{
            width: "100%",
            marginTop: "20px",
            padding: "15px",
            border: "none",
            borderRadius: "12px",
            background: converting ? "#94a3b8" : "#16a34a",
            color: "white",
            fontSize: "17px",
            fontWeight: 700,
            cursor: converting ? "not-allowed" : "pointer",
          }}
        >
          {converting
            ? "Converting..."
            : "Convert PDF to Excel"}
        </button>
      )}

      {/* Progress */}
      {converting && (
        <div
          style={{
            marginTop: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "7px",
              fontSize: "14px",
            }}
          >
            <span>{status}</span>
            <strong>{progress}%</strong>
          </div>

          <div
            style={{
              height: "9px",
              background: "#e2e8f0",
              borderRadius: "20px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#16a34a",
                transition: "width .3s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            borderRadius: "12px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* Success */}
      {rows.length > 0 && (
        <div style={{ marginTop: "25px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "15px",
              marginBottom: "15px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#172554",
                }}
              >
                Preview
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                {rows.length} rows extracted
              </p>
            </div>

            <button
              onClick={downloadExcel}
              style={{
                border: "none",
                borderRadius: "10px",
                padding: "13px 22px",
                background: "#16a34a",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              📊 Download Excel
            </button>
          </div>

          {/* Table preview */}
          <div
            style={{
              overflow: "auto",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              background: "white",
              maxHeight: "500px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "600px",
              }}
            >
              <tbody>
                {rows.slice(0, 100).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        style={{
                          borderBottom:
                            "1px solid #e2e8f0",
                          borderRight:
                            "1px solid #e2e8f0",
                          padding: "10px 12px",
                          fontSize: "14px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length > 100 && (
            <p
              style={{
                color: "#64748b",
                fontSize: "13px",
                marginTop: "8px",
              }}
            >
              Preview shows the first 100 rows. The complete
              data will be included in the Excel file.
            </p>
          )}

          {/* Bottom buttons */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "20px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={downloadExcel}
              style={{
                flex: 1,
                minWidth: "200px",
                padding: "14px",
                border: "none",
                borderRadius: "10px",
                background: "#16a34a",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ⬇️ Download Excel
            </button>

            <button
              onClick={clearFile}
              style={{
                flex: 1,
                minWidth: "200px",
                padding: "14px",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                background: "white",
                color: "#334155",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              🔄 Convert Another PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}