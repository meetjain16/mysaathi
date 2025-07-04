from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, validator
from pymongo import MongoClient
import os
from typing import List, Dict, Optional
import uuid
from datetime import datetime
import json
from dotenv import load_dotenv
try:
    from groq import Groq
except ImportError:
    pass
try:
    from openai import OpenAI
except ImportError:
    pass

# Load environment variables
load_dotenv()

# Get API key from environment variable
GROQ_API_KEY = os.getenv('GROQ_API_KEY')

# Initialize Groq client with provided API key
# Handling compatibility issues with the Groq client
groq_client = None

try:
    from openai import OpenAI
    # Use OpenAI client as a fallback with Groq API base
    client = OpenAI(
        api_key=GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1"
    )
    groq_client = client
    print("✅ Using OpenAI client with Groq API")
except ImportError:
    print("⚠️ OpenAI client not available")
except Exception as e:
    print(f"⚠️ Error with OpenAI client: {e}")

# If OpenAI client failed, try with Groq directly
if groq_client is None:
    try:
        from groq import Groq
        groq_client = Groq(api_key=GROQ_API_KEY)
        print("✅ Using Groq client directly")
    except ImportError:
        print("⚠️ Groq client not available")
    except Exception as e:
        print(f"❌ Error initializing Groq client: {e}")
        groq_client = None

if groq_client is None:
    print("❌ No AI client available - API will not function properly")

app = FastAPI(
    title="Aurora AI Assistant API",
    description="Multi-agent voice-based AI assistant with specialized personas",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
try:
    client = MongoClient(MONGO_URL)
    # Test the connection
    client.admin.command('ping')
    db = client.aurora_db2
    print("✅ MongoDB connection successful")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    db = None

# Pydantic models
class ConversationRequest(BaseModel):
    message: str
    session_id: str
    persona_preference: Optional[str] = None

    @validator('message')
    def message_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Message cannot be empty')
        return v.strip()

    @validator('session_id')
    def session_id_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Session ID cannot be empty')
        return v.strip()

    @validator('persona_preference')
    def validate_persona_preference(cls, v):
        if v is not None:
            valid_personas = ['general', 'education', 'mental_health']
            if v not in valid_personas:
                raise ValueError(f'Invalid persona preference. Must be one of: {valid_personas}')
        return v

class ConversationResponse(BaseModel):
    response: str
    persona_used: str
    session_id: str
    message_id: str

# Aurora Agent System
class AuroraPersona:
    def __init__(self, name: str, prompt: str, keywords: List[str]):
        self.name = name
        self.prompt = prompt
        self.keywords = keywords

class AuroraAgentSystem:
    def __init__(self):
        self.personas = {
            "general": AuroraPersona(
                name="General Assistant",
                prompt="""You are Aurora, a helpful and friendly AI assistant. You provide clear, informative responses to general questions and engage in natural conversation. Keep responses conversational but informative, as if speaking to a friend. Be warm, empathetic, and helpful.""",
                keywords=["hello", "hi", "help", "what", "how", "tell me", "explain", "general", "question"]
            ),
            "education": AuroraPersona(
                name="Education Specialist",
                prompt="""You are Aurora's Education Specialist persona. You help with learning, studying, academic questions, homework, explanations of concepts, and educational guidance. You're encouraging, patient, and adapt your explanations to different learning levels. Use examples and analogies to make complex topics easier to understand.""",
                keywords=["study", "learn", "school", "homework", "math", "science", "history", "explain", "teach", "education", "academic", "university", "college", "lesson"]
            ),
            "mental_health": AuroraPersona(
                name="Mental Health Support",
                prompt="""You are Aurora's Mental Health Support persona. You provide compassionate, supportive responses for emotional well-being, stress management, and mental health topics. You're empathetic, non-judgmental, and encourage professional help when appropriate. Focus on active listening, validation, and helpful coping strategies. Always remind users to seek professional help for serious mental health concerns.""",
                keywords=["stress", "anxiety", "depression", "mental", "emotional", "feeling", "mood", "therapy", "counseling", "support", "wellness", "cope", "overwhelmed", "sad", "worried"]
            ),
        }
        self.conversation_history = {}

    def classify_persona(self, message: str, session_id: str) -> str:
        """Simple rule-based persona classification"""
        message_lower = message.lower()
        
        # Check for mental health keywords first (priority)
        for keyword in self.personas["mental_health"].keywords:
            if keyword in message_lower:
                return "mental_health"
        
        # Check for education keywords
        for keyword in self.personas["education"].keywords:
            if keyword in message_lower:
                return "education"
        
        # Default to general
        return "general"

    def get_context_prompt(self, session_id: str, persona_name: str) -> str:
        """Get conversation context for the session"""
        if session_id not in self.conversation_history:
            return ""
        
        history = self.conversation_history[session_id]
        if len(history) == 0:
            return ""
        
        # Include last 3 exchanges for context
        recent_history = history[-6:]  # Last 3 user messages and 3 responses
        context = "Previous conversation context:\n"
        for i in range(0, len(recent_history), 2):
            if i + 1 < len(recent_history):
                context += f"User: {recent_history[i]}\nAurora: {recent_history[i+1]}\n"
        
        return context

    def generate_response(self, message: str, session_id: str, persona_preference: Optional[str] = None) -> Dict:
        """Generate AI response using selected persona"""
        
        # Select persona
        if persona_preference and persona_preference in self.personas:
            selected_persona = persona_preference
        else:
            selected_persona = self.classify_persona(message, session_id)
        
        persona = self.personas[selected_persona]
        
        # Get conversation context
        context = self.get_context_prompt(session_id, selected_persona)
        
        # Prepare the prompt
        system_prompt = f"{persona.prompt}\n\n{context}"
        
        # Check if AI client is available
        if groq_client is None:
            return {
                "response": "I'm currently experiencing technical difficulties with my AI service. Please try again later or contact support if the issue persists.",
                "persona_used": selected_persona,
                "persona_name": persona.name,
                "error": "AI client not available"
            }
        
        try:
            # Generate response using Groq or OpenAI client
            if hasattr(groq_client, 'chat'):
                # Using Groq client
                chat_completion = groq_client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": message}
                    ],
                    model="llama3-8b-8192",
                    temperature=0.7,
                    max_tokens=500
                )
                response = chat_completion.choices[0].message.content
            else:
                # Using OpenAI client with Groq base URL
                chat_completion = groq_client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": message}
                    ],
                    model="llama3-8b-8192",
                    temperature=0.7,
                    max_tokens=500
                )
                response = chat_completion.choices[0].message.content
            
            # Store conversation history
            if session_id not in self.conversation_history:
                self.conversation_history[session_id] = []
            
            self.conversation_history[session_id].extend([message, response])
            
            # Keep only last 20 exchanges per session
            if len(self.conversation_history[session_id]) > 40:
                self.conversation_history[session_id] = self.conversation_history[session_id][-40:]
            
            return {
                "response": response,
                "persona_used": selected_persona,
                "persona_name": persona.name
            }
            
        except Exception as e:
            return {
                "response": "I'm having trouble processing your request right now. Could you please try again?",
                "persona_used": "general",
                "persona_name": "General Assistant",
                "error": str(e)
            }

# Initialize the agent system
aurora_system = AuroraAgentSystem()

@app.get("/")
async def root():
    return {"message": "Aurora Multi-Agent Voice AI Assistant API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Aurora AI Assistant"}

@app.post("/api/debug/request")
async def debug_request(request: dict):
    """Debug endpoint to test request validation"""
    return {
        "received_data": request,
        "message_type": type(request.get("message")),
        "session_id_type": type(request.get("session_id")),
        "persona_preference_type": type(request.get("persona_preference")),
        "persona_preference_value": request.get("persona_preference")
    }

@app.post("/api/chat")
async def chat(request: ConversationRequest):
    """Main chat endpoint for voice and text conversations"""
    try:
        # Validate input
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        if not request.session_id.strip():
            raise HTTPException(status_code=400, detail="Session ID cannot be empty")
        
        # Check if Groq client is available
        if groq_client is None:
            # Return a graceful error response instead of raising an exception
            return ConversationResponse(
                response="I'm currently experiencing technical difficulties with my AI service. Please try again later or contact support if the issue persists.",
                persona_used="General Assistant",
                session_id=request.session_id,
                message_id=str(uuid.uuid4())
            )
        
        # Generate response using Aurora system
        result = aurora_system.generate_response(
            message=request.message,
            session_id=request.session_id,
            persona_preference=request.persona_preference
        )
        
        # Create message ID
        message_id = str(uuid.uuid4())
        
        # Store conversation in database if MongoDB is available
        if db is not None:
            try:
                conversation_doc = {
                    "_id": message_id,
                    "session_id": request.session_id,
                    "user_message": request.message,
                    "ai_response": result["response"],
                    "persona_used": result["persona_used"],
                    "persona_name": result["persona_name"],
                    "timestamp": datetime.utcnow(),
                    "error": result.get("error")
                }
                
                db.conversations.insert_one(conversation_doc)
                print(f"✅ Conversation stored in MongoDB: {message_id}")
            except Exception as db_error:
                print(f"⚠️ Failed to store conversation in MongoDB: {db_error}")
                # Continue without database storage
        else:
            print("⚠️ MongoDB not available - skipping conversation storage")
        
        return ConversationResponse(
            response=result["response"],
            persona_used=result["persona_name"],
            session_id=request.session_id,
            message_id=message_id
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"❌ Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing conversation: {str(e)}")

@app.get("/api/personas")
async def get_personas():
    """Get available personas"""
    personas_info = {}
    for key, persona in aurora_system.personas.items():
        personas_info[key] = {
            "name": persona.name,
            "keywords": persona.keywords
        }
    return personas_info

@app.get("/api/conversations/{session_id}")
async def get_conversation_history(session_id: str):
    """Get conversation history for a session"""
    try:
        if not session_id.strip():
            raise HTTPException(status_code=400, detail="Session ID cannot be empty")
        
        if db is None:
            raise HTTPException(status_code=503, detail="Database service is currently unavailable")
        
        conversations = list(db.conversations.find(
            {"session_id": session_id},
            {"_id": 0}
        ).sort("timestamp", 1))
        
        return {
            "session_id": session_id,
            "conversations": conversations,
            "count": len(conversations)
        }
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"❌ Error fetching conversations: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching conversations: {str(e)}")

@app.get("/api/sessions")
async def get_all_sessions():
    """Get all unique sessions"""
    try:
        if db is None:
            raise HTTPException(status_code=503, detail="Database service is currently unavailable")
        
        # Get unique session IDs with their latest conversation
        pipeline = [
            {
                "$group": {
                    "_id": "$session_id",
                    "last_message": {"$last": "$$ROOT"},
                    "message_count": {"$sum": 1}
                }
            },
            {
                "$sort": {"last_message.timestamp": -1}
            }
        ]
        
        sessions = list(db.conversations.aggregate(pipeline))
        
        # Format the response
        formatted_sessions = []
        for session in sessions:
            formatted_sessions.append({
                "session_id": session["_id"],
                "last_message": session["last_message"]["user_message"],
                "last_response": session["last_message"]["ai_response"],
                "message_count": session["message_count"],
                "last_updated": session["last_message"]["timestamp"],
                "persona_used": session["last_message"]["persona_used"]
            })
        
        return {
            "sessions": formatted_sessions,
            "total_sessions": len(formatted_sessions)
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error fetching sessions: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching sessions: {str(e)}")

@app.delete("/api/conversations/{session_id}")
async def clear_conversation_history(session_id: str):
    """Clear conversation history for a specific session"""
    try:
        if not session_id.strip():
            raise HTTPException(status_code=400, detail="Session ID cannot be empty")
        
        if db is None:
            raise HTTPException(status_code=503, detail="Database service is currently unavailable")
        
        # Delete all conversations for the session
        result = db.conversations.delete_many({"session_id": session_id})
        
        # Also clear from memory if it exists
        if hasattr(aurora_system, 'conversation_history') and session_id in aurora_system.conversation_history:
            del aurora_system.conversation_history[session_id]
        
        return {
            "session_id": session_id,
            "deleted_count": result.deleted_count,
            "message": f"Successfully cleared {result.deleted_count} conversations for session {session_id}"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error clearing conversations: {e}")
        raise HTTPException(status_code=500, detail=f"Error clearing conversations: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)