import './css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Auth from './components/Auth/Auth';
import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [showAuth, setShowAuth] = useState(false);

  // Refs for each section
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  // Track current section for nav highlight
  const [currentSection, setCurrentSection] = useState('home');
  useEffect(() => {
    const handleScroll = () => {
      // This runs every time the user scrolls
      console.log('User is scrolling...');
      window.addEventListener('scroll', handleScroll, { passive: true });

    };


    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  // Set favicon and page title
  useEffect(() => {
    const favicon = document.getElementById('dynamic-favicon') || document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.id = 'dynamic-favicon';
    favicon.href = 'https://img.icons8.com/color/48/000000/graduation-cap.png';
    document.head.appendChild(favicon);

    document.title = 'LinguaLearn - Personalized English Platform';
  }, []);

  // Contact form state
  const [contact, setContact] = useState({ name: '', email: '', message: '' });
  const [contactSent, setContactSent] = useState(false);

  const handleContactChange = e => {
    setContact({ ...contact, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = e => {
    e.preventDefault();
    setContactSent(true);
    setContact({ name: '', email: '', message: '' });
    setTimeout(() => setContactSent(false), 3000);
  };


  useEffect(() => {
    const sections = [
      { name: 'home', ref: homeRef },
      { name: 'about', ref: aboutRef },
      { name: 'contact', ref: contactRef }
    ];

    const handleScroll = () => {
      // Debug log
      console.log('User is scrolling...');

      const scrollPos = window.scrollY + (document.querySelector('.navbar')?.offsetHeight || 0) + 10;
      let current = sections[0].name;

      for (let i = 0; i < sections.length; i++) {
        const { name, ref } = sections[i];
        const elem = ref.current;
        if (!elem) continue;
        const top = elem.offsetTop;
        const bottom = top + elem.offsetHeight;
        if (scrollPos >= top && scrollPos < bottom) {
          current = name;
          break;
        }
        // if we're past the last section
        if (i === sections.length - 1 && scrollPos >= top) {
          current = name;
        }
      }

      // If scrolled to bottom, highlight contact
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 2) {
        current = 'contact';
      }

      setCurrentSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll(); // set initial state

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Scroll to section and set current section
  const scrollToSection = (ref, sectionName) => {
    setCurrentSection(sectionName);
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="position-relative">
      {/* Header */}
      <nav
        className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4"
      >
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
              >Home</a>
            </li>
            <li className="nav-item mx-2">
              <a
                className={`nav-link fw-bold${currentSection === 'about' ? ' text-danger' : ''}`}
                href="#about"
                onClick={e => { e.preventDefault(); scrollToSection(aboutRef, 'about'); }}
              >About</a>
            </li>
            <li className="nav-item mx-2">
              <a
                className={`nav-link fw-bold${currentSection === 'contact' ? ' text-danger' : ''}`}
                href="#contact"
                onClick={e => { e.preventDefault(); scrollToSection(contactRef, 'contact'); }}
              >Contact Us</a>
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
      {/* Home Section */}
      <section ref={homeRef} id="home" className="container py-5">
        <div className="row align-items-center">
          <div className="col-md-6">
            <h1 className="display-4 fw-bold text-danger mb-3 section-home-title">ONLINE<br />EDUCATION</h1>
            <p className="lead text-secondary mb-4">
              Unlock Your English Potential<br />
              Welcome to our personalized English learning platform, designed to help you achieve fluency and confidence. Whether you’re a student, professional, or lifelong learner, our tailored lessons and interactive tools adapt to your unique needs and goals. Start your journey to better English today!
            </p>
            <div className="d-flex gap-3 mb-4">
              <button
                className="btn btn-danger btn-lg rounded-pill px-4 fw-bold shadow-sm"
                onClick={() => setShowAuth("register")}
              >
                TRY NOW
              </button>
              <button
                className="btn btn-outline-danger btn-lg rounded-pill px-4 fw-bold shadow-sm"
                onClick={() => scrollToSection(aboutRef, 'about')}
              >
                SEE MORE
              </button>
            </div>
          </div>
          <div className="col-md-6 text-center position-relative">
            <div className="rounded-circle position-absolute section-home-img-bg"></div>
            <img
              src={process.env.PUBLIC_URL + '/site_image.png'}
              alt="Online Education"
              className="section-home-img"
            />
            <div className="section-home-dot1"></div>
            <div className="section-home-dot2"></div>
          </div>
        </div>
        {/* News & Blog Section */}
        <div className="row pt-5">
          <div className="col-md-6 mb-4">
            <div className="p-4 bg-white rounded-4 shadow-sm h-100">
              <div className="d-flex align-items-center mb-2">
                <img src="https://img.icons8.com/color/32/000000/news.png" alt="News" className="me-2" />
                <h4 className="fw-bold mb-0 text-danger">News</h4>
              </div>
              <p className="text-secondary mb-0">
                We are excited to announce the launch of our new adaptive learning modules! These updates make it easier than ever to track your progress and receive personalized feedback from our expert instructors.
              </p>
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="p-4 bg-white rounded-4 shadow-sm h-100">
              <div className="d-flex align-items-center mb-2">
                <img src="https://img.icons8.com/color/32/000000/blog.png" alt="Blog" className="me-2" />
                <h4 className="fw-bold mb-0 text-danger">Blog</h4>
              </div>
              <p className="text-secondary mb-0">
                Discover tips for mastering English, from effective study habits to real-world conversation practice. Read our latest articles on language learning strategies, student success stories, and updates from our teaching team.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* About Section */}
      <section ref={aboutRef} id="about" className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8 section-about-inner">
            <h2 className="fw-bold text-danger mb-4 text-center">About LinguaLearn</h2>
            <p className="lead text-secondary mb-4">
              <b>Our Goal:</b> At LinguaLearn, our mission is to empower learners of all backgrounds to master the English language through a personalized, adaptive, and engaging platform. We believe that every learner is unique, and our technology tailors lessons, exercises, and feedback to your individual needs and pace.
            </p>
            <p className="text-secondary mb-4">
              Our platform combines expert-designed curriculum with smart analytics to help you track your progress and focus on areas that matter most. Whether you are preparing for exams, improving your professional communication, or simply aiming for fluency, LinguaLearn is here to support your journey every step of the way.
            </p>
            <p className="text-secondary mb-4">
              Join our community and unlock your full potential with interactive lessons, real-world practice, and support from experienced instructors.
            </p>
            <div className="text-center">
              <button
                className="btn btn-outline-danger btn-lg rounded-pill px-4 fw-bold shadow-sm"
                onClick={() => scrollToSection(contactRef, 'contact')}
              >
                CONTACT US
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Contact Section */}
      <section ref={contactRef} id="contact" className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 section-about-inner p-5">
            <h2 className="fw-bold text-danger mb-4 text-center">Contact Us</h2>
            <div className="section-contact-inner">
              <div className="mb-3">
                <label className="form-label fw-bold">Name</label>
                <input
                  type="text"
                  className="form-control section-contact-input"
                  name="name"
                  value={contact.name}
                  onChange={handleContactChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Email</label>
                <input
                  type="email"
                  className="form-control section-contact-input"
                  name="email"
                  value={contact.email}
                  onChange={handleContactChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Message</label>
                <textarea
                  className="form-control section-contact-input"
                  name="message"
                  rows={4}
                  value={contact.message}
                  onChange={handleContactChange}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-danger px-4 fw-bold w-100 section-contact-btn"
                onClick={handleContactSubmit}
              >
                Send
              </button>
              {contactSent && (
                <div className="alert alert-success mt-3 py-2 text-center" role="alert">
                  Thank you for contacting us! We will get back to you soon.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Auth Modal */}
      {showAuth && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background: 'rgba(0,0,0,0.25)',
            zIndex: 9999
          }}
          onClick={() => setShowAuth(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="rounded-4 shadow-lg p-0"
            style={{
              background: '#fff',
              minWidth: 400,
              maxWidth: '90vw',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
            }}
          >
            <Auth defaultRegister={showAuth === "register"} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;