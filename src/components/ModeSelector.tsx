import React from 'react';
import { Settings2, Hand, Bot, Clock } from 'lucide-react';

type Mode = 'Manual' | 'Auto' | 'Timer';

interface ModeSelectorProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
}

const modeIcons = {
  Manual: Hand,
  Auto: Bot,
  Timer: Clock,
};

export default function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  const modes: Mode[] = ['Manual', 'Auto', 'Timer'];

  return (
    <div className="glass-card rounded-2xl shadow-xl p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Settings2 className="w-6 h-6 text-indigo-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Operation Mode</h2>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {modes.map((mode) => {
          const Icon = modeIcons[mode];
          const isActive = currentMode === mode;          
          
          return (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={`flex flex-col items-center gap-3 py-4 px-6 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg scale-105'
                  : 'hover:bg-indigo-50 text-gray-600'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-indigo-500'}`} />
              <span className="font-medium">{mode}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}