import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { studentService } from '../services/api';

function StudentTable({ onEdit, onDelete, onViewDetails, onAdd }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await studentService.getAllStudents();
      setStudents(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch students. Please try again later.');
      console.error('Error fetching students:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = (Array.isArray(students) ? students : []).filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.codeforcesHandle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRatingColor = (rating) => {
    if (rating >= 2400) return '#FF0000'; // Red
    if (rating >= 2100) return '#FF8C00'; // Orange
    if (rating >= 1900) return '#AA00AA'; // Purple
    if (rating >= 1600) return '#0000FF'; // Blue
    if (rating >= 1400) return '#03A89E'; // Cyan
    if (rating >= 1200) return '#008000'; // Green
    return '#808080'; // Gray
  };

  const getRatingChangeColor = (change) => {
    if (change > 0) return 'success';
    if (change < 0) return 'error';
    return 'default';
  };

  if (loading) {
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

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Student Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={onAdd}
          startIcon={<AddIcon />}
        >
          Add Student
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Students
              </Typography>
              <Typography variant="h4" component="div">
                {students.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Students
              </Typography>
              <Typography variant="h4" component="div">
                {students.filter(s => !s.isInactive).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Rating
              </Typography>
              <Typography variant="h4" component="div">
                {Math.round(students.reduce((acc, s) => acc + (s.currentRating || 0), 0) / students.length) || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Codeforces Handle</TableCell>
                <TableCell>Current Rating</TableCell>
                <TableCell>Rating Change</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">{student.name}</Typography>
                      {student.isInactive && (
                        <Tooltip title="Inactive Student">
                          <WarningIcon color="warning" fontSize="small" />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      component="a"
                      href={`https://codeforces.com/profile/${student.codeforcesHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: getRatingColor(student.currentRating),
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {student.codeforcesHandle}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        color: getRatingColor(student.currentRating),
                        fontWeight: 500,
                      }}
                    >
                      {student.currentRating || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {student.ratingChange !== undefined && (
                      <Chip
                        icon={student.ratingChange > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                        label={student.ratingChange > 0 ? `+${student.ratingChange}` : student.ratingChange}
                        color={getRatingChangeColor(student.ratingChange)}
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={student.isInactive ? 'Inactive' : 'Active'}
                      color={student.isInactive ? 'warning' : 'success'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => onViewDetails(student)}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(student)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(student._id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default StudentTable;