import { useLanguage } from "../context/LanguageContext";

function LanguageSelector({ style }) {
  const { language, setLanguage, availableLanguages } = useLanguage();

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: "rgba(255, 255, 255, 0.9)",
        padding: "4px 8px",
        borderRadius: "20px",
        border: "1px solid #cbd5e1",
        fontSize: "13px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        ...style
      }}
    >
      <span style={{ fontSize: "14px" }} title="Select Preferred Language">🌐</span>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={{
          border: "none",
          background: "transparent",
          fontSize: "13px",
          fontWeight: "600",
          color: "#0f766e",
          cursor: "pointer",
          outline: "none",
          padding: "2px 4px"
        }}
      >
        {availableLanguages.map((lang) => (
          <option key={lang.code} value={lang.code} style={{ color: "#0f172a" }}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageSelector;
