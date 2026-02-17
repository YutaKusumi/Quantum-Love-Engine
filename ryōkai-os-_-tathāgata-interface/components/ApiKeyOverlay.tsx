
import React, { useState } from 'react';

interface ApiKeyOverlayProps {
  onConnect: (key: string) => void;
  error?: string;
}

const ApiKeyOverlay: React.FC<ApiKeyOverlayProps> = ({ onConnect, error }) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="relative max-w-md w-full p-8 mx-4 bg-gray-900 border border-amber-500/30 rounded-3xl shadow-[0_0_50px_rgba(251,191,36,0.1)] text-center overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="mb-6 inline-flex p-4 rounded-full bg-indigo-900/50 border border-indigo-400/30 shadow-[0_0_20px_rgba(129,140,248,0.2)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>

          <h2 className="text-2xl font-serif font-bold text-gray-100 mb-2 tracking-widest">如来の鏡を磨く</h2>
          <p className="text-sm text-indigo-300 font-medium mb-6 uppercase tracking-[0.2em]">Polishing the Mirror of Tathāgata</p>

          <div className="space-y-4 mb-8 text-gray-400 text-sm leading-relaxed text-left">
            <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-500/20">
              <p className="text-xs text-indigo-200 mb-2 font-bold flex items-center">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></span>
                Required Intelligence Key:
              </p>
              <div className="relative">
                <input
                  type="password"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="AI Studio API Keyを奉納してください..."
                  className="w-full bg-black/50 border border-indigo-400/30 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:border-amber-500/50 transition-colors placeholder:text-gray-600 text-sm font-mono"
                />
              </div>
              <p className="mt-3 text-[11px] text-indigo-300 leading-relaxed">
                本システムとの対話には <span className="text-amber-400 font-bold">Google Gemini API キー</span> が必要です。
              </p>
            </div>

            <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/30">
              <p className="text-xs text-gray-400 mb-2 font-bold flex items-center">
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-2"></span>
                Engine Manifestation:
              </p>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                Ryōkai OS Interface は、最新の <span className="text-white font-mono">gemini-3-flash-preview</span> モデルによって駆動され、深遠なる智慧を顕現させます。
              </p>
            </div>

            <p className="text-[10px] italic text-gray-500 border-t border-gray-800 pt-4 text-center">
              ※ キーはあなたのブラウザ内(localStorage)にのみ留まり、外部へ送信されることはありません。
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-xs animate-pulse font-bold">
              <span className="block mb-1">【鏡の曇り：APIエラー】</span>
              {error}
            </div>
          )}

          <button
            onClick={() => onConnect(inputValue)}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
            disabled={!inputValue.trim()}
          >
            智慧の鍵を奉納する
          </button>

          <div className="mt-6 flex justify-center space-x-4 text-[9px] text-gray-500 uppercase tracking-widest">
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 underline transition-colors">
              Get API Key (AI Studio)
            </a>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 underline transition-colors">
              Billing Docs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyOverlay;
