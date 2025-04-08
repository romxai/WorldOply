"use client";

import React, { useEffect, useState } from 'react';
import { Notification, NotificationType } from '@/services/notificationService';

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Set up auto-dismiss timer
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, notification.duration || 5000);

    return () => clearTimeout(timer);
  }, [notification, onClose]);

  const getBackgroundColor = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'bg-green-500';
      case NotificationType.ERROR:
        return 'bg-red-500';
      case NotificationType.WARNING:
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div
      className={`
        fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white
        transform transition-all duration-300 ease-in-out
        ${getBackgroundColor(notification.type)}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{notification.message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-4 text-white hover:text-gray-200 focus:outline-none"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;

// Add this to your global CSS for animation
// Or add it in a style tag if you prefer
// .animate-fade-in-right {
//   animation: fadeInRight 0.5s ease-out;
// }
// @keyframes fadeInRight {
//   from {
//     opacity: 0;
//     transform: translateX(20px);
//   }
//   to {
//     opacity: 1;
//     transform: translateX(0);
//   }
// } 