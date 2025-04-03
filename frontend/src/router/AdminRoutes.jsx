import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import Dashboard from "../pages/Admin/AdminDashboard";
import ManageResidents from "../pages/Admin/ManageResidents";
import UserManagement from "../pages/Admin/UsersManagement";
import VisitorLogs from "../pages/Admin/VisitorLogs";
import ManageGuard from "../pages/Admin/ManageGuards";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminSidebar />}>
        <Route path="admin-dashboard" element={<Dashboard />} />
        <Route path="user-management" element={<UserManagement />} />
        <Route path="manage-residents" element={<ManageResidents />} />
        <Route path="visitor-log" element={<VisitorLogs />} />
        <Route path="guards" element={<ManageGuard />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;