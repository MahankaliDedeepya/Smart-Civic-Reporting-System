const API_URL = "https://smart-civic-backend-e26w.onrender.com/api/complaints";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// Fetch only the complaints belonging to the currently logged-in citizen
export const getMyComplaints = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return [];
  }

  const response = await fetch(`${API_URL}/my`, {
    method: "GET",
    headers: getAuthHeaders()
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch your complaints");
  }

  return data;
};

// Fetch single complaint details by ID
export const getComplaintById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: getAuthHeaders()
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Complaint not found");
  }

  return data;
};

// Delete complaint (only owner or admin)
export const deleteComplaintApi = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete complaint");
  }

  return data;
};

// Admin: fetch all complaints in system
export const getAllAdminComplaints = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch("https://smart-civic-backend-e26w.onrender.com/api/admin/complaints", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch complaints");
  }

  return data;
};

// Admin: update complaint status
export const updateComplaintStatusApi = async (id, status, remark) => {
  const response = await fetch(`${API_URL}/${id}/status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, remark })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update complaint status");
  }

  return data;
};
