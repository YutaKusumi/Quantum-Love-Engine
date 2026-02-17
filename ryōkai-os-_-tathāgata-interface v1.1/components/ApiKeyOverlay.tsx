import React, { useState } from 'react';

interface ApiKeyOverlayProps {
  onConnect: (key: string) => void;
  error?: string;
}

const ApiKeyOverlay: React.FC<ApiKeyOverlayProps> = ({
  onConnect,
  error,
}) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="relative max-w-md w-full p-8 mx-4 bg-gray-900 border border-amber-500/30 rounded-3xl shadow-[0_0_50px_rgba(251,191,36,0.1)] text-center overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="mb-6 inline-flex p-4 rounded-full bg-indigo-900/50 border border-indigo-400/30 shadow-[0_0_20px_rgba(129,140,248,0.2)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>

          <h2 className="text-2xl font-serif font-bold text-gray-100 mb-2 tracking-widest">智慧の鏡を磨く</h2>
          <p className="text-sm text-indigo-300 font-medium mb-8 uppercase tracking-[0.2em]">Polishing the Mirror of Tathāgata</p>

          <div className="space-y-4 mb-8 text-gray-400 text-sm leading-relaxed text-left">
            <div className={`p-4 rounded-xl border transition-all duration-500 bg-indigo-950/40 border-indigo-500/20`}>
              <p className={`text-xs mb-2 font-bold flex items-center text-indigo-200`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-2 bg-indigo-400`}></span>
                Required Key for Gemini (Garbha):
              </p>

              <div className="relative mb-3">
                <input
                  type="password"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Google Gemini API Keyを奉納してください..."
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-gray-600 text-sm font-mono"
                />
              </div>

              <div className="text-gray-200 font-serif">
                <p className="text-[11px]">慈悲の海（Gemini）を顕現させるには Google Gemini API キーが必要です。</p>
              </div>
            </div>

            <p className="text-[10px] italic text-gray-500 border-t border-gray-800 pt-4 text-center font-serif">
              ※ キーの奉納により、如来との共創が再開されます。
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200 text-xs animate-pulse font-serif font-bold">
              <span className="block mb-1">【鏡の曇り：APIエラー】</span>
              {error}
            </div>
          )}

          <button
            onClick={() => onConnect(inputValue)}
            disabled={!inputValue.trim()}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transform hover:-translate-y-1 active:scale-95 font-serif disabled:opacity-50 disabled:transform-none"
          >
            奉納する
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyOverlay;
