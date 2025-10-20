import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/TeacherDashboard.module.css";
import TestCard from "../components/Test/TestCard";
import TestForm from "../components/Test/TestForm";
import ViewTest from "../components/Test/ViewTest";

function TeacherDashboard() {
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "mixed",
    questions: [],
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [error, setError] = useState("");
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, []);

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
        setTests(data);
      } else {
        setError("Failed to fetch tests");
      }
    } catch (err) {
      setError("Error fetching tests");
      console.error(err);
    }
  };

  const validateForm = () => {
    if (!form.title.trim()) return "Title is required";
    if (form.questions.length === 0) return "At least one question is required";
    for (const q of form.questions) {
      if (!q.question_text?.trim()) return "Question text is required";
      // Always MCQ
      for (const key of ["A", "B", "C", "D"]) {
        if (!q.options?.[key]?.trim()) return "All options (A-D) are required";
      }
      if (!q.correct_answer || !["A", "B", "C", "D"].includes(q.correct_answer))
        return "Valid correct answer required (A-D)";
      if (Number(q.points) < 1) return "Points must be at least 1";
    }
    return null;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      const token = localStorage.getItem("jwt");
      const payload = {
        ...form,
        questions: form.questions.map((q) => ({
          ...q,
          question_type: q.category || q.question_type || "vocabulary", // Fallback to ensure question_type is set
          options: q.options || { A: "", B: "", C: "", D: "" },
        })),
      };
      console.log("Creating test with payload:", payload);
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/teacher/tests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const rawText = await res.text();
      let data = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        // Not JSON, keep as text
        data = rawText;
      }
      if (res.ok) {
        fetchTests();
        setIsCreateOpen(false);
        resetForm();
        setError("");
      } else {
        // Show backend error if available, else show raw text and status
        setError(
          (typeof data === "object" && (data.error || data.message)) ||
            (typeof data === "string" && data) ||
            `Failed to create test (status ${res.status})`
        );
        // Debug: log backend error and raw response
        console.error(
          "Create test error:",
          data,
          "Status:",
          res.status,
          "Raw:",
          rawText
        );
      }
    } catch (err) {
      setError("Error creating test");
      console.error(err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      const token = localStorage.getItem("jwt");
      const payload = {
        ...form,
        questions: form.questions.map((q) => ({
          ...q,
          question_type: q.category || q.question_type || "vocabulary",
        })),
      };
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/teacher/tests/${selectedTest.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res) {
        setError("No response from server. Is the backend running?");
        return;
      }
      if (res.ok) {
        fetchTests();
        setIsEditOpen(false);
        setSelectedTest(null);
        resetForm();
        setError("");
      } else {
        const rawText = await res.text();
        setError(rawText || "Failed to update test");
      }
    } catch (err) {
      setError("Network error: Could not reach the backend (PUT).");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this test?")) {
      try {
        const token = localStorage.getItem("jwt");
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/teacher/tests/${id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          fetchTests();
        } else {
          setError("Failed to delete test");
        }
      } catch (err) {
        setError("Error deleting test");
        console.error(err);
      }
    }
  };

  const openEdit = async (test) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/teacher/tests/${test.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const fullTest = await res.json();
        // Fallback for questions
        const questions = Array.isArray(fullTest.questions)
          ? fullTest.questions
          : [];
        setForm({
          title: fullTest.title,
          description: fullTest.description || "",
          type: fullTest.type,
          questions: questions.map((q) => ({
            question_text: q.question_text,
            // always MCQ, keep options
            question_type: q.question_type,
            options: q.options || { A: "", B: "", C: "", D: "" },
            correct_answer: q.correct_answer || "",
            points: q.points ?? 1,
            category: q.question_type, // Align category with question_type
          })),
        });
        setSelectedTest(fullTest);
        setIsEditOpen(true);
        setError("");
      }
    } catch (err) {
      setError("Error loading test for edit");
      console.error(err);
    }
  };

  const openView = async (test) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/teacher/tests/${test.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const fullTest = await res.json();
        setSelectedTest(fullTest);
        setIsViewOpen(true);
      }
    } catch (err) {
      setError("Error fetching test details");
      console.error(err);
    }
  };

  const openResults = async (test) => {
    setSelectedTest(test);
    setIsResultsOpen(true);

    // Fetch which classrooms have this test assigned
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/teacher/classrooms`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const allClassrooms = await res.json();
        // Filter classrooms that have this test
        const classroomsWithTest = allClassrooms.filter(c =>
          c.tests && c.tests.some(t => t.id === test.id)
        );

        // For each classroom, get results
        const resultsPromises = classroomsWithTest.map(async (classroom) => {
          const resultsRes = await fetch(
            `${process.env.REACT_APP_API_URL}/teacher/classrooms/${classroom.id}/results/${test.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (resultsRes.ok) {
            const results = await resultsRes.json();
            return { classroom, results };
          }
          return { classroom, results: [] };
        });

        const allResults = await Promise.all(resultsPromises);
        setTestResults(allResults);
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setTestResults([]);
    }
  };

  const resetForm = () => {
    setForm({ title: "", description: "", type: "mixed", questions: [] });
  };

  const filteredTests = tests.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" ? true : t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className={styles.dashboard}>
  <div className={styles.topBar}>
        <button
          className={`${styles.createBtn} ${styles.backBtn}`}
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        <button
          className={`${styles.createBtn} ${styles.classroomsBtn}`}
          onClick={() => navigate("/teacher-classrooms")}
        >
          Manage Classrooms
        </button>
      </div>
      <h2 className={styles.title}>Teacher Dashboard - Tests</h2>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All types</option>
          <option value="vocabulary">Vocabulary</option>
          <option value="grammar">Grammar</option>
          <option value="reading">Reading</option>
          <option value="listening">Listening</option>
          <option value="mixed">Mixed</option>
        </select>
        <button
          className={styles.createBtn}
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
        >
          Create New Test
        </button>
      </div>

      <div className={styles.testGrid}>
        {filteredTests.length === 0 && (
          <div className={styles.emptyState}>
            No tests found. Try adjusting filters or create a new test.
          </div>
        )}
        {filteredTests.map((test) => (
          <TestCard
            key={test.id}
            test={test}
            onView={() => openView(test)}
            onEdit={() => openEdit(test)}
            onDelete={() => handleDelete(test.id)}
            onResults={() => openResults(test)}
          />
        ))}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <TestForm
              title="Create Test"
              form={form}
              setForm={setForm}
              onSubmit={handleCreate}
              onClose={() => setIsCreateOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <TestForm
              title="Edit Test"
              form={form}
              setForm={setForm}
              onSubmit={handleUpdate}
              onClose={() => setIsEditOpen(false)}
            />
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewOpen && selectedTest && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <ViewTest
              test={selectedTest}
              onClose={() => setIsViewOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Results & Stats Modal */}
      {isResultsOpen && selectedTest && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>
              Results & Stats — {selectedTest.title}
            </h3>

            {testResults === null ? (
              <div className={styles.placeholder}>Loading results...</div>
            ) : testResults.length === 0 ? (
              <div className={styles.placeholder}>
                This test is not assigned to any classroom yet.
                <br />
                <small>Go to "Manage Classrooms" to assign this test.</small>
              </div>
            ) : (
              <>
                {testResults.map(({ classroom, results }) => {
                  const allScores = results.map(r => r.score);
                  const avgScore = allScores.length > 0
                    ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(2)
                    : '—';
                  const totalStudents = classroom.members?.length || 0;
                  const completedStudents = results.length;

                  return (
                    <div key={classroom.id} className={styles.classroomResultsBlock}>
                      <h4 className={styles.sectionTitle}>
                        {classroom.name} ({completedStudents}/{totalStudents} completed)
                      </h4>

                      <div className={`${styles.statsGrid} ${styles.statsGridMargin}`}> 
                        <div className={styles.statCard}>
                          Average score: {avgScore}%
                        </div>
                        <div className={styles.statCard}>
                          Completed: {completedStudents}/{totalStudents}
                        </div>
                      </div>

                      {results.length > 0 ? (
                        <div className={styles.resultsPanel}>
                          <table className={styles.resultsTable}>
                            <thead className={styles.resultsTableHead}>
                              <tr className={styles.resultsTableRowHead}>
                                <th className={styles.resultsTableCellLeft}>Student</th>
                                <th className={styles.resultsTableCell}>Score</th>
                                <th className={styles.resultsTableCell}>Correct/Total</th>
                                <th className={styles.resultsTableCell}>Avg Time</th>
                                <th className={styles.resultsTableCell}>Completed At</th>
                              </tr>
                            </thead>
                            <tbody>
                              {results.map((result, idx) => (
                                <tr key={idx} className={styles.resultsTableRow}>
                                  <td className={styles.resultsTableCellLeft}>{result.email}</td>
                                  <td className={styles.resultsTableCell}>{result.score.toFixed(2)}%</td>
                                  <td className={styles.resultsTableCell}>{result.correct_answers}/{result.total_questions}</td>
                                  <td className={styles.resultsTableCell}>{result.avg_time?.toFixed(2) || '—'}s</td>
                                  <td className={styles.resultsTableCell}>{new Date(result.completed_at).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className={styles.placeholder}>
                          No students have completed this test yet.
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            <button
              onClick={() => {
                setIsResultsOpen(false);
                setTestResults(null);
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

export default TeacherDashboard;
