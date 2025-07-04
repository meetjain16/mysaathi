import React from 'react';

const VoiceControls = ({
  isListening,
  isSpeaking,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  isConnected,
  voiceInputError
}) => {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col space-y-2">
      {/* Voice Input Button */}
      <button
        onClick={isListening ? onStopListening : onStartListening}
        className={`flex items-center justify-center w-16 h-16 rounded-full text-white transition-all duration-200 shadow-lg ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
        disabled={!isConnected}
        title={isListening ? 'Stop listening' : 'Start listening'}
      >
        {isListening ? (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <rect x="6" y="4" width="8" height="12" rx="1"/>
          </svg>
        ) : (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Stop Speaking Button */}
      {isSpeaking && (
        <button
          onClick={onStopSpeaking}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-lg"
          title="Stop speaking"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* Voice Input Error Message */}
      {voiceInputError && (
        <div className="bg-red-500 text-white text-xs px-3 py-2 rounded-lg shadow-lg max-w-xs">
          {voiceInputError}
        </div>
      )}

      {/* Status Indicator */}
      <div className="flex items-center justify-center">
        <div className={`w-3 h-3 rounded-full ${
          isListening ? 'bg-red-400 animate-pulse' :
          isSpeaking ? 'bg-green-400 animate-pulse' :
          'bg-gray-400'
        }`}></div>
      </div>
    </div>
  );
};

export default VoiceControls; 