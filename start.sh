#!/bin/bash

# Production startup script for Study Guide Generator

echo "🚀 Starting Study Guide Generator..."

# Check if we're in the right directory structure
if [ -f "backend/main.py" ]; then
    echo "✅ Found backend directory"
    cd backend
elif [ -f "main.py" ]; then
    echo "✅ Already in backend directory"
else
    echo "❌ Cannot find main.py - checking current directory structure:"
    ls -la
    echo "Checking parent directory:"
    ls -la ..
    exit 1
fi

# Check for environment variables
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  Warning: OPENAI_API_KEY not set. The app will use fallback topics."
fi

# Check if Redis is available for reminders
if [ -n "$REDIS_URL" ]; then
    echo "✅ Redis configured for reminders"
    # Start Celery worker in background for reminders
    celery -A services.reminder_service.celery_app worker --loglevel=info &
    echo "📧 Celery worker started for email reminders"
else
    echo "⚠️  Redis not configured - email reminders disabled"
fi

# Get port from environment or default to 8000
PORT=${PORT:-8000}
echo "🌐 Starting server on port $PORT"

# Start FastAPI server
exec uvicorn main:app --host 0.0.0.0 --port $PORT