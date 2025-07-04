import { useState, useEffect, useRef } from 'react';

const useChat = (backendUrl, currentSessionId, updateSessionLastActive) => {
  const [conversation, setConversation] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    checkBackendConnection();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/health`);
      if (response.ok) {
        setIsConnected(true);
        setError('');
      } else {
        setIsConnected(false);
        setError('Backend connection failed');
      }
    } catch (err) {
      setIsConnected(false);
      setError('Cannot connect to backend');
    }
  };

  const sendMessage = async (textMessage, personaPreference) => {
    if (!textMessage.trim()) return;

    // Check if we have a valid session ID
    if (!currentSessionId) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        text: 'Error: No active session. Please create or select a session first.',
        timestamp: new Date().toLocaleTimeString()
      };
      setConversation(prev => [...prev, errorMessage]);
      setError('No active session');
      return null;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: textMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setConversation(prev => [...prev, userMessage]);

    try {
      // Prepare request body - only include persona_preference if it's not 'auto'
      const requestBody = {
        message: textMessage,
        session_id: currentSessionId
      };

      // Only add persona_preference if it's not 'auto'
      if (personaPreference && personaPreference !== 'auto') {
        requestBody.persona_preference = personaPreference;
      }

      console.log('Sending request to backend:', requestBody);

      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: data.response,
        persona: data.persona_used,
        timestamp: new Date().toLocaleTimeString()
      };

      setConversation(prev => [...prev, aiMessage]);
      
      // Update session last active time
      updateSessionLastActive(currentSessionId);

      return data.response;

    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        text: `Error: ${err.message}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setConversation(prev => [...prev, errorMessage]);
      setError(err.message);
      return null;
    }
  };

  const clearConversation = () => {
    setConversation([]);
  };

  const clearConversationFromDB = async () => {
    if (!currentSessionId) {
      console.log('No active session to clear');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/conversations/${currentSessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error clearing conversation:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('Conversation cleared from database:', data);
      
      // Also clear from local state
      setConversation([]);
      
      return data;
    } catch (err) {
      console.error('Failed to clear conversation from database:', err);
      // Still clear from local state even if database clear fails
      setConversation([]);
      throw err;
    }
  };

  const loadConversation = (messages) => {
    setConversation(messages);
  };

  return {
    conversation,
    isConnected,
    error,
    messagesEndRef,
    sendMessage,
    clearConversation,
    clearConversationFromDB,
    loadConversation,
    checkBackendConnection
  };
};

export default useChat; 