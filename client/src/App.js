import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
} from '@mui/material';
import StudentTable from './components/StudentTable';
import StudentProfile from './components/StudentProfile';
import { studentService } from './services/api';

function App() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const navigate = useNavigate();

  const handleEdit = (student) => {
    setSelectedStudent(student);
    navigate(`/edit/${student._id}`);
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    navigate(`/view/${student._id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentService.deleteStudent(id);
        // Refresh the student list
        window.location.reload();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const handleSave = () => {
    setSelectedStudent(null);
    navigate('/');
  };

  const handleAdd = () => {
    setSelectedStudent(null);
    navigate('/add');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Student Progress Management System
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Students
          </Button>
          <Button color="inherit" component={Link} to="/add">
            Add Student
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route
            path="/"
            element={
              <StudentTable 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
                onViewDetails={handleViewDetails}
                onAdd={handleAdd}
              />
            }
          />
          <Route
            path="/add"
            element={<StudentProfile onSave={handleSave} />}
          />
          <Route
            path="/edit/:id"
            element={
              <StudentProfile
                studentId={selectedStudent?._id}
                onSave={handleSave}
              />
            }
          />
          <Route
            path="/view/:id"
            element={
              <StudentProfile
                studentId={selectedStudent?._id}
                onSave={handleSave}
                viewOnly={true}
              />
            }
          />
        </Routes>
      </Container>
    </Box>
  );
}

// Wrap App with Router
const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouter;
