import React from 'react';
import { format } from 'date-fns';

interface ChatMessageProps {
  message: {
    id: string;
    playerId: string;
    playerName: string;
    message: string;
    timestamp: Date;
  };
  isOwnMessage: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwnMessage }) => {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-[80%] p-2 rounded-lg
        ${isOwnMessage 
          ? 'bg-[#8b7355]/20' 
          : 'bg-[#d4c3a3]/30'
        }
      `}>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-pixel text-xs text-[#4a3728]">
            {message.playerName}
          </span>
          <span className="font-pixel text-xs text-[#8b7355]">
            {format(new Date(message.timestamp), 'HH:mm')}
          </span>
        </div>
        <p className="font-pixel text-sm text-[#4a3728] break-words whitespace-pre-wrap">
          {message.message}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage; 