import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../css/Tests.module.css";

function ClassroomTest() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startTimes, setStartTimes] = useState({});
  const [endTimes, setEndTimes] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestQuestions();
  }, [testId]);


  // Record start time when question changes
  useEffect(() => {
    if (questions.length > 0 && questions[currentStep]) {
      const questionId = questions[currentStep].id;
      if (!startTimes[questionId]) {
        setStartTimes(prev => ({
          ...prev,
          [questionId]: Date.now()
        }));
      }
    }
  }, [currentStep, questions]);

  const fetchTestQuestions = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/tests/${testId}/questions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
        setLoading(false);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to load test");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching test questions:", err);
      setError("Failed to load test questions");
      setLoading(false);
    }
  };

  const handleOption = (optionLetter) => {
    const currentQuestion = questions[currentStep];
    const currentEndTime = Date.now();

    // Update all state immediately
    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: optionLetter
    };

    const updatedEndTimes = {
      ...endTimes,
      [currentQuestion.id]: currentEndTime
    };

    setEndTimes(updatedEndTimes);
    setAnswers(updatedAnswers);

    // Move to next question after a short delay
    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Submit test with updated values
        submitTestWithAnswers(updatedAnswers, updatedEndTimes);
      }
    }, 300);
  };

  const submitTestWithAnswers = async (finalAnswers, finalEndTimes) => {
    const answersPayload = questions.map((q) => {
      const startTime = startTimes[q.id];
      const endTime = finalEndTimes[q.id];
      const responseTime = (startTime && endTime) ? (endTime - startTime) / 1000 : 0;
      const selectedAnswer = finalAnswers[q.id] || '';
      const isCorrect = selectedAnswer === q.correct_answer;

      console.log(`Question ${q.id}: selected=${selectedAnswer}, correct=${q.correct_answer}, isCorrect=${isCorrect}, responseTime=${responseTime}s`);

      return {
        question_id: q.id,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
        response_time: responseTime
      };
    });

    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/tests/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            test_id: parseInt(testId),
            answers: answersPayload
          }),
        }
      );

      if (res.ok) {
        setShowResult(true);
        setError("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit test");
      }
    } catch (err) {
      setError("Error submitting test");
      console.error(err);
    }
  };

  const playTTS = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

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

  const getScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) {
        correct++;
      }
    });
    return correct;
  };

  if (loading) {
    return (
      <div className={styles["test-container"]}>
        <div className={styles["test-card"]}>
          <h2 className={styles["test-title"]}>Loading Test...</h2>
        </div>
      </div>
    );
  }

  if (error && !showResult) {
    return (
      <div className={styles["test-container"]}>
        <div className={styles["test-card"]}>
          <h2 className={styles["test-title"]}>Error</h2>
          <div className="alert alert-danger">{error}</div>
          <button
            className={styles["test-retry-btn"]}
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["test-container"]}>
      <button
        className={styles["test-retry-btn"]}
        style={{ background: "#6c757d", marginBottom: "1rem" }}
        onClick={() => navigate(-1)}
      >
        Back
      </button>
      <div className={styles["test-card"]}>
        <h2 className={styles["test-title"]}>Classroom Test</h2>
        <p className={styles["test-desc"]}>
          Answer all questions to complete the test. Good luck!
        </p>
        {error && <div className="alert alert-danger">{error}</div>}
        {!showResult ? (
          questions.length > 0 && questions[currentStep] ? (
            <div>
              <div className={styles["test-question-block"]}>
                <div className={styles["test-header-row"]}>
                  <span
                    className={`${styles["test-badge"]} ${styles["test-question-badge"]}`}
                  >
                    Question {currentStep + 1} of {questions.length}
                  </span>
                  <span
                    className={`badge bg-${typeBadge(questions[currentStep].question_type)} ${
                      styles["test-type-badge"]
                    }`}
                  >
                    {capitalize(questions[currentStep].question_type)}
                  </span>
                </div>
                <h5
                  className={`${styles["test-question"]} ${styles["test-instruction"]}`}
                >
                  {questions[currentStep].question_text}
                </h5>
                {questions[currentStep].question_type === "listening" && (
                  <div className={styles["test-audio-row"]}>
                    <button
                      className={styles["test-audio-btn"]}
                      type="button"
                      onClick={() => playTTS(questions[currentStep].question_text)}
                    >
                      <span className="me-2 test-audio-icon">
                        <i className="bi bi-volume-up-fill"></i>
                      </span>
                      Play Sentence
                    </button>
                  </div>
                )}
                <div className={styles["test-options"]}>
                  {questions[currentStep].options &&
                    Object.entries(questions[currentStep].options).map(([letter, text]) => (
                      <button
                        key={letter}
                        className={`${styles["test-option-btn"]} ${
                          answers[questions[currentStep].id] === letter ? styles["selected"] : ""
                        }`}
                        onClick={() => handleOption(letter)}
                      >
                        <strong>{letter}.</strong> {text}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div>Loading questions...</div>
          )
        ) : (
          <div className={styles["test-result"]}>
            <h3 className={styles["test-level"]}>
              Test Completed!
            </h3>
            <div className={styles["test-score"]}>
              <span>
                Score: {getScore()} / {questions.length}
              </span>
            </div>
            <p className={styles["test-feedback"]}>
              Your test has been submitted successfully. Your teacher will be able to see your results and provide feedback.
            </p>
            <div className="text-center">
              <button
                className={styles["test-retry-btn"]}
                onClick={() => navigate("/dashboard")}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClassroomTest;
