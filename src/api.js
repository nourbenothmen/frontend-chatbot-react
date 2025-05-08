import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('unauthorized'));
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
};

export const chatbotAPI = {
  askQuestion: (data) => api.post('/ask', {
    question: data.question,
    language: data.language || 'fr'  // Valeur par défaut
  }),
  suggestQuestion: (data) => api.post('/suggest', {
    question: data.question,
    answer: data.answer,
    language: data.language || 'fr'
  }),
};

export const feedbackAPI = {
  sendFeedback: (data) => api.post('/feedback', {
    question: data.question,
    answer_id: data.answerId,
    feedback: data.feedbackType
  }),
};