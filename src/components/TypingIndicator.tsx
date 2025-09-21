import React from 'react';

type TypingIndicatorProps = {
  isTyping: boolean;
  size?: 'sm' | 'md' | 'lg';
};

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isTyping }) => (
  <div className="typing-indicator">{isTyping ? '' : null}</div>
);

export default TypingIndicator;