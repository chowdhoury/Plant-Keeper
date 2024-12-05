import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import app from '../firebase-config';

interface TimerControlProps {
  selectedHours: number;
  onTimerChange: (hours: number) => void;
  visible: boolean;
  onMotorsOn: () => void; // Function to turn on motors
  offMotors: () => void; // Function to turn off motors
}

export default function TimerControl({
  selectedHours,
  onTimerChange,
  visible,
  onMotorsOn,
  offMotors,
}: TimerControlProps) {
  const [countdown, setCountdown] = useState<number>(selectedHours * 3600); // Countdown in seconds
  const [isCounting, setIsCounting] = useState<boolean>(false);

  const db = getDatabase(app);
  const timerRef = ref(db, 'timer');
  const countingRef = ref(db, 'isCounting');

  // Restore timer state from Firebase on component mount
  useEffect(() => {
    const unsubscribe = onValue(timerRef, (snapshot) => {
      if (snapshot.exists()) {
        setCountdown(snapshot.val()); // Restore countdown value
      }
    });

    const countingUnsub = onValue(countingRef, (snapshot) => {
      if (snapshot.exists()) {
        setIsCounting(snapshot.val()); // Restore counting state
      }
    });

    return () => {
      unsubscribe();
      countingUnsub();
    };
  }, []);

  // Start the countdown logic
  useEffect(() => {
    if (isCounting && countdown > 0) {
      const intervalId = setInterval(() => {
        setCountdown((prev) => prev - 1);
  
        // Sync the countdown value back to Firebase
        const db = getDatabase(app);
        set(ref(db, 'timer'), countdown - 1);
      }, 1000);
  
      return () => clearInterval(intervalId); // Cleanup on unmount or when countdown stops
    }
  
    // Handle when the countdown reaches zero
    if (isCounting && countdown === 0) {
      const db = getDatabase(app);
  
      // Check condition for turning on motors
      onMotorsOn(); // Call your motor control logic
      console.log('Motors turned on.');
  
      // Reset the timer for the next interval
      setCountdown(selectedHours * 3600); // Reset to initial countdown
      set(ref(db, 'timer'), selectedHours * 3600); // Update Firebase with the reset value
  
      console.log('Timer reset for the next interval.');
    }
  }, [countdown, isCounting, selectedHours, onMotorsOn]);
  

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!visible) return null;

  return (
    <div className="glass-card rounded-2xl shadow-xl p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Clock className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="flex items-center justify-between flex-grow">
          <h3 className="text-lg font-medium text-gray-700">Timer Control</h3>
          <span className="text-gray-400">
            <span className="text-gray-700 font-bold me-2">{formatTime(countdown)}</span> 
            hours to turn on the motors
          </span>
        </div>
      </div>
      <div className="relative">
        <select
          value={selectedHours}
          onChange={(e) => {
            const newHours = Number(e.target.value);
            onTimerChange(newHours);
            offMotors();
            const newCountdown = newHours * 3600;
            setCountdown(newCountdown); // Reset countdown
            setIsCounting(true); // Start countdown
            set(timerRef, newCountdown); // Sync countdown to Firebase
            set(countingRef, true); // Sync counting state to Firebase
          }}
          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
        >
          {Array.from({ length: 24 }, (_, i) => i + 1).map((hours) => (
            <option key={hours} value={hours}>
              {hours} {hours === 1 ? 'Hour' : 'Hours'}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <div className="border-t-2 border-r-2 border-gray-400 w-2 h-2 transform rotate-45 translate-y-[-4px]"></div>
        </div>
      </div>
    </div>
  );
}
