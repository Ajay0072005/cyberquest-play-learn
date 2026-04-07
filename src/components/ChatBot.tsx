import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, MessageSquare, Send, Bot, User, GripVertical } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import AvatarSVG from '@/components/avatar/AvatarSVG';
import { AvatarConfig, defaultAvatarConfig } from '@/components/avatar/avatarOptions';

const pageContextMap: Record<string, string> = {
  '/': 'Homepage - cybersecurity career paths, challenges overview, and getting started',
  '/dashboard': 'Dashboard - user progress, stats, quick access to labs/challenges/achievements',
  '/labs': 'Practical Labs - hands-on cybersecurity labs with Identify → Exploit → Fix workflow',
  '/sherlock': 'Sherlock Course - cryptography and security through Victorian-era detective adventures',
  '/sql-game': 'SQL Injection Game - practice SQL injection attacks and defenses',
  '/crypto-puzzles': 'Crypto Puzzles - cryptography challenges including ciphers and encryption',
  '/terminal': 'Terminal Challenge - command-line security challenges and Linux terminal practice',
  '/chat': 'AI Chat - dedicated cybersecurity Q&A with RAG-powered knowledge base',
  '/achievements': 'Achievements - badges, milestones, and rewards earned through the platform',
  '/leaderboard': 'Leaderboard - top performers and rankings across the platform',
  '/profile': 'Profile - user profile, skills, certifications, and activity',
  '/settings': 'Settings - account settings, preferences, and profile customization',
  '/career-path': 'Career Path - detailed cybersecurity career progression and skill requirements',
  '/roadmap': 'Roadmap - structured learning path from beginner to advanced cybersecurity',
  '/cyber-game': 'Cyber City Game - interactive cybersecurity missions in a game environment',
  '/cyber-news': 'Cyber News - latest cybersecurity news and threat intelligence',
  '/time-travel': 'Cyber Time Travel - historical cybersecurity events and attacks timeline',
  '/jobs': 'Cyber Jobs - cybersecurity job listings and career opportunities',
  '/events': 'Cyber Events - upcoming cybersecurity conferences and events',
  '/about': 'About Us - information about the CyberQuest platform',
};
interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const HIDDEN_ROUTES = ['/chat', '/settings', '/profile'];

export const ChatBot: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (HIDDEN_ROUTES.includes(location.pathname)) {
    return null;
  }
  const currentPageContext = pageContextMap[location.pathname] || `Page: ${location.pathname}`;
  const [isOpen, setIsOpen] = useState(false);
  const [tutorAvatar, setTutorAvatar] = useState<AvatarConfig | null>(null);
  const [tutorName, setTutorName] = useState('CyberBot');
  const [chatSize, setChatSize] = useState({ width: 384, height: 480 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const initMessageSent = useRef(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeRef.current = { startX: e.clientX, startY: e.clientY, startW: chatSize.width, startH: chatSize.height };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const dw = resizeRef.current.startX - ev.clientX;
      const dh = resizeRef.current.startY - ev.clientY;
      setChatSize({
        width: Math.max(320, Math.min(800, resizeRef.current.startW + dw)),
        height: Math.max(400, Math.min(800, resizeRef.current.startH + dh)),
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [chatSize]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('ai_tutor_avatar, ai_tutor_name')
        .eq('user_id', user.id)
        .single();
      if (data?.ai_tutor_avatar) {
        setTutorAvatar(data.ai_tutor_avatar as unknown as AvatarConfig);
      }
      if ((data as any)?.ai_tutor_name) {
        setTutorName((data as any).ai_tutor_name);
      }
      // Set initial message after name is loaded
      if (!initMessageSent.current) {
        initMessageSent.current = true;
        const name = (data as any)?.ai_tutor_name || 'CyberBot';
        setMessages([{
          id: "1",
          text: `Hello! I'm ${name}, your AI-powered cybersecurity assistant. I have access to 12,663 cybersecurity questions and can help you learn. Ask me anything!`,
          sender: "bot",
          timestamp: new Date()
        }]);
      }
    };
    fetchProfile();
  }, [user]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-rag', {
        body: { message: currentMessage, pageContext: currentPageContext }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive"
        });
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.error,
          sender: "bot",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } else {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.reply,
          sender: "bot",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again.",
        sender: "bot",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
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
        <Card
          className={`fixed bottom-24 right-6 z-50 flex flex-col bg-card/95 backdrop-blur-md border-primary/20 shadow-xl rounded-2xl overflow-hidden ${isResizing ? 'select-none' : ''}`}
          style={{ width: chatSize.width, height: chatSize.height }}
        >
          {/* Resize Handle - top-left corner */}
          <div
            onMouseDown={handleResizeStart}
            className="absolute top-0 left-0 z-10 w-6 h-6 cursor-nw-resize flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
            title="Drag to resize"
          >
            <GripVertical className="h-3 w-3 text-muted-foreground rotate-45" />
          </div>
          <CardHeader className="py-3 px-4 border-b border-border/30 bg-muted/30">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Bot className="h-5 w-5 text-primary" />
              {tutorName}
              <span className="text-[10px] text-primary font-normal ml-auto flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                Online
              </span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender === "bot" && (
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <AvatarSVG config={tutorAvatar || defaultAvatarConfig} size={32} />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                      message.sender === "user"
                        ? "bg-primary/20 text-primary border border-primary/30 ml-auto"
                        : "bg-muted/80 text-foreground border border-border/30"
                    }`}
                  >
                    {message.sender === "bot" ? (
                      <div className="whitespace-pre-wrap break-words leading-relaxed text-sm">
                        <MarkdownRenderer content={message.text} />
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
                    )}
                    <span className="text-[10px] opacity-50 mt-1 block text-right">
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
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <AvatarSVG config={tutorAvatar || defaultAvatarConfig} size={32} />
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