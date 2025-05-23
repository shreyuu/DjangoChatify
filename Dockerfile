# Use a Node.js base image for the frontend build
FROM node:18-alpine AS frontend-build

# Set the working directory for the frontend
WORKDIR /app/frontend

# Copy the package.json and package-lock.json from the frontend folder
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci --only=production

# Copy the rest of the frontend code into the container
COPY frontend/ .

# Build the frontend for production
RUN npm run build

# ---- Backend section ----
# Use a Python base image for the backend
FROM python:3.9-slim AS backend

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on

# Create a non-root user to run the application
RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup appuser

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Copy the built frontend from the frontend-build stage
COPY --from=frontend-build /app/frontend/build /app/frontend/build

# Set ownership to the non-root user
RUN chown -R appuser:appgroup /app

# Switch to the non-root user
USER appuser

# Expose port
EXPOSE 8000

# Create a health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Run server with gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "backend.wsgi:application"]
