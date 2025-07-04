import { useState, useEffect } from 'react';

const useSessions = (backendUrl) => {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('Saarthi_sessions');
    if (savedSessions) {
      try {
        const parsedSessions = JSON.parse(savedSessions);
        if (parsedSessions && parsedSessions.length > 0) {
          setSessions(parsedSessions);
          setCurrentSessionId(parsedSessions[0].id);
        } else {
          // Create initial session if parsed sessions is empty
          createInitialSession();
        }
      } catch (error) {
        console.error('Error parsing saved sessions:', error);
        createInitialSession();
      }
    } else {
      // Create initial session
      createInitialSession();
    }
  }, []);

  const createInitialSession = () => {
    const initialSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: 'New Session',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    setSessions([initialSession]);
    setCurrentSessionId(initialSession.id);
    localStorage.setItem('Saarthi_sessions', JSON.stringify([initialSession]));
  };

  const createNewSession = () => {
    const name = newSessionName.trim() || `Session ${sessions.length + 1}`;
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const newSession = {
      id: `session_${timestamp}_${randomId}`,
      name: name,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    
    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    setCurrentSessionId(newSession.id);
    setNewSessionName('');
    setShowSessionModal(false);
    
    localStorage.setItem('Saarthi_sessions', JSON.stringify(updatedSessions));
    return newSession.id;
  };

  const switchSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    
    // Update last active time
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, lastActive: new Date().toISOString() }
        : session
    ));
    
    // Load conversation history from backend
    try {
      const response = await fetch(`${backendUrl}/api/conversations/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        return data.conversations.map(conv => [
          {
            id: Date.now() + Math.random(),
            type: 'user',
            text: conv.user_message,
            timestamp: new Date(conv.timestamp).toLocaleTimeString()
          },
          {
            id: Date.now() + Math.random() + 1,
            type: 'ai',
            text: conv.ai_response,
            persona: conv.persona_name,
            timestamp: new Date(conv.timestamp).toLocaleTimeString()
          }
        ]).flat();
      }
    } catch (err) {
      console.log('No conversation history found for this session');
    }
    
    return [];
  };

  const deleteSession = (sessionId) => {
    const updatedSessions = sessions.filter(session => session.id !== sessionId);
    setSessions(updatedSessions);
    
    // If we're deleting the current session, switch to the first available session
    if (sessionId === currentSessionId) {
      if (updatedSessions.length > 0) {
        setCurrentSessionId(updatedSessions[0].id);
      } else {
        // Create a new session if no sessions remain
        const newSessionId = createNewSession();
        setCurrentSessionId(newSessionId);
      }
    }
    
    localStorage.setItem('Saarthi_sessions', JSON.stringify(updatedSessions));
  };

  const updateSessionLastActive = (sessionId) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, lastActive: new Date().toISOString() }
        : session
    ));
  };

  return {
    sessions,
    currentSessionId,
    showSessionModal,
    newSessionName,
    setShowSessionModal,
    setNewSessionName,
    createNewSession,
    switchSession,
    deleteSession,
    updateSessionLastActive
  };
};

export default useSessions; 