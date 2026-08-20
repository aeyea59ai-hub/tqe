// Context-Aware AI Chatbot Assistant for SIGNAL DESK UNIFIED v2.0
import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare, ChevronDown, RefreshCw, Languages } from 'lucide-react';
import { CanonicalSnapshot, ScanCandidate, CouncilDeliberation, DeterministicTradePlan, RiskEvaluation, AccountState } from '../types';

interface AIChatDrawerProps {
  selectedSymbol: string;
  snapshot?: CanonicalSnapshot | null;
  candidate?: ScanCandidate;
  deliberation?: CouncilDeliberation | null;
  tradePlan?: DeterministicTradePlan | null;
  riskEval?: RiskEvaluation | null;
  accountState?: AccountState;
}

interface ChatMsg {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  selectedSymbol,
  snapshot,
  candidate,
  deliberation,
  tradePlan,
  riskEval,
  accountState,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your AI Signal Assistant. Ask me anything about ${selectedSymbol}, trade candidate approvals, objections, or strategy parameters. I can also explain signals in Arabic!`,
      timestamp: Date.now(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (promptText?: string) => {
    const textToSend = promptText || inputMsg;
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptText) setInputMsg('');
    setIsSending(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          history: messages.map((m) => ({ sender: m.sender, text: m.text })),
          context: {
            selectedSymbol,
            snapshot,
            candidate,
            deliberation,
            tradePlan,
            riskEval,
            accountState,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const assistantMsg: ChatMsg = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      console.error('Chat AI failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `Current analysis for ${selectedSymbol}: Price is $${snapshot?.currentPrice || 'N/A'}. Council verdict status: ${deliberation?.arbiterVerdict?.status || 'Pending'}. Consensus score: ${deliberation?.arbiterVerdict?.consensusScore || 'N/A'}/100.`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-[76px] right-3 z-50 font-mono text-xs md:bottom-4 md:right-4">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-11 items-center gap-2 rounded-lg border border-cyan-400/40 bg-cyan-500 px-3 text-slate-950 shadow-xl shadow-cyan-500/15 transition hover:bg-cyan-400"
        >
          <Bot className="w-5 h-5 text-slate-950" />
          <span className="hidden text-[10px] font-black sm:inline">AI DESK</span>
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="fixed inset-x-2 bottom-[72px] flex h-[min(72vh,620px)] flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-2xl sm:static sm:h-[600px] sm:w-[440px]">
          {/* Header */}
          <div className="bg-slate-900 border-b border-slate-800 p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-slate-100 uppercase text-xs tracking-wider flex items-center space-x-1.5">
                  <span>AI CONTEXT ASSISTANT</span>
                  <span className="rounded border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[9px] text-violet-300">
                    CONFIGURED PROVIDER
                  </span>
                </div>
                <div className="text-3xs text-slate-400">
                  CONTEXT: <span className="text-cyan-400 font-bold">{selectedSymbol}</span> • 15M SNAPSHOT
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Preset Prompts */}
          <div className="bg-slate-925 p-2 border-b border-slate-850 flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => handleSendMessage(`Why was ${selectedSymbol} approved or rejected by the AI Council?`)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-3xs font-bold whitespace-nowrap"
            >
              Why Approved/Rejected?
            </button>
            <button
              onClick={() => handleSendMessage(`What is the strongest Red Team objection for ${selectedSymbol}?`)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-3xs font-bold whitespace-nowrap"
            >
              Strongest Objection
            </button>
            <button
              onClick={() => handleSendMessage(`اشرح هذه التوصية باللغة العربية بالتفصيل.`)}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-3xs font-bold whitespace-nowrap flex items-center space-x-1"
            >
              <Languages className="w-3 h-3 text-emerald-400 inline" />
              <span>شرح بالعربية</span>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3.5 space-y-3 overflow-y-auto bg-slate-950/90">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-2xl text-2xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-cyan-600 text-slate-950 font-medium rounded-br-none shadow-md'
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none shadow-sm whitespace-pre-wrap'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-3xs text-slate-500 mt-1 px-1">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {isSending && (
              <div className="flex items-center space-x-2 text-cyan-400 text-3xs p-2 bg-slate-900/60 rounded-xl border border-slate-800 w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>AI provider reviewing the available context...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Ask AI about ${selectedSymbol}...`}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-2xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isSending || !inputMsg.trim()}
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
