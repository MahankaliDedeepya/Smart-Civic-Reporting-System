
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getComplaintById,
  updateComplaintStatusApi
} from "../../services/complaintService";

function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showImage, setShowImage] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getComplaintById(id);
      setComplaint(data);
    } catch (err) {
      const complaints =
        JSON.parse(localStorage.getItem("complaints")) || [];

      const fallback = complaints.find(
        (c) => String(c._id || c.id) === String(id)
      );

      if (fallback) {
        setComplaint(fallback);
      } else {
        setError(err.message || "Complaint not found");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      await updateComplaintStatusApi(
        id,
        newStatus,
        `Status updated to ${newStatus} by Administrator.`
      );

      alert(`Complaint status changed to ${newStatus}`);
      loadData();
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  // Construct image URL
  const imagePath = complaint?.image || "";

  const imageUrl = imagePath
    ? /^(https?:\/\/|data:|blob:)/i.test(imagePath)
      ? imagePath
      : `https://smart-civic-backend-e26w.onrender.com/${
          imagePath.replace(/^\/+/, "").startsWith("uploads/")
            ? imagePath.replace(/^\/+/, "")
            : `uploads/${imagePath.replace(/^\/+/, "")}`
        }`
    : "";

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Loading complaint details...</h2>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Complaint not found</h2>
        <p>{error}</p>

        <button onClick={() => navigate("/admin/complaints")}>
          Back to Complaints
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-navbar">
        <h2>
          Complaint #{complaint.complaintId || `#${complaint.id}`}
        </h2>

        <button onClick={() => navigate("/admin/complaints")}>
          Back to List
        </button>
      </div>

      <div className="page-container">
        <div
          className="card"
          style={{
            background: "#ffffff",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0"
          }}
        >
          <h2>{complaint.issueType || complaint.category}</h2>

          <p>
            <strong>Citizen Name:</strong>{" "}
            {complaint.citizen?.name || "Anonymous Citizen"}
          </p>

          <p>
            <strong>Citizen Email:</strong>{" "}
            {complaint.citizen?.email || "N/A"}
          </p>

          <p>
            <strong>Citizen Phone:</strong>{" "}
            {complaint.citizen?.phone || "N/A"}
          </p>

          <p>
            <strong>Category:</strong> {complaint.category}
          </p>

          <p>
            <strong>Severity:</strong> {complaint.severity}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            <span style={{ fontWeight: "bold", color: "#0f766e" }}>
              {complaint.status}
            </span>
          </p>

          <p>
            <strong>Location:</strong>{" "}
            {complaint.address ||
              `${complaint.latitude}, ${complaint.longitude}`}
          </p>

          <p>
            <strong>Description:</strong> {complaint.description}
          </p>

          {/* Complaint Image */}
          {imageUrl && (
            <div style={{ margin: "16px 0" }}>
              <img
                src={imageUrl}
                alt="Civic Issue"
                onClick={() => setShowImage(true)}
                style={{
                  maxWidth: "100%",
                  maxHeight: "320px",
                  borderRadius: "8px",
                  objectFit: "cover",
                  cursor: "zoom-in"
                }}
              />
            </div>
          )}

          {/* Full Size Image Popup */}
          {showImage && imageUrl && (
            <div
              onClick={() => setShowImage(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.9)",
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
                  background: "white",
                  color: "black",
                  border: "none",
                  borderRadius: "50%",
                  width: "42px",
                  height: "42px",
                  fontSize: "28px",
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

          {/* Update Complaint Status */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px",
              flexWrap: "wrap"
            }}
          >
            <button
              onClick={() => updateStatus("IN_PROGRESS")}
              style={{
                padding: "8px 16px",
                background: "#f59e0b",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Mark In Progress
            </button>

            <button
              onClick={() => updateStatus("RESOLVED")}
              style={{
                padding: "8px 16px",
                background: "#10b981",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Mark Resolved
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintDetails;
