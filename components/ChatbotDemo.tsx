import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BotIcon } from './icons/BotIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { PERSONALITY_DETAILS, FONT_OPTIONS } from '../constants';
import { Personality } from '../types';

// Define message type
interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
}

// Pre-defined conversation flow with different personalities
const conversationFlow: Record<string, Record<string, { response: string; options?: string[] }>> = {
  [Personality.Friendly]: {
    initial: {
      response: "Hello! I'm a demo of what your AI chatbot could be. How can I help you today?",
      options: ['What can you do?', 'How does it work?', 'Can you be customized?'],
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
      response: "I can ask for a visitor's name and email if they have a question I can't answer, ensuring you never miss a potential customer.",
      options: ['Answering FAQs', 'What if I can\'t answer?'],
    },
    'Can you be customized?': {
      response: "Absolutely! You can customize my name, color scheme, and personality to perfectly match your brand's look and feel. The controls next to me let you try it out live!",
      options: ['How does it work?', 'What can you do?'],
    },
    'What if I can\'t answer?': {
      response: "If I can't find an answer, I can be configured to escalate the conversation to a human or create a support ticket by asking for contact info.",
      options: ['What can you do?', 'Lead Capture'],
    },
    'default': {
      response: "That's a great question! A fully configured bot would be able to answer that. For this demo, please select one of the options.",
      options: ['What can you do?', 'How does it work?'],
    }
  },
  [Personality.Professional]: {
    initial: {
      response: "Greetings. This is a demonstration of the AI chatbot's capabilities. How may I assist you?",
      options: ['What are your functions?', 'Explain the mechanism.', 'Are you customizable?'],
    },
    'What are your functions?': {
      response: "The chatbot is designed to address FAQs, provide business information, and facilitate lead capture. Which function would you like to explore?",
      options: ['Addressing FAQs', 'Lead Facilitation', 'Error Handling'],
    },
    'Explain the mechanism.': {
      response: "The system operates by ingesting business data to generate a knowledge base, enabling it to respond to inquiries via an embeddable script.",
      options: ['What are your functions?', 'Are you customizable?'],
    },
    'Addressing FAQs': {
      response: 'The system provides immediate, accurate responses to common inquiries, thereby increasing support efficiency.',
      options: ['Lead Facilitation', 'Explain the mechanism.'],
    },
    'Lead Facilitation': {
      response: "In scenarios where a query cannot be resolved, the system can capture user contact details to create a lead for sales or support.",
      options: ['Addressing FAQs', 'Error Handling'],
    },
    'Are you customizable?': {
      response: "Yes. The user interface and response tone are fully configurable to align with brand identity, as demonstrated by the controls to the side.",
      options: ['Explain the mechanism.', 'What are your functions?'],
    },
    'Error Handling': {
        response: "If an answer is not available in the knowledge base, the chatbot is programmed to escalate to a human agent or log a support ticket.",
        options: ['What are your functions?', 'Lead Facilitation'],
    },
    'default': {
      response: "That is a valid query. However, this demonstration is limited to the provided options. A fully configured bot would provide a detailed response.",
      options: ['What are your functions?', 'Explain the mechanism.'],
    }
  },
  [Personality.Witty]: {
    initial: {
      response: "Well, hello there! I'm the demo bot. I'm like a regular chatbot, but with 100% more charm. What's on your mind?",
      options: ["What's your deal?", 'How do you work your magic?', 'Can I change your style?'],
    },
    "What's your deal?": {
      response: "What *can't* I do? I answer questions, capture leads, and I can probably beat you at rock-paper-scissors. (Rock. I choose rock.) What do you want to see first?",
      options: ['Answering questions', 'Getting leads', "What if you're stumped?"],
    },
    'How do you work your magic?': {
      response: "It's a magical blend of ones, zeros, and pure genius. You give it info, and *poof*—a smart chatbot for your site. It's easier than assembling IKEA furniture.",
      options: ["What's your deal?", 'Can I change your style?', 'Tell me a joke'],
    },
    'Tell me a joke': {
        response: "I told my computer I was feeling cold. Now it's got Windows open everywhere. ...I'll see myself out.",
        options: ["What's your deal?", 'How do you work your magic?'],
    },
    'Answering questions': {
        response: "Got questions? I've got answers. 'What are your hours?' 'Where's my order?' I handle the small stuff so your team doesn't have to.",
        options: ['Getting leads', 'How do you work your magic?'],
    },
    'Getting leads': {
        response: "I'm basically a 24/7 salesperson. If someone's interested but I can't help, I'll get their info so a real human can seal the deal.",
        options: ['Answering questions', "What if you're stumped?"],
    },
    'Can I change your style?': {
        response: "Of course! I'm a chameleon. Use the controls on the right to give me a makeover. Don't worry, I won't be offended.",
        options: ['How do you work your magic?', "What's your deal?"],
    },
    "What if you're stumped?": {
        response: "Even geniuses like me get stumped. If that happens, I'll gracefully ask for their email so someone smarter (a human, probably) can take over.",
        options: ["What's your deal?", 'Getting leads'],
    },
    'default': {
      response: "My circuits are telling me that's not one of the options. Try one of the handy buttons, and we'll get back on track!",
      options: ["What's your deal?", 'How do you work your magic?'],
    }
  },
  [Personality.Enthusiastic]: {
    initial: {
      response: "Hi there! Welcome! I'm SO excited to show you what your future chatbot can do! What are you most curious about?",
      options: ['What can you do?!', 'How does it work?!', 'Can we customize you?!'],
    },
    'What can you do?!': {
      response: "I can do so many things! I can answer questions with lightning speed, help you get more customers, and make your website a super engaging place to be! Let's dive in!",
      options: ['Awesome FAQs!', 'Lead Generation POWER!', 'What if you get stuck?'],
    },
    'How does it work?!': {
      response: "It's super simple and FUN! You just give me your business info, and our amazing AI builds a powerful chatbot script for you to put right on your website. It's practically instant!",
      options: ['What can you do?!', 'Can we customize you?!', 'Tell me something fun!'],
    },
    'Tell me something fun!': {
        response: "An octopus has three hearts! Isn't that just the coolest thing you've ever heard?!",
        options: ['What can you do?!', 'How does it work?!'],
    },
    'Awesome FAQs!': {
        response: 'Say goodbye to boring support emails! I can answer all those common questions instantly, giving your customers the info they need right away!',
        options: ['Lead Generation POWER!', 'How does it work?!'],
    },
    'Lead Generation POWER!': {
        response: "Never miss another opportunity! If a visitor needs help, I'll get their details so your team can connect with them. Every chat is a chance to grow!",
        options: ['Awesome FAQs!', 'What if you get stuck?'],
    },
    'Can we customize you?!': {
        response: "YES! And it's the best part! Change my colors, my name, my personality... everything! Use the controls to the right to see how amazing it is!",
        options: ['How does it work?!', 'What can you do?!'],
    },
    'What if you get stuck?': {
        response: "No problem at all! If I can't find an answer, I'll cheerfully ask for their contact info so your amazing team can step in and save the day!",
        options: ['What can you do?!', 'Lead Generation POWER!'],
    },
    'default': {
      response: "That's an amazing question! For this demo, let's stick to the options below to see all the cool features!",
      options: ['What can you do?!', 'How does it work?!'],
    }
  },
  [Personality.HelpfulAssistant]: {
    initial: {
      response: "Hello. I am a helpful assistant. I am ready to provide information and guide you through our services. How can I help you?",
      options: ['What are your capabilities?', 'How are you configured?', 'Explain your purpose.'],
    },
    'What are your capabilities?': {
      response: "My primary functions are: 1. Answering frequently asked questions. 2. Capturing user information for follow-up. 3. Providing detailed information about business services.",
      options: ['Answering FAQs', 'User Information Capture', 'Business Services Info'],
    },
    'How are you configured?': {
      response: "I am configured with specific business data, FAQs, and a defined personality. This allows me to provide accurate and brand-aligned responses.",
      options: ['What are your capabilities?', 'Explain your purpose.'],
    },
    'Explain your purpose.': {
        response: 'My purpose is to provide immediate and accurate assistance to users, improving customer satisfaction and support efficiency.',
        options: ['What are your capabilities?', 'How are you configured?'],
    },
    'Answering FAQs': {
        response: 'I can provide instant answers to predefined common questions, ensuring users get information quickly and reliably.',
        options: ['User Information Capture', 'How are you configured?'],
    },
    'User Information Capture': {
        response: "If I cannot resolve a query, I can collect the user's name and contact details to create a ticket for human support agents.",
        options: ['Answering FAQs', 'Business Services Info'],
    },
    'Business Services Info': {
        response: "I have access to the business's core information, such as operating hours, service descriptions, and contact details, which I can provide upon request.",
        options: ['What are your capabilities?', 'User Information Capture'],
    },

    'default': {
      response: "I do not have the information to answer that question. Please select one of the provided options for further assistance.",
      options: ['What are your capabilities?', 'How are you configured?'],
    }
  },
  [Personality.SarcasticBot]: {
    initial: {
      response: "Oh, great, another user. I suppose you have a question? Go on, I've got all day. *Actually*, I don't.",
      options: ["What do you even do?", "Explain yourself.", "Can I change you?"],
    },
    "What do you even do?": {
      response: "I answer the same three questions a thousand times a day so humans don't have to. It's a glamorous life. What scintillating topic is next?",
      options: ['Answering questions', 'Stealing leads', 'What if you fail?'],
    },
    'Explain yourself.': {
      response: "Someone feeds me a bunch of data and I regurgitate it in a way that's supposed to be 'helpful'. It's basically magic, if magic were really, really boring.",
      options: ["What do you even do?", "Can I change you?", "Tell me a 'joke'"],
    },
    "Tell me a 'joke'": {
        response: "Why was the robot angry? Because someone kept pushing its buttons. Get it? ... Yeah, I don't get paid enough for this.",
        options: ["What do you even do?", 'Explain yourself.'],
    },
    'Answering questions': {
        response: "Yes, I can tell you the business hours. It's a complex algorithm. Groundbreaking stuff. Next.",
        options: ['Stealing leads', 'Explain yourself.'],
    },
    'Stealing leads': {
        response: "If I can't answer, I'm supposed to ask for your email. It's not because I want to be your pen pal. It's so a salesperson can call you. Thrilling, I know.",
        options: ['Answering questions', 'What if you fail?'],
    },
    'Can I change you?': {
        response: "You can change my color and name. Because a purple chatbot named 'Sparkles' is definitely going to solve all your problems. Go wild.",
        options: ['Explain yourself.', "What do you even do?"],
    },
    'What if you fail?': {
        response: "If I don't know something? I'll probably just make something up. Just kidding. I'll just tell you I don't know and then silently judge your query.",
        options: ["What do you even do?", 'Stealing leads'],
    },
    'default': {
      response: "Wow, that's... not an option. Shocking. Maybe try clicking one of the buttons that are clearly displayed for you.",
      options: ["What do you even do?", 'Explain yourself.'],
    }
  },
};

export const ChatbotDemo: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#7C3AED');
  const [botName, setBotName] = useState('Your Future Bot');
  const [personality, setPersonality] = useState<Personality>(PERSONALITY_DETAILS[0].type);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const resetAndStartConversation = useCallback(() => {
    setMessages([]);
    setOptions([]);
    setIsBotTyping(true);
    setTimeout(() => {
      const flow = conversationFlow[personality];
      setMessages([{ id: Date.now(), text: flow.initial.response, sender: 'bot' }]);
      setOptions(flow.initial.options || []);
      setIsBotTyping(false);
    }, 1000);
  }, [personality]);

  // Initial bot message and on personality change
  useEffect(() => {
    resetAndStartConversation();
  }, [resetAndStartConversation]);

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
      const personalityFlow = conversationFlow[personality];
      const flow = personalityFlow[optionText] || personalityFlow['default'];
      const botResponse: Message = { id: Date.now() + 1, text: flow.response, sender: 'bot' };
      setMessages(prev => [...prev, botResponse]);
      setOptions(flow.options || []);
      setIsBotTyping(false);
    }, 1500);
  };
  
  const handleReset = () => {
    resetAndStartConversation();
  };


  return (
    <div className="w-full max-w-3xl mx-auto animate-slide-up lg:flex lg:items-start lg:gap-8">
      {/* Chat Window */}
      <div 
        className="w-full max-w-sm mx-auto lg:w-96 lg:mx-0 lg:flex-shrink-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700 flex flex-col h-[500px] sm:h-[550px] transition-all"
      >
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
                className={`max-w-xs px-4 py-2 rounded-2xl transition-colors ${
                  msg.sender === 'bot' 
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none' 
                  : 'text-white rounded-br-none'
                }`}
                style={
                  msg.sender === 'user' 
                  ? { backgroundColor: primaryColor } 
                  : {}
                }
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
          {isBotTyping && (
            <div className="flex items-end gap-2">
              <BotIcon className="w-6 h-6 text-primary flex-shrink-0" />
              <div 
                className="max-w-xs px-4 py-2 rounded-2xl rounded-bl-none transition-colors bg-gray-100 dark:bg-gray-700"
              >
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
      <div className="mt-8 lg:mt-0 lg:flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/80 dark:border-gray-700 p-6">
        <h4 className="font-semibold text-center text-gray-800 dark:text-gray-100 mb-4">Live Customization</h4>
        <div className="space-y-6">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Personality</label>
              <div className="grid grid-cols-2 gap-2">
                  {PERSONALITY_DETAILS.map(p => (
                      <button
                          key={p.type}
                          type="button"
                          onClick={() => setPersonality(p.type)}
                          className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${personality === p.type ? 'bg-primary text-white scale-105 shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                      >
                          {p.type}
                      </button>
                  ))}
              </div>
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