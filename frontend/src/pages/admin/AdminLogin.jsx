import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser({
        email: email.trim(),
        password
      });

      // Allow both ADMIN and STAFF roles
      if (data.user.role !== "ADMIN" && data.user.role !== "STAFF") {
        setError("This account is not authorized as a municipal official or staff member.");
        return;
      }

      login(data);

      navigate("/admin/dashboard");

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">

        <div className="login-icon">
          🏛️
        </div>

        <h1>Official & Staff Login</h1>

        <p style={{ fontWeight: "600", color: "#0f766e", marginBottom: "4px" }}>
          Municipal Grievance & Redressal Cell
        </p>

        <p>
          Secure access portal for Municipal Officials and Field Staff to review and resolve civic grievances.
        </p>

        {error && (
          <p
            style={{
              color: "#dc2626",
              fontWeight: "600",
              margin: "8px 0"
            }}
          >
            {error}
          </p>
        )}

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Official / Staff Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading
              ? "Signing in..."
              : "Official & Staff Login"}
          </button>

        </form>

        <div style={{ marginTop: "16px", padding: "10px", background: "#f8fafc", borderRadius: "8px", fontSize: "12px", color: "#64748b", textAlign: "left" }}>
          <p style={{ margin: "0 0 4px", fontWeight: "600", color: "#334155" }}>Demo Accounts:</p>
          <p style={{ margin: "2px 0" }}>• <strong>Admin:</strong> admin@smartcivic.com (Admin@12345)</p>
          <p style={{ margin: "2px 0" }}>• <strong>Staff:</strong> staff@smartcivic.com (Staff@12345)</p>
        </div>

        <div className="official-login">
          <button
            type="button"
            onClick={() => navigate("/login")}
          >
            ← Back to Citizen Login
          </button>
        </div>

      </div>
    </div>
  );
}

export default AdminLogin;