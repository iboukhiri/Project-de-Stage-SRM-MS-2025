import React, { useContext } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Assignment as ProjectIcon, 
  Person as PersonIcon, 
  Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  Group as UserManagementIcon
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const [value, setValue] = React.useState(location.pathname);
  const { user } = useContext(AuthContext);

  // Determine user roles
  const isSuperAdmin = user && user.role === 'superadmin';
  const isManager = user && user.role === 'manager';
  const isAdminLevel = isSuperAdmin || isManager;

  React.useEffect(() => {
    setValue(location.pathname);
  }, [location]);

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
      >
        <BottomNavigationAction
          label="Dashboard"
          value="/dashboard"
          icon={<DashboardIcon />}
          component={Link}
          to="/dashboard"
        />
        <BottomNavigationAction
          label="Projets"
          value="/projects"
          icon={<ProjectIcon />}
          component={Link}
          to="/projects"
        />
        
        {/* Show create project option for admin level users */}
        {isAdminLevel && (
          <BottomNavigationAction
            label="Créer"
            value="/create-project"
            icon={<AddIcon />}
            component={Link}
            to="/create-project"
          />
        )}
        
        {/* Show superadmin dashboard option only for superadmin */}
        {isSuperAdmin && (
          <BottomNavigationAction
            label="SuperAdmin"
            value="/superadmin"
            icon={<AdminIcon />}
            component={Link}
            to="/superadmin"
          />
        )}
        
        {/* Show user management option only for superadmin */}
        {isSuperAdmin && (
          <BottomNavigationAction
            label="Utilisateurs"
            value="/admin/user-management"
            icon={<UserManagementIcon />}
            component={Link}
            to="/admin/user-management"
          />
        )}
        
        <BottomNavigationAction
          label="Profil"
          value="/profile"
          icon={<PersonIcon />}
          component={Link}
          to="/profile"
        />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav; 