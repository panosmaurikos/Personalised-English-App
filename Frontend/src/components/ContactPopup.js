import React from 'react';

function ContactPopup({
  showContactPopup, // Boolean to determine if the popup should be displayed
  setShowContactPopup, // Function to toggle the visibility of the popup
  contact, // Object containing contact form data (name, email, message)
  handleContactChange, // Function to handle changes in the contact form inputs
  handleContactSubmit, // Function to handle form submission
  contactSent // Boolean indicating if the contact form was successfully sent
}) {
  // If the popup should not be shown, return null to render nothing
  if (!showContactPopup) return null;

  const handleClose = () => {
    // Close the popup by setting showContactPopup to false
    if (typeof setShowContactPopup === 'function') {
      setShowContactPopup(false);
    } else {
      setShowContactPopup();
    }
  };

  return (
    <div 
      // Backdrop for the popup, closes the popup when clicked
      className="contact-popup-backdrop" 
      onClick={handleClose}
    >
      <div 
        // Popup box, stops propagation of click events to prevent closing
        className="contact-popup position-relative" 
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button className="contact-popup-close" onClick={handleClose}>
          &times;
        </button>

        {/* Popup title */}
        <h2 className="fw-bold text-danger mb-4 text-center">Contact Us</h2>

        <div className="section-contact-inner">
          {/* Name input field */}
          <div className="mb-3">
            <label className="form-label fw-bold">Name</label>
            <input
              type="text"
              className="form-control section-contact-input"
              name="name"
              value={contact.name} // Bind input value to contact.name
              onChange={handleContactChange} // Handle input changes
              required // Browser validation for required field
            />
          </div>

          {/* Email input field */}
          <div className="mb-3">
            <label className="form-label fw-bold">Email</label>
            <input
              type="email"
              className="form-control section-contact-input"
              name="email"
              value={contact.email} // Bind input value to contact.email
              onChange={handleContactChange} // Handle input changes
              required // Browser validation for required field
            />
          </div>

          {/* Message textarea field */}
          <div className="mb-3">
            <label className="form-label fw-bold">Message</label>
            <textarea
              className="form-control section-contact-input"
              name="message"
              rows={4}
              value={contact.message} // Bind textarea value to contact.message
              onChange={handleContactChange} // Handle input changes
              required // Browser validation for required field
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="btn btn-danger px-4 fw-bold w-100 section-contact-btn"
            onClick={handleContactSubmit} // Handle form submission
          >
            Send
          </button>

          {/* Success message */}
          {contactSent && (
            <div 
              className="alert alert-success mt-3 py-2 text-center" 
              role="alert"
            >
              Thank you for contacting us! We will get back to you soon.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContactPopup;