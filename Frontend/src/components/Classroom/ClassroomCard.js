import styles from "../../css/ClassroomCard.module.css";

function ClassroomCard({ classroom, onView, onManageTests, onViewResults }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{classroom.name}</h3>
      <p className={styles.desc}>{classroom.description || "No description"}</p>
      <div className={styles.inviteSection}>
        <p className={styles.inviteLabel}>Invite Code:</p>
        <code className={styles.inviteCode}>{classroom.invite_code}</code>
      </div>
      <p className={styles.info}>
        Members: {classroom.members?.length || 0}
      </p>
      <p className={styles.info}>
        Tests: {classroom.tests?.length || 0}
      </p>
      <p className={styles.info}>
        Created: {new Date(classroom.created_at).toLocaleDateString()}
      </p>
      <div className={styles.actions}>
        <button onClick={onView} className={styles.viewBtn}>
          View Details
        </button>
        <button onClick={onManageTests} className={styles.manageBtn}>
          Manage Tests
        </button>
        <button onClick={onViewResults} className={styles.resultsBtn}>
          View Results
        </button>
      </div>
    </div>
  );
}

export default ClassroomCard;
