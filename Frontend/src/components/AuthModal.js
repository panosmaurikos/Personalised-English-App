import styles from "../css/AuthModal.module.css";
import Auth from "./Auth/Auth";

function AuthModal({
  showAuth,
  closeAuth,
  authMode,
  toggleAuthMode,
  login,
  register,
  handleToast,
}) {
  if (!showAuth) return null;

  return (
    <div className={styles["auth-modal-backdrop"]}>
      <div className={styles["auth-modal-box"]}>
        <button
          className="btn-close position-absolute top-0 end-0 m-3"
          onClick={closeAuth}
        ></button>
        <Auth
          authMode={authMode}
          toggleAuthMode={toggleAuthMode}
          login={login}
          register={register}
          handleToast={handleToast}
        />
      </div>
    </div>
  );
}

export default AuthModal;
