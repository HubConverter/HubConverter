@echo off
title ShortcutHub V3.0 Final
cd /d "%~dp0"
echo.
echo ==========================================
echo          ShortcutHub V3.0 Final
echo ==========================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed.
  echo Please install Node.js 20+ from https://nodejs.org/
  pause
  exit /b 1
)
if not exist "node_modules" (
  echo Installing project dependencies...
  call npm install
  if errorlevel 1 goto :error
)
if not exist "server\node_modules" (
  echo Installing backend dependencies...
  call npm --prefix server install
  if errorlevel 1 goto :error
)
if not exist "client\node_modules" (
  echo Installing frontend dependencies...
  call npm --prefix client install
  if errorlevel 1 goto :error
)
echo.
echo Starting ShortcutHub...
start "" http://localhost:5173
call npm run dev
goto :eof
:error
echo.
echo Something went wrong during installation.
echo Check that Node.js 20+ is installed and try again.
pause
