import { Toast, ToastContainer } from "react-bootstrap";
import "../css/Toast.css"; // Import the toast-specific styles

/**
 * Props:
 * - toast: object with { show, message, bg } for toast state
 * - setToast: setter to update toast state
 */
function ToastMessage({ toast, setToast }) {
  return (
    <ToastContainer position="top-center" className="p-3 toastContainer">
      <Toast
        show={toast.show}
        bg={toast.bg} // Use Bootstrap's default background classes
        onClose={() => setToast({ ...toast, show: false })}
        delay={2000}
        autohide
        className={`toast ${toast.show ? 'fadeIn' : 'fadeOut'}`}
      >
        <Toast.Body className="toastBody">{toast.message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
}

export default ToastMessage;
