const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: null
  }
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Non démarré', 'En cours', 'En attente', 'Terminé', 'En garantie'],
    default: 'Not Started'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  guaranteeDays: {
    type: Number,
    default: 0
  },
  guaranteeEndDate: {
    type: Date,
    default: null
  }
});

// Update the updatedAt timestamp before saving
projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  if (this.guaranteeDays > 0 && (!this.guaranteeEndDate || this.isModified('guaranteeDays'))) {
    const today = new Date();
    this.guaranteeEndDate = new Date(today.setDate(today.getDate() + this.guaranteeDays));
    
    if (this.progress === 100) {
      this.status = 'En garantie';
    }
  }
  
  next();
});

module.exports = mongoose.model('Project', projectSchema); 