import React from 'react';

type ChatMessageProps = {
  message: {
    id: number;
    sender_id: number;
    content: string;
    created_at: string;
  };
  isOwn: boolean;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwn }) => {
  return (
    <div className={`chat-message${isOwn ? ' own' : ''}`}>
      <div className="message-content">{message.content}</div>
      <div className="message-meta">
        <span>{new Date(message.created_at).toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

export default ChatMessage; 