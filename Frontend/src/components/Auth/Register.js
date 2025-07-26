import { useState } from 'react';
import '../../css/Register.css';

const Register = ({ onToggle, register }) => {
  // State to manage the registration form inputs
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
  });

  // Handle input changes and update the form state
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Client-side validation for username, email, password, and role
    if (!form.username) {
      alert('Username is required');
      return;
    }
    if (!form.email) {
      alert('Email is required');
      return;
    }
    if (!form.password) {
      alert('Password is required');
      return;
    }
    if (!form.role) {
      alert('Role is required');
      return;
    }

    // Call the register function passed as a prop
    const result = await register(form);

    if (result.success) {
      alert("Registration successful!");
      // The hook will automatically close the modal and set authentication state
    } else {
      alert("Error: " + (result.error || "Registration failed"));
    }
  };

  return (
    <div className="register-bg">
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="text-center mb-4">
          {/* Logo and title */}
          <img src="https://img.icons8.com/fluency/48/000000/add-user-group-man-man.png" alt="Register" className="mb-2" />
          <h2 className="register-title">Register</h2>
          <p className="text-muted small">Create your account to get started.</p>
        </div>

        {/* Username input field */}
        <div className="mb-3">
          <input
            name="username"
            type="text"
            className="form-control form-control-lg register-input"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
          />
        </div>

        {/* Email input field */}
        <div className="mb-3">
          <input
            name="email"
            type="email"
            className="form-control form-control-lg register-input"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        {/* Password input field */}
        <div className="mb-3">
          <input
            name="password"
            type="password"
            className="form-control form-control-lg register-input"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        {/* Role selection dropdown */}
        <div className="mb-4">
          <select
            name="role"
            className="form-select form-select-lg register-select"
            value={form.role}
            onChange={handleChange}
          >
            <option value="">Select Role</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        {/* Submit button */}
        <button type="submit" className="btn register-btn btn-lg w-100 shadow-sm">
          Register
        </button>

        {/* Login link */}
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