import React from 'react';
import { Power } from 'lucide-react';

interface MotorControlsProps {
  motorStates: boolean[];
  onToggleMotor: (index: number) => void;
  isManualMode: boolean;
}

export default function MotorControls({
  motorStates,
  onToggleMotor,
  isManualMode,
}: MotorControlsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {motorStates.map((isOn, index) => (
        <div key={index} className="glass-card rounded-2xl shadow-xl p-6">
          <div className="flex flex-col items-center gap-6">
            <h3 className="text-lg font-medium text-gray-700">Motor {index + 1}</h3>
            <button
              onClick={() => isManualMode && onToggleMotor(index)}
              disabled={!isManualMode}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                isOn
                  ? 'bg-green-500 text-white shadow-lg scale-105'
                  : 'bg-gray-200 text-gray-600'
              } ${
                isManualMode
                  ? 'hover:bg-green-600 cursor-pointer hover:scale-110'
                  : 'cursor-not-allowed opacity-75'
              }`}
            >
              <Power className="w-10 h-10" />
            </button>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isOn ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
              <span
                className={`font-medium ${
                  isOn ? 'text-green-600' : 'text-gray-600'
                }`}
              >
                {isOn ? 'RUNNING' : 'STOPPED'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}