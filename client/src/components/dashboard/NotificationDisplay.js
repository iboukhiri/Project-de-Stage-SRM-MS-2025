import React, { useContext, useRef, useCallback, memo, useState, useEffect } from 'react';
import { 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  ListItemText, 
  Typography, 
  Box, 
  IconButton, 
  Divider, 
  List, 
  Paper, 
  Tooltip, 
  CircularProgress,
  useTheme,
  Snackbar,
  Alert
} from '@mui/material';
import { NotificationContext } from '../../context/NotificationContext';
// Icônes
import AssignmentIcon from '@mui/icons-material/Assignment';
import CommentIcon from '@mui/icons-material/Comment';
import UpdateIcon from '@mui/icons-material/Update';
import SecurityIcon from '@mui/icons-material/Security';
import AlarmIcon from '@mui/icons-material/Alarm';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import TimerIcon from '@mui/icons-material/Timer';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import WarningIcon from '@mui/icons-material/Warning';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MarkChatReadIcon from '@mui/icons-material/MarkChatRead';
import MarkChatUnreadIcon from '@mui/icons-material/MarkChatUnread';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import InboxIcon from '@mui/icons-material/Inbox';
import axios from 'axios';
import config from '../../config';

// Memoize an individual notification item to prevent re-renders
const NotificationItem = memo(({ 
  notification, 
  onNotificationClick, 
  onDeleteNotification, 
  formatNotificationDate,
  getNotificationIcon,
  getNotificationColor
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  return (
    <React.Fragment>
      <ListItem 
        alignItems="flex-start" 
        sx={{ 
          px: 2, 
          py: 1.5,
          cursor: 'pointer', 
          bgcolor: notification.read 
            ? 'transparent' 
            : (isDarkMode ? 'rgba(0, 255, 236, 0.05)' : 'rgba(0, 150, 136, 0.05)'),
          '&:hover': {
            bgcolor: isDarkMode 
              ? 'rgba(0, 255, 236, 0.1)' 
              : 'rgba(0, 150, 136, 0.08)',
          },
          position: 'relative',
          transition: 'background-color 0.2s'
        }}
        onClick={() => onNotificationClick(notification)}
      >
        <ListItemAvatar>
          <Avatar 
            sx={{ 
              bgcolor: getNotificationColor(notification.type),
              color: 'white'
            }}
          >
            {getNotificationIcon(notification.type)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography 
              variant="body2" 
              component="div" 
              sx={{ 
                fontWeight: notification.read ? 'normal' : 'bold',
                fontSize: '0.9rem',
                mb: 0.5,
                lineHeight: 1.4
              }}
            >
              {notification.content}
            </Typography>
          }
          secondary={
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ display: 'block', fontSize: '0.75rem' }}
            >
              {formatNotificationDate(notification.date)}
            </Typography>
          }
        />
        {!notification.read && (
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'error.main',
              alignSelf: 'center',
              mr: 1
            }}
          />
        )}
        <Tooltip title="Supprimer">
          <IconButton 
            size="small" 
            onClick={(e) => onDeleteNotification(e, notification._id)}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { color: 'error.main' }
            }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </ListItem>
      <Divider component="li" />
    </React.Fragment>
  );
});

// Fonction pour obtenir l'icône correspondant au type de notification
const getNotificationIcon = (type) => {
  switch (type) {
    case 'project_assignment': return <AssignmentIcon />;
    case 'comment': return <CommentIcon />;
    case 'project_update': return <UpdateIcon />;
    case 'role_change': return <SecurityIcon />;
    case 'deadline': return <AlarmIcon />;
    case 'mention': return <NotificationsIcon />;
    case 'account_update': return <PersonIcon />;
    case 'guarantee_start': return <BuildIcon />;
    case 'guarantee_end': return <CheckCircleIcon />;
    case 'progress_milestone': return <TrackChangesIcon />;
    case 'deadline_approaching': return <TimerIcon />;
    case 'project_change': return <EditIcon />;
    case 'team_change': return <GroupIcon />;
    case 'risk_alert': return <WarningIcon />;
    case 'inactivity_alert': return <PauseCircleOutlineIcon />;
    case 'approval_request': return <ThumbUpIcon />;
    case 'project_digest': return <AssessmentIcon />;
    default: return <NotificationsIcon />;
  }
};

// Fonction pour obtenir la couleur correspondant au type de notification
const getNotificationColor = (type) => {
  switch (type) {
    case 'project_assignment': return 'primary.main';
    case 'comment': return 'info.main';
    case 'project_update': return 'success.main';
    case 'role_change': return 'warning.dark';
    case 'deadline': return 'error.main';
    case 'mention': return 'secondary.main';
    case 'account_update': return 'info.dark';
    case 'guarantee_start': return 'success.light';
    case 'guarantee_end': return 'success.dark';
    case 'progress_milestone': return 'info.light';
    case 'deadline_approaching': return 'warning.main';
    case 'project_change': return 'primary.light';
    case 'team_change': return 'secondary.light';
    case 'risk_alert': return 'error.dark';
    case 'inactivity_alert': return 'warning.light';
    case 'approval_request': return 'success.main';
    case 'project_digest': return 'primary.dark';
    default: return 'text.primary';
  }
};

const NotificationDisplay = ({ maxHeight = '500px' }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const listRef = useRef(null);
  const [error, setError] = useState(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [newNotificationsAvailable, setNewNotificationsAvailable] = useState(false);
  const refreshTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  const { 
    notifications, 
    loading, 
    isFetchingMore,
    hasMore,
    markAsRead, 
    markAllAsRead, 
    markAllAsUnread,
    deleteNotification,
    deleteAllNotifications,
    formatNotificationDate,
    unreadCount,
    fetchNotifications,
    loadMoreNotifications
  } = useContext(NotificationContext);

  // Set up a shorter polling interval for real-time notifications
  useEffect(() => {
    // Create a separate controller for use in the cleanup function
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    // Check for new notifications every 15 seconds
    refreshTimerRef.current = setInterval(() => {
      // Only check for updates if the component is mounted and we're not already loading
      if (!loading && !isFetchingMore) {
        try {
          // Get the token
          const token = localStorage.getItem('token');
          if (!token) return;
          
          // Check if there are new unread notifications
          axios.get(`${config.API_URL}/api/notifications/unread/count`, {
            headers: { 'x-auth-token': token },
            signal: controller.signal
          }).then(res => {
            // If the unread count from the API is greater than our current count
            if (res.data.count > unreadCount) {
              setNewNotificationsAvailable(true);
            }
          }).catch(err => {
            if (!axios.isCancel(err)) {
              console.error('Error checking for new notifications:', err);
            }
          });
        } catch (err) {
          console.error('Error in notification check interval:', err);
        }
      }
    }, 15000); // 15 seconds
    
    // Clean up function to handle component unmounting
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
      
      // Abort any in-flight requests
      controller.abort();
    };
  }, [loading, isFetchingMore, unreadCount]);

  const handleNotificationClick = useCallback((notification) => {
    if (!notification.read) {
      markAsRead(notification._id)
        .catch(err => {
          console.error('Error marking notification as read:', err);
          setError('Erreur lors du marquage de la notification comme lue');
        });
    }
  }, [markAsRead]);

  const handleDeleteNotification = useCallback((event, notificationId) => {
    event.stopPropagation(); // Évite de déclencher le handleNotificationClick
    deleteNotification(notificationId)
      .catch(err => {
        console.error('Error deleting notification:', err);
        setError('Erreur lors de la suppression de la notification');
      });
  }, [deleteNotification]);

  // Handle infinite scroll
  const handleScroll = useCallback(() => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      
      // Mark that we've scrolled
      if (!hasScrolled && scrollTop > 0) {
        setHasScrolled(true);
      }
      
      // If we're near the bottom (within 100px) and not already loading more
      if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !isFetchingMore) {
        loadMoreNotifications();
      }
    }
  }, [hasMore, isFetchingMore, loadMoreNotifications, hasScrolled]);

  // Check if we need to load more notifications when the list is too short
  useEffect(() => {
    // If we have notifications, the list is visible, we haven't scrolled, and there might be more
    if (notifications.length > 0 && 
        !loading && 
        !isFetchingMore && 
        hasMore && 
        !hasScrolled && 
        listRef.current) {
      
      const { scrollHeight, clientHeight } = listRef.current;
      
      // If the content isn't filling the container and we have more to load
      if (scrollHeight <= clientHeight) {
        loadMoreNotifications();
      }
    }
  }, [notifications.length, loading, isFetchingMore, hasMore, hasScrolled, loadMoreNotifications]);

  const handleRefresh = useCallback(() => {
    setHasScrolled(false); // Reset scroll state on refresh
    setNewNotificationsAvailable(false); // Hide the new notifications indicator
    fetchNotifications(1)
      .catch(err => {
        if (!axios.isCancel(err)) {
          console.error('Error refreshing notifications:', err);
          setError('Erreur lors du rafraîchissement des notifications');
        }
      });
  }, [fetchNotifications]);

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: '100%',
        maxHeight: maxHeight,
        overflow: 'hidden',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: `1px solid ${theme.palette.divider}`,
        background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
      }}>
        <Typography variant="h6" fontWeight="600">
          Notifications 
          {unreadCount > 0 && (
            <Box 
              component="span" 
              sx={{ 
                ml: 1, 
                py: 0.2, 
                px: 0.8, 
                borderRadius: 5, 
                fontSize: '0.7rem', 
                bgcolor: 'error.main', 
                color: 'white' 
              }}
            >
              {unreadCount}
            </Box>
          )}
        </Typography>
        <Box sx={{ display: 'flex' }}>
          <Tooltip title={newNotificationsAvailable ? "Nouvelles notifications disponibles" : "Rafraîchir"}>
            <IconButton 
              size="small" 
              onClick={handleRefresh}
              disabled={loading}
              sx={{ 
                mr: 1,
                animation: newNotificationsAvailable 
                  ? 'pulse 1.5s infinite' 
                  : 'none',
                color: newNotificationsAvailable 
                  ? theme.palette.error.main 
                  : 'inherit'
              }}
            >
              <RefreshIcon 
                fontSize="small" 
                color={newNotificationsAvailable ? "error" : "inherit"} 
              />
            </IconButton>
          </Tooltip>
          
          {notifications.length > 0 && (
            <>
              <Tooltip title="Marquer tout comme non lu">
                <IconButton 
                  size="small"
                  onClick={markAllAsUnread}
                  sx={{ mr: 1 }}
                >
                  <MarkChatUnreadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Tout marquer comme lu">
                <IconButton 
                  size="small" 
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  sx={{ mr: 1 }}
                >
                  <MarkChatReadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Supprimer toutes les notifications">
                <IconButton 
                  size="small" 
                  onClick={deleteAllNotifications}
                  color="error"
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>
      
      {loading && !isFetchingMore ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          p: 5,
          flexGrow: 1
        }}>
          <CircularProgress size={36} />
        </Box>
      ) : notifications.length > 0 ? (
        <List 
          sx={{ 
            p: 0, 
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.2)' 
                : 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.3)' 
                : 'rgba(0,0,0,0.3)',
            },
          }}
          ref={listRef}
          onScroll={handleScroll}
        >
          {notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onNotificationClick={handleNotificationClick}
              onDeleteNotification={handleDeleteNotification}
              formatNotificationDate={formatNotificationDate}
              getNotificationIcon={getNotificationIcon}
              getNotificationColor={getNotificationColor}
            />
          ))}
          
          {isFetchingMore && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              py: 2,
              borderTop: `1px dashed ${theme.palette.divider}`
            }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </List>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          p: 4,
          color: 'text.secondary',
          flexGrow: 1
        }}>
          <InboxIcon sx={{ fontSize: 50, mb: 2, opacity: 0.7 }} />
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Aucune notification
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
            Vous recevrez des notifications pour les activités importantes du projet.
          </Typography>
        </Box>
      )}
      
      {/* Error Snackbar */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default NotificationDisplay; 