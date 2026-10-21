@echo off
title TaskMaster Pro Web Application
echo ======================================================
echo   Starting TaskMaster Pro Server on localhost:5000
echo ======================================================
cd /d "%~dp0backend"
echo Launching your browser at http://localhost:5000 ...
start http://localhost:5000
echo.
echo Running server (Press Ctrl+C to stop)...
node dist/server.js
pause
