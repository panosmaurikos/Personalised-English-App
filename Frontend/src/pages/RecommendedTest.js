import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/Recommended.module.css";

function RecommendedTest() {
  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [responseTimes, setResponseTimes] = useState([]);
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

  // Reset startTime when step changes
  useEffect(() => {
    setStartTime(Date.now());
  }, [step]);
  useEffect(() => {
    if (
      showResult &&
      questions.length > 0 &&
      answers.length === questions.length
    ) {
      const token = localStorage.getItem("jwt");
      // Make array with correct correct_option for each question
      const answersPayload = questions.map((q, i) => ({
        question_id: q.id,
        selected_option: answers[i] || "",
        correct_option: getCorrectOptionString(q),
      }));
      // Calculate avg_time from responseTimes
      const avgTime = responseTimes.length === 0
        ? 0
        : responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const payload = {
        score: (score / questions.length) * 100,
        avg_time: avgTime,
        answers: answersPayload,
        test_type: "personalized"
      };
      fetch(`${process.env.REACT_APP_API_URL}/complete-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }).then(() => {
        // Optional: reload dashboard, show message, etc
      });
    }
  }, [showResult, questions, answers, score, responseTimes]);

  // Play TTS for listening questions
  const playTTS = useCallback((text) => {
    if (!window.speechSynthesis) return;
    setIsListening(true);
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.onend = () => setIsListening(false);
    window.speechSynthesis.speak(utter);
  }, []);

  const handleOption = (option) => {
    // Track time taken for this question
    const timeTaken = (Date.now() - startTime) / 1000;
    setResponseTimes((prev) => [...prev, timeTaken]);
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
      console.log("Mistakes:", mistakes);
      setScore(correct);
      setShowResult(true);
    }
  };
  function getCorrectOptionString(q) {
    // If correctAnswer is "A", "B", "C", "D" and options exist, get the string
    if (
      typeof q.answer === "string" &&
      ["A", "B", "C", "D"].includes(q.answer) &&
      Array.isArray(q.options)
    ) {
      const idx = ["A", "B", "C", "D"].indexOf(q.answer);
      return q.options[idx];
    }
    // If answer is already string, return it
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
        <button
          className={styles.startBtn}
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );

  const q = questions[step];

  return (
    <div className={styles.container}>
      <div className={styles.qTitle}>
        Q{step + 1}{" "}
        <span>
          ({q.category}, diff: {q.difficulty})
        </span>
      </div>
  <div className={styles.questionTextBlock}>
        {q.question}
        {q.category === "listening" && (
          <button
            className={styles.optionBtnListen}
            type="button"
            disabled={isListening}
            onClick={() =>
              playTTS(
                q.tts && typeof q.tts === "string" ? q.tts : q.question || ""
              )
            }
          >
            <span role="img" aria-label="speaker">
              🔊
            </span>{" "}
            Play Sentence
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
