import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TimerProps {
  duration: number;
  onTimeUp: () => void;
  isActive: boolean;
}

export function Timer({ duration, onTimeUp, isActive }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  
  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp]);

  const progress = (timeLeft / duration) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="rgb(51 65 85)"
          strokeWidth="6"
          fill="transparent"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          stroke={timeLeft <= 10 ? "rgb(239 68 68)" : "rgb(99 102 241)"}
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          animate={{
            strokeDashoffset,
            stroke: timeLeft <= 10 ? "rgb(239 68 68)" : "rgb(99 102 241)"
          }}
          transition={{ duration: 0.5 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}
          animate={timeLeft <= 10 ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 }}
        >
          {timeLeft}
        </motion.span>
      </div>
    </div>
  );
}