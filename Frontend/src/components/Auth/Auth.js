import Login from './Login';
import Register from './Register';

const Auth = ({ authMode, toggleAuthMode, login, register, handleToast }) => {
  return (
    <div>
      {/* Conditionally render the Login or Register component based on the authMode prop */}
      {authMode === 'login' ? (
        // Render the Login component if authMode is 'login'
        <Login 
          onToggle={toggleAuthMode} // Function to switch to the Register mode
          login={login} // Function to handle user login
          handleToast={handleToast} // Function to handle toast notifications
        />
      ) : (
        // Render the Register component if authMode is 'register'
        <Register 
          onToggle={toggleAuthMode} // Function to switch to the Login mode
          register={register} // Function to handle user registration
          handleToast={handleToast} // Function to handle toast notifications
        />
      )}
    </div>
  );
};

export default Auth;