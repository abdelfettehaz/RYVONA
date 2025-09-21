import React from 'react';

type Conversation = {
  conversation_id: number;
  user_id: number;
  email: string;
  name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
};

type ChatUserListProps = {
  conversations: Conversation[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  searchValue: string;
};

const ChatUserList: React.FC<ChatUserListProps> = ({ conversations, selectedId, onSelect, searchValue }) => {
  // Only show unique users (latest conversation per user)
  const userMap = new Map<number, Conversation>();
  conversations.forEach(c => {
    if (!userMap.has(c.user_id)) {
      userMap.set(c.user_id, c);
    } else {
      // If multiple, keep the one with latest last_message_time
      const existing = userMap.get(c.user_id)!;
      if (new Date(c.last_message_time) > new Date(existing.last_message_time)) {
        userMap.set(c.user_id, c);
      }
    }
  });
  const users = Array.from(userMap.values())
    .filter(c => c.name.toLowerCase().includes(searchValue.toLowerCase()) || c.email.toLowerCase().includes(searchValue.toLowerCase()))
    .sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime());

  return (
    <div>
      {users.length === 0 && <div className="text-gray-400 text-center py-8">No users found</div>}
      {users.map(c => (
        <div
          key={c.conversation_id}
          className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition rounded-lg mb-1 ${selectedId === c.conversation_id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
          onClick={() => onSelect(c.conversation_id)}
        >
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg">
            {c.name?.charAt(0) || c.email?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{c.name || c.email}</div>
            <div className="text-xs text-gray-500 truncate max-w-xs">{c.last_message}</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-xs text-gray-400">{new Date(c.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            {c.unread_count > 0 && <span className="inline-block min-w-[20px] px-2 py-0.5 rounded-full bg-blue-500 text-white text-xs text-center">{c.unread_count}</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatUserList; 