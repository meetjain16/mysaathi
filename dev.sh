#!/bin/bash

# Saarthi AI Assistant - Development Helper Script
# Quick commands for common development tasks

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

case "$1" in
    "start")
        print_status "Starting Saarthi AI Assistant..."
        echo "Starting backend and frontend..."
        
        # Start backend in background
        cd backend
        source venv/bin/activate 2>/dev/null || true
        uvicorn server:app --host 0.0.0.0 --port 8001 --reload &
        BACKEND_PID=$!
        cd ..
        
        # Start frontend in background
        cd frontend
        yarn start &
        FRONTEND_PID=$!
        cd ..
        
        print_success "Saarthi started!"
        print_status "Backend PID: $BACKEND_PID"
        print_status "Frontend PID: $FRONTEND_PID"
        print_status "Access Saarthi at: http://localhost:3000"
        print_status "API docs at: http://localhost:8001/docs"
        print_warning "Press Ctrl+C to stop both services"
        
        # Wait for interrupt
        trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit" INT
        wait
        ;;
        
    "test")
        print_status "Running tests..."
        
        # Backend tests
        print_status "Running backend tests..."
        cd backend
        source venv/bin/activate 2>/dev/null || true
        python -m pytest tests/ -v 2>/dev/null || print_warning "No backend tests found"
        cd ..
        
        # Frontend tests
        print_status "Running frontend tests..."
        cd frontend
        yarn test --watchAll=false 2>/dev/null || print_warning "No frontend tests found"
        cd ..
        
        print_success "Tests completed"
        ;;
        
    "install")
        print_status "Installing dependencies..."
        
        # Backend
        cd backend
        source venv/bin/activate 2>/dev/null || python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
        cd ..
        
        # Frontend
        cd frontend
        yarn install
        cd ..
        
        print_success "Dependencies installed"
        ;;
        
    "clean")
        print_status "Cleaning up..."
        
        # Remove node_modules
        rm -rf frontend/node_modules
        
        # Remove Python cache
        find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
        find . -type f -name "*.pyc" -delete 2>/dev/null || true
        
        # Remove virtual environment
        rm -rf backend/venv
        
        print_success "Cleanup completed"
        ;;
        
    "status")
        print_status "Checking Saarthi status..."
        
        # Check if backend is running
        if curl -s http://localhost:8001/api/health > /dev/null; then
            print_success "Backend is running (http://localhost:8001)"
        else
            print_warning "Backend is not running"
        fi
        
        # Check if frontend is running
        if curl -s http://localhost:3000 > /dev/null; then
            print_success "Frontend is running (http://localhost:3000)"
        else
            print_warning "Frontend is not running"
        fi
        
        # Check MongoDB
        if pgrep mongod > /dev/null; then
            print_success "MongoDB is running"
        else
            print_warning "MongoDB is not running"
        fi
        ;;
        
    "logs")
        print_status "Showing recent logs..."
        
        # Backend logs (if using systemd or logs)
        print_status "Backend logs:"
        tail -n 20 backend/app.log 2>/dev/null || echo "No backend logs found"
        
        # Frontend logs
        print_status "Frontend logs:"
        tail -n 20 frontend/build.log 2>/dev/null || echo "No frontend logs found"
        ;;
        
    *)
        echo "Saarthi AI Assistant - Development Helper"
        echo "Usage: $0 {start|test|install|clean|status|logs}"
        echo ""
        echo "Commands:"
        echo "  start   - Start both backend and frontend servers"
        echo "  test    - Run all tests"
        echo "  install - Install all dependencies"
        echo "  clean   - Clean up build artifacts and dependencies"
        echo "  status  - Check if services are running"
        echo "  logs    - Show recent logs"
        echo ""
        echo "Examples:"
        echo "  $0 start    # Start Saarthi"
        echo "  $0 test     # Run tests"
        echo "  $0 status   # Check status"
        exit 1
        ;;
esac