
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllAdminComplaints } from "../../services/complaintService";

const BACKEND_URL = "https://smart-civic-backend-e26w.onrender.com";

function getImageUrl(imagePath) {
  if (!imagePath) return "";

  if (/^(https?:\/\/|data:|blob:)/i.test(imagePath)) {
    return imagePath;
  }

  const cleanPath = imagePath.replace(/^\/+/, "");

  return `${BACKEND_URL}/${cleanPath.startsWith("uploads/")
    ? cleanPath
    : `uploads/${cleanPath}`}`;
}

function Complaints() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    getAllAdminComplaints()
      .then((data) => {
        if (isMounted) {
          setComplaints(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          try {
            const fallback =
              JSON.parse(localStorage.getItem("complaints")) || [];

            setComplaints(fallback);
          } catch {
            setComplaints([]);
          }

          setError(err.message || "Could not load complaints from the server.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <div className="admin-navbar">
        <h2>Complaint Management</h2>

        <button onClick={() => navigate("/admin/dashboard")}>
          Dashboard
        </button>
      </div>

      <div className="page-container">
        <h1>All Registered Complaints</h1>

        {error && (
          <p style={{ color: "#dc2626" }}>
            {error}
          </p>
        )}

        {loading ? (
          <p>Loading complaints from cloud database...</p>
        ) : complaints.length === 0 ? (
          <p>No complaints reported yet.</p>
        ) : (
          complaints.map((complaint) => {
            const imageUrl = getImageUrl(complaint.image);

            return (
              <div
                className="complaint-card"
                key={complaint._id || complaint.id}
              >
                <div>
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={complaint.issueType || "Civic complaint"}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                      style={{
                        width: "180px",
                        height: "130px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        marginBottom: "12px"
                      }}
                    />
                  )}

                  <h2>
                    {complaint.complaintId || `#${complaint.id}`}
                  </h2>

                  <p>
                    <strong>Citizen:</strong>{" "}
                    {complaint.citizen?.name || "Anonymous Citizen"}
                  </p>

                  <p>
                    <strong>Issue:</strong>{" "}
                    {complaint.issueType || complaint.category}
                  </p>

                  <p>
                    <strong>Category:</strong> {complaint.category}
                  </p>

                  <p>
                    <strong>Severity:</strong> {complaint.severity}
                  </p>

                  <p>
                    <strong>Status:</strong> {complaint.status}
                  </p>

                  {complaint.address && (
                    <p>
                      <strong>Location:</strong> {complaint.address}
                    </p>
                  )}

                  <button
                    onClick={() =>
                      navigate(
                        `/admin/complaints/${complaint._id || complaint.id}`
                      )
                    }
                  >
                    View Complaint
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Complaints;
