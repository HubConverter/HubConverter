import React, { useState } from "react";

export default function UnlockPdf() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFileChange(e) {
    const selectedFile = e.target.files?.[0] || null;

    setFile(selectedFile);
    setError("");
    setSuccess("");
  }

  async function handleUnlock() {
    setError("");
    setSuccess("");

    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    if (!password) {
      setError("Please enter the PDF password.");
      return;
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a valid PDF file.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", password);

      const response = await fetch("/api/unlock-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let message = "Unable to unlock the PDF.";

        try {
          const data = await response.json();

          if (data && data.error) {
            message = data.error;
          }
        } catch {
          // Ignore JSON parsing errors.
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      if (!blob || blob.size === 0) {
        throw new Error("The unlocked PDF is empty.");
      }

      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;

      const originalName = file.name.replace(/\.pdf$/i, "");

      link.download = originalName + "-unlocked.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);

      setSuccess(
        "PDF unlocked successfully. Your download has started."
      );
    } catch (err) {
      setError(
        err?.message ||
          "Something went wrong while unlocking the PDF."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="toolPage">
      <div className="toolBox">

        <button
          onClick={() => window.history.back()}
          style={{
            display: "block",
            marginBottom: "20px",
            padding: "10px 16px",
            borderRadius: "10px",
            border: "1px solid rgba(100,180,255,0.28)",
            background: "rgba(20,35,70,0.70)",
            color: "#ffffff",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <div style={{ fontSize: "48px" }}>
            🔓
          </div>

          <h1>Unlock PDF</h1>

          <p>
            Remove password protection from your PDF document.
          </p>
        </div>

        <label
          className="uploadBox"
          style={{
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          <input
            type="file"
            accept="application/pdf,.pdf"
            hidden
            disabled={loading}
            onChange={handleFileChange}
          />

          <div className="uploadIcon">
            📄
          </div>

          <strong>
            {file
              ? file.name
              : "Click to select a PDF"}
          </strong>

          <span>
            PDF files only
          </span>
        </label>

        {file && (
          <div
            className="protect-pdf-selected"
            style={{
              width: "min(700px, 100%)",
              margin: "20px auto",
              padding: "14px 16px",
              boxSizing: "border-box",
              borderRadius: "10px",
              background: "#f5f7fb",
              border: "1px solid #e5e7eb",
              color: "#15213b",
              textAlign: "left",
            }}
          >
            <span>
              Selected:{" "}
            </span>

            <strong>
              {file.name}
            </strong>
          </div>
        )}

        <div
          style={{
            width: "min(700px, 100%)",
            margin: "25px auto 0",
            textAlign: "left",
          }}
        >
          <label
            style={{
              display: "block",
              fontWeight: "700",
              marginBottom: "8px",
            }}
          >
            PDF Password
          </label>

          <input
            type="password"
            value={password}
            disabled={loading}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
              setSuccess("");
            }}
            placeholder="Enter the PDF password"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px",
              borderRadius: "10px",
              border:
                "1px solid rgba(100,180,255,0.28)",
              background:
                "rgba(10,20,50,0.65)",
              color: "#ffffff",
              outline: "none",
              fontSize: "16px",
            }}
          />
        </div>

        {error && (
          <div
            style={{
              width: "min(700px, 100%)",
              margin: "20px auto",
              padding: "12px 15px",
              boxSizing: "border-box",
              borderRadius: "10px",
              background:
                "rgba(127,29,29,0.18)",
              border:
                "1px solid rgba(248,113,113,0.35)",
              color: "#ef4444",
              textAlign: "left",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              width: "min(700px, 100%)",
              margin: "20px auto",
              padding: "12px 15px",
              boxSizing: "border-box",
              borderRadius: "10px",
              background:
                "rgba(22,163,74,0.15)",
              border:
                "1px solid rgba(74,222,128,0.35)",
              color: "#22c55e",
              textAlign: "left",
            }}
          >
            {success}
          </div>
        )}

        <button
          className="convertButton"
          onClick={handleUnlock}
          disabled={
            loading ||
            !file ||
            !password
          }
        >
          {loading
            ? "🔓 Unlocking PDF..."
            : "🔓 Unlock PDF"}
        </button>

        <div className="toolNote">
          Enter the correct password to remove
          password protection from the PDF.
        </div>

      </div>
    </div>
  );
}
