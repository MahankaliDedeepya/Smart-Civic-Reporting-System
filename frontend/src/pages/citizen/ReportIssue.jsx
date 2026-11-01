import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Toast from "../../components/Toast";
import { useAuth } from "../../context/AuthContext";

function ReportIssue() {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  // State
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepText, setScanStepText] = useState("");
  const [confidenceScore, setConfidenceScore] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [location, setLocation] = useState({
    latitude: 17.4399,
    longitude: 78.4983,
    address: "MG Road near City Central Park, Ward 12",
    mapsUrl: "https://www.google.com/maps?q=17.4399,78.4983"
  });

  const [analysis, setAnalysis] = useState({
    category: "",
    issueType: "",
    description: "",
    severity: "High",
    department: "",
    officialEmail: "",
    officerPhone: "+919876543210"
  });

  const [citizen, setCitizen] = useState({
    name: "Concerned Citizen",
    contact: "+91 98765 43210"
  });

  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Video / Leaflet Refs
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  // Initialize Leaflet Map once DOM is ready
  useEffect(() => {
    if (window.L && !mapRef.current) {
      const initialLat = location.latitude || 17.4399;
      const initialLon = location.longitude || 78.4983;

      const map = window.L.map("mapContainer").setView([initialLat, initialLon], 15);
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
      }).addTo(map);

      const marker = window.L.marker([initialLat, initialLon], { draggable: true }).addTo(map);

      marker.on("dragend", async (e) => {
        const { lat, lng } = e.target.getLatLng();
        updateLocationFromCoords(lat, lng);
      });

      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        updateLocationFromCoords(lat, lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
    }
  }, []);

  const updateLocationFromCoords = async (lat, lon) => {
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
    let address = `Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`;

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const data = await res.json();
      if (data.display_name) address = data.display_name;
    } catch (e) {}

    setLocation({ latitude: lat, longitude: lon, address, mapsUrl });
    showToast(`📍 Location pinned: ${address.slice(0, 35)}...`, "info");
  };

  // Camera Handlers
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      showToast("Camera access denied or unavailable on this device", "warning");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg");
    setPreview(dataUrl);
    setImage(dataUrl);
    stopCamera();
    showToast("📸 Photo snapped successfully!", "success");
    triggerAiScan(dataUrl);
  };

  // Image Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
    triggerAiScan(file);
  };

  // AI Vision Scanner Trigger
  
const triggerAiScan = async (imageSource) => {
  setIsScanning(true);
  setScanStepText("Sending image to AI...");
  setConfidenceScore(null);

  try {
    let file;

    if (imageSource instanceof File) {
      file = imageSource;
    } else {
      const imageResponse = await fetch(imageSource);

      if (!imageResponse.ok) {
        throw new Error("Could not read the selected image.");
      }

      const blob = await imageResponse.blob();
      file = new File([blob], "civic-issue.jpg", {
        type: blob.type || "image/jpeg"
      });
    }

    const formData = new FormData();
    formData.append("image", file);

    setScanStepText("Gemini is analyzing the photo...");

    const response = await fetch(
      "https://smart-civic-backend-e26w.onrender.com/api/ai/analyze",
      {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(60000)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "AI analysis failed.");
    }

    if (!data.description || !data.category) {
      throw new Error("AI returned no description. Please try again.");
    }

    setAnalysis(previous => ({
      ...previous,
      category: data.category,
      issueType: data.issueType || "Civic issue detected",
      description: data.description,
      severity: ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(data.severity)
        ? data.severity.charAt(0) + data.severity.slice(1).toLowerCase()
        : "Medium",
      department: data.department || "Municipal Grievance Department"
    }));

    showToast("Image analysis completed!", "success");

  } catch (error) {
    console.error("AI analysis error:", error);

    const message = error.name === "TimeoutError" ||
      error.name === "AbortError"
      ? "Analysis took too long. Please try a smaller image."
      : error.message || "AI analysis failed.";

    showToast(message, "error");

  } finally {
    setIsScanning(false);
    setScanStepText("");
  }
};




  // Auto-Detect GPS
  const detectGps = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser.", "error");
      return;
    }

    showToast("🛰️ Contacting GPS satellites...", "info");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([latitude, longitude], 16);
          markerRef.current.setLatLng([latitude, longitude]);
        }
        await updateLocationFromCoords(latitude, longitude);
        showToast("🛰️ GPS Coordinates & Street Address Locked!", "success");
      },
      () => {
        showToast("GPS permission denied. Click on the map to set location.", "warning");
      }
    );
  };

  // WhatsApp Alert Formatter
  const getWhatsAppAlertText = () => {
    return `🚨 *MUNICIPAL GRIEVANCE DISPATCH* 🚨
━━━━━━━━━━━━━━━━━━━━
*Ticket ID:* #CIV-2026-PENDING
*Urgency:* ${(analysis.severity || "HIGH").toUpperCase()}
*Category:* ${analysis.category || "Roads"}
*Department:* ${analysis.department || "Municipal Roads Dept"}

*Issue:* ${analysis.issueType || "Civic Grievance"}
*Hazard:* ${analysis.description || "Hazard reported by citizen"}

📍 *Location:*
${location.address}
*Google Maps:* ${location.mapsUrl}

👤 *Citizen:* ${citizen.name} (${citizen.contact})
🕒 *Reported:* ${new Date().toLocaleTimeString()}

🔗 *Citizen Live Tracker:*
${window.location.origin}/complaints/live

⚡ *OFFICIAL ACTIONS:*
• Mark as Viewed / In-Progress / Resolved directly from the citizen tracking portal.
━━━━━━━━━━━━━━━━━━━━
_Dispatched via Smart Civic Reporter_`;
  };

  // Submit Complaint
  const submitComplaint = async () => {
  if (!preview) {
    showToast("Please snap or upload a photo first.", "warning");
    return;
  }

  if (!analysis.category) {
    showToast("Please run AI analysis first.", "warning");
    return;
  }

  if (!token) {
    showToast("Please login before submitting a complaint.", "warning");
    navigate("/login");
    return;
  }

  try {
    showToast("Submitting complaint...", "info");

    const formData = new FormData();

    // Convert the selected image into a File
    let imageFile;

    if (image instanceof File) {
      // Normal uploaded image
      imageFile = image;
    } else if (typeof image === "string") {
      // Camera image or sample image
      const response = await fetch(image);
      const blob = await response.blob();

      imageFile = new File(
        [blob],
        "civic-issue.jpg",
        {
          type: blob.type || "image/jpeg"
        }
      );
    }

    if (imageFile) {
      formData.append("image", imageFile);
    }

    // Complaint information
    formData.append("category", analysis.category);
    formData.append("issueType", analysis.issueType || "");
    formData.append("description", analysis.description || "");
    formData.append("aiDescription", analysis.description || "");
    formData.append(
      "severity",
      (analysis.severity || "MEDIUM").toUpperCase()
    );

    // Location
    formData.append(
      "latitude",
      String(location.latitude)
    );

    formData.append(
      "longitude",
      String(location.longitude)
    );

    formData.append(
      "address",
      location.address || ""
    );

    // Department
    formData.append(
      "department",
      analysis.department || ""
    );

    // Send complaint to backend
    const response = await fetch(
      "https://smart-civic-backend-e26w.onrender.com/api/complaints",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`
        },

        body: formData
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to submit complaint"
      );
    }

    console.log(
      "Complaint created:",
      data.complaint
    );

    // Use the real MongoDB complaint
    setSubmittedTicket({
      ...data.complaint,

      // Keep these frontend-only values
      mapsUrl:
        `https://www.google.com/maps?q=${data.complaint.latitude},${data.complaint.longitude}`,

      officialEmail:
        analysis.officialEmail || "",

      officerPhone:
        analysis.officerPhone || ""
    });

    setShowSuccessModal(true);

    showToast(
      `Complaint ${data.complaint.complaintId} submitted successfully!`,
      "success"
    );

  } catch (error) {

    console.error(
      "Complaint submission error:",
      error
    );

    showToast(
      error.message ||
        "Could not submit complaint.",
      "error"
    );
  }
};

  const categories = [
    { label: "Roads & Potholes", value: "Roads", icon: "🚧" },
    { label: "Garbage & Waste", value: "Garbage", icon: "🗑️" },
    { label: "Water Leakage", value: "Water", icon: "💧" },
    { label: "Streetlights", value: "Electricity", icon: "💡" },
    { label: "Drainage", value: "Drainage", icon: "🌊" },
    { label: "Public Safety", value: "Safety", icon: "⚠️" }
  ];

  return (
    <div>
      <Navbar />

      <div className="form-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h1>Report Civic Issue</h1>
            <p>Smart inspection with AI vision and interactive GPS map.</p>
          </div>
          <span className="confidence-pill">
            🤖 AI Vision 2.0 Active
          </span>
        </div>

        {/* STEP 1: PHOTO & CAMERA */}
        <div className="form-section">
          <h2>📷 1. Photo Capture & Inspection</h2>

          {/* Camera Buttons */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "14px" }}>
            <label
              className="outline-btn"
              style={{
                margin: 0,
                cursor: "pointer",
                background: "transparent",
                boxShadow: "none"
              }}
            >
              📁 Browse Photo
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
            </label>

            {!isCameraActive ? (
              <button type="button" className="outline-btn" onClick={startCamera}>
                📸 Open Live Camera
              </button>
            ) : (
              <button type="button" className="danger-btn" onClick={stopCamera}>
                ❌ Stop Camera
              </button>
            )}
          </div>

          {/* Live Video Stream Viewfinder */}
          {isCameraActive && (
            <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", background: "#000", marginBottom: "16px" }}>
              <video ref={videoRef} autoPlay playsInline style={{ width: "100%", height: "280px", objectFit: "cover" }} />
              <button
                type="button"
                onClick={capturePhoto}
                style={{
                  position: "absolute",
                  bottom: "16px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  border: "4px solid #0f766e",
                  padding: 0,
                  boxShadow: "0 0 15px rgba(0,0,0,0.5)"
                }}
              >
                ⚪
              </button>
            </div>
          )}

          {/* Preview & Laser Scanner */}
          {preview && !isCameraActive && (
            <div className="scanner-viewport">
              <img src={preview} alt="Civic Issue Preview" />
              {isScanning && (
                <>
                  <div className="scan-laser-line" />
                  <div className="scan-hud-overlay">
                    <div>SCANNING IN PROGRESS // BANDWIDTH 50FPS</div>
                    <div style={{ background: "rgba(4,47,46,0.85)", padding: "4px 8px", borderRadius: "4px", width: "fit-content" }}>
                      {scanStepText}
                    </div>
                    <div>COORDINATES: {location.latitude.toFixed(2)}N, {location.longitude.toFixed(2)}E</div>
                  </div>
                </>
              )}
            </div>
          )}

          {preview && !isScanning && (
            <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button type="button" className="primary-btn" onClick={() => triggerAiScan(preview)}>
                ✨ Re-Analyze with AI
              </button>
              {confidenceScore && (
                <span className="confidence-pill">
                  🎯 AI Confidence: {confidenceScore}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* STEP 2: INTERACTIVE LOCATION & MAP */}
        <div className="form-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>📍 2. Interactive GPS Location</h2>
            <button type="button" className="primary-btn" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={detectGps}>
              🛰️ Auto-Detect GPS
            </button>
          </div>

          <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 10px" }}>
            Drag the pin on the map or click anywhere to pinpoint the exact pothole / waste spot:
          </p>

          <div id="mapContainer" />

          <div style={{ marginTop: "12px" }}>
            <label>Street Address / Nearest Landmark</label>
            <input
              value={location.address}
              onChange={(e) => setLocation({ ...location, address: e.target.value })}
              placeholder="e.g. Near City Park Gate, MG Road"
            />
          </div>
        </div>

        {/* STEP 3: AI DIAGNOSIS & INTERACTIVE CHIPS */}
        <div className="form-section">
          <h2>🤖 3. AI Diagnosis & Department Routing</h2>

          <label>Category (Click to switch)</label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", margin: "8px 0 16px" }}>
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setAnalysis({ ...analysis, category: cat.value })}
                style={{
                  background: analysis.category === cat.value ? "#0f766e" : "#ffffff",
                  color: analysis.category === cat.value ? "#ffffff" : "#334155",
                  border: `1.5px solid ${analysis.category === cat.value ? "#0f766e" : "#cbd5e1"}`,
                  padding: "7px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  boxShadow: "none"
                }}
              >
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>

          <label>Problem Title</label>
          <input
            value={analysis.issueType}
            onChange={(e) => setAnalysis({ ...analysis, issueType: e.target.value })}
            placeholder="e.g. Severe Asphalt Pothole"
          />

          <label>Hazard & Risk Description</label>
          <textarea
            value={analysis.description}
            onChange={(e) => setAnalysis({ ...analysis, description: e.target.value })}
            placeholder="AI will describe the problem..."
          />

          <label>Urgency Level</label>
          <div className="severity-selector">
            {["Low", "Medium", "High", "Critical"].map((sev) => (
              <div
                key={sev}
                className={`severity-chip ${analysis.severity === sev ? `active-${sev.toLowerCase()}` : ""}`}
                onClick={() => setAnalysis({ ...analysis, severity: sev })}
              >
                ● {sev} Urgency
              </div>
            ))}
          </div>

          <div style={{ background: "#f0fdfa", border: "1px solid #ccfbf1", padding: "12px", borderRadius: "10px", fontSize: "13px" }}>
            <p><strong>Department:</strong> {analysis.department || "Municipal Works Division"}</p>
            <p><strong>Official Email:</strong> {analysis.officialEmail || "roads@municipality.gov.in"}</p>
            <p><strong>Ward Officer Phone:</strong> {analysis.officerPhone}</p>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button className="submit-btn" onClick={submitComplaint}>
          🚀 Submit Complaint
        </button>
      </div>

      {/* POST-SUBMISSION MODAL */}
      {showSuccessModal && submittedTicket && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(4, 47, 46, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px"
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "34px",
              maxWidth: "460px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 25px 50px rgba(0,0,0,0.25)"
            }}
          >
            <div style={{ fontSize: "52px", marginBottom: "8px" }}>🎉</div>

            <span className="status-badge status-reported">
              Complaint Registered
            </span>

            <h2 style={{ fontSize: "24px", margin: "14px 0 6px", color: "#042f2e" }}>
              #{submittedTicket.complaintId}
            </h2>

            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "22px" }}>
              Grievance logged into municipal registry. You can track your complaint progress below.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              
              <button
                className="primary-btn"
                onClick={() => navigate(`/complaints/${submittedTicket._id}`)}
                style={{ padding: "13px", borderRadius: "10px" }}
              >
                📡 Track Complaint Live (Citizen Side)
              </button>

              <button
                className="outline-btn"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/complaints");
                }}
                style={{ padding: "10px" }}
              >
                Go to My Complaints
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false })} />}
    </div>
  );
}

export default ReportIssue;