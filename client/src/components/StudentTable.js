import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { studentService } from '../services/api';
import { CSVLink } from 'react-csv';

const StudentTable = ({ onEdit, onDelete, onViewDetails, onAdd }) => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await studentService.getAllStudents();
      setStudents(response.data);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentService.deleteStudent(id);
        loadStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const csvData = students.map(student => ({
    Name: student.name,
    Email: student.email,
    'Phone Number': student.phoneNumber,
    'Codeforces Handle': student.codeforcesHandle,
    'Current Rating': student.currentRating || 'N/A',
    'Max Rating': student.maxRating || 'N/A'
  }));

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Student List
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
            sx={{ mr: 2 }}
          >
            Add Student
          </Button>
          <CSVLink
            data={csvData}
            filename="students.csv"
            style={{ textDecoration: 'none' }}
          >
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
            >
              Export CSV
            </Button>
          </CSVLink>
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Codeforces Handle</TableCell>
              <TableCell>Current Rating</TableCell>
              <TableCell>Max Rating</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student._id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.phoneNumber}</TableCell>
                <TableCell>{student.codeforcesHandle}</TableCell>
                <TableCell>{student.currentRating || 'N/A'}</TableCell>
                <TableCell>{student.maxRating || 'N/A'}</TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton onClick={() => onViewDetails(student)} color="primary">
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => onEdit(student)} color="primary">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDelete(student._id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StudentTable;