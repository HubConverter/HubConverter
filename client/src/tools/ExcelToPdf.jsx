import React, { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExcelToPdf() {
  const [file, setFile] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleFile(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const extension = selectedFile.name.split(".").pop().toLowerCase();

    if (!["xlsx", "xls"].includes(extension)) {
      setMessage("Please select an Excel file (.xlsx or .xls).");
      return;
    }

    setFile(selectedFile);
    setMessage("");
    setRows([]);
    setSheets([]);
    setSelectedSheet("");

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);

        const workbook = XLSX.read(data, {
          type: "array",
        });

        const sheetNames = workbook.SheetNames;

        if (!sheetNames.length) {
          setMessage("No worksheet found in this Excel file.");
          return;
        }

        setSheets(sheetNames);
        setSelectedSheet(sheetNames[0]);

        loadSheet(workbook, sheetNames[0]);
      } catch (error) {
        console.error(error);
        setMessage("Unable to read this Excel file.");
      }
    };

    reader.readAsArrayBuffer(selectedFile);
  }

  function loadSheet(workbook, sheetName) {
    try {
      const worksheet = workbook.Sheets[sheetName];

      const data = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
        raw: false,
      });

      const cleanedRows = data.filter((row) =>
        row.some((cell) => String(cell).trim() !== "")
      );

      setRows(cleanedRows);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load this worksheet.");
    }
  }

  async function changeSheet(event) {
    const sheetName = event.target.value;

    setSelectedSheet(sheetName);

    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();

      const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
        type: "array",
      });

      loadSheet(workbook, sheetName);
    } catch (error) {
      console.error(error);
      setMessage("Unable to change worksheet.");
    }
  }

  function convertToPdf() {
    if (!file || !rows.length) {
      setMessage("Please select an Excel file first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();

      pdf.setFontSize(18);
      pdf.text("Excel to PDF", pageWidth / 2, 15, {
        align: "center",
      });

      pdf.setFontSize(9);
      pdf.text(
        `${file.name}  •  ${selectedSheet}`,
        pageWidth / 2,
        22,
        {
          align: "center",
        }
      );

      const tableHead = rows.length > 0 ? [rows[0]] : [];
      const tableBody = rows.length > 1 ? rows.slice(1) : [];

      autoTable(pdf, {
        head: tableHead,
        body: tableBody,

        startY: 28,

        theme: "grid",

        styles: {
          fontSize: 7,
          cellPadding: 2,
          overflow: "linebreak",
          valign: "middle",
        },

        headStyles: {
          fontSize: 7,
          fontStyle: "bold",
        },

        margin: {
          top: 28,
          right: 8,
          bottom: 10,
          left: 8,
        },

        tableWidth: "auto",

        didDrawPage: (data) => {
          const pageNumber = pdf.internal.getNumberOfPages();

          pdf.setFontSize(7);

          pdf.text(
            `ShortcutHub • Page ${pageNumber}`,
            pageWidth / 2,
            pdf.internal.pageSize.getHeight() - 5,
            {
              align: "center",
            }
          );
        },
      });

      const originalName = file.name.replace(/\.[^/.]+$/, "");

      pdf.save(`ShortcutHub-${originalName}.pdf`);

      setMessage("Excel successfully converted to PDF.");
    } catch (error) {
      console.error(error);
      setMessage("PDF conversion failed. Please try another Excel file.");
    } finally {
      setLoading(false);
    }
  }

  function clearFile() {
    setFile(null);
    setSheets([]);
    setSelectedSheet("");
    setRows([]);
    setMessage("");
  }

  return (
    <section
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "25px 24px 50px",
      }}
    >
      <div
        style={{
          maxWidth: "850px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.92)",
            borderRadius: "22px",
            padding: "30px",
            boxShadow: "0 18px 50px rgba(15,23,42,0.12)",
            border: "1px solid rgba(148,163,184,0.25)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "52px",
                marginBottom: "10px",
              }}
            >
              📊
            </div>

            <h1
              style={{
                margin: "0 0 8px",
                fontSize: "30px",
                color: "#111827",
              }}
            >
              Excel to PDF
            </h1>

            <p
              style={{
                margin: "0 0 25px",
                color: "#64748b",
              }}
            >
              Convert your Excel spreadsheet into a PDF document.
            </p>
          </div>

          {!file && (
            <label
              style={{
                display: "block",
                border: "2px dashed #94a3b8",
                borderRadius: "18px",
                padding: "45px 25px",
                textAlign: "center",
                cursor: "pointer",
                background: "#f8fafc",
              }}
            >
              <div
                style={{
                  fontSize: "38px",
                  marginBottom: "10px",
                }}
              >
                📁
              </div>

              <strong
                style={{
                  display: "block",
                  fontSize: "18px",
                  color: "#111827",
                  marginBottom: "7px",
                }}
              >
                Select Excel File
              </strong>

              <span
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Supports .xlsx and .xls files
              </span>

              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFile}
                style={{ display: "none" }}
              />
            </label>
          )}

          {file && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "15px",
                  padding: "15px",
                  borderRadius: "14px",
                  background: "#f1f5f9",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <strong
                    style={{
                      display: "block",
                      color: "#111827",
                      wordBreak: "break-word",
                    }}
                  >
                    📊 {file.name}
                  </strong>

                  <small
                    style={{
                      color: "#64748b",
                    }}
                  >
                    {(file.size / 1024).toFixed(1)} KB
                  </small>
                </div>

                <button
                  onClick={clearFile}
                  style={{
                    border: "none",
                    background: "#fee2e2",
                    color: "#b91c1c",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "700",
                  }}
                >
                  Remove
                </button>
              </div>

              {sheets.length > 1 && (
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    Select Worksheet
                  </label>

                  <select
                    value={selectedSheet}
                    onChange={changeSheet}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      background: "white",
                      fontSize: "15px",
                    }}
                  >
                    {sheets.map((sheet) => (
                      <option key={sheet} value={sheet}>
                        {sheet}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {rows.length > 0 && (
                <div
                  style={{
                    marginBottom: "22px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                    }}
                  >
                    <strong
                      style={{
                        color: "#111827",
                      }}
                    >
                      Preview
                    </strong>

                    <small
                      style={{
                        color: "#64748b",
                      }}
                    >
                      {rows.length} rows
                    </small>
                  </div>

                  <div
                    style={{
                      overflowX: "auto",
                      maxHeight: "350px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        minWidth: "600px",
                        background: "white",
                      }}
                    >
                      <tbody>
                        {rows.slice(0, 30).map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                style={{
                                  border: "1px solid #e2e8f0",
                                  padding: "8px",
                                  fontSize: "12px",
                                  fontWeight:
                                    rowIndex === 0 ? "700" : "400",
                                  background:
                                    rowIndex === 0
                                      ? "#f1f5f9"
                                      : "white",
                                  color: "#334155",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {rows.length > 30 && (
                    <small
                      style={{
                        display: "block",
                        marginTop: "7px",
                        color: "#64748b",
                      }}
                    >
                      Preview shows the first 30 rows. The PDF will contain
                      all rows.
                    </small>
                  )}
                </div>
              )}

              <button
                onClick={convertToPdf}
                disabled={loading || !rows.length}
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: "12px",
                  padding: "15px",
                  background:
                    loading || !rows.length
                      ? "#94a3b8"
                      : "#111827",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "800",
                  cursor:
                    loading || !rows.length
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {loading
                  ? "Creating PDF..."
                  : "Convert Excel to PDF →"}
              </button>
            </div>
          )}

          {message && (
            <div
              style={{
                marginTop: "18px",
                padding: "12px 15px",
                borderRadius: "10px",
                background: message.includes("successfully")
                  ? "#dcfce7"
                  : "#fee2e2",
                color: message.includes("successfully")
                  ? "#166534"
                  : "#991b1b",
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
