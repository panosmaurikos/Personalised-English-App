import React from "react";
import styles from "../css/Dashboard.module.css";

function ProgressRing({ value, color = "#007bff", size = 70, text }) {
  const radius = 30;
  const stroke = 7;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const pct = Math.max(0, Math.min(100, value));
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  let fontSize = 16;
  if (text && text.length > 5) fontSize = 13;
  if (text && text.length > 12) fontSize = 10.5;

  return (
    <svg height={size} width={size} className={styles.progressRing}>
      <circle
        stroke="#e5e7eb"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s" }}
        strokeDasharray={circumference + " " + circumference}
        strokeDashoffset={strokeDashoffset}
        r={normalizedRadius}
        cx={size / 2}
        cy={size / 2}
      />
      <foreignObject
        x={size * 0.12}
        y={size * 0.33}
        width={size * 0.76}
        height={size * 0.33}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: "100%",
            fontWeight: "bold",
            fontSize: fontSize,
            color: "#222",
            textAlign: "center",
            lineHeight: 1.05,
            wordBreak: "break-word",
          }}
        >
          {text || `${pct}%`}
        </div>
      </foreignObject>
    </svg>
  );
}

export default ProgressRing;