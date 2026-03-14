'use client';
import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { askQuestion } from '../services/api';

export default function ChatBox({ disabled, isProcessing, disabledPrompt }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [maxTokens, setMaxTokens] = useState(0); //0 acts as auto
  const scrollRef = useRef(null);

  //keep scroll pinned to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || disabled || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askQuestion(userMessage.content, maxTokens > 0 ? maxTokens : null);
      let aiText = response?.answer;
      if (!aiText) {
        aiText = 'Received a blank response (try increasing your Max Tokens slider!).';
      }
      setMessages((prev) => [
        ...prev, 
        { role: 'ai', content: aiText }
      ]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'ai', content: `Error: ${err.message || 'An error occurred fetching the response.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto h-[600px] border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden flex-1 relative">
      {/* chat operations */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-semibold text-gray-800">Chat</h3>
        {messages.length > 0 && (
          <button 
            onClick={clearChat}
            className="text-xs text-gray-500 hover:text-black transition-colors px-3 py-1.5 rounded-full hover:bg-gray-100"
          >
            Clear chat
          </button>
        )}
      </div>

      {/* message flow */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center bg-gray-50/10" ref={scrollRef}>
        {!disabled && messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Ask your first question about the video
          </div>
        )}
        {disabled && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-sm gap-2">
            {isProcessing && (
              <div className="flex gap-1.5 items-center justify-center h-4 mb-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
            {disabledPrompt || "Load a video first to start chatting"}
          </div>
        )}
        
        <div className="flex flex-col w-full">
          {messages.map((msg, i) => (
            <MessageBubble 
              key={i} 
              message={msg.content} 
              isUser={msg.role === 'user'} 
            />
          ))}
          
          {isLoading && (
            <div className="self-start px-5 py-4 mb-2 bg-gray-100 rounded-2xl rounded-tl-sm border border-gray-200">
              <div className="flex gap-1.5 items-center justify-center h-4">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* generic input space */}
      <div className="p-4 border-t border-gray-100 bg-white flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2">
          <label htmlFor="max-tokens" className="text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap w-40">
            Max Tokens: <span className="text-black font-bold">{maxTokens === 0 ? 'Auto' : maxTokens}</span>
          </label>
          <input
            id="max-tokens"
            type="range"
            min="0"
            max="5000"
            step="100"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
            disabled={disabled || isLoading}
            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black disabled:opacity-50"
          />
        </div>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={disabled || isLoading}
              placeholder={disabled ? (disabledPrompt || "Loading...") : "Ask anything about the video..."}
              className="w-full pl-5 pr-20 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all disabled:bg-gray-100 disabled:opacity-70 text-black placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={disabled || isLoading || !input.trim()}
              className="absolute right-2 px-4 py-1.5 bg-black text-white text-sm font-medium rounded-lg disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
            >
              Ask
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
