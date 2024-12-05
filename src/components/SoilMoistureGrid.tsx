import React from 'react';
import { Sprout, AlertTriangle } from 'lucide-react';

interface SoilMoistureGridProps {
  moistureLevels: number[];
}

export default function SoilMoistureGrid({ moistureLevels }: SoilMoistureGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {moistureLevels.map((level, index) => {
        const isLow = level < 20;
        const getStatusColor = (level: number) => {
          if (level < 20) return 'red';
          if (level < 40) return 'yellow';
          return 'green';
        };
        const color = getStatusColor(level);

        return (
          <div
            key={index}
            className={`glass-card rounded-2xl shadow-xl p-6 relative overflow-hidden transition-all duration-300 ${
              isLow ? 'ring-2 ring-red-500 animate-pulse-slow' : ''
            }`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 rounded-full blur-2xl`}></div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 bg-${color}-100 rounded-lg`}>
                  <Sprout className={`w-5 h-5 text-${color}-500`} />
                </div>
                <h3 className="text-lg font-medium text-gray-700">Plant {index + 1}</h3>
              </div>
            </div>
            
            <div className="relative pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Moisture Level</span>
                <span className={`text-sm font-medium text-${color}-500`}>
                  {level.toFixed(2)}%
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 bg-${color}-500`}
                  style={{ width: `${level}%` }}
                />
              </div>
              
              {isLow && (
                <div className="mt-4 flex items-center gap-2 text-red-500">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Low moisture!</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
