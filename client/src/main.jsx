import JpgToPdf from "./tools/JpgToPdf.jsx";
import ExcelToPdf from "./tools/ExcelToPdf.jsx";
import WordToPdf from "./tools/WordToPdf.jsx";
import PDFToJpg from "./tools/PDFToJpg.jsx";
import PdfToExcel from "./tools/PdfToExcel.jsx";
import MergePdf from "./tools/MergePdf.jsx";
import ExtractPdf from "./tools/ExtractPdf.jsx";
import CompressPdf from "./tools/CompressPdf.jsx";
import PdfToWord from "./tools/PdfToWord.jsx";
import PDFToPowerPoint from "./tools/PDFToPowerPoint.jsx";
import RotatePdf from "./tools/RotatePdf.jsx";
import WatermarkPdf from "./tools/WatermarkPdf.jsx";
import ProtectPdf from "./tools/ProtectPdf.jsx";
import UnlockPdf from "./tools/UnlockPdf.jsx";
import SignPdf from "./tools/SignPdf.jsx";
import DeletePdfPages from "./tools/DeletePdfPages.jsx";
import EditPdf from "./tools/EditPdf.jsx";



import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const API = "/api";

const token = () => localStorage.getItem("sh_token");

async function api(path, options = {}) {
  const response = await fetch(API + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token() ? { Authorization: "Bearer " + token() } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw Error(data.error || "Request failed");
  }

  return data;
}

const fallback = [
  ["Excel", "📊"],
  ["Word", "📄"],
  ["PowerPoint", "📽️"],
  ["Tally", "▣"],
  ["BUSY", "B"],
  ["Photoshop", "Ps"],
  ["Windows", "⊞"],
  ["Chrome", "🌐"],
];

const themes = [
  { id: "neon", label: "Neon", icon: "✦" },
  { id: "ocean", label: "Ocean", icon: "🌊" },
  { id: "sunset", label: "Sunset", icon: "☀" },
  { id: "midnight", label: "Midnight", icon: "☾" },
  { id: "light", label: "Light", icon: "☀︎" },
];

function App() {
  const [view, setView] = useState("home");
  const [selectedSoftware, setSelectedSoftware] = useState("");
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [soft, setSoft] = useState([]);
  const [prog, setProg] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recent, setRecent] = useState([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("sh_theme") || "neon");
  const [showThemes, setShowThemes] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    (async () => {
      const allShortcuts = await api("/shortcuts");
      setAllItems(allShortcuts);
      setItems(allShortcuts);
      setSoft(await api("/software"));

      try {
        setProg(JSON.parse(localStorage.getItem("sh_progress") || "[]"));
        setFavorites(JSON.parse(localStorage.getItem("sh_favorites") || "[]"));
      } catch {
        localStorage.removeItem("sh_progress");
        localStorage.removeItem("sh_favorites");
      }
    })();
  }, []);

  useEffect(() => {
    document.body.className = `theme-${theme}`;
    localStorage.setItem("sh_theme", theme);
  }, [theme]);

  function notify(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  }

  async function search(nextQ = q, nextSoftware = filter) {
    setItems(
      await api(
  "/shortcuts?" +
    new URLSearchParams({
            q: nextQ,
            software: nextSoftware,
          })
      )
    );
  }

  function openSoftware(software) {
    const selected = String(software || "").trim();
    setFilter(selected);
    setQ("");

    const normalized = selected.toLowerCase();

    const data = allItems.filter((shortcut) => {
      const name = String(shortcut.software || "").trim().toLowerCase();
      return name === normalized;
    });

    setItems(data);
    setSelectedSoftware(selected);
    setView("software");
  }

  function learn(id) {
    if (prog.includes(id)) return notify("Already mastered");

    const next = [...prog, id];
    setProg(next);
    localStorage.setItem("sh_progress", JSON.stringify(next));
    notify("Shortcut mastered");
  }

  function toggleFavorite(id) {
    const saved = !favorites.includes(id);
    const next = saved
      ? [...favorites, id]
      : favorites.filter((item) => item !== id);
    setFavorites(next);
    localStorage.setItem("sh_favorites", JSON.stringify(next));
    notify(saved ? "Saved to favorites" : "Removed from favorites");
  }

  return (
    <>
      <header>
        <div
          className="brand"
          onClick={() => setView("home")}
        >
          ⌨ <b>Shortcut<span>Hub</span></b>
          <i>FINAL 3.0</i>
        </div>

        <nav className="nav">
  <button
    className={view === "tools" ? "active" : ""}
    onClick={() => setView("tools")}
  >
    🔄 PDF Converter Tools
  </button>
<button
  className={view === "jpg-tools" ? "active" : ""}
  onClick={() => setView("jpg-tools")}
>
  🖼️ JPG Tools
</button>
  <button
    className={view === "converter" ? "active" : ""}
    onClick={() => setView("converter")}
  >
    
  </button>
</nav>

        <div className="actions">
          <div className="themePicker">
            <button
              className="themeToggle"
              onClick={() => setShowThemes((current) => !current)}
              aria-label="Choose a color theme"
              aria-expanded={showThemes}
              title="Choose a color theme"
            >
              ◐
            </button>

            {showThemes && (
              <div className="themeMenu" role="menu" aria-label="Color themes">
                <b>Choose a theme</b>
                {themes.map((item) => (
                  <button
                    key={item.id}
                    className={theme === item.id ? "themeChoice active" : "themeChoice"}
                    onClick={() => {
                      setTheme(item.id);
                      setShowThemes(false);
                    }}
                    role="menuitem"
                  >
                    <span>{item.icon}</span> {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {view === "home" && (
        <Home
          setView={setView}
          q={q}
          setQ={setQ}
          search={search}
          soft={soft}
          openSoftware={openSoftware}
          setFilter={setFilter}
        />
      )}

      {view === "tools" && <Tools />}

      {view === "software" && (
        <SoftwarePage
          software={selectedSoftware}
          items={items}
          learn={() => setView("learn")}
          back={() => setView("home")}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      )}

      {view === "learn" && (
      <Learn items={items} />
      )}

      {view === "quiz" && (
        <Quiz items={items} />
      )}

      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}

      <footer>
        ShortcutHub V3.0 Final · Learn faster. Work smarter.
      </footer>
    </>
  );
}

/* =========================
   SOFTWARE SHORTCUT PAGE
========================= */

function SoftwarePage({ software, items, learn, back, favorites, toggleFavorite }) {
  return (
    <section className="wrap">
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <button
          onClick={back}
          style={{
            border: "none",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "700",
            padding: "10px 0",
            marginBottom: "18px",
          }}
        >
          ← Back to Apps
        </button>

        <div className="sectionHead">
          <div>
            <small>SHORTCUTHUB</small>
            <h2>{software} Shortcuts</h2>
          </div>
          <span>{items.length} shortcuts</span>
        </div>

        <div style={{ display: "flex", gap: "12px", margin: "20px 0 28px", flexWrap: "wrap" }}>
          <button className="primary" onClick={learn}>Learn {software} →</button>
        </div>

        {items.length === 0 ? (
          <div className="shortcut" style={{ padding: "28px" }}>
            <h3>No shortcuts found for {software}</h3>
            <p>Please add shortcuts for this software in your database.</p>
          </div>
        ) : (
          <div className="cards">
            {items.map((s) => (
              <article className="shortcut" key={s.id}>
                <div className="shortcutTop">
                  <span className="appIcon">{s.icon}</span>
                  <div>
                    <b>{s.software}</b>
                    <small>{s.category} · {s.level}</small>
                  </div>
                  <button
                    className={favorites.includes(s.id) ? "heart on" : "heart"}
                    onClick={() => toggleFavorite(s.id)}
                    aria-label={favorites.includes(s.id) ? "Remove from favorites" : "Save to favorites"}
                    title={favorites.includes(s.id) ? "Remove from favorites" : "Save to favorites"}
                  >
                    {favorites.includes(s.id) ? "♥" : "♡"}
                  </button>
                </div>
                <div className="keys">
                  {String(s.keys || "").split("+").map((k, i) => (
                    <kbd key={i}>{k}</kbd>
                  ))}
                </div>
                <h3>{s.action}</h3>
                <p>{s.example}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================
   HOME
========================= */

function Home({
  setView,
  q,
  setQ,
  search,
  soft,
  openSoftware,
  setFilter,
}) {
  const appList = [
    ...fallback.map(([software, icon]) =>
      soft.find(
        (app) => String(app.software).toLowerCase() === software.toLowerCase()
      ) || { software, icon, count: 0 }
    ),
    ...soft.filter(
      (app) =>
        !fallback.some(
          ([software]) => software.toLowerCase() === String(app.software).toLowerCase()
        )
    ),
  ];

  return (
    <>
      <section className="hero">
        <div className="eyebrow">
          THE COMPLETE SHORTCUT PLATFORM
        </div>

        <h1>
          Every shortcut.
          <br />
          <em>One place.</em>
        </h1>

        <p>
          Search, learn, practice and master shortcuts
          for work, study and everyday computing.
        </p>

        <div className="heroSearch">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setFilter("");
                setFilter("");
                 search(q, "");
              }
            }}
            placeholder='Try “Ctrl+C”, “Excel”, “Save”...'
          />

          <button
            className="primary"
            onClick={() => {
              setFilter("");
              setView("learn");
              search(q, "");
            }}
          >
            Search
          </button>
        </div>

        <div className="quick">
          {["save", "copy", "print", "undo", "new tab"].map(
            (item) => (
              <button
                key={item}
                onClick={() => {
                  setQ(item);
                  setView("learn");
                  search(item, "");
                }}
              >
                {item}
              </button>
            )
          )}
        </div>
      </section>

      <section className="wrap">
        <div className="sectionHead">
          <div>
            <small>EXPLORE</small>
            <h2>Choose an app</h2>
          </div>

          <span>
            {soft.reduce(
              (total, item) => total + item.count,
              0
            )}
            + shortcuts
          </span>
        </div>

        <div className="apps">
          {appList.map(
            (app) => (
              <button
                className="app"
                key={app.software || app[0]}
                onClick={() =>
                 openSoftware(app.software || app.name || app[0])
                }
              >
                <b>{app.icon || app[1]}</b>

                <strong>
                  {app.software || app[0]}
                </strong>

                <small>
                  {app.count || "Ready"} shortcuts
                </small>
              </button>
            )
          )}
        </div>

        <div className="featureGrid">
          <article>
            ⚡
            <b>Learn fast</b>
            <p>
              Focused Learn Mode helps you build
              muscle memory.
            </p>
          </article>

          <article>
            🏆
            <b>Earn XP</b>
            <p>
              Master shortcuts, build streaks and
              unlock badges.
            </p>
          </article>

          <article>
            ☁️
            <b>Sync your progress</b>
            <p>
              Your learning data is stored in your
              account.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}

/* =========================
   TOOLS
========================= */

function Tools() {
  const [selectedTool, setSelectedTool] = useState(null);

  // =========================
  // TOOL PAGES
  // =========================

  if (selectedTool === "jpg-to-pdf") {
    return (
      <div>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "20px 24px 0",
          }}
        >
          <button
            onClick={() => setSelectedTool(null)}
            style={{
              border: "none",
              background: "transparent",
              color: "inherit",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              padding: "10px 0",
            }}
          >
            ← Back to Tools
          </button>
        </div>

        <JpgToPdf />
      </div>
    );
  }
  if (selectedTool === "pdf-to-excel") {
  return (
    <div>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 24px 0",
        }}
      >
        <button
          onClick={() => setSelectedTool(null)}
          style={{
            border: "none",
            background: "transparent",
            color: "inherit",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            padding: "10px 0",
          }}
        >
          ← Back to Tools
        </button>
      </div>

      <PdfToExcel />
    </div>
  );
}

  if (selectedTool === "pdf-to-jpg") {
    return (
      <div>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "20px 24px 0",
          }}
        >
          <button
            onClick={() => setSelectedTool(null)}
            style={{
              border: "none",
              background: "transparent",
              color: "inherit",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              padding: "10px 0",
            }}
          >
            ← Back to Tools
          </button>
        </div>

        <PDFToJpg />
      </div>
    );
  }

  if (selectedTool === "excel-to-pdf") {
    return (
      <div>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "20px 24px 0",
          }}
        >
          <button
            onClick={() => setSelectedTool(null)}
            style={{
              border: "none",
              background: "transparent",
              color: "inherit",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              padding: "10px 0",
            }}
          >
            ← Back to Tools
          </button>
        </div>

        <ExcelToPdf />
      </div>
    );
  }

  if (selectedTool === "word-to-pdf") {
    return (
      <div>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "20px 24px 0",
          }}
        >
          <button
            onClick={() => setSelectedTool(null)}
            style={{
              border: "none",
              background: "transparent",
              color: "inherit",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              padding: "10px 0",
            }}
          >
            ← Back to Tools
          </button>
        </div>

        <WordToPdf />
      </div>
    );
  }
if (selectedTool === "merge-pdf") {
  return (
    <div>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 24px 0",
        }}
      >
        <button
          onClick={() => setSelectedTool(null)}
          style={{
            border: "none",
            background: "transparent",
            color: "inherit",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            padding: "10px 0",
          }}
        >
          ← Back to Tools
        </button>
      </div>

      <MergePdf />
    </div>
  );
}
  if (selectedTool === "extract-pdf") {
  return (
    <div>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 24px 0",
        }}
      >
        <button
          onClick={() => setSelectedTool(null)}
          style={{
            border: "none",
            background: "transparent",
            color: "inherit",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            padding: "10px 0",
          }}
        >
          ← Back to Tools
        </button>
      </div>

      <ExtractPdf/>
    </div>
  );
}
  if (selectedTool === "compress-pdf") {
  return (
    <div>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 24px 0",
        }}
      >
        <button
          onClick={() => setSelectedTool(null)}
          style={{
            border: "none",
            background: "transparent",
            color: "inherit",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            padding: "10px 0",
          }}
        >
          ← Back to Tools
        </button>
      </div>

      <CompressPdf />
    </div>
  );
}
  if (selectedTool === "pdf-to-word") {
  return (
    <div>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 24px 0",
        }}
      >
        <button
          onClick={() => setSelectedTool(null)}
          style={{
            border: "none",
            background: "transparent",
            color: "inherit",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            padding: "10px 0",
          }}
        >
          ← Back to Tools
        </button>
      </div>

      <PdfToWord />
    </div>
  );
}
  if (selectedTool === "pdf-to-powerpoint") {
  return (
    <div>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 24px 0",
        }}
      >
        <button
          onClick={() => setSelectedTool(null)}
          style={{
            border: "none",
            background: "transparent",
            color: "inherit",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            padding: "10px 0",
          }}
        >
          ← Back to Tools
        </button>
      </div>

      <PDFToPowerPoint />
    </div>
  );
}
  if (selectedTool === "rotate-pdf") {
  return (
    <div>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 24px 0",
        }}
      >
        <button
          onClick={() => setSelectedTool(null)}
          style={{
            border: "none",
            background: "transparent",
            color: "inherit",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            padding: "10px 0",
          }}
        >
          ← Back to Tools
        </button>
      </div>

      <RotatePdf />
    </div>
  );
}
  if (selectedTool === "watermark-pdf") {
  return (
    <div>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 24px 0",
        }}
      >
        <button
          onClick={() => setSelectedTool(null)}
          style={{
            border: "none",
            background: "transparent",
            color: "inherit",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            padding: "10px 0",
          }}
        >
          ← Back to Tools
        </button>
      </div>

      <WatermarkPdf />
    </div>
  );
}
  if (selectedTool === "protect-pdf") {
    return (
      <div>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "20px 24px 0",
          }}
        >
          <button
            onClick={() => setSelectedTool(null)}
            style={{
              border: "none",
              background: "transparent",
              color: "inherit",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              padding: "10px 0",
            }}
          >
            ← Back to Tools
          </button>
        </div>

        <ProtectPdf />
      </div>
    );
  }
 if (selectedTool === "protect-pdf") {
  return (
    <div>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 24px 0",
        }}
      >
        <button
          onClick={() => setSelectedTool(null)}
          style={{
            border: "none",
            background: "transparent",
            color: "inherit",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            padding: "10px 0",
          }}
        >
          ← Back to Tools
        </button>
      </div>

      <ProtectPdf />
    </div>
  );
}

if (selectedTool === "unlock-pdf") {
  return (
    <div>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 24px 0",
        }}
      >
        <button
          onClick={() => setSelectedTool(null)}
          style={{
            border: "none",
            background: "transparent",
            color: "inherit",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            padding: "10px 0",
          }}
        >
          ← Back to Tools
        </button>
      </div>

      <UnlockPdf />
    </div>
  );
}
  if (selectedTool === "sign-pdf") {
  return (
    <div>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 24px 0",
        }}
      >
        <button
          onClick={() => setSelectedTool(null)}
          style={{
            border: "none",
            background: "transparent",
            color: "inherit",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            padding: "10px 0",
          }}
        >
          ← Back to Tools
        </button>
      </div>

      <SignPdf />
    </div>
  );
}
if (selectedTool === "delete-pdf-pages") {
  return (
    <div>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 24px 0",
        }}
      >
        <button
          onClick={() => setSelectedTool(null)}
          style={{
            border: "none",
            background: "transparent",
            color: "inherit",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            padding: "10px 0",
          }}
        >
          ← Back to Tools
        </button>
      </div>

      <DeletePdfPages />
    </div>
  );
}

if (selectedTool === "edit-pdf") {
  return (
    <div>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 24px 0",
        }}
      >
        <button
          onClick={() => setSelectedTool(null)}
          style={{
            border: "none",
            background: "transparent",
            color: "inherit",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            padding: "10px 0",
          }}
        >
          ← Back to Tools
        </button>
      </div>

      <EditPdf />
    </div>
  );
}


  
  // =========================
  // TOOLS HOME
  // =========================

  return (
    <section className="wrap">

      {/* HEADER */}

      <div className="sectionHead">
        <div>
          <small>SHORTCUTHUB TOOLS</small>

          <h2>
            All Tools
          </h2>
        </div>

        <span>
          PDF & File Tools
        </span>
      </div>


      {/* =========================
          PDF TOOLS
      ========================= */}

      <div style={{ marginTop: "30px" }}>

        <div style={{ marginBottom: "18px" }}>
          <small>PDF TOOLS</small>

          <h2 style={{ marginTop: "5px" }}>
            PDF Tools
          </h2>
        </div>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "18px",
          }}
        >

          <ToolCard
            icon="🖼️"
            title="JPG to PDF"
            description="Convert JPG images into a PDF document."
            onClick={() => setSelectedTool("jpg-to-pdf")}
          />
<ToolCard
  icon="📊"
  title="PDF to Excel"
  description="Convert PDF tables into an Excel spreadsheet."
  onClick={() => setSelectedTool("pdf-to-excel")}
/>

          <ToolCard
            icon="📊"
            title="Excel to PDF"
            description="Convert Excel spreadsheets into PDF documents."
            onClick={() => setSelectedTool("excel-to-pdf")}
          />


          <ToolCard
            icon="📝"
            title="Word to PDF"
            description="Convert Word documents into PDF files."
            onClick={() => setSelectedTool("word-to-pdf")}
          />


   <ToolCard
            icon="🧾➡️🖼️"
            title="PDF to JPG"
            description="Convert PDF pages into JPG images."
            onClick={() => setSelectedTool("pdf-to-jpg")}
          />
          <ToolCard
  icon="📑"
  title="Merge PDF"
  description="Combine multiple PDF files into one."
  onClick={() => setSelectedTool("merge-pdf")}
/>


        <ToolCard
  icon="✂️"
  title="Extract PDF"
  description="Extract selected pages from a PDF."
  onClick={() => setSelectedTool("extract-pdf")}
/>


 <ToolCard
  icon="🗜️"
  title="Compress PDF"
  description="Reduce PDF file size."
  onClick={() => setSelectedTool("compress-pdf")}
/>



        <ToolCard
  icon="📄"
  title="PDF to Word"
  description="Convert PDF files to editable Word documents."
  onClick={() => setSelectedTool("pdf-to-word")}
/>


         <ToolCard
  icon="📊"
  title="PDF to PowerPoint"
  description="Convert PDF files to PowerPoint."
  onClick={() => setSelectedTool("pdf-to-powerpoint")}
/>


         <ToolCard
  icon="🔄"
  title="Rotate PDF"
  description="Rotate PDF pages."
  onClick={() => setSelectedTool("rotate-pdf")}
/>


          <ToolCard
  icon="💧"
  title="Watermark PDF"
  description="Add a watermark to your PDF."
  onClick={() => setSelectedTool("watermark-pdf")}
/>


       <ToolCard
  icon="🔐"
  title="Protect PDF"
  description="Password protect your PDF."
  onClick={() => setSelectedTool("protect-pdf")}
/>


         <ToolCard
  icon="🔓"
  title="Unlock PDF"
  description="Remove password protection from your PDF."
  onClick={() => setSelectedTool("unlock-pdf")}
/>

<ToolCard
  icon="✍️"
  title="Sign PDF"
  description="Add your signature to PDF documents."
  onClick={() => setSelectedTool("sign-pdf")}
/>
   

          <ToolCard
  icon="🗑️"
  title="Delete PDF Pages"
  description="Remove unwanted pages from a PDF instantly."
  onClick={() => setSelectedTool("delete-pdf-pages")}
/>
          <ToolCard
  icon="✏️"
  title="Edit PDF"
  description="Edit and customize your PDF easily."
  onClick={() => setSelectedTool("edit-pdf")}
/>
        </div>
      </div>


      {/* =========================
          IMAGE TOOLS
      ========================= */}

      <div style={{ marginTop: "55px" }}>

        <div style={{ marginBottom: "18px" }}>
          <small>IMAGE TOOLS</small>

          <h2 style={{ marginTop: "5px" }}>
            Image Tools
          </h2>
        </div>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "18px",
          }}
        >

          

          <ToolCard
            icon="🗜️"
            title="Image Compressor"
            description="Reduce image file size."
            comingSoon
          />

          <ToolCard
            icon="📐"
            title="Image Resizer"
            description="Resize images to any dimensions."
            comingSoon
          />

          <ToolCard
            icon="✂️"
            title="Image Cropper"
            description="Crop images quickly."
            comingSoon
          />

          <ToolCard
            icon="🔃"
            title="Image Rotator"
            description="Rotate your images."
            comingSoon
          />

          <ToolCard
            icon="📄"
            title="Image to PDF"
            description="Convert images into PDF documents."
            comingSoon
          />

        </div>
      </div>


      {/* =========================
          TEXT TOOLS
      ========================= */}

      <div style={{ marginTop: "55px" }}>

        <div style={{ marginBottom: "18px" }}>
          <small>TEXT TOOLS</small>

          <h2 style={{ marginTop: "5px" }}>
            Text Tools
          </h2>
        </div>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "18px",
          }}
        >

          <ToolCard
            icon="🔢"
            title="Word Counter"
            description="Count words and characters in text."
            comingSoon
          />

          <ToolCard
            icon="🔠"
            title="Case Converter"
            description="Convert text to uppercase or lowercase."
            comingSoon
          />

          <ToolCard
            icon="🧹"
            title="Text Cleaner"
            description="Clean and format your text."
            comingSoon
          />

          <ToolCard
            icon="📊"
            title="Text Sorter"
            description="Sort lines and text instantly."
            comingSoon
          />

        </div>
      </div>

    </section>
  );
}


/* =========================
   TOOL CARD
========================= */

function ToolCard({
  icon,
  title,
  description,
  onClick,
  comingSoon,
}) {
  return (
    <article
      className="shortcut"
      style={{
        cursor: comingSoon
          ? "default"
          : "pointer",
      }}
      onClick={comingSoon ? undefined : onClick}
    >

      <div
        style={{
          fontSize: "36px",
          marginBottom: "12px",
        }}
      >
        {icon}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {description}
      </p>

      <button
        disabled={comingSoon}
        className={
          comingSoon
            ? ""
            : "primary"
        }
        onClick={(event) => {
          event.stopPropagation();

          if (!comingSoon && onClick) {
            onClick();
          }
        }}
      >
        {comingSoon
          ? "Coming soon"
          : "Open Tool →"}
      </button>

    </article>
  );
}
/* =========================
   LEARN
========================= */

function Learn({ items }) {
  const [exam, setExam] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function shuffle(list) {
    return [...list].sort(() => Math.random() - 0.5);
  }

  function buildExam(source) {
    return shuffle(source)
      .slice(0, Math.min(25, source.length))
      .map((question) => ({
        ...question,
        options: shuffle([
          question.action,
          ...shuffle(
            source
              .filter((item) => item.id !== question.id && item.action !== question.action)
              .map((item) => item.action)
          ).slice(0, 3),
        ]),
      }));
  }

  useEffect(() => {
    setExam(buildExam(items || []));
    setAnswers({});
    setSubmitted(false);
  }, [items]);

  if (!exam.length) {
    return (
      <section className="wrap"><div className="learnBox">
        <small>LEARN MODE</small><h2>No shortcuts found</h2>
        <p>There are no shortcuts available for this selection yet.</p>
      </div></section>
    );
  }

  const correct = exam.filter((question) => answers[question.id] === question.action);
  const wrong = exam.filter((question) => answers[question.id] !== question.action);

  if (submitted) {
    return (
      <section className="wrap"><div className="learnBox examResults">
        <div className="badge">{wrong.length ? "📘" : "🏆"}</div>
        <small>LEARN RESULTS</small>
        <h2>Practice complete</h2>
        <p className="score">{correct.length}/{exam.length} correct</p>
        <p>{wrong.length} wrong answer{wrong.length === 1 ? "" : "s"}</p>
        {wrong.length > 0 && <div className="quizReview">
          <h3>Review wrong answers</h3>
          {wrong.map((question, index) => <article key={`${question.id}-${index}`}>
            <kbd>{question.keys}</kbd><b>{question.action}</b>
            <p><span>Your answer:</span> {answers[question.id] || "Not answered"}</p>
            <p><span>Correct answer:</span> {question.action}</p>
          </article>)}
        </div>}
        <button className="primary" onClick={() => {
          setExam(buildExam(items)); setAnswers({}); setSubmitted(false);
        }}>Try another 25 questions</button>
      </div></section>
    );
  }

  return (
    <section className="wrap"><form className="examBox" onSubmit={(event) => {
      event.preventDefault(); setSubmitted(true); window.scrollTo({ top: 0, behavior: "smooth" });
    }}>
      <small>LEARN PRACTICE · {exam.length} QUESTIONS</small>
      <h2>Shortcut knowledge test</h2>
      <p>Answer all questions, then submit to see your result.</p>
      {exam.map((question, index) => <fieldset key={question.id} className="examQuestion">
        <legend>{index + 1}. What does <kbd>{question.keys}</kbd> do?</legend>
        <small>{question.software}</small>
        {question.options.map((option) => <label key={option}>
          <input type="radio" name={`question-${question.id}`} value={option}
            checked={answers[question.id] === option}
            onChange={() => setAnswers((current) => ({ ...current, [question.id]: option }))} />
          {option}
        </label>)}
      </fieldset>)}
      <button className="primary" type="submit">Submit answers</button>
    </form></section>
  );
}

/* =========================
   QUIZ
========================= */

function Quiz({ items }) {
  const [n, setN] = useState(0);
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [done, setDone] = useState(false);

  function shuffle(list) {
    return [...list].sort(() => Math.random() - 0.5);
  }

  function createQuiz(source) {
    return shuffle(source)
      .slice(0, Math.min(5, source.length))
      .map((question) => {
        const distractors = shuffle(
          source
            .filter((item) => item.id !== question.id && item.action !== question.action)
            .map((item) => item.action)
        ).slice(0, 3);

        return {
          ...question,
          options: shuffle([question.action, ...distractors]),
        };
      });
  }

  function startQuiz() {
    setQuiz(createQuiz(items));
    setN(0);
    setAnswers([]);
    setDone(false);
  }

  useEffect(() => {
    startQuiz();
  }, [items]);

  const s = quiz[n];
  const score = answers.filter((answer) => answer.correct).length;
  const wrongAnswers = answers.filter((answer) => !answer.correct);

  if (!s && !done) {
    return (
      <section className="wrap">
        <div className="learnBox">
          <small>QUIZ</small>
          <h2>No shortcuts available yet</h2>
          <p>Add shortcuts first, then come back to test yourself.</p>
        </div>
      </section>
    );
  }

  if (done) {
    return (
      <section className="wrap">
        <div className="learnBox">
          <div className="badge">
            {wrongAnswers.length === 0 ? "🏆" : "📘"}
          </div>
          <h2>Quiz complete</h2>
          <p className="score">{score}/{quiz.length} correct</p>
          <p>{wrongAnswers.length} wrong answer{wrongAnswers.length === 1 ? "" : "s"}</p>

          {wrongAnswers.length > 0 && (
            <div className="quizReview">
              <h3>Review your wrong answers</h3>
              {wrongAnswers.map((answer, index) => (
                <article key={`${answer.question.id}-${index}`}>
                  <kbd>{answer.question.keys}</kbd>
                  <b>{answer.question.action}</b>
                  <p><span>Your answer:</span> {answer.selected}</p>
                  <p><span>Correct answer:</span> {answer.question.action}</p>
                </article>
              ))}
            </div>
          )}

          <button className="primary" onClick={startQuiz}>Try a new mixed quiz</button>
        </div>
      </section>
    );
  }

  return (
    <section className="wrap">
      <div className="learnBox">

        <small>
          QUIZ · QUESTION {n + 1}/{quiz.length}
        </small>

        <h2>
          What does <kbd>{s?.keys}</kbd> do?
        </h2>

        <p>
          {s?.software}
        </p>

        <div className="answers">
          {s.options.map((option) => (
            <button
              key={option}
              onClick={() => {
                const answer = {
                  question: s,
                  selected: option,
                  correct: option === s.action,
                };
                setAnswers((current) => [...current, answer]);

                if (n === quiz.length - 1) {
                  setDone(true);
                } else {
                  setN(n + 1);
                }
              }}
            >
              {option}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}

/* =========================
   PROFILE
========================= */

function Profile({
  user,
  prog,
  recent,
  favorites,
}) {
  const level =
    Math.floor((user?.xp || 0) / 100) + 1;

  return (
    <section className="wrap">
      <div className="profile">

        <small>PROFILE</small>

        <h2>
          {user?.name}
        </h2>

        <p>
          {user?.email}
        </p>

        <div className="stats">

          <div>
            <b>{user?.xp || 0}</b>
            <small>XP</small>
          </div>

          <div>
            <b>Level {level}</b>
            <small>Current level</small>
          </div>

          <div>
            <b>{favorites.length}</b>
            <small>Favorites</small>
          </div>

          <div>
            <b>{prog.length}</b>
            <small>Mastered</small>
          </div>

        </div>

        <div className="progress">
          <span
            style={{
              width: `${(user?.xp || 0) % 100}%`,
            }}
          />
        </div>

        <h3>
          Achievements
        </h3>

        <div className="badges">
          <span>🏁 First Step</span>
          <span>🧠 Learner</span>
          <span>🔥 Streak Starter</span>
          <span>🏆 Master</span>
        </div>

        <h3>
          Recently learned
        </h3>

        <p>
          {recent.length
            ? recent.map((x) => (
                <span
                  className="recent"
                  key={x.id || x.keys}
                >
                  ⌨ {x.keys} · {x.action}
                </span>
              ))
            : "Your recent shortcuts will appear here."}
        </p>

      </div>
    </section>
  );
}

/* Login UI intentionally removed from the public version.

function Auth({
  close,
  setUser,
}) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function go() {
    try {
      const data = await api(
        mode === "login"
          ? "/auth/login"
          : "/auth/register",
        {
          method: "POST",
          body: JSON.stringify(
            mode === "login"
              ? {
                  email,
                  password,
                }
              : {
                  name,
                  email,
                  password,
                }
          ),
        }
      );

      localStorage.setItem(
        "sh_token",
        data.token
      );

      setUser(data.user);
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="modal">
      <div className="modalBox">

        <button
          className="close"
          onClick={close}
        >
          ×
        </button>

        <h2>
          {mode === "login"
            ? "Welcome back"
            : "Create your account"}
        </h2>

        {mode === "register" && (
          <input
            placeholder="Your name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />
        )}

        <input
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password (8+ chars)"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        {err && (
          <div className="error">
            {err}
          </div>
        )}

        <button
          className="primary full"
          onClick={go}
        >
          {mode === "login"
            ? "Sign in"
            : "Create account"}
        </button>

        <button
          className="link"
          onClick={() => {
            setMode(
              mode === "login"
                ? "register"
                : "login"
            );
            setErr("");
          }}
        >
          {mode === "login"
            ? "Create an account"
            : "Sign in instead"}
        </button>

      </div>
    </div>
  );
}
*/

/* =========================
   ADMIN
========================= */

function Admin({ notify }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState({
    software: "Excel",
    icon: "📊",
    category: "Office",
    keys: "",
    action: "",
    level: "Beginner",
    type: "General",
    example: "",
  });

  useEffect(() => {
    api("/admin/stats").then(setStats);
    api("/admin/users").then(setUsers);
  }, []);

  async function add() {
    await api("/admin/shortcuts", {
      method: "POST",
      body: JSON.stringify(form),
    });

    setForm({
      ...form,
      keys: "",
      action: "",
      example: "",
    });

    notify("Shortcut added");
  }

  return (
    <section className="wrap">
      <div className="admin">

        <small>
          ADMIN CENTER
        </small>

        <h2>
          Platform control
        </h2>

        <div className="adminStats">
          {stats &&
            Object.entries(stats).map(
              ([key, value]) => (
                <div key={key}>
                  <b>{value}</b>
                  <small>{key}</small>
                </div>
              )
            )}
        </div>

        <h3>
          Add shortcut
        </h3>

        <div className="formGrid">
          {Object.keys(form).map(
            (key) => (
              <input
                key={key}
                placeholder={key}
                value={form[key]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [key]: e.target.value,
                  })
                }
              />
            )
          )}
        </div>

        <button
          className="primary"
          onClick={add}
        >
          ＋ Add shortcut
        </button>

        <h3>
          Users
        </h3>

        <div className="userList">
          {users.map((u) => (
            <div key={u.id || u.email}>
              <b>{u.name}</b>
              <span>{u.email}</span>
              <span>
                Level{" "}
                {Math.floor(
                  (u.xp || 0) / 100
                ) + 1}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

const root = createRoot(
  document.getElementById("root")
);

root.render(<App />);
