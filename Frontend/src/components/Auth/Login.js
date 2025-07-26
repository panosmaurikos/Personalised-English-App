import { useState } from 'react';
import '../../css/Login.css';

const Login = ({ onToggle, login }) => {
  // State to manage the login form inputs
  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  // Handle input changes and update the form state
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Client-side validation for username and password
    if (!form.username) {
      alert('Username or Email is required');
      return;
    }
    if (!form.password) {
      alert('Password is required');
      return;
    }

    // Call the login function passed as a prop
    const result = await login(form);

    if (result.success) {
      alert('Login successful!');
      // The hook will automatically close the modal and set authentication state
    } else {
      alert(`Error: ${result.error || 'Login failed'}`);
    }
  };

  return (
    <div className="login-bg">
      <form className="text-center w-100" onSubmit={handleSubmit}>
        {/* Logo and title */}
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

        {/* Username input field */}
        <div className="mb-4">
          <input
            type="text"
            name="username"
            className="form-control form-control-lg shadow-sm login-input"
            placeholder="Username or Email"
            value={form.username}
            onChange={handleChange}
          />
        </div>

        {/* Password input field */}
        <div className="mb-4">
          <input
            type="password"
            name="password"
            className="form-control form-control-lg shadow-sm login-input"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        {/* Forgot Password link */}
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

        {/* Submit button */}
        <button
          type="submit"
          className="btn btn-primary btn-lg w-100 shadow-sm login-btn"
        >
          Log In
        </button>

        {/* Sign-up link */}
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