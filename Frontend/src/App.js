import './css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import AuthModal from './components/AuthModal';
import React, { useState, useRef } from 'react';
import HomeSection from './components/HomeSection';
import AboutSection from './components/AboutSection';
import Navbar from './components/Navbar';
import ContactPopup from './components/ContactPopup';
import ContactFab from './components/ContactFab';
import useSectionHighlight from './hooks/useSectionHighlight';

function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);

  // Refs for each section
  const homeRef = useRef(null);
  const aboutRef = useRef(null);

  const currentSection = useSectionHighlight([
    { name: 'home', ref: homeRef },
    { name: 'about', ref: aboutRef }
  ]);

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

  // Scroll to section and set current section
  const scrollToSection = (ref, sectionName) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="position-relative">
      {/* Header */}
      <Navbar
        currentSection={currentSection}
        scrollToSection={scrollToSection}
        homeRef={homeRef}
        aboutRef={aboutRef}
        setShowContactPopup={setShowContactPopup}
        setShowAuth={setShowAuth}
      />
      {/* Home Section */}
      <HomeSection
        homeRef={homeRef}
        scrollToSection={scrollToSection}
        aboutRef={aboutRef}
        setShowAuth={setShowAuth}
      />
      {/* About Section */}
      <AboutSection aboutRef={aboutRef} />

      {/* Auth Modal */}
      <AuthModal showAuth={showAuth} setShowAuth={setShowAuth} />

      {/* Floating Contact Button */}
      <ContactFab onClick={() => setShowContactPopup(true)} />
        
      {/* Contact Popup */}
      <ContactPopup
        showContactPopup={showContactPopup}
        setShowContactPopup={setShowContactPopup}
        contact={contact}
        handleContactChange={handleContactChange}
        handleContactSubmit={handleContactSubmit}
        contactSent={contactSent}
      />
    </div>
  );
}

export default App;