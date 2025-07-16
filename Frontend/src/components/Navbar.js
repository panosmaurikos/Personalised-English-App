import React from 'react';

function Navbar({
  currentSection,
  scrollToSection,
  homeRef,
  aboutRef,
  setShowContactPopup,
  setShowAuth
}) {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4">
      <a
        className="navbar-brand fw-bold text-danger"
        href="#home"
        onClick={e => { e.preventDefault(); scrollToSection(homeRef, 'home'); }}
      >
        <img src="https://img.icons8.com/color/48/000000/graduation-cap.png" alt="LinguaLearn" />
        LinguaLearn
      </a>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
          <li className="nav-item mx-2">
            <a
              className={`nav-link fw-bold${currentSection === 'home' ? ' text-danger' : ''}`}
              href="#home"
              onClick={e => { e.preventDefault(); scrollToSection(homeRef, 'home'); }}
            >
              Home
            </a>
          </li>
          <li className="nav-item mx-2">
            <a
              className={`nav-link fw-bold${currentSection === 'about' ? ' text-danger' : ''}`}
              href="#about"
              onClick={e => { e.preventDefault(); scrollToSection(aboutRef, 'about'); }}
            >
              About
            </a>
          </li>
          <li className="nav-item mx-2">
            <a
              className="fw-bold btn btn-danger px-3 py-1 ms-2 rounded-pill text-white"
              style={{ fontWeight: 700, letterSpacing: 1 }}
              href="#contact"
              onClick={e => {
                e.preventDefault();
                setShowContactPopup(true);
              }}
            >
              Contact Us
            </a>
          </li>
        </ul>
      </div>
      <button
        className="btn btn-outline-danger rounded-circle ms-3 btn-user d-flex align-items-center justify-content-center"
        onClick={() => setShowAuth("login")}
        title="Login/Register"
      >
        <img
          src="https://img.icons8.com/ios-glyphs/30/fa314a/user--v1.png"
          alt="User"
        />
      </button>
    </nav>
  );
}

export default Navbar;