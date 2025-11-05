import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTestLogic from "../hooks/useTestLogic";
import styles from "../css/Tests.module.css";

function Tests() {
  const {
    step,
    showResult,
    QUESTIONS,
    playTTS,
    handleOption,
    getScore,
    getAvgTime,
    restartTest,
    answers,
    getCorrectOptionValue,
    responseTimes,
  } = useTestLogic();
  const [fuzzyLevel, setFuzzyLevel] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (showResult) {
      const token = localStorage.getItem("jwt");
      if (!token) {
        setError("Please log in to submit the test.");
        return;
      }
      const answersPayload = QUESTIONS.map((q, i) => ({
        question_id: q.id,
        selected_option: answers[i] || "",
        correct_option: getCorrectOptionValue(q),
        response_time: responseTimes[i] || 0,
      }));
      const payload = {
        score: (getScore() / QUESTIONS.length) * 100,
        avg_time: getAvgTime(),
        answers: answersPayload,
        test_type: "regular"
      };
      fetch(`${process.env.REACT_APP_API_URL}/complete-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            if (!res.ok) {
              throw new Error(data.error || "Unknown error");
            }
            return data;
          } catch (e) {
            throw new Error(text || "Failed to parse response");
          }
        })
        .then((data) => {
          setFuzzyLevel(data.level);
          setError("");
        })
        .catch((err) => {
          setError(err.message);
        });
    }
  }, [
    showResult,
    QUESTIONS,
    answers,
    getScore,
    getAvgTime,
    getCorrectOptionValue,
    responseTimes,
  ]);

  const typeBadge = (type) => {
    switch (type) {
      case "vocabulary":
        return "success";
      case "grammar":
        return "primary";
      case "reading":
        return "warning";
      case "listening":
        return "info";
      default:
        return "secondary";
    }
  };

  const capitalize = (str) =>
    str && typeof str === "string"
      ? str.charAt(0).toUpperCase() + str.slice(1)
      : "";

  return (
    <div className={styles["test-container"]}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
        <button
          className={styles["test-retry-btn"]}
          style={{ background: "#6c757d" }}
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <button
          className={styles["test-retry-btn"]}
          style={{ background: "#17a2b8" }}
          onClick={() => window.location.reload()}
        >
          🔄 Restart Test
        </button>
      </div>
      <div className={styles["test-card"]}>
        <h2 className={styles["test-title"]}>Quick English Level Test</h2>
        <p className={styles["test-desc"]}>
          Answer a few questions to discover your English level and get
          personalized recommendations!
        </p>
        {error && <div className="alert alert-danger">{error}</div>}
        {!showResult ? (
          QUESTIONS.length > 0 && QUESTIONS[step] ? (
            <div>
              <div className={styles["test-question-block"]}>
                <div className={styles["test-header-row"]}>
                  <span
                    className={`${styles["test-badge"]} ${styles["test-question-badge"]}`}
                  >
                    Question {step + 1} of {QUESTIONS.length}
                  </span>
                  <span
                    className={`badge bg-${typeBadge(QUESTIONS[step].type)} ${
                      styles["test-type-badge"]
                    }`}
                  >
                    {capitalize(QUESTIONS[step].type)}
                  </span>
                </div>
                <h5
                  className={`${styles["test-question"]} ${styles["test-instruction"]}`}
                >
                  {QUESTIONS[step].instruction || "Choose the correct answer"}
                </h5>
                {QUESTIONS[step].question && (
                  <div className={styles["test-question-detail"]}>
                    {QUESTIONS[step].question}
                  </div>
                )}
                {QUESTIONS[step].category === "listening" && (
                  <div className={styles["test-audio-row"]}>
                    <button
                      className={styles["test-audio-btn"]}
                      type="button"
                      onClick={() =>
                        playTTS(
                          QUESTIONS[step].tts &&
                            typeof QUESTIONS[step].tts === "string"
                            ? QUESTIONS[step].tts
                            : QUESTIONS[step].question || ""
                        )
                      }
                    >
                      <span className="me-2 test-audio-icon">
                        <i className="bi bi-volume-up-fill"></i>
                      </span>
                      Play Sentence
                    </button>
                  </div>
                )}
                <div className={styles["test-options"]}>
                  {QUESTIONS[step].options && Array.isArray(QUESTIONS[step].options) ? (
                    QUESTIONS[step].options.map((option) => (
                      <button
                        key={option}
                        className={styles["test-option-btn"]}
                        onClick={() => handleOption(option)}
                      >
                        {option}
                      </button>
                    ))
                  ) : (
                    <div>Error loading options for this question</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>Loading questions...</div>
          )
        ) : (
          <div className={styles["test-result"]}>
            <h3 className={styles["test-level"]}>
              Your Level: {fuzzyLevel || "Calculating..."}
            </h3>
            <div className={styles["test-score"]}>
              <span>
                Score: {getScore()} / {QUESTIONS.length}
              </span>
            </div>
            <p className={styles["test-feedback"]}>
              {getScore() >= 10 &&
                "Excellent! You have a strong command of English."}
              {getScore() >= 7 &&
                getScore() < 10 &&
                "Great job! You have a good understanding of English."}
              {getScore() >= 4 &&
                getScore() < 7 &&
                "Not bad! You have a basic understanding of English."}
              {getScore() < 4 &&
                "Keep trying! You might benefit from some review."}
            </p>
            <div className="text-center">
              <button
                className={styles["test-retry-btn"]}
                onClick={restartTest}
              >
                Retake Test
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tests;
