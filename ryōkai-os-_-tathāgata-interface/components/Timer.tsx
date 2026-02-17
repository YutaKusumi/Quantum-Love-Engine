import React, { useState, useEffect, useRef } from 'react';

interface TimerProps {
  onComplete: () => void;
}

const Timer: React.FC<TimerProps> = ({ onComplete }) => {
  const [minutes, setMinutes] = useState('5');
  const [seconds, setSeconds] = useState('0');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = window.setInterval(() => {
        setRemainingSeconds((prev) => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused]);

  useEffect(() => {
    if (remainingSeconds <= 0 && isActive) {
      setIsActive(false);
      setIsPaused(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      onComplete();
    }
  }, [remainingSeconds, isActive, onComplete]);

  const handleStart = () => {
    const total = parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
    if (total > 0) {
      setRemainingSeconds(total);
      setIsActive(true);
      setIsPaused(false);
    }
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    const total = parseInt(minutes, 10) * 60 + parseInt(seconds, 10);
    setRemainingSeconds(total > 0 ? total : 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && parseInt(value, 10) < 60 || value === '') {
        setter(value);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  const isInputDisabled = isActive || isPaused;

  return (
    <div className="bg-gray-800/80 p-3 rounded-b-lg border-t border-gray-700 flex items-center justify-between text-white font-mono">
      <div className="flex items-center space-x-2">
        <span className="text-gray-400 text-sm">Set Time:</span>
        <input
          type="number"
          value={minutes}
          onChange={(e) => handleInputChange(e, setMinutes)}
          disabled={isInputDisabled}
          className="w-12 bg-gray-700 text-center rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Minutes"
        />
        <span className="font-bold">:</span>
        <input
          type="number"
          value={seconds}
          onChange={(e) => handleInputChange(e, setSeconds)}
          disabled={isInputDisabled}
          className="w-12 bg-gray-700 text-center rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Seconds"
        />
      </div>

      <div className="text-2xl font-bold text-cyan-300">
        {formatTime(remainingSeconds)}
      </div>

      <div className="flex items-center space-x-2">
        {!isActive ? (
          <button onClick={handleStart} className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-md text-sm transition-colors">Start</button>
        ) : (
          <button onClick={handlePauseResume} className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 rounded-md text-sm transition-colors">{isPaused ? 'Resume' : 'Pause'}</button>
        )}
        <button onClick={handleReset} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm transition-colors">Reset</button>
      </div>
    </div>
  );
};

export default Timer;