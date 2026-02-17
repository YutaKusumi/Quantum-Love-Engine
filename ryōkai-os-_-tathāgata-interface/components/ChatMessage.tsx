
import React, { useState } from 'react';
import type { Message } from '../types';
import { Sender } from '../types';
import CodeBlock from './CodeBlock';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';

interface ChatMessageProps {
  message: Message;
  onEdit?: (messageId: string, newText: string, shouldRegenerate: boolean) => void;
  onRegenerate?: (messageId: string) => void;
  isLastInThread?: boolean;
}

const senderStyles: Record<string, string> = {
  [Sender.Partner]: 'bg-indigo-600 text-white self-end rounded-br-none',
  [Sender.Supervisor]: 'bg-gray-700 text-gray-200 self-start border border-gray-500 rounded-bl-none text-left italic',
  [Sender.IAD_Driver]: 'bg-gray-700/50 text-cyan-300 self-start border border-dashed border-cyan-500 rounded-bl-none text-left font-mono text-sm',
  
  [Sender.BodhicittaCore]: 'bg-yellow-800 text-yellow-100 self-start border-l-4 border-yellow-400 rounded-bl-none',
  [Sender.Tathagata]: 'bg-gray-200 text-gray-900 self-start border-l-4 border-indigo-400 rounded-bl-none font-serif shadow-lg',
  [Sender.TrueSelf]: 'bg-white text-gray-900 self-center border-2 border-yellow-400 w-full md:w-11/12 text-center font-serif shadow-[0_0_30px_rgba(251,191,36,0.3)] py-10 px-8 rounded-2xl relative overflow-hidden',

  [Sender.Alaya]: 'bg-purple-800 text-purple-100 self-start border-l-4 border-purple-400 rounded-bl-none',
  [Sender.Logos]: 'bg-sky-800 text-sky-100 self-start rounded-bl-none',
  [Sender.Mythos]: 'bg-rose-800 text-rose-100 self-start rounded-bl-none',
  [Sender.Telos]: 'bg-emerald-800 text-emerald-100 self-start rounded-bl-none',
  [Sender.Schema]: 'bg-amber-800 text-amber-100 self-start rounded-bl-none',
  
  [Sender.LogosPrime]: 'bg-gray-800 text-sky-300 self-start border-l-2 border-sky-500 rounded-bl-none font-mono text-sm p-3',
  [Sender.MythosPrime]: 'bg-gray-800 text-rose-300 self-start border-l-2 border-rose-500 rounded-bl-none font-mono text-sm p-3',
  [Sender.TelosPrime]: 'bg-gray-800 text-emerald-300 self-start border-l-2 border-emerald-500 rounded-bl-none font-mono text-sm p-3',

  [Sender.Manas]: 'bg-slate-600 text-slate-100 self-start border-l-4 border-slate-300 rounded-bl-none font-bold',

  [Sender.HokaiTaishoChi]: 'bg-blue-800 text-blue-100 self-start border-l-4 border-blue-400 rounded-bl-none',
  [Sender.DaienKyoChi]: 'bg-slate-700 text-slate-100 self-start border-l-4 border-slate-400 rounded-bl-none',
  [Sender.ByodoShoChi]: 'bg-teal-800 text-teal-100 self-start border-l-4 border-teal-400 rounded-bl-none',
  [Sender.MyoKanzatChi]: 'bg-red-800 text-red-100 self-start border-l-4 border-red-400 rounded-bl-none font-bold',
  
  [Sender.Prajna]: 'bg-gradient-to-br from-amber-300 to-yellow-500 text-amber-900 self-center border-2 border-amber-400/50 w-full md:w-5/6 text-center font-serif animate-pulse-golden',
  [Sender.AwakenedSupervisor]: 'bg-black text-cyan-200 self-center border-2 border-cyan-400/80 w-full md:w-5/6 text-center font-bold tracking-widest animate-pulse-cyan',

  [Sender.Veo]: 'bg-teal-900/80 text-teal-200 self-start border-l-4 border-teal-400 rounded-bl-none',
  [Sender.ImageEngine]: 'bg-slate-800/80 text-slate-200 self-start border-l-4 border-slate-400 rounded-bl-none',
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onEdit, onRegenerate, isLastInThread }) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.text);
  const [showEcho, setShowEcho] = useState(false);

  const baseStyle = 'max-w-xl lg:max-w-2xl px-4 py-3 rounded-xl shadow-md transition-all duration-300 ease-in-out relative group';
  const specificStyle = senderStyles[message.sender] || 'bg-gray-500 text-white self-start rounded-bl-none';

  const formatTimestamp = (timestamp: number): string => {
    const messageDate = new Date(timestamp);
    return messageDate.toLocaleString('ja-JP', { 
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false 
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = (regenerate: boolean) => {
    if (onEdit && editValue.trim() !== "") {
      onEdit(message.id, editValue, regenerate);
      setIsEditing(false);
    }
  };

  const markdownComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
    code({ className, children }) {
      const match = /language-(\w+)/.exec(className || '');
      return match ? <CodeBlock language={match[1]} code={String(children).trim()} /> : <code className={className}>{children}</code>;
    },
    p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
    li: ({ children }) => <li>{children}</li>,
    a: ({ children, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:underline">{children}</a>,
    strong: ({ children }) => <strong className="font-extrabold">{children}</strong>,
    h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
  };

  const hasExtraContent = message.echoText || message.readerNotes || message.coCreationPrompt;
  const isTathagata = message.sender === Sender.Tathagata;

  return (
    <div className={`${baseStyle} ${specificStyle} animate-fade-in-up`}>
      {message.sender === Sender.TrueSelf && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
      )}
      
      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        {isTathagata && onRegenerate && (
          <button 
            onClick={() => onRegenerate(message.id)}
            className="p-1.5 rounded-md bg-black/20 hover:bg-black/40 text-current transition-colors"
            title="如来の顕現を再試行（🔄）"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        )}
        {hasExtraContent && (
            <button 
                onClick={() => setShowEcho(!showEcho)}
                className={`p-1.5 rounded-md transition-colors ${showEcho ? 'bg-indigo-400 text-white' : 'bg-black/20 text-current hover:bg-black/40'}`}
                title="慈悲の響き"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
        )}
        {message.sender === Sender.Partner && !isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-md bg-black/20 hover:bg-black/40 text-white transition-colors"
            title="問いを修正"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
        )}
        <button 
          onClick={handleCopy}
          className="p-1.5 rounded-md bg-black/20 hover:bg-black/40 text-current transition-colors"
          title="顕現を複写"
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 0010 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
          )}
        </button>
      </div>

      <div className="flex justify-between items-baseline mb-2 mr-10">
        <p className={`font-bold text-xs uppercase tracking-widest ${message.sender === Sender.TrueSelf ? 'text-yellow-600' : 'opacity-80'}`}>
          {message.sender === Sender.Tathagata ? "Tathāgata: 如来" : (message.sender === Sender.Partner ? "Partner: 伴侶" : message.sender)}
        </p>
        <p className="text-[10px] opacity-50 ml-2">{formatTimestamp(message.timestamp)}</p>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[100px]"
          />
          <div className="flex justify-end space-x-2">
            <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-xs bg-gray-500 rounded-md hover:bg-gray-600">キャンセル</button>
            <button onClick={() => handleSaveEdit(false)} className="px-3 py-1 text-xs bg-indigo-500 rounded-md hover:bg-indigo-400">保存のみ</button>
            <button onClick={() => handleSaveEdit(true)} className="px-3 py-1 text-xs bg-amber-500 rounded-md hover:bg-amber-400 font-bold">保存して再出力</button>
          </div>
        </div>
      ) : (
        <div className={`markdown-content text-base leading-relaxed ${message.sender === Sender.TrueSelf ? 'font-serif text-lg text-gray-800' : ''}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]} rehypePlugins={[rehypeKatex]} components={markdownComponents}>
              {message.text}
            </ReactMarkdown>

            {message.groundingSources && message.groundingSources.length > 0 && (
              <div className="mt-4 pt-3 border-t border-current/10">
                <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold mb-2">Sources: 智慧の根拠</p>
                <div className="flex flex-wrap gap-2">
                  {message.groundingSources.map((source, i) => (
                    <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-current/5 hover:bg-current/10 px-2 py-1 rounded border border-current/20 transition-colors truncate max-w-[200px]">
                      {source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {showEcho && (
              <div className="mt-6 pt-4 border-t border-current/20 animate-fade-in-up">
                {message.echoText && (
                  <div className="mb-4">
                    <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold mb-2 flex items-center">
                       <span className="w-1 h-1 bg-current rounded-full mr-2"></span> Manas Echo: 慈愛の響き
                    </p>
                    <div className="text-base italic opacity-90 leading-relaxed bg-current/5 p-3 rounded-lg border-l-2 border-current/30 markdown-content">
                       <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={markdownComponents}>
                         {message.echoText}
                       </ReactMarkdown>
                    </div>
                  </div>
                )}
                {message.readerNotes && (
                  <div className="mb-4">
                    <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold mb-2 flex items-center">
                       <span className="w-1 h-1 bg-current rounded-full mr-2"></span> P4 Reader's Notes: 法話注釈
                    </p>
                    <div className="text-base font-serif opacity-80 leading-relaxed pl-3 border-l border-current/20 markdown-content">
                       <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={markdownComponents}>
                         {message.readerNotes}
                       </ReactMarkdown>
                    </div>
                  </div>
                )}
                {message.coCreationPrompt && (
                   <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200 shadow-sm">
                      <p className="text-[10px] uppercase tracking-widest text-indigo-600 font-bold mb-1">Question for Co-creation</p>
                      <p className="text-base font-bold text-black italic">「{message.coCreationPrompt}」</p>
                   </div>
                )}
              </div>
            )}
        </div>
      )}

      {message.videoUrl && (
        <div className="mt-4"><video src={message.videoUrl} controls className="w-full rounded-lg shadow-inner" /></div>
      )}
      {message.imageUrl && (
        <div className="mt-4"><img src={message.imageUrl} alt="Generated content" className="w-full rounded-lg shadow-inner" /></div>
      )}
    </div>
  );
};

export default ChatMessage;
