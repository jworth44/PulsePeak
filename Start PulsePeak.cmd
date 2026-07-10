@echo off
title PulsePeak (localhost:3007)
cd /d "%~dp0"
echo Starting PulsePeak on http://localhost:3007 ...
start "" http://localhost:3007/
npm start
pause
