import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/Dashboard.module.css";
import { Button, Select, Input, DatePicker, Space } from "antd";
import dayjs from "dayjs";
import "antd/dist/reset.css";
import StudentClassrooms from "../components/Classroom/StudentClassrooms";
import ProgressRing from "../components/ProgressRing";

function Dashboard() {
  // Filter/group state
  const [filterDate, setFilterDate] = useState("");
  const [filterScore, setFilterScore] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterAvgTime, setFilterAvgTime] = useState("");
  const [filterType, setFilterType] = useState("");
  const [groupBy, setGroupBy] = useState("");

  // Data state
  const [history, setHistory] = useState([]);
  const [mistakes, setMistakes] = useState([]);
  const [misconceptions, setMisconceptions] = useState([]);
  const [phenomenonMistakes, setPhenomenonMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Helper: format date/time
  function formatDateTime(dt) {
    const d = new Date(dt);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  // Filtering logic
  const filteredHistory = history.filter((h) => {
    let pass = true;
    if (filterDate) {
      const d = new Date(h.completed_at);
      const filter = new Date(filterDate);
      pass =
        pass &&
        d.getFullYear() === filter.getFullYear() &&
        d.getMonth() === filter.getMonth() &&
        d.getDate() === filter.getDate();
    }
    if (filterScore) {
      pass = pass && h.score >= parseFloat(filterScore);
    }
    if (filterLevel) {
      pass = pass && h.level === filterLevel;
    }
    if (filterAvgTime) {
      pass = pass && h.avg_time >= parseFloat(filterAvgTime);
    }
    if (filterType) {
      pass = pass && h.test_type === filterType;
    }
    return pass;
  });

  // Grouping logic
  function groupHistory(data) {
    if (!groupBy) return [{ group: null, items: data }];
    const groups = {};
    data.forEach((h) => {
      let key = "";
      if (groupBy === "date") {
        key = formatDateTime(h.completed_at).split(" ")[0];
      } else if (groupBy === "score") {
        key = `${Math.floor(h.score / 10) * 10}%+`;
      } else if (groupBy === "level") {
        key = h.level;
      } else if (groupBy === "avg_time") {
        // Group by 2-second intervals
        const interval = 2;
        const lower = Math.floor(h.avg_time / interval) * interval;
        key = `${lower}s+`;
      } else if (groupBy === "type") {
        key = h.test_type;
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(h);
    });
    return Object.entries(groups).map(([group, items]) => ({ group, items }));
  }
  const groupedHistory = groupHistory(filteredHistory);

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
        const hRes = await fetch(
          `${process.env.REACT_APP_API_URL}/user-history`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        let historyData = [];
        if (hRes.ok) {
          historyData = await hRes.json();
        }
        setHistory(Array.isArray(historyData) ? historyData : []);

        // Fetch mistakes
        const mRes = await fetch(
          `${process.env.REACT_APP_API_URL}/user-mistakes`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
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
        setMisconceptions(
          Array.isArray(misconceptionsData) ? misconceptionsData : []
        );

        // Fetch phenomenon mistakes
        const pRes = await fetch(
          `${process.env.REACT_APP_API_URL}/user-phenomenon-mistakes`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
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
  if (loading)
    return (
      <div className={styles.loaderBox}>
        <div className={styles.loader}></div>
      </div>
    );
  if (error)
    return (
      <div className={styles.dashboardContainer} style={{ color: "red" }}>
        {error}
      </div>
    );

  const latestTest =
    Array.isArray(history) && history.length > 0 ? history[0] : null;

  const handleRefresh = async () => {
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
      const hRes = await fetch(
        `${process.env.REACT_APP_API_URL}/user-history`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      let historyData = [];
      if (hRes.ok) {
        historyData = await hRes.json();
      }
      setHistory(Array.isArray(historyData) ? historyData : []);

      // Fetch mistakes
      const mRes = await fetch(
        `${process.env.REACT_APP_API_URL}/user-mistakes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
      setMisconceptions(
        Array.isArray(misconceptionsData) ? misconceptionsData : []
      );

      // Fetch phenomenon mistakes
      const pRes = await fetch(
        `${process.env.REACT_APP_API_URL}/user-phenomenon-mistakes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className={styles.navBtn} onClick={() => navigate("/")}>
            <span>&larr;</span> Home
          </button>
          <button
            className={styles.navBtn}
            onClick={handleRefresh}
            style={{ background: '#17a2b8' }}
          >
            🔄 Refresh
          </button>
        </div>
        <div className={styles.headerContent}>
          <img
            src="https://img.icons8.com/color/64/graduation-cap.png  "
            alt="cap"
            className={styles.headerIcon}
          />
          <div>
            <h1 className={styles.title}>Welcome back!</h1>
            <p className={styles.subtitle}>
              Here's an overview of your progress.
            </p>
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
          <ProgressRing
            value={latestTest ? latestTest.score : 0}
            color="#17c964"
            text={latestTest ? `${latestTest.score.toFixed(0)}%` : "0%"}
          />
          <div className={styles.statLabel}>Latest Score</div>
          <div className={styles.statValue}>
            {latestTest ? latestTest.score.toFixed(2) + "%" : "--"}
          </div>
        </div>
        {/* Level */}
        <div className={styles.statCard}>
          <ProgressRing
            value={
              latestTest && latestTest.level
                ? latestTest.level === "Beginner"
                  ? 33.33
                  : latestTest.level === "Intermediate"
                  ? 66.66
                  : latestTest.level === "Advanced"
                  ? 100
                  : 0
                : 0
            }
            color="#0070f3"
            text={latestTest ? latestTest.level : "--"}
          />
          <div className={styles.statLabel}>Level</div>
          <div className={styles.statValue}>
            {latestTest ? latestTest.level : "--"}
          </div>
        </div>
        {/* Avg time */}
        <div className={styles.statCard}>
          <ProgressRing
            value={
              latestTest
                ? Math.max(5, Math.min(100, (40 - latestTest.avg_time) * 2.5))
                : 0
            }
            color="#f5a524"
            text={latestTest ? latestTest.avg_time.toFixed(1) + "s" : "--"}
          />
          <div className={styles.statLabel}>Average Time</div>
          <div className={styles.statValue}>
            {latestTest ? latestTest.avg_time.toFixed(2) + "s" : "--"}
          </div>
        </div>
        {/* Mistakes */}
        <div className={styles.statCard}>
          <ProgressRing
            value={
              Array.isArray(mistakes) && mistakes.length
                ? Math.min(100, mistakes[0].count * 10)
                : 0
            }
            color="#f31260"
            text={
              Array.isArray(mistakes) && mistakes.length
                ? mistakes[0].count
                : "0"
            }
          />
          <div className={styles.statLabel}>Top Mistakes</div>
          <div className={styles.statValue}>
            {Array.isArray(mistakes) && mistakes.length
              ? capitalize(mistakes[0].category)
              : "--"}
          </div>
        </div>
      </div>

      <div className={styles.cardsFlex}>
        <div className={styles.card}>
          <h3>
            <img
              src="https://img.icons8.com/color/32/error--v1.png  "
              alt="improve"
              className={styles.cardIcon}
            />
            Areas to Improve
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '1rem' }}>
            Categories where you made the most mistakes in your last test
          </p>
          <ul className={styles.list}>
            {Array.isArray(misconceptions) && misconceptions.length === 0 ? (
              <li className={styles.listEmpty}>
                Great job! No significant weaknesses detected.
              </li>
            ) : (
              misconceptions.map((m) => (
                <li key={m.category}>
                  <span className={styles.cat}>{capitalize(m.category)}</span>
                  <div style={{ marginTop: '0.25rem' }}>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: '#e9ecef',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${m.percentage}%`,
                        height: '100%',
                        background: m.percentage > 50 ? '#dc3545' : m.percentage > 30 ? '#ffc107' : '#17a2b8',
                        transition: 'width 0.3s'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                      {m.percentage.toFixed(0)}% of mistakes in this category
                    </span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className={styles.card}>
          <h3>
            <img
              src="https://img.icons8.com/color/32/inspection.png  "
              alt="mistake"
              className={styles.cardIcon}
            />
            Mistakes by Category
          </h3>
          <ul className={styles.list}>
            {Array.isArray(mistakes) && mistakes.length === 0 ? (
              <li className={styles.listEmpty}>No mistakes found.</li>
            ) : (
              mistakes.map((m) => (
                <li key={m.category}>
                  <span className={styles.cat}>{capitalize(m.category)}</span>:{" "}
                  <b>{m.count}</b> mistake{m.count !== 1 ? "s" : ""}
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
              <li key={p.phenomenon}>
                {p.phenomenon}: {p.count} mistakes
              </li>
            ))}
          </ul>
          {/* Remove extra link - keep only the message */}
          <div
            style={{
              color: "#2563eb",
              fontWeight: 500,
              marginTop: 8,
              fontSize: 16,
            }}
          >
            Practice these phenomena in Personalized Practice
          </div>
        </section>
      )}

      {/* Student Classrooms Section */}
      <StudentClassrooms />

      {/* History Section with Filter/Group Controls and Complex Grouping */}
      <div className={styles.historySection}>
        <h3
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: "1.18em",
            color: "#2563eb",
            marginBottom: 8,
          }}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
            <img
              src="https://img.icons8.com/color/28/clock--v1.png  "
              alt="history"
              className={styles.historyIcon}
              style={{ marginRight: 4 }}
            />
            Test History
          </span>
        </h3>
        {/* Filter/Group Controls with Ant Design */}
        <div
          style={{
            marginBottom: 18,
            background: "#f6f8fc",
            borderRadius: 8,
            padding: "16px 18px",
            display: "flex",
            gap: 18,
            flexWrap: "wrap",
            alignItems: "center",
            boxShadow: "0 1px 4px rgba(60,100,180,0.07)",
          }}
        >
          <Space wrap>
            <span style={{ fontWeight: 500 }}>
              Date:{" "}
              <DatePicker
                value={filterDate ? dayjs(filterDate) : null}
                onChange={(d) => setFilterDate(d ? d.format("YYYY-MM-DD") : "")}
                style={{ borderRadius: 4 }}
              />
            </span>
            <span style={{ fontWeight: 500 }}>
              Score ≥{" "}
              <Input
                type="number"
                min={0}
                max={100}
                value={filterScore}
                onChange={(e) => setFilterScore(e.target.value)}
                style={{ width: 80 }}
              />
            </span>
            <span style={{ fontWeight: 500 }}>
              Level:{" "}
              <Select
                value={filterLevel}
                onChange={(v) => setFilterLevel(v)}
                style={{ width: 120 }}
                options={[
                  { value: "", label: "All" },
                  { value: "Beginner", label: "Beginner" },
                  { value: "Intermediate", label: "Intermediate" },
                  { value: "Advanced", label: "Advanced" },
                ]}
              />
            </span>
            <span style={{ fontWeight: 500 }}>
              Avg Time ≥{" "}
              <Input
                type="number"
                min={0}
                step={0.01}
                value={filterAvgTime}
                onChange={(e) => setFilterAvgTime(e.target.value)}
                style={{ width: 80 }}
              />
            </span>
            <span style={{ fontWeight: 500 }}>
              Type:{" "}
              <Select
                value={filterType}
                onChange={(v) => setFilterType(v)}
                style={{ width: 120 }}
                options={[
                  { value: "", label: "All" },
                  { value: "regular", label: "Regular" },
                  { value: "personalized", label: "Personalized" },
                ]}
              />
            </span>
            <span style={{ fontWeight: 500 }}>
              Group by:{" "}
              <Select
                value={groupBy}
                onChange={(v) => setGroupBy(v)}
                style={{ width: 120 }}
                options={[
                  { value: "", label: "None" },
                  { value: "date", label: "Date" },
                  { value: "score", label: "Score" },
                  { value: "level", label: "Level" },
                  { value: "avg_time", label: "Avg Time" },
                  { value: "type", label: "Type" },
                ]}
              />
            </span>
            <Button
              type="primary"
              size="large"
              style={{ fontWeight: 600 }}
              onClick={() => {
                setFilterDate("");
                setFilterScore("");
                setFilterLevel("");
                setFilterAvgTime("");
                setFilterType("");
                setGroupBy("");
              }}
            >
              Reset
            </Button>
          </Space>
        </div>
        {/* Grouped Table */}
        {filteredHistory.length === 0 ? (
          <div className={styles.listEmpty} style={{ marginTop: 12 }}>
            No tests found for selected filters.
          </div>
        ) : (
          groupedHistory.map(({ group, items }) => (
            <div
              key={group || "all"}
              style={{
                marginBottom: group ? 18 : 0,
                width: "100%",
                marginLeft: 0,
                marginRight: 0,
              }}
            >
              {group && (
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "1.08em",
                    color: "#4173b3",
                    marginBottom: 6,
                    background: "#eaf2fb",
                    borderRadius: 6,
                    padding: "6px 12px",
                    boxShadow: "0 1px 4px rgba(60,100,180,0.04)",
                  }}
                >
                  {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}: {group}
                </div>
              )}
              <table
                className={styles.historyTable}
                style={{
                  borderRadius: 8,
                  overflow: "hidden",
                  boxShadow: "0 1px 6px rgba(60,100,180,0.07)",
                  marginTop: 4,
                  tableLayout: "fixed",
                }}
              >
                <thead style={{ background: "#eaf2fb" }}>
                  <tr>
                    <th style={{ padding: "8px 0" }}>Date</th>
                    <th style={{ padding: "8px 0" }}>Score</th>
                    <th style={{ padding: "8px 0" }}>Level</th>
                    <th style={{ padding: "8px 0" }}>Avg Time</th>
                    <th style={{ padding: "8px 0" }}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((h) => (
                    <tr key={h.test_id} style={{ background: "#fff" }}>
                      <td style={{ padding: "8px 0" }}>
                        {formatDateTime(h.completed_at)}
                      </td>
                      <td style={{ padding: "8px 0" }}>
                        {h.score.toFixed(2)}%
                      </td>
                      <td style={{ padding: "8px 0" }}>{h.level}</td>
                      <td style={{ padding: "8px 0" }}>
                        {h.avg_time.toFixed(2)}s
                      </td>
                      <td style={{ padding: "8px 0" }}>
                        {h.test_type === "personalized" ? (
                          <span
                            className={styles.testTypePersonalized}
                            style={{
                              background: "#f5a524",
                              color: "#fff",
                              borderRadius: 6,
                              padding: "4px 14px",
                              fontWeight: 600,
                              boxShadow: "0 1px 4px rgba(245,165,36,0.09)",
                            }}
                          >
                            Personalized
                          </span>
                        ) : (
                          <span
                            className={styles.testTypeRegular}
                            style={{
                              background: "#4fc3f7",
                              color: "#fff",
                              borderRadius: 6,
                              padding: "4px 14px",
                              fontWeight: 600,
                              boxShadow: "0 1px 4px rgba(79,195,247,0.09)",
                            }}
                          >
                            Regular
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
