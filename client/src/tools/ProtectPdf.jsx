import React, { useState } from "react";

export default function ProtectPdf() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function handleProtect() {
    setError("");

    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 4) {
      setError("Password must contain at least 4 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(
      "PDF password protection needs the server-side PDF encryption function. The tool interface is ready."
    );
  }

  return (
    <div
      style={{
        maxWidth: "850px",
        margin: "0 auto",
        padding: "30px 20px",
      }}
    >
      <button
        onClick={() => window.history.back()}
        style={{
          marginBottom: "20px",
          padding: "10px 16px",
          borderRadius: "10px",
          border: "1px solid #ddd",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>

      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "35px",
          boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{ fontSize: "48px" }}>🔐</div>

          <h1 style={{ margin: "10px 0", fontSize: "30px" }}>
            Protect PDF
          </h1>

          <p style={{ color: "#666" }}>
            Add password protection to your PDF document.
          </p>
        </div>

        <label
          style={{
            display: "block",
            border: "2px dashed #bbb",
            borderRadius: "15px",
            padding: "35px",
            textAlign: "center",
            cursor: "pointer",
            marginBottom: "25px",
          }}
        >
          <input
            type="file"
            accept="application/pdf,.pdf"
            hidden
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setError("");
            }}
          />

          <div style={{ fontSize: "38px" }}>📄</div>

          <strong>
            {file ? file.name : "Click to select a PDF"}
          </strong>

          <div style={{ marginTop: "8px", color: "#777" }}>
            PDF files only
          </div>
        </label>

        {file && (
          <div
            style={{
              padding: "12px 15px",
              background: "#f5f7fb",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            Selected: <strong>{file.name}</strong>
          </div>
        )}

        <label
          style={{
            display: "block",
            fontWeight: "600",
            marginBottom: "8px",
          }}
        >
          Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            marginBottom: "18px",
            fontSize: "16px",
          }}
        />

        <label
          style={{
            display: "block",
            fontWeight: "600",
            marginBottom: "8px",
          }}
        >
          Confirm Password
        </label>

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            marginBottom: "20px",
            fontSize: "16px",
          }}
        />

        {error && (
          <div
            style={{
              padding: "12px",
              borderRadius: "10px",
              background: "#fff1f1",
              color: "#c62828",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleProtect}
          style={{
            width: "100%",
            padding: "15px",
            border: "none",
            borderRadius: "12px",
            background: "#111827",
            color: "#fff",
            fontSize: "17px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          🔐 Protect PDF
        </button>
      </div>
    </div>
  );
}