#!/bin/bash

echo "Stopping development servers..."

# Kill processes on development ports
kill_port() {
    lsof -i tcp:$1 | awk 'NR!=1 {print $2}' | xargs kill -9 2>/dev/null || true
}

kill_port 3000
kill_port 8000

echo "Development servers stopped"