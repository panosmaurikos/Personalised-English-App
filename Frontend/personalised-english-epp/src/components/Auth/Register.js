import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/Register.css';


const Register = ({ onToggle }) => (
  <div className="register-bg">
    <form className="register-form">
      <div className="text-center mb-4">
        <img src="https://img.icons8.com/fluency/48/000000/add-user-group-man-man.png" alt="Register" className="mb-2" />
        <h2 className="register-title">Register</h2>
        <p className="text-muted small">Create your account to get started.</p>
      </div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control form-control-lg register-input"
          placeholder="Username"
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="email"
          className="form-control form-control-lg register-input"
          placeholder="Email"
          required
        />
      </div>
      <div className="mb-3">
        <input
          type="password"
          className="form-control form-control-lg register-input"
          placeholder="Password"
          required
        />
      </div>
      <div className="mb-4">
        <select className="form-select form-select-lg register-select" required>
          <option value="">Select Role</option>
          <option value="Student">Student</option>
          <option value="Teacher">Teacher</option>
        </select>
      </div>
      <button
        type="submit"
        className="btn register-btn btn-lg w-100 shadow-sm"
      >
        Register
      </button>
      <div className="mt-3 text-center">
        <span className="text-muted small">
          Already have an account?{' '}
          <button
            type="button"
            className="register-login-btn fw-bold"
            onClick={onToggle}
          >
            Login
          </button>
        </span>
      </div>
    </form>
  </div>
);

export default Register;