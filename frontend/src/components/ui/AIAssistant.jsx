import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import axios from 'axios';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const panelRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      gsap.to(panelRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "back.out(1.7)"
      });
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateAIResponse = async (userMessage) => {
    try {
      const response = await axios.post('/api/chat', {
        message: userMessage
      }, {
        withCredentials: true
      });

      let aiFullText = response.data?.output || "I'm sorry, I couldn't process that.";
      let aiText = aiFullText;
      let dynamicSuggestions = [];

      const suggestionsMatch = aiFullText.match(/\[SUGGESTIONS:\s*(.*?)\]/i);
      if (suggestionsMatch) {
        aiText = aiFullText.replace(suggestionsMatch[0], '').trim();
        dynamicSuggestions = suggestionsMatch[1].split(',').map(s => s.trim()).filter(s => s);
      }

      return {
        text: aiText,
        suggestions: dynamicSuggestions
      };
    } catch (error) {
      console.error('Chat Error:', error);
      return {
        text: "I'm having trouble connecting to my central brain right now. Please try again in a moment.",
        suggestions: ["Try again"]
      };
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessageText = inputValue;
    const newUserMessage = {
      id: Date.now(),
      text: userMessageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const aiResponseData = await generateAIResponse(userMessageText);
      const aiResponse = {
        id: Date.now() + 1,
        ...aiResponseData,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    setTimeout(() => {
      const form = document.querySelector('#ai-chat-form');
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 100);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 bg-linear-to-br from-[#667eea] to-[#764ba2] hover:opacity-90 text-white p-4 rounded-2xl shadow-2xl transition-all hover:scale-105 ${isOpen ? 'hidden' : 'flex'} items-center gap-2`}
      >
        <Sparkles size={24} />
        <span className="font-bold hidden md:inline">Ask AI</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div
            ref={panelRef}
            className="w-full max-w-md bg-white rounded-[20px] shadow-2xl flex flex-col h-[600px] max-h-[90vh] opacity-0 scale-95 overflow-hidden"
          >
            {/* Chat Header */}
            <div className="bg-linear-to-br from-[#667eea] to-[#764ba2] p-5 text-white text-center shadow-lg relative">
              <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                🏠 Roomora AI Assistant
              </h3>
              <p className="text-xs opacity-90 mt-1">Ask me anything about finding rooms and rentals</p>
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#f8f9fa] scroll-smooth">
              <div className="text-center py-4 text-gray-500 text-sm leading-relaxed">
                👋 Welcome! I'm here to help you with Roomora.<br />
                Ask me about searching for rooms, posting listings, or any questions you have!
              </div>

              {messages.map((msg) => (
                <div key={msg.id} className="space-y-3">
                  <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'user' ? (
                      <div className="bg-linear-to-br from-[#667eea] to-[#764ba2] text-white rounded-[18px] rounded-br-[4px] px-4 py-3 max-w-[75%] shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    ) : (
                      <div className="bg-white text-gray-800 rounded-[18px] rounded-bl-[4px] px-4 py-3 max-w-[75%] shadow-md border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    )}
                  </div>

                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-start ml-2">
                      {msg.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-[#667eea] rounded-full text-xs font-medium transition-all shadow-sm active:scale-95"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-[18px] rounded-bl-[4px] px-4 py-3 shadow-md border border-gray-100 flex gap-1 items-center">
                    <span className="w-2 h-2 bg-[#667eea] rounded-full animate-bounce [animation-delay:-0.32s]"></span>
                    <span className="w-2 h-2 bg-[#667eea] rounded-full animate-bounce [animation-delay:-0.16s]"></span>
                    <span className="w-2 h-2 bg-[#667eea] rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <form id="ai-chat-form" onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 bg-white border-2 border-gray-100 focus:border-[#667eea] rounded-full px-4 py-2.5 outline-none text-sm transition-all text-gray-800"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-linear-to-br from-[#667eea] to-[#764ba2] hover:opacity-90 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
