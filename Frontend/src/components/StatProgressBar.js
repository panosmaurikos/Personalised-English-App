import React from "react";
import styles from "../css/Dashboard.module.css";

function StatProgressBar({ value, max = 100, color = "#007bff", label, icon, valueText }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={styles.statBarBox}>
      <div className={styles.statBarLabel}>
        {icon && <span className={styles.statBarIcon}>{icon}</span>}
        {label}
      </div>
      <div className={styles.statBarOuter}>
        <div
          className={styles.statBarInner}
          style={{ width: pct + "%", background: color }}
        ></div>
      </div>
      <div className={styles.statBarValue}>{valueText || value}</div>
    </div>
  );
}

export default StatProgressBar;
