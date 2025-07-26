import Auth from './Auth/Auth';

function AuthModal({ showAuth, closeAuth, authMode, toggleAuthMode, login, register }) {
  // If the modal should not be shown, return null to render nothing
  if (!showAuth) return null;

  return (
    <div
      // Backdrop for the modal, covers the entire screen
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center auth-modal-backdrop"
      onClick={closeAuth} // Close the modal when clicking on the backdrop
    >
      <div
        // Modal box, stops propagation of click events to prevent closing
        onClick={e => e.stopPropagation()}
        className="auth-modal-box shadow-lg"
      >
        {/* Render the Auth component inside the modal */}
        <Auth 
          authMode={authMode} // Determines whether to show login or register
          toggleAuthMode={toggleAuthMode} // Function to switch between login and register modes
          login={login} // Function to handle login logic
          register={register} // Function to handle registration logic
        />
      </div>
    </div>
  );
}

export default AuthModal;