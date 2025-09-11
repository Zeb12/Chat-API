
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BotIcon } from './icons/BotIcon';
import { RefreshIcon } from './icons/RefreshIcon';

// Define message type
interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
}

// Pre-defined conversation flow
const conversationFlow: { [key: string]: { response: string; options?: string[] } } = {
  'initial': {
    response: "Hello! I'm a demo of what your AI chatbot could be. How can I help you today?",
    options: ['What can you do?', 'How does it work?', 'Can you be customized?', 'What about other languages?'],
  },
  'What can you do?': {
    response: "I can answer frequently asked questions, provide information about your business, and capture leads 24/7. What would you like to know more about?",
    options: ['Answering FAQs', 'Lead Capture', 'What if I can\'t answer?'],
  },
  'How does it work?': {
    response: "It's simple! You provide your business info and FAQs, and we generate a script you can add to your website. The chatbot then uses that knowledge to answer customer questions.",
    options: ['What can you do?', 'Can you be customized?', 'Tell me a joke'],
  },
  'Tell me a joke': {
    response: "Why don't scientists trust atoms? Because they make up everything!",
    options: ['What can you do?', 'How does it work?'],
  },
  'Answering FAQs': {
    response: 'I can instantly answer questions like "What are your business hours?" or "What is your return policy?", freeing up your support team.',
    options: ['Lead Capture', 'How does it work?'],
  },
  'Lead Capture': {
    response: "I can ask for a visitor's name and email if they have a question I can't answer, ensuring you never miss a potential customer. This is a key part of lead generation.",
    options: ['Answering FAQs', 'What if I can\'t answer?'],
  },
  'Can you be customized?': {
    response: "Absolutely! You can customize my name, color scheme, and personality to perfectly match your brand's look and feel. The controls right below this demo window let you try it out live!",
    options: ['How does it work?', 'What about other languages?'],
  },
  'What if I can\'t answer?': {
    response: "If I can't find an answer in my knowledge base, I can be configured to escalate the conversation to a human agent or create a support ticket by asking for the user's contact information. You never lose a lead.",
    options: ['What can you do?', 'Lead Capture'],
  },
  'What about other languages?': {
    response: "Yes! Because I'm powered by a powerful AI model, I can be configured to understand and respond in many different languages, helping you support a global audience.",
    options: ['How does it work?', 'What can you do?'],
  },
  'default': {
    response: "That's a great question! A fully configured bot would be able to answer that. For this demo, please select one of the options.",
    options: ['What can you do?', 'How does it work?'],
  }
};


export const ChatbotDemo: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#7C3AED');
  const [botName, setBotName] = useState('Your Future Bot');
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const startConversation = useCallback(() => {
    setIsBotTyping(true);
    setTimeout(() => {
      setMessages([{ id: Date.now(), text: conversationFlow.initial.response, sender: 'bot' }]);
      setOptions(conversationFlow.initial.options || []);
      setIsBotTyping(false);
    }, 1000);
  }, []);

  // Initial bot message
  useEffect(() => {
    startConversation();
  }, [startConversation]);

  // Effect to scroll to the bottom of the chat container when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isBotTyping]);

  const handleOptionClick = (optionText: string) => {
    // Add user message
    const userMessage: Message = { id: Date.now(), text: optionText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setOptions([]); // Hide options after one is clicked

    // Simulate bot thinking and get response
    setIsBotTyping(true);
    setTimeout(() => {
      const flow = conversationFlow[optionText] || conversationFlow['default'];
      const botResponse: Message = { id: Date.now() + 1, text: flow.response, sender: 'bot' };
      setMessages(prev => [...prev, botResponse]);
      setOptions(flow.options || []);
      setIsBotTyping(false);
    }, 1500);
  };
  
  const handleReset = () => {
    setMessages([]);
    setOptions([]);
    startConversation();
  };


  return (
    <div className="w-full max-w-sm mx-auto animate-slide-up">
      {/* Chat Window */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700 flex flex-col h-[550px]">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-slate-50 dark:bg-gray-700/50 rounded-t-2xl">
          <div className="flex items-center space-x-3">
              <div className="relative">
                <BotIcon className="w-10 h-10 text-white p-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white dark:ring-gray-800"></span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100">{botName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
              </div>
          </div>
          <button
            onClick={handleReset}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            aria-label="Reset conversation"
          >
            <RefreshIcon className="w-5 h-5" />
          </button>
        </div>
        <div ref={chatContainerRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map(msg => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'bot' && <BotIcon className="w-6 h-6 text-primary flex-shrink-0" />}
              <div 
                className={`max-w-xs px-4 py-2 rounded-2xl ${msg.sender === 'bot' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none' : 'text-white rounded-br-none'}`}
                style={msg.sender === 'user' ? { backgroundColor: primaryColor } : {}}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
          {isBotTyping && (
            <div className="flex items-end gap-2">
              <BotIcon className="w-6 h-6 text-primary flex-shrink-0" />
              <div className="max-w-xs px-4 py-2 rounded-2xl bg-gray-100 dark:bg-gray-700 rounded-bl-none">
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"></span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {options.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {options.map(option => (
                <button
                  key={option}
                  onClick={() => handleOptionClick(option)}
                  className="px-3 py-1.5 text-sm font-medium text-primary dark:text-violet-300 bg-violet-100 dark:bg-violet-500/20 rounded-full hover:bg-violet-200 dark:hover:bg-violet-500/30 transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
          <div className="relative">
            <input
              type="text"
              placeholder="This is just a demo..."
              disabled
              className="w-full pl-4 pr-12 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-full focus:outline-none cursor-not-allowed"
            />
            <button disabled className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-gray-400 cursor-not-allowed">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Customization Controls */}
      <div className="mt-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/80 dark:border-gray-700 p-4">
        <h4 className="font-semibold text-center text-gray-800 dark:text-gray-100 mb-4">Live Customization</h4>
        <div className="space-y-4">
            <div>
                <label htmlFor="botName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bot Name</label>
                <input
                    type="text"
                    id="botName"
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light sm:text-sm dark:text-white transition"
                />
            </div>
            <div>
                <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand Color</label>
                <input
                    type="color"
                    id="primaryColor"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="block w-full h-10 p-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                />
            </div>
        </div>
      </div>
    </div>
  );
};
