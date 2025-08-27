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
    "We have 6 main challenge categories: Web Security, Network Security, Cryptography, Social Engineering, Database Security, and Mobile Security. Which interests you most?",
    "Our challenges range from Beginner to Advanced levels. I recommend starting with SQL Injection Basics if you're new to web security!",
    "Each challenge path includes hands-on labs, real-world simulations, and progress tracking. Want me to recommend a path based on your experience?"
  ],
  help: [
    "I can help you navigate CyberQuest, recommend learning paths, explain concepts, or answer questions about cybersecurity. What would you like to know?",
    "Need guidance? I can suggest challenges based on your skill level, explain cybersecurity concepts, or help you track your progress.",
    "I'm here to make your learning journey smoother! Ask me about specific topics, challenge difficulty, or career advice in cybersecurity."
  ],
  default: [
    "That's an interesting question about cybersecurity! While I don't have a specific answer, I recommend exploring our challenge modules for hands-on learning.",
    "I'm still learning too! For detailed technical questions, try our community forums or dive into the relevant challenge path.",
    "Great question! The best way to learn cybersecurity is through practice. Check out our interactive challenges for practical experience."
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
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <p className="terminal-text">{message.text}</p>
                    <span className="text-xs opacity-60 mt-1 block">
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
                  <div className="bg-muted text-muted-foreground px-3 py-2 rounded-lg">
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