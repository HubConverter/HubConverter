SHORTCUTHUB V3.2 - PUBLIC TEST FIX
============================================

FIRST TIME:
1. Install Node.js 20+ from https://nodejs.org/
2. Double-click START_SHORTCUTHUB.bat
3. Wait while dependencies install the first time.
4. Your browser will open http://localhost:5173

NEXT TIME:
Double-click START_SHORTCUTHUB.bat again.

LOGIN:
Admin:
admin@shortcuthub.local
Admin@123

Demo:
demo@shortcuthub.local
Demo@123

STOP:
Double-click STOP_SHORTCUTHUB.bat.

IMPORTANT:
This is a local development website. It is not yet public on ShortcutHub.in.
After the website is tested and finalized, deploy it to a hosting provider and connect the domain.

V3.1 FIX: Clicking Excel, Word, PowerPoint, Tally, BUSY, Photoshop, Windows, Chrome, Gmail, VS Code, etc. now immediately loads that software's own shortcuts.

V3.2 PUBLIC TEST FIX:
- Frontend API now uses relative /api instead of phone-localhost:4000.
- Vite proxies /api to the local backend on port 4000.
- Vite accepts the temporary Cloudflare trycloudflare.com host for testing.
