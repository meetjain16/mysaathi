# Aurora - Multi-Agent Voice-Based AI Assistant

<div align="center">

![Aurora Logo](https://via.placeholder.com/200x100/4F46E5/FFFFFF?text=Aurora+AI)

**A sophisticated voice-based AI assistant with multiple specialized personas**

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

## 🌟 Overview

Aurora is an advanced multi-agent voice-based AI assistant that provides intelligent, domain-specific support through natural voice conversations. Built with a modern tech stack, Aurora features three specialized AI personas that adapt to different user needs:

- **🎯 General Assistant**: Friendly, helpful responses for everyday questions
- **📚 Education Specialist**: Patient, educational guidance and learning support  
- **💚 Mental Health Support**: Empathetic, supportive responses for emotional well-being

## ✨ Key Features

### 🎤 Voice-First Experience
- **Speech-to-Text**: Real-time voice input using Web Speech API
- **Text-to-Speech**: Natural voice responses with customizable settings
- **Hands-Free Operation**: Complete voice-to-voice interaction

### 🤖 Multi-Agent Intelligence
- **Smart Persona Selection**: Auto-classifies user intent to select appropriate AI persona
- **Context-Aware Conversations**: Maintains conversation history and context
- **Groq LLama Integration**: Powered by advanced LLama models for intelligent responses

### 🎨 Modern Interface
- **Beautiful UI**: Gradient design with glassmorphism effects
- **Real-time Status**: Live indicators for listening/speaking states
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 🗄️ Robust Backend
- **FastAPI**: High-performance REST API
- **MongoDB**: Conversation history and session management
- **Custom Agent System**: Sophisticated persona coordination and memory management

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  FastAPI Backend │    │   MongoDB DB    │
│                 │    │                 │    │                 │
│  • Web Speech   │◄──►│  • Groq Client  │◄──►│  • Conversations│
│  • Voice UI     │    │  • Persona Mgmt │    │  • Sessions     │
│  • Chat Display │    │  • Context Mgmt │    │  • User Data    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Groq LLama    │
                       │   AI Models     │
                       └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 16+** and **Yarn**
- **MongoDB 6.0+**
- **Modern Web Browser** (Chrome/Firefox/Safari with Web Speech API support)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/aurora-ai-assistant.git
cd aurora-ai-assistant
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
yarn install
```

### 4. Database Setup

**Install MongoDB:**
- **Windows**: Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
- **macOS**: `brew install mongodb-community`
- **Linux**: Follow [official installation guide](https://docs.mongodb.com/manual/installation/)

**Start MongoDB:**
```bash
# On Windows (as service):
net start MongoDB

# On macOS/Linux:
brew services start mongodb-community
# or
sudo systemctl start mongod
```

### 5. Environment Configuration

**Backend Environment (.env):**
```bash
# Create backend/.env file
cd backend
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
GROQ_API_KEY=your_groq_api_key_here
EOF
```

**Frontend Environment (.env):**
```bash
# Create frontend/.env file
cd ../frontend
cat > .env << EOF
REACT_APP_BACKEND_URL=http://localhost:8001
EOF
```

### 6. Get Your Groq API Key

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up/Login to your account
3. Navigate to API Keys section
4. Create a new API key
5. Replace `your_groq_api_key_here` in `backend/.env` with your actual key

### 7. Run the Application

**Start Backend:**
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Start Frontend (in new terminal):**
```bash
cd frontend
yarn start
```

### 8. Access Aurora

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs

## 🎯 Usage Guide

### Voice Interaction

1. **Click the microphone button** to start voice input
2. **Speak your question** clearly into your microphone
3. **Aurora will respond** with both text and voice
4. **Click the stop button** to interrupt Aurora's speech if needed

### Persona Selection

- **Auto-Select**: Let Aurora automatically choose the best persona based on your question
- **Manual Selection**: Use the dropdown to force a specific persona:
  - General Assistant for everyday questions
  - Education Specialist for learning and academic topics
  - Mental Health Support for emotional support and wellness

### Example Conversations

**General Assistant:**
```
You: "Hello Aurora, what's the weather like today?"
Aurora: "Hi there! I'd be happy to help, but I don't have access to real-time weather data..."
```

**Education Specialist:**  
```
You: "Can you explain photosynthesis?"
Aurora: "Absolutely! Photosynthesis is the fascinating process by which plants convert sunlight..."
```

**Mental Health Support:**
```
You: "I'm feeling really stressed about my exams"
Aurora: "I hear that you're feeling stressed about your exams, and that's completely understandable..."
```

## 🔧 API Reference

### Core Endpoints

#### POST `/api/chat`
Send a message to Aurora and receive an AI response.

**Request Body:**
```json
{
  "message": "Hello, how are you?",
  "session_id": "unique_session_id",
  "persona_preference": "general" // optional: "general", "education", "mental_health"
}
```

**Response:**
```json
{
  "response": "Hello! I'm doing great, thank you for asking...",
  "persona_used": "General Assistant",
  "session_id": "unique_session_id",
  "message_id": "uuid"
}
```

#### GET `/api/personas`
Get information about available personas.

**Response:**
```json
{
  "general": {
    "name": "General Assistant",
    "keywords": ["hello", "hi", "help", "what", "how", ...]
  },
  "education": {
    "name": "Education Specialist", 
    "keywords": ["study", "learn", "school", "homework", ...]
  },
  "mental_health": {
    "name": "Mental Health Support",
    "keywords": ["stress", "anxiety", "depression", ...]
  }
}
```

#### GET `/api/conversations/{session_id}`
Retrieve conversation history for a session.

#### GET `/api/health`
Health check endpoint.

## 🛠️ Development

### Project Structure

```
aurora-ai-assistant/
├── backend/
│   ├── server.py          # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── App.css       # Styling
│   │   └── index.js      # Entry point
│   ├── package.json      # Node.js dependencies
│   └── .env             # Frontend environment variables
├── tests/               # Test files
└── README.md           # This file
```

### Adding New Features

#### Adding a New Persona

1. **Update Backend** (`backend/server.py`):
```python
# Add to AuroraAgentSystem.__init__()
self.personas["new_persona"] = AuroraPersona(
    name="New Persona Name",
    prompt="System prompt for the new persona...",
    keywords=["keyword1", "keyword2", ...]
)
```

2. **Update Frontend** (`frontend/src/App.js`):
```javascript
// Add to persona selector dropdown
<option value="new_persona" className="text-gray-800">New Persona Name</option>

// Add to getPersonaColor function
const colors = {
  // ... existing colors
  'New Persona Name': 'bg-yellow-100 text-yellow-800'
};
```

#### Customizing Voice Settings

Modify the `speakText` function in `App.js`:
```javascript
const utterance = new SpeechSynthesisUtterance(text);
utterance.rate = 0.9;    // Speed (0.1 to 10)
utterance.pitch = 1;     // Pitch (0 to 2)
utterance.volume = 1;    // Volume (0 to 1)
utterance.voice = voices[0]; // Select specific voice
```

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
python -m pytest tests/

# Frontend tests  
cd frontend
yarn test
```

### Manual Testing

1. **Voice Recognition**: Test in different browsers and environments
2. **Persona Classification**: Try various question types to verify correct persona selection
3. **Conversation Context**: Test multi-turn conversations to ensure context retention
4. **Error Handling**: Test with poor internet connection or invalid inputs

## 🚨 Troubleshooting

### Common Issues

#### "Speech recognition not supported"
- **Solution**: Use Chrome, Firefox, or Safari. Ensure microphone permissions are granted.

#### "Cannot connect to backend" 
- **Solution**: Verify backend is running on port 8001 and MongoDB is accessible.

#### "Groq API errors"
- **Solution**: Check your API key in `backend/.env` and ensure you have API credits.

#### MongoDB connection issues
- **Solution**: Ensure MongoDB is running and accessible on the configured port.

### Debug Mode

Enable debug logging:
```bash
# Backend
PYTHONPATH=. uvicorn server:app --log-level debug

# Frontend  
REACT_APP_DEBUG=true yarn start
```

### Performance Optimization

1. **Reduce API Response Time**: Use smaller Groq models for faster responses
2. **Optimize Voice Processing**: Adjust speech recognition settings for your environment
3. **Database Indexing**: Add MongoDB indexes for frequently queried fields

## 📝 Configuration

### Environment Variables

#### Backend (.env)
```bash
MONGO_URL=mongodb://localhost:27017          # MongoDB connection string
GROQ_API_KEY=your_api_key_here              # Groq API key
DEBUG=False                                  # Enable debug mode
MAX_CONVERSATION_HISTORY=20                  # Max exchanges to store per session
```

#### Frontend (.env)
```bash
REACT_APP_BACKEND_URL=http://localhost:8001  # Backend API URL
REACT_APP_DEBUG=false                        # Enable debug mode
REACT_APP_VOICE_LANG=en-US                  # Speech recognition language
```

### Customization Options

#### Persona Customization
Edit persona prompts in `backend/server.py` to change AI behavior:
```python
prompt="""You are Aurora's [Persona Name]. You [behavior description]..."""
```

#### UI Customization
Modify colors and styling in `frontend/src/App.css`:
```css
/* Change gradient background */
.bg-gradient-to-br {
  background: linear-gradient(to bottom right, /* your colors */);
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style

- **Python**: Follow PEP 8 guidelines
- **JavaScript**: Use Prettier and ESLint configurations
- **Commits**: Use conventional commit format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Groq** for providing fast LLama model inference
- **Web Speech API** for browser-based speech processing
- **FastAPI** and **React** communities for excellent frameworks
- **MongoDB** for reliable data storage

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/aurora-ai-assistant/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/aurora-ai-assistant/discussions)
- **Email**: support@aurora-ai.com

---

<div align="center">

**Built with ❤️ by the Aurora AI Team**

[Website](https://aurora-ai.com) • [Documentation](https://docs.aurora-ai.com) • [Twitter](https://twitter.com/aurora_ai)

</div>