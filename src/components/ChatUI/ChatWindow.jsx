// Fichier: src/context/ChatContext.jsx
import React, { createContext } from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const testValue = { messages: [{text: "Test", sender: "bot"}] };

  return (
    <ChatContext.Provider value={testValue}>
      {children}
    </ChatContext.Provider>
  );
};