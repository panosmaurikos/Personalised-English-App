import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../css/Navbar.module.css';

function Navbar({
  currentSection,
  scrollToSection,
  homeRef,
  aboutRef,
  openContactPopup,
  openAuth,
  isAuthenticated,
  user,
  logout
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleTestsClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate('/tests');
    } else {
      openAuth("register");
    }
  };

  const handleDashboardClick = (e) => {
    e.preventDefault(); // Αυτό είναι καλή πρακτική, αλλά δεν είναι απαραίτητο για το <button>
    // Ελέγχουμε τον ρόλο του χρήστη για να προσδιορίσουμε το σωστό URL
    if (user?.role === 'teacher') {
      navigate('/teacher-dashboard'); // Οδηγούμε τον δάσκαλο στο δικό του dashboard
    } else {
      navigate('/dashboard'); // Οδηγούμε τον μαθητή στο δικό του dashboard
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate('/');
  };

  const isTestsPage = location.pathname === '/tests';

  return (
    <nav className={`navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4 ${styles.navbar}`}>
      <a
        className={`navbar-brand fw-bold text-danger ${styles['navbar-brand']}`}
        href="/"
        onClick={handleLogoClick}
      >
        <img src="https://img.icons8.com/color/48/000000/graduation-cap.png    " alt="LinguaLearn" className={styles['navbar-brand-img']} />
        LinguaLearn
      </a>

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
          {!isTestsPage && (
            <>
              <li className="nav-item mx-2">
                <a
                  className={`nav-link fw-bold${currentSection === 'home' ? ' text-danger' : ''} ${styles['nav-link']}`}
                  href="#home"
                  onClick={e => { e.preventDefault(); scrollToSection(homeRef); }}
                >
                  Home
                </a>
              </li>
              <li className="nav-item mx-2">
                <a
                  className={`nav-link fw-bold${currentSection === 'about' ? ' text-danger' : ''} ${styles['nav-link']}`}
                  href="#about"
                  onClick={e => { e.preventDefault(); scrollToSection(aboutRef); }}
                >
                  About
                </a>
              </li>
            </>
          )}

          <li className="nav-item mx-2">
            <a
              className={`fw-bold btn btn-outline-success ${styles['navbar-test-btn']}`}
              href="/tests"
              onClick={handleTestsClick}
            >
              Take a Test
            </a>
          </li>

          {/* Νέο κουμπί για το Dashboard - Εμφανίζεται μόνο αν είναι συνδεδεμένος */}
          {isAuthenticated && (
            <li className="nav-item mx-2">
              {/* Χρήση <button> αντί για <a> */}
              <button
                className={`fw-bold btn btn-outline-primary ${styles['navbar-test-btn']}`} // Χρησιμοποιούμε το ίδιο style ή ένα διαφορετικό
                onClick={handleDashboardClick}
                
                // Προσθέτουμε type="button" για να μην προκαλέσει submit αν είναι μέσα σε form (δεν είναι, αλλά καλή πρακτική)
                type="button"
              >
                My Dashboard {/* Ή οτιδήποτε άλλο θέλεις να λέει */}
              </button>
            </li>
          )}

          <li className="nav-item mx-2">
            <a
              className={`fw-bold btn btn-danger text-white ${styles['navbar-contact-btn']}`}
              href="#contact"
              onClick={e => {
                e.preventDefault();
                openContactPopup();
              }}
            >
              Contact Us
            </a>
          </li>
        </ul>
      </div>

      {isAuthenticated ? (
        <div className="d-flex align-items-center">
          <span className="me-3 text-muted">Welcome, {user?.username || 'User'}!</span>
          <button
            className={`btn btn-outline-danger rounded-circle ms-3 ${styles['btn-user']}`}
            onClick={logout}
            title="Logout"
          >
            <img
              src="https://img.icons8.com/ios-glyphs/30/fa314a/logout-rounded-up.png    "
              alt="Logout"
              className={styles['btn-user-img']}
            />
          </button>
        </div>
      ) : (
        <button
          className={`btn btn-outline-danger rounded-circle ms-3 ${styles['btn-user']}`}
          onClick={() => openAuth("login")}
          title="Login/Register"
        >
          <img
            src="https://img.icons8.com/ios-glyphs/30/fa314a/user--v1.png    "
            alt="User"
            className={styles['btn-user-img']}
          />
        </button>
      )}
    </nav>
  );
}

export default Navbar;