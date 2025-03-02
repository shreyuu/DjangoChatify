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

# Set working directory
WORKDIR /app

# Copy requirements first for better cache usage
COPY requirements.txt ./

# Install dependencies
RUN pip install -r requirements.txt

# Copy the entire Django project
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
