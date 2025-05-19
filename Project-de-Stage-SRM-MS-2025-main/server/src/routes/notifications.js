const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get current user's notifications with pagination
// @route   GET /api/notifications
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Extract pagination parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Fetch user's notifications with populated sender data and pagination
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ date: -1 })
      .populate('sender', 'name')
      .populate('relatedProject', 'title')
      .skip(skip)
      .limit(limit);
    
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err.message);
    res.status(500).json({ message: 'Erreur lors de la récupération des notifications' });
  }
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread/count
// @access  Private
router.get('/unread/count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      recipient: req.user.id,
      read: false 
    });
    
    res.json({ count });
  } catch (err) {
    console.error('Error counting unread notifications:', err.message);
    res.status(500).json({ message: 'Erreur lors du comptage des notifications non lues' });
  }
});

// @desc    Cleanup old notifications
// @route   DELETE /api/notifications/cleanup
// @access  Private
router.delete('/cleanup', auth, async (req, res) => {
  try {
    const cutoffDate = req.body.cutoffDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: 30 days
    
    const result = await Notification.deleteMany({
      recipient: req.user.id,
      date: { $lt: cutoffDate }
    });
    
    res.json({
      message: `${result.deletedCount} old notifications have been cleaned up`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('Error cleaning up old notifications:', err.message);
    res.status(500).json({ message: 'Erreur lors du nettoyage des anciennes notifications' });
  }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }
    
    // Check if the notification belongs to the user
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à marquer cette notification comme lue' });
    }
    
    notification.read = true;
    await notification.save();
    
    res.json(notification);
  } catch (err) {
    console.error('Error marking notification as read:', err.message);
    res.status(500).json({ message: 'Erreur lors du marquage de la notification comme lue' });
  }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { $set: { read: true } }
    );
    
    res.json({ message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (err) {
    console.error('Error marking all notifications as read:', err.message);
    res.status(500).json({ message: 'Erreur lors du marquage de toutes les notifications comme lues' });
  }
});

// @desc    Mark all notifications as unread
// @route   PUT /api/notifications/unread-all
// @access  Private
router.put('/unread-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id },
      { $set: { read: false } }
    );
    
    res.json({ message: 'Toutes les notifications ont été marquées comme non lues' });
  } catch (err) {
    console.error('Error marking all notifications as unread:', err.message);
    res.status(500).json({ message: 'Erreur lors du marquage de toutes les notifications comme non lues' });
  }
});

// @desc    Create a notification (internal use by other routes)
// @route   POST /api/notifications
// @access  Private/Admin
router.post('/', auth, async (req, res) => {
  try {
    const { recipient, type, content, relatedProject, relatedComment } = req.body;
    
    // Verify that recipient exists
    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return res.status(404).json({ message: 'Utilisateur destinataire non trouvé' });
    }
    
    // Create notification
    const notification = new Notification({
      recipient,
      sender: req.user.id,
      type,
      content,
      relatedProject,
      relatedComment
    });
    
    await notification.save();
    
    res.json(notification);
  } catch (err) {
    console.error('Error creating notification:', err.message);
    res.status(500).json({ message: 'Erreur lors de la création de la notification' });
  }
});

// @desc    Delete all notifications for a user
// @route   DELETE /api/notifications/delete-all
// @access  Private
router.delete('/delete-all', auth, async (req, res) => {
  try {
    const result = await Notification.deleteMany({ recipient: req.user.id });
    
    res.json({ 
      message: `${result.deletedCount} notifications ont été supprimées`,
      deletedCount: result.deletedCount 
    });
  } catch (err) {
    console.error('Error deleting all notifications:', err.message);
    res.status(500).json({ message: 'Erreur lors de la suppression de toutes les notifications' });
  }
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }
    
    // Check if the notification belongs to the user
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à supprimer cette notification' });
    }
    
    await notification.deleteOne();
    
    res.json({ message: 'Notification supprimée' });
  } catch (err) {
    console.error('Error deleting notification:', err.message);
    res.status(500).json({ message: 'Erreur lors de la suppression de la notification' });
  }
});

module.exports = router; 