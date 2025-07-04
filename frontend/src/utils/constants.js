export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const PERSONAS = {
  auto: { name: 'Auto-Select Persona', value: 'auto' },
  general: { name: 'General Assistant', value: 'general' },
  education: { name: 'Education Specialist', value: 'education' },
  mental_health: { name: 'Mental Health Support', value: 'mental_health' }
};

export const PERSONA_COLORS = {
  'General Assistant': 'bg-blue-100 text-blue-800',
  'Education Specialist': 'bg-green-100 text-green-800',
  'Mental Health Support': 'bg-purple-100 text-purple-800'
};

export const MESSAGE_TYPES = {
  USER: 'user',
  AI: 'ai',
  ERROR: 'error'
}; 