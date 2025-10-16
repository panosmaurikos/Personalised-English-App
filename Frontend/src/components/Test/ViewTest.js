import React from 'react';
import styles from '../../css/ViewTest.module.css';

function ViewTest({ test, onClose }) {
  // Add fallback for questions
  const questions = Array.isArray(test.questions) ? test.questions : [];

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{test.title}</h3>
      <p className={styles.desc}><strong>Description:</strong> {test.description || 'No description'}</p>
      <p className={styles.info}><strong>Type:</strong> {test.type}</p>
      <p className={styles.info}><strong>Created:</strong> {new Date(test.created_at).toLocaleString()}</p>
      <p className={styles.info}><strong>Updated:</strong> {new Date(test.updated_at).toLocaleString()}</p>
      <h4 className={styles.questionsHeader}>Questions</h4>
      {questions.length === 0 && <div>No questions found.</div>}
      {questions.map((q, index) => (
        <div key={index} className={styles.questionBlock}>
          <h5 className={styles.questionTitle}>Question {index + 1}: {q.question_text}</h5>
          <div className={styles.questionInfo}>
            <span className={styles.badge}>Category: {q.category || 'vocabulary'}</span>
          </div>
          <p className={styles.questionInfo}>Points: {q.points}</p>
          <p className={styles.questionInfo}>Correct Answer: {q.correct_answer}</p>
          {q.options && (
            <ul className={styles.optionsList}>
              {Object.entries(q.options).map(([key, value]) => (
                <li key={key} className={key === q.correct_answer ? styles.correct : ''}>
                  {key}: {value}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
      <button onClick={onClose} className={styles.closeBtn}>Close</button>
    </div>
  );
}

export default ViewTest;