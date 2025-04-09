import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import realtimeService, { EventTopic, EventType } from '@/services/realtimeService';
import ChatMessage from '../Chat/ChatMessage';

interface ChatProps {
  isVisible: boolean;
}

interface Message {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
}

interface ChatMessageEvent {
  type: string;
  data: {
    playerId: string;
    playerName: string;
    message: string;
    timestamp: string;
  };
  timestamp: string;
}

const Chat: React.FC<ChatProps> = ({ isVisible }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isVisible) {
      scrollToBottom();
    }
  }, [messages, isVisible]);

  // Subscribe to chat messages
  useEffect(() => {
    // Subscribe to chat messages
    realtimeService.subscribe(
      EventTopic.CHAT,
      undefined,
      EventType.CHAT_MESSAGE,
      (data) => {
        console.log('Received chat message:', data);
        
        // The data is the second element of the array
        const eventData = Array.isArray(data) ? data[1] : data;
        
        // Extract the actual message data
        const messageData = eventData.data;
        
        const newMsg: Message = {
          id: crypto.randomUUID(),
          playerId: messageData.playerId,
          playerName: messageData.playerName,
          message: messageData.message,
          timestamp: new Date(messageData.timestamp)
        };
        
        console.log('Created new message:', newMsg);
        setMessages(prev => [...prev, newMsg]);
      }
    );
    
    // Cleanup subscription on unmount
    return () => {
      realtimeService.unsubscribe(EventTopic.CHAT, undefined, EventType.CHAT_MESSAGE);
    };
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !realtimeService.isConnected()) return;

    const messageData = {
      topic: EventTopic.CHAT,
      event: {
        type: EventType.CHAT_MESSAGE,
        data: {
          playerId: user.id,
          playerName: user.username,
          message: newMessage.trim(),
          timestamp: new Date().toISOString()
        }
      }
    };

    console.log('Sending message:', messageData);
    if (realtimeService.isConnected()) {
      realtimeService['socket']?.emit('publish', messageData);
      setNewMessage('');
    }
  };

  // Debug render
  console.log('Current messages:', messages);

  if (!isVisible) return null;

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{
        backgroundImage: `url('/assets/parchment-bg.png')`,
        backgroundSize: 'cover',
        imageRendering: 'pixelated'
      }}>
        {/* Border overlay */}
        <div className="absolute inset-2 border-4 border-[#8b7355] rounded-lg"></div>
      </div>
      
      {/* Content */}
      <div className="relative flex flex-col h-full z-10 p-4">
        {/* Header */}
        <div className="mb-4">
          <h2 className="font-pixel text-[#4a3728] text-lg">Global Chat</h2>
        </div>
        
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto min-h-0 mb-4">
          <div className="space-y-2">
            {messages.map(message => (
              <ChatMessage
                key={message.id}
                message={message}
                isOwnMessage={message.playerId === user?.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message input form - fixed at bottom */}
        <div className="mt-auto">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              maxLength={200}
              placeholder="Type a message..."
              className="flex-1 min-w-0 h-10 px-3 bg-[#d4c3a3]/80 border-2 border-[#8b7355] focus:border-[#6d5942] outline-none rounded font-pixel text-[#4a3728] placeholder-[#8b7355]/50"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !realtimeService.isConnected()}
              className="h-10 px-4 bg-[#8b7355] hover:bg-[#6d5942] text-[#e6d5b8] rounded font-pixel disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Send
            </button>
          </form>

          {/* Connection status */}
          {!realtimeService.isConnected() && (
            <div className="text-xs text-red-800 mt-2 text-center font-pixel">
              Not connected to chat server
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat; 