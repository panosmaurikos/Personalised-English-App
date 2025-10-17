import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

function Dashboard() {
  const [history, setHistory] = useState([]);
  const [mistakes, setMistakes] = useState([]);
  const [misconceptions, setMisconceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const capitalize = (str) =>
    str && typeof str === "string"
      ? str.charAt(0).toUpperCase() + str.slice(1)
      : "";

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("jwt");
      if (!token) {
        setError("Please log in first!");
        setLoading(false);
        setHistory([]);
        setMistakes([]);
        setMisconceptions([]);
        return;
      }

      try {
        // Fetch ιστορικό
        const hRes = await fetch(`${process.env.REACT_APP_API_URL}/user-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let historyData = [];
        if (hRes.ok) {
          historyData = await hRes.json();
        }
        setHistory(Array.isArray(historyData) ? historyData : []);

        // Fetch mistakes
        const mRes = await fetch(`${process.env.REACT_APP_API_URL}/user-mistakes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let mistakesData = [];
        if (mRes.ok) {
          mistakesData = await mRes.json();
        }
        setMistakes(Array.isArray(mistakesData) ? mistakesData : []);

        // Fetch misconceptions για το τελευταίο test
        let misconceptionsData = [];
        if (Array.isArray(historyData) && historyData.length > 0) {
          const latestTestId = historyData[0].test_id;
          const misconRes = await fetch(
            `${process.env.REACT_APP_API_URL}/misconceptions/${latestTestId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (misconRes.ok) {
            misconceptionsData = await misconRes.json();
          }
        }
        setMisconceptions(Array.isArray(misconceptionsData) ? misconceptionsData : []);

        setLoading(false);
      } catch (err) {
        setError(err.message || "Unknown error");
        setLoading(false);
        setHistory([]);
        setMistakes([]);
        setMisconceptions([]);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className={styles.loaderBox}><div className={styles.loader}></div></div>;
  if (error) return <div className={styles.dashboardContainer} style={{ color: "red" }}>{error}</div>;

  const latestTest = Array.isArray(history) && history.length > 0 ? history[0] : null;

  return (
    <div className={styles.proDashboardContainer}>
      <header className={styles.proHeader}>
        <button className={styles.proBackBtn} onClick={() => navigate("/")}>
          <span>&larr;</span> Home
        </button>
        <div className={styles.proHeaderContent}>
          <img src="https://img.icons8.com/color/64/graduation-cap.png" alt="cap" className={styles.proHeaderIcon} />
          <div>
            <h1 className={styles.proTitle}>Welcome back!</h1>
            <p className={styles.proSubtitle}>Here's an overview of your progress.</p>
          </div>
        </div>
        <button className={styles.proNewTestBtn} onClick={() => navigate("/tests")}>
          <span>+</span> New Test
        </button>
        <button
          className={styles.proNewTestBtn}
          onClick={() => navigate("/recommended")}
        >
          Personalized Practice
        </button>
      </header>

      <div className={styles.proStatsGridWide}>
        {/* Score */}
        <div className={styles.proStatCard}>
          <ProgressRing value={latestTest ? latestTest.score : 0} color="#17c964" text={latestTest ? `${latestTest.score.toFixed(0)}%` : "0%"} />
          <div className={styles.proStatLabel}>Latest Score</div>
          <div className={styles.proStatValue}>{latestTest ? latestTest.score.toFixed(2) + "%" : "--"}</div>
        </div>
        {/* Level */}
        <div className={styles.proStatCard}>
          <ProgressRing
            value={
              latestTest && latestTest.level
                ? (latestTest.level === "C2"
                  ? 100
                  : latestTest.level === "C1"
                  ? 90
                  : latestTest.level === "B2"
                  ? 80
                  : latestTest.level === "B1"
                  ? 60
                  : latestTest.level === "A2"
                  ? 40
                  : 20)
                : 0
            }
            color="#0070f3"
            text={latestTest ? latestTest.level : "--"}
          />
          <div className={styles.proStatLabel}>Level</div>
          <div className={styles.proStatValue}>{latestTest ? latestTest.level : "--"}</div>
        </div>
        {/* Avg time */}
        <div className={styles.proStatCard}>
          <ProgressRing value={latestTest ? Math.max(5, Math.min(100, (40 - latestTest.avg_time) * 2.5)) : 0} color="#f5a524" text={latestTest ? latestTest.avg_time.toFixed(1) + "s" : "--"} />
          <div className={styles.proStatLabel}>Avg Time</div>
          <div className={styles.proStatValue}>{latestTest ? latestTest.avg_time.toFixed(2) + "s" : "--"}</div>
        </div>
        {/* Mistakes */}
        <div className={styles.proStatCard}>
          <ProgressRing value={Array.isArray(mistakes) && mistakes.length ? Math.min(100, mistakes[0].count * 10) : 0} color="#f31260" text={Array.isArray(mistakes) && mistakes.length ? mistakes[0].count : "0"} />
          <div className={styles.proStatLabel}>Top Mistakes</div>
          <div className={styles.proStatValue}>{Array.isArray(mistakes) && mistakes.length ? capitalize(mistakes[0].category) : "--"}</div>
        </div>
      </div>

      <div className={styles.proCardsFlex}>
        <div className={styles.proCard}>
          <h3>
            <img src="https://img.icons8.com/color/32/error--v1.png" alt="improve" className={styles.proCardIcon} />
            Areas to Improve
          </h3>
          <ul className={styles.proList}>
            {Array.isArray(misconceptions) && misconceptions.length === 0 ? (
              <li className={styles.proListEmpty}>No significant weaknesses detected.</li>
            ) : (
              misconceptions.map((m) => (
                <li key={m.category}>
                  <span className={styles.cat}>{capitalize(m.category)}</span>: <b>{m.percentage.toFixed(2)}%</b>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className={styles.proCard}>
          <h3>
            <img src="https://img.icons8.com/color/32/inspection.png" alt="mistake" className={styles.proCardIcon} />
            Mistakes by Category
          </h3>
          <ul className={styles.proList}>
            {Array.isArray(mistakes) && mistakes.length === 0 ? (
              <li className={styles.proListEmpty}>No mistakes found.</li>
            ) : (
              mistakes.map((m) => (
                <li key={m.category}>
                  <span className={styles.cat}>{capitalize(m.category)}</span>: <b>{m.count}</b> mistake{m.count !== 1 ? "s" : ""}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className={styles.proHistorySection}>
        <h3>
          <img src="https://img.icons8.com/color/28/clock--v1.png" alt="history" className={styles.proHistoryIcon} />
          Test History
        </h3>
        {Array.isArray(history) && history.length === 0 ? (
          <div className={styles.proListEmpty}>No tests taken yet.</div>
        ) : (
          <table className={styles.proHistoryTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Score</th>
                <th>Level</th>
                <th>Avg Time</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.test_id}>
                  <td>{new Date(h.completed_at).toLocaleDateString()}</td>
                  <td>{h.score.toFixed(2)}%</td>
                  <td>{h.level}</td>
                  <td>{h.avg_time.toFixed(2)}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;