import styles from "../css/ContactPopup.module.css";

function ContactPopup({
  showContactPopup,
  setShowContactPopup,
  contact,
  handleContactChange,
  handleContactSubmit,
  contactSent,
}) {
  if (!showContactPopup) return null;

  const handleClose = () => {
    if (typeof setShowContactPopup === "function") {
      setShowContactPopup(false);
    } else {
      setShowContactPopup();
    }
  };

  return (
    <div className={styles["contact-popup-backdrop"]} onClick={handleClose}>
      <div
        className={styles["contact-popup"]}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles["contact-popup-close"]} onClick={handleClose}>
          &times;
        </button>

        <h2 className="fw-bold text-danger mb-4 text-center">Contact Us</h2>

        <div className={styles["section-contact-inner"]}>
          <div className="mb-3">
            <label className="form-label fw-bold">Name</label>
            <input
              type="text"
              className={`form-control ${styles["section-contact-input"]}`}
              name="name"
              value={contact.name}
              onChange={handleContactChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Email</label>
            <input
              type="email"
              className={`form-control ${styles["section-contact-input"]}`}
              name="email"
              value={contact.email}
              onChange={handleContactChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Message</label>
            <textarea
              className={`form-control ${styles["section-contact-input"]}`}
              name="message"
              rows={4}
              value={contact.message}
              onChange={handleContactChange}
              required
            />
          </div>

          <button
            type="submit"
            className={`btn btn-danger px-4 fw-bold w-100 ${styles["section-contact-btn"]}`}
            onClick={handleContactSubmit}
          >
            Send
          </button>

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
