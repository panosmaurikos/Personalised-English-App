import "./css/App.css";
import AuthModal from "./components/AuthModal";
import { useRef } from "react";
import HomeSection from "./components/HomeSection";
import AboutSection from "./components/AboutSection";
import Navbar from "./components/Navbar";
import ContactPopup from "./components/ContactPopup";
import ContactFab from "./components/ContactFab";
import useSectionHighlight from "./hooks/useSectionHighlight";
import useAuth from "./hooks/useAuth";
import useContact from "./hooks/useContact";
import useToast from "./hooks/useToast";
import ToastMessage from "./components/ToastMessage";

function App() {
  // The custom toast hook provides state and methods to display toast notifications
  const { toast, setToast, handleToast } = useToast();

  // Use the custom auth hook to manage authentication logic
  const {
    showAuth,
    authMode,
    user,
    isAuthenticated,
    openAuth,
    closeAuth,
    toggleAuthMode,
    login,
    register,
    logout,
  } = useAuth(handleToast);

  // Use the custom contact hook to manage contact form logic
  const {
    showContactPopup,
    contact,
    contactSent,
    openContactPopup,
    closeContactPopup,
    handleContactChange,
    handleContactSubmit,
  } = useContact(handleToast);

  // Refs for each section to enable smooth scrolling
  const homeRef = useRef(null);
  const aboutRef = useRef(null);

  // Highlight the current section in view
  const currentSection = useSectionHighlight([
    { name: "home", ref: homeRef },
    { name: "about", ref: aboutRef },
  ]);

  // Function to scroll smoothly to a specific section
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="position-relative">
      {/* Navbar for navigation and user actions */}
      <Navbar
        currentSection={currentSection}
        scrollToSection={scrollToSection}
        homeRef={homeRef}
        aboutRef={aboutRef}
        openContactPopup={openContactPopup}
        openAuth={openAuth}
        isAuthenticated={isAuthenticated}
        user={user}
        logout={logout}
      />

      {/* Home Section */}
      <HomeSection
        homeRef={homeRef}
        scrollToSection={scrollToSection}
        aboutRef={aboutRef}
        openAuth={openAuth}
      />

      {/* About Section */}
      <AboutSection aboutRef={aboutRef} />

      {/* Authentication Modal */}
      <AuthModal
        showAuth={showAuth}
        closeAuth={closeAuth}
        authMode={authMode}
        toggleAuthMode={toggleAuthMode}
        login={login}
        register={register}
      />

      {/* Floating Contact Button */}
      <ContactFab onClick={openContactPopup} />

      {/* Contact Popup */}
      <ContactPopup
        showContactPopup={showContactPopup}
        setShowContactPopup={closeContactPopup}
        contact={contact}
        handleContactChange={handleContactChange}
        handleContactSubmit={handleContactSubmit}
        contactSent={contactSent}
      />

      {/* Toast Notification */}
      <ToastMessage toast={toast} setToast={setToast} />
    </div>
  );
}

export default App;
