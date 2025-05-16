const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'project_assignment', 
      'comment', 
      'project_update', 
      'role_change', 
      'deadline', 
      'mention', 
      'account_update',
      'progress_milestone',
      'deadline_approaching',
      'project_change',
      'team_change',
      'risk_alert',
      'inactivity_alert',
      'approval_request',
      'project_digest'
    ],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  relatedProject: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  relatedComment: {
    type: Schema.Types.ObjectId
  },
  read: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
});

module.exports = Notification = mongoose.model('Notification', NotificationSchema); 