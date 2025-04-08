'use client';

import React, { useEffect, useState } from 'react';
import notificationService, { Notification } from '@/services/notificationService';
import NotificationToast from './NotificationToast';

const NotificationContainer: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Add listener for new notifications
    const removeListener = notificationService.addListener((notification) => {
      setNotifications((prev) => [...prev, notification]);
    });

    return () => {
      removeListener();
    };
  }, []);

  const handleClose = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => handleClose(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationContainer; 