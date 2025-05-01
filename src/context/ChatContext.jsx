import React, { createContext, useState } from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages] = useState([]);
  const [isLoading] = useState(false);

  const sendMessage = async (message) => {
    // Implémentez la logique d'envoi ici
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage, isLoading }}>
      {children}
    </ChatContext.Provider>
  );
};