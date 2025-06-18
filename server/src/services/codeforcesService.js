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
  const problemsByRating = new Map();
  const submissionsList = [];

  submissions.forEach(submission => {
    if (submission.verdict === 'OK' && !solvedProblems.has(submission.problem.name)) {
      solvedProblems.add(submission.problem.name);
      
      // Add to problems by rating
      const rating = submission.problem.rating || 0;
      problemsByRating.set(rating, (problemsByRating.get(rating) || 0) + 1);

      // Add to submissions list
      submissionsList.push({
        problemId: submission.problem.contestId + submission.problem.index,
        problemName: submission.problem.name,
        rating: rating,
        submissionTime: new Date(submission.creationTimeSeconds * 1000),
        verdict: submission.verdict
      });
    }
  });

  return {
    totalSolved: solvedProblems.size,
    problemsByRating: Array.from(problemsByRating.entries()).map(([rating, count]) => ({
      rating,
      count
    })),
    submissions: submissionsList
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
    const [ratingHistory, submissions] = await Promise.all([
      fetchUserRating(student.codeforcesHandle),
      fetchUserSubmissions(student.codeforcesHandle),
    ]);

    const lastSubmission = submissions[0];
    const lastSubmissionDate = lastSubmission
      ? new Date(lastSubmission.creationTimeSeconds * 1000)
      : null;

    const problemSolvingStats = processSubmissions(submissions);
    const currentRating = ratingHistory[ratingHistory.length - 1]?.newRating || 0;
    const maxRating = Math.max(...ratingHistory.map((r) => r.newRating), 0);

    // Process contest history with more details
    const contestHistory = await Promise.all(ratingHistory.map(async (contest) => {
      // Fetch contest details to get unsolved problems
      let unsolvedProblems = [];
      try {
        const contestResponse = await axios.get(
          `https://codeforces.com/api/contest.standings?contestId=${contest.contestId}&handles=${student.codeforcesHandle}`
        );
        if (contestResponse.data.status === 'OK') {
          const problems = contestResponse.data.result.problems;
          const solvedProblems = new Set(
            submissions
              .filter(s => s.contestId === contest.contestId && s.verdict === 'OK')
              .map(s => s.problem.index)
          );
          unsolvedProblems = problems
            .filter(p => !solvedProblems.has(p.index))
            .map(p => p.index);
        }
      } catch (error) {
        console.error(`Error fetching contest details for ${contest.contestId}:`, error);
      }

      return {
        contestId: contest.contestId,
        contestName: contest.contestName,
        rank: contest.rank,
        oldRating: contest.oldRating,
        newRating: contest.newRating,
        ratingChange: contest.newRating - contest.oldRating,
        date: new Date(contest.ratingUpdateTimeSeconds * 1000),
        unsolvedProblems
      };
    }));

    await Student.findByIdAndUpdate(student._id, {
      currentRating,
      maxRating,
      lastUpdated: new Date(),
      contestHistory,
      problemSolvingStats,
      'inactivityTracking.lastSubmissionDate': lastSubmissionDate,
    });

    // Check for inactivity
    if (lastSubmissionDate) {
      const daysSinceLastSubmission = Math.floor(
        (new Date() - lastSubmissionDate) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastSubmission >= 7) {
        await sendInactivityEmail(student);
      }
    }
  } catch (error) {
    console.error(`Error syncing data for ${student.codeforcesHandle}:`, error);
  }
};

module.exports = {
  syncStudentData,
  fetchUserRating,
  fetchUserSubmissions
}; 