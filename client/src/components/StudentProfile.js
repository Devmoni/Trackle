import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';
import { studentService } from '../services/api';
import { format, subDays } from 'date-fns';

const StudentProfile = ({ studentId, onSave, viewOnly = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    codeforcesHandle: '',
    password: '',
  });

  const [activeTab, setActiveTab] = useState(0);
  const [contestFilter, setContestFilter] = useState(30);
  const [problemFilter, setProblemFilter] = useState(30);
  const [emailRemindersEnabled, setEmailRemindersEnabled] = useState(true);
  const [error, setError] = useState('');

  const loadStudent = useCallback(async () => {
    try {
      const response = await studentService.getStudentById(studentId);
      setFormData(response.data);
      setEmailRemindersEnabled(response.data.inactivityTracking.emailRemindersEnabled);
    } catch (error) {
      console.error('Error loading student:', error);
      setError('Failed to load student data');
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      loadStudent();
    }
  }, [studentId, loadStudent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phoneNumber || !formData.codeforcesHandle) {
      setError('All fields are required');
      return false;
    }
    if (!studentId && !formData.password) {
      setError('Password is required for new students');
      return false;
    }
    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (studentId) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await studentService.updateStudent(studentId, {
          ...updateData,
          inactivityTracking: {
            ...formData.inactivityTracking,
            emailRemindersEnabled,
          },
        });
      } else {
        await studentService.createStudent(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving student:', error);
      setError(error.response?.data?.message || 'Failed to save student');
    }
  };

  const filteredContests = formData.contestHistory?.filter(
    (contest) => new Date(contest.date) >= subDays(new Date(), contestFilter)
  ) || [];

  const filteredSubmissions = formData.problemSolvingStats?.submissions?.filter(
    (submission) => new Date(submission.submissionTime) >= subDays(new Date(), problemFilter)
  ) || [];

  const problemsByRating = formData.problemSolvingStats?.problemsByRating || [];
  const totalSolved = formData.problemSolvingStats?.totalSolved || 0;
  const averageRating = filteredSubmissions.length > 0
    ? filteredSubmissions.reduce((acc, curr) => acc + curr.rating, 0) / filteredSubmissions.length
    : 0;
  const problemsPerDay = problemFilter > 0
    ? filteredSubmissions.length / problemFilter
    : 0;

  const formatDate = (date) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const formatRatingChange = (change) => {
    const color = change >= 0 ? 'success.main' : 'error.main';
    return (
      <Typography component="span" color={color}>
        {change >= 0 ? '+' : ''}{change}
      </Typography>
    );
  };

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {viewOnly ? 'Student Details' : studentId ? 'Edit Student' : 'Add New Student'}
        </Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                error={!!error && !formData.name}
                disabled={viewOnly}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                error={!!error && !formData.email}
                disabled={viewOnly}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                error={!!error && !formData.phoneNumber}
                disabled={viewOnly}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Codeforces Handle"
                name="codeforcesHandle"
                value={formData.codeforcesHandle}
                onChange={handleChange}
                required
                error={!!error && !formData.codeforcesHandle}
                disabled={viewOnly}
              />
            </Grid>
            {!viewOnly && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={studentId ? "New Password (leave blank to keep current)" : "Password"}
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!studentId}
                  error={!!error && !studentId && !formData.password}
                  helperText={studentId ? "Only fill if you want to change the password" : "Must be at least 6 characters"}
                />
              </Grid>
            )}
            {!viewOnly && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailRemindersEnabled}
                      onChange={(e) => setEmailRemindersEnabled(e.target.checked)}
                    />
                  }
                  label="Enable Email Reminders"
                />
              </Grid>
            )}
            {!viewOnly && (
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ mr: 2 }}
                >
                  {studentId ? 'Update' : 'Create'} Student
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => onSave()}
                >
                  Cancel
                </Button>
              </Grid>
            )}
            {viewOnly && (
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  onClick={() => onSave()}
                >
                  Back to List
                </Button>
              </Grid>
            )}
          </Grid>
        </form>
      </Paper>

      {studentId && (
        <Box sx={{ mt: 4 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Contest History" />
            <Tab label="Problem Solving Data" />
          </Tabs>

          {activeTab === 0 && (
            <Box sx={{ mt: 2 }}>
              <FormControl sx={{ mb: 2 }}>
                <InputLabel>Time Period</InputLabel>
                <Select
                  value={contestFilter}
                  onChange={(e) => setContestFilter(e.target.value)}
                  label="Time Period"
                >
                  <MenuItem value={30}>Last 30 days</MenuItem>
                  <MenuItem value={90}>Last 90 days</MenuItem>
                  <MenuItem value={365}>Last 365 days</MenuItem>
                </Select>
              </FormControl>

              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Rating Progress
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={filteredContests}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => formatDate(date)}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => formatDate(date)}
                      formatter={(value) => [`Rating: ${value}`, 'Rating']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="newRating" 
                      stroke="#8884d8" 
                      name="Rating"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>

              <Typography variant="h6" gutterBottom>
                Recent Contests
              </Typography>
              {filteredContests.length === 0 ? (
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  No contests found in the selected time period.
                </Typography>
              ) : (
                filteredContests.map((contest) => (
                  <Card key={contest.contestId} sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="h6" color="primary">
                            {contest.contestName}
                          </Typography>
                          <Typography color="text.secondary" gutterBottom>
                            {formatDate(contest.date)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography>
                            <strong>Rank:</strong> {contest.rank}
                          </Typography>
                          <Typography>
                            <strong>Old Rating:</strong> {contest.oldRating}
                          </Typography>
                          <Typography>
                            <strong>New Rating:</strong> {contest.newRating}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography>
                            <strong>Rating Change:</strong> {formatRatingChange(contest.ratingChange)}
                          </Typography>
                          {contest.unsolvedProblems && contest.unsolvedProblems.length > 0 && (
                            <Typography>
                              <strong>Unsolved Problems:</strong>{' '}
                              {contest.unsolvedProblems.join(', ')}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ mt: 2 }}>
              <FormControl sx={{ mb: 2 }}>
                <InputLabel>Time Period</InputLabel>
                <Select
                  value={problemFilter}
                  onChange={(e) => setProblemFilter(e.target.value)}
                  label="Time Period"
                >
                  <MenuItem value={7}>Last 7 days</MenuItem>
                  <MenuItem value={30}>Last 30 days</MenuItem>
                  <MenuItem value={90}>Last 90 days</MenuItem>
                </Select>
              </FormControl>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Statistics</Typography>
                      <Typography>Total Problems Solved: {totalSolved}</Typography>
                      <Typography>Average Rating: {averageRating.toFixed(2)}</Typography>
                      <Typography>Problems per Day: {problemsPerDay.toFixed(2)}</Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Problems Solved by Rating
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={problemsByRating}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="rating" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default StudentProfile; 