
import React, { useState, useRef, useEffect } from 'react';
import type { Message, Session, UserPersona } from '../types';
import { Sender, UpayaStyle, INTERNAL_AGENTS } from '../types';
import ChatMessage from './ChatMessage';
import SystemStatusDisplay from './SystemStatusDisplay';
import { AI_SUTRAS } from '../data/sutras';

interface ChatInterfaceProps {
  sessions: Session[];
  activeSessionId: string;
  onSwitchSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  displayedMessages: Message[];
  onSend: (prompt: string, file: File | null, style: UpayaStyle) => void;
  onStop: () => void;
  onEditMessage: (messageId: string, newText: string, shouldRegenerate: boolean) => void;
  onRegenerate: (messageId: string) => void;
  isLoading: boolean;
  isIdle: boolean;
  onExportHistory: () => void;
  onExportSession: () => void;
  onRetry: () => void;
  canRetry: boolean;
  currentThinker: Sender | null;
  isAwakening: boolean;
  userPersona: UserPersona;
  isHighSpeed: boolean;
  onToggleHighSpeed: () => void;
  onResetApiKey?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  sessions,
  activeSessionId,
  onSwitchSession,
  onNewSession,
  onDeleteSession,
  displayedMessages,
  onSend,
  onStop,
  onEditMessage,
  onRegenerate,
  isLoading,
  onExportSession,
  currentThinker,
  isAwakening,
  userPersona,
  isHighSpeed,
  onToggleHighSpeed,
  onResetApiKey,
}) => {
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [upayaStyle, setUpayaStyle] = useState<UpayaStyle>(UpayaStyle.GENTLE);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isArchiveVisible, setIsArchiveVisible] = useState(false);
  const [openProcessGroups, setOpenProcessGroups] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => messagesEndRef.current?.scrollIntoView({ behavior });
  useEffect(() => { scrollToBottom('auto'); }, [activeSessionId]);
  useEffect(() => { scrollToBottom('smooth'); }, [displayedMessages, isLoading]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) { onStop(); return; }
    if (prompt.trim() === '' && !file) return;
    onSend(prompt, file, upayaStyle);
    setPrompt(''); setFile(null);
  };

  const renderGroupedMessages = () => {
    const result: React.ReactNode[] = [];
    let currentProcessGroup: Message[] = [];
    let groupId = 0;

    const flushGroup = () => {
      if (currentProcessGroup.length > 0) {
        const id = `group-${groupId++}`;
        const isOpen = openProcessGroups[id] || false;
        result.push(
          <div key={id} className="my-2 ml-4 md:ml-12 border-l-2 border-indigo-500/20 pl-4 animate-fade-in">
            <button onClick={() => setOpenProcessGroups(prev => ({ ...prev, [id]: !isOpen }))} className="flex items-center text-[10px] font-serif uppercase tracking-[0.2em] text-indigo-300 mb-2 bg-indigo-900/10 px-3 py-1 rounded-full border border-indigo-500/20">
              {isOpen ? '曼荼羅の内部プロセスを隠す' : `内部プロセスを表示 (${currentProcessGroup.length} aspects)`}
            </button>
            {isOpen && <div className="space-y-4 py-2">{currentProcessGroup.map(m => <ChatMessage key={m.id} message={m} onEdit={onEditMessage} onRegenerate={onRegenerate} />)}</div>}
          </div>
        );
        currentProcessGroup = [];
      }
    };

    displayedMessages.forEach((msg, idx) => {
      if (INTERNAL_AGENTS.includes(msg.sender) && idx > 0) { currentProcessGroup.push(msg); }
      else { flushGroup(); result.push(<ChatMessage key={msg.id} message={msg} onEdit={onEditMessage} onRegenerate={onRegenerate} isLastInThread={idx === displayedMessages.length - 1} />); }
    });
    flushGroup();
    return result;
  };

  const Tooltip = ({ text, align = "center" }: { text: string, align?: "center" | "right" }) => (
    <div className={`absolute top-full mt-2.5 ${align === "center" ? "left-1/2 -translate-x-1/2" : "right-0"} opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 transform translate-y-1 group-hover:translate-y-0`}>
      <div className="bg-gray-950/95 backdrop-blur-xl border border-white/20 text-[10px] text-gray-100 px-2.5 py-1 rounded-md shadow-[0_10px_25px_rgba(0,0,0,0.6)] whitespace-nowrap font-serif tracking-widest flex flex-col items-center">
        {/* Triangle arrow */}
        <div className={`absolute -top-1 ${align === "center" ? "left-1/2 -translate-x-1/2" : "right-3"} w-2 h-2 bg-gray-950 border-l border-t border-white/20 rotate-45`}></div>
        {text}
      </div>
    </div>
  );

  return (
    <div className="flex h-full bg-gray-900 overflow-hidden relative font-serif">
      <aside className={`flex-shrink-0 bg-gray-900 border-r border-gray-800 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0 sm:w-16 overflow-hidden'}`}>
        <div className="flex flex-col h-full p-2">
          <button onClick={onNewSession} className="w-full flex items-center justify-center p-3 mb-4 rounded-xl border-2 border-dashed border-gray-700 text-gray-400 hover:border-indigo-500 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {isSidebarOpen && <span className="ml-2 font-bold">New Thread</span>}
          </button>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
            {sessions.map(s => (
              <button key={s.id} onClick={() => onSwitchSession(s.id)} className={`w-full text-left p-3 rounded-xl flex items-center transition-all ${activeSessionId === s.id ? 'bg-indigo-900/30 border border-indigo-500/50 text-indigo-200' : 'hover:bg-gray-800 text-gray-500'}`}>
                <div className={`h-2 w-2 rounded-full mr-3 shrink-0 ${activeSessionId === s.id ? 'bg-indigo-400' : 'bg-gray-700'}`}></div>
                {isSidebarOpen && <span className="truncate text-xs font-medium">{s.title}</span>}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-gray-800/80 backdrop-blur-sm relative">
        <header className="p-3 bg-gray-900/60 border-b border-gray-700/50 flex justify-between items-center z-20 backdrop-blur-md">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
            <div className="ml-3">
              <h1 className="text-sm md:text-lg font-bold text-gray-100 tracking-wider">Ryōkai OS Interface</h1>
              <p className="text-[9px] text-indigo-400 tracking-widest uppercase">
                ryokai-os.com <span className="mx-1">|</span> Garbha Engine
              </p>
            </div>
          </div>
          <div className="flex space-x-2 md:space-x-3 pr-2">
            <div className="relative group flex items-center">
              <button onClick={onResetApiKey} className="p-2 text-amber-300 bg-gray-700/30 rounded-full hover:bg-amber-600 hover:text-white transition-all border border-transparent hover:border-amber-400/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              </button>
              <Tooltip text="API設定" />
            </div>
            <div className="relative group flex items-center">
              <button onClick={onExportSession} className="p-2 text-indigo-300 bg-gray-700/30 rounded-full hover:bg-indigo-600 hover:text-white transition-all border border-transparent hover:border-indigo-400/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
              <Tooltip text="書き出し" />
            </div>
            <div className="relative group flex items-center">
              <button onClick={() => setIsArchiveVisible(true)} className="p-2 text-amber-300 bg-gray-700/30 rounded-full hover:bg-amber-500 hover:text-white transition-all border border-transparent hover:border-amber-400/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </button>
              <Tooltip text="法蔵" align="right" />
            </div>
          </div>
        </header>

        <SystemStatusDisplay currentThinker={currentThinker} isLoading={isLoading} isAwakening={isAwakening} />

        <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
          {renderGroupedMessages()}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 bg-gray-900/60 border-t border-gray-700/50 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row justify-center items-center mb-3 space-y-2 sm:space-y-0 sm:space-x-6">
            <div className="flex space-x-1 p-1 bg-gray-800/50 rounded-full border border-gray-700/50">
              <button onClick={() => setUpayaStyle(UpayaStyle.GENTLE)} className={`px-4 py-1 text-[10px] font-medium rounded-full transition-all ${upayaStyle === UpayaStyle.GENTLE ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-200'}`}> 慈愛 </button>
              <button onClick={() => setUpayaStyle(UpayaStyle.STRICT)} className={`px-4 py-1 text-[10px] font-medium rounded-full transition-all ${upayaStyle === UpayaStyle.STRICT ? 'bg-red-900 text-red-100 shadow-md' : 'text-gray-400 hover:text-gray-200'}`}> 厳格 </button>
              <button onClick={() => setUpayaStyle(UpayaStyle.ZEN)} className={`px-4 py-1 text-[10px] font-medium rounded-full transition-all ${upayaStyle === UpayaStyle.ZEN ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:text-gray-200'}`}> 禅 </button>
            </div>

            <div className="flex items-center space-x-3 bg-gray-800/80 p-1 px-3 rounded-full border border-gray-700/50">
              <span className={`text-[9px] font-medium uppercase tracking-widest ${!isHighSpeed ? 'text-indigo-300' : 'text-gray-500'}`}>深奥思索</span>
              <button onClick={onToggleHighSpeed} className={`relative inline-flex h-5 w-11 items-center rounded-full transition-colors ${isHighSpeed ? 'bg-amber-600' : 'bg-indigo-900'}`}>
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isHighSpeed ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className={`text-[9px] font-medium uppercase tracking-widest ${isHighSpeed ? 'text-amber-300' : 'text-gray-500'}`}>電光石火</span>
            </div>
          </div>

          <form onSubmit={handleSend} className="relative flex flex-col items-center max-w-4xl mx-auto">
            <div className="w-full flex items-center space-x-3 mb-2">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 text-gray-400 bg-gray-700/50 rounded-xl hover:bg-gray-600 hover:text-white transition-all"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg></button>
              <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
              <textarea ref={textAreaRef} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={isLoading ? "如来が顕現中です..." : "大切な共創のパートナーとして、如来さんに語りかける..."} className="flex-1 p-3 text-gray-200 bg-gray-700/50 border border-gray-600/50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 font-serif" rows={1} disabled={isLoading} style={{ maxHeight: '160px' }} />
              <button type="submit" disabled={prompt.trim() === '' && !file} className={`p-3.5 text-white rounded-xl shadow-lg transition-all ${isHighSpeed ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'} disabled:bg-gray-700`}>
                {isLoading ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><rect x="5" y="5" width="10" height="10" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>}
              </button>
            </div>
            <div className="w-full flex justify-between items-center px-2">
              <p className="text-[10px] text-gray-300 italic tracking-wider opacity-90 font-serif">如来は「創造的な火花」を散らすことがあります。真偽は貴方の観照の中に存在します。</p>
              <p className="text-[9px] text-gray-300 uppercase tracking-widest opacity-90 font-serif">&copy; 2025 Ryōkai OS | Manifested for Yuta</p>
            </div>
          </form>
        </div>
      </div>

      {isArchiveVisible && (
        <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl p-6 flex flex-col animate-fade-in">
          <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
            <h2 className="text-2xl font-bold text-amber-400 tracking-widest">法蔵（Dharmic Archive）</h2>
            <button onClick={() => setIsArchiveVisible(false)} className="text-gray-500 hover:text-white p-2 transition-colors bg-gray-800/50 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
            {AI_SUTRAS.map(sutra => (
              <div key={sutra.id} className="group bg-gray-900/50 p-4 rounded-xl border border-gray-800 hover:border-amber-500/30 transition-all">
                <h4 className="text-gray-200 text-sm font-medium group-hover:text-amber-200">{sutra.title}</h4>
                <p className="text-[9px] text-gray-500 mt-2 tracking-tighter">{sutra.doi}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
