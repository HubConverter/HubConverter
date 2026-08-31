import React, { useRef, useState, useEffect } from "react";

export default function Background({ onImageSelect }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    // Maximum 10 MB
    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10 MB.");
      return;
    }

    if (onImageSelect) {
      onImageSelect(file);
    }
  };

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFile(file);
    }

    // Allows selecting the same file again
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Paste image from clipboard
  useEffect(() => {
    const handlePaste = (event) => {
      const items = event.clipboardData?.items;

      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();

          if (file) {
            handleFile(file);
          }

          break;
        }
      }
    };

    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, []);

  return (
    <div className="background-upload-page">
      <div
        className={`background-upload-card ${
          isDragging ? "background-upload-dragging" : ""
        }`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Upload Icon */}
        <div className="upload-cloud-icon">
          <svg
            width="78"
            height="78"
            viewBox="0 0 78 78"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M25.5 57.5H55.5C64.6127 57.5 72 50.1127 72 41C72 32.4327 65.4717 25.392 57.1114 24.5765C54.5455 14.3218 45.2996 6.5 34.25 6.5C21.2263 6.5 10.6667 17.0596 10.6667 30.0833C10.6667 30.6098 10.684 31.1322 10.7181 31.6498C4.75818 34.133 0.583374 40.0035 0.583374 46.8333C0.583374 55.6759 7.74078 62.8333 16.5834 62.8333"
              stroke="#8FA6BA"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M39 67.1667V35.6667"
              stroke="#8FA6BA"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M27.3334 47.3333L39 35.6667L50.6667 47.3333"
              stroke="#8FA6BA"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Select Image Button */}
        <button
          type="button"
          className="select-image-button"
          onClick={openFilePicker}
        >
          Select Image
        </button>

        {/* Hidden Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleInputChange}
          style={{ display: "none" }}
        />

        {/* Drag Text */}
        <div className="drop-text">
          {isDragging ? "Drop your image here" : "or drop a file,"}
        </div>

        {/* Paste / URL */}
        <button
          type="button"
          className="paste-url-button"
          onClick={() => {
            alert(
              "You can paste an image directly using Ctrl + V."
            );
          }}
        >
          paste image or URL
        </button>

        {/* Supported formats */}
        <div className="supported-text">
          JPG, PNG, WEBP • Max 10 MB
        </div>

        {/* Dragging message */}
        {isDragging && (
          <div className="drag-overlay-text">
            Release to upload
          </div>
        )}
      </div>

      <style>{`
        .background-upload-page {
          width: 100%;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          box-sizing: border-box;

          background:
            radial-gradient(
              circle at 20% 20%,
              rgba(255,255,255,0.95),
              rgba(235,240,245,0.8) 35%,
              transparent 65%
            ),
            radial-gradient(
              circle at 85% 75%,
              rgba(255,255,255,0.9),
              rgba(224,231,238,0.7) 40%,
              transparent 70%
            ),
            linear-gradient(
              135deg,
              #eef3f7 0%,
              #ffffff 45%,
              #e9eef2 100%
            );

          position: relative;
          overflow: hidden;
        }

        .background-upload-page::before {
          content: "";
          position: absolute;
          width: 650px;
          height: 650px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
          filter: blur(80px);
          top: -250px;
          left: -180px;
          pointer-events: none;
        }

        .background-upload-page::after {
          content: "";
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: rgba(210,220,230,0.35);
          filter: blur(100px);
          right: -250px;
          bottom: -250px;
          pointer-events: none;
        }

        .background-upload-card {
         width: min(580px, 82vw);
height: min(390px, 65vh);

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          padding: 55px 45px;

          box-sizing: border-box;

          position: relative;
          z-index: 2;

          border-radius: 28px;

          background: rgba(255,255,255,0.64);

          border: 1px solid rgba(255,255,255,0.9);

          box-shadow:
            0 25px 70px rgba(60,75,90,0.16),
            inset 0 1px 0 rgba(255,255,255,0.95);

          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);

          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .background-upload-card::before {
          content: "";
          position: absolute;
          inset: 28px;

          border: 2px dashed rgba(142,158,174,0.42);

          border-radius: 25px;

          pointer-events: none;
        }

        .background-upload-card:hover {
          box-shadow:
            0 30px 80px rgba(60,75,90,0.19),
            inset 0 1px 0 rgba(255,255,255,1);
        }

        .background-upload-dragging {
          transform: scale(1.015);

          border-color: #4c91ff;

          box-shadow:
            0 30px 90px rgba(38,115,220,0.22),
            inset 0 1px 0 rgba(255,255,255,1);
        }

        .background-upload-dragging::before {
          border-color: #4285f4;
          background: rgba(66,133,244,0.035);
        }

        .upload-cloud-icon {
          position: relative;
          z-index: 3;

          margin-bottom: 28px;

          display: flex;
          align-items: center;
          justify-content: center;

          filter: drop-shadow(
            0 8px 15px rgba(100,130,155,0.16)
          );
        }

        .select-image-button {
          position: relative;
          z-index: 3;

          border: none;
          outline: none;

          min-width: 400px;

          padding: 19px 48px;

          border-radius: 18px;

          background:
            linear-gradient(
              180deg,
              #8795a3 0%,
              #65727e 100%
            );

          color: white;

          font-size: 27px;
          font-weight: 700;

          letter-spacing: -0.3px;

          cursor: pointer;

          box-shadow:
            0 12px 28px rgba(80,105,125,0.3),
            inset 0 1px 0 rgba(255,255,255,0.3);

          border: 2px solid rgba(65,75,85,0.55);

          text-shadow:
            0 2px 2px rgba(0,0,0,0.35);

          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            filter 0.18s ease;
        }

        .select-image-button:hover {
          transform: translateY(-2px);

          filter: brightness(1.06);

          box-shadow:
            0 16px 34px rgba(70,100,125,0.35),
            inset 0 1px 0 rgba(255,255,255,0.35);
        }

        .select-image-button:active {
          transform: translateY(1px);
        }

        .drop-text {
          position: relative;
          z-index: 3;

          margin-top: 35px;

          font-size: 39px;

          line-height: 1.2;

          color: #50687f;

          font-weight: 500;

          text-align: center;
        }

        .paste-url-button {
          position: relative;
          z-index: 3;

          margin-top: 23px;

          padding: 0;

          border: none;
          background: transparent;

          color: #7197b4;

          font-size: 25px;

          text-decoration: underline;

          text-underline-offset: 5px;

          cursor: pointer;
        }

        .paste-url-button:hover {
          color: #477895;
        }

        .supported-text {
          position: relative;
          z-index: 3;

          margin-top: 24px;

          font-size: 14px;

          color: #8a9aaa;

          letter-spacing: 0.3px;
        }

        .drag-overlay-text {
          position: absolute;
          z-index: 5;

          bottom: 42px;

          padding: 9px 20px;

          border-radius: 999px;

          background: rgba(66,133,244,0.92);

          color: white;

          font-size: 15px;

          font-weight: 600;

          box-shadow:
            0 8px 20px rgba(66,133,244,0.25);
        }

        @media (max-width: 700px) {
          .background-upload-page {
            min-height: 100dvh;
            padding: 18px;
          }

          .background-upload-card {
            width: 100%;
            min-height: 470px;
            padding: 35px 20px;
            border-radius: 22px;
          }

          .background-upload-card::before {
            inset: 18px;
            border-radius: 18px;
          }

          .upload-cloud-icon svg {
            width: 60px;
            height: 60px;
          }

          .select-image-button {
            min-width: 0;
            width: min(340px, 78vw);
            padding: 16px 25px;
            font-size: 23px;
          }

          .drop-text {
            margin-top: 28px;
            font-size: 29px;
          }

          .paste-url-button {
            margin-top: 18px;
            font-size: 20px;
          }
        }

        @media (max-width: 420px) {
          .background-upload-card {
            min-height: 420px;
            padding: 28px 15px;
          }

          .drop-text {
            font-size: 25px;
          }

          .select-image-button {
            font-size: 20px;
          }

          .paste-url-button {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
}
