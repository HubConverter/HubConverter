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

const excelShortcuts = [
  ["Excel", "📊", "Columns & Rows", "CTRL + 9", "Hide Row", "Beginner", "General", ""],
  ["Excel", "📊", "Columns & Rows", "SHIFT + CTRL + 9", "Unhide Row", "Beginner", "General", ""],
  ["Excel", "📊", "Columns & Rows", "CTRL + 0", "Hide Column", "Beginner", "General", ""],
  ["Excel", "📊", "Columns & Rows", "SHIFT + CTRL + 0", "Unhide Column", "Beginner", "General", ""],
  ["Excel", "📊", "Columns & Rows", "SHIFT + Spacebar", "Highlight Row", "Beginner", "General", ""],
  ["Excel", "📊", "Columns & Rows", "CTRL + Spacebar", "Highlight Column", "Beginner", "General", ""],
  ["Excel", "📊", "Columns & Rows", "SHIFT + CTRL + Plus sign", "Insert Blank Cells", "Beginner", "General", ""],
  ["Excel", "📊", "Columns & Rows", "CTRL + Minus Sign", "Delete Selected Cells", "Beginner", "General", ""],
  ["Excel", "📊", "Columns & Rows", "SHIFT + ALT + Left Arrow", "Group Rows/Columns", "Beginner", "General", ""],
  ["Excel", "📊", "Columns & Rows", "SHIFT + ALT + Right Arrow", "Ungroup Rows/Columns", "Beginner", "General", ""],
  ["Excel", "📊", "Function Key Shortcuts", "F2", "Edit Cells", "Beginner", "General", ""],
  ["Excel", "📊", "Function Key Shortcuts", "F4", "Anchor Cells", "Beginner", "General", ""],
  ["Excel", "📊", "Function Key Shortcuts", "F7", "Spell Check", "Beginner", "General", ""],
  ["Excel", "📊", "Function Key Shortcuts", "F12", "Save As", "Beginner", "General", ""],
  ["Excel", "📊", "Function Key Shortcuts", "SHIFT + F2", "Insert a Comment", "Beginner", "General", ""],
  ["Excel", "📊", "Function Key Shortcuts", "SHIFT + F8", "Add to Selection", "Beginner", "General", ""],
  ["Excel", "📊", "Function Key Shortcuts", "SHIFT + F10", "Right Click", "Beginner", "General", ""],
  ["Excel", "📊", "Function Key Shortcuts", "CTRL + F3", "Name a Cell", "Beginner", "General", ""],
  ["Excel", "📊", "Function Key Shortcuts", "Windows Flag + D", "Minimize Programs", "Beginner", "General", ""],
  ["Excel", "📊", "Navigation Shortcuts", "Arrows", "Move", "Beginner", "General", ""],
  ["Excel", "📊", "Navigation Shortcuts", "CTRL + Arrows", "Go to End of Continuous Range", "Beginner", "General", ""],
  ["Excel", "📊", "Navigation Shortcuts", "SHIFT + Arrows", "Select A Cell Range", "Beginner", "General", ""],
  ["Excel", "📊", "Navigation Shortcuts", "CTRL + SHIFT + Arrows", "Highlight A Continuous Range", "Beginner", "General", ""],
  ["Excel", "📊", "Navigation Shortcuts", "ALT + Tab", "Switch Programs", "Beginner", "General", ""],
  ["Excel", "📊", "Navigation Shortcuts", "CTRL + Pg Up/Down", "Switch Worksheets", "Beginner", "General", ""],
  ["Excel", "📊", "Navigation Shortcuts", "Enter", "Move below", "Beginner", "General", ""],
  ["Excel", "📊", "Navigation Shortcuts", "Shift + Enter", "Move Up", "Beginner", "General", ""],
  ["Excel", "📊", "Navigation Shortcuts", "Home", "Move to Beginning of Line", "Beginner", "General", ""],
  ["Excel", "📊", "Navigation Shortcuts", "CTRL + Home", "Go to Cell A1", "Beginner", "General", ""],
  ["Excel", "📊", "Navigation Shortcuts", "ESC", "Cancel", "Beginner", "General", ""],
  ["Excel", "📊", "Navigation Shortcuts", "Alt + Enter (when in a cell)", "Add a Line", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "CTRL + 1", "Format Box", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "ALT + E + S + T", "Copy Format", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "ALT + H + 0", "Increase Decimal", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "ALT + H + 9", "Decrease Decimal", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "CTRL + SHIFT + 7", "Boxing", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "ALT + O + C + A", "Fit Column Width", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "ALT + H + O + R", "Change Tab Name", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "ALT + W + F", "(Un)Split Panes", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "ALT + W + S", "(Un)freeze windows", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "SHIFT + CTRL + #", "Date Format", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "SHIFT + CTRL + $", "$ Dollar Format", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "SHIFT + CTRL + %", "% Percentage Format", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "ALT + \"=\"", "Sum Function", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + A", "Select All", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + B", "Bold", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + C", "Copy", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + D", "Fill Down", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + F", "Find", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + I", "Italic", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + N", "New Workbook", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + O", "Open", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + P", "Print", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + R", "Fill Right", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + S", "Save Workbook", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + U", "Underline", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + V", "Paste", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + W", "Close Window", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + X", "Cut", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + Z", "Undo", "Beginner", "General", ""]
];
// =========================
// ADD UPDATED TALLY SHORTCUTS
// =========================

const tallyUpdates = [

  
  ['Tally','▣','Accounting','Ctrl+F12','Configure','Beginner','Configuration','Opens configuration options.'],

  ['Tally','▣','Accounting','Alt+P','Print','Beginner','Reports','Prints the report.'],
  ['Tally','▣','Accounting','Alt+E','Export','Beginner','Reports','Exports the report.'],

  
  ['Tally','▣','Accounting','Alt+C','Create Ledger','Beginner','Masters','Creates a Ledger.'],
  ['Tally','▣','Accounting','Ctrl+Enter','Alter Ledger','Intermediate','Masters','Changes or alters the selected Ledger.'],

 
  ['Tally','▣','Accounting','Ctrl+A','Accept','Beginner','Forms','Accepts a form.'],
  ['Tally','▣','Accounting','Ctrl+N','Calculator','Beginner','Utilities','Switches to Calculator / ODBC section.'],

  ['Tally','▣','Accounting','Alt+R','Hide Ledger','Beginner','Masters','Hides a Ledger.'],
  ['Tally','▣','Accounting','Alt+U','Unhide Ledger','Beginner','Masters','Unhides a Ledger.'],

  ['Tally','▣','Accounting','F1','Select Company / Buttons','Beginner','Company','Selects a company or Accounts and Inventory buttons.'],
  ['Tally','▣','Accounting','F2','Change Period','Beginner','Navigation','Changes the menu period.'],
  ['Tally','▣','Accounting','F3','Select Company','Beginner','Company','Selects the company.'],

  ['Tally','▣','Accounting','F4','Contra Voucher','Beginner','Vouchers','Selects the Contra voucher.'],
  ['Tally','▣','Accounting','F5','Payment Voucher','Beginner','Vouchers','Selects the Payment voucher.'],
  ['Tally','▣','Accounting','F6','Receipt Voucher','Beginner','Vouchers','Selects the Receipt voucher.'],
  ['Tally','▣','Accounting','F7','Journal Voucher','Beginner','Vouchers','Selects the Journal voucher.'],
  ['Tally','▣','Accounting','F8','Sales Voucher','Beginner','Vouchers','Selects the Sales voucher.'],
  ['Tally','▣','Accounting','Ctrl+F8','Credit Note','Beginner','Vouchers','Selects the Credit Note voucher.'],
  ['Tally','▣','Accounting','F9','Purchase Voucher','Beginner','Vouchers','Selects the Purchase voucher.'],
  ['Tally','▣','Accounting','Ctrl+F9','Debit Note','Beginner','Vouchers','Selects the Debit Note voucher.'],
  ['Tally','▣','Accounting','F10','Reversing Journal','Intermediate','Vouchers','Selects the Reversing Journal voucher.'],
  ['Tally','▣','Accounting','F10','Memorandum Voucher','Beginner','Vouchers','Selects the Memorandum voucher.'],
  ['Tally','▣','Accounting','F11','Functions and Features','Beginner','Configuration','Opens the Functions and Features screen.'],

  ['Tally','▣','Accounting','Alt+2','Duplicate Voucher','Beginner','Vouchers','Duplicates a voucher.'],
  ['Tally','▣','Accounting','Alt+A','Add Voucher','Beginner','Vouchers','Adds a voucher.'],
  ['Tally','▣','Accounting','Alt+C','Create Master','Beginner','Masters','Creates a master at a voucher screen.'],
  ['Tally','▣','Accounting','Alt+D','Delete Voucher','Intermediate','Vouchers','Deletes a voucher or master.'],
  ['Tally','▣','Accounting','Alt+I','Insert Voucher','Beginner','Vouchers','Inserts a voucher.'],
  ['Tally','▣','Accounting','Alt+H','Help','Beginner','Help','Opens Help.'],
  ['Tally','▣','Accounting','Alt+O','Upload Report','Intermediate','Reports','Uploads the report to your website.'],
  ['Tally','▣','Accounting','Alt+N','Automatic Columns','Intermediate','Reports','Views reports in automatic columns.'],
  ['Tally','▣','Accounting','Alt+M','Email Report','Beginner','Reports','Emails the report.'],
  ['Tally','▣','Accounting','Alt+P','Print Report','Beginner','Reports','Prints the report.'],
  ['Tally','▣','Accounting','Alt+R','Remove Line','Intermediate','Editing','Removes a line in a report.'],
  ['Tally','▣','Accounting','Alt+S','Restore Line','Intermediate','Editing','Brings back a removed line.'],
  ['Tally','▣','Accounting','Alt+V','Stock Journal','Intermediate','Inventory','Opens Stock Journal from Invoice screen.'],
  ['Tally','▣','Accounting','Alt+W','Tally Web Browser','Intermediate','Web','Opens the Tally Web browser.'],
  ['Tally','▣','Accounting','Alt+Z','Zoom','Beginner','Reports','Zooms the report.'],
  ['Tally','▣','Accounting','Alt+X','Cancel Voucher','Intermediate','Vouchers','Cancels a voucher in Day Book or List of Vouchers.'],

  ['Tally','▣','Accounting','Ctrl+Alt+B','Company Statutory Details','Intermediate','Company','Checks company statutory details.'],
  ['Tally','▣','Accounting','Ctrl+M','Main Area','Beginner','Navigation','Switches to Main Area of Tally screen.'],
  ['Tally','▣','Accounting','Ctrl+R','Repeat Narration','Beginner','Vouchers','Repeats narration in the same voucher type.'],
  ['Tally','▣','Accounting','Ctrl+T','Post Dated Voucher','Intermediate','Vouchers','Marks a voucher as Post Dated.'],
  ['Tally','▣','Accounting','Ctrl+Alt+C','Copy Text','Beginner','Editing','Copies text from Tally.'],
  ['Tally','▣','Accounting','Ctrl+Alt+V','Paste Text','Beginner','Editing','Pastes text into Tally.']
];

const tallyInsert = db.prepare(`
  INSERT INTO shortcuts
  (software, icon, category, keys, action, level, type, example)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const s of tallyUpdates) {
  const exists = db.prepare(`
    SELECT id FROM shortcuts
    WHERE software = ?
      AND keys = ?
      AND action = ?
  `).get(s[0], s[3], s[4]);

  if (!exists) {
    tallyInsert.run(...s);
  }
}
const seed = [
  ["Excel", "📊", "Columns & Rows", "CTRL + 9", "Hide Row", "Beginner", "General", ""],
  ["Excel", "📊", "Columns & Rows", "SHIFT + CTRL + 9", "Unhide Row", "Beginner", "General", ""],
  ["Excel", "📊", "Columns & Rows", "CTRL + 0", "Hide Column", "Beginner", "General", ""],
  ["Excel", "📊", "Columns & Rows", "SHIFT + CTRL + 0", "Unhide Column", "Beginner", "General", ""],
  ["Excel", "📊", "Columns & Rows", "SHIFT + Spacebar", "Highlight Row", "Beginner", "General", ""],
  ["Excel", "📊", "Columns & Rows", "CTRL + Spacebar", "Highlight Column", "Beginner", "General", ""],
  ["Excel", "📊", "Columns & Rows", "SHIFT + CTRL + Plus sign", "Insert Blank Cells", "Beginner", "General", ""],
  ["Excel", "📊", "Columns & Rows", "CTRL + Minus Sign", "Delete Selected Cells", "Beginner", "General", ""],
  ["Excel", "📊", "Columns & Rows", "SHIFT + ALT + Left Arrow", "Group Rows/Columns", "Beginner", "General", ""],
  ["Excel", "📊", "Columns & Rows", "SHIFT + ALT + Right Arrow", "Ungroup Rows/Columns", "Beginner", "General", ""],
  ["Excel", "📊", "Function Key Shortcuts", "F2", "Edit Cells", "Beginner", "General", ""],
  ["Excel", "📊", "Function Key Shortcuts", "F4", "Anchor Cells", "Beginner", "General", ""],
  ["Excel", "📊", "Function Key Shortcuts", "F7", "Spell Check", "Beginner", "General", ""],
  ["Excel", "📊", "Function Key Shortcuts", "F12", "Save As", "Beginner", "General", ""],
  ["Excel", "📊", "Function Key Shortcuts", "SHIFT + F2", "Insert a Comment", "Beginner", "General", ""],
  ["Excel", "📊", "Function Key Shortcuts", "SHIFT + F8", "Add to Selection", "Beginner", "General", ""],
  ["Excel", "📊", "Function Key Shortcuts", "SHIFT + F10", "Right Click", "Beginner", "General", ""],
  ["Excel", "📊", "Function Key Shortcuts", "CTRL + F3", "Name a Cell", "Beginner", "General", ""],
  ["Excel", "📊", "Function Key Shortcuts", "Windows Flag + D", "Minimize Programs", "Beginner", "General", ""],
  ["Excel", "📊", "Navigation Shortcuts", "Arrows", "Move", "Beginner", "General", ""],
  ["Excel", "📊", "Navigation Shortcuts", "CTRL + Arrows", "Go to End of Continuous Range", "Beginner", "General", ""],
  ["Excel", "📊", "Navigation Shortcuts", "SHIFT + Arrows", "Select A Cell Range", "Beginner", "General", ""],
  ["Excel", "📊", "Navigation Shortcuts", "CTRL + SHIFT + Arrows", "Highlight A Continuous Range", "Beginner", "General", ""],
  ["Excel", "📊", "Navigation Shortcuts", "ALT + Tab", "Switch Programs", "Beginner", "General", ""],
  ["Excel", "📊", "Navigation Shortcuts", "CTRL + Pg Up/Down", "Switch Worksheets", "Beginner", "General", ""],
  ["Excel", "📊", "Navigation Shortcuts", "Enter", "Move below", "Beginner", "General", ""],
  ["Excel", "📊", "Navigation Shortcuts", "Shift + Enter", "Move Up", "Beginner", "General", ""],
  ["Excel", "📊", "Navigation Shortcuts", "Home", "Move to Beginning of Line", "Beginner", "General", ""],
  ["Excel", "📊", "Navigation Shortcuts", "CTRL + Home", "Go to Cell A1", "Beginner", "General", ""],
  ["Excel", "📊", "Navigation Shortcuts", "ESC", "Cancel", "Beginner", "General", ""],
  ["Excel", "📊", "Navigation Shortcuts", "Alt + Enter (when in a cell)", "Add a Line", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "CTRL + 1", "Format Box", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "ALT + E + S + T", "Copy Format", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "ALT + H + 0", "Increase Decimal", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "ALT + H + 9", "Decrease Decimal", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "CTRL + SHIFT + 7", "Boxing", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "ALT + O + C + A", "Fit Column Width", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "ALT + H + O + R", "Change Tab Name", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "ALT + W + F", "(Un)Split Panes", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "ALT + W + S", "(Un)freeze windows", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "SHIFT + CTRL + #", "Date Format", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "SHIFT + CTRL + $", "$ Dollar Format", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "SHIFT + CTRL + %", "% Percentage Format", "Beginner", "General", ""],
  ["Excel", "📊", "Formatting Shortcuts", "ALT + \"=\"", "Sum Function", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + A", "Select All", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + B", "Bold", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + C", "Copy", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + D", "Fill Down", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + F", "Find", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + I", "Italic", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + N", "New Workbook", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + O", "Open", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + P", "Print", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + R", "Fill Right", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + S", "Save Workbook", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + U", "Underline", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + V", "Paste", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + W", "Close Window", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + X", "Cut", "Beginner", "General", ""],
  ["Excel", "📊", "CTRL Shortcuts", "CTRL + Z", "Undo", "Beginner", "General", ""],

  ['Word','📝','Office','Ctrl+B','Bold','Beginner','Formatting','Makes selected text bold.'],
  ['Word','📝','Office','Ctrl+P','Print','Beginner','File','Opens print settings.'],
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

/* =========================
   SEED / UPDATE SHORTCUTS
========================= */

// Remove only PowerPoint data before adding its maintained shortcut list.
// Tally and Windows are seeded above and must not be deleted on every start.
db.prepare(`
  DELETE FROM shortcuts
  WHERE software = 'PowerPoint'
`).run();

// Also remove these old apps if you want them replaced
db.prepare(`
  DELETE FROM shortcuts
  WHERE software IN ('Gmail', 'VS Code', 'Google Sheets')
`).run();

const ins = db.prepare(`
  INSERT INTO shortcuts
  (software, icon, category, keys, action, level, type, example)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const s of seed) {
  ins.run(...s);
}

const powerPointUpdates = [
  ['PowerPoint', '📽️', 'Presentation', 'Ctrl + M', 'New slide', 'Beginner', 'Slides', 'Inserts a new slide.'],
  ['PowerPoint', '📽️', 'Presentation', 'Ctrl + D', 'Duplicate slide or object', 'Beginner', 'Slides', 'Duplicates the selection.'],
  ['PowerPoint', '📽️', 'File', 'Ctrl + S', 'Save presentation', 'Beginner', 'File', 'Saves the current presentation.'],
  ['PowerPoint', '📽️', 'File', 'Ctrl + Shift + S', 'Save as', 'Beginner', 'File', 'Saves a copy with a new name.'],
  ['PowerPoint', '📽️', 'File', 'Ctrl + P', 'Print presentation', 'Beginner', 'File', 'Opens print settings.'],
  ['PowerPoint', '📽️', 'Editing', 'Ctrl + Z', 'Undo', 'Beginner', 'Editing', 'Undoes the previous action.'],
  ['PowerPoint', '📽️', 'Editing', 'Ctrl + Y', 'Redo', 'Beginner', 'Editing', 'Redoes the previous action.'],
  ['PowerPoint', '📽️', 'Editing', 'Ctrl + C', 'Copy', 'Beginner', 'Editing', 'Copies the selection.'],
  ['PowerPoint', '📽️', 'Editing', 'Ctrl + V', 'Paste', 'Beginner', 'Editing', 'Pastes the clipboard.'],
  ['PowerPoint', '📽️', 'Editing', 'Ctrl + X', 'Cut', 'Beginner', 'Editing', 'Cuts the selection.'],
  ['PowerPoint', '📽️', 'Formatting', 'Ctrl + B', 'Bold', 'Beginner', 'Formatting', 'Makes selected text bold.'],
  ['PowerPoint', '📽️', 'Formatting', 'Ctrl + I', 'Italic', 'Beginner', 'Formatting', 'Makes selected text italic.'],
  ['PowerPoint', '📽️', 'Formatting', 'Ctrl + U', 'Underline', 'Beginner', 'Formatting', 'Underlines selected text.'],
  ['PowerPoint', '📽️', 'Presentation', 'F5', 'Start slideshow from beginning', 'Beginner', 'Slideshow', 'Starts the slideshow from the first slide.'],
  ['PowerPoint', '📽️', 'Presentation', 'Shift + F5', 'Start slideshow from current slide', 'Beginner', 'Slideshow', 'Starts from the current slide.'],
  ['PowerPoint', '📽️', 'Presentation', 'Esc', 'End slideshow', 'Beginner', 'Slideshow', 'Ends the slideshow.'],
  ['PowerPoint', '📽️', 'Presentation', 'Page Down', 'Next slide', 'Beginner', 'Slideshow', 'Moves to the next slide.'],
  ['PowerPoint', '📽️', 'Presentation', 'Page Up', 'Previous slide', 'Beginner', 'Slideshow', 'Moves to the previous slide.'],
  ['PowerPoint', '📽️', 'Views', 'Alt + W, Q', 'Open zoom dialog', 'Intermediate', 'Views', 'Opens the Zoom dialog box.'],
  ['PowerPoint', '📽️', 'Views', 'Ctrl + F6', 'Switch presentations', 'Intermediate', 'Views', 'Switches between open presentations.'],
];

for (const shortcut of powerPointUpdates) {
  ins.run(...shortcut);
}

// ShortcutHub migration: remove unwanted shortcut categories
try {
  const removeUnwanted = db.prepare("DELETE FROM shortcuts WHERE software IN (?, ?, ?)");
  removeUnwanted.run("Google Sheets", "Gmail", "VS Code");
} catch (e) {
  console.error("Unwanted shortcut removal failed:", e);
}
const wordShortcuts = [
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + A",
    "Select All text or items in a document",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + B",
    "Bold selected text",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + C",
    "Copy selected text or items",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + D",
    "Open the Font formatting dialog box",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + E",
    "Center align selected text",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + F",
    "Open the Find dialog box",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + G",
    "Open the Go To dialog box",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + H",
    "Open the Replace dialog box",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + I",
    "Italicize selected text",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + J",
    "Justify alignment of the text",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + K",
    "Insert a hyperlink",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + L",
    "Left align selected text",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + M",
    "Increase indent of the paragraph",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + N",
    "Create a new document",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + O",
    "Open an existing document",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + P",
    "Print the document",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + Q",
    "Remove paragraph formatting",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + R",
    "Right align selected text",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + S",
    "Save the document",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + T",
    "Create a hanging indent",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + U",
    "Underline selected text",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + V",
    "Paste copied text or items",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + W",
    "Close the document",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + X",
    "Cut selected text or items",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + Y",
    "Redo the last action",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + Z",
    "Undo the last action",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + C",
    "Copy",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + X",
    "Cut",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + V",
    "Paste",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + Z",
    "Undo",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + Y",
    "Redo",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Basic Editing",
    "Ctrl + A",
    "Select All",
    "Beginner",
    "Basic Editing",
    ""
  ],
  [
    "Word",
    "📝",
    "Formatting",
    "Ctrl + B",
    "Bold",
    "Beginner",
    "Formatting",
    ""
  ],
  [
    "Word",
    "📝",
    "Formatting",
    "Ctrl + I",
    "Italic",
    "Beginner",
    "Formatting",
    ""
  ],
  [
    "Word",
    "📝",
    "Formatting",
    "Ctrl + U",
    "Underline",
    "Beginner",
    "Formatting",
    ""
  ],
  [
    "Word",
    "📝",
    "Formatting",
    "Ctrl + D, then Alt + K",
    "Strikethrough",
    "Beginner",
    "Formatting",
    ""
  ],
  [
    "Word",
    "📝",
    "Formatting",
    "Ctrl + Shift + +",
    "Superscript",
    "Beginner",
    "Formatting",
    ""
  ],
  [
    "Word",
    "📝",
    "Formatting",
    "Ctrl + =",
    "Subscript",
    "Beginner",
    "Formatting",
    ""
  ],
  [
    "Word",
    "📝",
    "Formatting",
    "Ctrl + Shift + >",
    "Increase Font Size",
    "Beginner",
    "Formatting",
    ""
  ],
  [
    "Word",
    "📝",
    "Formatting",
    "Ctrl + Shift + <",
    "Decrease Font Size",
    "Beginner",
    "Formatting",
    ""
  ],
  [
    "Word",
    "📝",
    "Formatting",
    "Ctrl + Spacebar",
    "Clear Formatting",
    "Beginner",
    "Formatting",
    ""
  ],
  [
    "Word",
    "📝",
    "Formatting",
    "Shift + F3",
    "Change Case (Toggle)",
    "Beginner",
    "Formatting",
    ""
  ],
  [
    "Word",
    "📝",
    "Paragraph Formatting",
    "Ctrl + L",
    "Align Left",
    "Beginner",
    "Paragraph Formatting",
    ""
  ],
  [
    "Word",
    "📝",
    "Paragraph Formatting",
    "Ctrl + E",
    "Align Center",
    "Beginner",
    "Paragraph Formatting",
    ""
  ],
  [
    "Word",
    "📝",
    "Paragraph Formatting",
    "Ctrl + R",
    "Align Right",
    "Beginner",
    "Paragraph Formatting",
    ""
  ],
  [
    "Word",
    "📝",
    "Paragraph Formatting",
    "Ctrl + J",
    "Justify",
    "Beginner",
    "Paragraph Formatting",
    ""
  ],
  [
    "Word",
    "📝",
    "Paragraph Formatting",
    "Ctrl + 1",
    "Single Line Spacing",
    "Beginner",
    "Paragraph Formatting",
    ""
  ],
  [
    "Word",
    "📝",
    "Paragraph Formatting",
    "Ctrl + 2",
    "Double Line Spacing",
    "Beginner",
    "Paragraph Formatting",
    ""
  ],
  [
    "Word",
    "📝",
    "Paragraph Formatting",
    "Ctrl + 5",
    "1.5 Line Spacing",
    "Beginner",
    "Paragraph Formatting",
    ""
  ],
  [
    "Word",
    "📝",
    "Paragraph Formatting",
    "Ctrl + M",
    "Increase Paragraph Indent",
    "Beginner",
    "Paragraph Formatting",
    ""
  ],
  [
    "Word",
    "📝",
    "Paragraph Formatting",
    "Ctrl + Shift + M",
    "Decrease Paragraph Indent",
    "Beginner",
    "Paragraph Formatting",
    ""
  ],
  [
    "Word",
    "📝",
    "Paragraph Formatting",
    "Ctrl + Shift + L",
    "Create Bullet Point",
    "Beginner",
    "Paragraph Formatting",
    ""
  ],
  [
    "Word",
    "📝",
    "Navigating Documents",
    "Ctrl + Home",
    "Move to the beginning of document",
    "Beginner",
    "Navigating Documents",
    ""
  ],
  [
    "Word",
    "📝",
    "Navigating Documents",
    "Ctrl + End",
    "Move to the end of document",
    "Beginner",
    "Navigating Documents",
    ""
  ],
  [
    "Word",
    "📝",
    "Navigating Documents",
    "Ctrl + Left Arrow",
    "Move one word to the left",
    "Beginner",
    "Navigating Documents",
    ""
  ],
  [
    "Word",
    "📝",
    "Navigating Documents",
    "Ctrl + Right Arrow",
    "Move one word to the right",
    "Beginner",
    "Navigating Documents",
    ""
  ],
  [
    "Word",
    "📝",
    "Navigating Documents",
    "Ctrl + Up Arrow",
    "Move one paragraph up",
    "Beginner",
    "Navigating Documents",
    ""
  ],
  [
    "Word",
    "📝",
    "Navigating Documents",
    "Ctrl + Down Arrow",
    "Move one paragraph down",
    "Beginner",
    "Navigating Documents",
    ""
  ],
  [
    "Word",
    "📝",
    "Navigating Documents",
    "Page Up",
    "Scroll up one screen",
    "Beginner",
    "Navigating Documents",
    ""
  ],
  [
    "Word",
    "📝",
    "Navigating Documents",
    "Page Down",
    "Scroll down one screen",
    "Beginner",
    "Navigating Documents",
    ""
  ],
  [
    "Word",
    "📝",
    "Text Selection",
    "Shift + Arrow Keys",
    "Select by character",
    "Beginner",
    "Text Selection",
    ""
  ],
  [
    "Word",
    "📝",
    "Text Selection",
    "Ctrl + Shift + Left/Right Arrow",
    "Select by word",
    "Beginner",
    "Text Selection",
    ""
  ],
  [
    "Word",
    "📝",
    "Text Selection",
    "Ctrl + Shift + Up/Down Arrow",
    "Select by paragraph",
    "Beginner",
    "Text Selection",
    ""
  ],
  [
    "Word",
    "📝",
    "Text Selection",
    "Ctrl + A",
    "Select entire document",
    "Beginner",
    "Text Selection",
    ""
  ],
  [
    "Word",
    "📝",
    "Text Selection",
    "Ctrl + Shift + Home",
    "Select from cursor to beginning",
    "Beginner",
    "Text Selection",
    ""
  ],
  [
    "Word",
    "📝",
    "Text Selection",
    "Ctrl + Shift + End",
    "Select from cursor to end",
    "Beginner",
    "Text Selection",
    ""
  ],
  [
    "Word",
    "📝",
    "Inserting Special Items",
    "Ctrl + K",
    "Insert Hyperlink",
    "Beginner",
    "Inserting Special Items",
    ""
  ],
  [
    "Word",
    "📝",
    "Inserting Special Items",
    "Alt + Ctrl + F",
    "Insert Footnote",
    "Beginner",
    "Inserting Special Items",
    ""
  ],
  [
    "Word",
    "📝",
    "Inserting Special Items",
    "Alt + Ctrl + D",
    "Insert Endnote",
    "Beginner",
    "Inserting Special Items",
    ""
  ],
  [
    "Word",
    "📝",
    "Inserting Special Items",
    "Ctrl + Enter",
    "Insert Page Break",
    "Beginner",
    "Inserting Special Items",
    ""
  ],
  [
    "Word",
    "📝",
    "Inserting Special Items",
    "Alt + Shift + D",
    "Insert Date Field",
    "Beginner",
    "Inserting Special Items",
    ""
  ],
  [
    "Word",
    "📝",
    "Inserting Special Items",
    "Alt + Shift + T",
    "Insert Time Field",
    "Beginner",
    "Inserting Special Items",
    ""
  ],
  [
    "Word",
    "📝",
    "Other Useful Shortcuts",
    "Ctrl + O",
    "Open Document",
    "Beginner",
    "Other Useful Shortcuts",
    ""
  ],
  [
    "Word",
    "📝",
    "Other Useful Shortcuts",
    "Ctrl + N",
    "Create New Document",
    "Beginner",
    "Other Useful Shortcuts",
    ""
  ],
  [
    "Word",
    "📝",
    "Other Useful Shortcuts",
    "Ctrl + S",
    "Save Document",
    "Beginner",
    "Other Useful Shortcuts",
    ""
  ],
  [
    "Word",
    "📝",
    "Other Useful Shortcuts",
    "Ctrl + P",
    "Print Document",
    "Beginner",
    "Other Useful Shortcuts",
    ""
  ],
  [
    "Word",
    "📝",
    "Other Useful Shortcuts",
    "Ctrl + W",
    "Close Document",
    "Beginner",
    "Other Useful Shortcuts",
    ""
  ],
  [
    "Word",
    "📝",
    "Other Useful Shortcuts",
    "Ctrl + F",
    "Open the Navigation Pane",
    "Beginner",
    "Other Useful Shortcuts",
    ""
  ],
  [
    "Word",
    "📝",
    "Other Useful Shortcuts",
    "F7",
    "Spell Check",
    "Beginner",
    "Other Useful Shortcuts",
    ""
  ],
   [
    "Word",
    "📝",
    "Other Useful Shortcuts",
    "Ctrl + F",
    "Open Find Dialog",
    "Beginner",
    "Other Useful Shortcuts",
    ""
  ],
  [
    "Word",
    "📝",
    "Other Useful Shortcuts",
    "Ctrl + H",
    "Open Replace Dialog",
    "Beginner",
    "Other Useful Shortcuts",
    ""
  ],
  [
    "Word",
    "📝",
    "Other Useful Shortcuts",
    "Ctrl + G",
    "Open Go To Dialog",
    "Beginner",
    "Other Useful Shortcuts",
    ""
  ],
  [
    "Word",
    "📝",
    "Other Useful Shortcuts",
    "F4",
    "Repeat the Last Action",
    "Beginner",
    "Other Useful Shortcuts",
    ""
  ],
  [
    "Word",
    "📝",
    "Other Useful Shortcuts",
    "Ctrl + Mouse Scroll Up",
    "Zoom In",
    "Beginner",
    "Other Useful Shortcuts",
    ""
  ],
  [
    "Word",
    "📝",
    "Other Useful Shortcuts",
    "Ctrl + Mouse Scroll Down",
    "Zoom Out",
    "Beginner",
    "Other Useful Shortcuts",
    ""
  ],
  [
    "Word",
    "📝",
    "Table Operations",
    "Tab",
    "Move to next cell in a table",
    "Beginner",
    "Table Operations",
    ""
  ],
  [
    "Word",
    "📝",
    "Table Operations",
    "Shift + Tab",
    "Move to previous cell in a table",
    "Beginner",
    "Table Operations",
    ""
  ],
  [
    "Word",
    "📝",
    "Table Operations",
    "Tab in the last cell",
    "Add a row below",
    "Beginner",
    "Table Operations",
    ""
  ],
  [
    "Word",
    "📝",
    "Windows-Specific Shortcuts",
    "Ctrl + Shift + Esc",
    "Open Task Manager",
    "Beginner",
    "Windows-Specific Shortcuts",
    ""
  ],
  [
    "Word",
    "📝",
    "Windows-Specific Shortcuts",
    "Windows Key + M",
    "Minimize All Windows",
    "Beginner",
    "Windows-Specific Shortcuts",
    ""
  ],
  [
    "Word",
    "📝",
    "Windows-Specific Shortcuts",
    "Alt + Tab",
    "Switch Between Open Applications",
    "Beginner",
    "Windows-Specific Shortcuts",
    ""
  ],
  [
    "Word",
    "📝",
    "Windows-Specific Shortcuts",
    "Windows Key + L",
    "Lock the Computer",
    "Beginner",
    "Windows-Specific Shortcuts",
    ""
  ]
];

/* =========================
   EXCEL SHORTCUT MIGRATION
   Replaces the original 4 Excel shortcuts with the spreadsheet list.
   Runs once so Render restarts do not keep deleting/re-adding shortcuts.
========================= */

db.exec(`
CREATE TABLE IF NOT EXISTS app_migrations(
  name TEXT PRIMARY KEY,
  applied_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

const excelMigration = 'excel_shortcuts_pdf_v1';
const migrationDone = db.prepare(
  'SELECT 1 FROM app_migrations WHERE name=?'
).get(excelMigration);

if (!migrationDone) {
  const replaceExcel = db.transaction(() => {
    db.prepare('DELETE FROM shortcuts WHERE software=?').run('Excel');

    const insertExcel = db.prepare(`
      INSERT INTO shortcuts
      (software,icon,category,keys,action,level,type,example)
      VALUES(?,?,?,?,?,?,?,?)
    `);

    excelShortcuts.forEach(row => insertExcel.run(...row));

    db.prepare(
      'INSERT INTO app_migrations(name) VALUES(?)'
    ).run(excelMigration);
  });

  replaceExcel();
}

/* =========================
   WORD SHORTCUT MIGRATION
   Replaces all older Word shortcuts with the supplied Word shortcut list.
   Runs once so Render restarts do not keep deleting/re-adding shortcuts.
========================= */

const wordMigration = 'word_shortcuts_user_v1';
const wordMigrationDone = db.prepare(
  'SELECT 1 FROM app_migrations WHERE name=?'
).get(wordMigration);

if (!wordMigrationDone) {
  const replaceWord = db.transaction(() => {
    db.prepare('DELETE FROM shortcuts WHERE software=?').run('Word');

    const insertWord = db.prepare(`
      INSERT INTO shortcuts
      (software,icon,category,keys,action,level,type,example)
      VALUES(?,?,?,?,?,?,?,?)
    `);

    wordShortcuts.forEach(row => insertWord.run(...row));

    db.prepare(
      'INSERT INTO app_migrations(name) VALUES(?)'
    ).run(wordMigration);
  });

  replaceWord();
}

/* =========================
   BUSY SHORTCUTS
   Supplied shortcut list. Replaces all older BUSY shortcuts.
========================= */

const busyShortcuts = [
    ["BUSY", "B", "Accounting", 'Ctrl+F3', 'Add Voucher', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'F2', 'Save Master / Voucher', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'F6', 'Change Voucher Type', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'F8', 'Delete Selected Masters / Vouchers', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Alt + X', 'Cancel / Activate Voucher', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'F1', 'Global Help Screen', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+F1', 'Add Account', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+F2', 'Add Item', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'F3', 'Add Master', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+F5', 'Add Payment', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+F6', 'Add Receipt', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+F7', 'Add Journal', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+F8', 'Add Sales', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+F9', 'Add Purchase', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+B', 'Balance Sheet', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+T', 'Trial Balance', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+S', 'Stock Status', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+A', 'Account Summary', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+L', 'Account Ledger', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+I', 'Item Summary', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+D', 'Item Ledger', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+G', 'GST Summary', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+U', 'Switch User', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+F', 'Configuration', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+K', 'Lock Program', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'F10', 'Calculator', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'F1', 'Help on current Page / Topic', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'F3', 'Add Master', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'F4', 'Standard Narration', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'F5', 'List of Records', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'F7', 'Repeat Last Value', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'F8', 'Delete Selected Masters / Vouchers', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'F9', 'Delete Selected Row in Grid', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'F10', 'Calculator', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'F11', 'Pick Items from Orders or Challan', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'F12', 'Copy or Duplicate Record', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Alt + M', 'Modify Master', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Alt + P', 'Print Record', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Page Up', 'Previous Record', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Page Down', 'Next Record', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+Alt+M', 'Main Menu', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+Alt+A', 'Administration Menu', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+Alt+T', 'Transaction Menu', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+Alt+D', 'Display Menu', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+Alt+P', 'Printing Menu', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+Alt+H', 'Help Menu', "Beginner", "General", ""],
    ["BUSY", "B", "Accounting", 'Ctrl+Alt+F', 'Favourites Menu', "Beginner", "General", ""]
];

/* =========================
   BUSY SHORTCUT MIGRATION
   Replaces all older BUSY shortcuts with the supplied list.
   Runs once so Render restarts do not keep deleting/re-adding shortcuts.
========================= */

const busyMigration = 'busy_shortcuts_user_v1';
const busyMigrationDone = db.prepare(
  'SELECT 1 FROM app_migrations WHERE name=?'
).get(busyMigration);

if (!busyMigrationDone) {
  const replaceBusy = db.transaction(() => {
    db.prepare('DELETE FROM shortcuts WHERE software=?').run('BUSY');

    const insertBusy = db.prepare(`
      INSERT INTO shortcuts
      (software,icon,category,keys,action,level,type,example)
      VALUES(?,?,?,?,?,?,?,?)
    `);

    busyShortcuts.forEach(row => insertBusy.run(...row));

    db.prepare(
      'INSERT INTO app_migrations(name) VALUES(?)'
    ).run(busyMigration);
  });

  replaceBusy();
}

/* =========================
   CHROME SHORTCUTS
   Replaces all older Chrome shortcuts with the supplied list.
========================= */

const chromeShortcuts = [
  ["Chrome", "🌐", "Navigation", "Alt+Home", "Open your home page.", "Beginner", "Navigation", ""],
  ["Chrome", "🌐", "Navigation", "Alt+←", "Back a page.", "Beginner", "Navigation", ""],
  ["Chrome", "🌐", "Navigation", "Alt+→", "Forward a page.", "Beginner", "Navigation", ""],
  ["Chrome", "🌐", "Navigation", "Alt+↓", "Display all previous text entered in a text box and available options on a drop-down menu.", "Beginner", "Navigation", ""],
  ["Chrome", "🌐", "Display", "F11", "Display the current website in full-screen mode. Pressing F11 again will exit this mode.", "Beginner", "Display", ""],
  ["Chrome", "🌐", "Navigation", "Esc", "Stop loading the page or a download from loading.", "Beginner", "Navigation", ""],
  ["Chrome", "🌐", "Zoom", "Ctrl+-", "Zoom out of a web page and decrease font size (if supported).", "Beginner", "Zoom", ""],
  ["Chrome", "🌐", "Zoom", "Ctrl++", "Zoom in on a web page and decrease font size (if supported).", "Beginner", "Zoom", ""],
  ["Chrome", "🌐", "Zoom", "Ctrl+0", "Reset browser zoom to default.", "Beginner", "Zoom", ""],
  ["Chrome", "🌐", "Tabs", "Ctrl+1 - Ctrl+8", "Pressing Ctrl and any number 1 through 8 moves to the corresponding tab in your tab bar.", "Beginner", "Tabs", ""],
  ["Chrome", "🌐", "Tabs", "Ctrl+9", "Switch to the last tab.", "Beginner", "Tabs", ""],
  ["Chrome", "🌐", "Address Bar", "Ctrl+Enter", "This combination is used to quickly complete an address. For example, type \"computerhope\" in the address bar and press Ctrl+Enter to get https://www.computerhope.com.", "Beginner", "Address Bar", ""],
  ["Chrome", "🌐", "Privacy", "Ctrl+Shift+Delete", "Open the Clear browsing data window to quickly clear private data.", "Beginner", "Privacy", ""],
  ["Chrome", "🌐", "Tabs", "Ctrl+Shift+A", "Search open tabs.", "Beginner", "Tabs", ""],
  ["Chrome", "🌐", "Bookmarks", "Ctrl+Shift+B", "Toggle the bookmarks bar between hidden and shown.", "Beginner", "Bookmarks", ""],
  ["Chrome", "🌐", "Refresh", "Ctrl+Shift+R", "Clear the cache for the current page and refresh.", "Intermediate", "Refresh", ""],
  ["Chrome", "🌐", "Tools", "Shift+Esc", "Opens the Google Chrome Task Manager.", "Intermediate", "Tools", ""],
  ["Chrome", "🌐", "Editing", "Ctrl+A", "Select everything on a page.", "Beginner", "Editing", ""],
  ["Chrome", "🌐", "Bookmarks", "Ctrl+D", "Add a bookmark for the page currently opened.", "Beginner", "Bookmarks", ""],
  ["Chrome", "🌐", "Search", "Ctrl+F", "Open the \"find\" bar to search text on the current page.", "Beginner", "Search", ""],
  ["Chrome", "🌐", "Files", "Ctrl+O", "Open a file in the browser.", "Beginner", "Files", ""],
  ["Chrome", "🌐", "Bookmarks", "Ctrl+Shift+O", "Open the Bookmark manager.", "Beginner", "Bookmarks", ""],
  ["Chrome", "🌐", "History", "Ctrl+H", "Open browser history in a new tab.", "Beginner", "History", ""],
  ["Chrome", "🌐", "Downloads", "Ctrl+J", "Display the downloads window.", "Beginner", "Downloads", ""],
  ["Chrome", "🌐", "Address Bar", "Ctrl+K or Ctrl+E", "Moves your text cursor to the omnibox so that you can begin typing your search query and perform a Google search.", "Beginner", "Address Bar", ""],
  ["Chrome", "🌐", "Address Bar", "Ctrl+L, Alt+D", "Move the cursor to the browser address bar and highlight everything in it.", "Beginner", "Address Bar", ""],
  ["Chrome", "🌐", "Windows", "Ctrl+N", "Open New browser window.", "Beginner", "Windows", ""],
  ["Chrome", "🌐", "Privacy", "Ctrl+Shift+N", "Open a new window in incognito (private) mode.", "Beginner", "Privacy", ""],
  ["Chrome", "🌐", "Printing", "Ctrl+P", "Print the current page or frame.", "Beginner", "Printing", ""],
  ["Chrome", "🌐", "Refresh", "Ctrl+R or F5", "Refresh the current page or frame.", "Beginner", "Refresh", ""],
  ["Chrome", "🌐", "Files", "Ctrl+S", "Opens the Save As window to save the current page.", "Beginner", "Files", ""],
  ["Chrome", "🌐", "Tabs", "Ctrl+T", "Opens a new tab.", "Beginner", "Tabs", ""],
  ["Chrome", "🌐", "Developer", "Ctrl+U", "View a web page's source code.", "Intermediate", "Developer", ""],
  ["Chrome", "🌐", "Tabs", "Ctrl+W", "Closes the current tab.", "Beginner", "Tabs", ""],
  ["Chrome", "🌐", "Windows", "Ctrl+Shift+W", "Closes the currently active window.", "Beginner", "Windows", ""],
  ["Chrome", "🌐", "Tabs", "Ctrl+Shift+T", "This combination reopens the last tab you've closed. If you've closed multiple tabs, press this keyboard shortcut multiple times to restore each of the closed tabs.", "Beginner", "Tabs", ""],
  ["Chrome", "🌐", "Tabs", "Ctrl+Tab", "Moves through each of the open tabs (left to right). Doing Ctrl+Shift+Tab reverses the direction (right to left).", "Beginner", "Tabs", ""],
  ["Chrome", "🌐", "Tabs", "Ctrl+Left-click", "Open a link in a new tab in the background.", "Beginner", "Tabs", ""],
  ["Chrome", "🌐", "Tabs", "Ctrl+Shift+Left-click", "Open a link in a new tab and switch to the new tab.", "Beginner", "Tabs", ""],
  ["Chrome", "🌐", "Tabs", "Ctrl+PgDn", "Open the browser tab to the right.", "Beginner", "Tabs", ""],
  ["Chrome", "🌐", "Tabs", "Ctrl+PgUp", "Open the browser tab to the left.", "Beginner", "Tabs", ""],
  ["Chrome", "🌐", "Navigation", "Spacebar", "Moves down a page at a time.", "Beginner", "Navigation", ""],
  ["Chrome", "🌐", "Navigation", "Shift+spacebar", "Moves up a page at a time.", "Beginner", "Navigation", ""],
  ["Chrome", "🌐", "Bookmarks", "Alt+Shift+B", "Opens the browser bookmarks bar.", "Beginner", "Bookmarks", ""],
  ["Chrome", "🌐", "Feedback", "Alt+Shift+I", "Open the Chrome feedback window.", "Beginner", "Feedback", ""],
  ["Chrome", "🌐", "Navigation", "Home", "Go to the top of the page.", "Beginner", "Navigation", ""],
  ["Chrome", "🌐", "Navigation", "End", "Go to the bottom of the page.", "Beginner", "Navigation", ""],
  ["Chrome", "🌐", "Menu", "F10", "Selects the kebab menu. Once selected, press Enter or the down arrow to access the items in the menu.", "Beginner", "Menu", ""]
];


const photoshopShortcuts = [
  ["Photoshop", "🎨", "General", 'V', 'Move tool', "Beginner", "General", "Windows: V | Mac: V" ],
  ["Photoshop", "🎨", "General", 'CTRL+ALT+T', 'Transform tool', "Beginner", "General", "Windows: CTRL+ALT+T | Mac: CMD+OPT+T" ],
  ["Photoshop", "🎨", "General", 'L', 'Lasso tool', "Beginner", "General", "Windows: L | Mac: L" ],
  ["Photoshop", "🎨", "General", 'W', 'Quick selection tool', "Beginner", "General", "Windows: W | Mac: W" ],
  ["Photoshop", "🎨", "General", 'M', 'Rectangular marquee tool', "Beginner", "General", "Windows: M | Mac: M" ],
  ["Photoshop", "🎨", "General", 'M', 'Elliptical marquee tool', "Beginner", "General", "Windows: M | Mac: M" ],
  ["Photoshop", "🎨", "General", 'SHIFT+M', 'Switch between marquee tools', "Beginner", "General", "Windows: SHIFT+M | Mac: SHIFT+M" ],
  ["Photoshop", "🎨", "General", 'B', 'Brush tool', "Beginner", "General", "Windows: B | Mac: B" ],
  ["Photoshop", "🎨", "General", 'E', 'Eraser tool', "Beginner", "General", "Windows: E | Mac: E" ],
  ["Photoshop", "🎨", "General", 'G', 'Paint bucket tool', "Beginner", "General", "Windows: G | Mac: G" ],
  ["Photoshop", "🎨", "General", 'G', 'Gradient tool', "Beginner", "General", "Windows: G | Mac: G" ],
  ["Photoshop", "🎨", "General", 'SHIFT+G', 'Switch between Paint bucket and Gradient tool', "Beginner", "General", "Windows: SHIFT+G | Mac: SHIFT+G" ],
  ["Photoshop", "🎨", "General", 'J', 'Spot healing brush tool', "Beginner", "General", "Windows: J | Mac: J" ],
  ["Photoshop", "🎨", "General", 'S', 'Clone stamp tool', "Beginner", "General", "Windows: S | Mac: S" ],
  ["Photoshop", "🎨", "General", 'I', 'Eyedropper tool', "Beginner", "General", "Windows: I | Mac: I" ],
  ["Photoshop", "🎨", "General", 'X', 'Switch foreground and background colors', "Beginner", "General", "Windows: X | Mac: X" ],
  ["Photoshop", "🎨", "General", 'CTRL+Z', 'Undo', "Beginner", "General", "Windows: CTRL+Z | Mac: CMD+Z" ],
  ["Photoshop", "🎨", "General", 'SHIFT+CTRL+Z', 'Redo', "Beginner", "General", "Windows: SHIFT+CTRL+Z | Mac: SHIFT+CMD+Z" ],
  ["Photoshop", "🎨", "General", 'CTRL+A', 'Select all', "Beginner", "General", "Windows: CTRL+A | Mac: CMD+A" ],
  ["Photoshop", "🎨", "General", 'CTRL+D', 'Deselect', "Beginner", "General", "Windows: CTRL+D | Mac: CMD+D" ],
  ["Photoshop", "🎨", "General", 'SHFT+CTRL+D', 'Reselect', "Beginner", "General", "Windows: SHFT+CTRL+D | Mac: SHIFT+CMD+D" ],
  ["Photoshop", "🎨", "General", 'SHIFT+CTRL+I', 'Invert selection', "Beginner", "General", "Windows: SHIFT+CTRL+I | Mac: SHIFT+CMD+I" ],
  ["Photoshop", "🎨", "General", 'CTRL+I', 'Invert image', "Beginner", "General", "Windows: CTRL+I | Mac: CMD+I" ],
  ["Photoshop", "🎨", "General", 'CTRL++', 'Zoom in', "Beginner", "General", "Windows: CTRL++ | Mac: CMD++" ],
  ["Photoshop", "🎨", "General", 'CTRL--', 'Zoom out', "Beginner", "General", "Windows: CTRL-- | Mac: CMD--" ],
  ["Photoshop", "🎨", "General", 'CTRL+0', 'Zoom to fit', "Beginner", "General", "Windows: CTRL+0 | Mac: CMD+0" ],
  ["Photoshop", "🎨", "General", 'CTRL+1', 'Zoom to 100%', "Beginner", "General", "Windows: CTRL+1 | Mac: CMD+1" ],
  ["Photoshop", "🎨", "General", 'CTRL+2', 'Zoom to 200%', "Beginner", "General", "Windows: CTRL+2 | Mac: CMD+2" ],
  ["Photoshop", "🎨", "General", 'CTRL+S', 'Save', "Beginner", "General", "Windows: CTRL+S | Mac: CMD+S" ],
  ["Photoshop", "🎨", "General", 'ALT+SHIFT+CTRL+W', 'Export', "Beginner", "General", "Windows: ALT+SHIFT+CTRL+W | Mac: OPT+SHIFT+CMD+W" ],
  ["Photoshop", "🎨", "General", 'ALT+SHIFT+CTRL+I', 'File Info', "Beginner", "General", "Windows: ALT+SHIFT+CTRL+I | Mac: OPT+SHIFT+CMD+I" ],
  ["Photoshop", "🎨", "General", 'ALT+SHIFT+CTRL+N', 'Add new layer', "Beginner", "General", "Windows: ALT+SHIFT+CTRL+N | Mac: OPT+SHIFT+CMD+N" ],
  ["Photoshop", "🎨", "General", 'CTRL+J', 'New layer via copy', "Beginner", "General", "Windows: CTRL+J | Mac: CMD+J" ],
  ["Photoshop", "🎨", "General", 'SHIFT+CTRL+J', 'New layer via cut', "Beginner", "General", "Windows: SHIFT+CTRL+J | Mac: SHIFT+CMD+J" ],
  ["Photoshop", "🎨", "General", 'ALT+CTRL+G', 'Create/Release Clipping mask', "Beginner", "General", "Windows: ALT+CTRL+G | Mac: OPT+CMD+G" ],
  ["Photoshop", "🎨", "General", 'CTRL+G', 'Group layers', "Beginner", "General", "Windows: CTRL+G | Mac: CMD+G" ],
  ["Photoshop", "🎨", "General", 'SHIFT+CTRL+G', 'Ungroup layers', "Beginner", "General", "Windows: SHIFT+CTRL+G | Mac: SHIFT+CMD+G" ],
  ["Photoshop", "🎨", "General", 'CTRL+,', 'Hide layers', "Beginner", "General", "Windows: CTRL+, | Mac: CMD+," ],
  ["Photoshop", "🎨", "General", 'ALT+CTRL+A', 'Select all layers', "Beginner", "General", "Windows: ALT+CTRL+A | Mac: OPT+CMD+A" ],
  ["Photoshop", "🎨", "General", 'ALT+.', 'Select top layer', "Beginner", "General", "Windows: ALT+. | Mac: OPT+." ],
  ["Photoshop", "🎨", "General", 'ALT+,', 'Select bottom layer', "Beginner", "General", "Windows: ALT+, | Mac: OPT+," ],
  ["Photoshop", "🎨", "General", 'ALT+CTRL+]', 'Bring to front', "Beginner", "General", "Windows: ALT+CTRL+] | Mac: OPT+CMD+]" ],
  ["Photoshop", "🎨", "General", 'CTRL+]', 'Bring forward', "Beginner", "General", "Windows: CTRL+] | Mac: CMD+]" ],
  ["Photoshop", "🎨", "General", 'CTRL+[', 'Send backward', "Beginner", "General", "Windows: CTRL+[ | Mac: CMD+[" ],
  ["Photoshop", "🎨", "General", 'ALT+CTRL+[', 'Send to back', "Beginner", "General", "Windows: ALT+CTRL+[ | Mac: OPT+CMD+[" ],
  ["Photoshop", "🎨", "General", 'CTRL+/', 'Lock layers', "Beginner", "General", "Windows: CTRL+/ | Mac: CMD+/" ],
  ["Photoshop", "🎨", "General", 'CTRL+E', 'Merge layers', "Beginner", "General", "Windows: CTRL+E | Mac: CMD+E" ],
  ["Photoshop", "🎨", "General", 'SHIFT+CTRL+E', 'Merge visible', "Beginner", "General", "Windows: SHIFT+CTRL+E | Mac: SHIFT+CMD+E" ],
  ["Photoshop", "🎨", "General", 'CTRL+K', 'Show settings', "Beginner", "General", "Windows: CTRL+K | Mac: CMD+K" ],
  ["Photoshop", "🎨", "General", 'ALT+SHIFT+CTRL+K', 'Keyboard shortcuts', "Beginner", "General", "Windows: ALT+SHIFT+CTRL+K | Mac: OPT+SHIFT+CMD+K" ]
];

const photoshopMigration = 'photoshop_shortcuts_user_v1';
const photoshopMigrationDone = db.prepare(
  'SELECT 1 FROM app_migrations WHERE name=?'
).get(photoshopMigration);

if (!photoshopMigrationDone) {
  const replacePhotoshop = db.transaction(() => {
    db.prepare('DELETE FROM shortcuts WHERE software=?').run('Photoshop');

    const insertPhotoshop = db.prepare(`
      INSERT INTO shortcuts
      (software,icon,category,keys,action,level,type,example)
      VALUES(?,?,?,?,?,?,?,?)
    `);

    photoshopShortcuts.forEach(row => insertPhotoshop.run(...row));
    db.prepare('INSERT INTO app_migrations(name) VALUES(?)').run(photoshopMigration);
  });
  replacePhotoshop();
}

const chromeMigration = 'chrome_shortcuts_user_v1';
const chromeMigrationDone = db.prepare(
  'SELECT 1 FROM app_migrations WHERE name=?'
).get(chromeMigration);

if (!chromeMigrationDone) {
  const replaceChrome = db.transaction(() => {
    db.prepare('DELETE FROM shortcuts WHERE software=?').run('Chrome');

    const insertChrome = db.prepare(`
      INSERT INTO shortcuts
      (software,icon,category,keys,action,level,type,example)
      VALUES(?,?,?,?,?,?,?,?)
    `);

    chromeShortcuts.forEach(row => insertChrome.run(...row));

    db.prepare(
      'INSERT INTO app_migrations(name) VALUES(?)'
    ).run(chromeMigration);
  });

  replaceChrome();
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

  const result = db.prepare(`
    INSERT OR IGNORE INTO progress
    VALUES(?,?)
  `).run(
    req.user.id,
    shortcutId
  );

  if (result.changes) {
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
  }

  const user = db.prepare(`
    SELECT xp
    FROM users
    WHERE id=?
  `).get(req.user.id);

  res.json({
    ok: true,
    xp: user.xp,
    newlyMastered: Boolean(result.changes)
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

// These legacy migration drafts are kept for reference only. They contain
// duplicate data and must never run automatically on every server start.
if (process.env.RUN_LEGACY_MIGRATIONS === 'true') {

// ShortcutHub migration: replace PowerPoint shortcuts with the latest supplied list
const latestPowerPointShortcuts = [('Go to the next slide shortcut', 'Page Down'), ('Go to the previous slide shortcut', 'Page Up'), ('Insert new slide shortcut', 'Ctrl + M'), ('Duplicate slide shortcut', 'Ctrl + D'), ('Change the zoom for the slide shortcut', 'Alt + W, Q (or Ctrl + Mouse scroll)'), ('Send selected slides to appendix', 'Ctrl + Alt + Shift + A'), ('Create Summary Slide', 'Ctrl + Alt + Shift + D'), ('Select a theme shortcut', 'Alt + G, H'), ('Select a slide layout shortcut', 'Alt + H, L'), ('Save selected slides', 'Ctrl + Alt + Shift + V'), ('Print selected slides', 'Ctrl + Alt + Shift + P'), ('Save presentation shortcut', 'Ctrl + S'), ('Save As shortcut', 'F12'), ('Save As shortcut', 'Ctrl+Shift+S'), ('New presentation shortcut', 'Ctrl + N'), ('Print presentation shortcut', 'Ctrl + P'), ('Switch between open presentations shortcut', 'Ctrl + F6'), ('Switch between open PowerPoint windows shortcut', 'Ctrl + TAB'), ('Duplicate and active presentation (PowerPoint 2013, 2016, 365) shortcut', 'Ctrl + Shift + N'), ('Add section to presentation (PowerPoint 2013, 2016, 365) shortcut', 'Ctrl + <'), ('Close PowerPoint shortcut', 'Alt + F4 or Alt + F, X'), ('Close Presentation shortcut', 'Ctrl + W or Ctrl + F4'), ('Open Find dialog box shortcut', 'Ctrl + F'), ('Open Find and Replace dialog box shortcut', 'Ctrl + H'), ('Open Header and Footer dialog box shortcut', 'Alt + Shift + D'), ('Open Spell Check shortcut', 'F7'), ('Open Thesaurus shortcut', 'Shift + F7'), ('Format selected Chart element shortcut', 'Ctrl + 1'), ('Show or Hide the Notes pane (PowerPoint 2013, 2016, 365) shortcut', 'Ctrl + Shift + H'), ('Switch to Slide Master View shortcut', "Shift + click 'Normal View'"), ('Switch to Handout Master View shortcut', "Shift + click 'Slide Sorter View'"), ('Close Thumbnails View shortcut', "Ctrl + Shift + click 'Normal View'")];
try {
  db.prepare("DELETE FROM shortcuts WHERE software = ?").run("PowerPoint");
  const insertLatestPpt = db.prepare("INSERT INTO shortcuts (software, keys, action) VALUES (?, ?, ?)");
  const insertManyLatestPpt = db.transaction((items) => {
    for (const [action, keys] of items) insertLatestPpt.run("PowerPoint", keys, action);
  });
  insertManyLatestPpt(latestPowerPointShortcuts);
} catch (e) {
  console.error("PowerPoint shortcut migration failed:", e);
}


// ShortcutHub migration: replace Tally shortcuts with the latest supplied list
const latestTallyShortcuts = [('F12', 'Only Press F12'), ('Alt F12', 'F12'), ('Ctrl F12', 'F12'), ('Alt P', 'Print'), ('Alt E', 'Export'), ('ALC', 'Create Ledger'), ('ALA', 'Alter Ledger'), ('DD', 'To See Entries (ALL) — Display → Daybook → Select Period'), ('DAL', 'To See One Ledger — Display → Account → Book Ledger'), ('Alt C', 'Make Ledger'), ('Ctrl Enter', 'Change Ledger'), ('Enter Enter', 'Change Ledger'), ('Ctrl A', 'Calculator'), ('Ctrl N', 'To Hide Ledger'), ('Alt R', 'To Hide Ledger'), ('Alt U', 'To Unhide Ledger'), ('F1', 'To select a company; To select the Accounts Button and Inventory buttons'), ('F2', 'To change the menu period'), ('F3', 'To select the company'), ('F4', 'To select the Contra voucher'), ('F5', 'To select the Payment voucher'), ('F6', 'To select the Receipt voucher'), ('F7', 'To select the Journal voucher'), ('F8', 'To select the Sales voucher'), ('F8 (CTRL+F8)', 'To select the Credit Note voucher'), ('F9', 'To select the Purchase voucher'), ('F9 (CTRL+F9)', 'To select the Debit Note voucher'), ('F10', 'To select the Reversing Journal voucher'), ('F10', 'To select the Memorandum voucher'), ('F11', 'To select the Functions and Features screen'), ('F12', 'To select the Configure screen'), ('ALT + 2', 'To Duplicate a voucher'), ('ALT + A', 'To Add a voucher'), ('ALT + C', 'To create a master at a voucher screen (if it has not been already assigned a different function)'), ('ALT + D', 'To delete a voucher; To delete a master'), ('ALT + E', 'To export the report in ASCII, SDF, HTML OR XML format'), ('ALT + I', 'To insert a voucher'), ('Alt+H', 'Help Shortcut'), ('ALT + O', 'To upload the report at your website'), ('Alt+I', 'Insert a voucher / To toggle between Item and Accounting invoice'), ('Alt+N', 'To view the report in automatic columns'), ('Alt+U', 'Retrieve the last line which is deleted using Alt+R'), ('Alt+Y', 'Register Tally'), ('ALT + M', 'To Email the report'), ('ALT + P', 'To print the report'), ('ALT + R', 'To remove a line in a report'), ('ALT + S', 'To bring back a line you removed using ALT + R'), ('ALT+ V', 'From Invoice screen to bring Stock Journal screen'), ('ALT + W', 'To view the Tally Web browser.'), ('Alt+Z', 'Zoom'), ('ALT + X', 'To cancel a voucher in Day Book/List of Vouchers'), ('ALT + R', 'To Register Tally'), ('CTRL + A', 'To accept a form – wherever you use this key combination, that screen or report gets accepted as it is.'), ('Ctrl+Alt+B', 'Check the Company Statutory details'), ('Ctrl+M', 'Switches to Main Area of Tally Screen'), ('Ctrl+N', 'Switches to Calculator / ODBC Section of Tally Screen'), ('Ctrl+R', 'Repeat narration in the same voucher type irrespective of Ledger Account'), ('Ctrl+T', 'Mark any voucher as Post Dated Voucher'), ('Ctrl+Alt+C', 'Copy the text from Tally (At creation and alternation screens)'), ('Ctrl+Alt+V', 'To paste the text from Tally (At creation and alternation screens)')];
try {
  db.prepare("DELETE FROM shortcuts WHERE software = ?").run("Tally");
  const insertLatestTally = db.prepare("INSERT INTO shortcuts (software, keys, action) VALUES (?, ?, ?)");
  const insertManyLatestTally = db.transaction((items) => {
    for (const [keys, action] of items) insertLatestTally.run("Tally", keys, action);
  });
  insertManyLatestTally(latestTallyShortcuts);
} catch (e) {
  console.error("Tally shortcut migration failed:", e);
}


// ShortcutHub migration: replace Windows shortcuts with the latest supplied list
const latestWindowsShortcuts = [('Windows key + S (or Q)', 'Open Search.'), ('Windows key + Alt + D', 'Open date and time in the taskbar.'), ('Windows key + Tab', 'Open Task View.'), ('Windows key + Ctrl + D', 'Create new virtual desktop.'), ('Windows key + Ctrl + F4', 'Close active virtual desktop.'), ('Windows key + Ctrl + Right arrow', 'Switch to the virtual desktop on the right.'), ('Windows key + Ctrl + Left arrow', 'Switch to the virtual desktop on the left.'), ('Windows key + P', 'Open Project settings.'), ('Windows key + A', 'Open Action center.'), ('Windows key + I', 'Open Settings app.'), ('Backspace', 'Return to Settings app home page.'), ('Windows key + E', 'Open File Explorer.'), ('Alt + D', 'Select address bar.'), ('Ctrl + E (or F)', 'Select search box.'), ('Ctrl + N', 'Open new window.'), ('Ctrl + W', 'Close active window.'), ('Ctrl + F (or F3)', 'Start search.'), ('Ctrl + Mouse scroll wheel', 'Change view file and folder.'), ('Ctrl + Shift + E', 'Expands all folders from the tree in the navigation pane.'), ('Ctrl + Shift + N', 'Create new folder on desktop or File Explorer.'), ('Ctrl + L', 'Focus on the address bar.'), ('Ctrl + Shift + Number (1-8)', 'Changes folder view.'), ('Alt + P', 'Display preview panel.'), ('Alt + Enter', 'Open Properties settings for the selected item.'), ('Alt + Right arrow key', 'View next folder.'), ('Alt + Left arrow key (or Backspace)', 'View previous folder.'), ('Alt + Up arrow', 'Move up a level in the folder path.'), ('F11', 'Switch active window full-screen mode.'), ('F5', 'Refresh the instance of File Explorer.'), ('F2', 'Rename selected item.'), ('F4', 'Switch focus to address bar.'), ('F5', "Refresh File Explorer's current view."), ('F6', 'Cycle through elements on the screen.'), ('Home', 'Scroll to top of the window.'), ('End', 'Scroll to bottom of window.'), ('Windows key', 'Open Start menu.'), ('Windows key + D', 'Display and hide the desktop.'), ('Windows key + L', 'Locks computer.'), ('Windows key + M', 'Minimize all windows.'), ('Windows key + B', 'Set focus notification area in the taskbar.'), ('Windows key + C', 'Launch Cortana app.'), ('Windows key + F', 'Launch Feedback Hub app.'), ('Windows key + G', 'Launch Game bar app.'), ('Windows key + Y', 'Change input between desktop and Mixed Reality.'), ('Windows key + O', 'Lock device orientation.'), ('Windows key + T', 'Cycle through apps in the taskbar.'), ('Windows key + Z', 'Switch input between the desktop experience and Windows Mixed Reality.'), ('Windows key + J', 'Set focus on a tip for Windows 10 when applicable.k'), ('Windows key + H', 'Open dictation feature.'), ('Windows key + R', 'Open Run command.'), ('Windows key + K', 'Open Connect settings.'), ('Windows key + X', 'Open Quick Link menu.'), ('Windows key + V', 'Open Clipboard bin.'), ('Windows key + W', 'Open the Windows Ink Workspace.'), ('Windows key + U', 'Open Ease of Access settings.'), ('Windows key + Ctrl + Enter', 'Open Narrator.'), ('Windows key + Plus (+)', 'Zoom in using the magnifier.'), ('Windows key + Minus (-)', 'Zoom out using the magnifier.'), ('Windows key + Esc', 'Exit magnifier.'), ('Windows key + Forward-slash (/)', 'Start IME reconversion.'), ('Windows key + Comma (,)', 'Temporarily peek at the desktop.'), ('Windows key + Up arrow key', 'Maximize app windows.'), ('Windows key + Down arrow key', 'Minimize app windows.'), ('Windows key + Home', 'Minimize or maximize all but the active desktop window.'), ('Windows key + Shift + M', 'Restore minimized windows on the desktop.'), ('Windows key + Shift + Up arrow key', 'Stretch desktop window to the top and bottom of the screen.'), ('Windows key + Shift + Down arrow key', 'Maximize or minimize active windows vertically while maintaining width.'), ('Windows key + Shift + Left arrow key', 'Move active window to monitor on the left.'), ('Windows key + Shift + Right arrow key', 'Move active window to monitor on the right.'), ('Windows key + Left arrow key', 'Snap app or window left.'), ('Windows key + Right arrow key', 'Snap app or window right.'), ('Windows key + Number (0-9)', 'Open app in number position in the taskbar.'), ('Windows key + Shift + Number (0-9)', 'Open another instance of the app in number position in the taskbar.'), ('Windows key + Ctrl + Number (0-9)', 'Switch to last active window of the app in number position in the taskbar.'), ('Windows key + Alt + Number (0-9)', 'Open Jump List of the app in number position in the taskbar.'), ('Windows key + Ctrl + Shift + Number (0-9)', 'Open another instance as an administrator of the app in number position in the taskbar.'), ('Windows key + Ctrl + Spacebar', 'Change previous selected input option.'), ('Windows key + Spacebar', 'Change keyboard layout and input language.'), ('Windows key + Ctrl + Shift + B', 'Wake up the device when black or a blank screen.'), ('Windows key + PrtScn', 'Capture full screenshot in the Screenshots folder.'), ('Windows key + Shift + S', 'Create part of the screen screenshot.'), ('Windows key + Shift + V', 'Cycle through notifications..'), ('Windows key + Ctrl + F', 'Open search for device on domain network.'), ('Windows key + Ctrl + Q', 'Open Quick Assist.'), ('Windows key + Period (.) or semicolon (;)', 'Open emoji panel.'), ('Windows key + Pause', 'Show System Properties dialog box.')];
try {
  db.prepare("DELETE FROM shortcuts WHERE software = ?").run("Windows");
  const insertLatestWindows = db.prepare("INSERT INTO shortcuts (software, keys, action) VALUES (?, ?, ?)");
  const insertManyLatestWindows = db.transaction((items) => {
    for (const [keys, action] of items) insertLatestWindows.run("Windows", keys, action);
  });
 // =========================
// REPLACE TALLY / POWERPOINT / WINDOWS
// =========================

const replaceShortcuts = db.prepare(`
  INSERT INTO shortcuts
  (software, icon, category, keys, action, level, type, example)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);


// =========================
// POWERPOINT
// =========================

const latestPowerPointShortcuts = [
  ['Page Down', 'Go to the next slide shortcut'],
  ['Page Up', 'Go to the previous slide shortcut'],
  ['Ctrl + M', 'Insert new slide shortcut'],
  ['Ctrl + D', 'Duplicate slide shortcut'],
  ['Alt + W, Q', 'Change the zoom for the slide shortcut'],
  ['Ctrl + Alt + Shift + A', 'Send selected slides to appendix'],
  ['Ctrl + Alt + Shift + D', 'Create Summary Slide'],
  ['Alt + G, H', 'Select a theme shortcut'],
  ['Alt + H, L', 'Select a slide layout shortcut'],
  ['Ctrl + Alt + Shift + V', 'Save selected slides'],
  ['Ctrl + Alt + Shift + P', 'Print selected slides'],
  ['Ctrl + S', 'Save presentation shortcut'],
  ['F12', 'Save As shortcut'],
  ['Ctrl+Shift+S', 'Save As shortcut'],
  ['Ctrl + N', 'New presentation shortcut'],
  ['Ctrl + P', 'Print presentation shortcut'],
  ['Ctrl + F6', 'Switch between open presentations shortcut'],
  ['Ctrl + TAB', 'Switch between open PowerPoint windows shortcut'],
  ['Ctrl + Shift + N', 'Duplicate active presentation'],
  ['Ctrl + <', 'Add section to presentation'],
  ['Alt + F4 or Alt + F, X', 'Close PowerPoint'],
  ['Ctrl + W or Ctrl + F4', 'Close Presentation'],
  ['Ctrl + F', 'Open Find dialog box'],
  ['Ctrl + H', 'Open Find and Replace dialog box'],
  ['Alt + Shift + D', 'Open Header and Footer dialog box'],
  ['F7', 'Open Spell Check'],
  ['Shift + F7', 'Open Thesaurus'],
  ['Ctrl + 1', 'Format selected Chart element'],
  ['Ctrl + Shift + H', 'Show or Hide the Notes pane'],
  ["Shift + click 'Normal View'", 'Switch to Slide Master View'],
  ["Shift + click 'Slide Sorter View'", 'Switch to Handout Master View'],
  ["Ctrl + Shift + click 'Normal View'", 'Close Thumbnails View']
];


// Delete old PowerPoint
db.prepare(
  `DELETE FROM shortcuts WHERE software = 'PowerPoint'`
).run();


// Insert new PowerPoint
for (const [keys, action] of latestPowerPointShortcuts) {
  replaceShortcuts.run(
    'PowerPoint',
    '📽️',
    'Office',
    keys,
    action,
    'Beginner',
    'Presentation',
    ''
  );
}


// =========================
// TALLY
// =========================

const latestTallyShortcuts = [
  ['F12', 'Only Press F12'],
  ['Alt F12', 'F12'],
  ['Ctrl F12', 'F12'],
  ['Alt P', 'Print'],
  ['Alt E', 'Export'],
  ['ALC', 'Create Ledger'],
  ['ALA', 'Alter Ledger'],
  ['DD', 'To See Entries (ALL) — Display → Daybook → Select Period'],
  ['DAL', 'To See One Ledger — Display → Account → Book Ledger'],
  ['Alt C', 'Make Ledger'],
  ['Ctrl Enter', 'Change Ledger'],
  ['Enter Enter', 'Change Ledger'],
  ['Ctrl A', 'Calculator'],
  ['Ctrl N', 'To Hide Ledger'],
  ['Alt R', 'To Hide Ledger'],
  ['Alt U', 'To Unhide Ledger'],
  ['F1', 'To select a company; To select the Accounts Button and Inventory buttons'],
  ['F2', 'To change the menu period'],
  ['F3', 'To select the company'],
  ['F4', 'To select the Contra voucher'],
  ['F5', 'To select the Payment voucher'],
  ['F6', 'To select the Receipt voucher'],
  ['F7', 'To select the Journal voucher'],
  ['F8', 'To select the Sales voucher'],
  ['F8 (CTRL+F8)', 'To select the Credit Note voucher'],
  ['F9', 'To select the Purchase voucher'],
  ['F9 (CTRL+F9)', 'To select the Debit Note voucher'],
  ['F10', 'To select the Reversing Journal voucher'],
  ['F10', 'To select the Memorandum voucher'],
  ['F11', 'To select the Functions and Features screen'],
  ['F12', 'To select the Configure screen'],
  ['ALT + 2', 'To Duplicate a voucher'],
  ['ALT + A', 'To Add a voucher'],
  ['ALT + C', 'To create a master at a voucher screen'],
  ['ALT + D', 'To delete a voucher / master'],
  ['ALT + E', 'To export the report'],
  ['ALT + I', 'To insert a voucher'],
  ['Alt+H', 'Help Shortcut'],
  ['ALT + O', 'To upload the report at your website'],
  ['Alt+I', 'Insert a voucher / toggle Item and Accounting invoice'],
  ['Alt+N', 'Automatic columns'],
  ['Alt+U', 'Retrieve the last line deleted using Alt+R'],
  ['Alt+Y', 'Register Tally'],
  ['ALT + M', 'Email the report'],
  ['ALT + P', 'Print the report'],
  ['ALT + R', 'Remove a line in a report'],
  ['ALT + S', 'Bring back a removed line'],
  ['ALT+ V', 'Bring Stock Journal screen'],
  ['ALT + W', 'View the Tally Web browser'],
  ['Alt+Z', 'Zoom'],
  ['ALT + X', 'Cancel a voucher'],
  ['CTRL + A', 'Accept a form'],
  ['Ctrl+Alt+B', 'Check Company Statutory details'],
  ['Ctrl+M', 'Switch to Main Area of Tally'],
  ['Ctrl+N', 'Switch to Calculator / ODBC Section'],
  ['Ctrl+R', 'Repeat narration'],
  ['Ctrl+T', 'Mark voucher as Post Dated'],
  ['Ctrl+Alt+C', 'Copy text from Tally'],
  ['Ctrl+Alt+V', 'Paste text into Tally']
];


// Delete old Tally
db.prepare(
  `DELETE FROM shortcuts WHERE software = 'Tally'`
).run();


// Insert new Tally
for (const [keys, action] of latestTallyShortcuts) {
  replaceShortcuts.run(
    'Tally',
    '▣',
    'Accounting',
    keys,
    action,
    'Beginner',
    'Tally',
    ''
  );
}


// =========================
// WINDOWS
// =========================

const latestWindowsShortcuts = [
  ['Windows key + S (or Q)', 'Open Search.'],
  ['Windows key + Alt + D', 'Open date and time in the taskbar.'],
  ['Windows key + Tab', 'Open Task View.'],
  ['Windows key + Ctrl + D', 'Create new virtual desktop.'],
  ['Windows key + Ctrl + F4', 'Close active virtual desktop.'],
  ['Windows key + Ctrl + Right arrow', 'Switch to virtual desktop on the right.'],
  ['Windows key + Ctrl + Left arrow', 'Switch to virtual desktop on the left.'],
  ['Windows key + P', 'Open Project settings.'],
  ['Windows key + A', 'Open Action center.'],
  ['Windows key + I', 'Open Settings app.'],
  ['Windows key + E', 'Open File Explorer.'],
  ['Alt + D', 'Select address bar.'],
  ['Ctrl + E (or F)', 'Select search box.'],
  ['Ctrl + N', 'Open new window.'],
  ['Ctrl + W', 'Close active window.'],
  ['Ctrl + F (or F3)', 'Start search.'],
  ['Ctrl + Mouse scroll wheel', 'Change file and folder view.'],
  ['Ctrl + Shift + E', 'Expand all folders.'],
  ['Ctrl + Shift + N', 'Create new folder.'],
  ['Ctrl + L', 'Focus on address bar.'],
  ['Alt + P', 'Display preview panel.'],
  ['Alt + Enter', 'Open Properties.'],
  ['Alt + Right arrow', 'View next folder.'],
  ['Alt + Left arrow', 'View previous folder.'],
  ['Alt + Up arrow', 'Move up one level.'],
  ['F11', 'Full-screen mode.'],
  ['F5', 'Refresh File Explorer.'],
  ['F2', 'Rename selected item.'],
  ['F4', 'Switch focus to address bar.'],
  ['F6', 'Cycle through screen elements.'],
  ['Home', 'Scroll to top.'],
  ['End', 'Scroll to bottom.'],
  ['Windows key', 'Open Start menu.'],
  ['Windows key + D', 'Show or hide desktop.'],
  ['Windows key + L', 'Lock computer.'],
  ['Windows key + M', 'Minimize all windows.'],
  ['Windows key + B', 'Focus notification area.'],
  ['Windows key + R', 'Open Run command.'],
  ['Windows key + X', 'Open Quick Link menu.'],
  ['Windows key + V', 'Open Clipboard.'],
  ['Windows key + H', 'Open dictation.'],
  ['Windows key + K', 'Open Connect settings.'],
  ['Windows key + U', 'Open Ease of Access.'],
  ['Windows key + Ctrl + Enter', 'Open Narrator.'],
  ['Windows key + Plus (+)', 'Zoom in.'],
  ['Windows key + Minus (-)', 'Zoom out.'],
  ['Windows key + Esc', 'Exit magnifier.'],
  ['Windows key + Up arrow', 'Maximize app window.'],
  ['Windows key + Down arrow', 'Minimize app window.'],
  ['Windows key + Left arrow', 'Snap window left.'],
  ['Windows key + Right arrow', 'Snap window right.'],
  ['Windows key + Shift + S', 'Take a screenshot.'],
  ['Windows key + Period (.)', 'Open emoji panel.'],
  ['Windows key + Pause', 'Show System Properties.']
];


// Delete old Windows
db.prepare(
  `DELETE FROM shortcuts WHERE software = 'Windows'`
).run();


// Insert new Windows
for (const [keys, action] of latestWindowsShortcuts) {
  replaceShortcuts.run(
    'Windows',
    '⊞',
    'System',
    keys,
    action,
    'Beginner',
    'Windows',
    ''
  );
}

console.log('Tally, PowerPoint and Windows shortcuts updated successfully.');
} catch (e) {
  console.error("Windows shortcut migration failed:", e);
}
}

app.listen(PORT, HOST, () => {
  console.log(
    `ShortcutHub server running on ${HOST}:${PORT}`
  );
});
