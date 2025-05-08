import React, { useState, useEffect } from 'react';
import { 
  Box, TextField, Button, Avatar, Typography, 
  CircularProgress, IconButton, Divider, List, 
  ListItem, ListItemText, Tooltip, Snackbar, Select, MenuItem
} from '@mui/material';
import { 
  Send as SendIcon, 
  ContentCopy as CopyIcon,
  History as HistoryIcon,
  ThumbUp as LikeIcon,
  ThumbDown as DislikeIcon,
  Add as AddIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { chatbotAPI, feedbackAPI } from './api';
import './ChatbotISET.css';

const ChatbotISET = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [state, setState] = useState({
    messages: [],
    input: '',
    loading: false,
    conversations: JSON.parse(localStorage.getItem('chatbot-conversations')) || [],
    activeConversation: null,
    showHistory: true,
    snackbar: { open: false, message: '' },
    feedbacks: {},
    language: 'fr'
  });

  useEffect(() => {
    initializeChat();
  }, [user, state.language]);

  const initializeChat = () => {
    const welcomeMessage = {
      text: state.language === 'fr' 
        ? user 
          ? 'Bonjour! Je suis l\'assistant ISET. Comment puis-je vous aider?'
          : 'Veuillez vous connecter pour utiliser le chatbot'
        : user
          ? 'Hello! I am the ISET assistant. How can I help you?'
          : 'Please log in to use the chatbot',
      sender: 'bot',
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [welcomeMessage]
    }));
  };

  const handleSend = async () => {
    if (!state.input.trim()) {
      showSnackbar(
        state.language === 'fr' 
          ? 'Veuillez entrer une question'
          : 'Please enter a question'
      );
      return;
    }

    if (!user) {
      showSnackbar(
        state.language === 'fr'
          ? 'Veuillez vous connecter'
          : 'Please log in'
      );
      return;
    }

    const userMessage = {
      text: state.input,
      sender: 'user',
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      input: '',
      loading: true
    }));

    try {
      const { data } = await chatbotAPI.askQuestion({
        question: state.input,
        language: state.language
      });

      if (data.error) {
        throw new Error(data.error);
      }

      const botMessage = {
        text: (data.answer || (state.language === 'fr' 
                ? "Désolé, je n'ai pas de réponse à cette question." 
                : "Sorry, I don't have an answer for this question."))
              .replace(/\s*\d+$/, '').trim(),  // Supprime les chiffres en fin de message
        sender: 'bot',
        url: data.url,
        answerId: data.answer_id,
        question: state.input,
        timestamp: new Date(),
        language: data.language || state.language
      };


 
      updateConversation(botMessage);
    } catch (error) {
      console.error('Error asking question:', error);
      showSnackbar(
        error.message || 
        (state.language === 'fr' 
          ? 'Erreur lors de la communication avec le serveur'
          : 'Error communicating with server')
      );
      
      // Re-afficher le message de l'utilisateur en cas d'erreur
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.sender !== 'user'),
        input: state.input,
        loading: false
      }));
    }
  };

  const updateConversation = (botMessage) => {
    setState(prev => {
      const updatedMessages = [...prev.messages, botMessage];
      const conversationId = prev.activeConversation || Date.now();
      
      const updatedConversations = prev.conversations.some(c => c.id === conversationId)
        ? prev.conversations.map(c => 
            c.id === conversationId 
              ? { 
                  ...c, 
                  messages: updatedMessages,
                  lastUpdated: new Date()
                } 
              : c
          )
        : [
            ...prev.conversations,
            {
              id: conversationId,
              title: prev.input.slice(0, 30) + (prev.input.length > 30 ? '...' : ''),
              messages: updatedMessages,
              lastUpdated: new Date()
            }
          ];

      localStorage.setItem('chatbot-conversations', JSON.stringify(updatedConversations));

      return {
        ...prev,
        messages: updatedMessages,
        conversations: updatedConversations,
        activeConversation: conversationId,
        loading: false
      };
    });
  };

  const handleFeedback = async (answerId, isLike, question) => {
    try {
      await feedbackAPI.sendFeedback({
        question,
        answerId,
        feedbackType: isLike ? 'positive' : 'negative'
      });

      setState(prev => ({
        ...prev,
        feedbacks: { ...prev.feedbacks, [answerId]: isLike },
        snackbar: {
          open: true,
          message: state.language === 'fr' ? 'Merci pour votre feedback!' : 'Thanks for your feedback!'
        }
      }));
    } catch (error) {
      showSnackbar(
        state.language === 'fr' 
          ? 'Erreur lors de l\'enregistrement du feedback'
          : 'Error saving feedback'
      );
    }
  };

  const handleSuggest = async () => {
    if (!user) {
      showSnackbar(
        state.language === 'fr'
          ? 'Veuillez vous connecter pour faire une suggestion'
          : 'Please log in to make a suggestion'
      );
      return;
    }

    const suggestion = prompt(
      state.language === 'fr'
        ? 'Entrez votre suggestion (question|réponse):'
        : 'Enter your suggestion (question|answer):'
    );

    if (suggestion) {
      const [question, answer] = suggestion.split('|').map(s => s.trim());
      
      if (!question || !answer) {
        showSnackbar(
          state.language === 'fr'
            ? 'Format invalide. Utilisez "question|réponse"'
            : 'Invalid format. Use "question|answer"'
        );
        return;
      }

      try {
        await chatbotAPI.suggestQuestion({
          question,
          answer,
          language: state.language
        });

        showSnackbar(
          state.language === 'fr'
            ? 'Suggestion envoyée avec succès!'
            : 'Suggestion submitted successfully!'
        );
      } catch (error) {
        showSnackbar(
          state.language === 'fr'
            ? 'Erreur lors de l\'envoi de la suggestion'
            : 'Error submitting suggestion'
        );
      }
    }
  };

  const loadConversation = (conversationId) => {
    const conversation = state.conversations.find(c => c.id === conversationId);
    if (conversation) {
      setState(prev => ({
        ...prev,
        activeConversation: conversationId,
        messages: conversation.messages
      }));
    }
  };

  const startNewConversation = () => {
    setState(prev => ({
      ...prev,
      activeConversation: null,
      messages: [{
        text: state.language === 'fr'
          ? 'Nouvelle conversation. Posez votre question!'
          : 'New conversation. Ask your question!',
        sender: 'bot',
        timestamp: new Date()
      }]
    }));
  };

  const showSnackbar = (message) => {
    setState(prev => ({
      ...prev,
      snackbar: { open: true, message }
    }));
  };

  const handleCloseSnackbar = () => {
    setState(prev => ({
      ...prev,
      snackbar: { ...prev.snackbar, open: false }
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box className="chatbot-container">
      {/* Sidebar */}
      <Box className={`sidebar ${state.showHistory ? 'open' : ''}`}>
        <Box className="sidebar-header">
          <Typography variant="h6">
            {state.language === 'fr' ? 'Conversations' : 'Conversations'}
          </Typography>
          <Button 
            variant="contained" 
            size="small"
            onClick={startNewConversation}
            startIcon={<AddIcon />}
          >
            {state.language === 'fr' ? 'Nouvelle' : 'New'}
          </Button>
        </Box>
        
        <List className="conversation-list">
          {state.conversations.map(conv => (
            <ListItem
              key={conv.id}
              button
              selected={state.activeConversation === conv.id}
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

      {/* Main Chat Area */}
      <Box className="main-content">
        <Box className="chat-header">
          <IconButton onClick={() => setState(prev => ({ ...prev, showHistory: !prev.showHistory }))}>
            <HistoryIcon />
          </IconButton>
          
          <Typography variant="h5" className="title">
            ISET Virtual Assistant
          </Typography>
          
          <Box className="header-actions">
            {user ? (
              <>
                <Tooltip title={state.language === 'fr' ? 'Suggérer' : 'Suggest'}>
                  <IconButton onClick={handleSuggest}>
                    <AddIcon />
                  </IconButton>
                </Tooltip>
                <IconButton onClick={logout}>
                  <LogoutIcon />
                </IconButton>
              </>
            ) : (
              <>
                <IconButton onClick={() => navigate('/login')}>
                  <LoginIcon />
                </IconButton>
                <IconButton onClick={() => navigate('/register')}>
                  <PersonAddIcon />
                </IconButton>
              </>
            )}
            
            <Select
              value={state.language}
              onChange={(e) => setState(prev => ({ ...prev, language: e.target.value }))}
              size="small"
            >
              <MenuItem value="fr">Français</MenuItem>
              <MenuItem value="en">English</MenuItem>
            </Select>
          </Box>
        </Box>

        {/* Messages */}
        <Box className="messages-container">
          {state.messages.map((msg, index) => (
            <Box 
              key={index} 
              className={`message ${msg.sender}`}
            >
              <Avatar className="avatar">
                {msg.sender === 'bot' ? 'ISET' : 'You'}
              </Avatar>
              
              <Box className="message-content">
                <Typography variant="body1">{msg.text}</Typography>
                
                {msg.url && (
                  <Button 
                    href={msg.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    size="small"
                  >
                    {state.language === 'fr' ? 'En savoir plus' : 'Learn more'}
                  </Button>
                )}
                
                {msg.sender === 'bot' && msg.answerId && (
                  <Box className="message-actions">
                    <Tooltip title={state.language === 'fr' ? 'Copier' : 'Copy'}>
                      <IconButton 
                        size="small" 
                        onClick={() => navigator.clipboard.writeText(msg.text)}
                      >
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title={state.language === 'fr' ? 'Utile' : 'Helpful'}>
                      <IconButton
                        size="small"
                        color={state.feedbacks[msg.answerId] === true ? 'primary' : 'default'}
                        onClick={() => handleFeedback(msg.answerId, true, msg.question)}
                      >
                        <LikeIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title={state.language === 'fr' ? 'Inutile' : 'Not helpful'}>
                      <IconButton
                        size="small"
                        color={state.feedbacks[msg.answerId] === false ? 'error' : 'default'}
                        onClick={() => handleFeedback(msg.answerId, false, msg.question)}
                      >
                        <DislikeIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
                
                <Typography variant="caption" className="timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          ))}
          
          {state.loading && (
            <Box className="message bot">
              <Avatar className="avatar">ISET</Avatar>
              <Box className="message-content">
                <CircularProgress size={24} />
              </Box>
            </Box>
          )}
        </Box>

        {/* Input Area */}
        <Box className="input-area">
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={state.input}
            onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
            onKeyPress={handleKeyPress}
            placeholder={
              state.language === 'fr'
                ? 'Posez votre question...'
                : 'Ask your question...'
            }
            disabled={!user || state.loading}
          />
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleSend}
            disabled={!state.input.trim() || !user || state.loading}
            className="send-button"
          >
            <SendIcon />
          </Button>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={state.snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={state.snackbar.message}
      />
    </Box>
  );
};

export default ChatbotISET;