import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  TextField,
  IconButton,
  Tooltip,
  Container,
  ButtonGroup,
  DialogContentText,
  InputAdornment
} from '@mui/material';
import {
  SupervisorAccount as AdminIcon,
  ManageAccounts as ManagerIcon,
  Person as UserIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as SuperAdminIcon,
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';

// Role mapping between database values and display values
const roleMapping = {
  'superadmin': {
    label: 'Super Administrateur',
    color: 'error',
    icon: <SuperAdminIcon fontSize="small" />
  },
  'admin': {
    label: 'Chef de Projet',
    color: 'primary',
    icon: <ManagerIcon fontSize="small" />
  },
  'manager': {
    label: 'Chef de Projet',
    color: 'primary',
    icon: <ManagerIcon fontSize="small" />
  },
  'employee': {
    label: 'Employé',
    color: 'info',
    icon: <UserIcon fontSize="small" />
  },
  'user': {
    label: 'Utilisateur',
    color: 'default',
    icon: <UserIcon fontSize="small" />
  }
};

const UserManagement = () => {
  // Request Notification permission for desktop alerts
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  const { user: currentUser, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // State for undo deletion functionality
  const [deletedUserData, setDeletedUserData] = useState(null);
  const [undoSnackbarOpen, setUndoSnackbarOpen] = useState(false);
  const undoTimeoutRef = useRef(null);
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form data states
  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    role: ''
  });
  
  // New user form data
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  
  // New password visibility state
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users list - Current user role:', currentUser?.role);
        
        // Change back to regular users endpoint since we don't need passwords
        const res = await axios.get(`${config.API_URL}/api/users`, {
          headers: { 
            'x-auth-token': token
          }
        });
        console.log('Users API response:', res.data.length, 'users found');
        setUsers(res.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des utilisateurs:', err);
        
        const errorMessage = err.response?.data?.message || 
          'Impossible de récupérer la liste des utilisateurs. Vérifiez vos permissions.';
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    if (currentUser && currentUser.role === 'superadmin') {
      fetchUsers();
    } else {
      setError('Accès non autorisé');
      setLoading(false);
    }
  }, [token, currentUser]);
  
  // Show success notification
  const showSuccessNotification = (message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'success'
    });
  };
  
  // Show error notification
  const showErrorNotification = (message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'error'
    });
  };
  
  // Function to update a user
  const updateUser = async () => {
    try {
      // Only send name, email and role in the update - no password
      const userData = {
        name: editUserData.name,
        email: editUserData.email,
        role: editUserData.role
      };
      
      const res = await axios.put(
        `${config.API_URL}/api/users/${selectedUser._id}`,
        userData,
        { headers: { 'x-auth-token': token }}
      );
      
      // Update the users list with the updated user
      setUsers(users.map(user => 
        user._id === selectedUser._id ? { ...user, ...res.data } : user
      ));
      
      setEditDialogOpen(false);
      showSuccessNotification('Utilisateur mis à jour avec succès');
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
      showErrorNotification(
        err.response?.data?.message || 
        'Erreur lors de la mise à jour de l\'utilisateur'
      );
    }
  };
  
  // Function to delete a user
  const deleteUser = async () => {
    try {
      // Store the user data before deletion for potential undo
      const userToDelete = {...selectedUser};
      
      await axios.delete(
        `${config.API_URL}/api/users/${selectedUser._id}`,
        { headers: { 'x-auth-token': token }}
      );
      
      // Remove the deleted user from the users list
      setUsers(users.filter(user => user._id !== selectedUser._id));
      
      // Close the confirmation dialog
      setDeleteDialogOpen(false);
      
      // Store deleted user data and show undo snackbar
      setDeletedUserData(userToDelete);
      setUndoSnackbarOpen(true);
      
      // Set a timeout for the undo operation (5 seconds)
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
      
      undoTimeoutRef.current = setTimeout(() => {
        setUndoSnackbarOpen(false);
        setDeletedUserData(null);
      }, 5000); // 5 seconds
      
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', err);
      
      // Provide more detailed error message
      let errorMessage = 'Erreur lors de la suppression de l\'utilisateur';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = err.response.data.message || errorMessage;
        console.log('Server error response:', err.response.data);
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'Pas de réponse du serveur. Vérifiez votre connexion Internet.';
      }
      
      showErrorNotification(errorMessage);
    }
  };
  
  // Function to handle undo deletion
  const handleUndoDelete = async () => {
    if (!deletedUserData) return;
    
    try {
      // Clear the timeout
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
        undoTimeoutRef.current = null;
      }
      
      // Close the undo snackbar
      setUndoSnackbarOpen(false);
      
      // Show loading indicator
      setLoading(true);
      
      // Recreate the user by sending a POST request with the saved data
      const userData = {
        name: deletedUserData.name,
        email: deletedUserData.email,
        role: deletedUserData.role
      };
      
      const res = await axios.post(
        `${config.API_URL}/api/users/restore`,
        { 
          ...userData,
          originalId: deletedUserData._id // Send the original ID to help with restoration
        },
        { headers: { 'x-auth-token': token }}
      );
      
      // Add the restored user back to the list
      setUsers(prevUsers => [...prevUsers, res.data]);
      
      showSuccessNotification('Utilisateur restauré avec succès');
      
      // Clear deleted user data
      setDeletedUserData(null);
    } catch (err) {
      console.error('Erreur lors de la restauration de l\'utilisateur:', err);
      
      showErrorNotification(
        err.response?.data?.message || 
        'Erreur lors de la restauration de l\'utilisateur'
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, []);
  
  const handleCloseUndoSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setUndoSnackbarOpen(false);
  };
  
  // Function to handle opening the edit dialog
  const handleOpenEditDialog = (user) => {
    setSelectedUser(user);
    setEditUserData({
      name: user.name,
      email: user.email,
      role: user.role
    });
    setEditDialogOpen(true);
  };
  
  // Function to handle opening the delete dialog
  const handleOpenDeleteDialog = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };
  
  // Function to handle edit input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditUserData({
      ...editUserData,
      [name]: value
    });
  };
  
  // Function to toggle new password visibility
  const handleToggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };
  
  // Function to add a new user
  const addUser = async () => {
    try {
      setLoading(true);
      
      const res = await axios.post(
        `${config.API_URL}/api/users`,
        newUserData,
        { headers: { 'x-auth-token': token }}
      );
      
      // Add the new user to the users list
      setUsers([...users, res.data]);
      
      // Reset the new user form
      setNewUserData({
        name: '',
        email: '',
        password: '',
        role: 'user'
      });
      
      setAddDialogOpen(false);
      showSuccessNotification('Utilisateur ajouté avec succès');
    } catch (err) {
      console.error('Erreur lors de l\'ajout de l\'utilisateur:', err);
      
      let errorMessage = 'Erreur lors de l\'ajout de l\'utilisateur';
      
      if (err.response) {
        errorMessage = err.response.data.message || errorMessage;
      }
      
      showErrorNotification(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle new user input changes
  const handleNewUserInputChange = (e) => {
    const { name, value } = e.target;
    setNewUserData({
      ...newUserData,
      [name]: value
    });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  if (loading) return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Gestion des utilisateurs
      </Typography>
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    </Container>
  );
  
  if (error) return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Gestion des utilisateurs
      </Typography>
      <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
    </Container>
  );
  
  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Gestion des utilisateurs
          <Typography variant="subtitle1" color="text.secondary">
            {users.length} utilisateurs enregistrés
          </Typography>
        </Typography>
        
        {/* Add User Button */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={() => setAddDialogOpen(true)}
          sx={{ mb: 3 }}
        >
          Ajouter un utilisateur
        </Button>
      </Box>
      
      <Paper elevation={2} sx={{ overflow: 'hidden' }}>
        <TableContainer component={Box} sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow 
                  key={user._id} 
                  hover
                  sx={{
                    bgcolor: user.role === 'superadmin' 
                      ? 'rgba(255, 153, 51, 0.05)'
                      : user.role === 'admin'
                        ? 'rgba(0, 150, 136, 0.05)'
                        : 'inherit'
                  }}
                >
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={roleMapping[user.role]?.label || user.role}
                      icon={roleMapping[user.role]?.icon}
                      size="small"
                      color={roleMapping[user.role]?.color || 'default'}
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <ButtonGroup variant="outlined" size="small">
                      <Tooltip title="Modifier le rôle">
                        <Button 
                          onClick={() => handleOpenEditDialog(user)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </Button>
                      </Tooltip>
                      <Tooltip title="Supprimer l'utilisateur">
                        <Button 
                          onClick={() => handleOpenDeleteDialog(user)}
                          color="error"
                          disabled={user.role === 'superadmin'} // Prevent deleting superadmins
                        >
                          <DeleteIcon fontSize="small" />
                        </Button>
                      </Tooltip>
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier l'utilisateur {selectedUser?.name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom"
            name="name"
            value={editUserData.name}
            onChange={handleEditInputChange}
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            type="email"
            value={editUserData.email}
            onChange={handleEditInputChange}
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel>Rôle</InputLabel>
            <Select
              name="role"
              value={editUserData.role}
              onChange={handleEditInputChange}
              label="Rôle"
            >
              <MenuItem value="employee">Employé</MenuItem>
              <MenuItem value="manager">Chef de Projet</MenuItem>
              <MenuItem value="superadmin">Super Administrateur</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="inherit">
            Annuler
          </Button>
          <Button onClick={updateUser} color="primary" variant="contained">
            Mettre à jour
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer l'utilisateur "{selectedUser?.name}" ? 
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Annuler
          </Button>
          <Button onClick={deleteUser} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom"
            name="name"
            value={newUserData.name}
            onChange={handleNewUserInputChange}
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            type="email"
            value={newUserData.email}
            onChange={handleNewUserInputChange}
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Mot de passe"
            name="password"
            type={showNewPassword ? 'text' : 'password'}
            value={newUserData.password}
            onChange={handleNewUserInputChange}
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleToggleNewPasswordVisibility}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel>Rôle</InputLabel>
            <Select
              name="role"
              value={newUserData.role}
              onChange={handleNewUserInputChange}
              label="Rôle"
            >
              <MenuItem value="user">Utilisateur</MenuItem>
              <MenuItem value="admin">Administrateur</MenuItem>
              <MenuItem value="superadmin">Super Administrateur</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} color="inherit">
            Annuler
          </Button>
          <Button 
            onClick={addUser} 
            color="primary" 
            variant="contained"
            disabled={!newUserData.name || !newUserData.email || !newUserData.password}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Undo deletion snackbar */}
      <Snackbar
        open={undoSnackbarOpen}
        autoHideDuration={5000}
        onClose={handleCloseUndoSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={`Utilisateur "${deletedUserData?.name}" supprimé`}
        action={
          <React.Fragment>
            <Button color="secondary" size="small" onClick={handleUndoDelete}>
              ANNULER
            </Button>
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseUndoSnackbar}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
        sx={{ 
          '& .MuiSnackbarContent-root': { 
            bgcolor: theme => theme.palette.error.dark,
            minWidth: 300 
          } 
        }}
      />
    </Container>
  );
};

export default UserManagement; 