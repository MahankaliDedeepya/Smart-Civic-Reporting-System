function Toast({ message, type = "success", onClose }) {
  if (!message) return null;

  const iconMap = {
    success: "✅",
    info: "ℹ️",
    warning: "⚠️",
    error: "❌"
  };

  return (
    <div className="toast-container">
      <div className="toast">
        <span>{iconMap[type] || "✨"}</span>
        <span>{message}</span>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            color: "#94a3b8",
            border: "none",
            padding: "0 0 0 8px",
            fontSize: "14px",
            boxShadow: "none",
            cursor: "pointer"
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default Toast;
