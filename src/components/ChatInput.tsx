import React from 'react';

type ChatInputProps = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend, disabled }) => {
  return (
    <div className="chat-input-row">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        onKeyDown={e => { if (e.key === 'Enter') onSend(); }}
        placeholder="Type a message..."
      />
      <button onClick={onSend} disabled={disabled || !value.trim()}>Send</button>
    </div>
  );
};

export default ChatInput;