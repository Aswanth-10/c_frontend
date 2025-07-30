import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification } from '../types';
import { notificationsAPI } from '../services/api';
import websocketService from '../services/websocket';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial notifications
    loadNotifications();

    // Subscribe to WebSocket notifications
    const unsubscribeNotification = websocketService.subscribe('notification', (data) => {
      const newNotification: Notification = {
        id: Date.now(), // Temporary ID
        notification_type: data.notification_type,
        title: data.title,
        message: data.message,
        is_read: false,
        created_at: new Date().toISOString(),
        data: data.data || {}
      };
      
      addNotification(newNotification);
    });

    const unsubscribeNotificationCount = websocketService.subscribe('notification_count', (data) => {
      setUnreadCount(data.unread_count);
    });

    const unsubscribeNewResponse = websocketService.subscribe('new_response', (data) => {
      const newNotification: Notification = {
        id: Date.now(),
        notification_type: 'new_response',
        title: 'New Response Received',
        message: `New response received for "${data.form_title}"`,
        is_read: false,
        created_at: new Date().toISOString(),
        data: {
          form_id: data.form_id,
          response_id: data.response_id,
          form_title: data.form_title
        }
      };
      
      addNotification(newNotification);
    });

    return () => {
      unsubscribeNotification();
      unsubscribeNotificationCount();
      unsubscribeNewResponse();
    };
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const [notificationsData, unreadCountData] = await Promise.all([
        notificationsAPI.getNotifications(),
        notificationsAPI.getUnreadCount()
      ]);
      
      setNotifications(notificationsData);
      setUnreadCount(unreadCountData.unread_count);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationsAPI.markAsRead(id);
      
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, is_read: true }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Also send via WebSocket
      websocketService.markNotificationAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      
      setUnreadCount(0);
      
      // Also send via WebSocket
      websocketService.markAllNotificationsAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    loading,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 