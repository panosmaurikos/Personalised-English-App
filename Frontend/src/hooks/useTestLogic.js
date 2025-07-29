import { useState } from "react";

// Expanded questions for a quick English level test
const QUESTIONS = [
  // Vocabulary
  {
    type: "vocabulary",
    instruction: "Choose the correct word",
    question: "She ___ to the store every morning.",
    options: ["go", "goes", "going", "gone"],
    answer: "goes",
  },
  {
    type: "vocabulary",
    instruction: "Choose the correct word",
    question: "I have a ___ dog.",
    options: ["big", "bigger", "biggest", "more big"],
    answer: "big",
  },
  {
    type: "vocabulary",
    instruction: "Choose the correct word",
    question: "They ___ football on Sundays.",
    options: ["play", "plays", "playing", "played"],
    answer: "play",
  },
  // Grammar
  {
    type: "grammar",
    instruction: "Which sentence is correct?",
    question: "",
    options: [
      "He don't like apples.",
      "He doesn't likes apples.",
      "He doesn't like apples.",
      "He don't likes apples.",
    ],
    answer: "He doesn't like apples.",
  },
  {
    type: "grammar",
    instruction: "Which sentence is correct?",
    question: "",
    options: [
      "She can sings well.",
      "She can sing well.",
      "She cans sing well.",
      "She can to sing well.",
    ],
    answer: "She can sing well.",
  },
  {
    type: "grammar",
    instruction: "Which sentence is correct?",
    question: "",
    options: [
      "We was at the park.",
      "We were at the park.",
      "We is at the park.",
      "We are at the parks.",
    ],
    answer: "We were at the park.",
  },
  // Reading
  {
    type: "reading",
    instruction: "Read and answer",
    question: "'Tom is taller than Jim.' Who is taller?",
    options: ["Tom", "Jim", "Both", "Neither"],
    answer: "Tom",
  },
  {
    type: "reading",
    instruction: "Read and answer",
    question: "'Anna has two cats and one dog.' How many pets does Anna have?",
    options: ["1", "2", "3", "4"],
    answer: "3",
  },
  {
    type: "reading",
    instruction: "Read and answer",
    question: "'The library opens at 9 AM and closes at 5 PM.' When does the library close?",
    options: ["9 AM", "5 PM", "Noon", "8 PM"],
    answer: "5 PM",
  },
  // Listening (TTS)
  {
    type: "listening",
    instruction: "Listen and choose the correct sentence",
    question: "",
    options: [
      "The weather is rainy and cold today.",
      "The weather is snowy and windy today.",
      "The weather is sunny and warm today.",
      "The weather is cloudy and humid today.",
    ],
    answer: "The weather is sunny and warm today.",
    tts: "The weather is sunny and warm today.",
  },
  {
    type: "listening",
    instruction: "Listen and choose the correct sentence",
    question: "",
    options: [
      "My favorite color is blue.",
      "My favorite color is green.",
      "My favorite color is red.",
      "My favorite color is yellow.",
    ],
    answer: "My favorite color is blue.",
    tts: "My favorite color is blue.",
  },
  {
    type: "listening",
    instruction: "Listen and choose the correct sentence",
    question: "",
    options: [
      "I usually eat breakfast at 7 o'clock.",
      "I usually eat breakfast at 8 o'clock.",
      "I usually eat breakfast at 9 o'clock.",
      "I usually eat breakfast at 10 o'clock.",
    ],
    answer: "I usually eat breakfast at 8 o'clock.",
    tts: "I usually eat breakfast at 8 o'clock.",
  },
];

function useTestLogic() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);

  // Play text as speech for listening questions
  const playTTS = (text) => {
    const utterance = new window.SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleOption = (option) => {
    setAnswers([...answers, option]);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const getScore = () => {
    let score = 0;
    QUESTIONS.forEach((q, i) => {
      if (answers[i] === q.answer) score++;
    });
    return score;
  };

  const getLevel = (score) => {
    if (score >= 10) return "ECPE (C2)";
    if (score >= 7) return "ECCE (B2)";
    if (score >= 4) return "MET Digital (A2-C1)";
    return "MET Go! Digital (A1-B2)";
  };

  const restartTest = () => {
    setStep(0);
    setAnswers([]);
    setShowResult(false);
  };

  return {
    step,
    setStep,
    answers,
    setAnswers,
    showResult,
    setShowResult,
    QUESTIONS,
    playTTS,
    handleOption,
    getScore,
    getLevel,
    restartTest,
  };
}

export default useTestLogic;