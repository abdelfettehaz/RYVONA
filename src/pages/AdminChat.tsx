import React, { useEffect, useRef, useState } from 'react';
import { listConversations, listMessages, sendMessage, markRead, getAdminStatus, setAdminStatus, uploadChatImage } from '../services/api';
import ChatUserList from '../components/ChatUserList';
import ChatInput from '../components/ChatInput';
import StatusIndicator from '../components/StatusIndicator';
import TypingIndicator from '../components/TypingIndicator';
import ImageUpload from '../components/ImageUpload';
import ChatImage from '../components/ChatImage';

const AdminChat: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'online' | 'offline'>('offline');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const intervalRef = useRef<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedIdRef = useRef<number | null>(null);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    async function fetchMessages() {
      if (!selectedId) return;
      setLoading(true);
      setInput('');
      try {
        const msgRes = await listMessages(selectedId);
        setMessages(msgRes.messages);
        await markRead(selectedId);
      } catch (e) {
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    }
    if (selectedId) fetchMessages();
  }, [selectedId]);

  useEffect(() => {
    async function poll() {
      try {
        const convRes = await listConversations();
        if (convRes.conversations && Array.isArray(convRes.conversations)) {
          setConversations(convRes.conversations);
          if (convRes.conversations.length === 0) {
            setSelectedId(null);
            setMessages([]);
            return;
          }
        }
        
        const id = selectedIdRef.current;
        if (!id) return;
        
        const msgRes = await listMessages(id);
        if (msgRes.messages && Array.isArray(msgRes.messages)) {
          setMessages(msgRes.messages);
        }
        
        await markRead(id);
        const statusRes = await getAdminStatus();
        setStatus(statusRes.status || 'offline');
        setIsTyping(Math.random() < 0.2);
      } catch (e) {
        console.error('Chat polling error:', e);
      }
    }
    intervalRef.current = setInterval(poll, 10000);
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      setError(null);
      try {
        console.log('Initializing admin chat...');
        const convRes = await listConversations();
        console.log('Conversations response:', convRes);
        
        if (convRes.conversations && Array.isArray(convRes.conversations)) {
          setConversations(convRes.conversations);
          if (convRes.conversations.length > 0) {
            setSelectedId(convRes.conversations[0].conversation_id);
          } else {
            setSelectedId(null);
          }
        } else {
          console.error('Invalid conversations response:', convRes);
          setError('Invalid response from server');
          setConversations([]);
          setSelectedId(null);
        }
        
        const statusRes = await getAdminStatus();
        console.log('Admin status response:', statusRes);
        setStatus(statusRes.status || 'offline');
        
      } catch (e: any) {
        console.error('Admin chat initialization error:', e);
        setError(`Failed to load conversations: ${e.message || 'Unknown error'}`);
        setConversations([]);
        setSelectedId(null);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !selectedId) return;
    await sendMessage(selectedId, input);
    setInput('');
    const msgRes = await listMessages(selectedId);
    setMessages(msgRes.messages);
    await markRead(selectedId);
  };

  const handleImageUpload = async (file: File) => {
    if (!selectedId) return;
    
    setUploadingImage(true);
    try {
      console.log('Uploading image:', file.name);
      const uploadRes = await uploadChatImage(file);
      console.log('Upload response:', uploadRes);
      
      // Send message with image
      await sendMessage(selectedId, '', uploadRes.data.image_url);
      
      const msgRes = await listMessages(selectedId);
      setMessages(msgRes.messages || []);
      await markRead(selectedId);
    } catch (e: any) {
      console.error('Image upload error:', e);
      setError(`Failed to upload image: ${e.message || 'Unknown error'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleStatusToggle = async () => {
    const newStatus = status === 'online' ? 'offline' : 'online';
    await setAdminStatus(newStatus);
    setStatus(newStatus);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Loading admin chat...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-lg font-semibold">Admin Chat Error</p>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    </div>
  );

  const selectedConv = conversations.find(c => c.conversation_id === selectedId);
  const adminId = 3; // Always admin id 3

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      {/* Mobile header */}
      <div className="lg:hidden bg-white/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-white/30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-white/70 shadow-sm border border-white/30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white">A</div>
          <div>
            <div className="font-semibold text-sm">Admin</div>
            <StatusIndicator status={status} />
          </div>
        </div>
        <button 
          onClick={handleStatusToggle}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${status === 'online' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
        >
          {status === 'online' ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      <div className="w-full max-w-7xl mx-auto h-[calc(100vh-4rem)] lg:h-screen flex rounded-none lg:rounded-3xl shadow-lg lg:shadow-2xl bg-white/70 backdrop-blur-lg border border-white/40 overflow-hidden relative">
        {/* Sidebar */}
        <aside className={`absolute lg:relative z-20 w-72 lg:w-80 bg-white/95 lg:bg-white/80 border-r flex flex-col backdrop-blur-md transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 h-full`}>
          <header className="hidden lg:flex items-center gap-3 px-6 py-6 border-b border-white/30">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white">A</div>
            <div>
              <div className="font-semibold text-lg tracking-wide">Admin</div>
              <StatusIndicator status={status} />
            </div>
          </header>
          <div className="px-4 lg:px-6 py-3">
            <input 
              className="w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring bg-white/70" 
              placeholder="Search users..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2">
            <ChatUserList
              conversations={conversations}
              selectedId={selectedId}
              onSelect={(id) => {
                setSelectedId(id);
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              searchValue={search}
            />
          </div>
          <div className="hidden lg:block px-6 py-4 border-t border-white/30">
            <button className="w-full py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition shadow" onClick={handleStatusToggle}>
              {status === 'online' ? 'Go Offline' : 'Go Online'}
            </button>
          </div>
        </aside>

        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main chat area */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 flex items-center gap-3 px-4 lg:px-8 py-4 lg:py-6 bg-white/60 backdrop-blur-md border-b border-white/30 shadow-sm">
            {!selectedConv && (
              <div className="flex-1 text-center text-gray-500">
                Select a conversation to start chatting
              </div>
            )}
            {selectedConv && (
              <>
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg lg:text-xl">
                  {selectedConv ? (selectedConv.name?.charAt(0) || selectedConv.email?.charAt(0) || 'U') : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base lg:text-lg tracking-wide truncate">
                    {selectedConv ? selectedConv.name || selectedConv.email : 'No user selected'}
                  </div>
                  <div className="text-xs lg:text-sm text-gray-500">
                    {selectedConv && (selectedConv.name ? selectedConv.email : 'User')}
                  </div>
                </div>
              </>
            )}
          </header>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 lg:py-8 bg-gradient-to-b from-white/60 to-white/30">
            <div className="max-w-2xl mx-auto flex flex-col gap-3 lg:gap-4">
              {messages.length === 0 && selectedConv && (
                <div className="text-center py-8 text-gray-500">
                  No messages yet. Start the conversation!
                </div>
              )}
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender_id === adminId ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end gap-2 ${msg.sender_id === adminId ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center font-bold text-sm lg:text-base shadow ${msg.sender_id === adminId ? 'bg-blue-400 text-white' : 'bg-purple-200 text-purple-700'}`}>
                      {msg.sender_id === adminId ? 'A' : (selectedConv ? (selectedConv.name?.charAt(0) || selectedConv.email?.charAt(0) || 'U') : 'U')}
                    </div>
                    {/* Bubble */}
                    <div className={`rounded-2xl px-4 py-2 lg:px-5 lg:py-3 shadow-lg text-sm lg:text-base max-w-xs break-words ${msg.sender_id === adminId ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white' : 'bg-white/80 text-gray-800 border border-gray-200'}`}>
                      {msg.content && <div className="mb-1 lg:mb-2">{msg.content}</div>}
                      {msg.image_url && (
                        <ChatImage 
                          src={msg.image_url} 
                          alt="Chat image"
                          className={msg.content ? 'mt-2' : ''}
                        />
                      )}
                      <div className="text-xs text-gray-400 mt-1 lg:mt-2 text-right">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="pl-10 lg:pl-12"><TypingIndicator isTyping={isTyping} /></div>
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Input */}
          {selectedConv && (
            <footer className="bg-white/80 px-4 lg:px-8 py-4 lg:py-6 border-t border-white/30">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-2 lg:gap-3">
                  <ImageUpload 
                    onImageSelect={handleImageUpload} 
                    disabled={uploadingImage || !selectedId}
                  />
                  <div className="flex-1">
                    <ChatInput 
                      value={input} 
                      onChange={setInput} 
                      onSend={handleSend}
                      disabled={!selectedId || uploadingImage}
                    />
                  </div>
                </div>
                {uploadingImage && (
                  <div className="mt-2 text-center">
                    <div className="spinner inline-block mr-2"></div>
                    <span className="text-sm text-gray-600">Uploading image...</span>
                  </div>
                )}
              </div>
            </footer>
          )}
        </main>
        
        {/* Glassmorphism floating effect */}
        <div className="absolute inset-0 pointer-events-none rounded-none lg:rounded-3xl border-2 border-white/30" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)'}} />
      </div>
    </div>
  );
};

export default AdminChat;
