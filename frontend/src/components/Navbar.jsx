import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "./LanguageSelector";

function Navbar() {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();
  const { t } = useLanguage();

  const logout = () => {
    if (authLogout) {
      authLogout();
    }
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("complaints");

    navigate("/login");
  };

  return (
    <nav className="navbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div className="logo" onClick={() => navigate("/dashboard")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
        <span>🏛️</span>
        <span>{t("appName")}</span>
      </div>

      <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <button onClick={() => navigate("/dashboard")}>
          {t("home")}
        </button>

        <button onClick={() => navigate("/report")}>
          {t("reportIssue")}
        </button>

        <button onClick={() => navigate("/complaints")}>
          {t("myComplaints")}
        </button>

        <button onClick={() => navigate("/notifications")}>
          {t("notifications")}
        </button>

        <button onClick={() => navigate("/profile")}>
          {t("profile")}
        </button>

        {/* Multi-language Selector */}
        <LanguageSelector />

        <button onClick={logout} style={{ background: "#ef4444", color: "#ffffff", border: "none" }}>
          {t("logout")}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;