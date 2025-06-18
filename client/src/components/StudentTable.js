import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Tooltip,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { studentService } from '../services/api';

const StudentTable = ({ onEdit, onDelete, onViewDetails, onAdd }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await studentService.getAllStudents();
      setStudents(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch students');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const filteredStudents = (Array.isArray(students) ? students : []).filter(
    (student) =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.codeforcesHandle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRatingColor = (rating) => {
    if (!rating) return 'text.secondary';
    if (rating >= 2400) return '#FF0000'; // Red
    if (rating >= 2200) return '#FF8C00'; // Orange
    if (rating >= 1900) return '#AA00AA'; // Purple
    if (rating >= 1600) return '#0000FF'; // Blue
    if (rating >= 1400) return '#03A89E'; // Cyan
    if (rating >= 1200) return '#008000'; // Green
    return '#808080'; // Gray
  };

  const handleDownloadCSV = () => {
    // Create CSV content
    const headers = ['Name', 'Email', 'Phone Number', 'Codeforces Handle', 'Current Rating', 'Max Rating'];
    const csvContent = [
      headers.join(','),
      ...filteredStudents.map(student => [
        `"${student.name || ''}"`,
        `"${student.email || ''}"`,
        `"${student.phoneNumber || ''}"`,
        `"${student.codeforcesHandle || ''}"`,
        student.currentRating || '',
        student.maxRating || ''
      ].join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'students.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search students..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Download CSV">
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleDownloadCSV}
              sx={{ mr: 1 }}
            >
              Download CSV
            </Button>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            onClick={onAdd}
            sx={{ minWidth: '120px' }}
          >
            Add Student
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="student table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Codeforces Handle</TableCell>
              <TableCell align="right">Current Rating</TableCell>
              <TableCell align="right">Max Rating</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((student) => (
                <TableRow
                  key={student._id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {student.name}
                  </TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.phoneNumber}</TableCell>
                  <TableCell>{student.codeforcesHandle}</TableCell>
                  <TableCell align="right">
                    <Typography
                      sx={{
                        color: getRatingColor(student.currentRating),
                        fontWeight: 500,
                      }}
                    >
                      {student.currentRating || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      sx={{
                        color: getRatingColor(student.maxRating),
                        fontWeight: 500,
                      }}
                    >
                      {student.maxRating || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
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

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredStudents.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default StudentTable;