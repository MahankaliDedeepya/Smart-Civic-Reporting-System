import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import ReportIssue from "./pages/citizen/ReportIssue";
import MyComplaints from "./pages/citizen/MyComplaints";
import ComplaintDetails from "./pages/citizen/ComplaintDetails";
import Notifications from "./pages/citizen/Notifications";
import Profile from "./pages/citizen/Profile";
import Feedback from "./pages/citizen/Feedback";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminComplaints from "./pages/admin/Complaints";
import AdminComplaintDetails from "./pages/admin/ComplaintDetails";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Citizen */}
          <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <CitizenDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/report"
  element={
    <ProtectedRoute>
      <ReportIssue />
    </ProtectedRoute>
  }
/>

<Route
  path="/complaints"
  element={
    <ProtectedRoute>
      <MyComplaints />
    </ProtectedRoute>
  }
/>

<Route
  path="/complaints/:id"
  element={
    <ProtectedRoute>
      <ComplaintDetails />
    </ProtectedRoute>
  }
/>

<Route
  path="/notifications"
  element={
    <ProtectedRoute>
      <Notifications />
    </ProtectedRoute>
  }
/>

<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>

<Route
  path="/feedback/:id"
  element={
    <ProtectedRoute>
      <Feedback />
    </ProtectedRoute>
  }
/>
         

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
          <AdminProtectedRoute>
            <AdminDashboard />
            </AdminProtectedRoute>}
        />
        <Route
          path="/admin/complaints"
          element={
            <AdminProtectedRoute>
      <AdminComplaints />
    </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/complaints/:id"
          element={
            <AdminProtectedRoute>
      <AdminComplaintDetails />
    </AdminProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;