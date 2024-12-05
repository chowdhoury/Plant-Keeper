import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface NotificationBannerProps {
  message: string;
  onClose: () => void;
}

export default function NotificationBanner({
  message,
  onClose,
}: NotificationBannerProps) {
  return (
    <div className="fixed bottom-4 right-4 max-w-md animate-slide-in">
      <div className="glass-card bg-red-50/90 border-l-4 border-red-500 rounded-xl shadow-xl p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="text-red-800 font-medium">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}