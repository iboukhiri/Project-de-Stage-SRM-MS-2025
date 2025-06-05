# 🎯 Demo Setup Guide - SRM Project Tracker

## 🚀 Quick Start

This guide will help you set up demo accounts and projects for testing the SRM Project Tracker application.

## 📋 Prerequisites

1. MongoDB running locally or connection string configured
2. Node.js and npm installed
3. Environment variables properly configured (`.env` file)

## 🎪 Demo Data Seeding

### Run the Demo Seeder

```bash
npm run seed-demo
```

This command will:
- Clear any existing demo data
- Create 3 demo user accounts with different roles
- Create 5 demo projects with various statuses
- Add realistic comments and project assignments

## 👥 Demo Accounts

| Role | Email | Password | Permissions |
|------|--------|----------|-------------|
| **Super Admin** | `superadmin@demo.com` | `demo123` | Full system access, user management, all projects |
| **Chef de Projet** | `manager@demo.com` | `demo123` | Project management, team oversight, create/edit projects |
| **Employé** | `employee@demo.com` | `demo123` | Work on assigned projects, add comments, basic access |

## 📊 Demo Projects

The seeder creates 5 realistic projects:

1. **Développement Site Web E-commerce** 
   - Status: En cours (65%)
   - Assigned: Manager + Employee
   - With comments and progress tracking

2. **Application Mobile de Gestion RH**
   - Status: Terminé (100%)
   - Completed project with warranty period

3. **Système de Gestion Documentaire**
   - Status: En attente (25%)
   - Waiting for client approval

4. **Dashboard Analytics en Temps Réel**
   - Status: Non démarré (0%)
   - Future project

5. **API RESTful pour IoT**
   - Status: En garantie (100%)
   - Completed project in warranty period

## 🔄 Testing Different User Roles

### As Super Admin (`superadmin@demo.com`)
- View all projects and users
- Create, edit, and delete any project
- Manage user accounts and roles
- Access full dashboard analytics
- Edit/delete any comments

### As Chef de Projet (`manager@demo.com`)
- Create and manage projects
- Assign team members to projects
- View project analytics
- Edit projects you created
- Manage project comments

### As Employé (`employee@demo.com`)
- View assigned projects
- Update progress on assigned tasks
- Add comments to projects
- Basic dashboard access
- Limited project visibility

## 🎨 Features to Test

### Project Management
- Create new projects with different statuses
- Assign team members
- Track progress and milestones
- Set warranty periods

### Comments System
- Add comments to projects
- Edit your own comments
- Role-based comment permissions
- Real-time comment updates

### Dashboard Analytics
- Project completion statistics
- Progress visualizations
- Role-based data access
- Interactive charts and graphs

### User Management (Super Admin only)
- Create new users
- Assign roles
- Edit user permissions
- Monitor user activity

## 🔧 Customization

### Adding More Demo Data

You can modify `server/src/scripts/seedDemo.js` to:
- Add more demo users
- Create additional projects
- Customize project statuses
- Add more realistic comments

### Resetting Demo Data

To reset the demo data, simply run the seeder again:
```bash
npm run seed-demo
```

This will clear existing demo accounts and projects, then recreate them.

## 🌐 Accessing the Application

1. Start the application:
   ```bash
   npm run dev:full
   ```

2. Open your browser and go to: `http://localhost:3000`

3. Login with any of the demo accounts:
   - Email: `superadmin@demo.com` | Password: `demo123`
   - Email: `manager@demo.com` | Password: `demo123`
   - Email: `employee@demo.com` | Password: `demo123`

## 🎯 Demo Scenarios

### Scenario 1: Project Manager Workflow
1. Login as `manager@demo.com`
2. Create a new project
3. Assign the employee to the project
4. Add comments and track progress
5. Update project status

### Scenario 2: Employee Workflow
1. Login as `employee@demo.com`
2. View assigned projects
3. Update progress on tasks
4. Add comments and updates
5. Check project details

### Scenario 3: Admin Management
1. Login as `superadmin@demo.com`
2. View all users and projects
3. Create new users with different roles
4. Manage project permissions
5. Access full analytics dashboard

## 📝 Notes

- All demo passwords are `demo123` for simplicity
- Demo data is clearly labeled with "DEMO -" prefix
- Projects have realistic French descriptions and comments
- Different project statuses demonstrate all system capabilities
- Comments include timestamps to show progression

## 🆘 Troubleshooting

- **Database Connection**: Ensure MongoDB is running and the connection string in `.env` is correct
- **Seeding Fails**: Check that all dependencies are installed with `npm install`
- **Login Issues**: Verify the seeding completed successfully and check for any error messages

---

✨ **Happy Testing!** The demo environment provides a comprehensive showcase of all SRM Project Tracker features. 