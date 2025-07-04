import React, { useState, useEffect } from 'react';
import './App.css';

// Custom Hooks
import useSessions from './hooks/useSessions';
import useSpeech from './hooks/useSpeech';
import useChat from './hooks/useChat';

// Components
import SessionPanel from './components/SessionPanel';
import ChatInterface from './components/ChatInterface';
import VoiceControls from './components/VoiceControls';

// Utils
import { BACKEND_URL } from './utils/constants';

const App = () => {
  const [currentPersona, setCurrentPersona] = useState('auto');
  const [isLoading, setIsLoading] = useState(true);
  const [voiceInputError, setVoiceInputError] = useState('');

  // Custom Hooks
  const {
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
  } = useSessions(BACKEND_URL);

  const {
    isListening,
    isSpeaking,
    error: speechError,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    setRecognitionCallback
  } = useSpeech();

  const {
    conversation,
    isConnected,
    error: chatError,
    messagesEndRef,
    sendMessage,
    clearConversation,
    clearConversationFromDB,
    loadConversation
  } = useChat(BACKEND_URL, currentSessionId, updateSessionLastActive);

  // Handle session switching
  useEffect(() => {
    if (currentSessionId) {
      switchSession(currentSessionId).then(history => {
        if (history) {
          loadConversation(history);
        }
      });
    }
  }, [currentSessionId]);

  // Set up speech recognition callback
  useEffect(() => {
    setRecognitionCallback((event) => {
      const transcript = event.results[0][0].transcript;
      // Check if we have a valid session before sending
      if (!currentSessionId) {
        console.log('No active session, cannot send voice message');
        setVoiceInputError('No active session. Please create or select a session first.');
        // Clear the error after 3 seconds
        setTimeout(() => setVoiceInputError(''), 3000);
        return;
      }
      setVoiceInputError(''); // Clear any previous errors
      handleSendMessage(transcript, currentPersona);
    });
  }, [currentPersona, currentSessionId]);

  // Set loading to false when we have a valid session
  useEffect(() => {
    if (currentSessionId) {
      setIsLoading(false);
    }
  }, [currentSessionId]);

  const handleSendMessage = async (textMessage, personaPreference) => {
    const response = await sendMessage(textMessage, personaPreference);
    if (response) {
      speakText(response);
    }
  };

  const handleSessionClick = async (sessionId) => {
    const history = await switchSession(sessionId);
    if (history) {
      loadConversation(history);
    }
  };

  const handleNewSession = () => {
    setShowSessionModal(true);
  };

  const handleCreateSession = () => {
    const newSessionId = createNewSession();
    clearConversation();
    // The session switching will be handled by the useEffect
  };

  const handleDeleteSession = (sessionId) => {
    deleteSession(sessionId);
  };

  const handleClearConversation = () => {
    clearConversation();
  };

  const handleClearChatFromDB = async () => {
    try {
      await clearConversationFromDB();
      console.log('Chat history cleared from database successfully');
    } catch (error) {
      console.error('Failed to clear chat from database:', error);
      // Still clear from local state
      clearConversation();
    }
  };

  const handleStartListening = () => {
    if (!currentSessionId) {
      setVoiceInputError('No active session. Please create or select a session first.');
      setTimeout(() => setVoiceInputError(''), 3000);
      return;
    }
    setVoiceInputError(''); // Clear any previous errors
    startListening();
  };

  return (
    <div className="min-h-screen bg-blue-700">
          {/* <div className="min-h-screen bg-gradient-to-br from-blue-800 via-purple-700  to-green-500"> */}

      <div className="flex h-screen ">
        {/* Left Panel - Sessions */}
        <SessionPanel
          sessions={sessions}
          currentSessionId={currentSessionId}
          showSessionModal={showSessionModal}
          newSessionName={newSessionName}
          onSessionClick={handleSessionClick}
          onNewSession={handleNewSession}
          onCreateSession={handleCreateSession}
          onDeleteSession={handleDeleteSession}
          onSessionNameChange={setNewSessionName}
          onCloseModal={() => setShowSessionModal(false)}
        />

        {/* Main Chat Area */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-400"></div>
          </div>
        ) : (
          <>
            <ChatInterface
              conversation={conversation}
              messagesEndRef={messagesEndRef}
              currentPersona={currentPersona}
              onPersonaChange={setCurrentPersona}
              onSendMessage={handleSendMessage}
              onClearConversation={handleClearConversation}
              onClearFromDB={handleClearChatFromDB}
              isConnected={isConnected}
              error={chatError || speechError}
            />

            {/* Voice Controls */}
            <VoiceControls
              isListening={isListening}
              isSpeaking={isSpeaking}
              onStartListening={handleStartListening}
              onStopListening={stopListening}
              onStopSpeaking={stopSpeaking}
              isConnected={isConnected}
              voiceInputError={voiceInputError}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default App;