const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const { syncStudentData } = require('../services/codeforcesService');

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find({}).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single student
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new student
router.post('/', async (req, res) => {
  try {
    const { name, email, password, phoneNumber, codeforcesHandle } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({ 
      $or: [
        { email },
        { codeforcesHandle }
      ]
    });

    if (existingStudent) {
      return res.status(400).json({ 
        message: existingStudent.email === email 
          ? 'Email already registered' 
          : 'Codeforces handle already registered'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new student
    const student = new Student({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      codeforcesHandle
    });

    const savedStudent = await student.save();
    
    // Sync Codeforces data immediately for new students
    await syncStudentData(savedStudent);

    // Return student data without password
    const studentResponse = savedStudent.toObject();
    delete studentResponse.password;
    
    res.status(201).json(studentResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a student
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { name, email, password, phoneNumber, codeforcesHandle } = req.body;

    // Check if email or codeforces handle is being changed and if it's already taken
    if (email !== student.email || codeforcesHandle !== student.codeforcesHandle) {
      const existingStudent = await Student.findOne({
        _id: { $ne: student._id },
        $or: [
          { email },
          { codeforcesHandle }
        ]
      });

      if (existingStudent) {
        return res.status(400).json({ 
          message: existingStudent.email === email 
            ? 'Email already registered' 
            : 'Codeforces handle already registered'
        });
      }
    }

    // Update fields
    student.name = name || student.name;
    student.email = email || student.email;
    student.phoneNumber = phoneNumber || student.phoneNumber;
    
    // Only update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      student.password = await bcrypt.hash(password, salt);
    }

    // If Codeforces handle is updated, sync data immediately
    if (codeforcesHandle && codeforcesHandle !== student.codeforcesHandle) {
      student.codeforcesHandle = codeforcesHandle;
      await syncStudentData(student);
    }

    const updatedStudent = await student.save();
    
    // Return student data without password
    const studentResponse = updatedStudent.toObject();
    delete studentResponse.password;
    
    res.json(studentResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a student
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Manually trigger sync for a student
router.post('/:id/sync', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    await syncStudentData(student);
    res.json({ message: 'Sync completed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle email reminders for a student
router.put('/:id/toggle-reminders', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    student.inactivityTracking.emailRemindersEnabled = !student.inactivityTracking.emailRemindersEnabled;
    await student.save();
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get contest history with filters
router.get('/:id/contests', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { days } = req.query;
    const filterDate = new Date();
    filterDate.setDate(filterDate.getDate() - parseInt(days));

    const filteredContests = student.contestHistory.filter(
      contest => contest.date >= filterDate
    );

    res.json(filteredContests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get problem solving stats with filters
router.get('/:id/problems', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { days } = req.query;
    const filterDate = new Date();
    filterDate.setDate(filterDate.getDate() - parseInt(days));

    const filteredSubmissions = student.problemSolvingStats.submissions.filter(
      submission => submission.submissionTime >= filterDate
    );

    const stats = {
      totalSolved: filteredSubmissions.filter(s => s.verdict === 'OK').length,
      problemsByRating: Array.from(student.problemSolvingStats.problemsByRating.entries()),
      submissions: filteredSubmissions
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export student data as CSV
router.get('/:id/export', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const csvData = [
      ['Name', 'Email', 'Phone Number', 'Codeforces Handle', 'Current Rating', 'Max Rating'],
      [
        student.name,
        student.email,
        student.phoneNumber,
        student.codeforcesHandle,
        student.currentRating,
        student.maxRating
      ]
    ].map(row => row.join(',')).join('\n');

    res.header('Content-Type', 'text/csv');
    res.attachment('student_data.csv');
    res.send(csvData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 