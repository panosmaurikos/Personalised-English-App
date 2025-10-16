import React from 'react';
import styles from '../../css/TestCard.module.css';

function TestCard({ test, onView, onEdit, onDelete, onResults }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{test.title}</h3>
      <p className={styles.desc}>{test.description || 'No description'}</p>
      <p className={styles.info}>Type: {test.type}</p>
      <p className={styles.info}>Created: {new Date(test.created_at).toLocaleDateString()}</p>
      <p className={styles.info}>Updated: {new Date(test.updated_at).toLocaleDateString()}</p>
      <div className={styles.actions}>
        <button onClick={onView} className={styles.viewBtn}>View</button>
        <button onClick={onEdit} className={styles.editBtn}>Edit</button>
        <button onClick={onResults} className={styles.resultsBtn}>Results</button>
        <button onClick={onDelete} className={styles.deleteBtn}>Delete</button>
      </div>
    </div>
  );
}

export default TestCard;