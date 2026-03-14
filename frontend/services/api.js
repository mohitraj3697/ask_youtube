// api service functions for backend interaction
const API_BASE_URL = 'http://localhost:8000'; // default backend url

export const loadVideo = async (videoId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/load_video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_id: videoId }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to load video on the server.');
    }
    return data;
  } catch (error) {
    console.error('Failed to load video:', error);
    throw error;
  }
};

export const askQuestion = async (question, maxTokens) => {
  try {
    const res = await fetch(`${API_BASE_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, max_tokens: maxTokens }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to ask question on the server.');
    }
    return data;
  } catch (error) {
    console.error('Failed to ask question:', error);
    throw error;
  }
};
