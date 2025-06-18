import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const studentService = {
  getAllStudents: async () => {
    try {
      const response = await axios.get(`${API_URL}/students`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  getStudent: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/students/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student:', error);
      throw error;
    }
  },

  createStudent: async (studentData) => {
    try {
      const response = await axios.post(`${API_URL}/students`, studentData);
      return response.data;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  updateStudent: async (id, studentData) => {
    try {
      const response = await axios.put(`${API_URL}/students/${id}`, studentData);
      return response.data;
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  deleteStudent: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/students/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },
};

export { studentService };

export default api;