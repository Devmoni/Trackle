const cron = require('node-cron');
const Student = require('../models/Student');
const { syncStudentData } = require('../services/codeforcesService');

// Run at 2 AM every day
const schedule = '0 2 * * *';

const startSyncCron = () => {
  cron.schedule(schedule, async () => {
    console.log('Starting daily Codeforces data sync...');
    try {
      const students = await Student.find({});
      for (const student of students) {
        await syncStudentData(student);
      }
      console.log('Daily sync completed successfully');
    } catch (error) {
      console.error('Error during daily sync:', error);
    }
  });
};

module.exports = {
  startSyncCron,
}; 