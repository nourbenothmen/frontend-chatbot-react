import React from 'react';
import { Box, Avatar, Typography } from '@mui/material';

export default function ChatMessage({ message, language }) {
  return (
    <Box sx={{ 
      display: 'flex',
      justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
      mb: 2
    }}>
      {message.sender === 'bot' && (
        <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>ISET</Avatar>
      )}
      <Box sx={{
        bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.100',
        color: message.sender === 'user' ? 'white' : 'text.primary',
        p: 2,
        borderRadius: 2,
        maxWidth: '70%'
      }}>
        <Typography>
          {language === 'fr' ? message.answer_fr : message.answer_en}
        </Typography>
        {message.url && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            <a 
              href={message.url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: message.sender === 'user' ? 'white' : 'primary.main',
                textDecoration: 'underline' 
              }}
            >
              {language === 'fr' ? 'En savoir plus' : 'Learn more'}
            </a>
          </Typography>
        )}
      </Box>
    </Box>
  );
}