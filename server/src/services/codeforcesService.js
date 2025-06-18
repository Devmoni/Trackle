const axios = require('axios');
const Student = require('../models/Student');
const nodemailer = require('nodemailer');

const CODEFORCES_API_URL = 'https://codeforces.com/api';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const fetchUserRating = async (handle) => {
  try {
    const response = await axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`);
    if (response.data.status === 'OK') {
      return response.data.result;
    }
    throw new Error('Failed to fetch rating history');
  } catch (error) {
    console.error('Error fetching rating history:', error);
    return [];
  }
};

const fetchUserSubmissions = async (handle) => {
  try {
    const response = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}&count=1000`);
    if (response.data.status === 'OK') {
      return response.data.result;
    }
    throw new Error('Failed to fetch submissions');
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }
};

const processSubmissions = (submissions) => {
  const solvedProblems = new Set();
  const problemsByRating = {};
  let totalRating = 0;
  let solvedCount = 0;

  submissions.forEach(submission => {
    if (submission.verdict === 'OK') {
      const problemKey = `${submission.problem.contestId}${submission.problem.index}`;
      if (!solvedProblems.has(problemKey)) {
        solvedProblems.add(problemKey);
        const rating = submission.problem.rating || 0;
        if (rating > 0) {
          problemsByRating[rating] = (problemsByRating[rating] || 0) + 1;
          totalRating += rating;
          solvedCount++;
        }
      }
    }
  });

  // Convert problemsByRating to array format
  const problemsByRatingArray = Object.entries(problemsByRating)
    .map(([rating, count]) => ({ rating: parseInt(rating), count }))
    .sort((a, b) => a.rating - b.rating);

  return {
    solvedProblems: Array.from(solvedProblems),
    problemsByRating: problemsByRatingArray,
    averageRating: solvedCount > 0 ? totalRating / solvedCount : 0,
    totalSolved: solvedProblems.size
  };
};

const sendInactivityEmail = async (student) => {
  if (!student.inactivityTracking.emailRemindersEnabled) return;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: student.email,
    subject: 'Codeforces Activity Reminder',
    html: `
      <h2>Hello ${student.name},</h2>
      <p>We noticed that you haven't made any submissions on Codeforces in the last 7 days.</p>
      <p>Keep up the good work and continue solving problems to improve your skills!</p>
      <p>Your current rating: ${student.currentRating}</p>
      <p>Best of luck!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    await Student.findByIdAndUpdate(student._id, {
      $inc: { 'inactivityTracking.reminderEmailsSent': 1 },
      'inactivityTracking.lastReminderSent': new Date(),
    });
  } catch (error) {
    console.error(`Error sending email to ${student.email}:`, error);
  }
};

const syncStudentData = async (student) => {
  try {
    // Fetch user rating history
    const ratingResponse = await axios.get(
      `https://codeforces.com/api/user.rating?handle=${student.codeforcesHandle}`
    );

    if (ratingResponse.data.status === 'OK') {
      const ratingHistory = ratingResponse.data.result;
      student.ratingHistory = ratingHistory;
      student.currentRating = ratingHistory.length > 0 ? ratingHistory[ratingHistory.length - 1].newRating : 0;
      student.maxRating = Math.max(...ratingHistory.map(r => r.newRating), 0);
    }

    // Fetch user submissions
    const submissionsResponse = await axios.get(
      `https://codeforces.com/api/user.status?handle=${student.codeforcesHandle}&count=1000`
    );

    if (submissionsResponse.data.status === 'OK') {
      const submissions = submissionsResponse.data.result;
      const problemStats = processSubmissions(submissions);

      // Calculate problems per day
      const firstSubmission = submissions[submissions.length - 1];
      const lastSubmission = submissions[0];
      const daysActive = firstSubmission && lastSubmission
        ? Math.ceil((new Date(lastSubmission.creationTimeSeconds * 1000) - 
                    new Date(firstSubmission.creationTimeSeconds * 1000)) / (1000 * 60 * 60 * 24))
        : 0;

      student.problemSolvingStats = {
        ...problemStats,
        problemsPerDay: daysActive > 0 ? problemStats.totalSolved / daysActive : 0,
        recentSubmissions: submissions.slice(0, 20).map(sub => ({
          problemName: `${sub.problem.contestId}${sub.problem.index} - ${sub.problem.name}`,
          rating: sub.problem.rating,
          verdict: sub.verdict,
          submissionTime: new Date(sub.creationTimeSeconds * 1000).toISOString()
        }))
      };
    }

    // Check for inactivity
    const lastSubmission = submissionsResponse.data.result[0];
    if (lastSubmission) {
      const lastActivity = new Date(lastSubmission.creationTimeSeconds * 1000);
      const now = new Date();
      const daysSinceLastActivity = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
      student.isInactive = daysSinceLastActivity > 30;
    }

    await student.save();
    return student;
  } catch (error) {
    console.error(`Error syncing data for ${student.codeforcesHandle}:`, error);
    throw error;
  }
};

module.exports = {
  syncStudentData,
  fetchUserRating,
  fetchUserSubmissions
}; 