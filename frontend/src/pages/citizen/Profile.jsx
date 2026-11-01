import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";

function Profile() {
  const { user } = useAuth();

  return (
    <div>
      <Navbar />

      <div className="page-container">
        <h1>My Profile</h1>

        <div className="profile-card">
          <div className="profile-icon">👤</div>

          <h2>{user?.name || "Citizen"}</h2>

          <p>
            <strong>Role:</strong> {user?.role || "CITIZEN"}
          </p>

          <p>
            <strong>Email:</strong> {user?.email || "Not available"}
          </p>

          <p>
            <strong>Account Status:</strong> Active & Verified
          </p>
        </div>
      </div>
    </div>
  );
}

export default Profile;