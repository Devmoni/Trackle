import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
  ThemeProvider,
  createTheme,
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
} from '@mui/icons-material';
import StudentTable from './components/StudentTable';
import StudentProfile from './components/StudentProfile';
import { studentService } from './services/api';

// Create a modern theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // Modern blue
      light: '#60a5fa',
      dark: '#1e40af',
    },
    secondary: {
      main: '#7c3aed', // Modern purple
      light: '#a78bfa',
      dark: '#5b21b6',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
});

function App() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    <ThemeProvider theme={theme}>
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
              keepMounted: true, // Better open performance on mobile
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
            mt: '64px', // Height of AppBar
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
