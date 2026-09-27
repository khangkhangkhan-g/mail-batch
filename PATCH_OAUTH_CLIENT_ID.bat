@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0PATCH_OAUTH_CLIENT_ID.ps1"
if errorlevel 1 (
  echo.
  echo Setup failed. Read the error above.
  pause
)
