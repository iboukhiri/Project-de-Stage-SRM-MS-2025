const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const notificationService = require('../utils/notificationService');
const projectService = require('../utils/projectService');

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // All authenticated users can view any project - no permission check needed
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new project
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      assignedTo,
      guaranteeDays
    } = req.body;

    const project = new Project({
      title,
      description,
      startDate,
      endDate,
      createdBy: req.user.id,
      assignedTo,
      guaranteeDays: guaranteeDays || 0
    });

    await project.save();
    
    // Create notification if project is assigned to a user
    if (assignedTo) {
      await notificationService.createProjectAssignmentNotification(
        project._id,
        assignedTo,
        req.user.id,
        title
      );
    }
    
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    // Only allow creator, superadmin, or admin (with exceptions) to edit
    if (
      project.createdBy.toString() !== req.user.id && // Not the creator
      req.user.role !== 'superadmin' && // Not a superadmin (superadmins can edit any project)
      !(req.user.role === 'admin' && project.createdBy.role !== 'admin') // Admin can't edit other admin's projects
    ) {
      return res.status(401).json({ msg: 'Not authorized to edit this project' });
    }

    const { title, description, status, progress, startDate, endDate, assignedTo, guaranteeDays } = req.body;

    // Build project object
    const projectFields = {};
    if (title) projectFields.title = title;
    if (description) projectFields.description = description;
    if (status) projectFields.status = status;
    if (progress !== undefined) projectFields.progress = progress;
    if (startDate) projectFields.startDate = startDate;
    if (endDate) projectFields.endDate = endDate;
    if (assignedTo) projectFields.assignedTo = assignedTo;
    if (guaranteeDays !== undefined) projectFields.guaranteeDays = guaranteeDays;

    // Check if assignedTo has changed
    const assignmentChanged = assignedTo && 
      (project.assignedTo === null || project.assignedTo === undefined || 
       project.assignedTo.toString() !== assignedTo);

    // Check if status has changed
    const statusChanged = status && status !== project.status;
       
    // Update project
    project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: projectFields },
      { new: true }
    );

    // Create notification if assignedTo has changed
    if (assignmentChanged) {
      await notificationService.createProjectAssignmentNotification(
        project._id,
        assignedTo,
        req.user.id,
        project.title
      );
    }

    // Create notification if status has changed
    if (statusChanged && assignedTo) {
      await notificationService.createProjectUpdateNotification(
        project._id,
        req.user.id,
        assignedTo,
        project.title,
        status
      );
    }

    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add comment to project
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Any authenticated user can add comments - no permission check needed
    const newComment = {
      user: req.user.id,
      content: req.body.content
    };

    project.comments.unshift(newComment);
    await project.save();
    
    // Create notification for project owner if the commenter is not the owner
    if (project.createdBy.toString() !== req.user.id) {
      await notificationService.createCommentNotification(
        project._id,
        project.comments[0]._id, // The newly added comment is at index 0
        req.user.id,
        project.createdBy,
        project.title
      );
    }
    
    // Create notification for all assigned users who aren't the commenter or owner
    if (project.assignedTo && project.assignedTo.length > 0) {
      for (const assignedUser of project.assignedTo) {
        if (assignedUser.toString() !== req.user.id && 
            assignedUser.toString() !== project.createdBy.toString()) {
          await notificationService.createCommentNotification(
            project._id,
            project.comments[0]._id,
            req.user.id,
            assignedUser,
            project.title
          );
        }
      }
    }
    
    // Fetch the updated project with populated data
    const updatedProject = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name email');
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check project ownership or admin rights
    if (
      project.createdBy.toString() !== req.user.id && // Not the creator
      req.user.role !== 'superadmin' && // Not a superadmin (superadmins can delete any project)
      !(req.user.role === 'admin' && project.createdBy.role !== 'admin') // Admin can't delete other admin's projects
    ) {
      return res.status(401).json({ msg: 'Not authorized to delete this project' });
    }

    await project.deleteOne();
    res.json({ msg: 'Project removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete comment
router.delete('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Find the comment
    const comment = project.comments.find(
      comment => comment._id.toString() === req.params.commentId
    );
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is authorized to delete the comment
    // Users can delete their own comments
    // Project owners can delete any comment on their projects
    // Admins, managers, and superadmins can delete any comment
    if (comment.user.toString() !== req.user.id && 
        project.createdBy.toString() !== req.user.id && 
        req.user.role !== 'manager' &&
        req.user.role !== 'admin' && 
        req.user.role !== 'superadmin') {
      return res.status(401).json({ message: 'Not authorized to delete this comment' });
    }
    
    // Remove the comment
    project.comments = project.comments.filter(
      comment => comment._id.toString() !== req.params.commentId
    );
    
    await project.save();
    
    // Return the updated project with populated data
    const updatedProject = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name email');
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new route for editing comments
// @desc    Edit a comment
// @route   PUT /api/projects/:id/comments/:commentId
// @access  Private
router.put('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get the comment
    const comment = project.comments.find(
      comment => comment._id.toString() === req.params.commentId
    );

    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is authorized to edit comment
    // Users can edit their own comments
    // Project owners can edit any comment on their projects 
    // Managers, admins, and superadmins can edit any comment
    if (
      comment.user.toString() !== req.user.id && // Not the comment creator
      project.createdBy.toString() !== req.user.id && // Not the project owner
      req.user.role !== 'manager' && // Not a manager
      req.user.role !== 'admin' && // Not an admin
      req.user.role !== 'superadmin' // Not a superadmin
    ) {
      return res.status(401).json({ message: 'Not authorized to edit this comment' });
    }

    // Update the comment
    const { content } = req.body;
    if (content) {
      comment.content = content;
      comment.updatedAt = Date.now();
    }

    await project.save();
    
    // Return the updated project with populated data
    const updatedProject = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name email');
    
    res.json(updatedProject);
  } catch (err) {
    console.error('Error editing comment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get project statistics
// @route   GET /api/projects/stats
// @access  Private/SuperAdmin
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Unauthorized: Only super administrators can access these statistics' });
    }
    
    const totalProjects = await Project.countDocuments();
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    const inProgressProjects = await Project.countDocuments({ status: 'in-progress' });
    const notStartedProjects = await Project.countDocuments({ status: 'not-started' });
    
    res.json({
      totalProjects,
      completedProjects,
      inProgressProjects,
      notStartedProjects
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/projects/check-guarantees
// @desc    Vérifier et mettre à jour les phases de garantie des projets
// @access  Private (Admin/SuperAdmin)
router.post('/check-guarantees', auth, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin ou superadmin
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ msg: 'Accès non autorisé' });
    }

    const result = await projectService.checkAndUpdateGuaranteePhases();
    
    res.json({ 
      success: true, 
      message: `${result.projectsUpdated} projet(s) mis à jour`,
      details: {
        enteringGuarantee: result.enteringGuarantee,
        completedAfterGuarantee: result.completedAfterGuarantee
      }
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

// @route   POST /api/projects/check-milestones
// @desc    Vérifier les jalons de progression des projets
// @access  Private (Admin/SuperAdmin)
router.post('/check-milestones', auth, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin ou superadmin
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ msg: 'Accès non autorisé' });
    }

    const result = await projectService.checkProgressMilestones();
    
    res.json({ 
      success: true, 
      message: `${result.notificationsCreated} notification(s) créée(s) pour les jalons de progression`,
      projects: result.projectsChecked
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

// @route   POST /api/projects/check-deadlines
// @desc    Vérifier les échéances approchantes des projets
// @access  Private (Admin/SuperAdmin)
router.post('/check-deadlines', auth, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin ou superadmin
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ msg: 'Accès non autorisé' });
    }

    const result = await projectService.checkDeadlineApproaching();
    
    res.json({ 
      success: true, 
      message: `${result.notificationsCreated} notification(s) créée(s) pour les échéances approchantes`,
      projects: result.projectsChecked
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

// @route   POST /api/projects/check-inactive
// @desc    Vérifier les projets inactifs
// @access  Private (Admin/SuperAdmin)
router.post('/check-inactive', auth, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin ou superadmin
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ msg: 'Accès non autorisé' });
    }

    const result = await projectService.checkInactiveProjects();
    
    res.json({ 
      success: true, 
      message: `${result.notificationsCreated} notification(s) créée(s) pour les projets inactifs`,
      projects: result.projectsChecked
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;