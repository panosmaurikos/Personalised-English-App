import { useRef, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import Tests from "./pages/Tests";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import Recommended from "./pages/Recommended";
import AuthModal from "./components/AuthModal";
import useAuth from "./hooks/useAuth";
import useContact from "./hooks/useContact";
import useToast from "./hooks/useToast";
import useSectionHighlight from "./hooks/useSectionHighlight";
import ToastMessage from "./components/ToastMessage";
import Navbar from "./components/Navbar";
import ContactPopup from "./components/ContactPopup";
import ContactFab from "./components/ContactFab";
import RecommendedTest from "./pages/RecommendedTest";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Auth check: log out and redirect if user is deleted from DB
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

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("jwt");
      if (!token) return;
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          logout();
          <Navigate to="/login" replace />;
        }
      } catch {
        logout();
        <Navigate to="/login" replace />;
      }
    }
    checkAuth();
  }, [navigate, logout]);

  const isHiddenPage =
    location.pathname === "/tests" ||
    location.pathname === "/dashboard" ||
    location.pathname === "/teacher-dashboard" ||
    location.pathname === "/recommended" ||
    location.pathname === "/login";

  // ...existing code...

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

  // Improved PrivateRoute with role check
  function PrivateRoute({ children, requiredRole = null }) {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (requiredRole && user?.role !== requiredRole) {
      // If teacher tries to access student route, redirect to teacher-dashboard
      if (user?.role === "teacher")
        return <Navigate to="/teacher-dashboard" replace />;
      // If student tries to access teacher route, redirect to dashboard
      return <Navigate to="/dashboard" replace />;
    }
    return children;
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
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <div className="container">
                <AuthModal
                  showAuth={true}
                  closeAuth={() => navigate("/")}
                  authMode={authMode}
                  toggleAuthMode={toggleAuthMode}
                  login={login}
                  register={register}
                  handleToast={handleToast}
                />
              </div>
            )
          }
        />
        {/* Student-only routes */}
        <Route
          path="/tests"
          element={
            <PrivateRoute requiredRole="student">
              <Tests />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute requiredRole="student">
              <Dashboard />
            </PrivateRoute>
          }
        />
        {/* Teacher-only route */}
        <Route
          path="/teacher-dashboard"
          element={
            <PrivateRoute requiredRole="teacher">
              <TeacherDashboard />
            </PrivateRoute>
          }
        />
        {/* Both roles can access recommended */}
        <Route
          path="/recommended"
          element={
            <PrivateRoute>
              <Recommended />
            </PrivateRoute>
          }
        />
        <Route
          path="/recommended-test"
          element={
            <PrivateRoute>
              <RecommendedTest />
            </PrivateRoute>
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
