import { useState, useEffect, useCallback } from 'react';

const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [currentUser] = useState({
    id: 'user1',
    name: 'You',
    avatar: 'https://i.pravatar.cc/150?img=1',
  });
  
  const [contacts] = useState([
    {
      id: 'user2',
      name: 'John Doe',
      avatar: 'https://i.pravatar.cc/150?img=5',
      online: true,
      lastSeen: 'recently'
    },
    {
      id: 'user3',
      name: 'Jane Smith',
      avatar: 'https://i.pravatar.cc/150?img=6',
      online: false,
      lastSeen: '2 hours ago'
    },
    {
      id: 'user4',
      name: 'Mike Johnson',
      avatar: 'https://i.pravatar.cc/150?img=7',
      online: true,
      lastSeen: 'recently'
    }
  ]);

  const [activeContact, setActiveContact] = useState(contacts[0]);

  useEffect(() => {
    // Simulate initial messages
    const initialMessages = [
      {
        id: '1',
        text: 'Hello there!',
        sender: 'user2',
        receiver: 'user1',
        timestamp: new Date(Date.now() - 3600000),
        avatar: 'https://i.pravatar.cc/150?img=5'
      },
      {
        id: '2',
        text: 'Hi! How are you?',
        sender: 'user1',
        receiver: 'user2',
        timestamp: new Date(Date.now() - 3000000),
        avatar: 'https://i.pravatar.cc/150?img=1'
      },
      {
        id: '3',
        text: 'I\'m good, thanks for asking. What about you?',
        sender: 'user2',
        receiver: 'user1',
        timestamp: new Date(Date.now() - 2400000),
        avatar: 'https://i.pravatar.cc/150?img=5'
      }
    ];
    setMessages(initialMessages);
  }, []);

  const sendMessage = useCallback((text) => {
    const newMessage = {
      id: Date.now().toString(),
      text,
      sender: currentUser.id,
      receiver: activeContact.id,
      timestamp: new Date(),
      avatar: currentUser.avatar
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Simulate reply after 1-3 seconds
    if (Math.random() > 0.3) {
      const delay = 1000 + Math.random() * 2000;
      setTimeout(() => {
        const replyMessage = {
          id: Date.now().toString(),
          text: getRandomReply(),
          sender: activeContact.id,
          receiver: currentUser.id,
          timestamp: new Date(),
          avatar: activeContact.avatar
        };
        setMessages(prev => [...prev, replyMessage]);
      }, delay);
    }
  }, [activeContact, currentUser]);

  const getRandomReply = () => {
    const replies = [
      'That sounds great!',
      'Interesting, tell me more.',
      'I see what you mean.',
      'Let me think about that.',
      'Thanks for letting me know!',
      'What time works for you?',
      'Can we discuss this later?',
      'I appreciate your message!'
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  };

  return {
    messages,
    sendMessage,
    currentUser,
    contacts,
    activeContact,
    setActiveContact
  };
};

export default useChat;