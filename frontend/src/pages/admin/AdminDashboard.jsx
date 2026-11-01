import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAllAdminComplaints } from "../../services/complaintService";

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getAllAdminComplaints()
      .then((data) => {
        if (isMounted) {
          setComplaints(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          const fallback = JSON.parse(localStorage.getItem("complaints")) || [];
          setComplaints(fallback);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const reported = complaints.filter((c) => c.status === "REPORTED").length;
  const inProgress = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const resolved = complaints.filter((c) => c.status === "RESOLVED").length;

  const handleLogout = () => {
    if (authLogout) authLogout();
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("complaints");

    navigate("/admin/login");
  };

  const isStaff = user?.role === "STAFF";
  const roleTitle = isStaff ? "Field Staff Portal" : "Municipal Official Portal";

  return (
    <div>
      <nav className="admin-navbar">
        <h2>{roleTitle}</h2>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", color: "#e2e8f0" }}>
            👤 {user?.name || (isStaff ? "Field Staff" : "Official")} ({user?.role})
          </span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard">
        <h1>{isStaff ? "Staff Complaints Dashboard" : "Admin Dashboard"}</h1>
        <p>Live grievance feed: Review civic issues reported by citizens and take action.</p>

        <div className="stats">
          <div className="stat-card">
            <h2>{loading ? "..." : complaints.length}</h2>
            <p>Total Complaints</p>
          </div>

          <div className="stat-card">
            <h2>{loading ? "..." : reported}</h2>
            <p>Reported</p>
          </div>

          <div className="stat-card">
            <h2>{loading ? "..." : inProgress}</h2>
            <p>In Progress</p>
          </div>

          <div className="stat-card">
            <h2>{loading ? "..." : resolved}</h2>
            <p>Resolved</p>
          </div>
        </div>

        <button
          className="primary-btn"
          onClick={() => navigate("/admin/complaints")}
        >
          📋 Manage Complaints
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard;