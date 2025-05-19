import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import config from '../config';

export const NotificationContext = createContext();

// Maximum number of notifications to show in the UI
const MAX_NOTIFICATIONS_DISPLAY = 50;
// Notification polling interval in milliseconds (1 minute)
const NOTIFICATION_POLL_INTERVAL = 60000;
// Maximum age of notifications to keep (30 days in milliseconds)
const MAX_NOTIFICATION_AGE = 30 * 24 * 60 * 60 * 1000;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const { isAuthenticated, user } = useContext(AuthContext);
  const abortControllerRef = useRef(null);
  const pollIntervalRef = useRef(null);

  // Determine if we should auto-clean old notifications
  const shouldCleanupOldNotifications = () => {
    const lastCleanup = localStorage.getItem('lastNotificationCleanup');
    if (!lastCleanup) return true;
    
    const daysSinceLastCleanup = (Date.now() - parseInt(lastCleanup)) / (24 * 60 * 60 * 1000);
    return daysSinceLastCleanup >= 7; // Clean up once a week
  };

  // Cleanup old notifications
  const cleanupOldNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      const token = localStorage.getItem('token');
      const currentDate = new Date();
      const cutoffDate = new Date(currentDate.getTime() - MAX_NOTIFICATION_AGE);
      
      await axios.delete(`${config.API_URL}/api/notifications/cleanup`, {
        headers: { 'x-auth-token': token },
        data: { cutoffDate: cutoffDate.toISOString() }
      });
      
      // Update local storage with current timestamp
      localStorage.setItem('lastNotificationCleanup', Date.now().toString());
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
    }
  }, [isAuthenticated, user]);

  // Fetch notifications with pagination - optimized loading pattern
  const fetchNotifications = useCallback(async (pageNum = 1, limit = MAX_NOTIFICATIONS_DISPLAY, shouldReplace = true) => {
    if (!isAuthenticated || !user) return;
    
    try {
      // Cancel any in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create a new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setIsFetchingMore(true);
      }
      
      const token = localStorage.getItem('token');
      
      // Fetch unread count in parallel with notifications
      const [countRes, notificationsRes] = await Promise.all([
        axios.get(`${config.API_URL}/api/notifications/unread/count`, {
          headers: { 'x-auth-token': token },
          signal: abortControllerRef.current.signal
        }),
        
        axios.get(`${config.API_URL}/api/notifications`, {
          params: { page: pageNum, limit },
          headers: { 'x-auth-token': token },
          signal: abortControllerRef.current.signal
        })
      ]);
      
      setUnreadCount(countRes.data.count);
      
      // Check if we have more notifications to load
      setHasMore(notificationsRes.data.length === limit);
      
      // Update the notifications list
      if (shouldReplace) {
        setNotifications(notificationsRes.data);
      } else {
        // Merge new notifications and remove duplicates (if any)
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n._id));
          const newNotifications = notificationsRes.data.filter(n => !existingIds.has(n._id));
          return [...prev, ...newNotifications];
        });
      }
      
      // Cleanup old notifications if needed
      if (pageNum === 1 && shouldCleanupOldNotifications()) {
        cleanupOldNotifications();
      }
      
      setPage(pageNum);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching notifications:', error);
        throw error; // Propagate error for UI handling
      }
    } finally {
      if (pageNum === 1) {
        setLoading(false);
      } else {
        setIsFetchingMore(false);
      }
      abortControllerRef.current = null;
    }
  }, [isAuthenticated, user, cleanupOldNotifications]);

  // Load more notifications
  const loadMoreNotifications = useCallback(() => {
    if (!hasMore || isFetchingMore) return;
    
    const nextPage = page + 1;
    fetchNotifications(nextPage, MAX_NOTIFICATIONS_DISPLAY, false);
  }, [fetchNotifications, hasMore, isFetchingMore, page]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
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
      throw error; // Propagate error for UI handling
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
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
      throw error; // Propagate error for UI handling
    }
  }, []);

  // Mark all notifications as unread
  const markAllAsUnread = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`${config.API_URL}/api/notifications/unread-all`, {}, {
        headers: { 'x-auth-token': token }
      });
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: false }))
      );
      
      // Update unread count
      setUnreadCount(notifications.length);
    } catch (error) {
      console.error('Error marking all notifications as unread:', error);
      throw error; // Propagate error for UI handling
    }
  }, [notifications.length]);

  // Delete a notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`${config.API_URL}/api/notifications/${notificationId}`, {
        headers: { 'x-auth-token': token }
      });
      
      // Update local state and track if notification was unread in the same operation
      let wasUnread = false;
      setNotifications(prevNotifications => {
        const deletedNotification = prevNotifications.find(n => n._id === notificationId);
        wasUnread = deletedNotification && !deletedNotification.read;
        return prevNotifications.filter(notification => notification._id !== notificationId);
      });
      
      // Update unread count if needed
      if (wasUnread) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error; // Propagate error for UI handling
    }
  }, []);

  // Delete all notifications
  const deleteAllNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`${config.API_URL}/api/notifications/delete-all`, {
        headers: { 'x-auth-token': token }
      });
      
      // Update local state
      setNotifications([]);
      
      // Update unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error; // Propagate error for UI handling
    }
  }, []);

  // Format notification date
  const formatNotificationDate = useCallback((dateString) => {
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
  }, []);

  // Load notifications when authenticated
  useEffect(() => {
    // Create a new controller
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    if (isAuthenticated) {
      // Use the controller created above
      fetchNotifications(1);
      
      // Setup polling for notifications with cleanup
      pollIntervalRef.current = setInterval(() => {
        if (abortControllerRef.current) {
          // When polling, don't reuse the outer controller, which will be aborted on unmount
          // Instead, create a new one for each poll
          const pollController = new AbortController();
          abortControllerRef.current = pollController;
          
          // Call fetchNotifications without aborting previous pollController
          fetchNotifications(1)
            .catch(err => {
              if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
                console.error('Error polling notifications:', err);
              }
            });
        }
      }, NOTIFICATION_POLL_INTERVAL);
      
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        
        // Always abort the controller on cleanup
        controller.abort();
        abortControllerRef.current = null;
      };
    } else {
      // Clear notifications when logged out
      setNotifications([]);
      setUnreadCount(0);
      
      // Still need to cleanup the controller
      return () => {
        controller.abort();
        abortControllerRef.current = null;
      };
    }
  }, [isAuthenticated, user, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        isFetchingMore,
        hasMore,
        fetchNotifications,
        loadMoreNotifications,
        markAsRead,
        markAllAsRead,
        markAllAsUnread,
        deleteNotification,
        deleteAllNotifications,
        formatNotificationDate
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider; 