import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import LanguageSelector from "../../components/LanguageSelector";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await registerUser(form);

      // Store authentication information
      if (login) {
        login(data);
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      navigate("/dashboard");

    } catch (error) {
      setError(error.message);
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

        <div className="login-icon">
          📝
        </div>

        <h1>{t("createAccount")}</h1>

        <p>
          {t("subTagline")}
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

        <form onSubmit={handleRegister}>

          <input
            name="name"
            placeholder={t("fullNamePlaceholder")}
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="phone"
            placeholder={t("phonePlaceholder")}
            value={form.phone}
            onChange={handleChange}
            required
          />

          <input
            name="address"
            placeholder={t("addressPlaceholder")}
            value={form.address}
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder={t("passwordPlaceholder")}
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : t("createAccount")}
          </button>

        </form>

        <p style={{ margin: "16px 0 6px" }}>
          Already have an account?
        </p>

        <button
          type="button"
          onClick={() => navigate("/login")}
        >
          {t("backToLogin")}
        </button>

      </div>
    </div>
  );
}

export default Register;