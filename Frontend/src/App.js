import React, { useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Tests from "./pages/Tests";
import TeacherDashboard from "./pages/TeacherDashboard";
import AuthModal from "./components/AuthModal";
import useAuth from "./hooks/useAuth";
import useContact from "./hooks/useContact";
import useToast from "./hooks/useToast";
import useSectionHighlight from "./hooks/useSectionHighlight";
import ToastMessage from "./components/ToastMessage";
import Navbar from "./components/Navbar";
import ContactPopup from "./components/ContactPopup";
import ContactFab from "./components/ContactFab";

function App() {
  const location = useLocation();
  const isHiddenPage = location.pathname === "/tests" || location.pathname === "/dashboard";  // Hide on both /tests and /dashboard

  const { toast, setToast, handleToast } = useToast();

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

  const {
    showContactPopup,
    contact,
    contactSent,
    openContactPopup,
    closeContactPopup,
    handleContactChange,
    handleContactSubmit,
  } = useContact(handleToast);

  const homeRef = useRef(null);
  const aboutRef = useRef(null);

  const currentSection = useSectionHighlight([
    { name: "home", ref: homeRef },
    { name: "about", ref: aboutRef },
  ]);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  function PrivateRoute({ children }) {
    return isAuthenticated ? children : <Navigate to="/" replace />;
  }

  function PrivateTeacherRoute({ children }) {
    return isAuthenticated && user?.role === 'teacher' ? children : <Navigate to="/" replace />;
  }

  return (
    <div className="position-relative">
      {!isHiddenPage && (
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
      )}

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              homeRef={homeRef}
              scrollToSection={scrollToSection}
              aboutRef={aboutRef}
              openAuth={openAuth}
              isAuthenticated={isAuthenticated}
            />
          }
        />
        <Route
          path="/tests"
          element={
            <PrivateRoute>
              <Tests />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateTeacherRoute>
              <TeacherDashboard />
            </PrivateTeacherRoute>
          }
        />
      </Routes>

      {!isHiddenPage && (
        <>
          <AuthModal
            showAuth={showAuth}
            closeAuth={closeAuth}
            authMode={authMode}
            toggleAuthMode={toggleAuthMode}
            login={login}
            register={register}
            handleToast={handleToast}
          />

          <ContactFab onClick={openContactPopup} />

          <ContactPopup
            showContactPopup={showContactPopup}
            setShowContactPopup={closeContactPopup}
            contact={contact}
            handleContactChange={handleContactChange}
            handleContactSubmit={handleContactSubmit}
            contactSent={contactSent}
          />
        </>
      )}

      <ToastMessage toast={toast} setToast={setToast} />
    </div>
  );
}

export default App;