import React, { useState } from 'react';
import { PERSONA_COLORS, MESSAGE_TYPES } from '../utils/constants';

const ChatInterface = ({
  conversation,
  messagesEndRef,
  currentPersona,
  onPersonaChange,
  onSendMessage,
  onClearConversation,
  onClearFromDB,
  isConnected,
  error
}) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message, currentPersona);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getPersonaColor = (persona) => {
    return PERSONA_COLORS[persona] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex-1 flex flex-col h-[60vh] md:h-screen">
      {/* Header */}
      <div className="p-2 md:p-4 border-b border-white/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0">
          <div className="flex items-center space-x-2 md:space-x-4">
            <h1 className="text-xl md:text-2xl font-bold text-white">Saarthi</h1>
            <div className={`flex items-center space-x-2 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm ${
              isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-300' : 'bg-red-300'}`}></div>
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-2 w-full md:w-auto mt-2 md:mt-0">
            <select
              value={currentPersona}
              onChange={(e) => onPersonaChange(e.target.value)}
              className="px-2 md:px-3 py-1 bg-white/20 text-white rounded-lg backdrop-blur-md border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-xs md:text-sm"
            >
              <option value="auto" className="text-gray-800">Auto-Select Persona</option>
              <option value="general" className="text-gray-800">General Assistant</option>
              <option value="education" className="text-gray-800">Education Specialist</option>
              <option value="mental_health" className="text-gray-800">Mental Health Support</option>
            </select>
            <button
              onClick={onClearConversation}
              className="px-2 md:px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs md:text-sm transition-colors"
            >
              Clear Chat
            </button>
            <button
              onClick={onClearFromDB}
              className="px-2 md:px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs md:text-sm transition-colors"
              title="Clear chat history from database"
            >
              Clear from DB
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-2 md:mx-4 mt-2 md:mt-4 p-2 md:p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-xs md:text-base">
          {error}
        </div>
      )}

      {/* Conversation Area */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4">
        <div className="max-w-full md:max-w-4xl mx-auto">
          {conversation.length === 0 ? (
            <div className="text-center text-white/70 mt-10 md:mt-20">
              <div className="text-4xl md:text-6xl mb-2 md:mb-4">🎤</div>
              <p className="text-lg md:text-xl mb-1 md:mb-2">Hi! I'm Saarthi, your AI assistant.</p>
              <p className="text-base md:text-lg">Click the microphone to start talking, or type your message below.</p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-4">
              {conversation.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === MESSAGE_TYPES.USER ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80vw] md:max-w-xs lg:max-w-md px-3 md:px-4 py-2 rounded-2xl ${
                      msg.type === MESSAGE_TYPES.USER
                        ? 'bg-indigo-600 text-white'
                        : msg.type === MESSAGE_TYPES.ERROR
                        ? 'bg-red-500 text-white'
                        : 'bg-white/90 text-gray-800'
                    }`}
                  >
                    <p className="text-xs md:text-sm">{msg.text}</p>
                    <div className="flex items-center justify-between mt-1 md:mt-2">
                      <span className="text-[10px] md:text-xs opacity-70">{msg.timestamp}</span>
                      {msg.persona && (
                        <span className={`text-[10px] md:text-xs px-1 md:px-2 py-0.5 rounded-full ${getPersonaColor(msg.persona)}`}>
                          {msg.persona}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-2 md:p-4 border-t border-white/20">
        <div className="max-w-full md:max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 md:px-4 pt-1 bg-white/20 text-white rounded-lg backdrop-blur-md border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none text-xs md:text-base"
              rows="1"
              disabled={!isConnected}
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || !isConnected}
              className="px-4 md:px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-xs md:text-base"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 