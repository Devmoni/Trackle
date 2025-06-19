# Student Progress Management System - Backend API Documentation

## Overview
This document describes the backend API and data structures for the Student Progress Management System. The backend is built with Node.js, Express, and MongoDB, and provides RESTful endpoints for managing students, authentication, and Codeforces data integration.

---

## Table of Contents
- [Authentication](#authentication)
- [Student Management](#student-management)
- [Codeforces Integration](#codeforces-integration)
- [Inactivity & Email Reminders](#inactivity--email-reminders)
- [Data Model](#data-model)
- [Cron Jobs](#cron-jobs)
- [Frontend Overview](#frontend-overview)

---

## Authentication


### POST `/api/auth/register`
- **Description:** Register a new student account.
- **Body:** `{ name, email, password, phoneNumber, codeforcesHandle }`
- **Response:** `{ token, student: { id, name, email, codeforcesHandle } }`

### GET `/api/auth/me`
- **Description:** Get the current logged-in student's profile (JWT required).
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Student object (without password)

---

## Student Management

### GET `/api/students/`
- **Description:** Get all students (excluding passwords).
- **Response:** Array of student objects

### GET `/api/students/:id`
- **Description:** Get a single student by ID.
- **Response:** Student object

### POST `/api/students/`
- **Description:** Create a new student. Also triggers initial Codeforces data sync.
- **Body:** `{ name, email, password, phoneNumber, codeforcesHandle }`
- **Response:** Created student object (without password)

### PUT `/api/students/:id`
- **Description:** Update a student's details. If the Codeforces handle changes, data is re-synced.
- **Body:** `{ name?, email?, password?, phoneNumber?, codeforcesHandle? }`
- **Response:** Updated student object (without password)

### DELETE `/api/students/:id`
- **Description:** Delete a student by ID.
- **Response:** `{ message: 'Student deleted' }`

### POST `/api/students/:id/sync`
- **Description:** Manually trigger Codeforces data sync for a student.
- **Response:** `{ message: 'Sync completed successfully' }`

### PUT `/api/students/:id/toggle-reminders`
- **Description:** Toggle email inactivity reminders for a student.
- **Response:** Updated student object

### GET `/api/students/:id/contests?days=<n>`
- **Description:** Get contest history for the last `n` days for a student.
- **Response:** Array of contest objects

---

## Codeforces Integration
- The backend fetches and syncs Codeforces contest and problem-solving data for each student using their handle.
- Data includes rating history, contest performance, problem-solving stats, and recent submissions.
- Data is synced on student creation, handle update, and via a daily cron job.

---

## Inactivity & Email Reminders
- The backend tracks student activity and sends reminder emails if no Codeforces submissions are detected for 7 days (if enabled).
- Email sending uses Nodemailer and is configurable via environment variables.

---

## Data Model (Student)
```js
{
  name: String,
  email: String,
  password: String (hashed),
  phoneNumber: String,
  codeforcesHandle: String,
  currentRating: Number,
  maxRating: Number,
  lastUpdated: Date,
  emailNotificationsEnabled: Boolean,
  reminderEmailCount: Number,
  lastReminderSent: Date,
  contestHistory: [
    {
      contestId: Number,
      contestName: String,
      rank: Number,
      oldRating: Number,
      newRating: Number,
      ratingChange: Number,
      unsolvedProblems: [String],
      date: Date
    }
  ],
  problemSolvingStats: {
    totalSolved: Number,
    problemsByRating: [ { rating: Number, count: Number } ],
    submissions: [
      {
        problemId: String,
        problemName: String,
        rating: Number,
        submissionTime: Date,
        verdict: String
      }
    ]
  },
  inactivityTracking: {
    lastSubmissionDate: Date,
    reminderEmailsSent: Number,
    lastReminderSent: Date,
    emailRemindersEnabled: Boolean
  }
}
```

---

## Cron Jobs
- A daily cron job runs at 2 AM to sync Codeforces data for all students.
- Inactivity emails are sent as needed based on student activity.

---

## Frontend Overview
- The frontend is built with React and Material-UI.
- Features include:
  - Student dashboard with search, pagination, and CSV export
  - Add, edit, view, and delete students
  - Detailed student profiles with contest and problem-solving analytics
  - Codeforces data sync and inactivity detection
  - Responsive design with light/dark mode toggle
  - Modern, user-friendly UI

---
