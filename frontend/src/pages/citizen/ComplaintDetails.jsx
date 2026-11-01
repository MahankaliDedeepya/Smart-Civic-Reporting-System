import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import StatusTimeline from "../../components/StatusTimeline";
import Toast from "../../components/Toast";
import { getComplaintById, deleteComplaintApi } from "../../services/complaintService";

function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [showImage, setShowImage] = useState(false);
  const [customRemark, setCustomRemark] = useState("");
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  const loadComplaint = async () => {
    try {
      const data = await getComplaintById(id);
      setComplaint(data);
    } catch (err) {
      const complaints = JSON.parse(localStorage.getItem("complaints")) || [];
      const found = complaints.find((c) => String(c._id || c.id) === String(id));
      setComplaint(found || null);
    }
  };

  const simulateOfficialAction = (newStatus) => {
    if (!complaint) return;

    const complaints = JSON.parse(localStorage.getItem("complaints")) || [];
    const index = complaints.findIndex((c) => String(c.id) === String(id));

    if (index === -1) return;

    const defaultRemarks = {
      VIEWED: "Ward Inspector reviewed grievance alert on official phone.",
      IN_PROGRESS: "Road crew dispatched with cold mix asphalt and safety cones.",
      RESOLVED: "Physical repair completed on site and verified by Municipal Engineer."
    };

    const finalRemark = customRemark.trim() || defaultRemarks[newStatus] || `Status updated to ${newStatus}.`;

    const updated = { ...complaints[index] };
    updated.status = newStatus;
    updated.history = [
      ...(updated.history || []),
      {
        status: newStatus,
        date: new Date().toISOString(),
        remark: finalRemark
      }
    ];

    complaints[index] = updated;
    localStorage.setItem("complaints", JSON.stringify(complaints));
    setComplaint(updated);
    setCustomRemark("");

    showToast(`⚡ Official action simulated: Marked as ${newStatus.replace("_", " ")}!`, "success");
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("🔗 Grievance tracking link copied to clipboard!", "info");
  };

  const submitRating = (stars) => {
    setRating(stars);
    setRatingSubmitted(true);
    showToast(`⭐ Thank you for rating municipal resolution: ${stars} Stars!`, "success");
  };

  const handleDeleteComplaint = async () => {
    const ticketId = complaint._id || complaint.id || id;
    const ticketName = complaint.complaintId || `#${ticketId}`;
    const confirmed = window.confirm(
      `Are you sure you want to delete complaint ${ticketName}?\n\nThis will permanently remove the complaint and cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteComplaintApi(ticketId);
    } catch (err) {
      // offline / standalone fallback
    }

    // Delete from localStorage if present
    const complaints = JSON.parse(localStorage.getItem("complaints")) || [];
    const filtered = complaints.filter((c) => String(c._id || c.id) !== String(ticketId));
    localStorage.setItem("complaints", JSON.stringify(filtered));

    alert(`Complaint ${ticketName} deleted successfully.`);
    navigate("/complaints");
  };

  if (!complaint) {
    return (
      <div>
        <Navbar />
        <div className="page-container" style={{ textAlign: "center", padding: "60px 20px" }}>
          <h2>Complaint Not Found</h2>
          <p>We couldn't locate this ticket in your local storage.</p>
          <button className="primary-btn" onClick={() => navigate("/complaints")}>
            Back to My Complaints
          </button>
        </div>
      </div>
    );
  }

  const statusClass = {
    REPORTED: "status-reported",
    VIEWED: "status-viewed",
    IN_PROGRESS: "status-in_progress",
    RESOLVED: "status-resolved"
  }[complaint.status] || "status-reported";

  const isResolved = complaint.status === "RESOLVED";
  const imageUrl = complaint?.image
  ? /^(https?:\/\/|data:|blob:)/i.test(complaint.image)
    ? complaint.image
    : `https://smart-civic-backend-e26w.onrender.com/${complaint.image.replace(/^\/+/, "")}`
  : "";

  return (
    <div>
      <Navbar />

      <div className="details-container">
        {/* CELEBRATION BANNER FOR RESOLVED ISSUES */}
        {isResolved && (
          <div
            style={{
              background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
              border: "1.5px solid #10b981",
              borderRadius: "14px",
              padding: "16px 20px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px"
            }}
          >
            <div>
              <h3 style={{ color: "#065f46", fontSize: "16px", margin: 0 }}>
                🎉 Issue Successfully Resolved!
              </h3>
              <p style={{ color: "#047857", fontSize: "12px", margin: "2px 0 0" }}>
                Verified on-site by municipal field engineers.
              </p>
            </div>
            <button className="primary-btn" style={{ padding: "6px 14px", fontSize: "12px" }} onClick={copyShareLink}>
              📤 Share Resolution
            </button>
          </div>
        )}

        {/* HEADER */}
        <div className="details-header">
          <div>
            <h1 style={{ fontSize: "24px", color: "#042f2e" }}>
              Ticket #{complaint.complaintId || `CIV-${complaint.id}`}
            </h1>
            <p style={{ color: "#64748b", fontSize: "13px", marginTop: "2px" }}>
              Live Citizen-Side Grievance Redressal Tracker
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button className="outline-btn" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={copyShareLink}>
              🔗 Share
            </button>
            <button
              className="outline-btn"
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                borderColor: "#ef4444",
                color: "#dc2626"
              }}
              onClick={handleDeleteComplaint}
            >
              🗑️ Delete
            </button>
            <span className={`status-badge ${statusClass}`}>
              ● {complaint.status?.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* CLICKABLE IMAGE PREVIEW */}
{imageUrl && (
  <img
    className="detail-image"
    src={imageUrl}
    alt={complaint.issueType || "Civic Issue"}
    onClick={() => setShowImage(true)}
    style={{
      cursor: "zoom-in",
      maxWidth: "100%"
    }}
  />
)}

{/* FULL-SIZE IMAGE POPUP */}
{showImage && (
  <div
    onClick={() => setShowImage(false)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.9)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      padding: "20px"
    }}
  >
    <button
      onClick={() => setShowImage(false)}
      style={{
        position: "absolute",
        top: "20px",
        right: "25px",
        background: "#ffffff",
        color: "#000000",
        border: "none",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        fontSize: "24px",
        cursor: "pointer"
      }}
    >
      ×
    </button>

    <img
      src={imageUrl}
      alt="Full Complaint Image"
      onClick={(e) => e.stopPropagation()}
      style={{
        maxWidth: "95%",
        maxHeight: "90vh",
        objectFit: "contain",
        borderRadius: "10px"
      }}
    />
  </div>
)}

        {/* DETAILS GRID */}
        <div className="detail-box">
          <div>
            <p><strong>Category:</strong> {complaint.category}</p>
            <p><strong>Problem:</strong> {complaint.issueType}</p>
            <p>
              <strong>Severity:</strong>{" "}
              <span style={{ fontWeight: "700", color: complaint.severity === "Critical" ? "#dc2626" : "#0d9488" }}>
                {complaint.severity}
              </span>
            </p>
            <p><strong>Department:</strong> {complaint.department}</p>
          </div>

          <div>
            <p><strong>Location:</strong> {complaint.address || "GPS Location"}</p>
            {complaint.mapsUrl && (
              <p>
                <a
                  href={complaint.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#0f766e", fontWeight: "600" }}
                >
                  📍 Open in Google Maps ↗
                </a>
              </p>
            )}
            <p><strong>Officer Phone:</strong> {complaint.officerPhone || "+91 98765 43210"}</p>
            <p><strong>Official Email:</strong> {complaint.officialEmail || "roads@municipality.gov.in"}</p>
          </div>
        </div>

        {/* AI DESCRIPTION */}
        {complaint.description && (
          <div
            style={{
              background: "#f0fdfa",
              border: "1px solid #ccfbf1",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px",
              fontSize: "13px"
            }}
          >
            <p style={{ fontWeight: "700", color: "#0f766e", marginBottom: "4px" }}>
              🤖 AI Problem Diagnosis & Hazard Assessment
            </p>
            <p style={{ color: "#334155", lineHeight: "1.6" }}>{complaint.description}</p>
          </div>
        )}

        {/* LIVE 4-STAGE TIMELINE */}
        <h2 style={{ fontSize: "18px", color: "#042f2e", marginBottom: "14px" }}>
          Live Citizen Redressal Timeline
        </h2>

        <StatusTimeline history={complaint.history} />

        {/* OFFICIAL ACTION SIMULATOR */}
        <div className="simulator-card">
          

          <input
            value={customRemark}
            onChange={(e) => setCustomRemark(e.target.value)}
            placeholder="Optional custom remark (e.g. Patching truck deployed to MG Road)"
            style={{ margin: "4px 0 12px", fontSize: "13px" }}
          />

          <div className="simulator-buttons">
            <button
              className="simulator-btn sim-viewed"
              onClick={() => simulateOfficialAction("VIEWED")}
            >
              👁️ Simulate: Official Marks as Viewed
            </button>
            <button
              className="simulator-btn sim-progress"
              onClick={() => simulateOfficialAction("IN_PROGRESS")}
            >
              ⚙️ Simulate: Official Marks In Progress
            </button>
            <button
              className="simulator-btn sim-resolved"
              onClick={() => simulateOfficialAction("RESOLVED")}
            >
              ✅ Simulate: Official Marks Resolved
            </button>
          </div>
        </div>

        {/* CITIZEN STAR RATING FEEDBACK (ACTIVE WHEN RESOLVED) */}
        {isResolved && (
          <div
            style={{
              marginTop: "24px",
              padding: "20px",
              background: "#ffffff",
              border: "1.5px solid #a7f3d0",
              borderRadius: "14px",
              textAlign: "center"
            }}
          >
            <h4 style={{ color: "#065f46", fontSize: "16px", marginBottom: "6px" }}>
              Rate Municipal Resolution Quality
            </h4>
            <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "12px" }}>
              How satisfied are you with the timeliness and quality of this civic repair?
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "8px", fontSize: "28px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{
                    cursor: "pointer",
                    color: star <= rating ? "#f59e0b" : "#cbd5e1",
                    transition: "transform 0.1s"
                  }}
                  onClick={() => submitRating(star)}
                >
                  ★
                </span>
              ))}
            </div>

            {ratingSubmitted && (
              <p style={{ color: "#059669", fontSize: "13px", fontWeight: "600", marginTop: "10px" }}>
                ✓ Thank you! Your feedback has been recorded in municipal analytics.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false })} />}
    </div>
  );
}

export default ComplaintDetails;