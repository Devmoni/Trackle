import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { studentService } from '../services/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

function StudentProfile({ studentId, onSave, viewOnly = false }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    codeforcesHandle: '',
    password: '',
    emailReminders: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);
  const [contestFilter, setContestFilter] = useState(30); // 30 days by default
  const [problemFilter, setProblemFilter] = useState(30); // 30 days by default

  const fetchStudent = useCallback(async () => {
    try {
      setLoading(true);
      const data = await studentService.getStudent(studentId);
      setStudent(data);
      setFormData({
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        codeforcesHandle: data.codeforcesHandle,
        password: '',
        emailReminders: data.emailReminders,
      });
      setError(null);
    } catch (err) {
      setError('Failed to fetch student data. Please try again later.');
      console.error('Error fetching student:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      fetchStudent();
    }
  }, [studentId, fetchStudent]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'emailReminders' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (studentId) {
        await studentService.updateStudent(studentId, formData);
      } else {
        await studentService.createStudent(formData);
      }
      onSave();
    } catch (err) {
      setError('Failed to save student data. Please try again later.');
      console.error('Error saving student:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating) => {
    if (!rating) return '#808080'; // Gray for no rating
    if (rating >= 2400) return '#FF0000'; // Red
    if (rating >= 2100) return '#FF8C00'; // Orange
    if (rating >= 1900) return '#AA00AA'; // Purple
    if (rating >= 1600) return '#0000FF'; // Blue
    if (rating >= 1400) return '#03A89E'; // Cyan
    if (rating >= 1200) return '#008000'; // Green
    return '#808080'; // Gray
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatRatingChange = (change) => {
    if (change === undefined || change === null) return 'N/A';
    if (change > 0) return `+${change}`;
    return change;
  };

  const getRatingChangeColor = (change) => {
    if (change === undefined || change === null) return 'default';
    if (change > 0) return 'success';
    if (change < 0) return 'error';
    return 'default';
  };

  if (loading && !student) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  const filteredContests = student?.contestHistory?.filter(contest => {
    if (!contest?.date) return false;
    const contestDate = new Date(contest.date);
    const now = new Date();
    const diffTime = Math.abs(now - contestDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= contestFilter;
  }) || [];

  const chartData = {
    labels: filteredContests.map(contest => formatDate(contest.date)),
    datasets: [
      {
        label: 'Rating',
        data: filteredContests.map(contest => contest.newRating || 0),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `Rating: ${context.raw}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          {viewOnly ? 'Student Details' : (studentId ? 'Edit Student' : 'Add New Student')}
        </Typography>
        {viewOnly && (
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onSave}
          >
            Back to List
          </Button>
        )}
      </Box>

      {!viewOnly && (
        <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Codeforces Handle"
                  name="codeforcesHandle"
                  value={formData.codeforcesHandle}
                  onChange={handleChange}
                  required
                />
              </Grid>
              {!studentId && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.emailReminders}
                      onChange={handleChange}
                      name="emailReminders"
                    />
                  }
                  label="Enable Email Reminders"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}

      {viewOnly && student && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Current Rating
                  </Typography>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ color: getRatingColor(student.currentRating) }}
                  >
                    {student.currentRating || 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Max Rating
                  </Typography>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ color: getRatingColor(student.maxRating) }}
                  >
                    {student.maxRating || 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Status
                  </Typography>
                  <Chip
                    label={student.isInactive ? 'Inactive' : 'Active'}
                    color={student.isInactive ? 'warning' : 'success'}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Rating Progress
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Time Period</InputLabel>
                  <Select
                    value={contestFilter}
                    label="Time Period"
                    onChange={(e) => setContestFilter(e.target.value)}
                  >
                    <MenuItem value={30}>Last 30 Days</MenuItem>
                    <MenuItem value={90}>Last 90 Days</MenuItem>
                    <MenuItem value={365}>Last Year</MenuItem>
                  </Select>
                </FormControl>
                <Tooltip title="Refresh Data">
                  <IconButton onClick={fetchStudent} color="primary">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              {filteredContests.length > 0 ? (
                <Box sx={{ height: 300 }}>
                  <Line data={chartData} options={chartOptions} />
                </Box>
              ) : (
                <Alert severity="info">No contest data available for the selected time period.</Alert>
              )}
            </Box>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Problem Solving Statistics
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Time Period</InputLabel>
                <Select
                  value={problemFilter}
                  label="Time Period"
                  onChange={(e) => setProblemFilter(e.target.value)}
                >
                  <MenuItem value={7}>Last 7 Days</MenuItem>
                  <MenuItem value={30}>Last 30 Days</MenuItem>
                  <MenuItem value={90}>Last 90 Days</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Problems Solved
                    </Typography>
                    <Typography variant="h4" component="div">
                      {student?.problemSolvingStats?.totalSolved || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Average Problem Rating
                    </Typography>
                    <Typography variant="h4" component="div">
                      {student?.problemSolvingStats?.averageRating 
                        ? Math.round(student.problemSolvingStats.averageRating) 
                        : 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Problems per Day
                    </Typography>
                    <Typography variant="h4" component="div">
                      {student?.problemSolvingStats?.problemsPerDay 
                        ? student.problemSolvingStats.problemsPerDay.toFixed(1)
                        : '0.0'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Problems Solved by Rating
              </Typography>
              {student?.problemSolvingStats?.problemsByRating?.length > 0 ? (
                <Box sx={{ height: 300 }}>
                  <Line
                    data={{
                      labels: student.problemSolvingStats.problemsByRating.map(p => p.rating),
                      datasets: [
                        {
                          label: 'Problems Solved',
                          data: student.problemSolvingStats.problemsByRating.map(p => p.count),
                          borderColor: '#2563eb',
                          backgroundColor: 'rgba(37, 99, 235, 0.1)',
                          tension: 0.4,
                          fill: true,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => `Solved: ${context.raw}`,
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                          },
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                        },
                      },
                    }}
                  />
                </Box>
              ) : (
                <Alert severity="info">No problem-solving data available.</Alert>
              )}
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Submissions
              </Typography>
              {student?.problemSolvingStats?.recentSubmissions?.length > 0 ? (
                <Grid container spacing={2}>
                  {student.problemSolvingStats.recentSubmissions
                    .filter(submission => {
                      const submissionDate = new Date(submission.submissionTime);
                      const now = new Date();
                      const diffTime = Math.abs(now - submissionDate);
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays <= problemFilter;
                    })
                    .map((submission, index) => (
                      <Grid item xs={12} md={6} lg={4} key={index}>
                        <Card>
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              {submission.problemName}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              {formatDate(submission.submissionTime)}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                              <Chip
                                label={`Rating: ${submission.rating || 'N/A'}`}
                                size="small"
                                sx={{ color: getRatingColor(submission.rating) }}
                              />
                              <Chip
                                label={submission.verdict}
                                size="small"
                                color={submission.verdict === 'OK' ? 'success' : 'error'}
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              ) : (
                <Alert severity="info">No recent submissions found in the selected time period.</Alert>
              )}
            </Paper>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Contests
            </Typography>
            {filteredContests.length === 0 ? (
              <Alert severity="info">No contests found in the selected time period.</Alert>
            ) : (
              <Grid container spacing={2}>
                {filteredContests.map((contest) => (
                  <Grid item xs={12} md={6} lg={4} key={contest.contestId}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          {contest.contestName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {formatDate(contest.date)}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          <Chip
                            label={`Rank: ${contest.rank || 'N/A'}`}
                            size="small"
                          />
                          <Chip
                            icon={contest.ratingChange > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                            label={formatRatingChange(contest.ratingChange)}
                            color={getRatingChangeColor(contest.ratingChange)}
                            size="small"
                          />
                        </Box>
                        {contest.unsolvedProblems?.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="textSecondary">
                              Unsolved Problems:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                              {contest.unsolvedProblems.map((problem) => (
                                <Chip
                                  key={problem}
                                  label={problem}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
}

export default StudentProfile; 