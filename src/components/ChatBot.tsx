import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, MessageSquare, Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const botResponses = {
  greeting: [
    "Welcome to CyberQuest! I'm your AI security assistant. How can I help you today?",
    "Hello, cyber warrior! Ready to dive into some cybersecurity challenges?",
    "Greetings! I'm here to guide you through your cybersecurity learning journey."
  ],
  challenges: [
    "We have exciting interactive challenges! Try our SQL Injection Game to learn about database security, or test your skills with Crypto Puzzles including Caesar ciphers, Vigenère ciphers, and substitution ciphers.",
    "Our challenges include hands-on SQL injection simulations and cryptography puzzles. Which area interests you most - database security or cryptography?",
    "Start with our interactive games: SQL Injection Game for web security fundamentals, or Crypto Puzzles for encryption and decryption challenges!"
  ],
  sql: [
    "The SQL Injection Game teaches you how to identify and exploit SQL injection vulnerabilities! You'll practice on a simulated user database and learn both offensive and defensive techniques.",
    "Our SQL injection challenge simulates a real login system with vulnerable code. Perfect for understanding how attackers exploit databases and how to prevent it!",
    "Ready to hack a database? The SQL Injection Game lets you try different injection techniques on a safe, simulated environment. Great for beginners!"
  ],
  crypto: [
    "Crypto Puzzles include Caesar cipher, Vigenère cipher, and substitution cipher challenges! Each puzzle teaches different encryption techniques used throughout history.",
    "Test your decryption skills with our cryptography puzzles! Start with Caesar cipher (letter shifting), then try Vigenère (keyword-based) and substitution ciphers.",
    "Our crypto challenges cover classical ciphers that form the foundation of modern cryptography. Decode secret messages and earn points!"
  ],
  help: [
    "I can help you navigate CyberQuest, recommend learning paths, explain concepts, or answer questions about cybersecurity. What would you like to know?",
    "Need guidance? I can suggest challenges based on your skill level, explain cybersecurity concepts, or help you track your progress.",
    "I'm here to make your learning journey smoother! Ask me about SQL injection, cryptography, or any other cybersecurity topics."
  ],
  default: [
    "That's an interesting question about cybersecurity! Try our SQL Injection Game or Crypto Puzzles for hands-on learning experience.",
    "I'm still learning too! For practical experience, check out our interactive SQL injection and cryptography challenges.",
    "Great question! The best way to learn cybersecurity is through practice. Try our SQL game or crypto puzzles!"
  ]
};

const getRandomResponse = (category: keyof typeof botResponses): string => {
  const responses = botResponses[category];
  return responses[Math.floor(Math.random() * responses.length)];
};

const getBotResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();
  
  if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
    return getRandomResponse("greeting");
  }
  
  if (message.includes("sql") || message.includes("injection") || message.includes("database")) {
    return getRandomResponse("sql");
  }
  
  if (message.includes("crypto") || message.includes("cipher") || message.includes("caesar") || 
      message.includes("vigenere") || message.includes("substitution") || message.includes("encrypt") || 
      message.includes("decrypt") || message.includes("puzzle")) {
    return getRandomResponse("crypto");
  }
  
  if (message.includes("challenge") || message.includes("learn") || message.includes("start")) {
    return getRandomResponse("challenges");
  }
  
  if (message.includes("help") || message.includes("guide") || message.includes("how")) {
    return getRandomResponse("help");
  }
  
  return getRandomResponse("default");
};

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm CyberBot, your cybersecurity learning assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputMessage),
        sender: "bot",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-primary to-secondary hover:shadow-cyber transition-all duration-300 animate-pulse"
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-50 w-96 h-[500px] flex flex-col cyber-bg border-primary/30 shadow-cyber">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg font-cyber">
              <Bot className="h-5 w-5 text-primary cyber-glow" />
              CyberBot
              <span className="text-xs text-muted-foreground font-normal ml-auto">
                Online
              </span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender === "bot" && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[280px] px-3 py-2 rounded-lg text-sm ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground ml-auto"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="terminal-text">{message.text}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                  
                  {message.sender === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-secondary" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                   <div className="bg-muted text-foreground px-3 py-2 rounded-lg">
                     <div className="flex gap-1">
                       <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                       <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                       <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                     </div>
                   </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border/50 p-4">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about cybersecurity..."
                  className="flex-1 bg-muted/50 border-border/50 focus:border-primary terminal-text"
                />
                <Button
                  onClick={sendMessage}
                  size="icon"
                  className="bg-gradient-to-r from-primary to-secondary hover:shadow-glow transition-all duration-300"
                  disabled={!inputMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};