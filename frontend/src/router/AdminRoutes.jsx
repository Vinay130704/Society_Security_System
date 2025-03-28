import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import ManageResidents from "../pages/Admin/ManageResidents";
import UserManagement from "../pages/Admin/UsersManagement";
import VisitorLogs from "../pages/Admin/VisitorLogs";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="admin-dashboard" element={<AdminDashboard />} />
      <Route path="user-management" element={<UserManagement />} />
      <Route path="manage-residents" element={<ManageResidents />} />
      <Route path="visitor-log" element={<VisitorLogs />} />
    </Routes>
  );
};

export default AdminRoutes;
