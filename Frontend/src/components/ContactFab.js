import React from 'react';

function ContactFab({ onClick }) {
  return (
    <button
      className="contact-fab"
      onClick={onClick}
      title="Contact Us"
    >
      <img src="https://img.icons8.com/ios-filled/40/fa314a/chat.png" alt="Contact" />
    </button>
  );
}

export default ContactFab;