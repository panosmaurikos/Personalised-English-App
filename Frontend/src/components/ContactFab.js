import React from 'react';
import styles from '../css/ContactFab.module.css';  

function ContactFab({ onClick }) {
  return (
    <button className={styles['contact-fab']} onClick={onClick}>
      <img 
        src="https://img.icons8.com/ios-filled/40/fa314a/chat.png" 
        alt="Contact"
      />
    </button>
  );
}

export default ContactFab;