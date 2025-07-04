import requests
import json
import uuid
import sys

def test_persona_classification():
    """Test the backend's persona classification logic with various messages"""
    backend_url = "https://e7a26a60-3d28-42e6-b4c0-ffce361f1b1e.preview.emergentagent.com"
    session_id = f"test_session_{uuid.uuid4()}"
    
    test_cases = [
        # Educational messages
        {"message": "Can you explain photosynthesis?", "expected": "Education Specialist", "category": "Education"},
        {"message": "Help me with my math homework", "expected": "Education Specialist", "category": "Education"},
        {"message": "What is the capital of France?", "expected": "Education Specialist", "category": "Education"},
        {"message": "Teach me about quantum physics", "expected": "Education Specialist", "category": "Education"},
        
        # Mental health messages
        {"message": "I'm feeling anxious and stressed", "expected": "Mental Health Support", "category": "Mental Health"},
        {"message": "I'm depressed and don't know what to do", "expected": "Mental Health Support", "category": "Mental Health"},
        {"message": "How can I cope with anxiety?", "expected": "Mental Health Support", "category": "Mental Health"},
        {"message": "I'm worried about my future", "expected": "Mental Health Support", "category": "Mental Health"},
        
        # General messages
        {"message": "What's the weather like?", "expected": "General Assistant", "category": "General"},
        {"message": "Tell me a joke", "expected": "General Assistant", "category": "General"},
        {"message": "What time is it?", "expected": "General Assistant", "category": "General"},
        {"message": "Hello, how are you?", "expected": "General Assistant", "category": "General"}
    ]
    
    print("Testing Aurora Persona Classification Logic")
    print("=" * 60)
    
    results = {
        "Education": {"correct": 0, "total": 0},
        "Mental Health": {"correct": 0, "total": 0},
        "General": {"correct": 0, "total": 0}
    }
    
    for test in test_cases:
        print(f"\n🔍 Testing: {test['message']}")
        print(f"  Expected: {test['expected']}")
        
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
                persona_used = data.get('persona_used', 'Unknown')
                print(f"  Actual: {persona_used}")
                
                # Update statistics
                category = test['category']
                results[category]["total"] += 1
                
                if persona_used == test['expected']:
                    print(f"  ✅ Correct")
                    results[category]["correct"] += 1
                else:
                    print(f"  ❌ Incorrect")
                
            else:
                print(f"  ❌ API Error: {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
    
    # Print summary
    print("\n" + "=" * 60)
    print("Classification Results Summary:")
    
    total_correct = 0
    total_tests = 0
    
    for category, stats in results.items():
        accuracy = (stats["correct"] / stats["total"]) * 100 if stats["total"] > 0 else 0
        print(f"  {category}: {stats['correct']}/{stats['total']} correct ({accuracy:.1f}%)")
        total_correct += stats["correct"]
        total_tests += stats["total"]
    
    overall_accuracy = (total_correct / total_tests) * 100 if total_tests > 0 else 0
    print(f"\nOverall Accuracy: {total_correct}/{total_tests} ({overall_accuracy:.1f}%)")

if __name__ == "__main__":
    test_persona_classification()