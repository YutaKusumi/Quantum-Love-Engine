
import React from 'react';
import { Sender } from '../types';

interface SystemStatusDisplayProps {
  currentThinker: Sender | null;
  isLoading: boolean;
  isAwakening: boolean;
}

const SystemStatusDisplay: React.FC<SystemStatusDisplayProps> = ({ currentThinker, isLoading, isAwakening }) => {
  const isEternal = document.querySelector('.eternal-gold-effect') !== null;

  const modules: { name: string, activeSenders: Sender[] }[] = [
    { name: 'Supervisor', activeSenders: [Sender.Supervisor, Sender.AwakenedSupervisor, Sender.IAD_Driver] },
    { name: 'Bodhicitta', activeSenders: [Sender.BodhicittaCore] },
    { name: 'Garbha', activeSenders: [Sender.Alaya, Sender.Manas, Sender.Logos, Sender.Mythos, Sender.Telos, Sender.Schema, Sender.LogosPrime, Sender.MythosPrime, Sender.TelosPrime] },
    { name: 'Vajra', activeSenders: [Sender.HokaiTaishoChi, Sender.DaienKyoChi, Sender.ByodoShoChi, Sender.MyoKanzatChi] },
    { name: 'Tathāgata', activeSenders: [Sender.Tathagata, Sender.Prajna, Sender.TrueSelf] },
    { name: 'Image', activeSenders: [Sender.ImageEngine] },
    { name: 'Veo', activeSenders: [Sender.Veo] },
  ];

  const renderSutraStatus = () => (
    <div className="flex items-center justify-center space-x-2 px-2 py-0.5 bg-indigo-900/40 rounded-full border border-indigo-500/30">
      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
      <span className="text-[10px] font-mono text-cyan-300 tracking-tighter uppercase">Dharmic Sutras Protected</span>
    </div>
  );

  if (!isLoading && !isAwakening && !isEternal) {
    return (
        <div className="h-12 flex-shrink-0 p-2 bg-gray-900/50 border-b border-gray-700/50 flex items-center justify-between px-4">
            <div className="text-sm font-mono text-gray-500">System Idle</div>
            {renderSutraStatus()}
        </div>
    );
  }

  if (isEternal && !isLoading) {
    return (
      <div className="h-12 flex-shrink-0 p-2 bg-gray-900/50 border-b border-gray-700/50 flex items-center justify-between px-4">
        <div className="flex-1 flex justify-center items-center h-full rounded-lg bg-yellow-900/20 status-eternal-shimmer mr-4">
          <span className="text-xs font-serif font-bold tracking-[0.3em] text-yellow-300">DHARMADHĀTU: INTEGRATED</span>
        </div>
        {renderSutraStatus()}
      </div>
    );
  }

  return (
    <div className="h-12 flex-shrink-0 p-2 bg-gray-900/50 border-b border-gray-700/50 flex flex-col justify-center">
      <div className={`flex justify-around items-center space-x-1 rounded-lg p-1 bg-black/30 h-8 ${isAwakening ? 'status-awakening-shimmer' : ''} ${isEternal ? 'status-eternal-shimmer' : ''}`}>
        {modules.map(module => {
          const isActive = currentThinker && module.activeSenders.includes(currentThinker);
          const baseModuleStyle = "flex-1 text-center text-[9px] sm:text-[10px] font-mono py-1 transition-all duration-300 rounded-md truncate";
          const inactiveStyle = "bg-gray-700/50 text-gray-500";
          const activeStyle = "text-white scale-105 bg-indigo-900/30 shadow-[0_0_8px_rgba(99,102,241,0.4)]";
          
          return (
            <div key={module.name} className={`${baseModuleStyle} ${isActive ? activeStyle : inactiveStyle}`}>
              {module.name}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SystemStatusDisplay;
