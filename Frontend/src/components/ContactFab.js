function ContactFab({ onClick }) {
  return (
    <button
      // Floating action button for contacting support
      className="contact-fab"
      onClick={onClick} // Trigger the provided onClick function when clicked
      title="Contact Us" // Tooltip text for the button
    >
      <img 
        // Icon for the contact button
        src="https://img.icons8.com/ios-filled/40/fa314a/chat.png" 
        alt="Contact" // Alternative text for the image
      />
    </button>
  );
}

export default ContactFab;