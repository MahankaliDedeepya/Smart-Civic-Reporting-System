
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function ComplaintCard({ complaint, onDelete }) {
  const navigate = useNavigate();
  const [showImage, setShowImage] = useState(false);

  // Create the correct image URL
  const imagePath = complaint.image || "";

  const imageUrl = imagePath
    ? /^(https?:\/\/|data:|blob:)/i.test(imagePath)
      ? imagePath
      : `https://smart-civic-backend-e26w.onrender.com/${
          imagePath.replace(/^\/+/, "").startsWith("uploads/")
            ? imagePath.replace(/^\/+/, "")
            : `uploads/${imagePath.replace(/^\/+/, "")}`
        }`
    : "";

  const statusClass = {
    REPORTED: "status-reported",
    VIEWED: "status-viewed",
    IN_PROGRESS: "status-in_progress",
    RESOLVED: "status-resolved"
  }[complaint.status] || "status-reported";

  const handleDelete = (e) => {
    e.stopPropagation();

    const ticketId = complaint._id || complaint.id;
    const ticketName = complaint.complaintId || `#${ticketId}`;

    const confirmed = window.confirm(
      `Are you sure you want to delete complaint ${ticketName}?`
    );

    if (confirmed && onDelete) {
      onDelete(ticketId);
    }
  };

  return (
    <div className="complaint-card">

      {/* Complaint Image */}
      <div className="complaint-image">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={complaint.issueType || "Civic Issue"}
            onClick={() => setShowImage(true)}
            style={{
              cursor: "zoom-in",
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#e6f4f1",
              fontSize: "24px"
            }}
          >
            🏛️
          </div>
        )}
      </div>

      {/* Complaint Information */}
      <div className="complaint-info">

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start"
        }}>
          <div>
            <h3 style={{ margin: "0 0 4px" }}>
              #{complaint.complaintId || `CIV-${complaint.id}`}
            </h3>

            <p style={{
              fontWeight: "600",
              color: "#0f2d29",
              margin: "0 0 6px"
            }}>
              {complaint.issueType || complaint.category}
            </p>
          </div>

          <span className={`status-badge ${statusClass}`}>
            ● {complaint.status?.replace("_", " ")}
          </span>
        </div>

        <p style={{
          fontSize: "12px",
          color: "#64748b",
          margin: "2px 0"
        }}>
          <strong>Category:</strong> {complaint.category} &bull;{" "}
          <strong>Severity:</strong>{" "}
          <span style={{
            color: complaint.severity === "Critical"
              ? "#dc2626"
              : "#0d9488",
            fontWeight: "600"
          }}>
            {complaint.severity}
          </span>
        </p>

        {complaint.address && (
          <p style={{
            fontSize: "12px",
            color: "#475569",
            margin: "3px 0 10px"
          }}>
            📍 {complaint.address}
          </p>
        )}

        <div style={{
          display: "flex",
          gap: "8px",
          alignItems: "center"
        }}>
          <button
            className="primary-btn"
            style={{ padding: "7px 14px", fontSize: "13px" }}
            onClick={() =>
              navigate(`/complaints/${complaint._id || complaint.id}`)
            }
          >
            📡 Track Live Progress ➔
          </button>

          {onDelete && (
            <button
              type="button"
              className="outline-btn"
              style={{
                padding: "7px 12px",
                fontSize: "13px",
                borderColor: "#ef4444",
                color: "#dc2626"
              }}
              onClick={handleDelete}
              title="Delete Complaint"
            >
              🗑️ Delete
            </button>
          )}
        </div>
      </div>

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
              fontSize: "30px",
              background: "white",
              color: "black",
              border: "none",
              borderRadius: "50%",
              width: "42px",
              height: "42px",
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

    </div>
  );
}

export default ComplaintCard;
