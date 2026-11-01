
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { getMyComplaints } from "../../services/complaintService";

function CitizenDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getMyComplaints()
      .then((data) => {
        if (isMounted) {
          setComplaints(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const resolved = complaints.filter(
    (c) => c.status === "RESOLVED"
  ).length;

  const inProgress = complaints.filter(
    (c) => c.status === "IN_PROGRESS"
  ).length;

  return (
    <div>
      <Navbar />

      <div className="dashboard">
        <h1>
          {t("welcome")}, {user?.name || t("citizen")}
        </h1>

        <p>{t("taglineDashboard")}</p>

        <button
          className="primary-btn"
          onClick={() => navigate("/report")}
        >
          {t("reportNewIssue")}
        </button>

        <div className="stats">
          <div className="stat-card">
            <h2>{loading ? "..." : complaints.length}</h2>
            <p>{t("myTotalComplaints")}</p>
          </div>

          <div className="stat-card">
            <h2>{loading ? "..." : inProgress}</h2>
            <p>{t("inProgress")}</p>
          </div>

          <div className="stat-card">
            <h2>{loading ? "..." : resolved}</h2>
            <p>{t("resolved")}</p>
          </div>
        </div>

        {/* Dashboard Action Buttons */}
        <div
          className="dashboard-actions"
          style={{
            display: "flex",
            gap: "15px",
            alignItems: "center",
            flexWrap: "wrap"
          }}
        >
          <button onClick={() => navigate("/complaints")}>
            📄 {t("myComplaints")}
          </button>

          <button onClick={() => navigate("/notifications")}>
            🔔 {t("notifications")}
          </button>

          <button onClick={() => navigate("/profile")}>
            👤 {t("profile")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CitizenDashboard;
