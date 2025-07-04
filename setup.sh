#!/bin/bash

# Saarthi AI Assistant - Local Setup Script
# This script helps you set up Saarthi locally with minimal effort

set -e  # Exit on any error

echo "🌟 Saarthi AI Assistant - Local Setup"
echo "====================================="

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

# Check if running on supported OS
check_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
    else
        print_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
    print_status "Detected OS: $OS"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
        print_success "Python found: $PYTHON_VERSION"
    else
        print_error "Python 3.8+ is required but not found"
        exit 1
    fi
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js 16+ is required but not found"
        exit 1
    fi
    
    # Check Yarn
    if command -v yarn &> /dev/null; then
        YARN_VERSION=$(yarn --version)
        print_success "Yarn found: $YARN_VERSION"
    else
        print_warning "Yarn not found, installing..."
        npm install -g yarn
    fi
    
    # Check MongoDB
    if command -v mongod &> /dev/null; then
        print_success "MongoDB found"
    else
        print_warning "MongoDB not found. Please install MongoDB manually:"
        print_warning "  - macOS: brew install mongodb-community"
        print_warning "  - Linux: Follow official MongoDB installation guide"
        print_warning "  - Windows: Download from mongodb.com"
    fi
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    # Create virtual environment
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
    
    # Activate virtual environment
    print_status "Activating virtual environment..."
    source venv/bin/activate
    
    # Install dependencies
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating backend .env file..."
        cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
GROQ_API_KEY=your_groq_api_key_here
DEBUG=False
MAX_CONVERSATION_HISTORY=20
EOF
        print_warning "Please update GROQ_API_KEY in backend/.env with your actual API key"
    fi
    
    cd ..
    print_success "Backend setup completed"
}

# Setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    yarn install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating frontend .env file..."
        cat > .env << EOF
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_DEBUG=false
REACT_APP_VOICE_LANG=en-US
EOF
    fi
    
    cd ..
    print_success "Frontend setup completed"
}

# Start MongoDB
start_mongodb() {
    print_status "Starting MongoDB..."
    
    if [[ "$OS" == "macos" ]]; then
        if command -v brew &> /dev/null; then
            brew services start mongodb-community || true
        fi
    elif [[ "$OS" == "linux" ]]; then
        sudo systemctl start mongod || true
    fi
    
    # Wait a moment for MongoDB to start
    sleep 2
    print_success "MongoDB started (if installed)"
}

# Main setup function
main() {
    echo ""
    print_status "Starting Saarthi AI Assistant setup..."
    
    check_os
    check_prerequisites
    setup_backend
    setup_frontend
    start_mongodb
    
    echo ""
    print_success "🎉 Setup completed successfully!"
    echo ""
    print_status "Next steps:"
    echo "1. Get your Groq API key from: https://console.groq.com/"
    echo "2. Update GROQ_API_KEY in backend/.env"
    echo "3. Run the following commands to start Saarthi:"
    echo ""
    echo "   # Terminal 1 - Start Backend:"
    echo "   cd backend"
    echo "   source venv/bin/activate"
    echo "   uvicorn server:app --host 0.0.0.0 --port 8001 --reload"
    echo ""
    echo "   # Terminal 2 - Start Frontend:"
    echo "   cd frontend"
    echo "   yarn start"
    echo ""
    echo "4. Open http://localhost:3000 in your browser"
    echo ""
    print_status "For detailed instructions, see README.md"
}

# Run main function
main