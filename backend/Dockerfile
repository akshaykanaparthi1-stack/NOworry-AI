# Production Dockerfile for NoWorry AI FastAPI Backend Engine
FROM python:3.13-slim

WORKDIR /app

# Prevent Python from writing pyc files and buffer stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy project directories
COPY backend /app/backend
COPY agent /app/agent
COPY ml /app/ml
COPY data /app/data
COPY tests /app/tests

# Expose port
EXPOSE 8000

# Run FastAPI backend with Uvicorn
CMD ["python", "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
