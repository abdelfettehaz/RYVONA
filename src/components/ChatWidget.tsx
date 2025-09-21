// ChatWidget.tsx
// React chat widget for RYVONA, connects to backend/chatbot.php (PHP API)
// Appears on all pages when imported in App.tsx
import React, { useState, useRef, useEffect } from 'react';


// WARNING: Never expose your real API key in production!
const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'deepseek/deepseek-chat-v3.1:free';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

// Simple greeting as the first message
const welcomeMsg = `Hi! 👋 How can I help you today?`;

// Helper to remove <think>...</think> blocks
function removeThinkBlocks(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [welcomeShown, setWelcomeShown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !welcomeShown) {
      setMessages([{ sender: 'bot', text: welcomeMsg }]);
      setWelcomeShown(true);
    }
  }, [open, welcomeShown]);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'user' as const, text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);
    try {
      // Gather page context: title, URL, and visible text
      const pageTitle = document.title;
      const pageUrl = window.location.pathname;
      const pageText = document.body.innerText?.slice(0, 2000) || '';
      const systemPrompt =
        `You are a professional AI assistant for the RYVONA website, a Tunisian AI-powered design studio. ` +`Youre main language is Tunisian
        dialect but when someone ask you in english or french just use the language the he speaks. ` +`If someone ask you and said aswam or 
        aswem it means the price. ` +`If someone ask you about the price give him the price from page Pricing.tsx. ` +
        `don't use html code. `+`Be very polite .`+`If someone ask you how i make design using mobile phone 
        just say you can only use the ai to generate images but using the phone 
        for resizing and adapt the image or text it is not found yet
        maybe in the future we're gonna add it`+
        `You have access to the following page context: Title: "${pageTitle}", URL: "${pageUrl}", and the following visible text content: "${pageText}". ` +
        `Use this information to understand what this page is about and provide highly relevant, page-aware, and helpful answers. ` +
        `If the user asks about this page, its features, or how to use it, answer with expertise and clarity. Always be concise, friendly, and professional. ` +
        `If the user asks about generating images with AI, give these step-by-step instructions: 1) Go to the Design Studio page. 2) Scroll down to find the 'Generate with AI' section. 3) Click on it. 4) In the prompt form, describe what you want to generate. 5) You can adjust the visualization and quality settings. 6) Click to generate and the page will create the image based on your prompt and settings.`;
      const res = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'RYVONA',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMsg.text }
          ]
        })
      });
      const data = await res.json();
      if (res.ok && data.choices && data.choices[0]?.message?.content) {
        const cleanText = removeThinkBlocks(data.choices[0].message.content);
        setMessages((msgs) => [...msgs, { sender: 'bot', text: cleanText }]);
      } else {
        setError(data.error?.message || 'No reply from bot.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, fontFamily: 'inherit' }}>
      {open ? (
        <div style={{ width: 340, maxWidth: '95vw', background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#7c3aed', color: '#fff', padding: 14, fontWeight: 600, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
            <span>Ask RYVONA AI</span>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', marginLeft: 8 }}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
          <div style={{ flex: 1, padding: 14, overflowY: 'auto', background: '#f9fafb', minHeight: 120, maxHeight: 350 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                marginBottom: 10,
                padding: '10px 14px',
                borderRadius: 8,
                maxWidth: '80%',
                wordBreak: 'break-word',
                background: msg.sender === 'user' ? '#ede9fe' : '#fff',
                color: msg.sender === 'user' ? '#5b21b6' : '#222',
                marginLeft: msg.sender === 'user' ? 'auto' : undefined,
                marginRight: msg.sender === 'bot' ? 'auto' : undefined,
                border: msg.sender === 'bot' ? '1px solid #e5e7eb' : undefined
              }}>
                {msg.text.split('\n').map((line, idx) => <div key={idx}>{line}</div>)}
              </div>
            ))}
            {loading && (
              <div style={{ marginBottom: 10, padding: '10px 14px', borderRadius: 8, maxWidth: '80%', background: '#fff', color: '#7c3aed', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>RYVONA is typing</span>
                <span style={{ width: 7, height: 7, background: '#a78bfa', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1s infinite alternate' }}></span>
                <span style={{ width: 7, height: 7, background: '#a78bfa', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1s infinite alternate', animationDelay: '0.2s' }}></span>
                <span style={{ width: 7, height: 7, background: '#a78bfa', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1s infinite alternate', animationDelay: '0.4s' }}></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {error && <div style={{ color: '#dc2626', fontSize: 13, padding: '0 14px 6px' }}>{error}</div>}
          <div style={{ display: 'flex', borderTop: '1px solid #e5e7eb', background: '#fff' }}>
            <input
              type="text"
              style={{ flex: 1, border: 'none', padding: 12, fontSize: 16, outline: 'none', background: '#fff', borderRadius: 0 }}
              placeholder="Type your question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '0 18px', fontSize: 16, cursor: 'pointer' }}
              disabled={loading || !input.trim()}
            >
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          style={{ background: '#7c3aed', color: '#fff', borderRadius: '50%', width: 56, height: 56, fontSize: 32, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
          aria-label="Open chat"
        >
          💬
        </button>
      )}
      {/* Keyframes for bounce animation */}
      <style>{`
        @keyframes bounce { to { transform: translateY(-6px); } }
      `}</style>
    </div>
  );
};

export default ChatWidget; 