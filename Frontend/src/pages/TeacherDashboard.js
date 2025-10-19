import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/TeacherDashboard.module.css";
import TestCard from "../components/Test/TestCard";
import TestForm from "../components/Test/TestForm";
import ViewTest from "../components/Test/ViewTest";

function TeacherDashboard() {
  const [tests, setTests] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "mixed",
    questions: [],
  });
  const [classroomForm, setClassroomForm] = useState({
    name: "",
    description: "",
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCreateClassroomOpen, setIsCreateClassroomOpen] = useState(false);
  const [isAssignTestOpen, setIsAssignTestOpen] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [classroomResults, setClassroomResults] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
    fetchClassrooms();
  }, []);

  const fetchTests = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/teacher/tests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const fetchClassrooms = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/teacher/classrooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClassrooms(data);
      } else {
        setError("Failed to fetch classrooms");
      }
    } catch (err) {
      setError("Error fetching classrooms");
      console.error(err);
    }
  };

  const validateForm = () => {
    if (!form.title.trim()) return "Title is required";
    if (form.questions.length === 0) return "At least one question is required";
    for (const q of form.questions) {
      if (!q.question_text?.trim()) return "Question text is required";
      for (const key of ["A", "B", "C", "D"]) {
        if (!q.options?.[key]?.trim()) return "All options (A-D) are required";
      }
      if (!q.correct_answer || !["A", "B", "C", "D"].includes(q.correct_answer))
        return "Valid correct answer required (A-D)";
      if (Number(q.points) < 1) return "Points must be at least 1";
    }
    return null;
  };

  const validateClassroomForm = () => {
    if (!classroomForm.name.trim()) return "Classroom name is required";
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
          question_type: q.category || q.question_type || "vocabulary",
          options: q.options || { A: "", B: "", C: "", D: "" },
        })),
      };
      const res = await fetch(`${process.env.REACT_APP_API_URL}/teacher/tests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const rawText = await res.text();
      let data = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        data = rawText;
      }
      if (res.ok) {
        fetchTests();
        setIsCreateOpen(false);
        resetForm();
        setError("");
      } else {
        setError(
          (typeof data === "object" && (data.error || data.message)) ||
            (typeof data === "string" && data) ||
            `Failed to create test (status ${res.status})`
        );
        console.error("Create test error:", data, "Status:", res.status, "Raw:", rawText);
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
      const res = await fetch(`${process.env.REACT_APP_API_URL}/teacher/tests/${selectedTest.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
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
        const res = await fetch(`${process.env.REACT_APP_API_URL}/teacher/tests/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
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

  const handleCreateClassroom = async (e) => {
    e.preventDefault();
    const validationError = validateClassroomForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/teacher/classrooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(classroomForm),
      });
      if (res.ok) {
        fetchClassrooms();
        setIsCreateClassroomOpen(false);
        setClassroomForm({ name: "", description: "" });
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

  const handleAssignTest = async (classroomID, testID) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/teacher/classrooms/${classroomID}/tests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ test_id: testID }),
      });
      if (res.ok) {
        fetchClassrooms();
        setIsAssignTestOpen(false);
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

  const openEdit = async (test) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/teacher/tests/${test.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const fullTest = await res.json();
        const questions = Array.isArray(fullTest.questions) ? fullTest.questions : [];
        setForm({
          title: fullTest.title,
          description: fullTest.description || "",
          type: fullTest.type,
          questions: questions.map((q) => ({
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options || { A: "", B: "", C: "", D: "" },
            correct_answer: q.correct_answer || "",
            points: q.points ?? 1,
            category: q.question_type,
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
      const res = await fetch(`${process.env.REACT_APP_API_URL}/teacher/tests/${test.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const openResults = async (classroom, test) => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/teacher/classrooms/${classroom.id}/results/${test.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClassroomResults(data);
        setSelectedClassroom(classroom);
        setSelectedTest(test);
        setIsResultsOpen(true);
      } else {
        setError("Failed to fetch results");
      }
    } catch (err) {
      setError("Error fetching results");
      console.error(err);
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
      <button
        className={styles.createBtn}
        style={{ background: "#6c757d", marginBottom: "1rem" }}
        onClick={() => navigate(-1)}
      >
        Back
      </button>
      <h2 className={styles.title}>Teacher Dashboard</h2>
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
        <button
          className={styles.createBtn}
          onClick={() => {
            setClassroomForm({ name: "", description: "" });
            setIsCreateClassroomOpen(true);
          }}
        >
          Create Classroom
        </button>
      </div>
      <h3>Classrooms</h3>
      <div className={styles.testGrid}>
        {classrooms.length === 0 && (
          <div className={styles.emptyState}>
            No classrooms found. Create a new classroom to get started.
          </div>
        )}
        {classrooms.map((classroom) => (
          <div key={classroom.id} className={styles.classroomCard}>
            <h4>{classroom.name}</h4>
            <p>{classroom.description || "No description"}</p>
            <p><strong>Invite Code:</strong> {classroom.invite_code}</p>
            <p><strong>Members:</strong> {classroom.members?.length || 0}</p>
            <p><strong>Tests:</strong> {classroom.tests?.length || 0}</p>
            <button
              onClick={() => {
                setSelectedClassroom(classroom);
                setIsAssignTestOpen(true);
              }}
              className={styles.actionBtn}
            >
              Assign Test
            </button>
            {classroom.tests?.map((test) => (
              <div key={test.id} className={styles.testItem}>
                <span>{test.title}</span>
                <button
                  onClick={() => openResults(classroom, test)}
                  className={styles.actionBtn}
                >
                  View Results
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
      <h3>Tests</h3>
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
            onResults={() => openResults(null, test)}
          />
        ))}
      </div>
      {/* Create Test Modal */}
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
      {/* Edit Test Modal */}
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
      {/* View Test Modal */}
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
      {/* Create Classroom Modal */}
      {isCreateClassroomOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Create Classroom</h3>
            <form onSubmit={handleCreateClassroom}>
              <div className={styles.formGroup}>
                <label>Name</label>
                <input
                  type="text"
                  value={classroomForm.name}
                  onChange={(e) => setClassroomForm({ ...classroomForm, name: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={classroomForm.description}
                  onChange={(e) => setClassroomForm({ ...classroomForm, description: e.target.value })}
                />
              </div>
              <button type="submit" className={styles.submitBtn}>Create</button>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsCreateClassroomOpen(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Assign Test Modal */}
      {isAssignTestOpen && selectedClassroom && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Assign Test to {selectedClassroom.name}</h3>
            <div className={styles.testGrid}>
              {tests.map((test) => (
                <div key={test.id} className={styles.testItem}>
                  <span>{test.title}</span>
                  <button
                    onClick={() => handleAssignTest(selectedClassroom.id, test.id)}
                    className={styles.actionBtn}
                  >
                    Assign
                  </button>
                </div>
              ))}
            </div>
            <button
              className={styles.closeBtn}
              onClick={() => setIsAssignTestOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Results Modal */}
      {isResultsOpen && selectedTest && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>
              Results — {selectedTest.title} {selectedClassroom ? `in ${selectedClassroom.name}` : ""}
            </h3>
            <table className={styles.resultsTable}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Score</th>
                  <th>Level</th>
                  <th>Avg Time</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {classroomResults.map((result) => (
                  <tr key={result.user_id}>
                    <td>{result.email}</td>
                    <td>{result.score.toFixed(2)}%</td>
                    <td>{result.level}</td>
                    <td>{result.avg_time.toFixed(2)}s</td>
                    <td>
                      {new Date(result.completed_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={() => setIsResultsOpen(false)}
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