# Multi-stage Dockerfile for Study Guide Generator
# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app

# Copy package files for better caching
COPY package*.json ./
RUN npm ci --only=production --silent

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Python Backend with Frontend
FROM python:3.11-slim AS production

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PORT=8000

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user for security
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Copy requirements and install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend from previous stage
COPY --from=frontend-build /app/dist ./dist

# Copy startup script
COPY start.sh ./
RUN chmod +x start.sh

# Create necessary directories and set permissions
RUN mkdir -p /app/logs \
    && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/health || exit 1

# Expose port
EXPOSE $PORT

# Start the application
CMD ["./start.sh"]