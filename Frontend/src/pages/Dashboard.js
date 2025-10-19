import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/Dashboard.module.css";
import ProgressRing from "../components/ProgressRing";

function Dashboard() {
  const [history, setHistory] = useState([]);
  const [mistakes, setMistakes] = useState([]);
  const [misconceptions, setMisconceptions] = useState([]);
  const [phenomenonMistakes, setPhenomenonMistakes] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [inviteCode, setInviteCode] = useState("");
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
        setClassrooms([]);
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
          const misconRes = await fetch(`${process.env.REACT_APP_API_URL}/misconceptions/${latestTestId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
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
        // Fetch classrooms
        const cRes = await fetch(`${process.env.REACT_APP_API_URL}/classrooms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let cData = [];
        if (cRes.ok) {
          cData = await cRes.json();
        }
        setClassrooms(Array.isArray(cData) ? cData : []);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Unknown error");
        setLoading(false);
        setHistory([]);
        setMistakes([]);
        setMisconceptions([]);
        setPhenomenonMistakes([]);
        setClassrooms([]);
      }
    }
    fetchData();
  }, []);

  const handleJoinClassroom = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setError("Invite code is required");
      return;
    }
    try {
      const token = localStorage.getItem("jwt");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/classrooms/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ invite_code: inviteCode }),

      });
      if (res.ok) {
        setInviteCode("");
        setError("");
        // Refresh classrooms
        const cRes = await fetch(`${process.env.REACT_APP_API_URL}/classrooms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cRes.ok) {
          const cData = await cRes.json();
          setClassrooms(Array.isArray(cData) ? cData : []);
        }
      } else {
        const data = await res.json();
        setError(data.error || "Failed to join classroom");
      }
    } catch (err) {
      setError("Error joining classroom");
      console.error(err);
    }
  };

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

  const latestTest = Array.isArray(history) && history.length > 0 ? history[0] : null;

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <button className={styles.navBtn} onClick={() => navigate("/")}>
          <span>&larr;</span> Home
        </button>
        <div className={styles.headerContent}>
          <img
            src="https://img.icons8.com/color/64/graduation-cap.png"
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
        <div className={styles.statCard}>
          <ProgressRing
            value={
              latestTest && latestTest.level
                ? latestTest.level === "C2"
                  ? 100
                  : latestTest.level === "C1"
                  ? 90
                  : latestTest.level === "B2"
                  ? 80
                  : latestTest.level === "B1"
                  ? 60
                  : latestTest.level === "A2"
                  ? 40
                  : 20
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
              src="https://img.icons8.com/color/32/error--v1.png"
              alt="improve"
              className={styles.cardIcon}
            />
            Areas to Improve
          </h3>
          <ul className={styles.list}>
            {Array.isArray(misconceptions) && misconceptions.length === 0 ? (
              <li className={styles.listEmpty}>
                No significant weaknesses detected.
              </li>
            ) : (
              misconceptions.map((m) => (
                <li key={m.category}>
                  <span className={styles.cat}>{capitalize(m.category)}</span>:{" "}
                  <b>{m.percentage.toFixed(2)}%</b>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className={styles.card}>
          <h3>
            <img
              src="https://img.icons8.com/color/32/inspection.png"
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
      <section className={styles.classroomSection}>
        <h3>Join a Classroom</h3>
        <form onSubmit={handleJoinClassroom}>
          <input
            type="text"
            placeholder="Enter invite code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.createBtn}>Join</button>
        </form>
        <h3>Your Classrooms</h3>
        {classrooms.length === 0 ? (
          <div className={styles.listEmpty}>No classrooms joined yet.</div>
        ) : (
          <div className={styles.testGrid}>
            {classrooms.map((classroom) => (
              <div key={classroom.id} className={styles.classroomCard}>
                <h4>{classroom.name}</h4>
                <p>{classroom.description || "No description"}</p>
                <h5>Assigned Tests</h5>
                {classroom.tests?.length ? (
                  <ul>
                    {classroom.tests.map((test) => (
                      <li key={test.id}>
                        {test.title}
                        <button
                          onClick={() => navigate(`/test/${test.id}`)}
                          className={styles.actionBtn}
                        >
                          Take Test
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No tests assigned.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
      <div className={styles.historySection}>
        <h3>
          <img
            src="https://img.icons8.com/color/28/clock--v1.png"
            alt="history"
            className={styles.historyIcon}
          />
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
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.test_id}>
                  <td>{(() => {
                    const d = new Date(h.completed_at);
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();
                    const hours = String(d.getHours()).padStart(2, '0');
                    const minutes = String(d.getMinutes()).padStart(2, '0');
                    return `${day}/${month}/${year} ${hours}:${minutes}`;
                  })()}</td>
                  <td>{h.score.toFixed(2)}%</td>
                  <td>{h.level}</td>
                  <td>{h.avg_time.toFixed(2)}s</td>
                  <td>
                    {h.test_type === 'personalized' ? (
                      <span className={styles.testTypePersonalized}>
                        Personalized
                      </span>
                    ) : (
                      <span className={styles.testTypeRegular}>
                        Regular
                      </span>
                    )}
                  </td>
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