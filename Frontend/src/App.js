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
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Tests from "./pages/Tests";

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

  // PrivateRoute component for protecting routes
  // This component checks if the user is authenticated.
  // If authenticated, it renders the child components (protected page).
  // If not authenticated, it redirects the user to the home page ("/").
function PrivateRoute({ children }) {
  return !isAuthenticated ? children : <Navigate to="/" replace />;
}

  return (
    <Router>
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

        <Routes>
          {/* Public route: Home page ("/") */}
          <Route
            path="/"
            element={
              <>
                {/* Home Section */}
                <HomeSection
                  homeRef={homeRef}
                  scrollToSection={scrollToSection}
                  aboutRef={aboutRef}
                  openAuth={openAuth}
                  isAuthenticated={isAuthenticated}
                />

                {/* About Section */}
                <AboutSection aboutRef={aboutRef} />
              </>
            }
          />
          {/* Protected route: Tests page ("/tests") */}
          <Route
            path="/tests"
            element={
              <PrivateRoute>
                <Tests />
              </PrivateRoute>
            }
          />
        </Routes>

        {/* Authentication Modal for login/register */}
        <AuthModal
          showAuth={showAuth}
          closeAuth={closeAuth}
          authMode={authMode}
          toggleAuthMode={toggleAuthMode}
          login={login}
          register={register}
          handleToast={handleToast}
        />

        {/* Floating Contact Button */}
        <ContactFab onClick={openContactPopup} />

        {/* Contact Popup for user messages */}
        <ContactPopup
          showContactPopup={showContactPopup}
          setShowContactPopup={closeContactPopup}
          contact={contact}
          handleContactChange={handleContactChange}
          handleContactSubmit={handleContactSubmit}
          contactSent={contactSent}
        />

        {/* Toast Notification for feedback messages */}
        <ToastMessage toast={toast} setToast={setToast} />
      </div>
    </Router>
  );
}

export default App;
