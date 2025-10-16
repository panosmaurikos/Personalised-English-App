import { Toast, ToastContainer } from "react-bootstrap";
import styles from '../css/Toast.module.css';

function ToastMessage({ toast, setToast }) {
  return (
    <ToastContainer position="top-center" className={`p-3 ${styles.toastContainer}`}>
      <Toast
        show={toast.show}
        bg={toast.bg}
        onClose={() => setToast({ ...toast, show: false })}
        delay={2000}
        autohide
        className={`toast ${toast.show ? styles.fadeIn : styles.fadeOut}`}
      >
        <Toast.Body className={styles.toastBody}>{toast.message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
}

export default ToastMessage;