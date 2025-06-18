const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  codeforcesHandle: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  currentRating: {
    type: Number,
    default: 0
  },
  maxRating: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  emailNotificationsEnabled: {
    type: Boolean,
    default: true
  },
  reminderEmailCount: {
    type: Number,
    default: 0
  },
  lastReminderSent: {
    type: Date
  },
  contestHistory: [{
    contestId: Number,
    contestName: String,
    rank: Number,
    oldRating: Number,
    newRating: Number,
    ratingChange: Number,
    unsolvedProblems: [String],
    date: Date
  }],
  problemSolvingStats: {
    totalSolved: {
      type: Number,
      default: 0
    },
    problemsByRating: [{
      rating: Number,
      count: Number,
    }],
    submissions: [{
      problemId: String,
      problemName: String,
      rating: Number,
      submissionTime: Date,
      verdict: String
    }]
  },
  inactivityTracking: {
    lastSubmissionDate: Date,
    reminderEmailsSent: {
      type: Number,
      default: 0
    },
    lastReminderSent: Date,
    emailRemindersEnabled: {
      type: Boolean,
      default: true
    },
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema); 