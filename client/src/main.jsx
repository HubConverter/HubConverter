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

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");
  const [items, setItems] = useState([]);
  const [soft, setSoft] = useState([]);
  const [prog, setProg] = useState([]);
  const [recent, setRecent] = useState([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");
  const [dark, setDark] = useState(localStorage.dark === "1");
  const [auth, setAuth] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    (async () => {
      try {
        if (token()) {
          setUser(await api("/me"));
        }
      } catch {
        localStorage.removeItem("sh_token");
      }

      setItems(await api("/shortcuts"));
      setSoft(await api("/software"));
    })();
  }, []);

  useEffect(() => {
    if (user) {
      api("/progress").then(setProg);
      api("/recent").then(setRecent);
    }
  }, [user]);

  useEffect(() => {
    document.body.className = dark ? "dark" : "";
    localStorage.dark = dark ? "1" : "0";
  }, [dark]);

  function notify(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  }

  async function search() {
    setItems(
      await api(
        "/shortcuts?" +
          new URLSearchParams({
            q,
            software: filter,
          })
      )
    );
  }

  async function learn(id) {
    if (!user) {
      return setAuth(true);
    }

    await api("/progress/" + id, {
      method: "POST",
    });

    setProg((current) =>
      current.includes(id) ? current : [...current, id]
    );

    notify("+10 XP · Shortcut mastered");
  }

  function logout() {
    localStorage.removeItem("sh_token");
    setUser(null);
    setProg([]);
    setRecent([]);
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
            ...(user?.role === "admin" ? ["admin"] : []),
            "profile",
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
          <button onClick={() => setDark(!dark)}>
            ◐
          </button>

          {user ? (
            <>
              <span>👤 {user.name}</span>

              <button onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <button
              className="primary"
              onClick={() => setAuth(true)}
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      {view === "home" && (
        <Home
          setView={setView}
          q={q}
          setQ={setQ}
          search={search}
          soft={soft}
        />
      )}

      {view === "tools" && <Tools />}

      {view === "learn" && (
        <Learn
          items={items}
          learn={learn}
        />
      )}

      {view === "quiz" && (
        <Quiz items={items} />
      )}

      {view === "profile" && (
        <Profile
          user={user}
          prog={prog}
          recent={recent}
        />
      )}

      {view === "admin" &&
        user?.role === "admin" && (
          <Admin notify={notify} />
        )}

      {auth && (
        <Auth
          close={() => setAuth(false)}
          setUser={(u) => {
            setUser(u);
            setAuth(false);
          }}
        />
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
   HOME
========================= */

function Home({
  setView,
  q,
  setQ,
  search,
  soft,
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
                setView("learn");
                search();
              }
            }}
            placeholder='Try “Ctrl+C”, “Excel”, “Save”...'
          />

          <button
            className="primary"
            onClick={() => {
              setView("learn");
              search();
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
                  setTimeout(search, 0);
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
                onClick={() => setView("learn")}
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
  return (
    <section className="wrap">

      <div className="sectionHead">
        <div>
          <small>SHORTCUTHUB TOOLS</small>
          <h2>Useful tools in one place</h2>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "18px",
          marginTop: "25px",
        }}
      >

        <ToolCard
          icon="🖼️"
          title="JPG to PDF"
          description="Convert JPG images into a PDF document."
          action={() => {
            window.location.hash = "jpg-to-pdf";
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        />

        <ToolCard
          icon="📄"
          title="PDF to JPG"
          description="Convert PDF pages into JPG images."
          disabled
        />

        <ToolCard
          icon="📑"
          title="Merge PDF"
          description="Combine multiple PDF files into one."
          disabled
        />

        <ToolCard
          icon="✂️"
          title="Split PDF"
          description="Split a PDF into separate documents."
          disabled
        />

        <ToolCard
          icon="🗜️"
          title="Compress PDF"
          description="Reduce PDF file size."
          disabled
        />

        <ToolCard
          icon="📝"
          title="PDF to Word"
          description="Convert PDF documents to Word."
          disabled
        />

        <ToolCard
          icon="📊"
          title="PDF to Excel"
          description="Convert PDF tables to Excel."
          disabled
        />

        <ToolCard
          icon="📽️"
          title="PDF to PowerPoint"
          description="Convert PDF files to presentations."
          disabled
        />

        <ToolCard
          icon="🔄"
          title="Rotate PDF"
          description="Rotate PDF pages easily."
          disabled
        />

        <ToolCard
          icon="💧"
          title="Watermark PDF"
          description="Add a watermark to your PDF."
          disabled
        />

        <ToolCard
          icon="🔐"
          title="Protect PDF"
          description="Password protect your PDF."
          disabled
        />

        <ToolCard
          icon="✍️"
          title="Sign PDF"
          description="Add your signature to PDF documents."
          disabled
        />

      </div>

      <div
        id="jpg-to-pdf"
        style={{
          marginTop: "40px",
        }}
      >
        <JpgToPdf />
      </div>

    </section>
  );
}

function ToolCard({
  icon,
  title,
  description,
  action,
  disabled,
}) {
  return (
    <article
      className="shortcut"
      style={{
        cursor: disabled ? "default" : "pointer",
      }}
      onClick={!disabled ? action : undefined}
    >
      <div
        style={{
          fontSize: "36px",
          marginBottom: "12px",
        }}
      >
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      <button
        disabled={disabled}
        className={disabled ? "" : "primary"}
        onClick={(e) => {
          e.stopPropagation();

          if (!disabled && action) {
            action();
          }
        }}
      >
        {disabled ? "Coming soon" : "Open Tool →"}
      </button>
    </article>
  );
}

/* =========================
   LEARN
========================= */

function Learn({ items, learn }) {
  const [i, setI] = useState(0);

  const s =
    items[i % Math.max(items.length, 1)];

  return (
    <section className="wrap">
      <div className="learnBox">

        <small>
          LEARN MODE · {i + 1}
        </small>

        <h2>
          Master this shortcut
        </h2>

        <div className="megaKey">
          {s?.keys}
        </div>

        <h3>
          {s?.action}
        </h3>

        <p>
          {s?.software} · {s?.example}
        </p>

        <button
          className="primary"
          onClick={() => {
            learn(s.id);
            setI(i + 1);
          }}
        >
          ✓ I know it
        </button>

        <button
          onClick={() => setI(i + 1)}
        >
          Next →
        </button>

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
            <b>—</b>
            <small>Favorites removed</small>
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

/* =========================
   AUTH
========================= */

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
