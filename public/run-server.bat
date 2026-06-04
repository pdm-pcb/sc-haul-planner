@echo off
cd /d "%~dp0"
set PORT=4173

where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  start "" "http://localhost:%PORT%"
  py -3 -m http.server %PORT%
  goto :eof
)

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  start "" "http://localhost:%PORT%"
  python -m http.server %PORT%
  goto :eof
)

echo Python was not found.
echo Install Python, then double-click this file again.
pause