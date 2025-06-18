const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { startSyncCron } = require('./cron/syncCodeforces');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    startSyncCron();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
  

// Routes
app.use('/api/students', require('./routes/students'));

const PORT = process.env.PORT || 5000;

// Handle port already in use
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, trying ${PORT + 1}`);
    server.close();
    app.listen(PORT + 1, () => {
      console.log(`Server is running on port ${PORT + 1}`);
    });
  } else {
    console.error('Server error:', err);
  }
}); 