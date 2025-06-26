import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
// Import ReactMarkdown
import ReactMarkdown from 'react-markdown';

const AIChatbot = ({ showComingSoonToast }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI assistant. How can I help you with your studies today?", sender: 'ai' },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    const newUserMessage = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');

    const thinkingMessage = { id: Date.now() + 0.5, text: "Thinking...", sender: 'ai' };
    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const chatHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));
      chatHistory.push({ role: 'user', parts: [{ text: newUserMessage.text }] });

      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`; // Ensure this is gemini-1.0-pro or gemini-2.0-flash as per your preference

      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: chatHistory,
        }),
      };

      const response = await fetch(API_URL, requestOptions);
      const data = await response.json();

      let aiResponseMessageText = "I'm sorry, I couldn't process that. Please try again.";
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
        aiResponseMessageText = data.candidates[0].content.parts[0].text;
      } else if (data.error) {
          aiResponseMessageText = `Error: ${data.error.message}`;
      }

      setMessages(prev =>
        prev.filter(msg => msg.id !== thinkingMessage.id)
            .concat({ id: Date.now() + 1, text: aiResponseMessageText, sender: 'ai' })
      );

    } catch (error) {
      console.error("Error communicating with AI:", error);
      setMessages(prev =>
        prev.filter(msg => msg.id !== thinkingMessage.id)
            .concat({ id: Date.now() + 1, text: "Oops! Something went wrong. Please try again.", sender: 'ai' })
      );
    }
  };

  return (
    <div className="flex flex-col h-[400px] bg-gray-50 rounded-lg">
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`chat-bubble ${message.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                {/* *** CHANGE THIS LINE *** */}
                <ReactMarkdown>{message.text}</ReactMarkdown>
                {/* *********************** */}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center space-x-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1"
        />
        <Button type="submit" size="icon" className="yellow-gradient text-white">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default AIChatbot;