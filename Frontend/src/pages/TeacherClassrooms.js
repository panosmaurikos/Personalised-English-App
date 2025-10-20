import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/TeacherClassrooms.module.css";
import ClassroomCard from "../components/Classroom/ClassroomCard";
import ClassroomForm from "../components/Classroom/ClassroomForm";

function TeacherClassrooms() {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isManageTestsOpen, setIsManageTestsOpen] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [availableTests, setAvailableTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [classroomResults, setClassroomResults] = useState([]);
  const [selectedTestForResults, setSelectedTestForResults] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [isStudentDetailsOpen, setIsStudentDetailsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClassrooms();
    fetchTests();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/teacher/classrooms`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setClassrooms(data || []);
      } else {
        setError("Failed to fetch classrooms");
      }
    } catch (err) {
      setError("Error fetching classrooms");
      console.error(err);
    }
  };

  const fetchTests = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/teacher/tests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setAvailableTests(data || []);
      }
    } catch (err) {
      console.error("Error fetching tests:", err);
    }
  };

  const fetchClassroomDetails = async (classroomId) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/teacher/classrooms/${classroomId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setSelectedClassroom(data);
      }
    } catch (err) {
      console.error("Error fetching classroom details:", err);
    }
  };

  const handleCreate = async (formData) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/teacher/classrooms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      if (res.ok) {
        fetchClassrooms();
        setIsCreateOpen(false);
        setError("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create classroom");
      }
    } catch (err) {
      setError("Error creating classroom");
      console.error(err);
    }
  };

  const openView = async (classroom) => {
    await fetchClassroomDetails(classroom.id);
    setIsViewOpen(true);
  };

  const openManageTests = async (classroom) => {
    await fetchClassroomDetails(classroom.id);
    setIsManageTestsOpen(true);
  };

  const openResults = async (classroom) => {
    await fetchClassroomDetails(classroom.id);
    setIsResultsOpen(true);
  };

  const handleAssignTest = async () => {
    if (!selectedTestId) {
      setError("Please select a test");
      return;
    }
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/teacher/classrooms/${selectedClassroom.id}/assign-test`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ test_id: parseInt(selectedTestId) }),
        }
      );
      if (res.ok) {
        await fetchClassroomDetails(selectedClassroom.id);
        setSelectedTestId("");
        setError("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to assign test");
      }
    } catch (err) {
      setError("Error assigning test");
      console.error(err);
    }
  };

  const fetchTestResults = async (testId) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/teacher/classrooms/${selectedClassroom.id}/results/${testId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setClassroomResults(data || []);
        setSelectedTestForResults(
          selectedClassroom.tests.find((t) => t.id === testId)
        );
      }
    } catch (err) {
      console.error("Error fetching results:", err);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to remove this student?")) {
      return;
    }
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/teacher/classrooms/${selectedClassroom.id}/members/${studentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        await fetchClassroomDetails(selectedClassroom.id);
        setError("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to remove student");
      }
    } catch (err) {
      setError("Error removing student");
      console.error(err);
    }
  };

  const handleRemoveTest = async (testId) => {
    if (!window.confirm("Are you sure you want to remove this test?")) {
      return;
    }
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/teacher/classrooms/${selectedClassroom.id}/tests/${testId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        await fetchClassroomDetails(selectedClassroom.id);
        setError("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to remove test");
      }
    } catch (err) {
      setError("Error removing test");
      console.error(err);
    }
  };

  const fetchStudentTestDetails = async (studentId, testId) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/teacher/students/${studentId}/tests/${testId}/details`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setStudentDetails(data);
        setIsStudentDetailsOpen(true);
      }
    } catch (err) {
      console.error("Error fetching student details:", err);
    }
  };

  const filteredClassrooms = classrooms.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.dashboard}>
      <button
        className={styles.backBtn}
        onClick={() => navigate("/teacher-dashboard")}
      >
        Back to Dashboard
      </button>

      <h2 className={styles.title}>My Classrooms</h2>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search by classroom name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className={styles.createBtn}
          onClick={() => {
            setIsCreateOpen(true);
            setError("");
          }}
        >
          Create New Classroom
        </button>
      </div>

      <div className={styles.classroomGrid}>
        {filteredClassrooms.length === 0 && (
          <div className={styles.emptyState}>
            No classrooms found. Create your first classroom to get started!
          </div>
        )}
        {filteredClassrooms.map((classroom) => (
          <ClassroomCard
            key={classroom.id}
            classroom={classroom}
            onView={() => openView(classroom)}
            onManageTests={() => openManageTests(classroom)}
            onViewResults={() => openResults(classroom)}
          />
        ))}
      </div>

      {/* Create Classroom Modal */}
      {isCreateOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <ClassroomForm
              onSubmit={handleCreate}
              onClose={() => setIsCreateOpen(false)}
            />
          </div>
        </div>
      )}

      {/* View Classroom Details Modal */}
      {isViewOpen && selectedClassroom && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>{selectedClassroom.name}</h3>
            <p className={styles.modalDesc}>
              {selectedClassroom.description || "No description"}
            </p>
            <div className={styles.inviteBox}>
              <strong>Invite Code:</strong>{" "}
              <code className={styles.inviteCode}>
                {selectedClassroom.invite_code}
              </code>
            </div>

            <h4 className={styles.sectionTitle}>
              Members ({selectedClassroom.members?.length || 0})
            </h4>
            <div className={styles.membersList}>
              {selectedClassroom.members && selectedClassroom.members.length > 0 ? (
                selectedClassroom.members.map((member) => (
                  <div key={member.id} className={styles.memberItem}>
                    <span>{member.email}</span>
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemoveStudent(member.id)}
                      title="Remove student"
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <p className={styles.emptyState}>No members yet</p>
              )}
            </div>

            <h4 className={styles.sectionTitle}>
              Assigned Tests ({selectedClassroom.tests?.length || 0})
            </h4>
            <div className={styles.testsList}>
              {selectedClassroom.tests && selectedClassroom.tests.length > 0 ? (
                selectedClassroom.tests.map((test) => (
                  <div key={test.id} className={styles.testItem}>
                    <div>
                      <span>{test.title}</span>
                      <span className={styles.testType}>{test.type}</span>
                    </div>
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemoveTest(test.id)}
                      title="Remove test"
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <p className={styles.emptyState}>No tests assigned yet</p>
              )}
            </div>

            <button
              onClick={() => setIsViewOpen(false)}
              className={styles.closeBtn}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Manage Tests Modal */}
      {isManageTestsOpen && selectedClassroom && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>
              Manage Tests - {selectedClassroom.name}
            </h3>

            <h4 className={styles.sectionTitle}>Assign a Test</h4>
            <div className={styles.assignSection}>
              <select
                value={selectedTestId}
                onChange={(e) => setSelectedTestId(e.target.value)}
                className={styles.testSelect}
              >
                <option value="">Select a test...</option>
                {availableTests.map((test) => (
                  <option key={test.id} value={test.id}>
                    {test.title} ({test.type})
                  </option>
                ))}
              </select>
              <button onClick={handleAssignTest} className={styles.assignBtn}>
                Assign Test
              </button>
            </div>

            <h4 className={styles.sectionTitle}>Currently Assigned Tests</h4>
            <div className={styles.testsList}>
              {selectedClassroom.tests && selectedClassroom.tests.length > 0 ? (
                selectedClassroom.tests.map((test) => (
                  <div key={test.id} className={styles.testItem}>
                    <span>{test.title}</span>
                    <span className={styles.testType}>{test.type}</span>
                  </div>
                ))
              ) : (
                <p className={styles.emptyState}>No tests assigned yet</p>
              )}
            </div>

            <button
              onClick={() => setIsManageTestsOpen(false)}
              className={styles.closeBtn}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {isResultsOpen && selectedClassroom && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>
              Classroom Results - {selectedClassroom.name}
            </h3>

            <h4 className={styles.sectionTitle}>Select a Test to View Results</h4>
            <div className={styles.testsList}>
              {selectedClassroom.tests && selectedClassroom.tests.length > 0 ? (
                selectedClassroom.tests.map((test) => (
                  <div
                    key={test.id}
                    className={styles.testItem}
                    style={{ cursor: "pointer" }}
                    onClick={() => fetchTestResults(test.id)}
                  >
                    <span>{test.title}</span>
                    <span className={styles.testType}>{test.type}</span>
                  </div>
                ))
              ) : (
                <p className={styles.emptyState}>No tests assigned yet</p>
              )}
            </div>

            {selectedTestForResults && (
              <>
                <h4 className={styles.sectionTitle}>
                  Results for: {selectedTestForResults.title}
                </h4>
                <div className={styles.resultsTable}>
                  {classroomResults.length > 0 ? (
                    <table>
                      <thead>
                        <tr>
                          <th>Student Email</th>
                          <th>Score</th>
                          <th>Correct/Total</th>
                          <th>Avg Time (s)</th>
                          <th>Completed At</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classroomResults.map((result, idx) => (
                          <tr key={idx}>
                            <td>{result.email}</td>
                            <td>{result.score.toFixed(2)}%</td>
                            <td>{result.correct_answers}/{result.total_questions}</td>
                            <td>{result.avg_time?.toFixed(2) || "N/A"}</td>
                            <td>
                              {new Date(result.completed_at).toLocaleString()}
                            </td>
                            <td>
                              <button
                                className={styles.viewDetailsBtn}
                                onClick={() => fetchStudentTestDetails(result.user_id, selectedTestForResults.id)}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className={styles.emptyState}>
                      No results yet for this test
                    </p>
                  )}
                </div>
              </>
            )}

            <button
              onClick={() => {
                setIsResultsOpen(false);
                setClassroomResults([]);
                setSelectedTestForResults(null);
              }}
              className={styles.closeBtn}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Student Test Details Modal */}
      {isStudentDetailsOpen && studentDetails && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.largeModal}`}>
            <h3 className={styles.modalTitle}>Student Test Details</h3>

            <div className={styles.detailsOverview}>
              <div className={styles.detailsStat}>
                <strong>Score:</strong> {studentDetails.score.toFixed(2)}%
              </div>
              <div className={styles.detailsStat}>
                <strong>Correct Answers:</strong> {studentDetails.correct_answers}/{studentDetails.total_questions}
              </div>
              <div className={styles.detailsStat}>
                <strong>Avg Response Time:</strong> {studentDetails.avg_time?.toFixed(2) || "N/A"}s
              </div>
              <div className={styles.detailsStat}>
                <strong>Completed At:</strong> {new Date(studentDetails.completed_at).toLocaleString()}
              </div>
            </div>

            <h4 className={styles.sectionTitle}>Question-by-Question Breakdown</h4>
            <div className={styles.questionsList}>
              {studentDetails.answers && studentDetails.answers.map((answer, idx) => (
                <div key={idx} className={`${styles.questionCard} ${answer.is_correct ? styles.correct : styles.incorrect}`}>
                  <div className={styles.questionHeader}>
                    <span className={styles.questionNumber}>Question {idx + 1}</span>
                    <span className={answer.is_correct ? styles.correctBadge : styles.incorrectBadge}>
                      {answer.is_correct ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>

                  <div className={styles.questionText}>{answer.question_text}</div>

                  <div className={styles.optionsContainer}>
                    {answer.options && typeof answer.options === 'object' && Object.entries(answer.options).map(([optionLetter, optionText]) => {
                      const isCorrect = optionLetter === answer.correct_answer;
                      const isSelected = optionLetter === answer.selected_answer;

                      return (
                        <div
                          key={optionLetter}
                          className={`${styles.option}
                            ${isCorrect ? styles.correctOption : ''}
                            ${isSelected && !isCorrect ? styles.incorrectOption : ''}
                            ${isSelected ? styles.selectedOption : ''}`}
                        >
                          <strong>{optionLetter}.</strong> {optionText}
                          {isCorrect && <span className={styles.correctMark}> ✓ (Correct Answer)</span>}
                          {isSelected && !isCorrect && <span className={styles.incorrectMark}> ✗ (Student's Answer)</span>}
                          {isSelected && isCorrect && <span className={styles.selectedMark}> (Student's Answer)</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div className={styles.questionMeta}>
                    <span>Points: {answer.points}</span>
                    <span>Response Time: {answer.response_time?.toFixed(2) || "N/A"}s</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setIsStudentDetailsOpen(false);
                setStudentDetails(null);
              }}
              className={styles.closeBtn}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherClassrooms;
