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
  const [phenomenonMistakes, setPhenomenonMistakes] = useState([]);
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
        setPhenomenonMistakes([]);
        return;
      }

      try {
        // Fetch history
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

        // Fetch misconceptions for latest test
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

        // Fetch phenomenon mistakes
        const pRes = await fetch(`${process.env.REACT_APP_API_URL}/user-phenomenon-mistakes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let pData = [];
        if (pRes.ok) {
          pData = await pRes.json();
        }
        setPhenomenonMistakes(Array.isArray(pData) ? pData : []);

        setLoading(false);
      } catch (err) {
        setError(err.message || "Unknown error");
        setLoading(false);
        setHistory([]);
        setMistakes([]);
        setMisconceptions([]);
        setPhenomenonMistakes([]);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className={styles.loaderBox}><div className={styles.loader}></div></div>;
  if (error) return <div className={styles.dashboardContainer} style={{ color: "red" }}>{error}</div>;

  const latestTest = Array.isArray(history) && history.length > 0 ? history[0] : null;

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <button className={styles.navBtn} onClick={() => navigate("/")}>
          <span>&larr;</span> Home
        </button>
        <div className={styles.headerContent}>
          <img src="https://img.icons8.com/color/64/graduation-cap.png  " alt="cap" className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>Welcome back!</h1>
            <p className={styles.subtitle}>Here's an overview of your progress.</p>
          </div>
        </div>
        <button
          className={styles.practiceBtn}
          onClick={() => navigate("/recommended")}
        >
          Personalized Practice
        </button>
      </header>

      <div className={styles.statsGrid}>
        {/* Score */}
        <div className={styles.statCard}>
          <ProgressRing value={latestTest ? latestTest.score : 0} color="#17c964" text={latestTest ? `${latestTest.score.toFixed(0)}%` : "0%"} />
          <div className={styles.statLabel}>Latest Score</div>
          <div className={styles.statValue}>{latestTest ? latestTest.score.toFixed(2) + "%" : "--"}</div>
        </div>
        {/* Level */}
        <div className={styles.statCard}>
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
          <div className={styles.statLabel}>Level</div>
          <div className={styles.statValue}>{latestTest ? latestTest.level : "--"}</div>
        </div>
        {/* Avg time */}
        <div className={styles.statCard}>
          <ProgressRing value={latestTest ? Math.max(5, Math.min(100, (40 - latestTest.avg_time) * 2.5)) : 0} color="#f5a524" text={latestTest ? latestTest.avg_time.toFixed(1) + "s" : "--"} />
          <div className={styles.statLabel}>Average Time</div>
          <div className={styles.statValue}>{latestTest ? latestTest.avg_time.toFixed(2) + "s" : "--"}</div>
        </div>
        {/* Mistakes */}
        <div className={styles.statCard}>
          <ProgressRing value={Array.isArray(mistakes) && mistakes.length ? Math.min(100, mistakes[0].count * 10) : 0} color="#f31260" text={Array.isArray(mistakes) && mistakes.length ? mistakes[0].count : "0"} />
          <div className={styles.statLabel}>Top Mistakes</div>
          <div className={styles.statValue}>{Array.isArray(mistakes) && mistakes.length ? capitalize(mistakes[0].category) : "--"}</div>
        </div>
      </div>

      <div className={styles.cardsFlex}>
        <div className={styles.card}>
          <h3>
            <img src="https://img.icons8.com/color/32/error--v1.png  " alt="improve" className={styles.cardIcon} />
            Areas to Improve
          </h3>
          <ul className={styles.list}>
            {Array.isArray(misconceptions) && misconceptions.length === 0 ? (
              <li className={styles.listEmpty}>No significant weaknesses detected.</li>
            ) : (
              misconceptions.map((m) => (
                <li key={m.category}>
                  <span className={styles.cat}>{capitalize(m.category)}</span>: <b>{m.percentage.toFixed(2)}%</b>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className={styles.card}>
          <h3>
            <img src="https://img.icons8.com/color/32/inspection.png  " alt="mistake" className={styles.cardIcon} />
            Mistakes by Category
          </h3>
          <ul className={styles.list}>
            {Array.isArray(mistakes) && mistakes.length === 0 ? (
              <li className={styles.listEmpty}>No mistakes found.</li>
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

      {phenomenonMistakes.length > 0 && (
        <section className={styles.phenomenonSection}>
          <h3>Top Mistakes by Phenomenon</h3>
          <ul>
            {phenomenonMistakes.map((p) => (
              <li key={p.phenomenon}>{p.phenomenon}: {p.count} mistakes</li>
            ))}
          </ul>
          {/* Αφαίρεση του επιπλέον link - κρατάμε μόνο το message */}
          <div style={{color: "#2563eb", fontWeight: 500, marginTop: 8, fontSize: 16}}>
            Practice these phenomena in Personalized Practice
          </div>
        </section>
      )}

      <div className={styles.historySection}>
        <h3>
          <img src="https://img.icons8.com/color/28/clock--v1.png  " alt="history" className={styles.historyIcon} />
          Test History
        </h3>
        {Array.isArray(history) && history.length === 0 ? (
          <div className={styles.listEmpty}>No tests taken yet.</div>
        ) : (
          <table className={styles.historyTable}>
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