import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/Recommended.module.css";

function RecommendedTest() {
  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    fetch(`${process.env.REACT_APP_API_URL}/recommended-questions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setQuestions(data))
      .catch(() => setQuestions([]));
  }, []);
useEffect(() => {
  if (showResult && questions.length > 0 && answers.length === questions.length) {
    // Υπολόγισε σωστές/λάθος, φτιάξε payload
    const token = localStorage.getItem("jwt");
    // Φτιάξε array με σωστά correct_option για κάθε ερώτηση!
    const answersPayload = questions.map((q, i) => ({
      question_id: q.id,
      selected_option: answers[i] || "",
      correct_option: getCorrectOptionString(q),
    }));
    const payload = {
      score: (score / questions.length) * 100,
      avg_time: 0, // ή υπολόγισε μέσο χρόνο αν θέλεις
      answers: answersPayload,
    };
    fetch(`${process.env.REACT_APP_API_URL}/complete-test`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }).then(() => {
      // Optional: reload dashboard, show message, κλπ
    });
  }
}, [showResult, questions, answers, score]);

  // Play TTS for listening questions
  const playTTS = useCallback((text) => {
    if (!window.speechSynthesis) return;
    setIsListening(true);
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.onend = () => setIsListening(false);
    window.speechSynthesis.speak(utter);
  }, []);

 const handleOption = (option) => {
  setAnswers((prev) => [...prev, option]);
  if (step < questions.length - 1) {
    setStep((s) => s + 1);
  } else {
    let correct = 0;
    let mistakes = [];
    questions.forEach((q, i) => {
      const correctStr = getCorrectOptionString(q);
      if (answers[i] === correctStr) {
        correct++;
      } else {
        mistakes.push({
          question: q.question,
          yourAnswer: answers[i],
          correctAnswer: correctStr,
          category: q.category,
          phenomenon: q.phenomenon,
        });
      }
    });
    console.log("ΝΕΑ ΛΑΘΗ:", mistakes);
    setScore(correct);
    setShowResult(true);
  }
};
function getCorrectOptionString(q) {
  // Αν το correctAnswer είναι "A", "B", "C", "D" και υπάρχουν options, πάρε το string
  if (
    typeof q.answer === "string" &&
    ["A", "B", "C", "D"].includes(q.answer) &&
    Array.isArray(q.options)
  ) {
    const idx = ["A", "B", "C", "D"].indexOf(q.answer);
    return q.options[idx];
  }
  // Αν το answer είναι ήδη string, επιστρέφει αυτό
  return q.answer;
}

  if (questions.length === 0)
    return <div className={styles.container}>Loading...</div>;
  if (showResult)
    return (
      <div className={styles.container}>
        <h2>Results</h2>
        <div className={styles.resultScore}>
          Score: {score} / {questions.length}
        </div>
        <button className={styles.startBtn} onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );

  const q = questions[step];

  return (
    <div className={styles.container}>
      <div className={styles.qTitle}>
        Q{step + 1} <span>({q.category}, diff: {q.difficulty})</span>
      </div>
      <div style={{ marginBottom: 10 }}>
        {q.question}
        {q.category === "listening" && (
          <button
            className={styles.optionBtnListen}
            type="button"
            disabled={isListening}
            onClick={() =>
              playTTS(
                q.tts && typeof q.tts === "string"
                  ? q.tts
                  : q.question || ""
              )
            }
          >
            <span role="img" aria-label="speaker">🔊</span> Play Sentence
          </button>
        )}
      </div>
      <ul className={styles.optionsList}>
        {q.options.map((opt, i) => (
          <li key={i}>
            <button
              className={styles.optionBtn}
              onClick={() => handleOption(opt)}
            >
              {String.fromCharCode(65 + i)}. {opt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default RecommendedTest;