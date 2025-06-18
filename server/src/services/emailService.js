const nodemailer = require('nodemailer');
const Student = require('../models/Student');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendInactivityEmail(student) {
  if (!student.emailNotificationsEnabled) return;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: student.email,
    subject: 'Reminder: Continue Your Codeforces Journey!',
    html: `
      <h2>Hello ${student.name},</h2>
      <p>We noticed that you haven't made any submissions on Codeforces in the last 7 days.</p>
      <p>Don't let your progress slow down! Here are some suggestions to get back on track:</p>
      <ul>
        <li>Try solving some problems from your favorite topics</li>
        <li>Participate in upcoming contests</li>
        <li>Review your previous submissions and learn from them</li>
      </ul>
      <p>Keep coding and improving!</p>
      <p>Best regards,<br>Student Progress Management System</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    student.reminderEmailCount += 1;
    student.lastReminderSent = new Date();
    await student.save();
    console.log(`Inactivity email sent to ${student.email}`);
  } catch (error) {
    console.error(`Error sending inactivity email to ${student.email}:`, error);
  }
}

async function checkInactiveStudents() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const students = await Student.find({
    'problemSolvingStats.submissions.submissionTime': { $lt: sevenDaysAgo }
  });

  for (const student of students) {
    const lastSubmission = student.problemSolvingStats.submissions
      .sort((a, b) => b.submissionTime - a.submissionTime)[0];

    if (lastSubmission && lastSubmission.submissionTime < sevenDaysAgo) {
      await sendInactivityEmail(student);
    }
  }
}

module.exports = {
  sendInactivityEmail,
  checkInactiveStudents
}; 