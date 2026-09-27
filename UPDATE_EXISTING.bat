@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0UPDATE_EXISTING.ps1"
if errorlevel 1 (
  echo.
  echo Update failed. Read the error above.
  pause
)
