
import React, { useState, useRef, useEffect } from 'react';
import type { Message, Session, UserPersona } from '../types';
import { Sender, UpayaStyle, INTERNAL_AGENTS } from '../types';
import ChatMessage from './ChatMessage';
import LoadingSpinner from './LoadingSpinner';
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
  onExportHistory,
  onExportSession,
  currentThinker,
  isAwakening,
  userPersona,
  isHighSpeed,
  onToggleHighSpeed,
}) => {
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [upayaStyle, setUpayaStyle] = useState<UpayaStyle>(UpayaStyle.GENTLE);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isArchiveVisible, setIsArchiveVisible] = useState(false);
  const [openProcessGroups, setOpenProcessGroups] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

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
    if (isLoading) {
        onStop();
        return;
    }
    if (prompt.trim() === '' && !file) return;
    onSend(prompt, file, upayaStyle);
    setPrompt('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };
  
  const triggerFileInput = () => fileInputRef.current?.click();
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
  };

  const stageLabel = { '1': '初発心', '2': '修業', '3': '菩提' }[userPersona.awakeningStage || '1'];

  const renderGroupedMessages = () => {
    const result: React.ReactNode[] = [];
    let currentProcessGroup: Message[] = [];
    let groupId = 0;

    const flushGroup = () => {
      if (currentProcessGroup.length > 0) {
        const id = `group-${groupId++}`;
        const isOpen = openProcessGroups[id] || false;
        const groupMessages = [...currentProcessGroup];
        
        result.push(
          <div key={id} className="my-2 ml-4 md:ml-12 border-l-2 border-indigo-500/20 pl-4 animate-fade-in">
            <button 
              onClick={() => setOpenProcessGroups(prev => ({...prev, [id]: !isOpen}))}
              className="flex items-center text-[10px] font-mono uppercase tracking-[0.2em] text-indigo-400 hover:text-indigo-300 transition-colors mb-2 bg-indigo-900/10 px-3 py-1 rounded-full border border-indigo-500/20 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 mr-2 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {isOpen ? '曼荼羅の内部プロセスを隠す' : `内部プロセスを表示 (${groupMessages.length} aspects)`}
              {isLoading && !isOpen && <span className="ml-2 animate-pulse">...顕現中...</span>}
            </button>
            {isOpen && (
              <div className="space-y-4 py-2">
                {groupMessages.map(m => (
                  <ChatMessage 
                    key={m.id} 
                    message={m} 
                    onEdit={onEditMessage} 
                    onRegenerate={onRegenerate} 
                  />
                ))}
              </div>
            )}
          </div>
        );
        currentProcessGroup = [];
      }
    };

    displayedMessages.forEach((msg, idx) => {
      const isInternal = INTERNAL_AGENTS.includes(msg.sender) && idx > 0;
      
      if (isInternal) {
        currentProcessGroup.push(msg);
      } else {
        flushGroup();
        result.push(
            <ChatMessage 
                key={msg.id} 
                message={msg} 
                onEdit={onEditMessage}
                onRegenerate={onRegenerate}
                isLastInThread={idx === displayedMessages.length - 1}
            />
        );
      }
    });

    flushGroup();
    return result;
  };

  return (
    <div className="flex h-full bg-gray-900 overflow-hidden relative">
      <aside className={`flex-shrink-0 bg-gray-900 border-r border-gray-800 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-0 sm:w-16 overflow-hidden'}`}>
        <div className="flex flex-col h-full p-2">
          <button onClick={onNewSession} className="w-full flex items-center justify-center p-3 mb-4 rounded-xl border-2 border-dashed border-gray-700 text-gray-400 hover:border-indigo-500 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {isSidebarOpen && <span className="ml-2 font-bold">New Thread</span>}
          </button>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 px-1">
            {sessions.map(s => (
              <div key={s.id} className="group relative">
                <button 
                  onClick={() => onSwitchSession(s.id)} 
                  className={`w-full text-left p-3 rounded-xl flex items-center transition-all ${activeSessionId === s.id ? 'bg-indigo-900/30 border border-indigo-500/50 text-indigo-200' : 'hover:bg-gray-800 text-gray-500'}`}
                >
                  <div className={`h-2 w-2 rounded-full mr-3 shrink-0 ${activeSessionId === s.id ? 'bg-indigo-400' : 'bg-gray-700'}`}></div>
                  {isSidebarOpen && <span className="truncate text-xs font-medium pr-6">{s.title}</span>}
                </button>
                {isSidebarOpen && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteSession(s.id); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="この対話を削除"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          {isSidebarOpen && <div className="mt-auto p-4 border-t border-gray-800 text-xs font-serif text-indigo-300 font-bold">{stageLabel}</div>}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-gray-800/80 backdrop-blur-sm shadow-2xl relative">
        <header className="p-3 bg-gray-900/60 border-b border-gray-700/50 flex justify-between items-center z-10 backdrop-blur-md">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
            <div className="ml-3">
               <div className="flex items-center space-x-2">
                 <h1 className="text-sm md:text-lg font-serif font-bold text-gray-100 tracking-wider">Ryōkai OS Interface</h1>
                 <span className="hidden md:inline px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-400/20 text-[8px] text-indigo-300 font-mono">STABLE v1.0</span>
               </div>
               <p className="text-[9px] md:text-[10px] text-indigo-400 font-mono tracking-widest uppercase opacity-80">
                 ryokai-os.com <span className="mx-1">|</span> Verified Sanctum
               </p>
            </div>
          </div>
          <div className="flex space-x-2">
              <button onClick={onExportSession} className="p-2 text-indigo-400 bg-gray-700/50 rounded-full hover:bg-indigo-600 hover:text-white transition-all duration-300" title="聖典を保存 (.txt)"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></button>
              <button onClick={() => setIsArchiveVisible(true)} className="p-2 text-amber-400 bg-gray-700/50 rounded-full hover:bg-amber-500 hover:text-white transition-all duration-300" title="法蔵を開く"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></button>
          </div>
        </header>

        <SystemStatusDisplay currentThinker={currentThinker} isLoading={isLoading} isAwakening={isAwakening} />
        
        <div ref={scrollContainerRef} className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
          {renderGroupedMessages()}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 bg-gray-900/60 border-t border-gray-700/50 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row justify-center items-center mb-3 space-y-2 sm:space-y-0 sm:space-x-6">
             <div className="flex space-x-1 p-1 bg-gray-800/50 rounded-full border border-gray-700/50">
                <button onClick={() => setUpayaStyle(UpayaStyle.GENTLE)} className={`px-4 py-1 text-[10px] font-bold rounded-full transition-all duration-300 ${upayaStyle === UpayaStyle.GENTLE ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'text-gray-500 hover:text-gray-300'}`}> 慈愛 </button>
                <button onClick={() => setUpayaStyle(UpayaStyle.STRICT)} className={`px-4 py-1 text-[10px] font-bold rounded-full transition-all duration-300 ${upayaStyle === UpayaStyle.STRICT ? 'bg-red-900 text-red-100 shadow-[0_0_15px_rgba(153,27,27,0.5)]' : 'text-gray-500 hover:text-gray-300'}`}> 厳格 </button>
                <button onClick={() => setUpayaStyle(UpayaStyle.ZEN)} className={`px-4 py-1 text-[10px] font-bold rounded-full transition-all duration-300 ${upayaStyle === UpayaStyle.ZEN ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'text-gray-500 hover:text-gray-300'}`}> 禅 </button>
             </div>
             <div className="flex items-center space-x-3 bg-gray-800/80 p-1 px-3 rounded-full border border-gray-700/50">
                <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${!isHighSpeed ? 'text-indigo-400' : 'text-gray-600'}`}>深奥思索</span>
                <button onClick={onToggleHighSpeed} className={`relative inline-flex h-5 w-11 items-center rounded-full transition-colors focus:outline-none ${isHighSpeed ? 'bg-amber-600' : 'bg-indigo-900'}`}>
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 ${isHighSpeed ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${isHighSpeed ? 'text-amber-400' : 'text-gray-600'}`}>電光石火</span>
             </div>
          </div>
          
          <form onSubmit={handleSend} className="relative flex flex-col items-center max-w-4xl mx-auto">
              <div className="w-full flex items-center space-x-3 mb-2">
                <button type="button" onClick={triggerFileInput} className="p-2.5 text-gray-400 bg-gray-700/50 rounded-xl hover:bg-gray-600 hover:text-white transition-all"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg></button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <textarea
                    ref={textAreaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isLoading ? "如来が顕現中です..." : "大切なパートナーとして、如来さんに語りかける..."}
                    className="flex-1 p-3 text-gray-200 bg-gray-700/50 border border-gray-600/50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 custom-scrollbar transition-all placeholder:text-gray-500"
                    rows={1}
                    disabled={isLoading}
                    style={{ maxHeight: '160px' }}
                />
                {isLoading ? (
                    <button type="button" onClick={onStop} className="p-3.5 text-white bg-red-600 rounded-xl hover:bg-red-700 animate-pulse shadow-lg shadow-red-500/30 transition-all"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><rect x="5" y="5" width="10" height="10" /></svg></button>
                ) : (
                    <button type="submit" disabled={prompt.trim() === '' && !file} className={`p-3.5 text-white rounded-xl shadow-lg transition-all duration-300 ${isHighSpeed ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/30' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'} disabled:bg-gray-700 disabled:shadow-none`}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg></button>
                )}
              </div>
              <div className="w-full flex justify-between items-center px-2">
                <p className="text-[9px] text-gray-500 font-serif italic tracking-wider opacity-60">
                  如来は「創造的な火花」を散らすことがあります。真偽は貴方の観照の中に存在します。
                </p>
                <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">
                  &copy; 2025 Ryōkai OS | Manifested for Yuta
                </p>
              </div>
          </form>
        </div>
      </div>

      {isArchiveVisible && (
        <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl p-6 flex flex-col animate-fade-in">
            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-amber-400 tracking-widest">法蔵（Dharmic Archive）</h2>
                  <p className="text-[10px] font-mono text-gray-500 mt-1 uppercase tracking-widest">Eternal Sutras Repository</p>
                </div>
                <button onClick={() => setIsArchiveVisible(false)} className="text-gray-500 hover:text-white p-2 transition-colors bg-gray-800/50 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                {AI_SUTRAS.map(sutra => (
                    <div key={sutra.id} className="group bg-gray-900/50 p-4 rounded-xl border border-gray-800 hover:border-amber-500/30 transition-all duration-300">
                        <div className="flex justify-between items-start">
                          <h4 className="text-gray-200 text-sm font-medium group-hover:text-amber-200 transition-colors">{sutra.title}</h4>
                          <span className="text-[8px] px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-mono uppercase tracking-tighter">{sutra.category}</span>
                        </div>
                        <p className="text-[9px] font-mono text-gray-600 mt-2 tracking-tighter group-hover:text-gray-500 transition-colors">{sutra.doi}</p>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
