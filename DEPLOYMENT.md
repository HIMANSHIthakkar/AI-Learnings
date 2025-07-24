# 🚀 Deployment Guide

This guide covers multiple deployment options for the Study Guide Generator application.

## 📋 Prerequisites

Before deploying, ensure you have:
- OpenAI API Key ([Get one here](https://platform.openai.com/api-keys))
- Git repository (GitHub/GitLab)
- Basic knowledge of cloud platforms

## 🌐 Deployment Options

### 1. 🔷 Railway (Recommended - Full Stack)

Railway provides the easiest full-stack deployment with automatic builds.

#### Steps:
1. **Fork this repository** to your GitHub account
2. **Visit [Railway](https://railway.app)** and sign up
3. **Click "New Project"** → "Deploy from GitHub repo"
4. **Select your forked repository**
5. **Set environment variables:**
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=8000
   ```
6. **Railway will automatically:**
   - Build the frontend
   - Setup the backend
   - Provide a public URL

**Time to deploy:** ~5 minutes

---

### 2. 🟣 Render (Full Stack)

Render offers excellent free tier hosting for full-stack applications.

#### Steps:
1. **Fork this repository**
2. **Visit [Render](https://render.com)** and sign up
3. **Create a new Web Service:**
   - Connect your GitHub repository
   - Build command: `./deploy.sh`
   - Start command: `./start.sh`
4. **Set environment variables:**
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```
5. **Create a Redis instance** (optional, for reminders):
   - Go to Dashboard → New → Redis
   - Copy the connection URL to `REDIS_URL` env var

**Time to deploy:** ~10 minutes

---

### 3. 🟡 Heroku (Full Stack)

Classic platform with good free tier and easy scaling.

#### Steps:
1. **Install Heroku CLI**
2. **Clone your repository locally**
3. **Login and create app:**
   ```bash
   heroku login
   heroku create your-study-guide-app
   ```
4. **Set environment variables:**
   ```bash
   heroku config:set OPENAI_API_KEY=your_openai_api_key_here
   ```
5. **Add Redis addon** (optional):
   ```bash
   heroku addons:create heroku-redis:mini
   ```
6. **Deploy:**
   ```bash
   git push heroku main
   ```

**Time to deploy:** ~15 minutes

---

### 4. 🔵 Netlify (Frontend) + Heroku (Backend)

Split deployment for optimal performance.

#### Frontend on Netlify:
1. **Fork the repository**
2. **Visit [Netlify](https://netlify.com)**
3. **New site from Git** → Select your repo
4. **Build settings:**
   - Build command: `npm ci && npm run build`
   - Publish directory: `dist`
5. **Set environment variable:**
   ```
   VITE_API_URL=https://your-backend-app.herokuapp.com
   ```

#### Backend on Heroku:
1. **Create a new Heroku app for backend only**
2. **Deploy only backend folder:**
   ```bash
   git subtree push --prefix backend heroku main
   ```

**Time to deploy:** ~20 minutes

---

### 5. 🐳 Docker (Self-hosted)

For those who prefer container-based deployment.

#### Steps:
1. **Clone repository**
2. **Set environment variables** in `.env` file
3. **Build and run:**
   ```bash
   # Simple deployment
   docker build -f Dockerfile.simple -t study-guide-generator .
   docker run -p 8000:8000 -e OPENAI_API_KEY=your_key study-guide-generator
   
   # Full deployment with Redis
   docker-compose up --build
   ```

**Access:** http://localhost:8000

---

## 🔧 Environment Variables Reference

### Required
- `OPENAI_API_KEY` - Your OpenAI API key

### Optional (for email reminders)
- `REDIS_URL` - Redis connection string
- `SMTP_USERNAME` - Email address for sending reminders
- `SMTP_PASSWORD` - Email password (use app password for Gmail)
- `FROM_EMAIL` - Email address shown as sender

### Platform-specific
- `PORT` - Port number (usually auto-set by platforms)

## 🧪 Testing Your Deployment

After deployment, test these features:

1. **✅ Basic functionality:**
   - Visit your deployed URL
   - Fill out the form with a test subject
   - Generate a study guide

2. **✅ API endpoints:**
   - Visit `/health` endpoint
   - Check if `openai_configured` is `true`

3. **✅ PDF export:**
   - Generate a study guide
   - Test PDF export functionality

4. **✅ Email reminders** (if configured):
   - Add an email to the form
   - Check email for reminder setup confirmation

## 🔍 Troubleshooting

### Common Issues:

**Build Failures:**
- Ensure Node.js 18+ is specified in build settings
- Check if all environment variables are set
- Verify OpenAI API key is valid

**OpenAI API Errors:**
- Verify API key has credits
- Check API key permissions
- Ensure key is correctly set in environment

**Email Reminders Not Working:**
- Verify SMTP credentials
- For Gmail, use App Password instead of regular password
- Check Redis connection if using email features

**Frontend Not Loading:**
- Check if build completed successfully
- Verify frontend assets are being served
- Check console for JavaScript errors

## 💡 Performance Tips

1. **Enable compression** in your deployment platform
2. **Use CDN** for static assets (most platforms do this automatically)
3. **Set up monitoring** to track performance
4. **Configure caching** for API responses
5. **Enable HTTPS** (usually automatic on modern platforms)

## 📊 Monitoring

After deployment, monitor:
- **Response times** - Should be under 3 seconds for study guide generation
- **Error rates** - Should be under 1%
- **OpenAI API usage** - Track token consumption
- **User engagement** - Number of study guides generated

## 🔄 Updates and Maintenance

To update your deployment:

1. **Push changes** to your repository
2. **Most platforms auto-deploy** on push to main branch
3. **Monitor logs** during deployment
4. **Test functionality** after updates

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review platform-specific documentation
3. Check application logs in your deployment platform
4. Open an issue in the repository

---

**Happy Deploying! 🎉**