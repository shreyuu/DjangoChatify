# Use a Node.js base image for the frontend
FROM node:18-alpine AS frontend

# Set the working directory for the frontend
WORKDIR /app/frontend

# Copy the package.json and package-lock.json from the frontend folder
COPY frontend/package*.json ./ 

# Install frontend dependencies
RUN npm install

# Copy the rest of the frontend code into the container
COPY frontend/ .

# Expose the port for the frontend application (adjust if needed)
EXPOSE 3000

# Command to run the frontend app (adjust depending on your entry point)
CMD ["npm", "start"]

# ---- Backend section ----
# Use a Python base image for the backend
FROM python:3.9-slim AS backend

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

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

# Expose port
EXPOSE 8000

# Run server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
