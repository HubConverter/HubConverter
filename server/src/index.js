import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import path from 'path';

const app = express();

const PORT = process.env.PORT || 4000;
const SECRET = process.env.JWT_SECRET || 'dev-change-me';

const db = new Database('shortcut_hub_v3.db');

db.pragma('foreign_keys=ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL,
 email TEXT UNIQUE NOT NULL,
 password_hash TEXT NOT NULL,
 role TEXT NOT NULL DEFAULT 'user',
 xp INTEGER DEFAULT 0,
 streak INTEGER DEFAULT 0,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shortcuts(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 software TEXT NOT NULL,
 icon TEXT DEFAULT '⌨',
 category TEXT NOT NULL,
 keys TEXT NOT NULL,
 action TEXT NOT NULL,
 level TEXT DEFAULT 'Beginner',
 type TEXT DEFAULT 'General',
 example TEXT DEFAULT '',
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favorites(
 user_id INTEGER,
 shortcut_id INTEGER,
 PRIMARY KEY(user_id, shortcut_id),
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(shortcut_id) REFERENCES shortcuts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS progress(
 user_id INTEGER,
 shortcut_id INTEGER,
 PRIMARY KEY(user_id, shortcut_id),
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(shortcut_id) REFERENCES shortcuts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER,
 shortcut_id INTEGER,
 kind TEXT,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

/* =========================
   SEED SHORTCUTS
========================= */

const seed = [
  ['Excel','📊','Office','Ctrl+C','Copy','Beginner','Editing','Copies selected cells or content.'],
  ['Excel','📊','Office','Ctrl+V','Paste','Beginner','Editing','Pastes copied content.'],
  ['Excel','📊','Office','Ctrl+S','Save workbook','Beginner','File','Saves the current workbook.'],
  ['Excel','📊','Office','Alt+=','AutoSum','Beginner','Formula','Quickly inserts a SUM formula.'],

  ['Word','📝','Office','Ctrl+B','Bold','Beginner','Formatting','Makes selected text bold.'],
  ['Word','📝','Office','Ctrl+P','Print','Beginner','File','Opens print settings.'],

  ['PowerPoint','📽️','Office','Ctrl+M','New slide','Beginner','Slides','Creates a new slide.'],
  ['PowerPoint','📽️','Office','F5','Start slideshow','Beginner','Presentation','Starts from the beginning.'],

  ['Tally','▣','Accounting','F2','Change date','Beginner','Voucher','Changes voucher date.'],
  ['Tally','▣','Accounting','F8','Sales voucher','Beginner','Voucher','Opens Sales voucher.'],

  ['BUSY','B','Accounting','F2','Change date','Beginner','Workflow','Changes working date.'],

  ['Photoshop','Ps','Design','Ctrl+T','Free Transform','Intermediate','Transform','Transforms the selected layer/object.'],
  ['Photoshop','Ps','Design','B','Brush tool','Beginner','Tools','Selects the Brush tool.'],

  ['Windows','⊞','System','Win+D','Show desktop','Beginner','System','Shows or hides the desktop.'],
  ['Windows','⊞','System','Win+E','File Explorer','Beginner','System','Opens File Explorer.'],
  ['Windows','⊞','System','Alt+Tab','Switch apps','Beginner','Window','Switches between open applications.'],

  ['Chrome','🌐','Browser','Ctrl+T','New tab','Beginner','Tabs','Opens a new browser tab.'],
  ['Chrome','🌐','Browser','Ctrl+Shift+T','Reopen closed tab','Intermediate','Tabs','Restores the last closed tab.'],
  ['Chrome','🌐','Browser','Ctrl+L','Address bar','Beginner','Navigation','Focuses the address bar.'],


];
db.prepare("DELETE FROM shortcuts WHERE software IN ('Gmail', 'VS Code', 'Google Sheets')").run();
if (db.prepare('SELECT COUNT(*) c FROM shortcuts').get().c === 0) {
  const ins = db.prepare(`
    INSERT INTO shortcuts
    (software,icon,category,keys,action,level,type,example)
    VALUES(?,?,?,?,?,?,?,?)
  `);

  db.transaction(rows => {
    rows.forEach(row => ins.run(...row));
  })(seed);
}

/* =========================
   DEMO / ADMIN USERS
========================= */

const addUser = db.prepare(`
  INSERT OR IGNORE INTO users
  (name,email,password_hash,role)
  VALUES(?,?,?,?)
`);

addUser.run(
  'Administrator',
  'admin@shortcuthub.local',
  bcrypt.hashSync('Admin@123', 10),
  'admin'
);

addUser.run(
  'Demo User',
  'demo@shortcuthub.local',
  bcrypt.hashSync('Demo@123', 10),
  'user'
);

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true
  })
);

app.use(express.json());

/* =========================
   AUTH HELPERS
========================= */

const sign = user =>
  jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email
    },
    SECRET,
    {
      expiresIn: '7d'
    }
  );

function auth(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');

    req.user = jwt.verify(token, SECRET);

    next();
  } catch {
    res.status(401).json({
      error: 'Authentication required'
    });
  }
}

function admin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Admin only'
    });
  }

  next();
}

/* =========================
   HEALTH CHECK
========================= */

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    version: '3.0.0'
  });
});

/* =========================
   AUTH - REGISTER
========================= */

app.post('/api/auth/register', (req, res) => {
  const {
    name,
    email,
    password
  } = req.body || {};

  if (
    !name ||
    !email ||
    !password ||
    password.length < 8
  ) {
    return res.status(400).json({
      error: 'Name, email and password (8+ chars) are required'
    });
  }

  try {
    const result = db.prepare(`
      INSERT INTO users
      (name,email,password_hash)
      VALUES(?,?,?)
    `).run(
      name,
      email.toLowerCase(),
      bcrypt.hashSync(password, 10)
    );

    const user = db.prepare(`
      SELECT id,name,email,role,xp,streak
      FROM users
      WHERE id=?
    `).get(result.lastInsertRowid);

    res.json({
      token: sign(user),
      user
    });

  } catch {
    res.status(409).json({
      error: 'Email already registered'
    });
  }
});

/* =========================
   AUTH - LOGIN
========================= */

app.post('/api/auth/login', (req, res) => {
  const {
    email,
    password
  } = req.body || {};

  const user = db.prepare(`
    SELECT *
    FROM users
    WHERE email=?
  `).get(
    (email || '').toLowerCase()
  );

  if (
    !user ||
    !bcrypt.compareSync(
      password || '',
      user.password_hash
    )
  ) {
    return res.status(401).json({
      error: 'Invalid email or password'
    });
  }

  res.json({
    token: sign(user),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      xp: user.xp,
      streak: user.streak
    }
  });
});

/* =========================
   CURRENT USER
========================= */

app.get('/api/me', auth, (req, res) => {
  const user = db.prepare(`
    SELECT
      id,
      name,
      email,
      role,
      xp,
      streak,
      created_at
    FROM users
    WHERE id=?
  `).get(req.user.id);

  res.json(user);
});

/* =========================
   SOFTWARE
========================= */

app.get('/api/software', (req, res) => {
  const software = db.prepare(`
    SELECT
      software,
      icon,
      category,
      COUNT(*) count
    FROM shortcuts
    GROUP BY software
    ORDER BY software
  `).all();

  res.json(software);
});

/* =========================
   SHORTCUTS
========================= */

app.get('/api/shortcuts', (req, res) => {
  const {
    q = '',
    software = '',
    level = '',
    category = ''
  } = req.query;

  let sql = `
    SELECT *
    FROM shortcuts
    WHERE 1=1
  `;

  const params = [];

  if (q) {
    sql += `
      AND (
        keys LIKE ?
        OR action LIKE ?
        OR software LIKE ?
      )
    `;

    params.push(
      `%${q}%`,
      `%${q}%`,
      `%${q}%`
    );
  }

  if (software) {
    sql += ` AND software=?`;
    params.push(software);
  }

  if (level) {
    sql += ` AND level=?`;
    params.push(level);
  }

  if (category) {
    sql += ` AND category=?`;
    params.push(category);
  }

  sql += ` ORDER BY software,id`;

  const shortcuts = db
    .prepare(sql)
    .all(...params);

  res.json(shortcuts);
});

/* =========================
   FAVORITES
========================= */

app.get('/api/favorites', auth, (req, res) => {
  const favorites = db.prepare(`
    SELECT shortcut_id
    FROM favorites
    WHERE user_id=?
  `)
    .all(req.user.id)
    .map(row => row.shortcut_id);

  res.json(favorites);
});

app.post('/api/favorites/:id', auth, (req, res) => {
  const shortcutId = Number(req.params.id);

  const existing = db.prepare(`
    SELECT 1
    FROM favorites
    WHERE user_id=?
    AND shortcut_id=?
  `).get(
    req.user.id,
    shortcutId
  );

  if (existing) {
    db.prepare(`
      DELETE FROM favorites
      WHERE user_id=?
      AND shortcut_id=?
    `).run(
      req.user.id,
      shortcutId
    );
  } else {
    db.prepare(`
      INSERT OR IGNORE INTO favorites
      VALUES(?,?)
    `).run(
      req.user.id,
      shortcutId
    );
  }

  res.json({
    saved: !existing
  });
});

/* =========================
   PROGRESS
========================= */

app.get('/api/progress', auth, (req, res) => {
  const progress = db.prepare(`
    SELECT shortcut_id
    FROM progress
    WHERE user_id=?
  `)
    .all(req.user.id)
    .map(row => row.shortcut_id);

  res.json(progress);
});

app.post('/api/progress/:id', auth, (req, res) => {
  const shortcutId = Number(req.params.id);

  db.prepare(`
    INSERT OR IGNORE INTO progress
    VALUES(?,?)
  `).run(
    req.user.id,
    shortcutId
  );

  db.prepare(`
    INSERT INTO activity
    (user_id,shortcut_id,kind)
    VALUES(?,?,?)
  `).run(
    req.user.id,
    shortcutId,
    'learn'
  );

  db.prepare(`
    UPDATE users
    SET xp=xp+10
    WHERE id=?
  `).run(req.user.id);

  const user = db.prepare(`
    SELECT xp
    FROM users
    WHERE id=?
  `).get(req.user.id);

  res.json({
    ok: true,
    xp: user.xp
  });
});

/* =========================
   ACTIVITY
========================= */

app.post('/api/activity/:id', auth, (req, res) => {
  db.prepare(`
    INSERT INTO activity
    (user_id,shortcut_id,kind)
    VALUES(?,?,?)
  `).run(
    req.user.id,
    Number(req.params.id),
    req.body.kind || 'view'
  );

  res.json({
    ok: true
  });
});

/* =========================
   RECENT
========================= */

app.get('/api/recent', auth, (req, res) => {
  const recent = db.prepare(`
    SELECT s.*
    FROM activity a
    JOIN shortcuts s
      ON s.id=a.shortcut_id
    WHERE a.user_id=?
    GROUP BY s.id
    ORDER BY MAX(a.id) DESC
    LIMIT 8
  `).all(req.user.id);

  res.json(recent);
});

/* =========================
   ADMIN STATS
========================= */

app.get('/api/admin/stats', auth, admin, (req, res) => {
  res.json({
    users: db.prepare(
      'SELECT COUNT(*) c FROM users'
    ).get().c,

    shortcuts: db.prepare(
      'SELECT COUNT(*) c FROM shortcuts'
    ).get().c,

    favorites: db.prepare(
      'SELECT COUNT(*) c FROM favorites'
    ).get().c,

    mastered: db.prepare(
      'SELECT COUNT(*) c FROM progress'
    ).get().c
  });
});

/* =========================
   ADMIN USERS
========================= */

app.get('/api/admin/users', auth, admin, (req, res) => {
  const users = db.prepare(`
    SELECT
      id,
      name,
      email,
      role,
      xp,
      streak,
      created_at
    FROM users
    ORDER BY id DESC
  `).all();

  res.json(users);
});

/* =========================
   ADMIN - ADD SHORTCUT
========================= */

app.post('/api/admin/shortcuts', auth, admin, (req, res) => {
  const data = req.body || {};

  if (
    !data.software ||
    !data.category ||
    !data.keys ||
    !data.action
  ) {
    return res.status(400).json({
      error: 'Missing required fields'
    });
  }

  const result = db.prepare(`
    INSERT INTO shortcuts
    (
      software,
      icon,
      category,
      keys,
      action,
      level,
      type,
      example
    )
    VALUES(?,?,?,?,?,?,?,?)
  `).run(
    data.software,
    data.icon || '⌨',
    data.category,
    data.keys,
    data.action,
    data.level || 'Beginner',
    data.type || 'General',
    data.example || ''
  );

  const shortcut = db.prepare(`
    SELECT *
    FROM shortcuts
    WHERE id=?
  `).get(result.lastInsertRowid);

  res.status(201).json(shortcut);
});

/* =========================
   ADMIN - UPDATE SHORTCUT
========================= */

app.put('/api/admin/shortcuts/:id', auth, admin, (req, res) => {
  const id = Number(req.params.id);
  const data = req.body || {};

  db.prepare(`
    UPDATE shortcuts
    SET
      software=?,
      icon=?,
      category=?,
      keys=?,
      action=?,
      level=?,
      type=?,
      example=?
    WHERE id=?
  `).run(
    data.software,
    data.icon || '⌨',
    data.category,
    data.keys,
    data.action,
    data.level || 'Beginner',
    data.type || 'General',
    data.example || '',
    id
  );

  const shortcut = db.prepare(`
    SELECT *
    FROM shortcuts
    WHERE id=?
  `).get(id);

  res.json(shortcut);
});

/* =========================
   ADMIN - DELETE SHORTCUT
========================= */

app.delete('/api/admin/shortcuts/:id', auth, admin, (req, res) => {
  const id = Number(req.params.id);

  db.prepare(`
    DELETE FROM shortcuts
    WHERE id=?
  `).run(id);

  res.json({
    ok: true
  });
});

/* ==================================================
   FRONTEND / CLIENT
   IMPORTANT:
   GitHub structure:
   
   ShortcutHub/
   ├── package.json
   └── src/
       ├── index.js
       └── client/
           ├── package.json
           └── dist/
   
   Therefore clientDist = src/client/dist
================================================== */

const clientDist = path.join(
  process.cwd(),
  '..',
  'client',
  'dist'
);

app.use(
  express.static(clientDist)
);

/* =========================
   FRONTEND ROUTING
========================= */

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  res.sendFile(
    path.join(clientDist, 'index.html')
  );
});

/* =========================
   RENDER SERVER START
   IMPORTANT FIX
========================= */

const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(
    `ShortcutHub server running on ${HOST}:${PORT}`
  );
});
