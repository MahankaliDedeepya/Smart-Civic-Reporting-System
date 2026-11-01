import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllAdminComplaints } from "../../services/complaintService";

function Complaints() {
  const navigate = useNavigate();
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

  return (
    <div>
      <div className="admin-navbar">
        <h2>Complaint Management</h2>
        <button onClick={() => navigate("/admin/dashboard")}>Dashboard</button>
      </div>

      <div className="page-container">
        <h1>All Registered Complaints</h1>

        {loading ? (
          <p>Loading complaints from cloud database...</p>
        ) : complaints.length === 0 ? (
          <p>No complaints reported yet.</p>
        ) : (
          complaints.map((complaint) => (
            <div className="complaint-card" key={complaint._id || complaint.id}>
              <div>
                <h2>{complaint.complaintId || `#${complaint.id}`}</h2>
                <p><strong>Citizen:</strong> {complaint.citizen?.name || "Anonymous Citizen"}</p>
                <p><strong>Issue:</strong> {complaint.issueType || complaint.category}</p>
                <p><strong>Category:</strong> {complaint.category}</p>
                <p><strong>Severity:</strong> {complaint.severity}</p>
                <p><strong>Status:</strong> {complaint.status}</p>

                <button
                  onClick={() =>
                    navigate(`/admin/complaints/${complaint._id || complaint.id}`)
                  }
                >
                  View Complaint
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Complaints;