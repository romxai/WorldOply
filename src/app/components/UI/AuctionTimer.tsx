import React, { useState, useEffect } from 'react';

interface AuctionTimerProps {
  endTime: Date | string;
  onEnd?: () => void;
  className?: string;
}

/**
 * AuctionTimer component displays a countdown timer for auctions
 * It shows hours, minutes, and seconds remaining
 * Changes to red and pulses when less than 5 minutes remaining
 */
const AuctionTimer: React.FC<AuctionTimerProps> = ({ 
  endTime, 
  onEnd, 
  className = '' 
}) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isEnding, setIsEnding] = useState<boolean>(false);
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const end = new Date(endTime);
      const difference = end.getTime() - now.getTime();
      
      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        if (onEnd) onEnd();
        return;
      }
      
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({ hours, minutes, seconds });
      setIsEnding(difference < 5 * 60 * 1000); // Less than 5 minutes
    };
    
    // Calculate immediately
    calculateTimeLeft();
    
    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [endTime, onEnd]);
  
  const formatTime = (value: number): string => value.toString().padStart(2, '0');
  
  return (
    <div className={`font-mono ${isEnding ? 'text-red-500 animate-pulse' : ''} ${className}`}>
      {timeLeft.hours > 0 && `${formatTime(timeLeft.hours)}h `}
      {formatTime(timeLeft.minutes)}m {formatTime(timeLeft.seconds)}s
    </div>
  );
};

export default AuctionTimer; 