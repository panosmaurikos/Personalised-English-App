import React from 'react';
import Auth from './Auth/Auth';

function AuthModal({ showAuth, setShowAuth }) {
  if (!showAuth) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center auth-modal-backdrop"
      onClick={() => setShowAuth(false)}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="auth-modal-box shadow-lg"
      >
        <Auth defaultRegister={showAuth === "register"} />
      </div>
    </div>
  );
}

export default AuthModal;