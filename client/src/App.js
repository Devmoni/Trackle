import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
  CssBaseline,
  IconButton,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
} from '@mui/icons-material';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import StudentTable from './components/StudentTable';
import StudentProfile from './components/StudentProfile';
import { studentService } from './services/api';

const ThemeToggle = () => {
  const { mode, toggleTheme } = useTheme();
  return (
    <IconButton 
      onClick={toggleTheme} 
      color="inherit"
      sx={{ 
        color: 'text.primary',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
};

function App() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    navigate(`/edit/${student._id}`);
    if (isMobile) setMobileOpen(false);
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    navigate(`/view/${student._id}`);
    if (isMobile) setMobileOpen(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentService.deleteStudent(id);
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
    if (isMobile) setMobileOpen(false);
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      <List>
        <ListItem button component={Link} to="/" onClick={() => setMobileOpen(false)}>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/add" onClick={() => setMobileOpen(false)}>
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary="Add Student" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <ThemeProvider>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar 
          position="fixed" 
          elevation={0}
          sx={{ 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, color: 'text.primary' }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1,
                color: 'text.primary',
                fontWeight: 600,
              }}
            >
              Student Progress
            </Typography>
            <ThemeToggle />
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/"
                  startIcon={<DashboardIcon />}
                  sx={{ color: 'text.primary' }}
                >
                  Dashboard
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/add"
                  startIcon={<AddIcon />}
                  sx={{ color: 'text.primary' }}
                >
                  Add Student
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {isMobile && (
          <Drawer
            variant="temporary"
            anchor="left"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: 250,
                bgcolor: 'background.paper',
              },
            }}
          >
            {drawer}
          </Drawer>
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: '100%',
            mt: '64px',
          }}
        >
          <Container maxWidth="xl">
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
      </Box>
    </ThemeProvider>
  );
}

// Wrap App with Router
const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouter;
