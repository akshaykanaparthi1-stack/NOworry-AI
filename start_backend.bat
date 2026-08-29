@echo off
echo Starting NoWorry AI FastAPI Backend...
cd /d "%~dp0"
set PYTHONPATH=.
python -m uvicorn backend.app.main:app --port 8000 --reload
pause
