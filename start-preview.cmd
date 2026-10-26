@echo off
cd /d "%~dp0"
echo Play to Grow preview: http://127.0.0.1:4173
echo Press Ctrl+C to stop the preview server.
python -m http.server 4173 --bind 127.0.0.1 --directory docs
pause
