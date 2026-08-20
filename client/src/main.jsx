import JpgToPdf from "./tools/JpgToPdf.jsx";
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
  { id: "forest", label: "Forest", icon: "🌿" },
  { id: "midnight", label: "Midnight", icon: "☾" },
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

        <nav>
          {[
            "home",
            "tools",
            "learn",
            "quiz",
          ].map((item) => (
            <button
              key={item}
              className={view === item ? "sel" : ""}
              onClick={() => setView(item)}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </button>
          ))}
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
        <Learn
          items={items}
          learn={learn}
          prog={prog}
        />
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
                setView("learn");
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
          {(soft.length ? soft : fallback).map(
            (app) => (
              <button
                className="app"
                key={app.software || app[0]}
                onClick={() =>
                  openSoftware(app.software || app[0])
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

  /*
    TOOL PAGE
    When a user clicks a tool, only that tool opens.
  */

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

  /*
    TOOLS HOME
    Only cards appear here.
  */

  return (
    <section className="wrap">

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

        <div
          style={{
            marginBottom: "18px",
          }}
        >
          <small>PDF TOOLS</small>

          <h2
            style={{
              marginTop: "5px",
            }}
          >
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
            onClick={() =>
              setSelectedTool("jpg-to-pdf")
            }
          />

          <ToolCard
            icon="📄"
            title="PDF to JPG"
            description="Convert PDF pages into JPG images."
            comingSoon
          />

          <ToolCard
            icon="📑"
            title="Merge PDF"
            description="Combine multiple PDF files into one."
            comingSoon
          />

          <ToolCard
            icon="✂️"
            title="Split PDF"
            description="Split a PDF into separate documents."
            comingSoon
          />

          <ToolCard
            icon="🗜️"
            title="Compress PDF"
            description="Reduce PDF file size."
            comingSoon
          />

          <ToolCard
            icon="📝"
            title="PDF to Word"
            description="Convert PDF documents to Word."
            comingSoon
          />

          <ToolCard
            icon="📊"
            title="PDF to Excel"
            description="Convert PDF tables to Excel."
            comingSoon
          />

          <ToolCard
            icon="📽️"
            title="PDF to PowerPoint"
            description="Convert PDF files to presentations."
            comingSoon
          />

          <ToolCard
            icon="🔄"
            title="Rotate PDF"
            description="Rotate PDF pages easily."
            comingSoon
          />

          <ToolCard
            icon="💧"
            title="Watermark PDF"
            description="Add a watermark to your PDF."
            comingSoon
          />

          <ToolCard
            icon="🔐"
            title="Protect PDF"
            description="Password protect your PDF."
            comingSoon
          />

          <ToolCard
            icon="🔓"
            title="Unlock PDF"
            description="Remove password protection from a PDF."
            comingSoon
          />

          <ToolCard
            icon="✍️"
            title="Sign PDF"
            description="Add your signature to PDF documents."
            comingSoon
          />

          <ToolCard
            icon="📋"
            title="Extract PDF Pages"
            description="Extract selected pages from a PDF."
            comingSoon
          />

          <ToolCard
            icon="🗑️"
            title="Delete PDF Pages"
            description="Remove unwanted pages from a PDF."
            comingSoon
          />

          <ToolCard
            icon="↕️"
            title="Reorder PDF"
            description="Change the order of PDF pages."
            comingSoon
          />

        </div>
      </div>

      {/* =========================
          IMAGE TOOLS
      ========================= */}

      <div style={{ marginTop: "55px" }}>

        <div style={{ marginBottom: "18px" }}>
          <small>IMAGE TOOLS</small>

          <h2
            style={{
              marginTop: "5px",
            }}
          >
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
            icon="🔄"
            title="JPG to PNG"
            description="Convert JPG images to PNG."
            comingSoon
          />

          <ToolCard
            icon="🖼️"
            title="PNG to JPG"
            description="Convert PNG images to JPG."
            comingSoon
          />

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

          <h2
            style={{
              marginTop: "5px",
            }}
          >
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

function Learn({ items, learn, prog }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    setI(0);
  }, [items]);

  if (!items || items.length === 0) {
    return (
      <section className="wrap">
        <div className="learnBox">
          <small>LEARN MODE</small>
          <h2>No shortcuts found</h2>
          <p>There are no shortcuts available for this selection yet.</p>
          <button
            className="primary"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Back
          </button>
        </div>
      </section>
    );
  }

  const s = items[i % items.length];
  const mastered = prog.includes(s.id);
  const masteredCount = items.filter((item) => prog.includes(item.id)).length;

  return (
    <section className="wrap">
      <div className="learnBox">
        <small>LEARN MODE · {i + 1} / {items.length}</small>

        <div className="learnProgress" aria-label={`${masteredCount} of ${items.length} shortcuts mastered`}>
          <span style={{ width: `${(masteredCount / items.length) * 100}%` }} />
        </div>
        <p className="learnCount">{masteredCount} of {items.length} mastered</p>

        <h2>Master this shortcut</h2>

        <div className="megaKey">
          {s.keys}
        </div>

        <h3>{s.action}</h3>

        <p>
          {s.software}
          {s.category ? " · " + s.category : ""}
        </p>

        {s.example && <p>{s.example}</p>}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <button
            className="primary"
            onClick={() => {
              learn(s.id);
              setI((current) => (current + 1) % items.length);
            }}
          >
            {mastered ? "✓ Mastered" : "✓ I know it"}
          </button>

          <button
            onClick={() =>
              setI((current) => (current + 1) % items.length)
            }
          >
            Next →
          </button>
        </div>
      </div>
    </section>
  );
}

/* =========================
   QUIZ
========================= */

function Quiz({ items }) {
  const [n, setN] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const s =
    items[n % Math.max(items.length, 1)];

  const opts = s
    ? [
        s.action,
        ...items
          .filter((x) => x.id !== s.id)
          .slice(n % 4, n % 4 + 3)
          .map((x) => x.action),
      ].sort(() => Math.random() - 0.5)
    : [];

  if (done) {
    return (
      <section className="wrap">
        <div className="learnBox">

          <div className="badge">
            🏆
          </div>

          <h2>
            Quiz complete
          </h2>

          <p className="score">
            {score}/5 correct
          </p>

          <button
            className="primary"
            onClick={() => {
              setN(0);
              setScore(0);
              setDone(false);
            }}
          >
            Play again
          </button>

        </div>
      </section>
    );
  }

  return (
    <section className="wrap">
      <div className="learnBox">

        <small>
          QUIZ · QUESTION {n + 1}/5
        </small>

        <h2>
          What does <kbd>{s?.keys}</kbd> do?
        </h2>

        <p>
          {s?.software}
        </p>

        <div className="answers">
          {opts.map((option) => (
            <button
              key={option}
              onClick={() => {
                if (option === s.action) {
                  setScore(score + 1);
                }

                if (n === 4) {
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

createRoot(
  document.getElementById("root")
).render(<App />);
