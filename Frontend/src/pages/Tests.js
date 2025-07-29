import React from "react";
import useTestLogic from "../hooks/useTestLogic";
import "../css/Tests.css";

/**
 * The Tests component renders the English level test UI.
 * All quiz logic and state are managed by the useTestLogic hook.
 */
function Tests() {
  const {
    step,
    showResult,
    QUESTIONS,
    playTTS,
    handleOption,
    getScore,
    getLevel,
    restartTest,
  } = useTestLogic();

  // Bootstrap badge color based on question type
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

  // Capitalize first letter
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div className="test-container">
      <div className="test-card">
        <h2 className="test-title text-center">
          Quick English Level Test
        </h2>
        <p className="test-desc text-center">
          Answer a few questions to discover your English level and get personalized recommendations!
        </p>

        {!showResult ? (
          <div>
            <div className="test-question-block">
              <div className="test-header-row">
                {/* Question number button - now blue for distinction */}
                <span
                  className="test-badge test-question-badge"
                >
                  Question {step + 1} of {QUESTIONS.length}
                </span>
                {/* Centered and visually improved type badge */}
                <span
                  className={`badge bg-${typeBadge(QUESTIONS[step].type)} test-type-badge`}
                >
                  {capitalize(QUESTIONS[step].type)}
                </span>
              </div>
              {/* Instruction */}
              <h5 className="test-question test-instruction text-center">
                {QUESTIONS[step].instruction}
              </h5>
              {/* Question */}
              {QUESTIONS[step].question && (
                <div className="test-question-detail text-center">
                  {QUESTIONS[step].question}
                </div>
              )}
              {/* Use TTS for listening questions */}
              {QUESTIONS[step].type === "listening" && (
                <div className="test-audio-row text-center mb-4">
                  <button
                    className="btn btn-light test-audio-btn d-inline-flex align-items-center justify-content-center"
                    type="button"
                    onClick={() => playTTS(QUESTIONS[step].tts)}
                  >
                    <span className="me-2 test-audio-icon">
                      <i className="bi bi-volume-up-fill"></i>
                    </span>
                    Play Sentence
                  </button>
                </div>
              )}
              <div className="test-options d-flex flex-column align-items-center">
                {QUESTIONS[step].options.map((option) => (
                  <button
                    key={option}
                    className="test-option-btn"
                    onClick={() => handleOption(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="test-result">
            <h3 className="test-level text-center">
              Your Level: {getLevel(getScore())}
            </h3>
            <div className="test-score text-center">
              <span>
                Score: {getScore()} / {QUESTIONS.length}
              </span>
            </div>
            <p className="test-feedback text-center">
              {getScore() >= 10 && "Excellent! You have a strong command of English."}
              {getScore() >= 7 && "Great job! You have a good understanding of English."}
              {getScore() >= 4 && "Not bad! You have a basic understanding of English."}
              {getScore() < 4 && "Keep trying! You might benefit from some review."}
            </p>
            <div className="text-center">
              <button
                className="test-retry-btn btn btn-success px-4 py-2"
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