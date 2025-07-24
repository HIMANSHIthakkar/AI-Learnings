#!/bin/bash

# Deployment script for Study Guide Generator

set -e

echo "🚀 Starting deployment process..."

# Check if required environment variables are set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY environment variable is required"
    echo "Please set it with: export OPENAI_API_KEY=your_api_key"
    exit 1
fi

# Install frontend dependencies and build
echo "📦 Installing frontend dependencies..."
npm ci

echo "🏗️  Building frontend..."
npm run build

# Install backend dependencies
echo "🐍 Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

# Run tests
echo "🧪 Running tests..."
npm test
cd backend
python -m pytest tests/ -v
cd ..

echo "✅ All tests passed!"

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t study-guide-generator .

echo "🎉 Deployment build completed successfully!"

# Instructions for different platforms
echo ""
echo "📋 Deployment Options:"
echo ""
echo "1. 🚀 Deploy to Heroku:"
echo "   heroku create your-app-name"
echo "   heroku config:set OPENAI_API_KEY=$OPENAI_API_KEY"
echo "   heroku config:set REDIS_URL=redis://redistogo:..."
echo "   git push heroku main"
echo ""
echo "2. ☁️  Deploy to Railway:"
echo "   railway login"
echo "   railway new"
echo "   railway add"
echo "   railway up"
echo ""
echo "3. 🌊 Deploy to DigitalOcean App Platform:"
echo "   - Upload this repository to GitHub"
echo "   - Create new app on DigitalOcean"
echo "   - Connect your repository"
echo "   - Set environment variables"
echo ""
echo "4. 🔵 Deploy to Render:"
echo "   - Connect GitHub repository"
echo "   - Set build command: ./deploy.sh"
echo "   - Set start command: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT"
echo ""
echo "5. 🐳 Deploy with Docker:"
echo "   docker run -p 8000:8000 -e OPENAI_API_KEY=$OPENAI_API_KEY study-guide-generator"
echo ""
echo "Remember to set these environment variables in your deployment platform:"
echo "- OPENAI_API_KEY (required)"
echo "- REDIS_URL (for reminders - optional)"
echo "- SMTP_USERNAME, SMTP_PASSWORD (for email reminders - optional)"