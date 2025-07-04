import requests
import uuid
import time
import json
from datetime import datetime

class SaarthiAPITester:
    def __init__(self, base_url="https://e7a26a60-3d28-42e6-b4c0-ffce361f1b1e.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_id = f"test_session_{uuid.uuid4()}"
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                return success, response.json() if response.content else {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                return success, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_endpoint(self):
        """Test the health check endpoint"""
        success, response = self.run_test(
            "Health Check Endpoint",
            "GET",
            "/api/health",
            200
        )
        if success:
            print(f"Health check response: {response}")
        return success

    def test_personas_endpoint(self):
        """Test the personas endpoint"""
        success, response = self.run_test(
            "Personas Endpoint",
            "GET",
            "/api/personas",
            200
        )
        if success:
            print(f"Available personas: {list(response.keys())}")
            # Verify all three personas are present
            expected_personas = ["general", "education", "mental_health"]
            all_present = all(persona in response for persona in expected_personas)
            if all_present:
                print("✅ All expected personas are present")
            else:
                print("❌ Some personas are missing")
                success = False
        return success

    def test_chat_endpoint_general(self):
        """Test the chat endpoint with a general question"""
        message = "Hello, how are you today?"
        success, response = self.run_test(
            "Chat Endpoint - General Question",
            "POST",
            "/api/chat",
            200,
            data={
                "message": message,
                "session_id": self.session_id,
                "persona_preference": "general"
            }
        )
        if success:
            print(f"AI Response: {response.get('response', '')[:100]}...")
            print(f"Persona Used: {response.get('persona_used', '')}")
            if "General Assistant" in response.get('persona_used', ''):
                print("✅ Correct persona (General Assistant) was used")
            else:
                print("❌ Incorrect persona was used")
                success = False
        return success

    def test_chat_endpoint_education(self):
        """Test the chat endpoint with an educational question"""
        message = "Can you explain photosynthesis to me?"
        success, response = self.run_test(
            "Chat Endpoint - Educational Question",
            "POST",
            "/api/chat",
            200,
            data={
                "message": message,
                "session_id": self.session_id,
                "persona_preference": "education"
            }
        )
        if success:
            print(f"AI Response: {response.get('response', '')[:100]}...")
            print(f"Persona Used: {response.get('persona_used', '')}")
            if "Education Specialist" in response.get('persona_used', ''):
                print("✅ Correct persona (Education Specialist) was used")
            else:
                print("❌ Incorrect persona was used")
                success = False
        return success

    def test_chat_endpoint_mental_health(self):
        """Test the chat endpoint with a mental health question"""
        message = "I'm feeling stressed and anxious today."
        success, response = self.run_test(
            "Chat Endpoint - Mental Health Question",
            "POST",
            "/api/chat",
            200,
            data={
                "message": message,
                "session_id": self.session_id,
                "persona_preference": "mental_health"
            }
        )
        if success:
            print(f"AI Response: {response.get('response', '')[:100]}...")
            print(f"Persona Used: {response.get('persona_used', '')}")
            if "Mental Health Support" in response.get('persona_used', ''):
                print("✅ Correct persona (Mental Health Support) was used")
            else:
                print("❌ Incorrect persona was used")
                success = False
        return success

    def test_auto_persona_classification(self):
        """Test automatic persona classification"""
        message = "I need help with my math homework and I'm feeling stressed about it."
        success, response = self.run_test(
            "Chat Endpoint - Auto Persona Classification",
            "POST",
            "/api/chat",
            200,
            data={
                "message": message,
                "session_id": self.session_id,
                "persona_preference": None
            }
        )
        if success:
            print(f"AI Response: {response.get('response', '')[:100]}...")
            print(f"Persona Used: {response.get('persona_used', '')}")
            # According to the classification logic, mental health keywords take priority
            if "Mental Health Support" in response.get('persona_used', ''):
                print("✅ Correct auto-classification to Mental Health Support")
            else:
                print("❌ Incorrect auto-classification")
                success = False
        return success

    def test_conversation_history(self):
        """Test conversation history endpoint"""
        success, response = self.run_test(
            "Conversation History Endpoint",
            "GET",
            f"/api/conversations/{self.session_id}",
            200
        )
        if success:
            conversations = response.get('conversations', [])
            print(f"Retrieved {len(conversations)} conversation entries")
            if len(conversations) > 0:
                print("✅ Conversation history is being stored correctly")
            else:
                print("❌ No conversation history found")
                success = False
        return success

    def test_error_handling(self):
        """Test error handling with invalid data"""
        success, response = self.run_test(
            "Error Handling - Empty Message",
            "POST",
            "/api/chat",
            422,  # FastAPI validation error code
            data={
                "message": "",
                "session_id": self.session_id
            }
        )
        # For this test, we expect a validation error, so success means we got the error
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Saarthi Voice AI Assistant API Tests")
        print("=" * 60)
        
        # Basic functionality tests
        health_check = self.test_health_endpoint()
        personas_check = self.test_personas_endpoint()
        
        # Chat functionality tests
        general_chat = self.test_chat_endpoint_general()
        education_chat = self.test_chat_endpoint_education()
        mental_health_chat = self.test_chat_endpoint_mental_health()
        
        # Advanced functionality tests
        auto_classification = self.test_auto_persona_classification()
        
        # Wait a bit to ensure conversations are stored
        time.sleep(1)
        
        # History and error handling tests
        history_check = self.test_conversation_history()
        error_handling = self.test_error_handling()
        
        print("\n" + "=" * 60)
        print(f"📊 Tests passed: {self.tests_passed}/{self.tests_run}")
        
        # Summary of test results
        test_results = {
            "Health Check": health_check,
            "Personas Endpoint": personas_check,
            "General Chat": general_chat,
            "Education Chat": education_chat,
            "Mental Health Chat": mental_health_chat,
            "Auto Classification": auto_classification,
            "Conversation History": history_check,
            "Error Handling": error_handling
        }
        
        print("\n📋 Test Results Summary:")
        for test, result in test_results.items():
            print(f"  {'✅' if result else '❌'} {test}")
        
        return all(test_results.values())

if __name__ == "__main__":
    tester = SaarthiAPITester()
    success = tester.run_all_tests()
    exit(0 if success else 1)