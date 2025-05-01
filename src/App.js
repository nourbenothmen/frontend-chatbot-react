import React, { useState, useEffect } from 'react';
import { 
  Box, TextField, Button, Avatar, Typography, 
  CircularProgress, IconButton, Divider, List, 
  ListItem, ListItemText, Tooltip, Snackbar
} from '@mui/material';
import { 
  Send as SendIcon, 
  ContentCopy as CopyIcon,
  History as HistoryIcon,
  ThumbUp as LikeIcon,
  ThumbDown as DislikeIcon
} from '@mui/icons-material';
import { askQuestion, logFeedback } from './api';
import './App.css';

const ChatbotISET = () => {
  const [messages, setMessages] = useState([
    { text: 'Bonjour! Je suis l\'assistant virtuel de l\'ISET Sfax. Comment puis-je vous aider?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [showHistory, setShowHistory] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState(''); // For error messages
  const [feedbacks, setFeedbacks] = useState({});

  // Load conversations from localStorage
  useEffect(() => {
    const savedConversations = localStorage.getItem('chatbot-conversations');
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }
  }, []);

  // Save conversations
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('chatbot-conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  const startNewConversation = () => {
    setActiveConversation(Date.now());
    setMessages([{ 
      text: 'Bonjour! Je suis l\'assistant virtuel de l\'ISET Sfax. Comment puis-je vous aider?', 
      sender: 'bot' 
    }]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    if (!activeConversation) {
      startNewConversation();
    }
    
    const userMessage = { text: input, sender: 'user', timestamp: new Date() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    
    try {
      const response = await askQuestion(input);
      console.log('Response from askQuestion:', response); // Debug response
      const botMessage = { 
        text: response.answer || "Désolé, je n'ai pas trouvé de réponse.", 
        sender: 'bot',
        url: response.url,
        answerId: response.answer_id || response.id, // Ensure correct field
        question: input,
        timestamp: new Date()
      };
      
      setMessages([...updatedMessages, botMessage]);
      
      setConversations(prev => {
        const existing = prev.find(c => c.id === activeConversation);
        if (existing) {
          return prev.map(c => c.id === activeConversation 
            ? { ...c, messages: [...updatedMessages, botMessage] } 
            : c
          );
        }
        return [...prev, {
          id: activeConversation,
          title: input.slice(0, 30) + (input.length > 30 ? '...' : ''),
          messages: [...updatedMessages, botMessage],
          lastUpdated: new Date()
        }];
      });

      await logFeedback({
        question: input,
        answer_id: response.answer_id || response.id,
        feedback: 'auto_generated'
      });
      
    } catch (error) {
      console.error('Error in handleSend:', error);
      setMessages(prev => [
        ...prev, 
        { text: "Une erreur s'est produite. Veuillez réessayer.", sender: 'bot', timestamp: new Date() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setActiveConversation(conversationId);
      setMessages(conversation.messages);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbarMessage('Réponse copiée !');
    setSnackbarOpen(true);
  };

  const handleFeedback = async (answerId, isLike, question) => {
    setFeedbacks(prev => ({ ...prev, [answerId]: isLike }));
    const feedbackData = {
      question: question,
      answer_id: answerId,
      feedback: isLike ? 'positif' : 'négatif'
    };
    console.log('Sending feedback:', feedbackData); // Debug data being sent
    try {
      const response = await logFeedback(feedbackData);
      console.log('Feedback response:', response); // Debug response
      setSnackbarMessage('Feedback enregistré !');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error in handleFeedback:', error);
      setSnackbarMessage('Erreur lors de l\'enregistrement du feedback.');
      setSnackbarOpen(true);
    }
  };

  return (
    <Box className="app-container">
      <Box className={`history-panel ${showHistory ? 'visible' : ''}`}>
        <Box className="history-header">
          <Typography variant="h6">Historique</Typography>
          <Button 
            variant="contained" 
            onClick={startNewConversation}
            size="small"
          >
            Nouvelle discussion
          </Button>
        </Box>
        <List>
          {conversations.map((conv) => (
            <ListItem 
              key={conv.id} 
              button 
              selected={activeConversation === conv.id}
              onClick={() => loadConversation(conv.id)}
            >
              <ListItemText
                primary={conv.title}
                secondary={new Date(conv.lastUpdated).toLocaleString()}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Box className="chat-container">
        <Box className="chat-header">
          <IconButton onClick={() => setShowHistory(!showHistory)}>
            <HistoryIcon />
          </IconButton>
          <Typography variant="h5">ISET Sfax - Assistant Virtuel</Typography>
        </Box>
        
        <Box className="chat-messages">
          {messages.map((msg, index) => (
            <Box key={index} className={`message ${msg.sender}`}>
              <Avatar className="avatar">
                {msg.sender === 'bot' ? 'ISET' : 'Vous'}
              </Avatar>
              <Box className="message-content">
                {msg.text}
                {msg.url && (
                  <a href={msg.url} target="_blank" rel="noopener noreferrer" className="more-link">
                    En savoir plus
                  </a>
                )}
                {msg.sender === 'bot' && msg.answerId && (
                  <Box className="message-actions">
                    <Tooltip title="Copier">
                      <IconButton size="small" onClick={() => handleCopy(msg.text)}>
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Box className="feedback-buttons">
                      <Tooltip title="Like">
                        <IconButton 
                          size="small" 
                          color={feedbacks[msg.answerId] === true ? 'primary' : 'default'}
                          onClick={() => handleFeedback(msg.answerId, true, msg.question)}
                        >
                          <LikeIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Dislike">
                        <IconButton 
                          size="small" 
                          color={feedbacks[msg.answerId] === false ? 'error' : 'default'}
                          onClick={() => handleFeedback(msg.answerId, false, msg.question)}
                        >
                          <DislikeIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                )}
                <Typography variant="caption" className="message-time">
                  {msg.timestamp?.toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          ))}
          {loading && (
            <Box className="message bot">
              <Avatar className="avatar">ISET</Avatar>
              <Box className="message-content">
                <CircularProgress size={20} />
              </Box>
            </Box>
          )}
        </Box>
        
        <Box className="chat-input">
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
            multiline
            maxRows={4}
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSend}
            className="send-button"
            disabled={loading}
          >
            <SendIcon />
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default ChatbotISET;