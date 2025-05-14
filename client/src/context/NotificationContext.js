import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import config from '../config';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useContext(AuthContext);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch unread count
      const countRes = await axios.get(`${config.API_URL}/api/notifications/unread/count`, {
        headers: { 'x-auth-token': token }
      });
      
      setUnreadCount(countRes.data.count);
      
      // Fetch notifications
      const notificationsRes = await axios.get(`${config.API_URL}/api/notifications`, {
        headers: { 'x-auth-token': token }
      });
      
      setNotifications(notificationsRes.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`${config.API_URL}/api/notifications/${notificationId}/read`, {}, {
        headers: { 'x-auth-token': token }
      });
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`${config.API_URL}/api/notifications/read-all`, {}, {
        headers: { 'x-auth-token': token }
      });
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      // Update unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Format notification date
  const formatNotificationDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'À l\'instant';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  // Load notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      
      // Refresh notifications periodically
      const interval = setInterval(fetchNotifications, 60000); // every minute
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        formatNotificationDate
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider; 