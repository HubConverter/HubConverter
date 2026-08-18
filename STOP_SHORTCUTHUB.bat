@echo off
title Stop ShortcutHub
echo Stopping ShortcutHub development servers...
taskkill /FI "WINDOWTITLE eq ShortcutHub V3.0 Final*" /T /F >nul 2>nul
taskkill /IM node.exe /F >nul 2>nul
echo Done.
pause
