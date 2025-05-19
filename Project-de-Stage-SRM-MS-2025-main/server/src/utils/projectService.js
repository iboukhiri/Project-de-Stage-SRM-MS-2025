const Project = require('../models/Project');
const User = require('../models/User');
const notificationService = require('./notificationService');

/**
 * Vérifie et met à jour les statuts des projets en fonction de leur phase de garantie
 * Cette fonction devrait être exécutée régulièrement (par exemple, via une tâche cron)
 */
const checkAndUpdateGuaranteePhases = async () => {
  try {
    const now = new Date();
    
    // 1. Trouver tous les projets avec progress = 100 qui ne sont pas encore en phase de garantie
    const projectsToEnterGuarantee = await Project.find({
      progress: 100,
      status: { $nin: ['En garantie', 'Terminé'] },
      guaranteeDays: { $gt: 0 }
    });

    // 2. Trouver tous les projets dont la date de fin de garantie est dépassée
    const projectsToComplete = await Project.find({
      status: 'En garantie',
      guaranteeEndDate: { $lt: now }
    });

    console.log(`Projets à mettre en garantie: ${projectsToEnterGuarantee.length}`);
    console.log(`Projets à terminer après garantie: ${projectsToComplete.length}`);

    // Traiter les projets qui doivent entrer en phase de garantie
    for (const project of projectsToEnterGuarantee) {
      project.status = 'En garantie';
      
      // Calculer la date de fin de garantie si ce n'est pas déjà fait
      if (!project.guaranteeEndDate && project.guaranteeDays > 0) {
        const today = new Date();
        project.guaranteeEndDate = new Date(today.setDate(today.getDate() + project.guaranteeDays));
      }
      
      await project.save();
      
      // Notifier les administrateurs
      const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select('_id');
      const adminIds = admins.map(admin => admin._id);
      
      await notificationService.createGuaranteeStartNotification(
        project._id,
        project.title,
        adminIds
      );
      
      console.log(`Projet "${project.title}" mis en phase de garantie jusqu'au ${project.guaranteeEndDate}`);
    }

    // Traiter les projets dont la garantie est terminée
    for (const project of projectsToComplete) {
      project.status = 'Terminé';
      await project.save();
      
      // Notifier les administrateurs
      const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select('_id');
      const adminIds = admins.map(admin => admin._id);
      
      await notificationService.createGuaranteeEndNotification(
        project._id,
        project.title,
        adminIds
      );
      
      console.log(`Projet "${project.title}" terminé après fin de la phase de garantie`);
    }

    return {
      projectsUpdated: projectsToEnterGuarantee.length + projectsToComplete.length,
      enteringGuarantee: projectsToEnterGuarantee.length,
      completedAfterGuarantee: projectsToComplete.length
    };
  } catch (error) {
    console.error('Erreur lors de la vérification des phases de garantie:', error);
    throw error;
  }
};

/**
 * Vérifie les jalons de progression des projets et envoie des notifications
 * Par exemple, quand un projet atteint 25%, 50%, 75% d'avancement
 */
const checkProgressMilestones = async () => {
  try {
    const milestones = [25, 50, 75]; // Jalons de progression importants
    let notificationsCreated = 0;
    
    for (const milestone of milestones) {
      // Trouver les projets qui ont exactement le % de progression du jalon
      // Ces projets viennent probablement d'être mis à jour à ce niveau
      const projects = await Project.find({
        progress: milestone,
        status: { $nin: ['Terminé', 'En garantie'] }
      }).populate('assignedTo').populate('createdBy');
      
      for (const project of projects) {
        // Déterminer qui doit recevoir les notifications (membres de l'équipe, créateur et admins)
        const recipientIds = new Set();
        
        // Ajouter le créateur
        recipientIds.add(project.createdBy._id.toString());
        
        // Ajouter les membres de l'équipe
        if (project.assignedTo && project.assignedTo.length > 0) {
          project.assignedTo.forEach(user => {
            if (user._id) recipientIds.add(user._id.toString());
          });
        }
        
        // Ajouter les admins si c'est un jalon important (50% ou 75%)
        if (milestone >= 50) {
          const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select('_id');
          admins.forEach(admin => recipientIds.add(admin._id.toString()));
        }
        
        // Créer les notifications
        if (recipientIds.size > 0) {
          await notificationService.createProgressMilestoneNotification(
            project._id,
            project.title,
            milestone,
            Array.from(recipientIds)
          );
          
          notificationsCreated += recipientIds.size;
          console.log(`${recipientIds.size} notifications créées pour le jalon ${milestone}% du projet "${project.title}"`);
        }
      }
    }
    
    return {
      notificationsCreated,
      milestonesChecked: milestones.length
    };
  } catch (error) {
    console.error('Erreur lors de la vérification des jalons de progression:', error);
    throw error;
  }
};

/**
 * Vérifie les dates d'échéance des projets et envoie des notifications
 * pour les projets dont la date limite approche
 */
const checkDeadlineApproaching = async () => {
  try {
    const now = new Date();
    const warningDays = [1, 3, 7, 14]; // Jours d'avertissement avant échéance
    let notificationsCreated = 0;
    
    // Pour chaque seuil d'avertissement
    for (const days of warningDays) {
      // Calculer la date correspondant à aujourd'hui + days jours
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      
      // Trouver tous les projets dont la date de fin est exactement dans X jours
      // Note: ceci est une approximation, une comparaison exacte nécessiterait de comparer les dates sans l'heure
      const startOfTargetDay = new Date(targetDate);
      startOfTargetDay.setHours(0, 0, 0, 0);
      
      const endOfTargetDay = new Date(targetDate);
      endOfTargetDay.setHours(23, 59, 59, 999);
      
      const projects = await Project.find({
        endDate: { $gte: startOfTargetDay, $lte: endOfTargetDay },
        status: { $nin: ['Terminé', 'En garantie'] }
      }).populate('assignedTo').populate('createdBy');
      
      for (const project of projects) {
        // Déterminer qui doit recevoir les notifications
        const recipientIds = new Set();
        
        // Ajouter le créateur
        recipientIds.add(project.createdBy._id.toString());
        
        // Ajouter les membres de l'équipe
        if (project.assignedTo && project.assignedTo.length > 0) {
          project.assignedTo.forEach(user => {
            if (user._id) recipientIds.add(user._id.toString());
          });
        }
        
        // Pour les échéances très proches (1-3 jours), ajouter les admins
        if (days <= 3) {
          const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select('_id');
          admins.forEach(admin => recipientIds.add(admin._id.toString()));
        }
        
        // Créer les notifications
        if (recipientIds.size > 0) {
          await notificationService.createDeadlineApproachingNotification(
            project._id,
            project.title,
            days,
            Array.from(recipientIds)
          );
          
          notificationsCreated += recipientIds.size;
          console.log(`${recipientIds.size} notifications créées pour l'échéance dans ${days} jours du projet "${project.title}"`);
        }
      }
    }
    
    return {
      notificationsCreated,
      deadlinesChecked: warningDays.length
    };
  } catch (error) {
    console.error('Erreur lors de la vérification des échéances approchantes:', error);
    throw error;
  }
};

/**
 * Vérifie les projets inactifs et envoie des notifications
 */
const checkInactiveProjects = async () => {
  try {
    const now = new Date();
    const inactivityThresholds = [7, 14, 30]; // Jours d'inactivité à vérifier
    let notificationsCreated = 0;
    
    // Pour chaque seuil d'inactivité
    for (const days of inactivityThresholds) {
      // Calculer la date correspondant à aujourd'hui - days jours
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - days);
      
      // Trouver tous les projets mis à jour pour la dernière fois avant cette date
      // et qui ne sont pas terminés ou en garantie
      const projects = await Project.find({
        updatedAt: { $lt: thresholdDate },
        status: { $nin: ['Terminé', 'En garantie'] }
      }).populate('createdBy');
      
      for (const project of projects) {
        // Déterminer qui doit recevoir les notifications
        // Pour l'inactivité, nous alertons principalement les administrateurs
        const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select('_id');
        const recipientIds = admins.map(admin => admin._id.toString());
        
        // Ajouter également le créateur du projet
        if (project.createdBy && project.createdBy._id) {
          recipientIds.push(project.createdBy._id.toString());
        }
        
        // Créer les notifications
        if (recipientIds.length > 0) {
          await notificationService.createInactivityNotification(
            project._id,
            project.title,
            days,
            recipientIds
          );
          
          notificationsCreated += recipientIds.length;
          console.log(`${recipientIds.length} notifications créées pour l'inactivité de ${days} jours du projet "${project.title}"`);
        }
      }
    }
    
    return {
      notificationsCreated,
      inactivityThresholdsChecked: inactivityThresholds.length
    };
  } catch (error) {
    console.error('Erreur lors de la vérification des projets inactifs:', error);
    throw error;
  }
};

module.exports = {
  checkAndUpdateGuaranteePhases,
  checkProgressMilestones,
  checkDeadlineApproaching,
  checkInactiveProjects
}; 