import { Box } from '@mui/material';
import Sidebar from '../Layout/Layout';
import ChatWindow from './ChatWindow';
import useChat from '../../hooks/useChat';

const ChatApp = () => {
  const {
    messages,
    sendMessage,
    currentUser,
    contacts,
    activeContact,
    setActiveContact,
  } = useChat();
  
  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Sidebar 
        contacts={contacts} 
        activeContact={activeContact} 
        onContactSelect={setActiveContact} 
        currentUser={currentUser}
      />
      <ChatWindow 
        messages={messages.filter(m => 
          (m.sender === currentUser.id && m.receiver === activeContact?.id) || 
          (m.sender === activeContact?.id && m.receiver === currentUser.id)
        )} 
        onSendMessage={sendMessage} 
        activeContact={activeContact}
        currentUser={currentUser}
      />
    </Box>
  );
};

export default ChatApp;