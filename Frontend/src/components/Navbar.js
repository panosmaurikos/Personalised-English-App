import React, { useState } from 'react';

function Navbar({
  currentSection, // The currently active section (e.g., 'home', 'about')
  scrollToSection, // Function to scroll to a specific section
  homeRef, // Reference for the Home section
  aboutRef, // Reference for the About section
  openContactPopup, // Function to open the Contact popup
  openAuth, // Function to open the authentication modal
  isAuthenticated, // Boolean indicating if the user is logged in
  user, // Object containing user information
  logout // Function to log out the user
}) {
  const [isCollapsed, setIsCollapsed] = useState(true); // State to manage navbar collapse

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4">
      {/* Brand logo and name */}
      <a
        className="navbar-brand fw-bold text-danger"
        href="#home"
        onClick={e => { e.preventDefault(); scrollToSection(homeRef); }} // Scroll to Home section
      >
        <img src="https://img.icons8.com/color/48/000000/graduation-cap.png" alt="LinguaLearn" />
        LinguaLearn
      </a>

      {/* Toggle button for collapsing navbar */}
      <button
        className="navbar-toggler"
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-controls="navbarNav"
        aria-expanded={!isCollapsed}
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className={`collapse navbar-collapse${isCollapsed ? '' : ' show'}`} id="navbarNav">
        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
          {/* Home link */}
          <li className="nav-item mx-2">
            <a
              className={`nav-link fw-bold${currentSection === 'home' ? ' text-danger' : ''}`}
              href="#home"
              onClick={e => { e.preventDefault(); scrollToSection(homeRef); }} // Scroll to Home section
            >
              Home
            </a>
          </li>

          {/* About link */}
          <li className="nav-item mx-2">
            <a
              className={`nav-link fw-bold${currentSection === 'about' ? ' text-danger' : ''}`}
              href="#about"
              onClick={e => { e.preventDefault(); scrollToSection(aboutRef); }} // Scroll to About section
            >
              About
            </a>
          </li>

          {/* Contact Us button */}
          <li className="nav-item mx-2">
            <a
              className="fw-bold btn btn-danger px-3 py-1 ms-2 rounded-pill text-white"
              style={{ fontWeight: 700, letterSpacing: 1 }}
              href="#contact"
              onClick={e => {
                e.preventDefault();
                openContactPopup(); // Open the Contact popup
              }}
            >
              Contact Us
            </a>
          </li>
        </ul>
      </div>

      {/* User authentication section */}
      {isAuthenticated ? (
        <div className="d-flex align-items-center">
          {/* Welcome message */}
          <span className="me-3 text-muted">Welcome, {user?.username || 'User'}!</span>

          {/* Logout button */}
          <button
            className="btn btn-outline-danger rounded-circle ms-3 btn-user d-flex align-items-center justify-content-center"
            onClick={logout} // Log out the user
            title="Logout"
          >
            <img
              src="https://img.icons8.com/ios-glyphs/30/fa314a/logout-rounded-up.png"
              alt="Logout"
            />
          </button>
        </div>
      ) : (
        <button
          className="btn btn-outline-danger rounded-circle ms-3 btn-user d-flex align-items-center justify-content-center"
          onClick={() => openAuth("login")} // Open the authentication modal in login mode
          title="Login/Register"
        >
          <img
            src="https://img.icons8.com/ios-glyphs/30/fa314a/user--v1.png"
            alt="User"
          />
        </button>
      )}
    </nav>
  );
}

export default Navbar;