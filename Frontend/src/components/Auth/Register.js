import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/Register.css';

const Register = ({ onToggle }) => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Sending data:', form); // Προσθήκη για αποσφαλμάτωση

    try {
      const res = await axios.post('http://localhost:8081/register', form, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      alert("Registration successful!");
      onToggle();
    } catch (error) {
      if (error.response) {
        alert("Error: " + (error.response.data || "Invalid request data"));
      } else {
        alert("Failed to connect to server.");
      }
    }
  };

  return (
    <div className="register-bg">
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="text-center mb-4">
          <img src="https://img.icons8.com/fluency/48/000000/add-user-group-man-man.png" alt="Register" className="mb-2" />
          <h2 className="register-title">Register</h2>
          <p className="text-muted small">Create your account to get started.</p>
        </div>
        <div className="mb-3">
          <input
            name="username"
            type="text"
            className="form-control form-control-lg register-input"
            placeholder="Username"
            required
            value={form.username}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <input
            name="email"
            type="email"
            className="form-control form-control-lg register-input"
            placeholder="Email"
            required
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <input
            name="password"
            type="password"
            className="form-control form-control-lg register-input"
            placeholder="Password"
            required
            value={form.password}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <select
            name="role"
            className="form-select form-select-lg register-select"
            required
            value={form.role}
            onChange={handleChange}
          >
            <option value="">Select Role</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>
        <button type="submit" className="btn register-btn btn-lg w-100 shadow-sm">
          Register
        </button>
        <div className="mt-3 text-center">
          <span className="text-muted small">
            Already have an account?{' '}
            <button type="button" className="register-login-btn fw-bold" onClick={onToggle}>
              Login
            </button>
          </span>
        </div>
      </form>
    </div>
  );
};

export default Register;