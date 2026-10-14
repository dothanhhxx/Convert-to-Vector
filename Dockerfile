# ==============================================================
# Vector Studio - Multi-Stage Production Dockerfile
# Combines React/Vite Frontend & FastAPI/VTracer Backend
# Ready for Free Deployment on Render, Hugging Face, or Railway
# ==============================================================

# Stage 1: Build React Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /build

# Copy dependency definitions
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy frontend source and build production bundle
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend Runtime
FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

WORKDIR /app

# Install required system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python packages
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY backend /app/backend

# Copy built frontend dist from Stage 1
COPY --from=frontend-builder /build/dist /app/frontend/dist

# Expose server port (Render / HF Spaces dynamically bind to $PORT)
EXPOSE 8000

WORKDIR /app/backend

# Launch with dynamic PORT support
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
