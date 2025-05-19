const Notification = require('../models/Notification');
const User = require('../models/User');

// Create a notification for project assignment
const createProjectAssignmentNotification = async (projectId, assignedUserId, assignerUserId, projectTitle) => {
  try {
    const assigner = await User.findById(assignerUserId);
    if (!assigner) {
      console.error('Assigner user not found');
      throw new Error('Assigner user not found');
    }

    const content = `${assigner.name} vous a assigné(e) au projet "${projectTitle}"`;
    
    const notification = new Notification({
      recipient: assignedUserId,
      sender: assignerUserId,
      type: 'project_assignment',
      content,
      relatedProject: projectId
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating project assignment notification:', error);
    throw error; // Propagate the error to allow proper handling upstream
  }
};

// Create a notification for new comment on project
const createCommentNotification = async (projectId, commentId, commenterId, recipientId, projectTitle) => {
  try {
    const commenter = await User.findById(commenterId);
    if (!commenter) {
      console.error('Commenter user not found');
      throw new Error('Commenter user not found');
    }

    const content = `${commenter.name} a commenté sur le projet "${projectTitle}"`;
    
    const notification = new Notification({
      recipient: recipientId,
      sender: commenterId,
      type: 'comment',
      content,
      relatedProject: projectId,
      relatedComment: commentId
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating comment notification:', error);
    throw error; // Propagate the error to allow proper handling upstream
  }
};

// Create a notification for project status update
const createProjectUpdateNotification = async (projectId, updaterId, recipientId, projectTitle, status) => {
  try {
    const updater = await User.findById(updaterId);
    if (!updater) {
      console.error('Updater user not found');
      return null;
    }

    let statusFrench;
    switch (status) {
      case 'in-progress':
        statusFrench = 'En cours';
        break;
      case 'completed':
        statusFrench = 'Terminé';
        break;
      case 'on-hold':
        statusFrench = 'En attente';
        break;
      case 'cancelled':
        statusFrench = 'Annulé';
        break;
      default:
        statusFrench = status;
    }

    const content = `${updater.name} a mis à jour le statut du projet "${projectTitle}" à "${statusFrench}"`;
    
    const notification = new Notification({
      recipient: recipientId,
      sender: updaterId,
      type: 'project_update',
      content,
      relatedProject: projectId
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating project update notification:', error);
    return null;
  }
};

// Create a notification for role change
const createRoleChangeNotification = async (adminId, userId, newRole) => {
  try {
    const admin = await User.findById(adminId);
    if (!admin) {
      console.error('Admin user not found');
      return null;
    }

    let roleFrench;
    switch (newRole) {
      case 'superadmin':
        roleFrench = 'Super Administrateur';
        break;
      case 'manager':
        roleFrench = 'Chef de Projet';
        break;
      case 'employee':
        roleFrench = 'Employé';
        break;
      default:
        roleFrench = 'Employé';
    }

    const content = `${admin.name} a changé votre rôle à "${roleFrench}"`;
    
    const notification = new Notification({
      recipient: userId,
      sender: adminId,
      type: 'role_change',
      content
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating role change notification:', error);
    return null;
  }
};

// Create a notification for deadline reminder
const createDeadlineNotification = async (projectId, recipientId, projectTitle, daysLeft) => {
  try {
    let content;
    if (daysLeft === 0) {
      content = `Votre projet "${projectTitle}" est dû aujourd'hui`;
    } else if (daysLeft === 1) {
      content = `Votre projet "${projectTitle}" est dû demain`;
    } else {
      content = `Votre projet "${projectTitle}" est dû dans ${daysLeft} jours`;
    }
    
    const notification = new Notification({
      recipient: recipientId,
      type: 'deadline',
      content,
      relatedProject: projectId
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating deadline notification:', error);
    return null;
  }
};

// Create a notification for user mention in comment
const createMentionNotification = async (projectId, commentId, mentionerId, mentionedId, projectTitle) => {
  try {
    const mentioner = await User.findById(mentionerId);
    if (!mentioner) {
      console.error('Mentioner user not found');
      return null;
    }

    const content = `${mentioner.name} vous a mentionné(e) dans un commentaire sur le projet "${projectTitle}"`;
    
    const notification = new Notification({
      recipient: mentionedId,
      sender: mentionerId,
      type: 'mention',
      content,
      relatedProject: projectId,
      relatedComment: commentId
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating mention notification:', error);
    return null;
  }
};

// Create a notification for account credential update
const createAccountUpdateNotification = async (userId, hasPasswordChanged, hasEmailChanged) => {
  try {
    let content;
    if (hasPasswordChanged && hasEmailChanged) {
      content = `Vos informations d'identification (e-mail et mot de passe) ont été mises à jour`;
    } else if (hasPasswordChanged) {
      content = `Votre mot de passe a été mis à jour`;
    } else if (hasEmailChanged) {
      content = `Votre adresse e-mail a été mise à jour`;
    } else {
      content = `Vos informations de compte ont été mises à jour`;
    }
    
    const notification = new Notification({
      recipient: userId,
      type: 'account_update',
      content
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating account update notification:', error);
    return null;
  }
};

// Create a notification for project entering guarantee phase
const createGuaranteeStartNotification = async (projectId, projectTitle, adminIds) => {
  try {
    const content = `Le projet "${projectTitle}" est entré en phase de garantie`;
    
    // Créer une notification pour chaque admin
    const notifications = [];
    for (const adminId of adminIds) {
      const notification = new Notification({
        recipient: adminId,
        type: 'project_update',
        content,
        relatedProject: projectId
      });

      await notification.save();
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error('Error creating guarantee start notification:', error);
    return null;
  }
};

// Create a notification for project guarantee phase ending
const createGuaranteeEndNotification = async (projectId, projectTitle, adminIds) => {
  try {
    const content = `La phase de garantie du projet "${projectTitle}" est terminée. Le projet est maintenant marqué comme "Terminé"`;
    
    // Créer une notification pour chaque admin
    const notifications = [];
    for (const adminId of adminIds) {
      const notification = new Notification({
        recipient: adminId,
        type: 'project_update',
        content,
        relatedProject: projectId
      });

      await notification.save();
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error('Error creating guarantee end notification:', error);
    return null;
  }
};

// Create a notification for progress milestones
const createProgressMilestoneNotification = async (projectId, projectTitle, milestone, recipientIds) => {
  try {
    const content = `Le projet "${projectTitle}" a atteint ${milestone}% d'avancement`;
    
    const notifications = [];
    for (const recipientId of recipientIds) {
      const notification = new Notification({
        recipient: recipientId,
        type: 'progress_milestone',
        content,
        relatedProject: projectId
      });

      await notification.save();
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error('Error creating progress milestone notification:', error);
    return null;
  }
};

// Create a notification for project deadline approaching
const createDeadlineApproachingNotification = async (projectId, projectTitle, daysRemaining, recipientIds) => {
  try {
    const content = `Attention: Il ne reste plus que ${daysRemaining} jours avant la date limite du projet "${projectTitle}"`;
    
    const notifications = [];
    for (const recipientId of recipientIds) {
      const notification = new Notification({
        recipient: recipientId,
        type: 'deadline_approaching',
        content,
        relatedProject: projectId
      });

      await notification.save();
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error('Error creating deadline approaching notification:', error);
    return null;
  }
};

// Create a notification for project scope or requirements change
const createProjectChangeNotification = async (projectId, projectTitle, changeType, adminId, recipientIds) => {
  try {
    const admin = await User.findById(adminId);
    if (!admin) {
      console.error('Admin user not found');
      return null;
    }

    const content = `${admin.name} a modifié ${changeType} du projet "${projectTitle}"`;
    
    const notifications = [];
    for (const recipientId of recipientIds) {
      const notification = new Notification({
        recipient: recipientId,
        sender: adminId,
        type: 'project_change',
        content,
        relatedProject: projectId
      });

      await notification.save();
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error('Error creating project change notification:', error);
    return null;
  }
};

// Create a notification for team membership changes
const createTeamChangeNotification = async (projectId, projectTitle, addedUserIds, removedUserIds, updaterId) => {
  try {
    const updater = await User.findById(updaterId);
    if (!updater) {
      console.error('Updater user not found');
      return null;
    }

    const notifications = [];

    // Notifier les utilisateurs ajoutés
    for (const userId of addedUserIds) {
      const notification = new Notification({
        recipient: userId,
        sender: updaterId,
        type: 'team_change',
        content: `${updater.name} vous a ajouté(e) à l'équipe du projet "${projectTitle}"`,
        relatedProject: projectId
      });

      await notification.save();
      notifications.push(notification);
    }

    // Notifier les utilisateurs retirés
    for (const userId of removedUserIds) {
      const notification = new Notification({
        recipient: userId,
        sender: updaterId,
        type: 'team_change',
        content: `${updater.name} vous a retiré(e) de l'équipe du projet "${projectTitle}"`,
        relatedProject: projectId
      });

      await notification.save();
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error('Error creating team change notification:', error);
    return null;
  }
};

// Create a notification for project risk identified
const createRiskNotification = async (projectId, projectTitle, riskDescription, reporterId, recipientIds) => {
  try {
    const reporter = await User.findById(reporterId);
    if (!reporter) {
      console.error('Reporter user not found');
      return null;
    }

    const content = `${reporter.name} a identifié un risque pour le projet "${projectTitle}": ${riskDescription}`;
    
    const notifications = [];
    for (const recipientId of recipientIds) {
      const notification = new Notification({
        recipient: recipientId,
        sender: reporterId,
        type: 'risk_alert',
        content,
        relatedProject: projectId
      });

      await notification.save();
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error('Error creating risk notification:', error);
    return null;
  }
};

// Create a notification for project inactivity
const createInactivityNotification = async (projectId, projectTitle, daysSinceLastUpdate, recipientIds) => {
  try {
    const content = `Le projet "${projectTitle}" n'a pas été mis à jour depuis ${daysSinceLastUpdate} jours`;
    
    const notifications = [];
    for (const recipientId of recipientIds) {
      const notification = new Notification({
        recipient: recipientId,
        type: 'inactivity_alert',
        content,
        relatedProject: projectId
      });

      await notification.save();
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error('Error creating inactivity notification:', error);
    return null;
  }
};

// Create a notification for project approval needed
const createApprovalRequestNotification = async (projectId, projectTitle, requesterId, approverIds, itemToApprove) => {
  try {
    const requester = await User.findById(requesterId);
    if (!requester) {
      console.error('Requester user not found');
      return null;
    }

    const content = `${requester.name} demande votre approbation pour ${itemToApprove} sur le projet "${projectTitle}"`;
    
    const notifications = [];
    for (const approverId of approverIds) {
      const notification = new Notification({
        recipient: approverId,
        sender: requesterId,
        type: 'approval_request',
        content,
        relatedProject: projectId
      });

      await notification.save();
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error('Error creating approval request notification:', error);
    return null;
  }
};

// Create a notification for weekly project digest
const createProjectDigestNotification = async (projectId, projectTitle, activities, recipientIds) => {
  try {
    const content = `Résumé hebdomadaire du projet "${projectTitle}": ${activities.length} activités récentes`;
    
    const notifications = [];
    for (const recipientId of recipientIds) {
      const notification = new Notification({
        recipient: recipientId,
        type: 'project_digest',
        content,
        relatedProject: projectId,
        metadata: { activities }
      });

      await notification.save();
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error('Error creating project digest notification:', error);
    return null;
  }
};

module.exports = {
  createProjectAssignmentNotification,
  createCommentNotification,
  createProjectUpdateNotification,
  createRoleChangeNotification,
  createDeadlineNotification,
  createMentionNotification,
  createAccountUpdateNotification,
  createGuaranteeStartNotification,
  createGuaranteeEndNotification,
  createProgressMilestoneNotification,
  createDeadlineApproachingNotification,
  createProjectChangeNotification,
  createTeamChangeNotification,
  createRiskNotification,
  createInactivityNotification,
  createApprovalRequestNotification,
  createProjectDigestNotification
}; 