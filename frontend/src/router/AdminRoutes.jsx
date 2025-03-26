import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import ManageResidents from "../pages/Admin/ManageResidents";
import UserManagement from "../pages/Admin/UsersManagement";
import Sidebar from "../pages/Admin/AdminSidebar";

const AdminRoutes = () => {
  return (
    <div className="flex">
      {/* <Sidebar /> */}
      <div className="flex-grow p-4">
        <Routes>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/manage-residents" element={<ManageResidents />} />
          <Route path="/sidebar" element={<Sidebar />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminRoutes;
