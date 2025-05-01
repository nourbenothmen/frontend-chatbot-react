import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Adaptez selon votre configuration

export const askQuestion = async (question) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ask`, {
      question: question
    });
    return response.data;
  } catch (error) {
    console.error('Error asking question:', error);
    throw error;
  }
};

export const logFeedback = async (feedbackData) => {
  try {
    await axios.post(`${API_BASE_URL}/log-feedback`, feedbackData);
  } catch (error) {
    console.error('Error logging feedback:', error);
  }
};

export const getQuestions = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/questions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};