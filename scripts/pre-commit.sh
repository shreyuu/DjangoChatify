#!/bin/bash

# Exit on error
set -e

echo "Running pre-commit checks..."

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Get Python files that are staged for commit
PYTHON_FILES=$(git diff --cached --name-only --diff-filter=d | grep -E '\.py$' || true)

if [ -z "$PYTHON_FILES" ]; then
    echo "No Python files to check. Skipping checks."
    exit 0
fi

echo "Checking files: $PYTHON_FILES"

# Check code formatting with Black
echo "Running Black formatter check..."
black --check $PYTHON_FILES

# Check imports with isort
echo "Running isort check..."
isort --check-only $PYTHON_FILES

# Lint with flake8
echo "Running flake8 linter..."
flake8 $PYTHON_FILES

# Security check with bandit
echo "Running bandit security check..."
bandit -r $PYTHON_FILES

# Check for vulnerable dependencies using safety
echo "Checking for vulnerable dependencies..."
safety check

echo "All checks passed! 🎉" 