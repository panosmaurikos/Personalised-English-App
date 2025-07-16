import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const Auth = ({ defaultRegister }) => {
  // If defaultRegister is true, show Register by default, else Login
  const [showLogin, setShowLogin] = useState(!defaultRegister);

  return (
    <div>
      {showLogin ? (
        <Login onToggle={() => setShowLogin(false)} />
      ) : (
        <Register onToggle={() => setShowLogin(true)} />
      )}
    </div>
  );
};

export default Auth;