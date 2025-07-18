import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/Login.css';

const Login = ({ onToggle }) => {
  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!form.username) {
      alert('Username or Email is required');
      return;
    }
    if (!form.password) {
      alert('Password is required');
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/login`, form, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true, // Keep if using cookies/sessions
      });

      alert(res.data.message || 'Login successful!');
      // Optionally redirect or update app state after login
      onToggle(); // Or implement a redirect to a dashboard
    } catch (error) {
      if (error.response) {
        alert(`Error: ${error.response.data.message || error.response.data}`);
      } else {
        alert('Failed to connect to server.');
      }
    }
  };

  return (
    <div className="login-bg">
      <form className="text-center w-100" onSubmit={handleSubmit}>
        <img
          src="/book.png"
          alt="Education"
          className="mb-3 login-img"
        />
        <h2 className="login-title mb-2">
          Welcome Back!
        </h2>
        <p className="text-muted small mb-4">
          Log in to start your English learning adventure!
        </p>
        <div className="mb-4">
          <input
            type="text"
            name="username"
            className="form-control form-control-lg shadow-sm login-input"
            placeholder="Username or Email"
            required
            value={form.username}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            name="password"
            className="form-control form-control-lg shadow-sm login-input"
            placeholder="Password"
            required
            value={form.password}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4 text-end">
          <button
            type="button"
            className="login-link small btn btn-link p-0"
            style={{ textDecoration: 'underline', color: '#0d6efd' }}
            onClick={() => alert('Forgot Password functionality coming soon!')}
          >
            Forgot Password?
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-lg w-100 shadow-sm login-btn"
        >
          Log In
        </button>
        <div className="mt-4 text-center">
          <span className="text-muted small">
            New to our platform?{' '}
            <button
              type="button"
              className="login-signup-btn fw-bold"
              onClick={onToggle}
            >
              Sign Up
            </button>
          </span>
        </div>
      </form>
    </div>
  );
};

export default Login;