import React from 'react';

const SessionPanel = ({
  sessions,
  currentSessionId,
  showSessionModal,
  newSessionName,
  onSessionClick,
  onNewSession,
  onCreateSession,
  onDeleteSession,
  onSessionNameChange,
  onCloseModal
}) => {
  return (
    <div className="w-full md:w-80 bg-white/10 backdrop-blur-md border-r border-white/20 h-full md:h-screen overflow-y-auto relative">
      {/* Mobile close button */}
      <button
        className="absolute top-2 right-2 md:hidden p-2 bg-gray-800 text-white rounded-full z-50"
        onClick={onCloseModal}
        aria-label="Close Sessions"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-xl font-semibold text-white">Sessions</h2>
          <button
            onClick={onNewSession}
            className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <div className="text-sm text-white/70">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''}
        </div>
      </div>
      {/* Sessions List */}
      <div className="p-4 space-y-2">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`p-3 rounded-lg border cursor-pointer transition-all text-sm md:text-base ${
              session.id === currentSessionId
                ? 'bg-indigo-600/30 border-indigo-400 text-white'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }`}
            onClick={() => onSessionClick(session.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{session.name}</h4>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(session.lastActive).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {session.id === currentSessionId && (
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                )}
                {session.id !== currentSessionId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="p-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                    title="Delete session"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* New Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xs md:w-96">
            <h3 className="text-lg font-semibold mb-4">Create New Session</h3>
            <input
              type="text"
              value={newSessionName}
              onChange={(e) => onSessionNameChange(e.target.value)}
              placeholder="Enter session name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-4"
              onKeyPress={(e) => e.key === 'Enter' && onCreateSession()}
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={onCloseModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={onCreateSession}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionPanel; 