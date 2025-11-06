import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/Recommended.module.css";

function Recommended() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPersonalizedPopup, setShowPersonalizedPopup] = useState(false);
  const [hasEnoughData, setHasEnoughData] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("jwt");
    fetch(`${process.env.REACT_APP_API_URL}/personalized-practice-questions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch personalized questions");
        return res.json();
      })
      .then((data) => {
        if (data.questions && Array.isArray(data.questions)) {
          setQuestions(data.questions);
          setHasEnoughData(data.hasEnoughData || false);

          // Show popup if user has enough data (3+ tests)
          if (data.hasEnoughData) {
            setShowPersonalizedPopup(true);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Unknown error");
        setLoading(false);
      });
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("jwt");
    fetch(`${process.env.REACT_APP_API_URL}/personalized-practice-questions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch personalized questions");
        return res.json();
      })
      .then((data) => {
        if (data.questions && Array.isArray(data.questions)) {
          setQuestions(data.questions);
          setHasEnoughData(data.hasEnoughData || false);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Unknown error");
        setLoading(false);
      });
  };

  return (
    <div className={styles.container}>
      {/* Personalized Popup */}
      {showPersonalizedPopup && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}>
          <div style={{
            background: "white",
            padding: "40px",
            borderRadius: "15px",
            maxWidth: "500px",
            textAlign: "center",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
          }}>
            <div style={{ fontSize: "60px", marginBottom: "20px" }}>🎯</div>
            <h2 style={{ color: "#2563eb", marginBottom: "15px" }}>
              Personalized Practice!
            </h2>
            <p style={{ fontSize: "18px", color: "#555", lineHeight: "1.6" }}>
              Now the test will be closer to what you are learning! The questions
              are adapted to the way you learn best.
            </p>
            <button
              onClick={() => setShowPersonalizedPopup(false)}
              style={{
                marginTop: "25px",
                padding: "12px 30px",
                fontSize: "16px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Let's Get Started! 🚀
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
        <button
          className={styles.startBtn}
          style={{ background: "#6c757d" }}
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <button
          className={styles.startBtn}
          style={{ background: "#17a2b8" }}
          onClick={handleRefresh}
        >
          🔄 Refresh
        </button>
      </div>
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
                    Q{idx + 1} ({q.category}, type: {q.type})
                  </span>
                  {q.usedAlternative && (
                    <span style={{
                      marginLeft: '10px',
                      color: '#667eea',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}>
                      ✨ Personalized
                    </span>
                  )}
                </div>
                <div>{q.question}</div>
                <ul>
                  {q.options && q.options.map((opt, i) => (
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
