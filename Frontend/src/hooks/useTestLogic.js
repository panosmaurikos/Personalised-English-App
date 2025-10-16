import { useState, useEffect, useCallback } from "react";

function useTestLogic() {
  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [responseTimes, setResponseTimes] = useState([]);

  // Fetch questions from backend
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/placement-questions`)
      .then((res) => res.json())
      .then((data) => setQuestions(data))
      .catch((err) => console.error("Error fetching questions:", err));
  }, []);

  useEffect(() => {
    setStartTime(Date.now());
  }, [step]);

  const playTTS = useCallback((text) => {
    const utterance = new window.SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleOption = useCallback((option) => {
    const timeTaken = (Date.now() - startTime) / 1000;
    setResponseTimes((prev) => [...prev, timeTaken]);
    setAnswers((prev) => [...prev, option]);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  }, [step, startTime, questions.length]);

  const getScore = useCallback(() => {
    let score = 0;
    questions.forEach((q, i) => {
      if (q.answer && ['A', 'B', 'C', 'D'].includes(q.answer)) {
        const correctOption = q.options['A'] ? q.options[q.answer] : q.options[["A", "B", "C", "D"].indexOf(q.answer)];
        if (answers[i] === correctOption) score++;
      } else {
        if (answers[i] === q.answer) score++;
      }
    });
    return score;
  }, [questions, answers]);

  const getAvgTime = useCallback(() => {
    if (responseTimes.length === 0) return 0;
    return responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  }, [responseTimes]);

  const restartTest = useCallback(() => {
    setStep(0);
    setAnswers([]);
    setShowResult(false);
    setResponseTimes([]);
    fetch(`${process.env.REACT_APP_API_URL}/placement-questions`)
      .then((res) => res.json())
      .then((data) => setQuestions(data))
      .catch((err) => console.error("Error refetching questions:", err));
  }, []);

  const getCorrectOptionValue = useCallback((q) => {
    if (q.answer && ['A', 'B', 'C', 'D'].includes(q.answer) && Array.isArray(q.options)) {
      const idx = ['A', 'B', 'C', 'D'].indexOf(q.answer);
      return q.options[idx];
    }
    return q.answer;
  }, []);

  return {
    step,
    answers,
    showResult,
    QUESTIONS: questions,
    playTTS,
    handleOption,
    getScore,
    getAvgTime,
    restartTest,
    getCorrectOptionValue,
  };
}

export default useTestLogic;