import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link as RouterLink, useNavigate, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress,
  Drawer,
  ListItemIcon,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as ProjectIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  AdminPanelSettings as SuperAdminIcon,
  Notifications as NotificationsIcon,
  CheckCircle as ReadIcon,
  MarkChatUnread as MarkChatUnreadIcon,
  MarkChatRead as MarkChatReadIcon,
  DeleteOutline as DeleteOutlineIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Inbox as InboxIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import ThemeToggle from '../common/ThemeToggle';
import AboutDialog from '../common/AboutDialog';
import { ThemeContext } from '../../context/ThemeContext';
import config from '../../config';
import { darken, lighten } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import axios from 'axios';

// Helper to get profile photo URL
const getProfilePhotoUrl = (userId) => {
  return `${config.API_URL}/uploads/profile-photos/${userId}.jpg`;
};

// Utility function to generate consistent colors from strings
function stringToColor(string) {
  if (!string) return '#1976d2';
  
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  
  return color;
}

// Helper function to create a shaded version of a color based on the theme mode
const getShade = (color, theme, amount = 0.2) => {
  if (typeof color === 'string') {
    return theme.palette.mode === 'dark' 
      ? lighten(color, amount) 
      : darken(color, amount);
  }
  // Use a default color if color is not a string
  const defaultColor = theme.palette.mode === 'dark' ? '#FF9933' : '#009688';
  return theme.palette.mode === 'dark' 
    ? lighten(defaultColor, amount) 
    : darken(defaultColor, amount);
};

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #FF9933 0%, #FFBB66 100%)'
    : 'linear-gradient(135deg, #009688 0%, #4DB6AC 100%)',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0, 0, 0, 0.5)' 
    : '0 2px 10px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  borderRadius: 0,
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 35,
  height: 35,
  cursor: 'pointer',
  border: `2px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 0 8px rgba(255, 255, 255, 0.3)' 
      : '0 0 8px rgba(0, 0, 0, 0.2)',
  },
}));

const Navbar = () => {
  // Hooks
  const theme = useTheme();
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('md'));
  const { 
    isAuthenticated, 
    logout, 
    user
  } = useContext(AuthContext);
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    markAllAsUnread, 
    formatNotificationDate, 
    fetchNotifications,
    deleteNotification,
    deleteAllNotifications,
    isFetchingMore,
    hasMore,
    loadMoreNotifications
  } = useContext(NotificationContext);
  const { themeMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [adminMenuAnchor, setAdminMenuAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
  const notificationRef = useRef(null);
  const notificationIconRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);
  
  // Define the missing style variables
  const navButtonStyles = {
    color: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.87)' : 'inherit',
    mx: 1,
    fontWeight: 700,
    fontSize: '0.95rem',
    letterSpacing: '0.02em',
    '&:hover': {
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    }
  };
  
  const connexionButtonStyle = {
    ...navButtonStyles,
    fontWeight: 800,
    border: '1px solid',
    borderColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'inherit',
    borderRadius: 2,
  };
  
  // Determine if user is admin
  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');
  const isSuperAdmin = user && user.role === 'superadmin';

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification._id);
    }
    
    // Navigate to related content based on notification type
    if (notification.relatedProject) {
      navigate(`/projects/${notification.relatedProject._id}`);
    } else if (notification.type === 'role_change') {
      navigate('/profile');
    }
    
    // Close notification menu
    handleCloseNotificationMenu();
  };

  const handleDeleteNotification = (event, notificationId) => {
    event.stopPropagation(); // Évite de déclencher le handleNotificationClick
    deleteNotification(notificationId);
  };

  // useEffect hooks go here, before any conditional returns
  useEffect(() => {
    // Add click outside listeners
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target) && 
          notificationIconRef.current && !notificationIconRef.current.contains(event.target)) {
        handleCloseNotificationMenu();
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
          hamburgerRef.current && !hamburgerRef.current.contains(event.target)) {
        // Handle mobile menu close
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Close mobile menu when switching from mobile to desktop view
  useEffect(() => {
    if (!isDesktop) {
      setMobileMenuOpen(false);
    }
  }, [isDesktop]);

  // Early return after all useEffect hooks
  if (!isAuthenticated && !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenAdminMenu = (event) => {
    event.preventDefault(); // Prevent default action
    event.stopPropagation(); // Stop event propagation
    setAdminMenuAnchor(event.currentTarget);
  };

  const handleCloseAdminMenu = () => {
    setAdminMenuAnchor(null);
  };

  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
  };

  const handleAdminMenuItemClick = (path) => {
    handleCloseAdminMenu();
    navigate(path);
  };

  const handleUserMenuItemClick = (path) => {
    navigate(path);
    handleCloseUserMenu();
  };

  // Get navbar background styles based on current theme
  const getNavbarBgStyles = () => {
    if (theme.palette.mode === 'dark') {
      return {
        bgcolor: '#262626', // Slightly lighter black
        backgroundImage: 'linear-gradient(to right, #ff9933, #ffb366)', // Light orange gradient
        boxShadow: '0 3px 10px rgba(255, 153, 51, 0.3)'
      };
    } else {
      return {
        bgcolor: '#009688', // Teal main color
        backgroundImage: 'linear-gradient(to right, #009688, #26a69a)',
        boxShadow: '0 3px 10px rgba(0, 150, 136, 0.2)'
      };
    }
  };

  // Get menu hover color based on theme
  const getMenuHoverColor = () => {
    return theme.palette.mode === 'dark' 
      ? 'rgba(255, 153, 51, 0.08)' 
      : 'rgba(0, 150, 136, 0.08)';
  };

  // Get user button styles based on theme
  const getUserButtonStyles = () => {
    const baseStyles = {
      ml: 1,
      p: 0.5,
      border: '2px solid rgba(255,255,255,0.7)',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      '&:hover': {
        transform: 'scale(1.1)',
      }
    };

    if (theme.palette.mode === 'dark') {
      return {
        ...baseStyles,
        '&:hover': {
          ...baseStyles['&:hover'],
          border: '2px solid #ffcc80',
          boxShadow: '0 3px 12px rgba(255,153,51,0.3)',
        }
      };
    } else {
      return {
        ...baseStyles,
        '&:hover': {
          ...baseStyles['&:hover'],
          border: '2px solid #80cbc4',
          boxShadow: '0 3px 12px rgba(0,150,136,0.3)',
        }
      };
    }
  };

  const handleProfileMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleOpenNotificationMenu = (event) => {
    setNotificationAnchor(event.currentTarget);
    // Refresh notifications when opening menu
    fetchNotifications();
  };

  const handleCloseNotificationMenu = () => {
    setNotificationAnchor(null);
  };

  // Handle mobile drawer
  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const closeMobileDrawer = () => {
    setMobileDrawerOpen(false);
  };

  // Mobile navigation items
  const mobileNavItems = [
    {
      text: 'Tableau de bord',
      icon: <DashboardIcon />,
      path: '/dashboard',
      onClick: () => {
        navigate('/dashboard');
        closeMobileDrawer();
      }
    },
    {
      text: 'Projets',
      icon: <ProjectIcon />,
      path: '/projects',
      onClick: () => {
        navigate('/projects');
        closeMobileDrawer();
      }
    },
    // Add admin section for mobile
    ...(isAdmin ? [
      {
        text: 'Nouveau Projet',
        icon: <AddIcon />,
        onClick: () => {
          navigate('/create-project');
          closeMobileDrawer();
        }
      },
      {
        text: 'Assigner Employés',
        icon: <GroupIcon />,
        onClick: () => {
          navigate('/admin/assign-projects');
          closeMobileDrawer();
        }
      },
      ...(isSuperAdmin ? [{
        text: 'Gestion des Utilisateurs',
        icon: <SuperAdminIcon />,
        onClick: () => {
          navigate('/admin/user-management');
          closeMobileDrawer();
        }
      }] : [])
    ] : []),
    {
      text: 'Profil',
      icon: <PersonIcon />,
      path: '/profile',
      onClick: () => {
        navigate('/profile');
        closeMobileDrawer();
      }
    },
    {
      text: 'À propos',
      icon: <InfoIcon />,
      onClick: () => {
        toggleAboutDialog();
        closeMobileDrawer();
      }
    }
  ];

  // Mobile drawer content
  const mobileDrawerContent = (
    <Box
      sx={{
        width: 250,
        height: '100%',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" component="div">
          Menu
        </Typography>
        <IconButton onClick={closeMobileDrawer}>
          <CloseIcon />
        </IconButton>
      </Box>

      <List sx={{ flexGrow: 1 }}>
        {/* Regular navigation items */}
        {mobileNavItems.slice(0, 2).map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={item.onClick}
            sx={{
              py: 1.5,
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}

        {/* Admin section if user is admin */}
        {isAdmin && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem
              sx={{
                py: 1,
                px: 2,
                bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 153, 51, 0.1)' : 'rgba(0, 150, 136, 0.1)',
              }}
            >
              <ListItemText 
                primary={
                  <Typography variant="subtitle2" color="text.secondary">
                    {isSuperAdmin ? 'Super Admin' : 'Administration'}
                  </Typography>
                }
              />
            </ListItem>
            {mobileNavItems.slice(2, -1).map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={item.onClick}
                sx={{
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </>
        )}

        <Divider sx={{ my: 1 }} />
        
        {/* Profile item */}
        <ListItem
          button
          onClick={mobileNavItems[mobileNavItems.length - 1].onClick}
          sx={{
            py: 1.5,
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            {mobileNavItems[mobileNavItems.length - 1].icon}
          </ListItemIcon>
          <ListItemText primary={mobileNavItems[mobileNavItems.length - 1].text} />
        </ListItem>
      </List>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={() => {
            handleLogout();
            closeMobileDrawer();
          }}
          sx={{ mt: 1 }}
        >
          Déconnexion
        </Button>
      </Box>
    </Box>
  );

  // Toggle About Dialog
  const toggleAboutDialog = () => {
    setAboutDialogOpen(!aboutDialogOpen);
  };

  const navContent = (
    <StyledAppBar 
      position="static" 
      sx={{
        ...getNavbarBgStyles(),
      }}
    >
      <Toolbar>
        {/* Mobile Menu Button */}
        {!isDesktop && (
          <IconButton
            ref={hamburgerRef}
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleMobileDrawer}
            sx={{
              mr: 2,
              color: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.87)' : 'white',
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo */}
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <Box
            component="img"
            src={`${process.env.PUBLIC_URL}/images/srm-marrakech-safi-seeklogo.svg`}
            alt="SRM Logo"
            sx={{
              height: { xs: '60px', sm: '80px', md: '120px' }, // Responsive height
              width: 'auto',
              mr: 2,
              filter: theme => theme.palette.mode === 'dark' 
                ? 'brightness(0) drop-shadow(3px 3px 5px rgba(0,0,0,0.3))'
                : 'brightness(0) invert(1) drop-shadow(3px 3px 5px rgba(255,255,255,0.3))', 
              alignSelf: 'center',
              display: 'block',
              transition: 'all 0.3s ease'
            }}
          />
        </Link>

        <Box sx={{ flexGrow: 1 }} />

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* About Button */}
        <Button
          color="inherit"
          onClick={toggleAboutDialog}
          startIcon={<InfoIcon />}
          sx={{
            ...navButtonStyles,
            display: { xs: 'none', md: 'flex' },
            ml: 1
          }}
        >
          À propos
        </Button>

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Desktop navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
              <Button color="inherit" component={RouterLink} to="/dashboard" startIcon={<DashboardIcon />} sx={navButtonStyles}>
                Tableau de bord
              </Button>
              <Button color="inherit" component={RouterLink} to="/projects" startIcon={<ProjectIcon />} sx={navButtonStyles}>
                Projets
              </Button>
              
              {isAdmin && isDesktop && (
                <>
                  <Button 
                    color="inherit" 
                    startIcon={<AdminIcon />} 
                    sx={{
                      ...navButtonStyles,
                      bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 153, 51, 0.2)' : 'rgba(0, 150, 136, 0.2)',
                      '&:hover': {
                        bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 153, 51, 0.3)' : 'rgba(0, 150, 136, 0.3)',
                      }
                    }}
                    onClick={handleOpenAdminMenu}
                    aria-haspopup="true"
                  >
                    {isSuperAdmin ? 'Super Admin' : 'Administrateur'}
                  </Button>
                  <Menu
                    anchorEl={adminMenuAnchor}
                    open={Boolean(adminMenuAnchor)}
                    onClose={handleCloseAdminMenu}
                    MenuListProps={{
                      'aria-labelledby': 'admin-menu',
                    }}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        mt: 1.5,
                        width: 240,
                        borderRadius: 2,
                        overflow: 'visible',
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                        '& .MuiMenuItem-root': {
                          py: 1.5,
                          px: 2,
                          whiteSpace: 'normal',
                          '&:hover': {
                            bgcolor: getMenuHoverColor(),
                          }
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem onClick={() => handleAdminMenuItemClick('/create-project')}>
                      <AddIcon fontSize="small" sx={{ mr: 1.5 }} />
                      <Typography variant="body2" fontWeight={600}>Nouveau Projet</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => handleAdminMenuItemClick('/admin/assign-projects')}>
                      <GroupIcon fontSize="small" sx={{ mr: 1.5 }} />
                      <Typography variant="body2" fontWeight={600}>Assigner Employés</Typography>
                    </MenuItem>
                    {isSuperAdmin && (
                      <MenuItem onClick={() => handleAdminMenuItemClick('/admin/user-management')}>
                        <SuperAdminIcon fontSize="small" sx={{ mr: 1.5 }} />
                        <Typography variant="body2" fontWeight={600}>Gestion des Utilisateurs</Typography>
                      </MenuItem>
                    )}
                  </Menu>
                </>
              )}
            </Box>

            {/* Always visible items */}
            <Tooltip title="Notifications">
              <IconButton
                ref={notificationIconRef}
                onClick={handleOpenNotificationMenu}
                sx={{
                  color: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.87)' : 'white',
                  mx: { xs: 0.5, md: 1 },
                  transition: 'transform 0.2s',
                  '&:hover': { 
                    transform: 'scale(1.1)',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Options du profil">
              <IconButton 
                onClick={handleProfileMenuOpen}
                sx={{
                  ...getUserButtonStyles(),
                  ml: { xs: 0.5, md: 1 }
                }}
              >
                <UserAvatar
                  alt={user?.name || "User"}
                  sx={{ 
                    width: { xs: 32, md: 36 }, 
                    height: { xs: 32, md: 36 },
                    bgcolor: user?.name ? stringToColor(user.name) : 'primary.light',
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : <PersonIcon />}
                </UserAvatar>
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          // Unauthenticated Buttons
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button color="inherit" component={RouterLink} to="/login" sx={connexionButtonStyle}>
              Connexion
            </Button>
            <Button color="inherit" component={RouterLink} to="/register" sx={navButtonStyles}>
              S'inscrire
            </Button>
          </Box>
        )}
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={closeMobileDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: 250,
            boxSizing: 'border-box',
          },
        }}
      >
        {mobileDrawerContent}
      </Drawer>

      {/* Notifications Menu */}
      <Menu
        ref={notificationRef}
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleCloseNotificationMenu}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            width: { xs: 300, sm: 360 },
            maxHeight: 500,
            borderRadius: 2,
            overflow: 'auto',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            borderBottom: `1px solid ${theme.palette.divider}`,
            background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
          }}
        >
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
            <Tooltip title="Rafraîchir">
              <IconButton 
                size="small" 
                onClick={() => fetchNotifications(1)}
                disabled={loading}
                sx={{ mr: 1 }}
              >
                <RefreshIcon fontSize="small" />
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
        
        <Box sx={{ maxHeight: '400px', width: '350px', overflow: 'hidden' }}>
          {loading && !isFetchingMore ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              p: 5
            }}>
              <CircularProgress size={36} />
            </Box>
          ) : notifications.length > 0 ? (
            <List 
              sx={{ 
                p: 0, 
                maxHeight: '400px',
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
              onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                // If we're near the bottom and not already loading more
                if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !isFetchingMore) {
                  loadMoreNotifications();
                }
              }}
            >
              {notifications.map((notification) => (
                <React.Fragment key={notification._id}>
                  <ListItem 
                    alignItems="flex-start" 
                    sx={{ 
                      px: 2, 
                      py: 1.5,
                      cursor: 'pointer', 
                      bgcolor: notification.read 
                        ? 'transparent' 
                        : (theme.palette.mode === 'dark' ? 'rgba(255, 153, 51, 0.08)' : 'rgba(0, 150, 136, 0.05)'),
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 153, 51, 0.12)' : 'rgba(0, 150, 136, 0.08)',
                      },
                      position: 'relative',
                      transition: 'background-color 0.2s'
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        alt={notification.sender?.name || "Système"} 
                        src={notification.sender ? getProfilePhotoUrl(notification.sender._id) : ''}
                        sx={{ 
                          bgcolor: notification.sender?.name ? stringToColor(notification.sender.name) : 'primary.main',
                          width: 40,
                          height: 40
                        }}
                      >
                        {notification.sender?.name ? notification.sender.name.charAt(0).toUpperCase() : 'S'}
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
                        onClick={(e) => handleDeleteNotification(e, notification._id)}
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
              color: 'text.secondary'
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
        </Box>
      </Menu>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleCloseUserMenu}
        MenuListProps={{
          'aria-labelledby': 'user-menu',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            width: 240,
            borderRadius: 2,
            overflow: 'visible',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
            '& .MuiMenuItem-root': {
              py: 1.5,
              px: 2,
              whiteSpace: 'normal',
              '&:hover': {
                bgcolor: getMenuHoverColor(),
              }
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {user && (
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <Typography variant="subtitle1" fontWeight="medium">{user.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
              {user.email}
            </Typography>
          </Box>
        )}
        
        <MenuItem onClick={() => handleUserMenuItemClick('/profile')}>
          <SettingsIcon fontSize="small" sx={{ mr: 1.5 }} />
          <Typography variant="body2" fontWeight={600}>Mon profil</Typography>
        </MenuItem>
        
        <MenuItem onClick={handleLogout}>
          <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
          <Typography variant="body2" fontWeight={600}>Déconnexion</Typography>
        </MenuItem>
      </Menu>
    </StyledAppBar>
  );

  return (
    <>
      {navContent}
      
      {/* About Dialog */}
      <AboutDialog
        open={aboutDialogOpen}
        onClose={toggleAboutDialog}
      />
    </>
  );
};

export default Navbar; 