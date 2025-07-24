# 📚 Study Guide + Smart Timetable Generator

An AI-powered web application that generates personalized study guides and creates smart timetables based on your available study time. Built with React, FastAPI, and OpenAI.

![Study Guide Generator](https://img.shields.io/badge/Built%20with-React%20%7C%20FastAPI%20%7C%20OpenAI-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **🤖 AI-Powered Study Guides**: Generate comprehensive study plans using OpenAI GPT
- **📅 Smart Timetabling**: Automatically distribute topics across your available study time
- **⏰ Priority-Based Scheduling**: High-priority topics are scheduled during peak focus hours
- **📧 Daily Reminders**: Email notifications to keep you on track
- **📄 PDF Export**: Export your study guide and timetable as PDF
- **📱 Responsive Design**: Beautiful, modern UI that works on all devices
- **🧪 Comprehensive Testing**: Full test coverage for reliability

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Python 3.11+
- OpenAI API Key
- Redis (for reminders, optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd study-guide-generator
   ```

2. **Setup Frontend**
   ```bash
   npm install
   cp .env.example .env
   # Edit .env and set VITE_API_URL=http://localhost:8000
   ```

3. **Setup Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env and set your OPENAI_API_KEY
   ```

4. **Start Redis (for reminders)**
   ```bash
   redis-server
   ```

5. **Start the application**
   ```bash
   # Terminal 1: Start backend
   cd backend
   uvicorn main:app --reload

   # Terminal 2: Start frontend
   npm run dev

   # Terminal 3: Start Celery worker (for reminders)
   cd backend
   celery -A services.reminder_service.celery_app worker --loglevel=info
   ```

6. **Visit http://localhost:3000**

### Using Docker

```bash
# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env

# Edit the environment files with your values
# At minimum, set OPENAI_API_KEY in backend/.env

# Start with Docker Compose
docker-compose up --build
```

## 🌐 Deployment

### One-Click Deployments

#### Deploy to Render (Recommended)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/yourusername/study-guide-generator)

#### Deploy to Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/yourusername/study-guide-generator)

#### Deploy to Heroku
```bash
heroku create your-app-name
heroku config:set OPENAI_API_KEY=your_openai_api_key
heroku config:set REDIS_URL=redis://redistogo:...
git push heroku main
```

### Manual Deployment

1. **Prepare for deployment**
   ```bash
   chmod +x deploy.sh
   export OPENAI_API_KEY=your_openai_api_key
   ./deploy.sh
   ```

2. **Environment Variables**
   Set these in your deployment platform:
   - `OPENAI_API_KEY` (required)
   - `REDIS_URL` (optional, for reminders)
   - `SMTP_USERNAME` (optional, for email reminders)
   - `SMTP_PASSWORD` (optional, for email reminders)

## 🧪 Testing

### Frontend Tests
```bash
npm test
```

### Backend Tests
```bash
cd backend
python -m pytest tests/ -v
```

### Test Coverage
- ✅ Form validation (empty subject, invalid hours)
- ✅ Study guide generation (minimum topics, time constraints)
- ✅ Timetable validation (daily hour limits)
- ✅ API error handling
- ✅ PDF export functionality
- ✅ Reminder system

## 📋 API Documentation

Once running, visit:
- **API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

### Key Endpoints

- `POST /api/study-guide/generate` - Generate study guide and timetable
- `POST /api/reminders/setup` - Setup daily email reminders
- `GET /health` - Health check endpoint

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  FastAPI Backend │    │   OpenAI API    │
│                 │    │                 │    │                 │
│  • Form Input   │────│  • Study Guide  │────│  • AI Generation│
│  • Study Guide  │    │    Generation   │    │  • Topic        │
│  • Timetable    │    │  • Timetabling  │    │    Analysis     │
│  • PDF Export   │    │  • Validation   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                │
                       ┌─────────────────┐    ┌─────────────────┐
                       │      Redis      │    │   Email Service │
                       │                 │    │                 │
                       │  • Task Queue   │    │  • Daily        │
                       │  • Celery       │    │    Reminders    │
                       │    Backend      │    │  • SMTP         │
                       └─────────────────┘    └─────────────────┘
```

## 🔧 Configuration

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

### Backend (backend/.env)
```env
# Required
OPENAI_API_KEY=your_openai_api_key

# Optional - for reminders
REDIS_URL=redis://localhost:6379/0
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=your_email@gmail.com
```

## 📝 Usage Examples

### Basic Usage
1. Enter a subject (e.g., "JavaScript Fundamentals")
2. Set your daily study hours (e.g., 2 hours)
3. Choose study period (7, 14, 21, or 30 days)
4. Optionally add email for reminders
5. Click "Generate Study Guide + Plan"

### Advanced Features
- **Priority Scheduling**: High-priority topics appear in early days
- **Time Optimization**: Sessions are intelligently split to fit daily limits
- **PDF Export**: Download both study guide and timetable as PDF
- **Email Reminders**: Get daily study reminders with your schedule

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

**OpenAI API Errors**
- Ensure your API key is valid and has credits
- Check if the API key is properly set in environment variables

**Email Reminders Not Working**
- Verify SMTP credentials are correct
- For Gmail, use App Passwords instead of regular password
- Ensure Redis is running for Celery tasks

**Build Failures**
- Check Node.js version (18+ required)
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

## 🙏 Acknowledgments

- OpenAI for providing the GPT API
- React and FastAPI communities
- All contributors who help improve this project

## 📧 Support

If you have questions or need help:
- 📖 Check the documentation above
- 🐛 Report bugs by opening an issue
- 💡 Request features by opening an issue
- 📧 Contact: [your-email@example.com]

---

**Built with ❤️ by [Your Name]**