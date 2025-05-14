import React from 'react';
import { Badge, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Box } from '@mui/material';
import moment from 'moment';
import 'moment/locale/fr';
import { Link } from 'react-router-dom';
// Icônes existantes
import AssignmentIcon from '@mui/icons-material/Assignment';
import CommentIcon from '@mui/icons-material/Comment';
import UpdateIcon from '@mui/icons-material/Update';
import SecurityIcon from '@mui/icons-material/Security';
import AlarmIcon from '@mui/icons-material/Alarm';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// Nouvelles icônes
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import TimerIcon from '@mui/icons-material/Timer';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import WarningIcon from '@mui/icons-material/Warning';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Fonction pour obtenir l'icône correspondant au type de notification
const getNotificationIcon = (type) => {
  switch (type) {
    case 'project_assignment':
      return <AssignmentIcon />;
    case 'comment':
      return <CommentIcon />;
    case 'project_update':
      return <UpdateIcon />;
    case 'role_change':
      return <SecurityIcon />;
    case 'deadline':
      return <AlarmIcon />;
    case 'mention':
      return <NotificationsIcon />;
    case 'account_update':
      return <PersonIcon />;
    case 'guarantee_start':
      return <BuildIcon />;
    case 'guarantee_end':
      return <CheckCircleIcon />;
    case 'progress_milestone':
      return <TrackChangesIcon />;
    case 'deadline_approaching':
      return <TimerIcon />;
    case 'project_change':
      return <EditIcon />;
    case 'team_change':
      return <GroupIcon />;
    case 'risk_alert':
      return <WarningIcon />;
    case 'inactivity_alert':
      return <PauseCircleOutlineIcon />;
    case 'approval_request':
      return <ThumbUpIcon />;
    case 'project_digest':
      return <AssessmentIcon />;
    default:
      return <NotificationsIcon />;
  }
};

// Fonction pour obtenir la couleur correspondant au type de notification
const getNotificationColor = (type) => {
  switch (type) {
    case 'project_assignment':
      return 'primary.main';
    case 'comment':
      return 'info.main';
    case 'project_update':
      return 'success.main';
    case 'role_change':
      return 'warning.dark';
    case 'deadline':
      return 'error.main';
    case 'mention':
      return 'secondary.main';
    case 'account_update':
      return 'info.dark';
    case 'guarantee_start':
      return 'success.light';
    case 'guarantee_end':
      return 'success.dark';
    case 'progress_milestone':
      return 'info.light';
    case 'deadline_approaching':
      return 'warning.main';
    case 'project_change':
      return 'primary.light';
    case 'team_change':
      return 'secondary.light';
    case 'risk_alert':
      return 'error.dark';
    case 'inactivity_alert':
      return 'warning.light';
    case 'approval_request':
      return 'success.main';
    case 'project_digest':
      return 'primary.dark';
    default:
      return 'text.primary';
  }
}; 