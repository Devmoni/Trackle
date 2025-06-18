# Student Progress Management System

A comprehensive system for tracking and managing student progress on Codeforces.

## Features

- Student management with Codeforces integration
- Detailed contest history and problem-solving analytics
- Automated data synchronization with Codeforces
- Inactivity detection and email notifications
- Responsive design with light/dark mode support

## Tech Stack

- Frontend: React.js with Material-UI
- Backend: Node.js with Express
- Database: MongoDB
- Authentication: JWT
- Email Service: Nodemailer
- Data Visualization: Chart.js, React-Calendar-Heatmap

## Project Structure

```
student-progress-system/
├── client/                 # Frontend React application
├── server/                 # Backend Node.js application
├── .gitignore             # Git ignore file
└── README.md              # Project documentation
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   EMAIL_SERVICE=your_email_service
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## API Documentation

The API documentation can be found in the `server/docs` directory.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 