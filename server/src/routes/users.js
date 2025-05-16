const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const notificationService = require('../utils/notificationService');

// @desc    Get all users
// @route   GET /api/users
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Allow all authenticated users to access basic user information
    // If user is not an admin or superadmin, return only minimal user info needed for the UI
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);
    
    const users = await User.find().select('-password');
    
    // If not admin, limit the data returned to only what's needed for project displays
    if (!isAdmin) {
      const limitedUserData = users.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email
      }));
      return res.json(limitedUserData);
    }
    
    // For admins, return full user data (except passwords)
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @desc    Register/Create a new user (by superadmin)
// @route   POST /api/users
// @access  Private/SuperAdmin
router.post('/', auth, async (req, res) => {
  try {
    // Verify that only superadmins can create users
    if (req.user.role !== 'superadmin') {
      console.warn(`Unauthorized user creation attempt by: ${req.user.id} (${req.user.role})`);
      return res.status(403).json({ 
        message: 'Accès non autorisé. Seuls les Super Administrateurs peuvent créer des utilisateurs.' 
      });
    }

    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Veuillez fournir toutes les informations nécessaires (nom, email, mot de passe).' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Un utilisateur avec cette adresse e-mail existe déjà.' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password, // Ne hache pas le mot de passe ici - Le middleware pre('save') du modèle User s'en chargera
      role: role || 'user' // Default to 'user' if role not specified
    });

    // IMPORTANT: Suppression du hachage manuel pour éviter le double hachage
    // Le hook pre('save') dans le modèle User se chargera du hachage

    // Save user
    await user.save();

    // Log new user creation
    console.log(`New user created by superadmin ${req.user.id}: ${name} (${user._id}) with role ${user.role}`);

    // Return created user data (excluding password)
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error('Error creating user:', err.message);
    res.status(500).json({ 
      message: 'Erreur lors de la création de l\'utilisateur', 
      error: err.message 
    });
  }
});

// @desc    Get all users with passwords (hashed) - SuperAdmin only
// @route   GET /api/users/admin/all
// @access  Private/SuperAdmin
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Only superadmins can access this endpoint
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ 
        message: 'Accès non autorisé. Seuls les Super Administrateurs peuvent accéder à ces données.' 
      });
    }
    
    // Get all users including their password hashes
    const users = await User.find();
    
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @desc    Get user statistics for admin dashboard
// @route   GET /api/users/stats
// @access  Private/SuperAdmin
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Unauthorized: Only super administrators can access these statistics' });
    }
    
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const regularUserCount = await User.countDocuments({ role: 'user' });
    
    res.json({
      totalUsers,
      adminCount,
      regularUserCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @desc    Update user's own profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name } = req.body;

    // Get user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;

    await user.save();

    // Return updated user info
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @desc    Update any user (admin or superadmin only)
// @route   PUT /api/users/:id
// @access  Private/Admin/SuperAdmin
router.put('/:id', auth, async (req, res) => {
  try {
    if (!['superadmin', 'admin'].includes(req.user.role)) {
      console.warn(`Unauthorized role update attempt by: ${req.user.id} (${req.user.role})`);
      return res.status(403).json({ message: 'Accès non autorisé. Seuls les Super Administrateurs et Administrateurs peuvent modifier les rôles.' });
    }

    // Allow both admins and superadmins to update users
    const { name, email, role, password, currentPassword } = req.body;

    // Get user
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Special handling for super admins updating their own profile
    const isSelfUpdate = req.user.id === req.params.id;
    const isSuperAdmin = req.user.role === 'superadmin';
    
    // If updating password and it's a self-update by super admin, verify current password
    if (isSelfUpdate && isSuperAdmin && password && currentPassword) {
      // Verify that the current password is correct
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
      }
    }

    // Check if role is changing
    const roleChanged = role && role !== user.role;
    const originalRole = user.role;
    const hasEmailChanged = email && email !== user.email;
    const hasPasswordChanged = !!password;

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    
    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    // Create notification for role change
    if (roleChanged) {
      await notificationService.createRoleChangeNotification(
        req.user.id, // Admin who made the change
        user._id,    // User whose role was changed
        role         // New role
      );
      
      console.log(`User role changed from ${originalRole} to ${role} by ${req.user.id}`);
    }
    
    // Create notification for credential changes (super admin only)
    if (isSelfUpdate && isSuperAdmin && (hasEmailChanged || hasPasswordChanged)) {
      await notificationService.createAccountUpdateNotification(
        user._id,
        hasPasswordChanged,
        hasEmailChanged
      );
      
      console.log(`Super admin ${user._id} updated their credentials: email=${hasEmailChanged}, password=${hasPasswordChanged}`);
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!['superadmin', 'admin'].includes(req.user.role)) {
      console.warn(`Unauthorized delete attempt by: ${req.user.id} (${req.user.role})`);
      return res.status(403).json({ message: 'Accès non autorisé. Seuls les Super Administrateurs et Administrateurs peuvent supprimer des utilisateurs.' });
    }

    // Get user
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Additional check: don't allow deleting the last superadmin
    if (user.role === 'superadmin') {
      const superAdminCount = await User.countDocuments({ role: 'superadmin' });
      if (superAdminCount <= 1) {
        return res.status(400).json({ 
          message: 'Impossible de supprimer le dernier Super Administrateur du système.' 
        });
      }
    }

    // Use findByIdAndDelete instead of remove() which is deprecated
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    console.log(`User deleted: ${deletedUser.name} (${deletedUser._id})`);

    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    
    // Return a more informative error message
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Check if it's a reference error (user has related data)
    if (err.name === 'ReferenceError' || err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Impossible de supprimer cet utilisateur car il a des données associées (projets, commentaires).' 
      });
    }
    
    res.status(500).json({ 
      message: 'Erreur lors de la suppression de l\'utilisateur', 
      error: err.message 
    });
  }
});

// @desc    Restore a recently deleted user
// @route   POST /api/users/restore
// @access  Private/SuperAdmin
router.post('/restore', auth, async (req, res) => {
  try {
    // Check permissions - only superadmins can restore users
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ 
        message: 'Accès non autorisé. Seuls les Super Administrateurs peuvent restaurer des utilisateurs.' 
      });
    }

    const { name, email, role, originalId } = req.body;

    // Check if required fields are provided
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Veuillez fournir toutes les informations nécessaires.' });
    }

    // Check if a user with the same email already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Un utilisateur avec cette adresse e-mail existe déjà. Restauration impossible.' 
      });
    }

    // Create a new password (temporary)
    const tempPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // Create a new user with the provided data
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    // Save the user to the database
    await newUser.save();

    // Log the restoration
    console.log(`User restored: ${name} (${newUser._id}), original ID was: ${originalId}`);

    // Return the new user data
    res.json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });
  } catch (err) {
    console.error('Error restoring user:', err.message);
    res.status(500).json({ 
      message: 'Erreur lors de la restauration de l\'utilisateur', 
      error: err.message 
    });
  }
});

module.exports = router; 