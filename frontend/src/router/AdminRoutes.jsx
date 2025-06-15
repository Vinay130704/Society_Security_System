// AdminRoutes.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import Dashboard from "../pages/Admin/AdminDashboard";
import ManageResidents from "../pages/Admin/ManageResidents";
import UserManagement from "../pages/Admin/UsersManagement";
import VisitorLogs from "../pages/Admin/VisitorLogs";
import ManageGuard from "../pages/Admin/ManageGuards";
import SecurityReportPage from "../pages/Admin/SecurityReports";
import EmergencyAlertsAdmin from "../pages/Admin/EmergencyView ";
import VehicleAdminPanel from "../pages/Admin/VehicleView";
import AdminProfile from "../pages/Admin/Adminprofile";

const AdminRoutes = () => {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="admin-dashboard" element={<Dashboard />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="manage-residents" element={<ManageResidents />} />
          <Route path="visitor-log" element={<VisitorLogs />} />
          <Route path="guards" element={<ManageGuard />} />
          <Route path="security-report" element={<SecurityReportPage />} />
          <Route path="emergency-view" element={<EmergencyAlertsAdmin />} />
          <Route path="vehicle" element={<VehicleAdminPanel />} />
          <Route path="profile" element={<AdminProfile />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminRoutes;