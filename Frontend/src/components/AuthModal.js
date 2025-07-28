import { useRef } from 'react';
import Auth from './Auth/Auth';

// AuthModal handles the authentication modal display and backdrop logic
function AuthModal({ showAuth, closeAuth, authMode, toggleAuthMode, login, register, handleToast }) {
  const mouseDownTarget = useRef(null); // Track where mouse down started

  // If the modal should not be shown, render nothing
  if (!showAuth) return null;

  // Store the target of the mouse down event
  const handleBackdropMouseDown = (e) => {
    mouseDownTarget.current = e.target;
  };

  // Only close the modal if both mouse down and mouse up are on the backdrop
  const handleBackdropMouseUp = (e) => {
    if (mouseDownTarget.current === e.currentTarget && e.target === e.currentTarget) {
      closeAuth();
    }
    mouseDownTarget.current = null;
  };

  return (
    <div
      // Backdrop for the modal, covers the entire screen
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center auth-modal-backdrop"
      onMouseDown={handleBackdropMouseDown}
      onMouseUp={handleBackdropMouseUp}
    >
      <div
        // Modal box, stops propagation of click events to prevent closing when interacting inside
        className="auth-modal-box shadow-lg"
        onMouseDown={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
      >
        {/* Render the Auth component inside the modal, passing all necessary props */}
        <Auth 
          authMode={authMode} // Determines whether to show login or register
          toggleAuthMode={toggleAuthMode} // Function to switch between login and register modes
          login={login} // Function to handle login logic
          register={register} // Function to handle registration logic
          handleToast={handleToast} // Function to handle toast notifications
        />
      </div>
    </div>
  );
}

export default AuthModal;