import { useState, useEffect, useRef } from 'react';
import socket from '../services/socket.js';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ChatBox({ groupId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  // Load existing messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/${groupId}`);
        setMessages(res.data.messages);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [groupId]);

  // Socket.IO setup
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
      socket.emit('user:online', user._id);
    }

    socket.emit('group:join', groupId);

    socket.on('message:receive', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('typing:update', ({ userName, isTyping }) => {
      setTyping(isTyping ? `${userName} is typing...` : '');
    });

    return () => {
      socket.emit('group:leave', groupId);
      socket.off('message:receive');
      socket.off('typing:update');
    };
  }, [groupId]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit('message:send', {
      groupId,
      senderId: user._id,
      senderName: user.name,
      content: input.trim(),
    });
    setInput('');
    socket.emit('typing:stop', { groupId, userName: user.name });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    socket.emit('typing:start', { groupId, userName: user.name });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('typing:stop', { groupId, userName: user.name });
    }, 1500);
  };

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="card flex flex-col h-[600px]">
      <h2 className="font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">
        💬 Group Chat
      </h2>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {loading && <p className="text-center text-gray-400 text-sm">Loading messages...</p>}
        {!loading && messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm">No messages yet. Say hello!</p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender?._id === user._id || msg.sender === user._id;
          return (
            <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : ''}`}>
                {!isOwn && (
                  <p className="text-xs text-gray-500 mb-1 ml-1">{msg.sender?.name}</p>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl text-sm ${
                    isOwn
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
                <p className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : ''}`}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      {typing && <p className="text-xs text-gray-400 italic mt-1">{typing}</p>}

      {/* Input */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
        <input
          type="text"
          value={input}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="input-field flex-1"
        />
        <button onClick={sendMessage} disabled={!input.trim()} className="btn-primary px-5">
          Send
        </button>
      </div>
    </div>
  );
}
