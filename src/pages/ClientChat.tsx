import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrCreateConversation, listMessages, sendMessage, markRead, getAdminStatus, uploadChatImage } from '../services/api';
import ChatInput from '../components/ChatInput';
import StatusIndicator from '../components/StatusIndicator';
import TypingIndicator from '../components/TypingIndicator';
import ImageUpload from '../components/ImageUpload';
import ChatImage from '../components/ChatImage';

const ClientChat: React.FC = () => {
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [adminStatus, setAdminStatus] = useState<'online' | 'offline'>('offline');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const intervalRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let convId: number | undefined;
    async function init() {
      setLoading(true);
      setError(null);
      try {
        console.log('Initializing chat...');
        const convRes = await getOrCreateConversation();
        console.log('Conversation response:', convRes);
        
        if (!convRes.conversation || !convRes.conversation.id) {
          console.error('No conversation found in response:', convRes);
          setError('Failed to create or load conversation');
          setLoading(false);
          return;
        }
        
        setConversation(convRes.conversation);
        convId = convRes.conversation.id;
        console.log('Conversation ID:', convId);
        
        if (convId) {
          const msgRes = await listMessages(convId);
          console.log('Messages response:', msgRes);
          setMessages(msgRes.messages || []);
          
          await markRead(convId);
        }
        console.log('Messages marked as read');
        
        const statusRes = await getAdminStatus();
        console.log('Admin status response:', statusRes);
        setAdminStatus(statusRes.status || 'offline');
        
      } catch (e: any) {
        console.error('Chat initialization error:', e);
        
        if (e.message?.includes('Authentication required') || e.message?.includes('AUTH_REQUIRED')) {
          setError('Please log in to access the chat');
          setTimeout(() => {
            navigate('/login', { state: { from: '/chat' } });
          }, 2000);
        } else {
          setError(`Failed to load chat: ${e.message || 'Unknown error'}`);
        }
      } finally {
        setLoading(false);
      }
    }
    init();
    
    intervalRef.current = setInterval(async () => {
      if (!convId && conversation) convId = conversation.id;
      if (!convId) return;
      
      try {
        const msgRes = await listMessages(convId);
        setMessages(msgRes.messages || []);
        await markRead(convId);
        const statusRes = await getAdminStatus();
        setAdminStatus(statusRes.status || 'offline');
        setIsTyping(Math.random() < 0.2);
      } catch (e) {
        console.error('Chat polling error:', e);
      }
    }, 10000);
    
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    
    return () => clearInterval(intervalRef.current);
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !conversation || !conversation.id) return;
    
    try {
      console.log('Sending message:', input);
      await sendMessage(conversation.id, input);
      setInput('');
      
      const msgRes = await listMessages(conversation.id);
      setMessages(msgRes.messages || []);
      await markRead(conversation.id);
    } catch (e: any) {
      console.error('Send message error:', e);
      setError(`Failed to send message: ${e.message || 'Unknown error'}`);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!conversation || !conversation.id) return;
    
    setUploadingImage(true);
    try {
      console.log('Uploading image:', file.name);
      const uploadRes = await uploadChatImage(file);
      console.log('Upload response:', uploadRes);
      
      await sendMessage(conversation.id, '', uploadRes.data.image_url);
      
      const msgRes = await listMessages(conversation.id);
      setMessages(msgRes.messages || []);
      await markRead(conversation.id);
    } catch (e: any) {
      console.error('Image upload error:', e);
      setError(`Failed to upload image: ${e.message || 'Unknown error'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
      <div className="text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Loading chat...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
      <div className="text-center max-w-md">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-lg font-semibold">Chat Error</p>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
          <button 
            onClick={() => navigate('/login', { state: { from: '/chat' } })} 
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );

  const userId = conversation?.user_id;
  const isSmallScreen = windowWidth < 640;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-2 sm:p-4">
      <div className="w-full h-full sm:max-w-lg sm:h-[80vh] flex flex-col rounded-xl sm:rounded-3xl shadow-lg sm:shadow-2xl bg-white/70 backdrop-blur-lg border border-white/40 overflow-hidden relative">
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white/60 backdrop-blur-md border-b border-white/30 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`${isSmallScreen ? 'w-8 h-8 text-lg' : 'w-12 h-12 text-xl'} rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg border-2 border-white`}>
              A
            </div>
            <div>
              <div className="font-semibold text-base sm:text-lg tracking-wide">Support</div>
              <StatusIndicator status={adminStatus} size={isSmallScreen ? 'sm' : 'md'} />
            </div>
          </div>
        </header>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 bg-gradient-to-b from-white/60 to-white/30">
          <div className="flex flex-col gap-3 sm:gap-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end gap-1 sm:gap-2 ${msg.sender_id === userId ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`${isSmallScreen ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-base'} rounded-full flex items-center justify-center font-bold shadow ${msg.sender_id === userId ? 'bg-blue-400 text-white' : 'bg-purple-200 text-purple-700'}`}>
                    {msg.sender_id === userId ? 'U' : 'A'}
                  </div>
                  {/* Bubble */}
                  <div className={`rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-3 shadow-lg text-sm sm:text-base max-w-[70%] sm:max-w-xs break-words ${msg.sender_id === userId ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white' : 'bg-white/80 text-gray-800 border border-gray-200'}`}>
                    {msg.content && <div className="mb-1 sm:mb-2">{msg.content}</div>}
                    {msg.image_url && (
                      <ChatImage 
                        src={msg.image_url} 
                        alt="Chat image"
                        className={msg.content ? 'mt-1 sm:mt-2' : ''}
                        size={isSmallScreen ? 'sm' : 'md'}
                      />
                    )}
                    <div className="text-xs text-gray-400 mt-1 sm:mt-2 text-right">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="pl-10 sm:pl-12"><TypingIndicator isTyping={isTyping} size={isSmallScreen ? 'sm' : 'md'} /></div>
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Input */}
        <footer className="bg-white/80 px-3 sm:px-6 py-3 sm:py-4 border-t border-white/30">
          <div className="flex items-center gap-2 sm:gap-3">
            <ImageUpload 
              onImageSelect={handleImageUpload} 
              disabled={uploadingImage || !conversation}
              size={isSmallScreen ? 'sm' : 'md'}
            />
            <div className="flex-1">
              <ChatInput 
                value={input} 
                onChange={setInput} 
                onSend={handleSend}
                disabled={uploadingImage}
                size={isSmallScreen ? 'sm' : 'md'}
              />
            </div>
          </div>
          {uploadingImage && (
            <div className="mt-2 text-center">
              <div className="spinner inline-block mr-2"></div>
              <span className="text-xs sm:text-sm text-gray-600">Uploading image...</span>
            </div>
          )}
        </footer>
        
        {/* Glassmorphism floating effect */}
        <div className="absolute inset-0 pointer-events-none rounded-xl sm:rounded-3xl border-2 border-white/30" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)'}} />
      </div>
    </div>
  );
};

export default ClientChat;