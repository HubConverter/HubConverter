import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import path from 'path';
const app=express(), PORT=process.env.PORT||4000, SECRET=process.env.JWT_SECRET||'dev-change-me';
const db=new Database('shortcut_hub_v3.db');
db.pragma('foreign_keys=ON');
db.exec(`
CREATE TABLE IF NOT EXISTS users(
 id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,
 password_hash TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'user',xp INTEGER DEFAULT 0,
 streak INTEGER DEFAULT 0,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS shortcuts(
 id INTEGER PRIMARY KEY AUTOINCREMENT,software TEXT NOT NULL,icon TEXT DEFAULT '⌨',
 category TEXT NOT NULL,keys TEXT NOT NULL,action TEXT NOT NULL,level TEXT DEFAULT 'Beginner',
 type TEXT DEFAULT 'General',example TEXT DEFAULT '',created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS favorites(user_id INTEGER,shortcut_id INTEGER,
 PRIMARY KEY(user_id,shortcut_id),FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(shortcut_id) REFERENCES shortcuts(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS progress(user_id INTEGER,shortcut_id INTEGER,
 PRIMARY KEY(user_id,shortcut_id),FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 FOREIGN KEY(shortcut_id) REFERENCES shortcuts(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS activity(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER,
 shortcut_id INTEGER,kind TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
`);
const seed=[
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
['Gmail','✉️','Web','C','Compose','Beginner','Email','Starts a new message when shortcuts are enabled.'],
['VS Code','</>','Development','Ctrl+P','Quick Open','Beginner','Navigation','Opens Quick Open.'],
['Google Sheets','📗','Web','Ctrl+;','Insert date','Beginner','Editing','Inserts the current date.']
];
if(db.prepare('SELECT COUNT(*) c FROM shortcuts').get().c===0){
 const ins=db.prepare('INSERT INTO shortcuts(software,icon,category,keys,action,level,type,example) VALUES(?,?,?,?,?,?,?,?)');
 db.transaction(rows=>rows.forEach(r=>ins.run(...r)))(seed);
}
const add=db.prepare('INSERT OR IGNORE INTO users(name,email,password_hash,role) VALUES(?,?,?,?)');
add.run('Administrator','admin@shortcuthub.local',bcrypt.hashSync('Admin@123',10),'admin');
add.run('Demo User','demo@shortcuthub.local',bcrypt.hashSync('Demo@123',10),'user');

app.use(cors({origin:process.env.CLIENT_ORIGIN||'http://localhost:5173'}));app.use(express.json());
const sign=u=>jwt.sign({id:u.id,role:u.role,email:u.email},SECRET,{expiresIn:'7d'});
function auth(req,res,next){try{req.user=jwt.verify((req.headers.authorization||'').replace('Bearer ',''),SECRET);next()}catch{res.status(401).json({error:'Authentication required'})}}
function admin(req,res,next){if(req.user.role!=='admin')return res.status(403).json({error:'Admin only'});next()}
app.get('/api/health',(q,r)=>r.json({ok:true,version:'3.0.0'}));
app.post('/api/auth/register',(req,res)=>{let {name,email,password}=req.body||{};if(!name||!email||!password||password.length<8)return res.status(400).json({error:'Name, email and password (8+ chars) are required'});try{let x=db.prepare('INSERT INTO users(name,email,password_hash) VALUES(?,?,?)').run(name,email.toLowerCase(),bcrypt.hashSync(password,10));let u=db.prepare('SELECT id,name,email,role,xp,streak FROM users WHERE id=?').get(x.lastInsertRowid);res.json({token:sign(u),user:u})}catch{res.status(409).json({error:'Email already registered'})}});
app.post('/api/auth/login',(req,res)=>{let {email,password}=req.body||{},u=db.prepare('SELECT * FROM users WHERE email=?').get((email||'').toLowerCase());if(!u||!bcrypt.compareSync(password||'',u.password_hash))return res.status(401).json({error:'Invalid email or password'});res.json({token:sign(u),user:{id:u.id,name:u.name,email:u.email,role:u.role,xp:u.xp,streak:u.streak}})});
app.get('/api/me',auth,(req,res)=>res.json(db.prepare('SELECT id,name,email,role,xp,streak,created_at FROM users WHERE id=?').get(req.user.id)));
app.get('/api/software',(q,r)=>r.json(db.prepare('SELECT software,icon,category,COUNT(*) count FROM shortcuts GROUP BY software ORDER BY software').all()));
app.get('/api/shortcuts',(req,res)=>{let {q='',software='',level='',category=''}=req.query,sql='SELECT * FROM shortcuts WHERE 1=1',p=[];if(q){sql+=' AND (keys LIKE ? OR action LIKE ? OR software LIKE ?)';p.push(`%${q}%`,`%${q}%`,`%${q}%`)}if(software){sql+=' AND software=?';p.push(software)}if(level){sql+=' AND level=?';p.push(level)}if(category){sql+=' AND category=?';p.push(category)}res.json(db.prepare(sql+' ORDER BY software,id').all(...p))});
app.get('/api/favorites',auth,(q,r)=>r.json(db.prepare('SELECT shortcut_id FROM favorites WHERE user_id=?').all(q.user.id).map(x=>x.shortcut_id)));
app.post('/api/favorites/:id',auth,(req,res)=>{let id=+req.params.id,e=db.prepare('SELECT 1 FROM favorites WHERE user_id=? AND shortcut_id=?').get(req.user.id,id);e?db.prepare('DELETE FROM favorites WHERE user_id=? AND shortcut_id=?').run(req.user.id,id):db.prepare('INSERT OR IGNORE INTO favorites VALUES(?,?)').run(req.user.id,id);res.json({saved:!e})});
app.get('/api/progress',auth,(q,r)=>r.json(db.prepare('SELECT shortcut_id FROM progress WHERE user_id=?').all(q.user.id).map(x=>x.shortcut_id)));
app.post('/api/progress/:id',auth,(req,res)=>{let id=+req.params.id;db.prepare('INSERT OR IGNORE INTO progress VALUES(?,?)').run(req.user.id,id);db.prepare('INSERT INTO activity(user_id,shortcut_id,kind) VALUES(?,?,?)').run(req.user.id,id,'learn');db.prepare('UPDATE users SET xp=xp+10 WHERE id=?').run(req.user.id);res.json({ok:true,xp:db.prepare('SELECT xp FROM users WHERE id=?').get(req.user.id).xp})});
app.post('/api/activity/:id',auth,(req,res)=>{db.prepare('INSERT INTO activity(user_id,shortcut_id,kind) VALUES(?,?,?)').run(req.user.id,+req.params.id,req.body.kind||'view');res.json({ok:true})});
app.get('/api/recent',auth,(req,res)=>res.json(db.prepare(`SELECT s.* FROM activity a JOIN shortcuts s ON s.id=a.shortcut_id WHERE a.user_id=? GROUP BY s.id ORDER BY MAX(a.id) DESC LIMIT 8`).all(req.user.id)));
app.get('/api/admin/stats',auth,admin,(q,r)=>r.json({users:db.prepare('SELECT COUNT(*) c FROM users').get().c,shortcuts:db.prepare('SELECT COUNT(*) c FROM shortcuts').get().c,favorites:db.prepare('SELECT COUNT(*) c FROM favorites').get().c,mastered:db.prepare('SELECT COUNT(*) c FROM progress').get().c}));
app.get('/api/admin/users',auth,admin,(q,r)=>r.json(db.prepare('SELECT id,name,email,role,xp,streak,created_at FROM users ORDER BY id DESC').all()));
app.post('/api/admin/shortcuts',auth,admin,(req,res)=>{let x=req.body||{};if(!x.software||!x.category||!x.keys||!x.action)return res.status(400).json({error:'Missing required fields'});let r=db.prepare('INSERT INTO shortcuts(software,icon,category,keys,action,level,type,example) VALUES(?,?,?,?,?,?,?,?)').run(x.software,x.icon||'⌨',x.category,x.keys,x.action,x.level||'Beginner',x.type||'General',x.example||'');res.status(201).json(db.prepare('SELECT * FROM shortcuts WHERE id=?').get(r.lastInsertRowid))});
app.put('/api/admin/shortcuts/:id',auth,admin,(req,res)=>{let id=+req.params.id,x=req.body||{};db.prepare('UPDATE shortcuts SET software=?,icon=?,category=?,keys=?,action=?,level=?,type=?,example=? WHERE id=?').run(x.software,x.icon,x.category,x.keys,x.action,x.level,x.type,x.example,id);res.json(db.prepare('SELECT * FROM shortcuts WHERE id=?').get(id))});
app.delete('/api/admin/shortcuts/:id',auth,admin,(req,res)=>{let id=+req.params.id;db.prepare('DELETE FROM shortcuts WHERE id=?').run(id);res.json({ok:true})});
const clientDist = path.join(process.cwd(), 'client', 'dist');

app.use(express.static(clientDist));

app.use((req,res,next)=>{
  if(req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT,()=>console.log(`ShortcutHub V3 API: http://localhost:${PORT}`));
