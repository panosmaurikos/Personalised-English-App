import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/StudentClassrooms.module.css";

function StudentClassrooms() {
  const [classrooms, setClassrooms] = useState([]);
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/student/classrooms`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setClassrooms(data || []);
      }
    } catch (err) {
      console.error("Error fetching classrooms:", err);
    }
  };

  const handleJoinClassroom = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!inviteCode.trim() || inviteCode.length !== 10) {
      setError("Please enter a valid 10-character invite code");
      return;
    }

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/classrooms/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ invite_code: inviteCode }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setSuccess(`✓ Successfully joined: ${data.name}`);
        setInviteCode("");
        setShowJoinForm(false);
        fetchClassrooms();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Invalid invite code. Please check and try again.");
      }
    } catch (err) {
      setError("Error joining classroom");
      console.error(err);
    }
  };

  const fetchClassroomDetails = async (classroomId) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/student/classrooms/${classroomId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setSelectedClassroom(data);
        setIsViewOpen(true);
      }
    } catch (err) {
      console.error("Error fetching classroom details:", err);
    }
  };

  const handleTakeTest = (test) => {
    // Navigate to the classroom test page
    navigate(`/classroom-test/${test.id}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.icon}>🏫</span>
          My Classrooms
        </h3>
        <button
          className={styles.joinBtn}
          onClick={() => {
            setShowJoinForm(!showJoinForm);
            setError("");
            setSuccess("");
          }}
        >
          {showJoinForm ? "Cancel" : "+ Join Classroom"}
        </button>
      </div>

      {success && <div className={styles.success}>{success}</div>}

      {/* Join classroom form - collapsible */}
      {showJoinForm && (
        <div className={styles.joinSection}>
          <div className={styles.joinFormWrapper}>
            <label className={styles.label}>Enter Invite Code</label>
            <form onSubmit={handleJoinClassroom} className={styles.joinForm}>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="ABC123XYZ0"
                maxLength={10}
                className={styles.codeInput}
                autoFocus
              />
              <button type="submit" className={styles.submitBtn}>
                Join
              </button>
            </form>
            {error && <div className={styles.error}>{error}</div>}
            <p className={styles.hint}>
              💡 Ask your teacher for the classroom invite code
            </p>
          </div>
        </div>
      )}

      {/* List of joined classrooms */}
      {classrooms.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📚</div>
          <h4>No Classrooms Yet</h4>
          <p>Join your first classroom using an invite code from your teacher!</p>
          {!showJoinForm && (
            <button
              className={styles.emptyJoinBtn}
              onClick={() => setShowJoinForm(true)}
            >
              Join a Classroom
            </button>
          )}
        </div>
      ) : (
        <div className={styles.classroomsGrid}>
          {classrooms.map((classroom) => (
            <div
              key={classroom.id}
              className={styles.classroomCard}
              onClick={() => fetchClassroomDetails(classroom.id)}
            >
              <div className={styles.cardHeader}>
                <h5 className={styles.classroomName}>{classroom.name}</h5>
                <span className={styles.badge}>
                  {classroom.tests?.length || 0} tests
                </span>
              </div>
              <p className={styles.classroomDesc}>
                {classroom.description || "No description available"}
              </p>
              <div className={styles.cardFooter}>
                <span className={styles.footerItem}>
                  👥 {classroom.members?.length || 0} members
                </span>
                <span className={styles.viewLink}>View Details →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Classroom details modal */}
      {isViewOpen && selectedClassroom && (
        <div className={styles.modalOverlay} onClick={() => setIsViewOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{selectedClassroom.name}</h3>
              <button
                onClick={() => setIsViewOpen(false)}
                className={styles.closeIcon}
              >
                ✕
              </button>
            </div>

            {selectedClassroom.description && (
              <p className={styles.modalDesc}>{selectedClassroom.description}</p>
            )}

            <div className={styles.modalSection}>
              <h4 className={styles.modalSectionTitle}>
                📝 Assigned Tests ({selectedClassroom.tests?.length || 0})
              </h4>
              {selectedClassroom.tests && selectedClassroom.tests.length > 0 ? (
                <div className={styles.testsList}>
                  {selectedClassroom.tests.map((test) => (
                    <div key={test.id} className={styles.testItem}>
                      <div className={styles.testInfo}>
                        <span className={styles.testName}>{test.title}</span>
                        <span className={styles.testType}>{test.type}</span>
                      </div>
                      <button
                        className={styles.takeTestBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTakeTest(test);
                        }}
                      >
                        Take Test →
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyTests}>
                  <p>No tests assigned yet. Check back later!</p>
                </div>
              )}
            </div>

            <button onClick={() => setIsViewOpen(false)} className={styles.closeBtn}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentClassrooms;
