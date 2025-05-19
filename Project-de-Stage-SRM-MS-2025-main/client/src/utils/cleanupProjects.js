import axios from 'axios';
import config from '../config';

/**
 * Deletes projects that have comments only from admin user
 * @param {string} token - Authentication token
 * @returns {Promise<{success: boolean, message: string, deletedCount?: number}>}
 */
const deleteProjectsWithOnlyAdminComments = async (token) => {
  try {
    if (!token) {
      return { success: false, message: 'Token d\'authentification requis' };
    }
    
    // Configure axios with token
    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    };
    
    // 1. Get all projects
    const projectsResponse = await axios.get(`${config.API_URL}/api/projects`, axiosConfig);
    const projects = projectsResponse.data;
    
    // 2. Get all users to identify admin
    const usersResponse = await axios.get(`${config.API_URL}/api/users`, axiosConfig);
    const users = usersResponse.data;
    
    // Find admin users
    const adminUsers = users.filter(user => user.role === 'admin').map(admin => admin._id);
    
    if (adminUsers.length === 0) {
      return { success: false, message: 'Aucun utilisateur admin trouvé' };
    }
    
    // 3. Find projects where all comments are from admin
    const projectsToDelete = projects.filter(project => {
      // Skip projects with no comments
      if (!project.comments || project.comments.length === 0) {
        return false;
      }
      
      // Check if all comments are from admin users
      const nonAdminComments = project.comments.filter(
        comment => !adminUsers.includes(comment.user)
      );
      
      return nonAdminComments.length === 0;
    });
    
    // 4. Delete these projects
    let deletedCount = 0;
    
    for (const project of projectsToDelete) {
      try {
        await axios.delete(`${config.API_URL}/api/projects/${project._id}`, axiosConfig);
        deletedCount++;
      } catch (error) {
        console.error(`Error deleting project ${project._id}:`, error);
      }
    }
    
    return {
      success: true,
      message: `${deletedCount} projets avec commentaires uniquement d'admin ont été supprimés.`,
      deletedCount
    };
    
  } catch (error) {
    console.error('Error cleaning up projects:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Une erreur s\'est produite'
    };
  }
};

/**
 * Updates the end date of completed projects to make them appear in the current month stats
 * @param {string} token - Authentication token
 * @param {number} count - Number of projects to update
 * @returns {Promise<{success: boolean, message: string, updatedCount?: number}>}
 */
const updateProjectEndDates = async (token, count = 5) => {
  try {
    if (!token) {
      return { success: false, message: 'Token d\'authentification requis' };
    }
    
    // Configure axios with token
    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    };
    
    // 1. Get all projects
    const response = await axios.get(`${config.API_URL}/api/projects`, axiosConfig);
    const projects = response.data;
    
    // 2. Filter for completed projects
    const completedProjects = projects.filter(
      project => project.status === 'Completed' || project.status === 'Terminé'
    );
    
    if (completedProjects.length === 0) {
      return { 
        success: false, 
        message: 'Aucun projet terminé trouvé.' 
      };
    }
    
    // 3. Take a subset of projects to update
    const projectsToUpdate = completedProjects.slice(0, Math.min(count, completedProjects.length));
    
    // 4. Get current date
    const now = new Date();
    
    // 5. Update each project
    let updatedCount = 0;
    
    for (const project of projectsToUpdate) {
      try {
        // Update the project's end date to today
        await axios.put(
          `${config.API_URL}/api/projects/${project._id}`,
          { 
            endDate: now.toISOString() 
          },
          axiosConfig
        );
        
        updatedCount++;
      } catch (error) {
        console.error(`Error updating project ${project._id}:`, error);
      }
    }
    
    return {
      success: true,
      message: `${updatedCount} projets ont été mis à jour pour apparaître dans les statistiques du mois en cours.`,
      updatedCount
    };
    
  } catch (error) {
    console.error('Error updating project end dates:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Une erreur s\'est produite'
    };
  }
};

export { deleteProjectsWithOnlyAdminComments, updateProjectEndDates }; 