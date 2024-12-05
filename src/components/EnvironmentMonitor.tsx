import React from 'react';
import { Thermometer, Droplets } from 'lucide-react';

interface EnvironmentMonitorProps {
  temperature: number;
  humidity: number;
}

function CircularProgress({ value, max, color, size = 120 }: {
  value: number;
  max: number;
  color: string;
  size?: number;
}) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / max) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        className="opacity-20"
        stroke={color}
        fill="none"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        className="progress-ring"
        stroke={color}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
    </svg>
  );
}

export default function EnvironmentMonitor({ temperature, humidity }: EnvironmentMonitorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="glass-card rounded-2xl shadow-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl"></div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Thermometer className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-700">Temperature</h3>
          </div>
        </div>
        <div className="flex items-center justify-center relative">
          <div className="absolute">
            <span className="text-4xl font-bold text-gray-900">{temperature.toFixed(1)}</span>
            <span className="text-xl text-gray-600">°C</span>
          </div>
          <CircularProgress value={temperature} max={50} color="#ef4444" />
        </div>
      </div>

      <div className="glass-card rounded-2xl shadow-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Droplets className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-700">Humidity</h3>
          </div>
        </div>
        <div className="flex items-center justify-center relative">
          <div className="absolute">
            <span className="text-4xl font-bold text-gray-900">{humidity.toFixed(1)}</span>
            <span className="text-xl text-gray-600">%</span>
          </div>
          <CircularProgress value={humidity} max={100} color="#3b82f6" />
        </div>
      </div>
    </div>
  );
}