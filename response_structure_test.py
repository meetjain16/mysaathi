import requests
import json
import uuid
import sys

def test_chat_api_response_structure():
    """Test the exact structure of the chat API response"""
    backend_url = "https://e7a26a60-3d28-42e6-b4c0-ffce361f1b1e.preview.emergentagent.com"
    session_id = f"test_session_{uuid.uuid4()}"
    
    test_messages = [
        {
            "type": "Educational",
            "message": "Can you help me with math homework?",
            "expected_persona": "education"
        },
        {
            "type": "Mental Health",
            "message": "I'm feeling anxious and stressed",
            "expected_persona": "mental_health"
        },
        {
            "type": "General",
            "message": "What's the weather like?",
            "expected_persona": "general"
        }
    ]
    
    print("Testing Saarthi Chat API Response Structure")
    print("=" * 60)
    
    for test in test_messages:
        print(f"\n🔍 Testing {test['type']} Message: '{test['message']}'")
        
        try:
            url = f"{backend_url}/api/chat"
            payload = {
                "message": test['message'],
                "session_id": session_id,
                "persona_preference": None  # Let the system auto-select persona
            }
            
            headers = {'Content-Type': 'application/json'}
            response = requests.post(url, json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ API Response (Status {response.status_code}):")
                print(json.dumps(data, indent=2))
                
                # Check response structure
                print("\nResponse Structure Analysis:")
                for key, value in data.items():
                    print(f"  - {key}: {type(value).__name__} = {value}")
                
            else:
                print(f"❌ Failed - Status: {response.status_code}")
                print(response.text)
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    test_chat_api_response_structure()