#!/bin/bash

# Docker run script for Study Guide Generator
# Usage: ./docker-run.sh [dev|prod|build]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Function to check environment file
check_env() {
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_warning "Please edit .env file and set your OPENAI_API_KEY"
        else
            echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
            print_warning "Created .env file. Please set your OPENAI_API_KEY"
        fi
    fi
    
    if [ ! -f "backend/.env" ]; then
        print_warning "backend/.env file not found. Creating from backend/.env.example..."
        if [ -f "backend/.env.example" ]; then
            cp backend/.env.example backend/.env
            print_warning "Please edit backend/.env file and set your OPENAI_API_KEY"
        else
            echo "OPENAI_API_KEY=your_openai_api_key_here" > backend/.env
            print_warning "Created backend/.env file. Please set your OPENAI_API_KEY"
        fi
    fi
}

# Function to run development environment
run_dev() {
    print_status "Starting development environment..."
    check_env
    
    # Build and start development services
    docker-compose -f docker-compose.yml --profile dev up --build -d
    
    print_success "Development environment started!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend: http://localhost:8001"
    print_status "Redis: localhost:6379"
    
    # Show logs
    print_status "Showing logs (Ctrl+C to stop)..."
    docker-compose logs -f app-dev redis
}

# Function to run production environment
run_prod() {
    print_status "Starting production environment..."
    check_env
    
    # Build and start production services
    docker-compose --profile production up --build -d
    
    print_success "Production environment started!"
    print_status "Application: http://localhost:8000"
    print_status "With Nginx: http://localhost (if nginx profile enabled)"
    
    # Show logs
    print_status "Showing logs (Ctrl+C to stop)..."
    docker-compose logs -f app redis celery-worker
}

# Function to build images only
build_images() {
    print_status "Building Docker images..."
    
    # Build production image
    docker build -t study-guide-generator:latest .
    
    # Build development image
    docker build -f Dockerfile.dev -t study-guide-generator:dev .
    
    print_success "Docker images built successfully!"
    print_status "Production image: study-guide-generator:latest"
    print_status "Development image: study-guide-generator:dev"
}

# Function to stop all services
stop_services() {
    print_status "Stopping all services..."
    docker-compose down --remove-orphans
    print_success "All services stopped!"
}

# Function to clean up
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker-compose down --remove-orphans --volumes
    docker system prune -f
    print_success "Cleanup completed!"
}

# Function to show help
show_help() {
    echo "Study Guide Generator - Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev     - Start development environment (frontend + backend with hot reload)"
    echo "  prod    - Start production environment (optimized build)"
    echo "  build   - Build Docker images only"
    echo "  stop    - Stop all running services"
    echo "  clean   - Stop services and clean up Docker resources"
    echo "  logs    - Show logs for running services"
    echo "  shell   - Open shell in running container"
    echo "  help    - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev          # Start development environment"
    echo "  $0 prod         # Start production environment"
    echo "  $0 build        # Build images only"
    echo "  $0 stop         # Stop all services"
    echo ""
}

# Function to show logs
show_logs() {
    print_status "Showing logs for running services..."
    docker-compose logs -f
}

# Function to open shell
open_shell() {
    # Check which container is running
    if docker-compose ps | grep -q "app-dev"; then
        print_status "Opening shell in development container..."
        docker-compose exec app-dev /bin/bash
    elif docker-compose ps | grep -q "app"; then
        print_status "Opening shell in production container..."
        docker-compose exec app /bin/bash
    else
        print_error "No running containers found. Start the application first."
        exit 1
    fi
}

# Main script logic
case "${1:-help}" in
    "dev")
        run_dev
        ;;
    "prod")
        run_prod
        ;;
    "build")
        build_images
        ;;
    "stop")
        stop_services
        ;;
    "clean")
        cleanup
        ;;
    "logs")
        show_logs
        ;;
    "shell")
        open_shell
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac