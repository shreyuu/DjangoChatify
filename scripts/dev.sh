#!/bin/bash

# Set the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Kill any existing processes on ports 3000 and 8000
kill_port() {
    lsof -i tcp:$1 | awk 'NR!=1 {print $2}' | xargs kill -9 2>/dev/null || true
}

echo "Cleaning up ports..."
kill_port 3000
kill_port 8000

# Start frontend
echo "Starting React frontend..."
(cd "$PROJECT_ROOT/frontend" && npm start) &

# Wait for frontend to start
sleep 3

# Start backend with Daphne
echo "Starting Django backend with Daphne..."
cd "$PROJECT_ROOT" && daphne -b 127.0.0.1 -p 8000 backend.asgi:application