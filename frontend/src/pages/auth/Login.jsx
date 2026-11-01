import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, resetPasswordUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import LanguageSelector from "../../components/LanguageSelector";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await loginUser({
        email: email.trim(),
        password
      });

      // Synchronize auth state
      if (login) {
        login(data);
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Route by role
      if (data.user.role === "CITIZEN") {
        navigate("/dashboard");
      } else if (data.user.role === "ADMIN" || data.user.role === "STAFF") {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await resetPasswordUser({
        email: email.trim(),
        newPassword
      });
      setSuccess(res.message || "Password updated! You can now login.");
      setPassword(newPassword);
      setIsResetMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        {/* Language selector in top bar of the card */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
          <LanguageSelector />
        </div>

        <div className="login-icon">🏙️</div>

        <h1>{t("appName")}</h1>

        <p style={{ fontWeight: "600", color: "#0f766e", marginBottom: "4px" }}>
          {t("tagline")}
        </p>

        <p>
          {isResetMode
            ? t("resetPasswordTitle")
            : t("subTagline")}
        </p>

        {error && (
          <p style={{ color: "#dc2626", fontWeight: "600", margin: "8px 0" }}>
            {error}
          </p>
        )}

        {success && (
          <p style={{ color: "#0f766e", fontWeight: "600", margin: "8px 0" }}>
            {success}
          </p>
        )}

        {!isResetMode ? (
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder={t("passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? t("loggingIn") : t("loginBtn")}
            </button>

            <button
              type="button"
              className="outline-btn"
              style={{
                marginTop: "10px",
                width: "100%",
                background: "transparent",
                border: "none",
                color: "#0f766e",
                cursor: "pointer",
                fontSize: "13px",
                textDecoration: "underline"
              }}
              onClick={() => {
                setIsResetMode(true);
                setError("");
                setSuccess("");
              }}
            >
              {t("forgotPassword")}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <input
              type="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder={t("newPasswordPlaceholder")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : t("saveNewPassword")}
            </button>

            <button
              type="button"
              style={{
                marginTop: "10px",
                width: "100%",
                background: "#f1f5f9",
                color: "#334155"
              }}
              onClick={() => {
                setIsResetMode(false);
                setError("");
              }}
            >
              ← {t("backToLogin")}
            </button>
          </form>
        )}

        {!isResetMode && (
          <>
            <p style={{ margin: "16px 0 6px" }}>Don't have an account?</p>

            <button type="button" onClick={() => navigate("/register")}>
              {t("createAccount")}
            </button>

            <div className="official-login">
              <p>Municipal Official or Staff Member?</p>
              <button type="button" onClick={() => navigate("/admin/login")}>
                🏛️ {t("officialStaffLogin")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;