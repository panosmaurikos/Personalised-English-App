import { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const useAuth = (handleToast) => {
  // State to control the visibility of the authentication modal
  const [showAuth, setShowAuth] = useState(false);

  // State to track the current mode of the authentication modal ('login' or 'register')
  const [authMode, setAuthMode] = useState('login');

  // State to store the currently logged-in user's data
  const [user, setUser] = useState(null);

  // State to indicate whether the user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for a valid JWT token in localStorage on initial load
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      setIsAuthenticated(true);
      try {
        const decoded = jwtDecode(token);
        // Set both username and role from JWT
        setUser({ username: decoded.username, role: decoded.role });
      } catch {
        setUser(null);
      }
    }
  }, []);

  // Function to open the authentication modal with a specific mode
  const openAuth = (mode = 'login') => {
    setAuthMode(mode); // Set the mode ('login' or 'register')
    setShowAuth(true); // Show the modal
  };

  // Function to close the authentication modal
  const closeAuth = () => {
    setShowAuth(false); // Hide the modal
  };

  // Function to toggle between 'login' and 'register' modes
  const toggleAuthMode = () => {
    setAuthMode(prevMode => (prevMode === 'login' ? 'register' : 'login'));
  };

  // Function to handle user login
  const login = async (credentials) => {
    try {
      // Send a POST request to the login endpoint with user credentials
      const response = await axios.post('http://localhost:8081/login', credentials, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true, // Include cookies in the request
      });

      if (response.status === 200) {
        const userData = response.data; // Extract user data from the response

        console.log('Login successful:', userData);
        if (userData.token) {
          localStorage.setItem('jwt', userData.token);
        }
        setUser(userData); // Set the user data
        setIsAuthenticated(true); // Mark the user as authenticated
        closeAuth(); // Close the authentication modal
        handleToast('Login successful!', 'success'); // Displays a success toast message upon successful login
        return { success: true }; // Indicate success
      } else {
        handleToast('Login failed. Please try again.', 'danger'); // Show error toast
        return { success: false, error: 'Invalid credentials' }; // Handle invalid credentials
      }
    } catch (error) {
      console.error('Login error:', error);
      handleToast('Login failed. Please try again.', 'danger'); // Show error toast
      if (error.response) {
        return { success: false, error: error.response.data || "Invalid credentials" };
      } else {
        return { success: false, error: 'Failed to connect to server' };
      }
    }
  };

  // Function to handle user registration
  const register = async (userData) => {
    try {
      // Send a POST request to the register endpoint with user data
      const response = await axios.post('http://localhost:8081/register', userData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true, // Include cookies in the request
      });

      if (response.status === 200 || response.status === 201) {
        const newUser = response.data; // Extract new user data from the response
        console.log('Registration successful:', newUser);

        if (newUser.token) {
          localStorage.setItem('jwt', newUser.token);
        }
        
        setUser(newUser); // Set the user data
        setIsAuthenticated(true); // Mark the user as authenticated
        closeAuth(); // Close the authentication modal
        handleToast('Registration successful!', 'success'); // Show success toast
        return { success: true }; // Indicate success
      } else {
        handleToast('Registration failed. Please try again.', 'danger'); // Show error toast
        return { success: false, error: 'Registration failed' }; // Handle registration failure
      }
    } catch (error) {
      console.error('Registration error:', error);
      handleToast('Registration failed. Please try again.', 'danger'); // Show error toast
      if (error.response) {
        return { success: false, error: error.response.data || "Registration failed" };
      } else {
        return { success: false, error: 'Failed to connect to server' };
      }
    }
  };

  // Function to log out the user
  const logout = () => {
    setUser(null); // Clear the user data
    setIsAuthenticated(false); // Mark the user as unauthenticated
    localStorage.removeItem('jwt');
    handleToast('Logged out successfully.', 'info'); // Show info toast
  };

  // Return the state and functions to be used in components
  return {
    // State
    showAuth,
    authMode,
    user,
    isAuthenticated,

    // Actions
    openAuth,
    closeAuth,
    toggleAuthMode,
    login,
    register,
    logout,
  };
};

export default useAuth;
