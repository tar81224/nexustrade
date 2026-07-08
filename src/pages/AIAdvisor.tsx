import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, TrendingUp, BarChart3, PieChart, Globe } from 'lucide-react';
import { getAIResponse } from '@/services/dataService';

interface Message {
  id: number;
  role: 'user' | 'ai';
  content: string;
  type?: 'stock' | 'compare' | 'portfolio' | 'market' | 'generic';
}

const quickActions = [
  { label: 'Analyze AAPL', icon: TrendingUp },
  { label: 'Market Outlook', icon: Globe },
  { label: 'Portfolio Review', icon: PieChart },
  { label: 'Compare MSFT vs GOOGL', icon: BarChart3 },
];

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex gap-3"
    >
      <div className="w-8 h-8 rounded-lg bg-accent-electric-dim flex items-center justify-center flex-shrink-0">
        <Bot size={16} className="text-accent-electric" />
      </div>
      <div className="bg-surface-elevated border border-border-subtle rounded-2xl px-4 py-3">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-text-muted animate-pulse" />
          <span className="w-2 h-2 rounded-full bg-text-muted animate-pulse" style={{ animationDelay: '0.2s' }} />
          <span className="w-2 h-2 rounded-full bg-text-muted animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </motion.div>
  );
}

export default function AIAdvisor() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'ai',
      content: "Welcome to your AI Trading Advisor! I'm here to help you analyze stocks, review your portfolio, compare investments, and understand market trends.\n\nTry one of the quick actions below or ask me anything about the markets.",
      type: 'generic',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = useCallback((text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: msg,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getAIResponse(msg);
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: 'ai',
        content: response.text,
        type: response.type,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  }, [input]);

  const handleQuickAction = (label: string) => {
    let query = label;
    if (label === 'Analyze AAPL') query = 'What do you think about Apple (AAPL)?';
    else if (label === 'Market Outlook') query = "What's your market outlook for this week?";
    else if (label === 'Portfolio Review') query = 'Review my portfolio performance';
    else if (label === 'Compare MSFT vs GOOGL') query = 'Compare Microsoft vs Google as investments';
    handleSend(query);
  };

  const formatContent = (content: string) => {
    // Format markdown-like bold text and bullet points
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Bold text
      const bolded = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // Bullet points
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={i} className="ml-4 text-body-sm text-text-secondary flex items-start gap-2"><span className="text-accent-electric mt-1.5 text-[6px]">&#9654;</span><span dangerouslySetInnerHTML={{ __html: bolded.slice(2) }} /></li>;
      }
      if (line.startsWith('|') && line.includes('|')) {
        // Table row - render simply
        return <div key={i} className="font-mono text-[11px] text-text-secondary py-0.5" dangerouslySetInnerHTML={{ __html: bolded }} />;
      }
      return <p key={i} className={`text-body-sm ${line.trim() === '' ? 'h-2' : 'text-text-primary leading-relaxed'}`} dangerouslySetInnerHTML={{ __html: bolded }} />;
    });
  };

  return (
    <div className="h-[calc(100dvh-56px)] flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-accent-electric-dim flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={16} className="text-accent-electric" />
                </div>
              )}
              <div className={`max-w-[80%] md:max-w-[600px] ${msg.role === 'user' ? 'order-first' : ''}`}>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-accent-electric text-deep-void'
                      : 'glass-card border border-border-subtle'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="text-body-sm font-medium whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="space-y-1">{formatContent(msg.content)}</div>
                  )}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-accent-purple flex items-center justify-center flex-shrink-0 mt-1">
                  <User size={14} className="text-white" />
                </div>
              )}
            </motion.div>
          ))}

          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 md:px-6 pb-2">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.label)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-elevated border border-border-subtle text-text-secondary hover:text-accent-electric hover:border-border-active transition-all text-body-sm"
                >
                  <Icon size={14} />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 md:p-6 pt-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about stocks, markets, or your portfolio..."
              className="flex-1 px-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary text-body-sm placeholder:text-text-muted focus:outline-none focus:border-border-active transition-colors"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className={`px-4 py-3 rounded-xl transition-opacity ${
                input.trim() && !isTyping
                  ? 'bg-accent-electric text-deep-void hover:opacity-90'
                  : 'bg-surface-hover text-text-muted cursor-not-allowed'
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
