const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');

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
    
    res.json(project);
  } catch (error) {
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
      assignedTo
    } = req.body;

    const project = new Project({
      title,
      description,
      startDate,
      endDate,
      createdBy: req.user.id,
      assignedTo
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is creator or admin
    if (project.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    )
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .populate('comments.user', 'name email');

    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to project
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.comments.unshift({
      user: req.user.id,
      content: req.body.content
    });

    await project.save();
    
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
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is creator or admin
    if (project.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Using deleteOne instead of remove which is deprecated
    await Project.deleteOne({ _id: req.params.id });
    res.json({ message: 'Project removed' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment
router.delete('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    console.log('Delete comment request:', { 
      projectId: req.params.id,
      commentId: req.params.commentId,
      userId: req.user.id,
      userRole: req.user.role
    });
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Find the comment
    const comment = project.comments.find(
      comment => comment._id.toString() === req.params.commentId
    );

    if (!comment) {
      console.log('Comment not found. Available comments:', project.comments.map(c => ({ 
        id: c._id.toString(),
        user: c.user.toString()
      })));
      return res.status(404).json({ message: 'Comment not found' });
    }

    console.log('Found comment:', {
      commentId: comment._id.toString(),
      commentUserId: comment.user.toString(),
      requestUserId: req.user.id,
      userRole: req.user.role,
      isAdmin: req.user.role === 'admin',
      isCommentOwner: comment.user.toString() === req.user.id
    });

    // Check if user is admin or the comment owner
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Remove the comment
    const commentIndex = project.comments.findIndex(
      comment => comment._id.toString() === req.params.commentId
    );
    
    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found when trying to remove' });
    }
    
    project.comments.splice(commentIndex, 1);
    
    console.log('Comment removed, saving project');
    
    await project.save();
    
    // Return updated project
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

module.exports = router; 