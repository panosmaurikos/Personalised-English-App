import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/Recommended.module.css";

function Recommended() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("jwt");
    fetch(`${process.env.REACT_APP_API_URL}/recommended-questions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch recommended questions");
        return res.json();
      })
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Unknown error");
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img
          src="https://img.icons8.com/color/36/idea.png"
          className={styles.headerIcon}
          alt="idea"
        />
        <h2>Practice: Personalized Test</h2>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : questions.length === 0 ? (
        <div>No recommendations found!</div>
      ) : (
        <div>
          <ul className={styles.list}>
            {questions.map((q, idx) => (
              <li key={q.id} className={styles.questionBlock}>
                <div className={styles.qTitle}>
                  <span>
                    Q{idx + 1} ({q.category}, diff: {q.difficulty})
                  </span>
                </div>
                <div>{q.question}</div>
                <ul>
                  {q.options.map((opt, i) => (
                    <li key={i}>
                      {String.fromCharCode(65 + i)}. {opt}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <button
            className={styles.startBtn}
            onClick={() => navigate("/recommended-test")}
          >
            Start Practicing
          </button>
        </div>
      )}
    </div>
  );
}
export default Recommended;
