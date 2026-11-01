import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import ComplaintCard from "../../components/ComplaintCard";
import { useLanguage } from "../../context/LanguageContext";
import { getMyComplaints, deleteComplaintApi } from "../../services/complaintService";

function MyComplaints() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadComplaints = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyComplaints();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load your complaints");
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleDelete = async (id) => {
    const toDelete = complaints.find((c) => String(c._id || c.id) === String(id));
    const ticketName = toDelete?.complaintId || `#${id}`;

    try {
      await deleteComplaintApi(id);
      const updated = complaints.filter((c) => String(c._id || c.id) !== String(id));
      setComplaints(updated);
      alert(`Complaint ${ticketName} deleted successfully.`);
    } catch (e) {
      alert(e.message || `Could not delete complaint ${ticketName}`);
    }
  };

  // Filter complaints dynamically
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch =
        (c.complaintId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.issueType || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.address || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === "ALL" || c.status === selectedStatus;

      const matchesCategory =
        selectedCategory === "ALL" || c.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [complaints, searchTerm, selectedStatus, selectedCategory]);

  const statusCounts = useMemo(() => {
    return {
      ALL: complaints.length,
      REPORTED: complaints.filter((c) => c.status === "REPORTED").length,
      VIEWED: complaints.filter((c) => c.status === "VIEWED").length,
      IN_PROGRESS: complaints.filter((c) => c.status === "IN_PROGRESS").length,
      RESOLVED: complaints.filter((c) => c.status === "RESOLVED").length
    };
  }, [complaints]);

  return (
    <div>
      <Navbar />

      <div className="page-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div>
            <h1>{t("myComplaints")}</h1>
            <p style={{ margin: 0 }}>Track and monitor all civic issues you have reported.</p>
          </div>

          <button className="primary-btn" onClick={() => navigate("/report")}>
            {t("reportAnotherIssue")}
          </button>
        </div>

        {error && (
          <div style={{ padding: "12px", background: "#fef2f2", color: "#dc2626", borderRadius: "8px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {/* SEARCH & FILTER CONTROLS */}
        <div
          style={{
            background: "#ffffff",
            padding: "16px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
          }}
        >
          {/* Search Bar */}
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("searchPlaceholder")}
            style={{ margin: "0 0 12px", padding: "10px 14px", borderRadius: "8px" }}
          />

          {/* Status Tabs */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { key: "ALL", label: t("all") },
              { key: "REPORTED", label: t("reported") },
              { key: "VIEWED", label: t("viewed") },
              { key: "IN_PROGRESS", label: t("inProgress") },
              { key: "RESOLVED", label: t("resolved") }
            ].map((st) => (
              <button
                key={st.key}
                type="button"
                onClick={() => setSelectedStatus(st.key)}
                style={{
                  padding: "6px 12px",
                  fontSize: "12px",
                  borderRadius: "20px",
                  background: selectedStatus === st.key ? "#0f766e" : "#f1f5f9",
                  color: selectedStatus === st.key ? "#ffffff" : "#475569",
                  border: "none",
                  boxShadow: "none"
                }}
              >
                {st.label} ({statusCounts[st.key] || 0})
              </button>
            ))}
          </div>
        </div>

        {/* LOADING & LIST */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            <p>{t("loadingComplaints")}</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="empty-state">
            <h2>{t("noComplaintsFound")}</h2>
            <p>
              {complaints.length === 0
                ? t("noComplaintsYet")
                : t("emptyHelp")}
            </p>
            <button className="primary-btn" onClick={() => navigate("/report")} style={{ marginTop: "14px" }}>
              {t("reportNewIssue")}
            </button>
          </div>
        ) : (
          filteredComplaints.map((complaint) => (
            <ComplaintCard
              key={complaint._id || complaint.id}
              complaint={complaint}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default MyComplaints;