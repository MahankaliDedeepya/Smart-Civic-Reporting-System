function StatusTimeline({ history = [] }) {
  const stages = [
    { key: "REPORTED", label: "1. Complaint Reported", sub: "Logged & Dispatched via WhatsApp" },
    { key: "VIEWED", label: "2. Viewed by Officials", sub: "Officer Acknowledged Ticket" },
    { key: "IN_PROGRESS", label: "3. Action In Progress", sub: "Repair Crew Deployed" },
    { key: "RESOLVED", label: "4. Issue Resolved", sub: "Work Completed & Verified" }
  ];

  // Find latest completed status index
  const statusOrder = ["REPORTED", "VIEWED", "IN_PROGRESS", "RESOLVED"];
  const currentHistoryKeys = history.map((h) => h.status);
  
  let highestIndex = -1;
  statusOrder.forEach((st, idx) => {
    if (currentHistoryKeys.includes(st)) {
      highestIndex = idx;
    }
  });

  return (
    <div className="timeline">
      {stages.map((stage, idx) => {
        const record = history.find((item) => item.status === stage.key);
        const isCompleted = idx < highestIndex || (idx === highestIndex && stage.key === "RESOLVED");
        const isActive = idx === highestIndex && stage.key !== "RESOLVED";

        let itemClass = "timeline-item";
        if (isCompleted) itemClass += " completed";
        if (isActive) itemClass += " active";

        return (
          <div className={itemClass} key={stage.key}>
            <div className="timeline-icon">
              {isCompleted ? "✓" : isActive ? "●" : idx + 1}
            </div>

            <div className="timeline-content">
              <h3>{stage.label}</h3>
              <p style={{ fontSize: "12px", color: "#64748b" }}>{stage.sub}</p>

              {record && (
                <div style={{ marginTop: "4px" }}>
                  <p style={{ color: "#334155", fontWeight: "500" }}>{record.remark}</p>
                  <span className="timeline-date">
                    {new Date(record.date).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatusTimeline;