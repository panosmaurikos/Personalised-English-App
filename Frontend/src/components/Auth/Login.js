import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/Login.css';

const Login = ({ onToggle }) => (
    <div className="login-bg">
        <div className="text-center w-100">
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
                    className="form-control form-control-lg shadow-sm login-input"
                    placeholder="Username or Email"
                    required
                />
            </div>
            <div className="mb-4">
                <input
                    type="password"
                    className="form-control form-control-lg shadow-sm login-input"
                    placeholder="Password"
                    required
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
        </div>
    </div>
);

export default Login;