========================================================================
#                      PROJET DE STAGE SRM-MS 2025                     #
========================================================================

# SRM Project Tracker

A modern project management application built with the MERN stack (MongoDB, Express.js, React, Node.js), designed to efficiently track and manage projects with advanced visualization features and role-based access control.

## 🚀 Features

### 📊 Dashboard & Visualization
- Interactive dashboard with real-time project statistics
- Advanced data visualizations (completion rates, trends, progress analysis)
- Customizable reports and metrics

### 📝 Project Management
- Complete project lifecycle management
- Progress tracking with customizable status options
- Warranty period tracking and automatic status updates
- Project filtering and sorting capabilities

### 💬 Comments & Collaboration
- Role-based comment system
- Edit and delete comments with proper permissions
- Real-time notifications for comment activities
- @mentions and collaborative discussions

### 👥 User Management
- Comprehensive role-based access control:
  - Super Admin: Full system access
  - Admin: Manage users and projects
  - Manager: Oversee multiple projects
  - Employee: Work on assigned projects
  - User: Basic access to assigned projects
- User profile management
- Activity tracking and logs

### 🔔 Notifications
- Real-time notification system
- Project deadline reminders
- Progress milestone updates
- Comment and mention alerts

### 🌓 User Experience
- Responsive design for all devices
- Light/dark mode toggle
- Modern Material-UI interface
- Optimized performance

## 🛠️ Technology Stack

### Frontend
- React.js with hooks and context API
- Material-UI component library
- Chart.js for data visualization
- Axios for API communication
- React Router for navigation

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ORM
- JWT authentication
- RESTful API architecture
- Multer for file uploads

## 📋 Installation

### Prerequisites
- Node.js (v14.x or higher)
- MongoDB (v4.x or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/your-username/srm-project-tracker.git
cd srm-project-tracker
```

2. **Backend Setup**
```bash
# Install server dependencies
npm install

# Create environment file (copy from example)
cp .env.example .env

# Configure your environment variables
# Edit the .env file with your MongoDB URI and JWT secret
```

3. **Frontend Setup**
```bash
# Navigate to client directory
cd client

# Install client dependencies
npm install

# Return to root directory
cd ..
```

4. **Running the Application**
```bash
# Run backend and frontend concurrently (from root directory)
npm run dev:full

# Or run separately:
# Backend only
npm run dev

# Frontend only
cd client
npm start
```

5. **Initial Setup**
```bash
# After running the application for the first time, use the registration page to create your first account
# Then use MongoDB Compass or a similar tool to change the role of your first user to 'superadmin'
```

## 🔐 Access Control & Permissions

| Feature | Super Admin | Admin | Manager | Employee | User |
|---------|-------------|-------|---------|----------|------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Project | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit Any Project | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit Assigned Project | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete Project | ✅ | ✅ | ❌ | ❌ | ❌ |
| Add Comment | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit Own Comment | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit Any Comment | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete Own Comment | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete Any Comment | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Statistics | ✅ | ✅ | ✅ | ❌ | ❌ |

## 📁 Project Structure

```
srm-project-tracker/
├── client/                  # React frontend
│   ├── public/              # Public assets
│   ├── src/                 # Source code
│       ├── components/      # React components
│       ├── context/         # Context API stores
│       ├── styles/          # CSS and styling
│       └── utils/           # Utility functions
│   └── package.json         # Frontend dependencies
├── server/                  # Node.js backend
│   ├── src/
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── utils/           # Utility functions
│   │   ├── config.js        # Configuration
│   │   └── server.js        # Main server file
│   └── .env.example         # Example environment variables
├── uploads/                 # File uploads directory
├── .env.example             # Example environment variables
├── .gitignore               # Git ignore rules
├── package.json             # Backend dependencies
└── README.md                # Project documentation
```

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👨‍💻 Developer

- Your Name - [GitHub Profile](https://github.com/your-username) 