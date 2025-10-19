import { useState } from "react";

const useContact = (handleToast) => {
  // State to control the visibility of the contact popup
  const [showContactPopup, setShowContactPopup] = useState(false);

  // State to store the current values of the contact form fields
  const [contact, setContact] = useState({ name: "", email: "", message: "" });

  // State to indicate whether the contact form was successfully submitted
  const [contactSent, setContactSent] = useState(false);

  // Function to handle changes in the contact form fields
  const handleContactChange = (e) => {
    setContact({ ...contact, [e.target.name]: e.target.value }); // Update the specific field in the contact state
  };

  // Function to handle contact form submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();

    // Simulate a successful form submission
    // Replace this with an API call to send the form data to the backend
    // try {
    //   await axios.post('http://localhost:8081/contact', contact);
    //   setContactSent(true);
    // } catch (error) {
    //   console.error('Contact form error:', error);
    //   return;
    // }

    setContactSent(true); // Indicate that the form was successfully submitted
    setContact({ name: "", email: "", message: "" }); // Reset the form fields

    handleToast("Message sent successfully!", "success"); // Displays a success toast message after the contact form is submitted successfully
  };

  // Function to open the contact popup
  const openContactPopup = () => {
    setShowContactPopup(true); // Set the popup visibility to true
  };

  // Function to close the contact popup
  const closeContactPopup = () => {
    setShowContactPopup(false); // Set the popup visibility to false
  };

  // Return the state and functions to be used in components
  return {
    // State
    showContactPopup,
    contact,
    contactSent,

    // Actions
    openContactPopup,
    closeContactPopup,
    handleContactChange,
    handleContactSubmit,
  };
};

export default useContact;
