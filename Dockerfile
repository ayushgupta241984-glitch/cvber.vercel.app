FROM python:3.10-slim

WORKDIR /app

# Minimal system deps — no X11 libs, no build tools for torch
RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    CLIP_ENABLED=false \
    REVERSE_SEARCH_ENABLED=false \
    PIP_NO_CACHE_DIR=1

COPY backend/requirements-base.txt .
RUN pip install --no-cache-dir -r requirements-base.txt

COPY backend/ .

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
