import { useState } from 'react';
import '../../css/Login.css';

const Login = ({ onToggle, login, handleToast }) => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username) {
      showError('Username or Email is required');
      return;
    }
    if (!form.password) {
      showError('Password is required');
      return;
    }
    try {
      await login(form);
      setForm({ username: '', password: '' });
      setError('');
    } catch (err) {
      showError('Invalid credentials');
    }
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 3500);
  };

  // Forgot password handlers
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      showError('Email is required');
      return;
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      if (!res.ok) throw new Error('Failed to send code');
      setOtpSent(true);
      showError('');
      handleToast('A reset code was sent to your email.', 'info');
    } catch {
      showError('Failed to send reset code. Please check your email.');
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      showError('Code and new password are required');
      return;
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: otp, new_password: newPassword }),
      });
      if (!res.ok) throw new Error('Failed to reset password');
      showError('');
      handleToast('Password reset successful! You can now log in.', 'success');
      setShowForgot(false);
      setOtpSent(false);
      setForgotEmail('');
      setOtp('');
      setNewPassword('');
    } catch {
      showError('Invalid code or expired. Try again.');
    }
  };

  // UI rendering
  if (showForgot) {
    return (
      <div className="login-bg">
        <form className="text-center w-100" onSubmit={otpSent ? handleResetSubmit : handleForgotSubmit}>
          {error && (
            <div className="alert alert-danger py-2 mb-3" role="alert">
              {error}
            </div>
          )}
          <h2 className="login-title mb-2">Forgot Password</h2>
          <p className="text-muted small mb-4">
            {otpSent
              ? 'Enter the code sent to your email and your new password.'
              : 'Enter your email to receive a reset code.'}
          </p>
          {!otpSent ? (
            <>
              <div className="mb-4">
                <input
                  type="email"
                  name="forgotEmail"
                  className="form-control form-control-lg shadow-sm login-input"
                  placeholder="Email"
                  value={forgotEmail}
                  onChange={e => { setForgotEmail(e.target.value); setError(''); }}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg w-100 shadow-sm login-btn">
                Send Code
              </button>
            </>
          ) : (
            <>
              <div className="mb-3">
                <input
                  type="text"
                  name="otp"
                  className="form-control form-control-lg shadow-sm login-input"
                  placeholder="Reset Code"
                  value={otp}
                  onChange={e => { setOtp(e.target.value); setError(''); }}
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  name="newPassword"
                  className="form-control form-control-lg shadow-sm login-input"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setError(''); }}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg w-100 shadow-sm login-btn">
                Reset Password
              </button>
            </>
          )}
          <div className="mt-3 text-center">
            <button type="button" className="btn btn-link small" onClick={() => {
              setShowForgot(false);
              setOtpSent(false);
              setForgotEmail('');
              setOtp('');
              setNewPassword('');
              setError('');
            }}>
              Back to Login
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="login-bg">
      <form className="text-center w-100" onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert-danger py-2 mb-3 login-error-alert" role="alert">
            {error}
          </div>
        )}

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
            className="login-link small btn btn-link p-0 login-forgot-btn"
            onClick={() => setShowForgot(true)}
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