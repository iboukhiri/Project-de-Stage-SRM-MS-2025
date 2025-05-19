import axios from 'axios';
import config from '../config';

/**
 * Updates a specified number of completed projects to be marked as completed in the current month
 * @param {string} token - Authentication token
 * @param {number} count - Number of projects to mark as completed this month (default: 3)
 * @returns {Promise<{success: boolean, message: string, updatedProjects?: Array}>}
 */
const setProjectsCompletedThisMonth = async (token, count = 3) => {
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
        message: 'Aucun projet terminé trouvé. Vous devez avoir des projets avec le statut "Terminé".' 
      };
    }
    
    // 3. Take a subset of projects to update (no more than what's available)
    const projectsToUpdate = completedProjects.slice(0, Math.min(count, completedProjects.length));
    
    // 4. Get current date (for setting updatedAt)
    const now = new Date();
    
    // 5. Update each project with a current date
    const updatedProjects = [];
    
    for (const project of projectsToUpdate) {
      try {
        // Update the project's end date to today
        const updateResponse = await axios.put(
          `${config.API_URL}/api/projects/${project._id}`,
          { 
            endDate: now.toISOString() 
          },
          axiosConfig
        );
        
        updatedProjects.push(updateResponse.data);
      } catch (error) {
        console.error(`Error updating project ${project._id}:`, error);
      }
    }
    
    return {
      success: true,
      message: `${updatedProjects.length} projets ont été marqués comme terminés ce mois-ci.`,
      updatedProjects
    };
    
  } catch (error) {
    console.error('Error setting projects as completed this month:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Une erreur s\'est produite'
    };
  }
};

export default setProjectsCompletedThisMonth; 