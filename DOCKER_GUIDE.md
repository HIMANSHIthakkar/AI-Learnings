# 🐳 Docker Deployment Guide

Complete guide for running the Study Guide Generator with Docker.

## 📋 Quick Start

### 1. **Using the Docker Script (Recommended)**
```bash
# Make script executable
chmod +x docker-run.sh

# Development environment
./docker-run.sh dev

# Production environment  
./docker-run.sh prod

# Build images only
./docker-run.sh build

# Stop services
./docker-run.sh stop
```

### 2. **Manual Docker Commands**
```bash
# Development
docker-compose --profile dev up --build

# Production
docker-compose --profile production up --build

# Single container
docker build -t study-guide-generator .
docker run -p 8000:8000 -e OPENAI_API_KEY=your_key study-guide-generator
```

## 🗂️ Docker Files Overview

| File | Purpose |
|------|---------|
| `Dockerfile` | Production multi-stage build |
| `Dockerfile.dev` | Development with hot reload |
| `Dockerfile.simple` | Basic single-stage build |
| `docker-compose.yml` | Complete orchestration |
| `docker-compose.override.yml` | Development overrides |
| `.dockerignore` | Build optimization |
| `nginx.conf` | Reverse proxy config |
| `docker-run.sh` | Management script |

## 🏗️ Dockerfile Features

### Production Dockerfile
- ✅ **Multi-stage build** (frontend + backend)
- ✅ **Security** (non-root user)
- ✅ **Health checks** 
- ✅ **Optimized layers**
- ✅ **Small image size**

### Development Dockerfile
- ✅ **Hot reload** for both frontend and backend
- ✅ **Volume mounting** for live editing
- ✅ **Development tools** included
- ✅ **Faster iteration**

## 🚀 Deployment Scenarios

### 1. **Local Development**
```bash
# Start development environment
./docker-run.sh dev

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:8001  
# Redis: localhost:6379
```

### 2. **Production Deployment**
```bash
# Start production environment
./docker-run.sh prod

# Access:
# Application: http://localhost:8000
# Health check: http://localhost:8000/health
```

### 3. **With Nginx (Load Balancer)**
```bash
# Start with nginx proxy
docker-compose --profile production up nginx app redis celery-worker

# Access:
# Application: http://localhost:80
```

### 4. **Cloud Deployment**
```bash
# Build and push to registry
docker build -t your-registry/study-guide-generator .
docker push your-registry/study-guide-generator

# Deploy on cloud platform
kubectl apply -f k8s/ # Kubernetes
# or
docker stack deploy -c docker-compose.yml study-guide # Docker Swarm
```

## 🔧 Configuration

### Environment Variables
```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional (for reminders)
REDIS_URL=redis://redis:6379/0
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=your_email@gmail.com

# Docker specific
PORT=8000
REDIS_PASSWORD=optional_redis_password
```

### Volume Mapping (Development)
```yaml
volumes:
  - ./src:/app/src              # Frontend source
  - ./backend:/app/backend      # Backend source  
  - /app/node_modules           # Preserve node_modules
```

## 🧪 Testing Docker Setup

### 1. **Health Check**
```bash
# Check if container is healthy
docker ps
curl http://localhost:8000/health
```

### 2. **Logs**
```bash
# View logs
./docker-run.sh logs

# Specific service logs
docker-compose logs app
docker-compose logs redis
```

### 3. **Shell Access**
```bash
# Open shell in container
./docker-run.sh shell

# Or manually
docker-compose exec app /bin/bash
```

## 🔍 Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

**Port Conflicts:**
```bash
# Check port usage
netstat -tulpn | grep :8000

# Use different ports
PORT=8080 docker-compose up
```

**Permission Issues:**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

**Memory Issues:**
```bash
# Check Docker memory
docker system df
docker stats

# Clean up
docker system prune -a --volumes
```

### Service-Specific Issues

**Frontend not loading:**
- Check if dist folder exists: `ls -la dist/`
- Rebuild frontend: `npm run build`
- Check nginx config if using proxy

**Backend API errors:**
- Verify OPENAI_API_KEY is set
- Check backend logs: `docker-compose logs app`
- Ensure Python dependencies installed

**Redis connection failed:**
- Check if Redis container is running: `docker-compose ps`
- Verify REDIS_URL format
- Check Redis logs: `docker-compose logs redis`

## 📊 Performance Optimization

### 1. **Image Size Optimization**
- Multi-stage builds reduce final image size
- .dockerignore excludes unnecessary files
- Alpine Linux base for smaller footprint

### 2. **Build Caching**
- Package files copied before source code
- Separate layers for dependencies and application
- Use `--cache-from` for CI/CD pipelines

### 3. **Runtime Optimization**
- Non-root user for security
- Health checks for container orchestration
- Resource limits in production

## 🔒 Security Best Practices

### 1. **Container Security**
```dockerfile
# Non-root user
USER appuser

# Read-only root filesystem (optional)
RUN chmod 755 /app

# Security scanning
# docker scan study-guide-generator:latest
```

### 2. **Secrets Management**
```bash
# Use Docker secrets (production)
echo "your_api_key" | docker secret create openai_api_key -

# Or external secret management
# - AWS Secrets Manager
# - HashiCorp Vault
# - Kubernetes Secrets
```

### 3. **Network Security**
```yaml
# Custom networks
networks:
  study-guide-network:
    driver: bridge
    internal: true  # No internet access
```

## 🚀 Production Deployment Examples

### 1. **Docker Swarm**
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml study-guide

# Scale services
docker service scale study-guide_app=3
```

### 2. **Kubernetes**
```bash
# Convert docker-compose to k8s
kompose convert

# Deploy to cluster
kubectl apply -f k8s/
```

### 3. **Cloud Platforms**

**AWS ECS:**
```bash
# Build and push
docker build -t your-account.dkr.ecr.region.amazonaws.com/study-guide .
docker push your-account.dkr.ecr.region.amazonaws.com/study-guide
```

**Google Cloud Run:**
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/project-id/study-guide
gcloud run deploy --image gcr.io/project-id/study-guide
```

**Azure Container Instances:**
```bash
# Deploy container
az container create --resource-group myResourceGroup \
  --name study-guide --image your-registry/study-guide
```

## 📈 Monitoring & Logging

### 1. **Container Monitoring**
```bash
# Resource usage
docker stats

# System info
docker system info
docker system df
```

### 2. **Application Monitoring**
- Health check endpoint: `/health`
- Logs aggregation with ELK stack
- Prometheus metrics (add custom endpoints)

### 3. **Log Management**
```yaml
# Configure logging driver
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Build and Deploy
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Docker image
        run: docker build -t study-guide-generator .
      - name: Run tests
        run: docker-compose run --rm app-dev npm test
```

### GitLab CI Example
```yaml
build:
  stage: build
  script:
    - docker build -t $CI_REGISTRY_IMAGE .
    - docker push $CI_REGISTRY_IMAGE
```

---

## 🎉 Ready to Deploy!

Your Study Guide Generator is now fully containerized and ready for any deployment scenario!

**Quick Commands:**
```bash
# Development
./docker-run.sh dev

# Production  
./docker-run.sh prod

# Stop all
./docker-run.sh stop
```

Happy Dockerizing! 🐳